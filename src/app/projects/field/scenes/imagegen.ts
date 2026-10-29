import { clamp, easeInOut, easeOut, type Frame, type Palette, type Scene, type Zone } from '@/app/components/field/types';
import { stageFor, tag, type Stage } from '../stage';

/*
 * AI Image Generation Platform: a prompt arrives and its picture resolves in the frame, coarse blocks
 * splitting into finer ones as the model works. The finished picture is stored: it shrinks into the
 * gallery, which moves along by one. Every few pictures a search runs instead, and the gallery lights
 * the pictures whose prompts match. Pointing at a picture lifts it; the Cloudinary row stores the
 * current picture at once, the search row runs a search, any other row starts a new picture.
 */

type Motif = (u: number, v: number) => number; // index into the palette below
type Picture = { prompt: string; key: string; motif: Motif; bitmap: HTMLCanvasElement | null; madeFor: Palette | null };

const RES = 32; // blocks per side of a finished picture

const circle = (u: number, v: number, cx: number, cy: number, r: number) => (u - cx) ** 2 + (v - cy) ** 2 < r * r;

// 0 ground, 1 haze, 2 mid ink, 3 strong ink, 4 accent, 5 amber
const MOTIFS: { prompt: string; key: string; motif: Motif }[] = [
	{ prompt: 'a sun setting over low hills', key: 'sun', motif: (u, v) => (v > 0.74 + 0.05 * Math.sin(u * 9 + 1) ? 3 : v > 0.62 + 0.07 * Math.sin(u * 6) ? 2 : circle(u, v, 0.64, 0.4, 0.15) ? 4 : v > 0.5 ? 5 : 1) },
	{ prompt: 'the moon over a calm sea', key: 'moon', motif: (u, v) => (circle(u, v, 0.35, 0.3, 0.12) ? 3 : v > 0.58 ? (Math.abs(u - 0.35) < 0.06 + (v - 0.58) * 0.2 && Math.floor(v * 40) % 2 === 0 ? 5 : 2) : 0) },
	{ prompt: 'a mountain at dusk', key: 'mountain', motif: (u, v) => { const ridge = 0.3 + Math.abs(u - 0.5) * 1.1; return v > ridge ? (v < ridge + 0.09 ? 3 : 2) : circle(u, v, 0.8, 0.22, 0.07) ? 4 : v > 0.7 ? 5 : 1; } },
	{ prompt: 'a city at night', key: 'city', motif: (u, v) => { const b = Math.floor(u * 7); const top = 0.3 + ((b * 37) % 5) * 0.09; if (v < top) return circle(u, v, 0.2, 0.15, 0.05) ? 3 : 0; return Math.floor(u * 28) % 3 === 1 && Math.floor(v * 30) % 3 === 1 && (b * 13 + Math.floor(v * 30)) % 4 ? 5 : 2; } },
	{ prompt: 'a single red flower', key: 'flower', motif: (u, v) => { const d = Math.hypot(u - 0.5, v - 0.38); const petal = d < 0.12 + 0.07 * Math.cos(Math.atan2(v - 0.38, u - 0.5) * 5); return d < 0.06 ? 5 : petal ? 4 : Math.abs(u - 0.5 - Math.sin(v * 5) * 0.02) < 0.02 && v > 0.45 ? 3 : v > 0.85 ? 2 : 1; } },
	{ prompt: 'a desert canyon at noon', key: 'canyon', motif: (u, v) => { const wall = Math.abs(u - 0.5) > 0.18 + (v - 0.3) * 0.25 + 0.03 * Math.sin(v * 30); if (v < 0.28) return circle(u, v, 0.7, 0.12, 0.06) ? 3 : 1; return wall ? (Math.floor(v * 14) % 2 ? 5 : 4) : 2; } },
];
const SEARCHES = ['sun', 'moon', 'mountain', 'city', 'flower', 'canyon'];

type Phase = 'prompt' | 'generate' | 'hold' | 'store' | 'search';
const LENGTH: Record<Phase, number> = { prompt: 0.7, generate: 1.8, hold: 0.7, store: 0.8, search: 1.9 };

export class ImageGenScene implements Scene {
	private s: Stage = { x: 0, y: 0, w: 0, h: 0 };
	private frame = { x: 0, y: 0, size: 0 };
	private cells: { x: number; y: number }[] = [];
	private cell = 80;
	private gallery: Picture[] = [];
	private current: Picture;
	private phase: Phase = 'prompt';
	private t = 0;
	private made = 0;
	private query = '';
	private hover = -1;

