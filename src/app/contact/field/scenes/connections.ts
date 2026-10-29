import { approach, clamp, rng, type Frame, type Palette, type Scene, type Zone } from '@/app/components/field/types';
import { stageFor, tag, text, type Stage } from '@/app/components/field/stage';

/*
 * LinkedIn: a professional network drawn in degrees, the way LinkedIn counts them. Yasasvi sits at the
 * centre; first-degree connections ring him, second-degree around them, third-degree at the edge.
 * Introductions travel inward from the edge, connection to connection, until they reach the centre.
 * The pointer is you: it finds the nearest person in the network and lights the path from you to
 * Yasasvi; the LinkedIn link sends several introductions at once.
 */

type Person = { ring: number; angle: number; parent: number; x: number; y: number; flash: number };
type Intro = { path: number[]; t: number };

const RINGS = [0, 0.32, 0.62, 0.93];
const COUNTS = [1, 10, 20, 32];
const STEP = 0.35; // seconds per hop inward

export class ConnectionsScene implements Scene {
	private s: Stage = { x: 0, y: 0, w: 0, h: 0 };
	private people: Person[] = [];
	private intros: Intro[] = [];
	private cx = 0;
	private cy = 0;
	private R = 100;
	private next = 0.4;
	private you: { x: number; y: number; near: number; on: number } = { x: 0, y: 0, near: -1, on: 0 };
	private rand = rng(53);

	resize(w: number, h: number, zone: Zone) {
		this.s = stageFor(w, h, zone);
		const { s } = this;
		this.cx = s.x + s.w / 2;
		this.cy = s.y + s.h / 2;
		this.R = (Math.min(s.w, s.h) / 2) * 0.9;
		const rand = rng(61);
		this.people = [];
		COUNTS.forEach((n, ring) => {
			for (let i = 0; i < n; i++) {
				const angle = ring ? ((i + 0.5 + (rand() - 0.5) * 0.6) / n) * Math.PI * 2 : 0;
				this.people.push({ ring, angle, parent: -1, x: 0, y: 0, flash: 0 });
			}
		});
		// Everyone is introduced through the nearest person one ring in
		this.people.forEach((pp, i) => {
			if (pp.ring === 0) return;
			let best = 0;
			let bestD = Infinity;
			this.people.forEach((q, j) => {
				if (q.ring !== pp.ring - 1) return;
				const d = Math.abs(Math.atan2(Math.sin(pp.angle - q.angle), Math.cos(pp.angle - q.angle)));
				if (d < bestD) { bestD = d; best = j; }
			});
			this.people[i].parent = best;
		});
		this.place();
		this.intros = [];
	}

	private place() {
		for (const pp of this.people) {
			const r = RINGS[pp.ring] * this.R;
			pp.x = this.cx + Math.cos(pp.angle) * r;
			pp.y = this.cy + Math.sin(pp.angle) * r * 0.92;
		}
	}

	private pathFrom(i: number) {
		const path = [i];
		while (this.people[path[path.length - 1]].parent >= 0) path.push(this.people[path[path.length - 1]].parent);
		return path;
	}

