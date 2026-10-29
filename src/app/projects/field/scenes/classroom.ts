import { clamp, easeOut, rng, type Frame, type Palette, type Scene, type Zone } from '@/app/components/field/types';
import { stageFor, tag, text, type Stage } from '../stage';

/*
 * Canvas LMS Clone: a class kept live over WebSockets. Every seat holds an open connection to the
 * server. When an assignment or announcement is posted it is pushed down every connection at once
 * and each seat's unread count goes up; students hand work in, which travels up to the server, and
 * a grade comes back down to that seat; a reply in a discussion goes up and out to the seats in its
 * group. Pointing at a seat posts a reply from it; the WebSockets row pushes an announcement, the
 * React and Redux rows hand work in.
 */

type Seat = { x: number; y: number; unread: number; flash: number; grade: string; gradeT: number; lastReply: number };
type Packet = { seat: number; t: number; up: boolean; kind: 'push' | 'work' | 'grade' | 'reply'; delay: number; grade?: string };

const GRADES = ['A', 'A-', 'B+', 'A', 'B', 'A-'];
const POSTS = ['Assignment posted', 'Announcement', 'Quiz opens', 'Grades released'];

export class ClassroomScene implements Scene {
	private s: Stage = { x: 0, y: 0, w: 0, h: 0 };
	private seats: Seat[] = [];
	private cols = 8;
	private size = 26;
	private server = { x: 0, y: 0, w: 0, h: 0 };
	private packets: Packet[] = [];
	private nextEvent = 0.6;
	private banner = '';
	private bannerT = 9;
	private handedIn = 0;
	private clock = 0;
	private rand = rng(37);