	constructor() {
		this.current = this.picture(0);
		this.made = 1;
	}

	private picture(n: number): Picture {
		const m = MOTIFS[n % MOTIFS.length];
		return { ...m, bitmap: null, madeFor: null };
	}

	resize(w: number, h: number, zone: Zone) {
		this.s = stageFor(w, h, zone);
		const { s } = this;
		const size = Math.min(s.h * 0.52, s.w * 0.5, 380);
		this.frame = { x: s.x, y: s.y + 34, size };
		// The gallery is a grid in reading order: beside the frame first, then the rows below it
		this.cell = clamp((size - 16) / 3, 56, 120);
		const gap = 8;
		const step = this.cell + gap;
		const beside = this.frame.x + size + gap * 3;
		this.cells = [];
		for (let y = this.frame.y; y + this.cell <= this.frame.y + size + 1; y += step) {
			for (let x = beside; x + this.cell <= s.x + s.w; x += step) this.cells.push({ x, y });
		}
		for (let y = this.frame.y + size + gap * 3; y + this.cell <= s.y + s.h; y += step) {
			for (let x = s.x; x + this.cell <= s.x + s.w; x += step) this.cells.push({ x, y });
		}
		this.cells.length = Math.min(this.cells.length, 18);
		// Fill the gallery with what was made before the visitor arrived
		while (this.gallery.length < this.cells.length) this.gallery.push(this.picture(this.gallery.length + 1));
	}

	/** Each finished picture is drawn once into a small bitmap, again only if the theme changes */
	private bitmap(pic: Picture, p: Palette) {
		if (pic.bitmap && pic.madeFor === p) return pic.bitmap;
		const c = pic.bitmap ?? document.createElement('canvas');
		c.width = c.height = RES;
		const g = c.getContext('2d')!;
		const colours = this.colours(p);
		for (let j = 0; j < RES; j++) {
			for (let i = 0; i < RES; i++) {
				g.fillStyle = colours[pic.motif((i + 0.5) / RES, (j + 0.5) / RES)];
				g.fillRect(i, j, 1, 1);
			}
		}
		pic.bitmap = c;
		pic.madeFor = p;
		return c;
	}

	private colours(p: Palette) {
		return [p.bg, p.ink(0.08), p.ink(0.28), p.ink(0.62), p.accent(0.9), p.amber(0.75)];
	}

	private next(phase: Phase) {
		this.phase = phase;
		this.t = 0;
	}

	update(f: Frame) {
		this.t += f.dt;
		this.hover = -1;
		if (f.pointer.active) {
			this.hover = this.cells.findIndex((c, i) => i < this.gallery.length && f.pointer.x >= c.x && f.pointer.x <= c.x + this.cell && f.pointer.y >= c.y && f.pointer.y <= c.y + this.cell);
		}
		if (f.intro < 1 || this.t < LENGTH[this.phase]) return;
		if (this.phase === 'prompt') this.next('generate');
		else if (this.phase === 'generate') this.next('hold');
		else if (this.phase === 'hold') this.next('store');
		else if (this.phase === 'store') this.store();
		else this.begin();
	}

	private store() {
		this.gallery.unshift(this.current);
		this.gallery.length = Math.min(this.gallery.length, this.cells.length);
		this.made++;
		if (this.made % 3 === 0) this.search(SEARCHES[(this.made / 3) % SEARCHES.length]);
		else this.begin();
	}

	private begin() {
		this.current = this.picture(this.made);
		this.next('prompt');
	}

