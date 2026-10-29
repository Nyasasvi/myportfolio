import { approach, clamp, rng, type Frame, type Palette, type Scene } from '@/app/components/field/types';

/*
 * Frontend: a page of interface blocks on a twelve-column grid (the red columns of a design tool,
 * here in the accent) that reflows every few seconds, as a layout does across breakpoints: the
 * field is split into new blocks and each component glides to its new box. Hovering a block
 * highlights it the way browser developer tools do, with its size; a skill row reflows the page.
 */

type Kind = 'image' | 'text' | 'chart' | 'profile' | 'actions' | 'media';
type Box = { kind: Kind; x: number; y: number; w: number; h: number; tx: number; ty: number; tw: number; th: number; delay: number };
type Rect = { x: number; y: number; w: number; h: number };

const KINDS: Kind[] = ['image', 'text', 'chart', 'text', 'profile', 'media', 'actions', 'text', 'image', 'chart', 'media', 'text'];
const EVERY = 3.4;
const GAP = 8;

export class LayoutScene implements Scene {
	private boxes: Box[] = [];
	private area: Rect = { x: 0, y: 0, w: 0, h: 0 };
	private cols = 12;
	private since = 0;
	private round = 0;
	private flash = -1;
	private flashAge = 0;
	private hover = -1;
	private bars = Array.from({ length: 7 }, (_, i) => 0.3 + 0.6 * Math.abs(Math.sin(i * 1.7 + 0.4)));

	resize(w: number, h: number) {
		const narrow = w < 700;
		this.cols = narrow ? 4 : 12;
		this.area = { x: w * (narrow ? 0.05 : 0.04), y: h * 0.06, w: w * (narrow ? 0.9 : 0.92), h: h * 0.88 };
		const count = narrow ? 7 : w < 1100 ? 9 : 12;
		const rects = this.split(count, 1);
		this.boxes = rects.map((r, i) => ({ kind: KINDS[i % KINDS.length], ...r, tx: r.x, ty: r.y, tw: r.w, th: r.h, delay: 0 }));
	}

	/** Guillotine split of the area into n boxes, cuts snapped to the column grid */
	private split(n: number, seed: number): Rect[] {
		const rand = rng(seed * 7919 + 3);
		const colW = this.area.w / this.cols;
		const cut = (r: Rect, k: number): Rect[] => {
			if (k === 1) return [r];
			const canV = r.w >= colW * 2 - 1;
			const canH = r.h >= 96;
			const prefer = r.w / r.h > 1.15 ? rand() < 0.8 : r.w / r.h < 0.7 ? rand() < 0.2 : rand() < 0.5;
			const vertical = canV && (prefer || !canH);
			const left = clamp(Math.round(k * (0.3 + rand() * 0.4)), 1, k - 1);
			const share = left / k + (rand() - 0.5) * 0.12;
			if (vertical) {
				const at = clamp(Math.round((r.w * share) / colW) * colW, colW, r.w - colW);
				return [...cut({ x: r.x, y: r.y, w: at, h: r.h }, left), ...cut({ x: r.x + at, y: r.y, w: r.w - at, h: r.h }, k - left)];
			}
			const at = canH ? clamp(Math.round((r.h * share) / 8) * 8, 48, r.h - 48) : r.h / 2;
			return [...cut({ x: r.x, y: r.y, w: r.w, h: at }, left), ...cut({ x: r.x, y: r.y + at, w: r.w, h: r.h - at }, k - left)];
		};
		// Reading order, so blocks travel the short way between layouts
		return cut({ ...this.area }, n).sort((a, b) => a.y - b.y || a.x - b.x);
	}

