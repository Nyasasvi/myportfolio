/** Shared shapes for the skills field: one canvas, one scene per skill group. */

export type Pointer = { x: number; y: number; active: boolean };

/** A colour from the page tokens, returned as an rgba() string at the given alpha */
export type Ink = (alpha: number) => string;

export type Palette = {
	ink: Ink;
	muted: Ink;
	accent: Ink;
	amber: Ink;
	bg: string;
	onAccent: string;
	/** Font stacks as the page resolved them, for canvas text */
	body: string;
	code: string;
};

export type Frame = {
	/** Canvas size in CSS pixels */
	w: number;
	h: number;
	/** Seconds since the field started, and since the last frame */
	t: number;
	dt: number;
	/** Pointer in canvas coordinates; inactive when it is outside this scene's chapter */
	pointer: Pointer;
	/** 0..1 while the scene builds itself after its chapter is reached; 1 afterwards */
	intro: number;
};

export interface Scene {
	/**
	 * quiet: on wide screens the chapter's title holds the top left of the field down to this y;
	 * scenes that carry words or a single focus keep below it. 0 where the title is not held.
	 */
	resize(w: number, h: number, quiet: number): void;
	update(f: Frame): void;
	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame): void;
	/** A visitor pointed at a skill in this chapter: answer near (x, y), using the skill's name if it means something here */
	poke(x: number, y: number, label: string): void;
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
export const easeInOut = (t: number) => {
	const x = clamp(t, 0, 1);
	return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/** Exponential approach that is the same at any frame rate */
export const approach = (from: number, to: number, rate: number, dt: number) => to + (from - to) * Math.exp(-rate * dt);

/** Small seeded generator (mulberry32), so every visit draws the same structures */
export const rng = (seed: number) => () => {
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
