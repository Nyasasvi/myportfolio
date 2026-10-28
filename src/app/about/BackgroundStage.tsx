'use client';

import { useEffect, useRef } from 'react';
import { createScene, type Palette, type Region, type RGB, type Scene, type SceneId } from './scenes';

export const ABOUT_TAP_EVENT = 'about:tap';

// Each chapter also tints the ground a step toward its own world; both themes keep text contrast
const TINT: Record<SceneId, { dark: RGB; light: RGB }> = {
	boots: { dark: [30, 22, 16], light: [238, 228, 214] }, // leather
	market: { dark: [14, 19, 31], light: [224, 230, 240] }, // trading-floor navy
	feed: { dark: [13, 25, 25], light: [222, 236, 233] }, // feed teal
	network: { dark: [19, 20, 27], light: [229, 231, 238] }, // lab slate
	stream: { dark: [12, 23, 18], light: [224, 236, 228] }, // server-room green
};

const FADE = 0.7; // seconds for one scene to hand over to the next

type Layer = { id: SceneId; scene: Scene; k: number; dir: 1 | -1 };

function readPalette(): { palette: Palette; dark: boolean } {
	const probe = document.createElement('span');
	probe.style.display = 'none';
	document.body.appendChild(probe);
	const read = (v: string, fallback: RGB): RGB => {
		probe.style.color = `var(${v})`;
		const m = getComputedStyle(probe).color.match(/\d+(\.\d+)?/g);
		return m && m.length >= 3 ? [Number(m[0]), Number(m[1]), Number(m[2])] : fallback;
	};
	const palette = {
		ink: read('--ds-fg', [235, 233, 228]),
		accent: read('--ds-accent', [255, 101, 74]),
		signal: read('--ds-signal', [127, 207, 159]),
	};
	probe.remove();
	return { palette, dark: document.documentElement.getAttribute('data-theme') !== 'light' };
}

type Props = {
	scene: SceneId | null;
	paused: boolean;
};

/**
 * One fixed canvas behind the About page. It hands over from scene to scene as chapters scroll
 * in, runs only while a scene is showing, the tab is visible and the visitor hasn't paused it,
 * and draws single still frames for anyone who prefers reduced motion.
 */
