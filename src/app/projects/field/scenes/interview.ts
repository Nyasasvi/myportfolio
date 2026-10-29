import { approach, clamp, rng, type Frame, type Palette, type Scene, type Zone } from '@/app/components/field/types';
import { stageFor, tag, text, type Stage } from '../stage';

/*
 * AI Mock Interview Platform: a voice interview drawn as its recording. The interviewer (in the
 * accent) asks, the candidate (in the ink) answers, and their voices scroll past as a waveform, with
 * the transcript building underneath. After three questions the session is scored and the feedback
 * is saved. The pointer is the candidate's voice: move it and you speak, and the interviewer waits
 * for you to finish. The Gemini or VAPI rows have the interviewer ask the next question; the Firebase
 * rows save the feedback.
 */

type Who = 'ai' | 'you' | null;
type Phase = 'talk' | 'score' | 'saved';

const STEP = 6; // px between bars
const SPEED = 70; // px per second the recording scrolls
const CRITERIA = ['Clarity', 'Depth', 'Structure', 'Pace'];

export class InterviewScene implements Scene {
	private s: Stage = { x: 0, y: 0, w: 0, h: 0 };
	private bars: { amp: number; who: Who }[] = [];
	private carry = 0;
	private speaker: Who = 'ai';
	private turnLeft = 2.4;
	private pause = 0;
	private questions = 1;
	private phase: Phase = 'talk';
	private phaseT = 0;
	private scores = [0, 0, 0, 0];
	private targets = [0.8, 0.7, 0.75, 0.6];
	private lines: { who: Who; len: number }[] = [{ who: 'ai', len: 0 }];
	private voice = 0;
	private lastX = 0;
	private lastY = 0;
	private rand = rng(13);
	private t = 0;
	private level = { ai: 0, you: 0 };

	resize(w: number, h: number, zone: Zone) {
		this.s = stageFor(w, h, zone);
		// The recording already holds the start of the interview: a question, then an answer
		const n = Math.ceil(this.s.w / STEP) + 1;
		this.bars = Array.from({ length: n }, (_, i) => {
			const who: Who = i < n * 0.32 ? 'ai' : i < n * 0.36 ? null : i < n * 0.8 ? 'you' : null;
			this.t = i * 0.086;
			return { amp: who ? this.speech(who === 'ai' ? 0 : 40) : 0, who };
		});
		this.t = 0;
	}

	/** Speech-like loudness: syllables gated on and off under a slow phrase envelope */
	private speech(seed: number) {
		const t = this.t + seed;
		const syllable = Math.max(0, Math.sin(t * 17) * 0.6 + Math.sin(t * 7.3) * 0.5);
		const phrase = 0.5 + 0.5 * Math.sin(t * 1.9);
		return clamp(syllable * (0.35 + phrase * 0.65) + this.rand() * 0.08, 0, 1);
	}

	private turn(next: Who) {
		this.speaker = next;
		this.turnLeft = next === 'ai' ? 2 + this.rand() * 1.2 : 2.6 + this.rand() * 1.6;
		this.lines.push({ who: next, len: 0 });
		if (this.lines.length > 7) this.lines.shift();
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		this.t += dt;
		this.phaseT += dt;

		// The pointer's speed is the candidate's voice
		if (pointer.active) {
			const speed = Math.hypot(pointer.x - this.lastX, pointer.y - this.lastY) / Math.max(dt, 1 / 120);
			this.voice = approach(this.voice, clamp(speed / 900, 0, 1), 10, dt);
			this.lastX = pointer.x;
			this.lastY = pointer.y;
		} else this.voice = approach(this.voice, 0, 6, dt);
		const barging = this.voice > 0.08;

		let amp = 0;
		let who: Who = null;
		if (this.phase === 'talk' && f.intro > 0.4) {
			if (barging) {
				// The visitor speaks; the interviewer stops and listens
				if (this.speaker !== 'you') this.turn('you');
				this.turnLeft = Math.max(this.turnLeft, 0.8);
				amp = clamp(this.voice * 1.3 * (0.6 + 0.4 * Math.abs(Math.sin(this.t * 15))), 0, 1);
				who = 'you';
			} else if (this.pause > 0) {
				this.pause -= dt;
				if (this.pause <= 0) {
					if (this.speaker === 'you' && this.questions >= 3) this.score();
					else {
						if (this.speaker === 'you') this.questions++;
						this.turn(this.speaker === 'ai' ? 'you' : 'ai');
					}
				}
			} else if (this.speaker) {
				this.turnLeft -= dt;
				amp = this.speech(this.speaker === 'ai' ? 0 : 40);
				who = this.speaker;
				if (this.turnLeft <= 0) this.pause = 0.55;
			}
		}
		if (who && this.lines.length) this.lines[this.lines.length - 1].len += dt * (amp > 0.1 ? 1 : 0.2);
		this.level.ai = approach(this.level.ai, who === 'ai' ? amp : 0, 14, dt);
		this.level.you = approach(this.level.you, who === 'you' ? amp : 0, 14, dt);

		// The recording scrolls; new bars enter at the right
		this.carry += SPEED * dt;
		while (this.carry >= STEP) {
			this.carry -= STEP;
			this.bars.shift();
			this.bars.push({ amp, who });
		}

		if (this.phase === 'score') {
			this.scores = this.scores.map((v, i) => approach(v, this.targets[i], 3, dt));
			if (this.phaseT > 2.2) this.save();
		} else if (this.phase === 'saved' && this.phaseT > 1.6) this.restart();
	}

