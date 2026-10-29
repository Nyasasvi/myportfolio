import { clamp, rng, type Frame, type Palette, type Scene, type Zone } from '@/app/components/field/types';
import { stageFor, tag, text, type Stage } from '../stage';

/*
 * Diffusion Model Face Generator: a portrait drawn out of noise. The model starts from pure static
 * and removes a little noise at every step, on a cosine schedule, until a painted face is left; then
 * noise is added back and a new face is sampled. Beside it, the UNet that does the work: each step
 * passes down the encoder, through the bottleneck and up the decoder, with the skip connections
 * carrying detail across. The pointer stirs noise back into the portrait wherever it passes; the
 * UNet row lights the network, any other row starts a new face.
 */

type Phase = 'denoise' | 'hold' | 'renoise';
const LENGTH: Record<Phase, number> = { denoise: 4.6, hold: 2.2, renoise: 1.1 };
const COLS = 36;
const ROWS = 46;
const LEVELS = 14;
const STEPS = 50; // visible steps; the counter reads in the model's thousand

type Face = { cx: number; cy: number; rx: number; ry: number; long: boolean; eyeY: number; eyeDx: number; mouth: number; skin: number };

const inEllipse = (u: number, v: number, cx: number, cy: number, rx: number, ry: number) => ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 < 1;

/** A painted portrait in flat values: [alpha, hue] with hue 0 ink, 1 accent, 2 amber */
const portrait = (f: Face, u: number, v: number): [number, number] => {
	const { cx, cy, rx, ry } = f;
	if (inEllipse(u, v, cx - f.eyeDx, f.eyeY, 0.034, 0.015) || inEllipse(u, v, cx + f.eyeDx, f.eyeY, 0.034, 0.015)) return [0.1, 0];
	if (Math.abs(v - (f.eyeY - 0.035)) < 0.008 && Math.abs(Math.abs(u - cx) - f.eyeDx) < 0.045) return [0.22, 0];
	if (inEllipse(u, v, cx, f.eyeY + 0.15, f.mouth, 0.014)) return [0.75, 1];
	if (Math.abs(u - cx) < 0.013 && v > f.eyeY + 0.03 && v < f.eyeY + 0.1) return [0.42, 0];
	const head = inEllipse(u, v, cx, cy, rx, ry);
	if (head && v < cy - ry * 0.55) return [0.2, 0];
	if (head) return [f.skin - (u - cx) * 0.5, 0];
	if (Math.abs(u - cx) < rx * 0.36 && v > cy && v < cy + ry + 0.14) return [f.skin - 0.12, 0];
	const hair = inEllipse(u, v, cx, cy - ry * 0.12, rx * 1.2, ry * 1.12) || (f.long && Math.abs(u - cx) < rx * 1.25 && v > cy && v < cy + ry * 1.45);
	if (hair) return [0.18, 0];
	const below = v - (cy + ry + 0.1);
	if (below > 0 && Math.abs(u - cx) < 0.16 + below * 1.5) return [0.32, 0];
	// The varnished ground of an old painting
	return [0.1 + v * 0.1, 2];
};

const ab = (t: number) => Math.cos(((t + 0.008) / 1.008) * (Math.PI / 2)) ** 2;

export class DiffusionScene implements Scene {
	private s: Stage = { x: 0, y: 0, w: 0, h: 0 };
	private cell = 8;
	private px = 0;
	private py = 0;
	private target: [number, number][] = [];
	private noise = new Float32Array(COLS * ROWS);
	private gate = new Float32Array(COLS * ROWS);
	private stir = new Float32Array(COLS * ROWS);
	private phase: Phase = 'denoise';
	private t = 0;
	private step = -1;
	private faces = 0;
	private rand = rng(3);
	private flash = 0;
	private unet = { x: 0, y: 0, w: 0, h: 0, on: false };

	constructor() {
		for (let i = 0; i < this.gate.length; i++) this.gate[i] = this.rand();
		this.sample();
	}