	resize(w: number, h: number, zone: Zone) {
		this.s = stageFor(w, h, zone);
		const { s } = this;
		this.server = { x: s.x + s.w / 2 - 90, y: s.y + 20, w: 180, h: 38 };
		const top = this.server.y + this.server.h + Math.max(70, s.h * 0.16);
		const room = s.y + s.h - 30 - top;
		this.cols = clamp(Math.floor(s.w / 58), 5, 10);
		const pitchX = s.w / this.cols;
		const rows = clamp(Math.floor(room / 64), 3, 6);
		const pitchY = room / rows;
		this.size = clamp(Math.min(pitchX, pitchY) * 0.42, 16, 28);
		const old = this.seats;
		this.seats = [];
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < this.cols; c++) {
				const prev = old[this.seats.length];
				this.seats.push({ x: s.x + (c + 0.5) * pitchX, y: top + (r + 0.5) * pitchY, unread: prev?.unread ?? 0, flash: 0, grade: '', gradeT: 9, lastReply: -9 });
			}
		}
		this.packets = [];
	}

	private get hub(): [number, number] {
		return [this.server.x + this.server.w / 2, this.server.y + this.server.h];
	}

	private push(label: string, only?: number[]) {
		this.banner = label;
		this.bannerT = 0;
		const [hx, hy] = this.hub;
		this.seats.forEach((seat, i) => {
			if (only && !only.includes(i)) return;
			// Farther seats hear a moment later
			this.packets.push({ seat: i, t: 0, up: false, kind: only ? 'reply' : 'push', delay: Math.hypot(seat.x - hx, seat.y - hy) / 1400 });
		});
	}

	private handIn(i = Math.floor(this.rand() * this.seats.length)) {
		this.packets.push({ seat: i, t: 0, up: true, kind: 'work', delay: 0 });
	}

	private reply(i: number) {
		this.seats[i].lastReply = this.clock;
		this.packets.push({ seat: i, t: 0, up: true, kind: 'reply', delay: 0 });
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		this.clock += dt;
		this.bannerT += dt;
		if (pointer.active) {
			const i = this.seats.findIndex((s) => Math.abs(pointer.x - s.x) < this.size && Math.abs(pointer.y - s.y) < this.size);
			if (i >= 0 && this.clock - this.seats[i].lastReply > 0.8) this.reply(i);
		}
		if (f.intro > 0.6) {
			this.nextEvent -= dt;
			if (this.nextEvent <= 0) {
				this.nextEvent = 0.45 + this.rand() * 0.5;
				const r = this.rand();
				if (r < 0.16) this.push(POSTS[Math.floor(this.rand() * POSTS.length)]);
				else if (r < 0.7) this.handIn();
				else if (r < 0.85) this.reply(Math.floor(this.rand() * this.seats.length));
				else {
					// Students read: some unread counts clear
					for (const seat of this.seats) if (seat.unread && this.rand() < 0.3) seat.unread = 0;
				}
			}
		}
		for (let i = this.packets.length - 1; i >= 0; i--) {
			const pk = this.packets[i];
			if (pk.delay > 0) {
				pk.delay -= dt;
				continue;
			}
			pk.t += dt / (pk.kind === 'grade' ? 0.7 : 0.55);
			if (pk.t < 1) continue;
			const seat = this.seats[pk.seat];
			this.packets.splice(i, 1);
			if (!seat) continue;
			if (!pk.up) {
				seat.flash = 1;
				if (pk.kind === 'grade') {
					seat.grade = pk.grade ?? 'A';
					seat.gradeT = 0;
				} else seat.unread = Math.min(9, seat.unread + 1);
			} else if (pk.kind === 'work') {
				this.handedIn++;
				// Graded and sent back a little later
				this.packets.push({ seat: pk.seat, t: 0, up: false, kind: 'grade', delay: 0.8 + this.rand() * 1.4, grade: GRADES[Math.floor(this.rand() * GRADES.length)] });
			} else if (pk.kind === 'reply') {
				const row = Math.floor(pk.seat / this.cols);
				const group = this.seats.map((_, k) => k).filter((k) => Math.floor(k / this.cols) === row && k !== pk.seat);
				this.push('New reply', group);
			}
		}
		for (const seat of this.seats) {
			seat.flash = Math.max(0, seat.flash - dt * 2);
			seat.gradeT += dt;
		}
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const a = clamp(f.intro * 1.6, 0, 1);
		ctx.globalAlpha = a;
		const [hx, hy] = this.hub;

		// One open connection per seat
		ctx.strokeStyle = p.ink(0.08);
		ctx.lineWidth = 1;
		ctx.beginPath();
		for (const seat of this.seats) {
			ctx.moveTo(hx, hy);
			ctx.lineTo(seat.x, seat.y - this.size / 2);
		}
		ctx.stroke();

		for (const pk of this.packets) {
			if (pk.delay > 0) continue;
			const seat = this.seats[pk.seat];
			if (!seat) continue;
			const k = easeOut(pk.t);
			const from = pk.up ? [seat.x, seat.y - this.size / 2] : [hx, hy];
			const to = pk.up ? [hx, hy] : [seat.x, seat.y - this.size / 2];
			const x = from[0] + (to[0] - from[0]) * k;
			const y = from[1] + (to[1] - from[1]) * k;
			if (pk.kind === 'grade') tag(ctx, p, pk.grade ?? 'A', x, y, { size: 12, align: 'center', ink: p.onAccent, ground: p.accent(1), weight: 700 });
			else if (pk.kind === 'work') {
				ctx.fillStyle = p.ink(0.85);
				ctx.fillRect(x - 4, y - 5, 8, 10);
			} else {
				ctx.fillStyle = pk.kind === 'reply' ? p.amber(0.9) : p.accent(0.95);
				ctx.fillRect(x - 2.5, y - 2.5, 5, 5);
			}
		}

		const s = this.size;
		for (const seat of this.seats) {
			const lift = seat.flash;
			ctx.fillStyle = p.bg;
			ctx.fillRect(seat.x - s / 2, seat.y - s / 2, s, s);
			ctx.fillStyle = lift ? p.accent(0.3 + lift * 0.6) : p.ink(0.22);
			ctx.fillRect(seat.x - s / 2, seat.y - s / 2, s, s);
			if (seat.unread) {
				ctx.fillStyle = p.accent(1);
				ctx.beginPath();
				ctx.arc(seat.x + s / 2, seat.y - s / 2, 8, 0, Math.PI * 2);
				ctx.fill();
				text(ctx, p, String(seat.unread), seat.x + s / 2, seat.y - s / 2 + 4, p.onAccent, 11, 'center');
			}
			if (seat.gradeT < 1.6) {
				ctx.globalAlpha = a * (1 - clamp((seat.gradeT - 1) / 0.6, 0, 1));
				text(ctx, p, seat.grade, seat.x, seat.y + s / 2 + 16, p.accent(1), 13, 'center');
				ctx.globalAlpha = a;
			}
		}

		// The server, with what it is holding open
		const sv = this.server;
		ctx.fillStyle = p.bg;
		ctx.fillRect(sv.x, sv.y, sv.w, sv.h);
		ctx.fillStyle = p.ink(0.12);
		ctx.fillRect(sv.x, sv.y, sv.w, sv.h);
		ctx.strokeStyle = p.ink(0.35);
		ctx.strokeRect(sv.x + 0.5, sv.y + 0.5, sv.w - 1, sv.h - 1);
		text(ctx, p, 'Course server', sv.x + 12, sv.y + 24, p.ink(0.9), 13);
		text(ctx, p, `${this.seats.length} open`, sv.x + sv.w - 12, sv.y + 24, p.muted(0.85), 12, 'right');
		text(ctx, p, `${this.handedIn} handed in`, sv.x + sv.w + 16, sv.y + 24, p.muted(0.85), 12);
		if (this.bannerT < 1.6) {
			ctx.globalAlpha = a * (1 - clamp((this.bannerT - 1.1) / 0.5, 0, 1));
			tag(ctx, p, this.banner, sv.x - 16, sv.y + sv.h / 2, { align: 'right', ink: p.accent(1) });
		}
		ctx.globalAlpha = 1;
	}

	poke(_x: number, _y: number, label: string) {
		if (/react|redux/i.test(label)) {
			for (let k = 0; k < 4; k++) this.handIn();
			return;
		}
		this.push(/websocket/i.test(label) ? 'Announcement' : POSTS[Math.floor(this.rand() * POSTS.length)]);
	}
}
