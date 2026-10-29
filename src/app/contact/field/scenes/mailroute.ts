import { clamp, easeInOut, type Frame, type Palette, type Scene, type Zone } from '@/app/components/field/types';
import { stageFor, tag, text, type Stage } from '@/app/components/field/stage';

/*
 * Email: the route an email to a Gmail address really takes. It leaves the sender's mail app for
 * their mail server, which asks DNS where gmail.com takes its mail (the MX record answers with
 * gmail-smtp-in.l.google.com), then hands the message to Google's server in an SMTP conversation,
 * line by line, before it lands in the inbox. Pointing at the address sends another; copying it is
 * acknowledged at the inbox.
 */

type Hop = { name: string; detail: string; u: number; v: number };
const HOPS: Hop[] = [
	{ name: 'You', detail: 'your mail app', u: 0, v: 0.06 },
	{ name: 'Your mail server', detail: 'outgoing SMTP', u: 0, v: 0.27 },
	{ name: 'DNS', detail: 'MX lookup for gmail.com', u: 0.55, v: 0.27 },
	{ name: 'gmail-smtp-in.l.google.com', detail: 'Google’s mail exchanger', u: 0, v: 0.5 },
	{ name: 'Inbox', detail: 'yasasvi.nellore@gmail.com', u: 0, v: 0.92 },
];
// Client lines in the ink, server replies in the accent
const SMTP: [string, boolean][] = [
	['EHLO mail.example.com', false],
	['250 mx.google.com at your service', true],
	['MAIL FROM:<you@example.com>', false],
	['250 OK', true],
	['RCPT TO:<yasasvi.nellore@gmail.com>', false],
	['250 OK', true],
	['DATA', false],
	['354 Go ahead', true],
	['.', false],
	['250 OK, message accepted', true],
];
// The journey as timed legs: [from hop, to hop, seconds]; DNS is a question and an answer
const LEGS: [number, number, number][] = [[0, 1, 0.9], [1, 2, 0.6], [2, 1, 0.6], [1, 3, 0.9]];
const TALK = SMTP.length * 0.32;
const FINAL = 0.8;
const HOLD = 1.6;

export class MailRouteScene implements Scene {
	private s: Stage = { x: 0, y: 0, w: 0, h: 0 };
	private t = 0;
	private delivered = 2;
	private copied = 9;
	private hover = -1;

	resize(w: number, h: number, zone: Zone) {
		this.s = stageFor(w, h, zone);
	}

	private at(i: number): [number, number] {
		const { s } = this;
		return [s.x + 14 + HOPS[i].u * s.w, s.y + 20 + HOPS[i].v * (s.h - 40)];
	}

	private get legsTime() {
		return LEGS.reduce((sum, l) => sum + l[2], 0);
	}

	private get total() {
		return this.legsTime + TALK + FINAL + HOLD;
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		if (f.intro >= 0.6) this.t += dt;
		this.copied += dt;
		if (this.t >= this.total) {
			this.t = 0;
			this.delivered = (this.delivered % 6) + 1;
		}
		this.hover = -1;
		if (pointer.active) {
			HOPS.forEach((_, i) => {
				const [x, y] = this.at(i);
				if (Math.abs(pointer.x - x - 80) < 110 && Math.abs(pointer.y - y) < 18) this.hover = i;
			});
		}
	}

