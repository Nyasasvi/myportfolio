import { approach, clamp, easeInOut, easeOut, type Frame, type Palette, type Scene, type Zone } from '@/app/components/field/types';
import { arc, stageFor, tag, type Stage } from '@/app/components/field/stage';

/*
 * Send a message: the letter being written, set as the visitor types it. The form beside it feeds
 * the scene its name, email and message, and the sheet typesets them as a letter to Yasasvi. When the
 * message is sent the sheet folds into an envelope addressed to Dallas and flies off, and a fresh
 * sheet comes in; if it fails to send, the sheet shakes. The sheet leans a little toward the pointer.
 */

export type Draft = { name: string; email: string; message: string };
type Phase = 'write' | 'fold' | 'fly' | 'enter';
const LENGTH: Record<Phase, number> = { write: Infinity, fold: 0.9, fly: 1.1, enter: 0.7 };

export class LetterScene implements Scene {
	private s: Stage = { x: 0, y: 0, w: 0, h: 0 };
	private draft: Draft = { name: '', email: '', message: '' };
	private sentDraft: Draft | null = null;
	private lines: string[] = [];
	private wrappedFor = '';
	private phase: Phase = 'write';
	private t = 0;
	private tilt = 0;
	private shake = 0;
	private clock = 0;
	private paper = { x: 0, y: 0, w: 0, h: 0, size: 15 };

	resize(w: number, h: number, zone: Zone) {
		this.s = stageFor(w, h, zone);
		const { s } = this;
		const pw = Math.min(s.w * 0.72, (s.h * 0.88) / 1.3, 520);
		const ph = pw * 1.3;
		this.paper = { x: s.x + (s.w - pw) / 2, y: s.y + (s.h - ph) / 2, w: pw, h: ph, size: clamp(pw / 27, 12, 18) };
		this.wrappedFor = '';
	}

	/** The form's current contents */
	setDraft(d: Draft) {
		this.draft = { ...d };
	}

	sent() {
		this.sentDraft = { ...this.draft };
		this.phase = 'fold';
		this.t = 0;
	}

	failed() {
		this.shake = 1;
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		this.clock += dt;
		this.t += dt;
		this.shake = Math.max(0, this.shake - dt * 1.6);
		const lean = pointer.active ? clamp((pointer.x - (this.paper.x + this.paper.w / 2)) / this.s.w, -1, 1) * 0.035 : 0;
		this.tilt = approach(this.tilt, lean, 4, dt);
		if (this.t < LENGTH[this.phase]) return;
		this.t = 0;
		if (this.phase === 'fold') this.phase = 'fly';
		else if (this.phase === 'fly') this.phase = 'enter';
		else if (this.phase === 'enter') {
			this.phase = 'write';
			this.sentDraft = null;
		}
	}

