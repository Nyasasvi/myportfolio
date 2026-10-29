/*
 * ChapterField: one canvas behind a page's chapters, held to the viewport with position: sticky. Each
 * chapter (an element with data-scene) owns a scene; every frame the field finds which chapters are on screen and draws each
 * scene clipped to its chapter's part of the screen, so scrolling into a chapter uncovers its scene
 * and the cut between two scenes moves with the edge between their chapters. A scene builds itself
 * when its chapter is reached, and only scenes on screen are updated.
 *
 * Lifecycle: the loop runs while the chapters are on screen and the tab is visible. Under
 * prefers-reduced-motion each scene is run forward to a settled state and drawn as a still, redrawn
 * only on scroll, resize or a theme change. If drawing runs long, or frames arrive slowly (a phone
 * rastering in software), the field lowers its resolution, then its frame rate, and finally settles
 * into the same still.
 */

import { clamp, type Frame, type Ink, type Palette, type Pointer, type Scene } from './types';

export type FieldOptions = {
	/** Scene makers, keyed by each chapter's data-scene */
	scenes: Record<string, () => Scene>;
	/** Selector for the block of words inside a chapter that scenes keep clear of */
	head: string;
	onReady?: () => void;
};

type Chapter = { id: string; el: HTMLElement; scene: Scene; seen: boolean; since: number; settled: boolean };

const INTRO = 1.6;
const OFF: Pointer = { x: -1e4, y: -1e4, active: false };
// Average draw time (ms) above which the field steps down: resolution, then frame rate, then a still
const BUDGET = [8, 10, 16];

const probe = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;