	private sample() {
		const r = this.rand;
		const face: Face = {
			cx: 0.5 + (r() - 0.5) * 0.06,
			cy: 0.4 + (r() - 0.5) * 0.04,
			rx: 0.19 + r() * 0.04,
			ry: 0.25 + r() * 0.03,
			long: r() < 0.5,
			eyeY: 0.41 + (r() - 0.5) * 0.03,
			eyeDx: 0.075 + r() * 0.015,
			mouth: 0.04 + r() * 0.02,
			skin: 0.6 + r() * 0.15,
		};
		this.target = [];
		for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) this.target.push(portrait(face, (i + 0.5) / COLS, (j + 0.5) / ROWS));
		for (let i = 0; i < this.noise.length; i++) this.noise[i] = this.gauss();
		this.faces++;
	}

	private gauss() {
		return (this.rand() + this.rand() + this.rand() - 1.5) * 0.9;
	}

	resize(w: number, h: number, zone: Zone) {
		this.s = stageFor(w, h, zone);
		const { s } = this;
		const wide = s.w > s.h * 1.05;
		const height = wide ? s.h * 0.86 : Math.min(s.h * 0.56, (s.w * ROWS) / COLS);
		this.cell = height / ROWS;
		this.px = s.x;
		this.py = s.y + (wide ? (s.h - height) / 2 + 10 : 30);
		const used = COLS * this.cell + Math.max(40, s.w * 0.06);
		this.unet = wide && s.w - used > 200
			? { x: s.x + used, y: s.y + s.h * 0.2, w: s.w - used, h: s.h * 0.55, on: true }
			: !wide && s.h - (this.py - s.y) - height > 200
				? { x: s.x, y: this.py + height + 40, w: s.w, h: Math.min(180, s.h - height - 80), on: true }
				: { x: 0, y: 0, w: 0, h: 0, on: false };
	}

	/** Noise level now, 0 (clean) to 1 (pure noise), as the model's timestep */
	private get level() {
		const k = clamp(this.t / LENGTH[this.phase], 0, 1);
		return this.phase === 'denoise' ? 1 - k : this.phase === 'hold' ? 0 : k;
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		if (f.intro >= 0.4) this.t += dt;
		this.flash = Math.max(0, this.flash - dt);
		const step = Math.floor(this.level * STEPS);
		if (step !== this.step) {
			this.step = step;
			// Each step draws fresh noise for the part that is still noise
			for (let i = 0; i < this.noise.length; i++) this.noise[i] = this.noise[i] * 0.45 + this.gauss() * 0.55;
		}
		if (pointer.active) {
			const ci = (pointer.x - this.px) / this.cell;
			const cj = (pointer.y - this.py) / this.cell;
			const r = 5;
			for (let j = Math.floor(cj - r); j <= cj + r; j++) {
				for (let i = Math.floor(ci - r); i <= ci + r; i++) {
					if (i < 0 || j < 0 || i >= COLS || j >= ROWS) continue;
					const d = Math.hypot(i - ci, j - cj) / r;
					if (d < 1) this.stir[j * COLS + i] = Math.max(this.stir[j * COLS + i], 1 - d * d);
				}
			}
		}
		for (let i = 0; i < this.stir.length; i++) if (this.stir[i] > 0) this.stir[i] = Math.max(0, this.stir[i] - dt * 0.7);
		if (this.t < LENGTH[this.phase]) return;
		this.t = 0;
		if (this.phase === 'denoise') this.phase = 'hold';
		else if (this.phase === 'hold') this.phase = 'renoise';
		else {
			this.sample();
			this.phase = 'denoise';
		}
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const a = clamp(f.intro * 1.6, 0, 1);
		const noiseLevel = f.intro < 1 && this.phase === 'denoise' && this.t === 0 ? 1 : this.level;
		const signal = Math.sqrt(ab(noiseLevel));
		const spread = Math.sqrt(1 - ab(noiseLevel));
		const tones = [p.ink, p.accent, p.amber];
		// Group the cells by tone and value, one fill per group
		const paths: number[][] = Array.from({ length: 3 * LEVELS }, () => []);
		for (let j = 0; j < ROWS; j++) {
			for (let i = 0; i < COLS; i++) {
				const k = j * COLS + i;
				const [value, hue] = this.target[k];
				const s = Math.max(signal - this.stir[k] * 0.9, 0);
				const n = Math.min(1, spread + this.stir[k] * 0.9);
				const v = clamp(s * value + n * (0.3 + this.noise[k] * 0.45), 0, 1);
				const tone = this.gate[k] < s * s ? hue : 0;
				paths[tone * LEVELS + Math.min(LEVELS - 1, Math.floor(v * LEVELS))].push(i, j);
			}
		}
		ctx.globalAlpha = a;
		const c = this.cell;
		paths.forEach((cells, g) => {
			if (!cells.length) return;
			const tone = Math.floor(g / LEVELS);
			ctx.fillStyle = tones[tone](((g % LEVELS) + 0.5) / LEVELS);
			ctx.beginPath();
			for (let k = 0; k < cells.length; k += 2) ctx.rect(this.px + cells[k] * c, this.py + cells[k + 1] * c, c + 0.4, c + 0.4);
			ctx.fill();
		});
		const stepLabel = Math.round(noiseLevel * 1000);
		tag(ctx, p, this.phase === 'hold' ? 'Sampled' : `Step ${stepLabel} of 1000`, this.px - 6, this.py - 18, { ink: this.phase === 'hold' ? p.accent(1) : p.ink(0.85) });

		if (this.unet.on) this.drawUnet(ctx, p, f);
		ctx.globalAlpha = 1;
	}

	/** Encoder down, bottleneck, decoder up; a pass runs through it on every step */
	private drawUnet(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const { x, y, w, h } = this.unet;
		const depth = 4;
		const working = this.phase !== 'hold';
		const pass = working ? (f.t * 1.6) % 1 : -1; // 0..1 along the U
		const colW = w / (depth * 2 + 1);
		const blocks: { x: number; y: number; bh: number; at: number }[] = [];
		for (let i = 0; i <= depth * 2; i++) {
			const level = i <= depth ? i : depth * 2 - i;
			const bh = h * (0.5 - level * 0.09);
			blocks.push({ x: x + i * colW + colW * 0.2, y: y + (level * h * 0.45) / depth, bh, at: i / (depth * 2) });
		}
		// Skip connections between matching levels
		ctx.lineWidth = 1.5;
		for (let i = 0; i < depth; i++) {
			const from = blocks[i];
			const to = blocks[depth * 2 - i];
			const carrying = pass >= from.at && pass <= to.at;
			ctx.strokeStyle = carrying || this.flash > 0 ? p.accent(0.6) : p.ink(0.18);
			ctx.beginPath();
			ctx.moveTo(from.x + colW * 0.6, from.y + from.bh * 0.5);
			ctx.lineTo(to.x, to.y + to.bh * 0.5);
			ctx.stroke();
		}
		blocks.forEach((b) => {
			const near = pass >= 0 && Math.abs(pass - b.at) < 0.08;
			ctx.fillStyle = near || this.flash > 0 ? p.accent(0.85) : p.ink(0.2);
			ctx.fillRect(b.x, b.y, colW * 0.6, b.bh);
		});
		text(ctx, p, 'UNet2D', x, y + h + 26, p.ink(0.75), 13);
		text(ctx, p, working ? 'predicting the noise to remove' : 'done', x + 64, y + h + 26, p.muted(0.8), 13);
	}

	poke(_x: number, _y: number, label: string) {
		if (/unet/i.test(label)) {
			this.flash = 1.2;
			return;
		}
		this.sample();
		this.phase = 'denoise';
		this.t = 0;
	}
}
