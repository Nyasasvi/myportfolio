import type { Palette, Zone } from '@/app/components/field/types';

/** The part of the field a project scene composes in */
export type Stage = { x: number; y: number; w: number; h: number };

/**
 * Wide screens: the project's words hold the left columns, so the scene takes the rest of the row.
 * Narrow screens: the words run full width under a window of open field at the top of each project,
 * so the scene composes in the top of the field, where that window first shows it.
 */
export const stageFor = (w: number, h: number, zone: Zone): Stage => {
	if (zone.left) {
		const x = zone.left + Math.max(40, w * 0.04);
		return { x, y: h * 0.07, w: w - x - Math.max(24, w * 0.03), h: h * 0.86 };
	}
	return { x: w * 0.05, y: h * 0.04, w: w * 0.9, h: Math.max(h * 0.42, 300) };
};

/** A word or two set on a strip of ground, so it reads over anything behind it */
export const tag = (
	ctx: CanvasRenderingContext2D,
	p: Palette,
	text: string,
	x: number,
	y: number,
	o: { size?: number; ink?: string; ground?: string; align?: 'left' | 'center' | 'right'; weight?: number } = {},
) => {
	const size = o.size ?? 13;
	ctx.font = `${o.weight ?? 500} ${size}px ${p.body}`;
	const w = ctx.measureText(text).width + 12;
	const h = size + 9;
	const left = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
	ctx.fillStyle = o.ground ?? p.bg;
	ctx.fillRect(left, y - h / 2, w, h);
	ctx.fillStyle = o.ink ?? p.ink(0.85);
	ctx.textBaseline = 'middle';
	ctx.fillText(text, left + 6, y + 0.5);
	ctx.textBaseline = 'alphabetic';
	return w;
};

/** Plain text, no ground */
export const text = (ctx: CanvasRenderingContext2D, p: Palette, s: string, x: number, y: number, ink: string, size = 13, align: CanvasTextAlign = 'left') => {
	ctx.font = `500 ${size}px ${p.body}`;
	ctx.textAlign = align;
	ctx.fillStyle = ink;
	ctx.fillText(s, x, y);
	ctx.textAlign = 'left';
};

/** Quadratic arc between two points, lifted by `lift` px, at progress k */
export const arc = (x0: number, y0: number, x1: number, y1: number, lift: number, k: number): [number, number] => {
	const cx = (x0 + x1) / 2;
	const cy = Math.min(y0, y1) - lift;
	const a = (1 - k) * (1 - k);
	const b = 2 * (1 - k) * k;
	const c = k * k;
	return [a * x0 + b * cx + c * x1, a * y0 + b * cy + c * y1];
};