	private reflow() {
		this.round++;
		this.since = 0;
		const rects = this.split(this.boxes.length, this.round + 1);
		this.boxes.forEach((b, i) => {
			const r = rects[i];
			b.tx = r.x;
			b.ty = r.y;
			b.tw = r.w;
			b.th = r.h;
			b.delay = i * 0.035;
		});
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		this.since += dt;
		this.flashAge += dt;
		if (f.intro >= 1 && this.since > EVERY) this.reflow();
		for (const b of this.boxes) {
			if (this.since < b.delay) continue;
			b.x = approach(b.x, b.tx, 5.5, dt);
			b.y = approach(b.y, b.ty, 5.5, dt);
			b.w = approach(b.w, b.tw, 5.5, dt);
			b.h = approach(b.h, b.th, 5.5, dt);
		}
		this.hover = -1;
		if (pointer.active) {
			this.hover = this.boxes.findIndex((b) => pointer.x >= b.x && pointer.x <= b.x + b.w && pointer.y >= b.y && pointer.y <= b.y + b.h);
		}
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const { area } = this;
		const colW = area.w / this.cols;
		// The layout grid
		ctx.fillStyle = p.accent(0.035 * clamp(f.intro * 2, 0, 1));
		for (let c = 0; c < this.cols; c++) ctx.fillRect(area.x + c * colW + GAP / 2, 0, colW - GAP, f.h);

		this.boxes.forEach((b, i) => {
			const grow = clamp(f.intro * 2.2 - i * 0.08, 0, 1);
			if (grow <= 0) return;
			const w = (b.w - GAP) * grow;
			const h = (b.h - GAP) * grow;
			const x = b.x + GAP / 2 + ((b.w - GAP) - w) / 2;
			const y = b.y + GAP / 2 + ((b.h - GAP) - h) / 2;
			if (w < 4 || h < 4) return;
			ctx.fillStyle = p.bg;
			ctx.fillRect(x, y, w, h);
			ctx.fillStyle = p.ink(0.035);
			ctx.fillRect(x, y, w, h);
			ctx.save();
			ctx.beginPath();
			ctx.rect(x, y, w, h);
			ctx.clip();
			this.content(ctx, p, b.kind, x, y, w, h, i === this.hover);
			ctx.restore();
			ctx.lineWidth = 1;
			ctx.strokeStyle = p.ink(0.13);
			ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

			const flashing = i === this.flash && this.flashAge < 1.2;
			if (i === this.hover || flashing) {
				const a = i === this.hover ? 1 : 1 - this.flashAge / 1.2;
				ctx.fillStyle = p.accent(0.1 * a);
				ctx.fillRect(x, y, w, h);
				ctx.lineWidth = 1.5;
				ctx.strokeStyle = p.accent(0.85 * a);
				ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5);
				if (i === this.hover) this.tag(ctx, p, `${Math.round(w)} × ${Math.round(h)}`, x, y);
			}
		});
	}

	/** Size tag above the hovered block, as the inspector shows it */
	private tag(ctx: CanvasRenderingContext2D, p: Palette, text: string, x: number, y: number) {
		ctx.font = `500 13px ${p.body}`;
		const tw = ctx.measureText(text).width + 14;
		const ty = y > 30 ? y - 26 : y + 4;
		ctx.fillStyle = p.accent(1);
		ctx.fillRect(x, ty, tw, 22);
		ctx.fillStyle = p.onAccent;
		ctx.fillText(text, x + 7, ty + 15);
	}

	private content(ctx: CanvasRenderingContext2D, p: Palette, kind: Kind, x: number, y: number, w: number, h: number, hot: boolean) {
		const pad = clamp(Math.min(w, h) * 0.1, 8, 18);
		const ink = (a: number) => p.ink(hot ? a * 1.7 : a);
		const lines = (lx: number, ly: number, lw: number, room: number) => {
			ctx.fillStyle = ink(0.16);
			ctx.fillRect(lx, ly, lw * 0.6, 8);
			ctx.fillStyle = ink(0.09);
			const widths = [0.95, 0.85, 0.92, 0.6, 0.88, 0.7];
			for (let k = 0, yy = ly + 22; yy + 4 < ly + room && k < 12; k++, yy += 13) ctx.fillRect(lx, yy, lw * widths[k % widths.length], 4);
		};
		if (kind === 'image' || kind === 'media') {
			const iw = kind === 'media' && w > h * 1.3 ? h - pad * 2 : w - pad * 2;
			const ih = kind === 'media' && w > h * 1.3 ? h - pad * 2 : (h - pad * 2) * (kind === 'media' ? 0.55 : 1);
			ctx.fillStyle = ink(0.06);
			ctx.fillRect(x + pad, y + pad, iw, ih);
			ctx.strokeStyle = ink(0.1);
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(x + pad, y + pad);
			ctx.lineTo(x + pad + iw, y + pad + ih);
			ctx.moveTo(x + pad + iw, y + pad);
			ctx.lineTo(x + pad, y + pad + ih);
			ctx.stroke();
			if (kind === 'media') {
				if (w > h * 1.3) lines(x + pad * 2 + iw, y + pad, w - iw - pad * 3, h - pad * 2);
				else lines(x + pad, y + pad * 2 + ih, w - pad * 2, h - ih - pad * 3);
			}
			return;
		}
		if (kind === 'text') return lines(x + pad, y + pad, w - pad * 2, h - pad * 2);
		if (kind === 'chart') {
			const n = this.bars.length;
			const bw = (w - pad * 2) / n;
			this.bars.forEach((v, k) => {
				const bh = (h - pad * 2) * v;
				ctx.fillStyle = k === 4 ? p.accent(hot ? 0.8 : 0.45) : ink(0.12);
				ctx.fillRect(x + pad + k * bw + 2, y + h - pad - bh, bw - 4, bh);
			});
			return;
		}
		if (kind === 'profile') {
			const r = clamp(Math.min(w, h) * 0.16, 8, 28);
			ctx.fillStyle = ink(0.12);
			ctx.beginPath();
			ctx.arc(x + pad + r, y + pad + r, r, 0, Math.PI * 2);
			ctx.fill();
			lines(x + pad * 2 + r * 2, y + pad + r - 8, w - pad * 3 - r * 2, h - pad * 2);
			return;
		}
		// Actions: a heading, a line and two buttons, the primary one filled
		lines(x + pad, y + pad, w - pad * 2, Math.max(0, h - pad * 2 - 40));
		const bwid = clamp(w * 0.26, 36, 96);
		ctx.fillStyle = p.accent(hot ? 0.9 : 0.55);
		ctx.fillRect(x + pad, y + h - pad - 26, bwid, 26);
		ctx.strokeStyle = ink(0.22);
		ctx.strokeRect(x + pad + bwid + 8.5, y + h - pad - 25.5, bwid - 1, 25);
	}

	poke(x: number, y: number) {
		this.reflow();
		let best = 0;
		let bestD = Infinity;
		this.boxes.forEach((b, i) => {
			const d = Math.hypot(b.tx + b.tw / 2 - x, b.ty + b.th / 2 - y);
			if (d < bestD) { bestD = d; best = i; }
		});
		this.flash = best;
		this.flashAge = 0;
	}
}
