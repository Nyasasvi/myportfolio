import { approach, clamp, easeInOut, easeOut, rng, type Frame, type Palette, type Scene, type Zone } from '@/app/components/field/types';
import { arc, stageFor, tag, text, type Stage } from '../stage';

/*
 * AI Resume Editor: a job description on the left, a resume on the right. The editor reads the
 * description and marks the skills it asks for; each one is carried across into the resume's skills,
 * the summary is rewritten around them, and the match meter rises. Then the resume is exported as a
 * PDF and a fresh one comes in for the next description. Pointing at a marked skill carries it across
 * at once; the technology rows send their own name across, and the PDF row exports.
 */

type Chip = { word: string; line: number; at: number; state: 'idle' | 'found' | 'flying' | 'placed'; t: number; slot: number };
type Phase = 'read' | 'tailor' | 'export' | 'enter';
const LENGTH: Record<Phase, number> = { read: 1.8, tailor: 2.6, export: 1.4, enter: 0.7 };
const WORDS = ['Python', 'React', 'AWS', 'SQL', 'Docker', 'Kafka', 'TypeScript', 'REST APIs', 'LLMs', 'CI/CD', 'Kubernetes', 'Spring Boot', 'GraphQL', 'Node.js'];
const JD_LINES = 15;
const KEY_LINES = [2, 4, 7, 10, 12];

export class ResumeScene implements Scene {
	private s: Stage = { x: 0, y: 0, w: 0, h: 0 };
	private jd = { x: 0, y: 0, w: 0, h: 0 };
	private cv = { x: 0, y: 0, w: 0, h: 0 };
	private chips: Chip[] = [];
	private phase: Phase = 'read';
	private t = 0;
	private match = 0.2;
	private matchTo = 0.2;
	private rewrite = 0;
	private round = 0;
	private rand = rng(19);
	private lineWidths: number[] = [];
	private hover = -1;
	private widths = new Map<string, number>();

	constructor() {
		this.deal();
	}

	private deal() {
		const pool = WORDS.slice().sort(() => this.rand() - 0.5);
		this.chips = KEY_LINES.map((line, i) => ({ word: pool[i], line, at: 0.15 + this.rand() * 0.4, state: 'idle', t: 0, slot: -1 }));
		this.lineWidths = Array.from({ length: JD_LINES }, () => 0.55 + this.rand() * 0.4);
		this.match = this.matchTo = 0.18 + this.rand() * 0.12;
		this.rewrite = 0;
	}

	resize(w: number, h: number, zone: Zone) {
		this.s = stageFor(w, h, zone);
		const { s } = this;
		const gap = Math.max(36, s.w * 0.08);
		const cvW = Math.min((s.w - gap) * 0.55, (s.h * 0.82) / 1.29, 400);
		const jdW = Math.min((s.w - gap) * 0.45, cvW * 0.85);
		this.cv = { x: s.x + jdW + gap, y: s.y + 40, w: cvW, h: cvW * 1.29 };
		this.jd = { x: s.x, y: s.y + 40 + cvW * 0.12, w: jdW, h: jdW * 1.25 };
	}

	private jdLineY(line: number) {
		return this.jd.y + 26 + line * ((this.jd.h - 40) / JD_LINES);
	}

	private chipStart(c: Chip): [number, number] {
		return [this.jd.x + 12 + c.at * (this.jd.w - 24) * 0.6, this.jdLineY(c.line)];
	}

	private width(word: string) {
		return this.widths.get(word) ?? word.length * 7.5 + 14;
	}

	/** Where the n-th placed skill sits in the resume's skills block, wrapping as it fills */
	private slotXY(n: number): [number, number] {
		const left = this.cv.x + 16;
		const right = this.cv.x + this.cv.w - 16;
		let x = left;
		let y = this.cv.y + this.cv.h * 0.4;
		const placed = this.chips.filter((c) => c.slot >= 0 && c.slot < n).sort((a, b) => a.slot - b.slot);
		for (const c of placed) {
			const w = this.width(c.word) + 6;
			if (x + w > right) {
				x = left;
				y += 26;
			}
			x += w;
		}
		const me = this.chips.find((c) => c.slot === n);
		if (me && x + this.width(me.word) > right) {
			x = left;
			y += 26;
		}
		return [x, y];
	}