	private search(word: string) {
		this.query = word;
		this.next('search');
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const { frame, cell } = this;
		const a = clamp(f.intro * 1.6, 0, 1);
		ctx.globalAlpha = a;
		ctx.imageSmoothingEnabled = false;

		// The gallery; during a store it slides along by one cell
		const shift = this.phase === 'store' ? easeInOut(this.t / LENGTH.store) : 0;
		const matching = this.phase === 'search';
		this.gallery.forEach((pic, i) => {
			const from = this.cells[i];
			const to = this.cells[i + 1];
			if (!from) return;
			const lit = matching && pic.key === this.query;
			const lift = i === this.hover ? 6 : 0;
			const dim = matching && !lit ? 0.35 : 1;
			const bitmap = this.bitmap(pic, p);
			// Along a row a picture slides one cell; at the end of a row it fades over to the next
			const wraps = !to || to.y !== from.y;
			const x = to && !wraps ? from.x + (to.x - from.x) * shift : from.x;
			const y = from.y;
			if (wraps && shift > 0) {
				ctx.globalAlpha = a * dim * (1 - shift);
				ctx.drawImage(bitmap, from.x, from.y, cell, cell);
				if (to) {
					ctx.globalAlpha = a * dim * shift;
					ctx.drawImage(bitmap, to.x, to.y, cell, cell);
				}
				return;
			}
			ctx.globalAlpha = a * dim;
			ctx.drawImage(bitmap, x - lift / 2, y - lift / 2, cell + lift, cell + lift);
			if (lit || i === this.hover) {
				ctx.globalAlpha = a;
				ctx.lineWidth = 2;
				ctx.strokeStyle = p.accent(1);
				ctx.strokeRect(x - lift / 2 - 1, y - lift / 2 - 1, cell + lift + 2, cell + lift + 2);
				if (i === this.hover) tag(ctx, p, pic.prompt, x - lift / 2, y - lift / 2 - 14, { ink: p.ink(0.9) });
			}
		});
		ctx.globalAlpha = a;

		// The frame: the prompt above, the picture resolving inside
		ctx.fillStyle = p.ink(0.05);
		ctx.fillRect(frame.x, frame.y, frame.size, frame.size);
		ctx.strokeStyle = p.ink(0.2);
		ctx.lineWidth = 1;
		ctx.strokeRect(frame.x + 0.5, frame.y + 0.5, frame.size - 1, frame.size - 1);
		const label = this.phase === 'search' ? `Search: ${this.query}` : `“${this.current.prompt}”`;
		const shown = this.phase === 'prompt' ? easeOut(this.t / 0.4) : 1;
		ctx.globalAlpha = a * shown;
		tag(ctx, p, label, frame.x - 6, frame.y - 18, { size: 15, ink: this.phase === 'search' ? p.accent(1) : p.ink(0.9) });
		ctx.globalAlpha = a;

		if (this.phase === 'generate') {
			// Blocks of 2, 4, 8, 16 then 32 to a side
			const level = Math.min(5, 1 + Math.floor((this.t / LENGTH.generate) * 5));
			const n = 2 ** level;
			const b = frame.size / n;
			const colours = this.colours(p);
			for (let k = 0; k < colours.length; k++) {
				ctx.fillStyle = colours[k];
				ctx.beginPath();
				for (let j = 0; j < n; j++) {
					for (let i = 0; i < n; i++) {
						if (this.current.motif((i + 0.5) / n, (j + 0.5) / n) === k) ctx.rect(frame.x + i * b, frame.y + j * b, b + 0.5, b + 0.5);
					}
				}
				ctx.fill();
			}
			// The pass at work: a line sweeping down the frame at the current block size
			const sweep = ((this.t / LENGTH.generate) * 5) % 1;
			ctx.fillStyle = p.accent(0.9);
			ctx.fillRect(frame.x, frame.y + sweep * frame.size, frame.size, 2);
		} else if (this.phase === 'prompt') {
			// The first pass, two blocks to a side, fading in as the prompt is read
			ctx.globalAlpha = a * easeOut(this.t / LENGTH.prompt) * 0.6;
			const colours = this.colours(p);
			const b = frame.size / 2;
			for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
				ctx.fillStyle = colours[this.current.motif((i + 0.5) / 2, (j + 0.5) / 2)];
				ctx.fillRect(frame.x + i * b, frame.y + j * b, b, b);
			}
			ctx.globalAlpha = a;
		} else if (this.phase === 'hold' || this.phase === 'store') {
			const k = this.phase === 'store' ? easeInOut(this.t / LENGTH.store) : 0;
			const target = this.cells[0] ?? { x: frame.x, y: frame.y };
			const size = frame.size + (cell - frame.size) * k;
			ctx.drawImage(this.bitmap(this.current, p), frame.x + (target.x - frame.x) * k, frame.y + (target.y - frame.y) * k, size, size);
		}
		ctx.globalAlpha = 1;
		ctx.imageSmoothingEnabled = true;
	}

	poke(_x: number, _y: number, label: string) {
		if (/cloudinary/i.test(label)) {
			if (this.phase === 'generate' || this.phase === 'hold') this.next('store');
			return;
		}
		if (/search|mongodb/i.test(label)) {
			this.search(SEARCHES[Math.floor(Math.random() * SEARCHES.length)]);
			return;
		}
		if (this.phase === 'prompt' || this.phase === 'search') {
			this.current = this.picture(this.made + Math.floor(Math.random() * 5));
			this.next('generate');
		}
	}
}