export default function BackgroundStage({ scene, paused }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const state = useRef({
		layers: [] as Layer[],
		cache: new Map<SceneId, Scene>(),
		region: { x0: 0, y0: 0, x1: 1, y1: 1 } as Region,
		mobile: false,
		dpr: 1,
		palette: null as Palette | null,
		dark: true,
		raf: 0,
		last: 0,
		paused,
		reduced: false,
		hidden: false,
		draw: () => {},
		kick: () => {},
	});

	// Set up the canvas, sizing, theme, pointer and the frame loop once
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const s = state.current;
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		s.reduced = motion.matches;
		s.hidden = document.hidden;

		const readTheme = () => {
			const t = readPalette();
			s.palette = t.palette;
			s.dark = t.dark;
		};
		readTheme();

		const resize = () => {
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			s.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
			canvas.width = Math.round(vw * s.dpr);
			canvas.height = Math.round(vh * s.dpr);
			s.mobile = vw < 900;
			// Desktop: the right half, clear of the text column. Phone: the whole screen, drawn faint.
			s.region = s.mobile ? { x0: 0, y0: 72, x1: vw, y1: vh } : { x0: vw * 0.54, y0: 96, x1: vw - 24, y1: vh - 24 };
			s.cache.forEach((sc) => sc.resize(s.region));
		};

		const draw = () => {
			const pal = s.palette;
			if (!pal) return;
			// With no chapter showing, take the canvas out of the page entirely (it is fixed over everything)
			canvas.style.visibility = s.layers.length ? 'visible' : 'hidden';
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
			const strength = s.mobile ? 0.4 : 1;
			for (const layer of s.layers) {
				const ease = layer.k * layer.k * (3 - 2 * layer.k);
				const tint = TINT[layer.id][s.dark ? 'dark' : 'light'];
				ctx.fillStyle = `rgba(${tint[0]},${tint[1]},${tint[2]},${ease})`;
				ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
				layer.scene.draw(ctx, pal, ease * strength);
			}
		};
		s.draw = draw;

		const advance = (dt: number) => {
			for (const layer of s.layers) {
				layer.k = Math.max(0, Math.min(1, layer.k + (layer.dir * dt) / FADE));
				layer.scene.step(dt);
			}
			s.layers = s.layers.filter((l) => !(l.dir === -1 && l.k === 0));
		};

		const running = () => !s.paused && !s.reduced && !s.hidden && s.layers.length > 0;

		const frame = (t: number) => {
			const dt = s.last ? Math.min(0.05, (t - s.last) / 1000) : 0.016;
			s.last = t;
			advance(dt);
			draw();
			s.raf = running() ? requestAnimationFrame(frame) : 0;
		};

		// Start the loop if it should run; otherwise settle every layer and draw one still frame
		const kick = () => {
			if (running()) {
				if (!s.raf) {
					s.last = 0;
					s.raf = requestAnimationFrame(frame);
				}
				return;
			}
			cancelAnimationFrame(s.raf);
			s.raf = 0;
			for (const l of s.layers) l.k = l.dir === 1 ? 1 : 0;
			s.layers = s.layers.filter((l) => l.k > 0);
			draw();
		};
		s.kick = kick;

		const onResize = () => {
			resize();
			if (!s.raf) draw();
		};
		const onPointer = (e: PointerEvent) => {
			const top = s.layers[s.layers.length - 1];
			if (!top || top.dir !== 1) return;
			const r = s.region;
			const inside = e.clientX >= r.x0 && e.clientX <= r.x1 && e.clientY >= r.y0 && e.clientY <= r.y1;
			top.scene.pointer(e.clientX, e.clientY, inside);
		};
		const onDown = (e: PointerEvent) => {
			// Taps on links, buttons and fields keep their own job
			if ((e.target as HTMLElement).closest('a, button, input, select, textarea, label, summary')) return;
			const top = s.layers[s.layers.length - 1];
			if (top?.dir === 1 && top.scene.tap) {
				top.scene.tap(e.clientX, e.clientY);
				if (!s.raf) {
					top.scene.step(0.4);
					draw();
				}
			}
		};
		const onTapEvent = () => {
			const top = s.layers[s.layers.length - 1];
			if (!top?.scene.tap) return;
			const r = s.region;
			top.scene.tap((r.x0 + r.x1) / 2, r.y0 + (r.y1 - r.y0) * 0.7);
			if (!s.raf) {
				top.scene.step(0.4);
				draw();
			}
		};
		const onVisibility = () => {
			s.hidden = document.hidden;
			kick();
		};
		const onMotion = (e: MediaQueryListEvent) => {
			s.reduced = e.matches;
			kick();
		};
		const themeObserver = new MutationObserver(() => {
			readTheme();
			if (!s.raf) draw();
		});

		resize();
		window.addEventListener('resize', onResize);
		window.addEventListener('pointermove', onPointer, { passive: true });
		window.addEventListener('pointerdown', onDown, { passive: true });
		window.addEventListener(ABOUT_TAP_EVENT, onTapEvent);
		document.addEventListener('visibilitychange', onVisibility);
		motion.addEventListener('change', onMotion);
		themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

		return () => {
			cancelAnimationFrame(s.raf);
			s.raf = 0;
			window.removeEventListener('resize', onResize);
			window.removeEventListener('pointermove', onPointer);
			window.removeEventListener('pointerdown', onDown);
			window.removeEventListener(ABOUT_TAP_EVENT, onTapEvent);
			document.removeEventListener('visibilitychange', onVisibility);
			motion.removeEventListener('change', onMotion);
			themeObserver.disconnect();
		};
	}, []);

	// Hand over to the chapter's scene: the old one fades out while the new one fades in
	useEffect(() => {
		const s = state.current;
		for (const l of s.layers) if (l.id !== scene) l.dir = -1;
		if (scene) {
			let layer = s.layers.find((l) => l.id === scene);
			if (!layer) {
				let sc = s.cache.get(scene);
				if (!sc) {
					sc = createScene(scene);
					sc.resize(s.region);
					// Run the scene for 12 seconds before it shows, so it arrives full (likes take that long to rise)
					for (let i = 0; i < 360; i++) sc.step(1 / 30);
					s.cache.set(scene, sc);
				}
				layer = { id: scene, scene: sc, k: 0, dir: 1 };
				s.layers.push(layer);
			} else {
				layer.dir = 1;
				// Keep the incoming scene on top
				s.layers = [...s.layers.filter((l) => l !== layer), layer];
			}
		}
		s.kick();
	}, [scene]);

	useEffect(() => {
		state.current.paused = paused;
		state.current.kick();
	}, [paused]);

	return <canvas ref={canvasRef} className="about-stage" aria-hidden="true" />;
}