const tone = (value: string): Ink => {
	let rgb = [128, 128, 128];
	if (probe) {
		probe.fillStyle = '#000';
		probe.fillStyle = value;
		const s = String(probe.fillStyle);
		if (s[0] === '#') rgb = [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
		else {
			const m = s.match(/[\d.]+/g);
			if (m) rgb = [+m[0], +m[1], +m[2]];
		}
	}
	const cache: string[] = [];
	return (a) => {
		const k = Math.round(clamp(a, 0, 1) * 100);
		return cache[k] ?? (cache[k] = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${k / 100})`);
	};
};

export class ChapterField {
	private ctx: CanvasRenderingContext2D;
	private chapters: Chapter[];
	private palette: Palette;
	private reduced = matchMedia('(prefers-reduced-motion: reduce)');
	private w = 0;
	private h = 0;
	private dpr = 1;
	private dprCap = 2;
	private client = { x: 0, y: 0, active: false };
	private pointer: Pointer = { x: 0, y: 0, active: false };
	private rect = { left: 0, top: 0 };
	private raf = 0;
	private still = 0;
	private last = 0;
	private t = 0;
	private onScreen = true;
	private level = 0;
	private cost = 0;
	private pace = 0;
	private frames = 0;
	private gap = 0;
	private ready = false;
	private teardown: (() => void)[] = [];

	constructor(private canvas: HTMLCanvasElement, sections: HTMLElement[], private options: FieldOptions) {
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Canvas 2D is unavailable');
		this.ctx = ctx;
		this.chapters = sections.flatMap((el) => {
			const make = options.scenes[el.dataset.scene ?? ''];
			return make ? [{ id: el.dataset.scene!, el, scene: make(), seen: false, since: 0, settled: false }] : [];
		});
		this.palette = this.readPalette();
		this.listen();
		this.resize();
		this.sync();
	}

	private listen() {
		const on = (target: EventTarget, type: string, fn: (e: Event) => void, opts?: AddEventListenerOptions) => {
			target.addEventListener(type, fn, opts);
			this.teardown.push(() => target.removeEventListener(type, fn, opts));
		};
		const move = (e: Event) => {
			const { clientX, clientY } = e as PointerEvent;
			this.client.x = clientX;
			this.client.y = clientY;
			this.client.active = true;
		};
		const leave = () => {
			this.client.active = false;
		};
		const passive = { passive: true };
		on(window, 'pointermove', move, passive);
		on(window, 'pointerdown', move, passive);
		// A finger lifts and is gone; a mouse stays where it is
		on(window, 'pointerup', (e) => { if ((e as PointerEvent).pointerType !== 'mouse') leave(); }, passive);
		on(window, 'pointercancel', leave, passive);
		on(document.documentElement, 'mouseleave', leave);
		on(window, 'blur', leave);
		on(window, 'scroll', () => this.requestStill(), passive);
		on(document, 'visibilitychange', () => this.sync());

		const motion = () => this.sync();
		this.reduced.addEventListener('change', motion);
		this.teardown.push(() => this.reduced.removeEventListener('change', motion));

		const sizes = new ResizeObserver(() => this.resize());
		sizes.observe(this.canvas);
		this.teardown.push(() => sizes.disconnect());

		const view = new IntersectionObserver(([entry]) => {
			this.onScreen = entry.isIntersecting;
			this.sync();
		}, { rootMargin: '120px 0px' });
		view.observe(this.canvas.parentElement ?? this.canvas);
		this.teardown.push(() => view.disconnect());

		const theme = new MutationObserver(() => {
			this.palette = this.readPalette();
			this.requestStill();
		});
		theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
		this.teardown.push(() => theme.disconnect());

		// Canvas text uses the page's fonts; measure again once they have arrived
		document.fonts?.ready.then(() => this.refresh()).catch(() => {});
	}

	private refresh() {
		this.palette = this.readPalette();
		// Titles may have changed height with their font
		if (this.w) this.layout();
		this.requestStill();
	}

	/** Lay every scene out again, clear of its chapter's words: below them where they are held, beside them where they share the row */
	private layout() {
		const fieldTop = parseFloat(getComputedStyle(this.canvas).top) || 0;
		const left = this.canvas.getBoundingClientRect().left;
		for (const c of this.chapters) {
			const head = c.el.querySelector<HTMLElement>(this.options.head);
			const cs = head ? getComputedStyle(head) : null;
			const quiet = head && cs && cs.position === 'sticky' ? (parseFloat(cs.top) || 0) - fieldTop + head.offsetHeight : 0;
			const box = head?.getBoundingClientRect();
			// Words in a column of their own leave the rest of the row to the scene
			const beside = box && box.width < this.w * 0.62 ? box.right - left : 0;
			c.scene.resize(this.w, this.h, { quiet: Math.max(0, Math.round(quiet)), left: Math.max(0, Math.round(beside)) });
			c.settled = false;
		}
	}

	private readPalette(): Palette {
		const cs = getComputedStyle(this.canvas);
		const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
		return {
			ink: tone(v('--ds-fg', '#e7e5e0')),
			muted: tone(v('--ds-fg-muted', '#a19c94')),
			accent: tone(v('--ds-accent', '#ff654a')),
			amber: tone(v('--ds-amber', '#f7aa58')),
			bg: v('--ds-bg', '#111315'),
			onAccent: v('--ds-on-accent', '#111315'),
			body: v('--ds-font-body', 'sans-serif'),
			code: v('--ds-font-code', 'monospace'),
		};
	}

	private resize() {
		const r = this.canvas.getBoundingClientRect();
		const w = Math.round(r.width);
		const h = Math.round(r.height);
		if (!w || !h) return;
		const changed = w !== this.w || h !== this.h;
		this.w = w;
		this.h = h;
		this.dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
		this.canvas.width = Math.round(w * this.dpr);
		this.canvas.height = Math.round(h * this.dpr);
		if (changed) this.layout();
		// Resizing clears the canvas; a running loop repaints on its next frame
		if (this.stillMode) this.paintStill();
	}

	private get stillMode() {
		return this.reduced.matches || this.level >= BUDGET.length;
	}

	private get moving() {
		return this.onScreen && !document.hidden && !this.stillMode;
	}

	private sync() {
		if (this.moving) {
			if (!this.raf) {
				this.last = performance.now();
				this.raf = requestAnimationFrame(this.frame);
			}
			return;
		}
		cancelAnimationFrame(this.raf);
		this.raf = 0;
		this.requestStill();
	}

	private frame = (now: number) => {
		this.raf = requestAnimationFrame(this.frame);
		const elapsed = now - this.last;
		if (this.gap && elapsed < this.gap - 2) return;
		this.last = now;
		const dt = Math.min(0.05, elapsed / 1000);
		this.t += dt;
		const start = performance.now();
		this.paint(dt);
		this.watch(performance.now() - start, elapsed);
	};

	private watch(ms: number, elapsed: number) {
		this.cost = this.frames ? this.cost * 0.92 + ms * 0.08 : ms;
		// Pauses longer than a quarter second are the tab or the page stopping, not slow frames
		if (elapsed < 250) this.pace = this.frames ? this.pace * 0.92 + elapsed * 0.08 : elapsed;
		if (++this.frames < 60) return;
		const slow = this.pace > (this.gap || 1000 / 60) * 1.9;
		if (this.cost <= BUDGET[this.level] && !slow) return;
		this.level++;
		this.frames = 0;
		this.canvas.dataset.quality = String(this.level);
		if (this.level === 1) {
			this.dprCap = 1;
			this.resize();
		} else if (this.level === 2) this.gap = 1000 / 30;
		else this.sync();
	}

	private requestStill() {
		if (this.raf || this.still || !this.stillMode) return;
		this.still = requestAnimationFrame(() => {
			this.still = 0;
			this.paintStill();
		});
	}

	/** Run each scene forward to a settled state once, then draw it without updating */
	private paintStill() {
		if (this.raf || !this.w) return;
		for (const c of this.chapters) {
			if (c.settled) continue;
			for (let i = 0; i < 240; i++) c.scene.update({ w: this.w, h: this.h, t: i / 60, dt: 1 / 60, intro: 1, pointer: OFF });
			c.settled = true;
		}
		this.paint(0);
	}

	private paint(dt: number) {
		const { ctx, w, h } = this;
		const live = dt > 0;
		const c = this.canvas.getBoundingClientRect();
		this.rect = { left: c.left, top: c.top };
		this.pointer.x = this.client.x - c.left;
		this.pointer.y = this.client.y - c.top;
		ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		ctx.clearRect(0, 0, w, h);
		for (const ch of this.chapters) {
			if (ch.el.hidden) {
				ch.seen = false;
				continue;
			}
			const r = ch.el.getBoundingClientRect();
			const top = Math.max(0, r.top - c.top);
			const bottom = Math.min(h, r.bottom - c.top);
			if (bottom <= top) {
				// Off screen: the scene builds itself again when its chapter comes back
				ch.seen = false;
				continue;
			}
			if (!ch.seen && r.top - c.top < h * 0.8) {
				ch.seen = true;
				ch.since = 0;
			}
			if (live && ch.seen) ch.since += dt;
			const inside = this.client.active && this.pointer.y >= top && this.pointer.y <= bottom;
			const frame: Frame = { w, h, t: this.t, dt, intro: live ? (ch.seen ? clamp(ch.since / INTRO, 0, 1) : 0) : 1, pointer: inside ? { ...this.pointer, active: true } : OFF };
			if (live) ch.scene.update(frame);
			ctx.save();
			ctx.beginPath();
			ctx.rect(0, top, w, bottom - top);
			ctx.clip();
			ch.scene.draw(ctx, this.palette, frame);
			ctx.restore();
		}
		if (!this.ready) {
			this.ready = true;
			this.options.onReady?.();
		}
	}

	/** A visitor pointed at something in a chapter: let that chapter's scene answer, if it is moving */
	poke(id: string, clientX: number, clientY: number, label: string) {
		if (!this.raf) return;
		const ch = this.chapters.find((c) => c.id === id);
		ch?.scene.poke(clientX - this.rect.left, clientY - this.rect.top, label);
	}

	destroy() {
		cancelAnimationFrame(this.raf);
		cancelAnimationFrame(this.still);
		this.raf = 0;
		this.teardown.forEach((fn) => fn());
	}
}