	/** Break the message into lines that fit the sheet, measured in its own type */
	private wrap(ctx: CanvasRenderingContext2D, p: Palette, message: string, width: number) {
		const key = `${message}|${width}|${p.body}`;
		if (key === this.wrappedFor) return this.lines;
		ctx.font = `400 ${this.paper.size}px ${p.body}`;
		const out: string[] = [];
		for (const para of message.split('\n')) {
			let line = '';
			for (const word of para.split(/\s+/)) {
				if (!word) continue;
				const next = line ? `${line} ${word}` : word;
				if (ctx.measureText(next).width <= width || !line) line = next;
				else {
					out.push(line);
					line = word;
				}
			}
			out.push(line);
		}
		this.lines = out;
		this.wrappedFor = key;
		return out;
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const a = clamp(f.intro * 1.6, 0, 1);
		const { paper } = this;
		const d = this.sentDraft ?? this.draft;
		const cx = paper.x + paper.w / 2;
		const cy = paper.y + paper.h / 2;
		ctx.save();
		ctx.globalAlpha = a;

		if (this.phase === 'fly') {
			// The envelope, addressed, on its way
			const k = easeInOut(this.t / LENGTH.fly);
			const [x, y] = arc(cx, cy, this.s.x + this.s.w + 120, this.s.y - 80, 120, k);
			const scale = 1 - k * 0.55;
			this.envelope(ctx, p, x, y, paper.w * 0.8 * scale, paper.w * 0.5 * scale, 1);
			if (this.t < 0.6) tag(ctx, p, 'Sent', cx, cy - paper.w * 0.32, { align: 'center', ink: p.onAccent, ground: p.accent(1), weight: 700 });
			ctx.restore();
			return;
		}

		let fold = 0;
		let lift = 0;
		if (this.phase === 'fold') fold = easeInOut(this.t / LENGTH.fold);
		if (this.phase === 'enter') lift = 1 - easeOut(this.t / LENGTH.enter);
		const sx = Math.sin(this.clock * 40) * this.shake * 10;
		ctx.translate(cx + sx, cy + lift * 80);
		ctx.rotate(this.tilt);
		ctx.globalAlpha = a * (1 - lift);

		if (fold > 0.55) {
			// Folded in three, then into its envelope
			const k = (fold - 0.55) / 0.45;
			this.envelope(ctx, p, 0, 0, paper.w * 0.8, paper.w * 0.5, k);
			ctx.restore();
			return;
		}
		const h = paper.h * (1 - (fold / 0.55) * 0.62);
		ctx.fillStyle = p.bg;
		ctx.fillRect(-paper.w / 2, -h / 2, paper.w, h);
		ctx.fillStyle = p.ink(0.06);
		ctx.fillRect(-paper.w / 2, -h / 2, paper.w, h);
		ctx.strokeStyle = p.ink(0.22);
		ctx.lineWidth = 1;
		ctx.strokeRect(-paper.w / 2 + 0.5, -h / 2 + 0.5, paper.w - 1, h - 1);
		if (fold > 0) {
			ctx.strokeStyle = p.ink(0.18);
			ctx.beginPath();
			ctx.moveTo(-paper.w / 2, -h / 6);
			ctx.lineTo(paper.w / 2, -h / 6);
			ctx.moveTo(-paper.w / 2, h / 6);
			ctx.lineTo(paper.w / 2, h / 6);
			ctx.stroke();
			ctx.restore();
			return;
		}

		// The letter, typeset from the form
		const pad = paper.w * 0.1;
		const size = paper.size;
		const lh = size * 1.6;
		const left = -paper.w / 2 + pad;
		let y = -paper.h / 2 + pad + size;
		const write = (s: string, ink: string, weight = 400, sz = size) => {
			ctx.font = `${weight} ${sz}px ${p.body}`;
			ctx.fillStyle = ink;
			ctx.fillText(s, left, y);
			return ctx.measureText(s).width;
		};
		write('Dear Yasasvi,', p.ink(0.9), 500);
		y += lh * 2;
		const room = Math.max(1, Math.floor((paper.h - pad * 2 - lh * 6) / lh));
		const message = d.message.trim();
		let caretX = left;
		let caretY = y;
		if (message) {
			const lines = this.wrap(ctx, p, message, paper.w - pad * 2);
			const shown = lines.slice(0, room);
			if (lines.length > room) shown[room - 1] = `${shown[room - 1].replace(/\s*\S*$/, '')} …`;
			shown.forEach((line, i) => {
				const w = write(line, p.ink(0.85));
				if (i === shown.length - 1) {
					caretX = left + w + 3;
					caretY = y;
				}
				y += lh;
			});
		} else {
			write('What would you like to talk about?', p.muted(0.5));
			y += lh;
		}
		// A caret where the next word goes, blinking while the sheet waits
		if (this.phase === 'write' && Math.floor(this.clock * 1.6) % 2 === 0) {
			ctx.fillStyle = p.accent(0.9);
			ctx.fillRect(caretX, caretY - size * 0.85, 2, size * 1.05);
		}
		y = paper.h / 2 - pad - lh * 1.4;
		write(`— ${d.name.trim() || 'Your name'}`, d.name.trim() ? p.ink(0.85) : p.muted(0.5), 500);
		y += lh;
		write(d.email.trim() || 'Your email', d.email.trim() ? p.muted(0.85) : p.muted(0.45), 400, size * 0.85);
		ctx.restore();
	}

	/** An envelope centred on (x, y): body, flap closing as k goes to 1, and its address */
	private envelope(ctx: CanvasRenderingContext2D, p: Palette, x: number, y: number, w: number, h: number, k: number) {
		ctx.fillStyle = p.bg;
		ctx.fillRect(x - w / 2, y - h / 2, w, h);
		ctx.fillStyle = p.ink(0.1);
		ctx.fillRect(x - w / 2, y - h / 2, w, h);
		ctx.strokeStyle = p.ink(0.35);
		ctx.lineWidth = 1.2;
		ctx.strokeRect(x - w / 2, y - h / 2, w, h);
		ctx.beginPath();
		ctx.moveTo(x - w / 2, y - h / 2);
		ctx.lineTo(x, y - h / 2 + h * 0.55 * k);
		ctx.lineTo(x + w / 2, y - h / 2);
		ctx.stroke();
		ctx.fillStyle = p.accent(0.9);
		ctx.fillRect(x + w / 2 - w * 0.14, y - h / 2 + h * 0.1, w * 0.08, w * 0.1);
		if (w > 140) {
			ctx.font = `500 ${Math.round(w / 24)}px ${p.body}`;
			ctx.fillStyle = p.ink(0.8 * k);
			ctx.fillText('Yasasvi Nellore', x - w * 0.18, y + h * 0.18);
			ctx.fillStyle = p.muted(0.8 * k);
			ctx.fillText('Dallas, Texas', x - w * 0.18, y + h * 0.18 + w / 18);
		}
	}

	poke() {
		this.shake = 0.25;
	}
}