	private send(c: Chip) {
		if (c.state === 'flying' || c.state === 'placed') return;
		c.state = 'flying';
		c.t = 0;
		c.slot = this.chips.filter((k) => k.slot >= 0).length;
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		this.t += dt;
		this.match = approach(this.match, this.matchTo, 4, dt);
		this.hover = -1;
		if (pointer.active) {
			this.hover = this.chips.findIndex((c) => {
				if (c.state !== 'found' && c.state !== 'idle') return false;
				const [x, y] = this.chipStart(c);
				return pointer.x > x - 6 && pointer.x < x + this.width(c.word) + 6 && Math.abs(pointer.y - y) < 14;
			});
			if (this.hover >= 0 && this.phase !== 'export' && this.phase !== 'enter') {
				this.chips[this.hover].state = 'found';
				this.send(this.chips[this.hover]);
			}
		}
		for (const c of this.chips) {
			if (c.state !== 'flying') continue;
			c.t += dt / 0.8;
			if (c.t >= 1) {
				c.state = 'placed';
				this.matchTo = Math.min(0.96, this.matchTo + 0.13);
			}
		}
		if (f.intro < 0.6) return;
		if (this.phase === 'read') {
			const scan = this.t / LENGTH.read;
			for (const c of this.chips) if (c.state === 'idle' && scan * JD_LINES > c.line) c.state = 'found';
		}
		if (this.phase === 'tailor') {
			this.rewrite = Math.min(1, this.t / 1.2);
			this.chips.forEach((c, i) => { if (c.state === 'found' && this.t > 0.2 + i * 0.4) this.send(c); });
		}
		if (this.t < LENGTH[this.phase]) return;
		this.t = 0;
		if (this.phase === 'read') this.phase = 'tailor';
		else if (this.phase === 'tailor') {
			if (this.chips.some((c) => c.state === 'flying')) this.t = LENGTH.tailor - 0.1;
			else this.phase = 'export';
		} else if (this.phase === 'export') {
			this.round++;
			this.deal();
			this.phase = 'enter';
		} else this.phase = 'read';
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const a = clamp(f.intro * 1.6, 0, 1);
		ctx.globalAlpha = a;
		ctx.font = `500 12px ${p.body}`;
		for (const c of this.chips) if (!this.widths.has(c.word)) this.widths.set(c.word, ctx.measureText(c.word).width + 14);

		// The job description
		const { jd } = this;
		const enter = this.phase === 'enter' ? easeOut(this.t / LENGTH.enter) : 1;
		ctx.globalAlpha = a * enter;
		ctx.fillStyle = p.ink(0.05);
		ctx.fillRect(jd.x, jd.y, jd.w, jd.h);
		text(ctx, p, 'Job description', jd.x, jd.y - 10, p.ink(0.75), 13);
		ctx.fillStyle = p.ink(0.16);
		for (let l = 0; l < JD_LINES; l++) {
			const keyed = this.chips.find((c) => c.line === l);
			const y = this.jdLineY(l) - 3;
			if (keyed) {
				const [cx] = this.chipStart(keyed);
				ctx.fillRect(jd.x + 12, y, cx - jd.x - 18, 5);
				const after = cx + this.width(keyed.word) + 6;
				ctx.fillRect(after, y, Math.max(0, jd.x + jd.w * this.lineWidths[l] - after), 5);
			} else ctx.fillRect(jd.x + 12, y, (jd.w - 24) * this.lineWidths[l], 5);
		}
		if (this.phase === 'read') {
			ctx.fillStyle = p.accent(0.9);
			ctx.fillRect(jd.x, jd.y + 14 + (this.t / LENGTH.read) * (jd.h - 28), jd.w, 2);
		}
		this.chips.forEach((c, i) => {
			if (c.state === 'flying' || c.state === 'placed') return;
			const [x, y] = this.chipStart(c);
			const found = c.state === 'found';
			tag(ctx, p, c.word, x, y, { size: 12, ink: found ? p.onAccent : p.ink(0.8), ground: found ? p.accent(i === this.hover ? 1 : 0.85) : p.ink(0.1) });
		});

		// The resume
		const { cv } = this;
		const out = this.phase === 'export' ? easeInOut(clamp((this.t - 0.7) / 0.7, 0, 1)) : 0;
		ctx.globalAlpha = a * (1 - out) * enter;
		const dx = out * 60;
		ctx.fillStyle = p.ink(0.07);
		ctx.fillRect(cv.x + dx, cv.y, cv.w, cv.h);
		ctx.fillStyle = p.ink(0.6);
		ctx.fillRect(cv.x + dx + 16, cv.y + 18, cv.w * 0.5, 10);
		ctx.fillStyle = p.ink(0.2);
		ctx.fillRect(cv.x + dx + 16, cv.y + 36, cv.w * 0.7, 4);
		const section = (name: string, y: number) => text(ctx, p, name, cv.x + dx + 16, y, p.muted(0.85), 12);
		section('Summary', cv.y + cv.h * 0.14);
		for (let l = 0; l < 3; l++) {
			// Rewritten lines grow to new lengths, one after another
			const k = clamp(this.rewrite * 3 - l, 0, 1);
			const w0 = [0.7, 0.85, 0.5][l];
			const w1 = [0.9, 0.78, 0.82][l];
			ctx.fillStyle = k > 0 && k < 1 ? p.accent(0.6) : p.ink(0.2);
			ctx.fillRect(cv.x + dx + 16, cv.y + cv.h * 0.17 + l * 12, (cv.w - 32) * (w0 + (w1 - w0) * k), 5);
		}
		section('Skills', cv.y + cv.h * 0.36);
		section('Experience', cv.y + cv.h * 0.62);
		ctx.fillStyle = p.ink(0.18);
		for (let l = 0; l < 7; l++) ctx.fillRect(cv.x + dx + 16 + (l % 3 === 0 ? 0 : 10), cv.y + cv.h * 0.66 + l * 13, (cv.w - 42) * (0.6 + ((l * 37) % 30) / 100), 5);

		// Skills carried across: flying along an arc, then set in the skills block
		this.chips.forEach((c) => {
			if (c.state !== 'flying' && c.state !== 'placed') return;
			const [tx, ty] = this.slotXY(c.slot);
			let x = tx + dx;
			let y = ty;
			if (c.state === 'flying') {
				const [sx, sy] = this.chipStart(c);
				[x, y] = arc(sx, sy, tx, ty, 60, easeInOut(c.t));
			}
			tag(ctx, p, c.word, x, y, { size: 12, ink: p.onAccent, ground: p.accent(0.9) });
		});

		// The match meter above the resume
		text(ctx, p, 'ATS match', cv.x + dx, cv.y - 24, p.ink(0.75), 13);
		ctx.fillStyle = p.ink(0.12);
		ctx.fillRect(cv.x + dx + 80, cv.y - 29, cv.w - 80, 6);
		ctx.fillStyle = p.accent(0.9);
		ctx.fillRect(cv.x + dx + 80, cv.y - 29, (cv.w - 80) * this.match, 6);

		if (this.phase === 'export') {
			const stamp = easeOut(this.t / 0.35);
			ctx.globalAlpha = a * stamp * (1 - out);
			tag(ctx, p, 'PDF', cv.x + dx + cv.w - 12, cv.y + 22, { size: 15, weight: 700, align: 'right', ink: p.onAccent, ground: p.accent(1) });
		}
		ctx.globalAlpha = 1;
	}

	poke(_x: number, _y: number, label: string) {
		if (/pdf/i.test(label)) {
			if (this.phase === 'read' || this.phase === 'tailor') {
				this.phase = 'export';
				this.t = 0;
			}
			return;
		}
		if (this.phase === 'export' || this.phase === 'enter') return;
		if (/openai|nlp/i.test(label)) {
			this.chips.forEach((c) => { if (c.state === 'idle') c.state = 'found'; });
			this.phase = 'tailor';
			this.t = 0;
			return;
		}
		// Any other technology: carry its own name across, in place of a skill not yet sent
		const spare = this.chips.find((c) => c.state === 'idle' || c.state === 'found');
		if (!spare || this.chips.some((c) => c.word === label)) return;
		spare.word = label;
		spare.state = 'found';
		this.send(spare);
	}
}