	private introduce() {
		const outer = this.people.map((pp, i) => (pp.ring === 3 ? i : -1)).filter((i) => i >= 0);
		this.intros.push({ path: this.pathFrom(outer[Math.floor(this.rand() * outer.length)]), t: 0 });
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		// The network turns slowly, as if seen from above
		for (const pp of this.people) if (pp.ring) pp.angle += dt * 0.02 * (pp.ring % 2 ? 1 : -1);
		this.place();
		if (f.intro > 0.6) {
			this.next -= dt;
			if (this.next <= 0) {
				this.next = 0.9 + this.rand() * 0.8;
				this.introduce();
			}
		}
		for (let i = this.intros.length - 1; i >= 0; i--) {
			const it = this.intros[i];
			const before = Math.floor(it.t / STEP);
			it.t += dt;
			const now = Math.floor(it.t / STEP);
			if (now !== before && now < it.path.length) this.people[it.path[now]].flash = 1;
			if (it.t > STEP * (it.path.length + 1)) this.intros.splice(i, 1);
		}
		for (const pp of this.people) pp.flash = Math.max(0, pp.flash - dt * 1.4);

		const inside = pointer.active && pointer.x > this.s.x && pointer.x < this.s.x + this.s.w && pointer.y > this.s.y && pointer.y < this.s.y + this.s.h;
		this.you.on = approach(this.you.on, inside ? 1 : 0, 8, dt);
		if (inside) {
			this.you.x = pointer.x;
			this.you.y = pointer.y;
			let best = -1;
			let bestD = Infinity;
			this.people.forEach((pp, i) => {
				if (!pp.ring) return;
				const d = Math.hypot(pp.x - pointer.x, pp.y - pointer.y);
				if (d < bestD) { bestD = d; best = i; }
			});
			this.you.near = best;
		}
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const a = clamp(f.intro * 1.6, 0, 1);
		ctx.globalAlpha = a;
		const R = this.R;

		// Degree rings, named as LinkedIn names them
		ctx.strokeStyle = p.ink(0.06);
		ctx.lineWidth = 1;
		['1st', '2nd', '3rd'].forEach((name, k) => {
			const r = RINGS[k + 1] * R;
			ctx.beginPath();
			ctx.ellipse(this.cx, this.cy, r, r * 0.92, 0, 0, Math.PI * 2);
			ctx.stroke();
			text(ctx, p, name, this.cx, this.cy - r * 0.92 - 8, p.muted(0.7), 12, 'center');
		});

		ctx.strokeStyle = p.ink(0.12);
		ctx.beginPath();
		for (const pp of this.people) {
			if (pp.parent < 0) continue;
			const q = this.people[pp.parent];
			ctx.moveTo(pp.x, pp.y);
			ctx.lineTo(q.x, q.y);
		}
		ctx.stroke();

		// Introductions moving inward
		ctx.strokeStyle = p.accent(0.85);
		ctx.lineWidth = 2;
		for (const it of this.intros) {
			const k = it.t / STEP;
			const hop = Math.floor(k);
			if (hop >= it.path.length - 1) continue;
			const from = this.people[it.path[hop]];
			const to = this.people[it.path[hop + 1]];
			const e = k - hop;
			ctx.beginPath();
			ctx.moveTo(from.x, from.y);
			ctx.lineTo(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e);
			ctx.stroke();
		}

		// Your path in, when the pointer is here
		const near = this.you.near;
		if (this.you.on > 0.02 && near >= 0) {
			ctx.globalAlpha = a * this.you.on;
			const path = this.pathFrom(near);
			ctx.strokeStyle = p.accent(0.9);
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(this.you.x, this.you.y);
			for (const i of path) ctx.lineTo(this.people[i].x, this.people[i].y);
			ctx.stroke();
			ctx.fillStyle = p.bg;
			ctx.fillRect(this.you.x - 8, this.you.y - 8, 16, 16);
			ctx.strokeStyle = p.accent(1);
			ctx.strokeRect(this.you.x - 7, this.you.y - 7, 14, 14);
			tag(ctx, p, 'You', this.you.x + 14, this.you.y, { ink: p.accent(1) });
			ctx.globalAlpha = a;
		}

		const lit = new Set<number>();
		if (this.you.on > 0.5 && near >= 0) this.pathFrom(near).forEach((i) => lit.add(i));
		this.people.forEach((pp, i) => {
			if (!pp.ring) return;
			const size = 9 - pp.ring * 1.5 + pp.flash * 5;
			ctx.fillStyle = pp.flash > 0.05 || lit.has(i) ? p.accent(0.5 + pp.flash * 0.5) : p.ink(0.55 - pp.ring * 0.1);
			ctx.fillRect(pp.x - size / 2, pp.y - size / 2, size, size);
		});
		const centre = this.people[0];
		const size = 18 + centre.flash * 6;
		ctx.fillStyle = p.accent(1);
		ctx.fillRect(this.cx - size / 2, this.cy - size / 2, size, size);
		tag(ctx, p, 'Yasasvi', this.cx, this.cy + 26, { align: 'center', weight: 700 });
		ctx.globalAlpha = 1;
	}

	poke() {
		for (let k = 0; k < 3; k++) this.introduce();
	}
}
