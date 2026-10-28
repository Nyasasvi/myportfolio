'use client';

import { useEffect, useRef, useState } from 'react';
import { DIAGRAM, DIAGRAM_NARROW, HERO_TALL, HERO_WIDE, type Edge } from './graph';
import { SignalRenderer, type Rect, type SignalOptions } from './renderer';

type Variant = 'hero' | 'diagram';

const PRESETS: Record<Variant, Omit<SignalOptions, 'onFirstFrame'>> = {
	hero: {
		layout: (aspect) => (aspect < 0.8 ? HERO_TALL : HERO_WIDE),
		count: [7000, 3200],
		period: 9,
		trail: 0.05,
		halfWidth: 1.3,
		pointer: 1,
		alpha: 0.5,
	},
	diagram: {
		// The diagram box drops below square only on phones (aspect-ratio 5 / 6 in homepage.css)
		layout: (aspect) => (aspect < 1 ? DIAGRAM_NARROW : DIAGRAM),
		count: [2600, 1600],
		period: 6.5,
		trail: 0.045,
		halfWidth: 1.1,
		pointer: 0.55,
		alpha: 0.62,
	},
};

type Props = {
	variant: Variant;
	/** Hub to light; null lights every route */
	hub?: number | null;
	/** The graph's [source, hub] edges; defaults to Twisted X */
	edges?: ReadonlyArray<Edge>;
	/** Elements whose boxes the trails dim under, so their text stays readable */
	maskSelector?: string;
	className?: string;
};

/**
 * The canvas lives outside React's render cycle: React mounts it, hands it to SignalRenderer
 * once, and afterwards only forwards the route, theme and text boxes.
 */
export default function SignalField({ variant, hub = null, edges, maskSelector, className }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rendererRef = useRef<SignalRenderer | null>(null);
	// The renderer may arrive after the first route is chosen, so keep the latest one to hand it
	const hubRef = useRef(hub);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		let cleanup: (() => void) | undefined;
		// Set up WebGL in idle time so it never competes with hydration; the field fades in when ready
		const start = () => {
			cleanup = mount(canvas);
		};
		// Safari has no requestIdleCallback; a short timeout stands in
		const hasIdle = typeof window.requestIdleCallback === 'function';
		const handle = hasIdle ? window.requestIdleCallback(start, { timeout: 1200 }) : globalThis.setTimeout(start, 200);
		return () => {
			if (hasIdle) window.cancelIdleCallback(handle as number);
			else globalThis.clearTimeout(handle);
			cleanup?.();
		};
	}, [variant, maskSelector, edges]);

	const mount = (canvas: HTMLCanvasElement) => {
		const renderer = new SignalRenderer(canvas, { ...PRESETS[variant], edges, onFirstFrame: () => setReady(true) });
		rendererRef.current = renderer;
		renderer.setRoute(hubRef.current);

		const html = document.documentElement;
		const readTheme = () => renderer.setTheme(html.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
		readTheme();
		const themeObserver = new MutationObserver(readTheme);
		themeObserver.observe(html, { attributes: true, attributeFilter: ['data-theme'] });

		let boxObserver: ResizeObserver | undefined;
		if (maskSelector) {
			const targets = Array.from(document.querySelectorAll<HTMLElement>(maskSelector));
			const measure = () => {
				const c = canvas.getBoundingClientRect();
				const rects: Rect[] = targets.map((el) => {
					const b = el.getBoundingClientRect();
					return { x0: b.left - c.left, y0: b.top - c.top, x1: b.right - c.left, y1: b.bottom - c.top };
				});
				renderer.setMasks(rects);
			};
			measure();
			boxObserver = new ResizeObserver(measure);
			boxObserver.observe(canvas);
			targets.forEach((el) => boxObserver!.observe(el));
			document.fonts?.ready.then(measure).catch(() => {});
		}

		return () => {
			themeObserver.disconnect();
			boxObserver?.disconnect();
			renderer.destroy();
			rendererRef.current = null;
		};
	};

	useEffect(() => {
		hubRef.current = hub;
		rendererRef.current?.setRoute(hub);
	}, [hub]);

	return (
		<canvas
			ref={canvasRef}
			className={className}
			data-ready={ready || undefined}
			aria-hidden="true"
		/>
	);
}