	private score() {
		this.phase = 'score';
		this.phaseT = 0;
		this.speaker = null;
		this.targets = this.targets.map(() => 0.45 + this.rand() * 0.5);
	}

	private save() {
		this.phase = 'saved';
		this.phaseT = 0;
	}

	private restart() {
		this.phase = 'talk';
		this.phaseT = 0;
		this.questions = 1;
		this.scores = [0, 0, 0, 0];
		this.lines = [];
		this.turn('ai');
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const { s } = this;
		const a = clamp(f.intro * 1.6, 0, 1);
		ctx.globalAlpha = a;

		// Who is speaking: two marks that swell with their voice
		const top = s.y + 20;
		const mark = (x: number, level: number, name: string, ink: (a: number) => string) => {
			const size = 18 + level * 22;
			ctx.fillStyle = ink(0.3 + level * 0.7);
			ctx.fillRect(x + 20 - size / 2, top + 10 - size / 2, size, size);
			text(ctx, p, name, x + 54, top + 16, p.ink(0.85), 15);
		};
		mark(s.x, this.level.ai, 'Interviewer', p.accent);
		mark(s.x + Math.min(220, s.w * 0.45), this.level.you, 'You', p.ink);

		// The recording: mirrored bars around a centre line
		const mid = s.y + s.h * 0.36;
		const reach = Math.min(s.h * 0.24, 150);
		ctx.fillStyle = p.ink(0.12);
		ctx.fillRect(s.x, mid - 0.5, s.w, 1);
		for (const pass of ['you', 'ai'] as const) {
			ctx.fillStyle = pass === 'ai' ? p.accent(0.85) : p.ink(0.7);
			ctx.beginPath();
			this.bars.forEach((b, i) => {
				if (b.who !== pass || b.amp < 0.02) return;
				const x = s.x + i * STEP - this.carry;
				if (x < s.x) return;
				const hgt = b.amp * reach;
				ctx.rect(x, mid - hgt, STEP - 2.5, hgt * 2);
			});
			ctx.fill();
		}

		// The transcript, a line per turn
		let y = mid + reach + 34;
		const lineH = 16;
		for (const line of this.lines) {
			if (y > s.y + s.h * 0.78) break;
			const len = clamp(line.len / 4, 0.05, 1) * s.w * 0.9;
			ctx.fillStyle = line.who === 'ai' ? p.accent(0.45) : p.ink(0.22);
			ctx.fillRect(s.x + (line.who === 'you' ? 24 : 0), y, len, 6);
			y += lineH;
		}

		// Feedback once the session ends
		if (this.phase !== 'talk') {
			const fy = s.y + s.h * 0.8;
			const col = s.w / 4;
			CRITERIA.forEach((name, i) => {
				const x = s.x + i * col;
				text(ctx, p, name, x, fy, p.ink(0.8), 13);
				ctx.fillStyle = p.ink(0.12);
				ctx.fillRect(x, fy + 10, col - 18, 6);
				ctx.fillStyle = p.accent(0.9);
				ctx.fillRect(x, fy + 10, (col - 18) * this.scores[i], 6);
			});
			if (this.phase === 'saved') tag(ctx, p, 'Feedback saved', s.x - 6, fy + 44, { ink: p.accent(1) });
		}
		ctx.globalAlpha = 1;
	}

	poke(_x: number, _y: number, label: string) {
		if (/firebase|firestore/i.test(label)) {
			if (this.phase === 'talk') this.score();
			return;
		}
		if (this.phase !== 'talk') this.restart();
		else {
			this.pause = 0;
			this.turn('ai');
		}
	}
}