	/** Where the envelope is, and which hop it is at or heading for */
	private envelope(): { x: number; y: number; hop: number; moving: boolean } {
		let t = this.t;
		for (const [a, b, d] of LEGS) {
			if (t < d) {
				const k = easeInOut(t / d);
				const [x0, y0] = this.at(a);
				const [x1, y1] = this.at(b);
				return { x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k, hop: b, moving: true };
			}
			t -= d;
		}
		if (t < TALK) {
			const [x, y] = this.at(3);
			return { x, y, hop: 3, moving: false };
		}
		t -= TALK;
		const [x0, y0] = this.at(3);
		const [x1, y1] = this.at(4);
		const k = easeInOut(Math.min(1, t / FINAL));
		return { x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k, hop: 4, moving: t < FINAL };
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const a = clamp(f.intro * 1.6, 0, 1);
		ctx.globalAlpha = a;
		const env = this.envelope();
		// When the envelope (or, for DNS, the question) first gets to each hop
		const legs = LEGS.map((l) => l[2]);
		const arrive = [0, legs[0], legs[0] + legs[1], this.legsTime, this.legsTime + TALK + FINAL];
		const reached = (i: number) => this.t >= arrive[i] - 0.05;

		// The route
		ctx.strokeStyle = p.ink(0.2);
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		const [x0, y0] = this.at(0);
		const [, y4] = this.at(4);
		ctx.moveTo(x0, y0);
		ctx.lineTo(x0, y4);
		const [x1, y1] = this.at(1);
		const [x2] = this.at(2);
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y1);
		ctx.stroke();

		HOPS.forEach((hop, i) => {
			const [x, y] = this.at(i);
			const lit = reached(i);
			ctx.fillStyle = p.bg;
			ctx.fillRect(x - 8, y - 8, 16, 16);
			ctx.fillStyle = lit ? p.accent(0.9) : p.ink(0.3);
			ctx.fillRect(x - 6, y - 6, 12, 12);
			const hot = i === this.hover;
			text(ctx, p, hop.name, x + 20, y - 2, hot ? p.accent(1) : p.ink(0.88), 14);
			text(ctx, p, hop.detail, x + 20, y + 16, p.muted(0.8), 12);
		});

		// What DNS answers once asked, set under the server that asked
		const asked = this.t > LEGS[0][2] + LEGS[1][2];
		if (asked) {
			const [mx, my] = this.at(1);
			ctx.font = `13px ${p.code}`;
			ctx.fillStyle = p.accent(0.9);
			ctx.fillText('gmail.com.  MX  5 gmail-smtp-in.l.google.com.', mx + 20, my + 46);
		}

		// The SMTP conversation at Google's server
		const talkStart = this.legsTime;
		if (this.t > talkStart) {
			const shown = Math.min(SMTP.length, Math.floor((this.t - talkStart) / 0.32) + 1);
			const [sx, sy] = this.at(3);
			ctx.font = `13px ${p.code}`;
			for (let i = 0; i < shown; i++) {
				const [line, server] = SMTP[i];
				ctx.fillStyle = server ? p.accent(0.9) : p.ink(0.75);
				ctx.fillText(`${server ? 'S' : 'C'}: ${line}`, sx + 20, sy + 40 + i * 19);
			}
		}

		// The inbox: messages so far, newest on top
		const [ix, iy] = this.at(4);
		for (let k = 0; k < this.delivered; k++) {
			ctx.fillStyle = p.ink(0.14 + k * 0.04);
			ctx.fillRect(ix + 20 + k * 6, iy + 26 - k * 4, 54, 34);
		}
		const landed = !env.moving && env.hop === 4;
		if (landed) tag(ctx, p, 'Delivered', ix + 100 + this.delivered * 6, iy + 42, { ink: p.onAccent, ground: p.accent(1), weight: 700 });
		if (this.copied < 1.6) tag(ctx, p, 'Address copied', ix + 20, iy - 30, { ink: p.accent(1) });

		// The envelope itself, unless it has landed and joined the pile
		if (!landed) {
			const w = 30;
			const h = 20;
			ctx.fillStyle = p.bg;
			ctx.fillRect(env.x - w / 2, env.y - h / 2, w, h);
			ctx.fillStyle = p.amber(0.9);
			ctx.fillRect(env.x - w / 2, env.y - h / 2, w, h);
			ctx.strokeStyle = p.bg;
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.moveTo(env.x - w / 2, env.y - h / 2);
			ctx.lineTo(env.x, env.y + 2);
			ctx.lineTo(env.x + w / 2, env.y - h / 2);
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
	}

	poke(_x: number, _y: number, label: string) {
		if (label === 'copy') {
			this.copied = 0;
			return;
		}
		// Send another as soon as the last one has landed
		if (this.t > this.legsTime + TALK + FINAL) {
			this.t = this.total;
		}
	}
}
