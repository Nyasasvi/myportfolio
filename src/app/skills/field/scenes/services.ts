import { approach, clamp, rng, type Frame, type Palette, type Scene } from '@/app/components/field/types';

/*
 * Backend: requests enter a gateway, pass through two tiers of services to a data store and come
 * back as responses, waiting at each service while it works. A service's fill shows how many
 * requests it is holding. Routes are drawn as right-angled traces. The pointer is a client: while
 * it is in the chapter it sends its own requests in and receives the responses, and a skill row
 * sends a burst from where it was pointed at.
 */

type Kind = 'gate' | 'service' | 'store';
type Service = { u: number; v: number; kind: Kind; x: number; y: number; queue: number; load: number };
type Leg = { pts: number[]; len: number; node: number | null; back: boolean };
type Request = { legs: Leg[]; leg: number; d: number; wait: number; ox: number; oy: number; shown: boolean };
type Status = { x: number; y: number; age: number; code: string };

const NODES: [number, number, Kind][] = [
	[0.14, 0.5, 'gate'],
	[0.4, 0.2, 'service'],
	[0.4, 0.5, 'service'],
	[0.4, 0.8, 'service'],
	[0.64, 0.24, 'service'],
	[0.64, 0.54, 'service'],
	[0.64, 0.82, 'service'],
	[0.86, 0.36, 'store'],
	[0.86, 0.7, 'store'],
];
const LINKS: [number, number][] = [
	[0, 1], [0, 2], [0, 3],
	[1, 4], [1, 5], [2, 5], [2, 6], [3, 6],
	[4, 7], [5, 7], [5, 8], [6, 8],
];
const SPEED = 420;

const polyLength = (pts: number[]) => {
	let len = 0;
	for (let i = 2; i < pts.length; i += 2) len += Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]);
	return len;
};

const pointAt = (pts: number[], d: number): [number, number] => {
	for (let i = 2; i < pts.length; i += 2) {
		const seg = Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]);
		if (d <= seg) {
			const k = seg ? d / seg : 0;
			return [pts[i - 2] + (pts[i] - pts[i - 2]) * k, pts[i - 1] + (pts[i + 1] - pts[i - 1]) * k];
		}
		d -= seg;
	}
	return [pts[pts.length - 2], pts[pts.length - 1]];
};

export class ServicesScene implements Scene {
	private nodes: Service[] = [];
	private routes: number[][] = [];
	private requests: Request[] = [];
	private statuses: Status[] = [];
	private pending: { at: number; x: number; y: number }[] = [];
	private vertical = false;
	private w = 0;
	private h = 0;
	private clock = 0;
	private nextAmbient = 0;
	private nextPointer = 0;
	private bw = 56;
	private bh = 30;
	private rand = rng(5);

	resize(w: number, h: number) {
		this.w = w;
		this.h = h;
		this.vertical = w < 700 && h > w;
		this.bw = this.vertical ? 44 : clamp(w * 0.045, 44, 68);
		this.bh = this.vertical ? 26 : 30;
		this.nodes = NODES.map(([u, v, kind]) => {
			const [x, y] = this.place(u, v);
			return { u, v, kind, x, y, queue: 0, load: 0 };
		});
		this.routes = LINKS.map(([a, b]) => this.route(this.nodes[a], this.nodes[b]));
		this.requests = [];
		this.statuses = [];
	}

	private place(u: number, v: number): [number, number] {
		return this.vertical
			? [this.w * (0.12 + v * 0.76), this.h * (0.06 + u * 0.9)]
			: [this.w * (0.03 + u * 0.94), this.h * (0.1 + v * 0.8)];
	}

	/** Right-angled route: out along the flow, across at the midpoint, then in */
	private route(a: Service, b: Service) {
		if (this.vertical) {
			const y0 = a.y + this.bh / 2;
			const y1 = b.y - this.bh / 2;
			const mid = (y0 + y1) / 2;
			return [a.x, y0, a.x, mid, b.x, mid, b.x, y1];
		}
		const x0 = a.x + this.bw / 2;
		const x1 = b.x - this.bw / 2;
		const mid = (x0 + x1) / 2;
		return [x0, a.y, mid, a.y, mid, b.y, x1, b.y];
	}

	private spawn(ox: number, oy: number, shown: boolean) {
		if (this.requests.length > 160) return;
		const pick = (from: number) => {
			const options = LINKS.map((l, i) => ({ l, i })).filter(({ l }) => l[0] === from);
			return options[Math.floor(this.rand() * options.length)];
		};
		const gate = this.nodes[0];
		const entryEnd = this.vertical ? [gate.x, gate.y - this.bh / 2] : [gate.x - this.bw / 2, gate.y];
		const entry = [ox, oy, entryEnd[0], entryEnd[1]];
		const legs: Leg[] = [{ pts: entry, len: polyLength(entry), node: 0, back: false }];
		const hops: number[] = [];
		let at = 0;
		while (at < 7) {
			const next = pick(at);
			if (!next) break;
			hops.push(next.i);
			at = next.l[1];
			legs.push({ pts: this.routes[next.i], len: polyLength(this.routes[next.i]), node: at, back: false });
		}
		for (let i = hops.length - 1; i >= 0; i--) {
			const pts = this.routes[hops[i]];
			const rev: number[] = [];
			for (let k = pts.length - 2; k >= 0; k -= 2) rev.push(pts[k], pts[k + 1]);
			legs.push({ pts: rev, len: polyLength(rev), node: LINKS[hops[i]][0], back: true });
		}
		const out = [entryEnd[0], entryEnd[1], ox, oy];
		legs.push({ pts: out, len: polyLength(out), node: null, back: true });
		this.requests.push({ legs, leg: 0, d: 0, wait: 0, ox, oy, shown });
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		this.clock += dt;
		if (f.intro > 0.6) {
			this.nextAmbient -= dt;
			if (this.nextAmbient <= 0) {
				this.nextAmbient = 0.22 + this.rand() * 0.3;
				const gate = this.nodes[0];
				// Only some background traffic reports its status, so the codes stay readable
				const shown = this.rand() < 0.25;
				if (this.vertical) this.spawn(gate.x + (this.rand() - 0.5) * this.w * 0.5, -10, shown);
				else this.spawn(-10, gate.y + (this.rand() - 0.5) * this.h * 0.6, shown);
			}
			if (pointer.active) {
				this.nextPointer -= dt;
				if (this.nextPointer <= 0) {
					this.nextPointer = 0.3;
					this.spawn(pointer.x, pointer.y, true);
				}
			}
		}
		for (let i = this.pending.length - 1; i >= 0; i--) {
			if (this.pending[i].at > this.clock) continue;
			this.spawn(this.pending[i].x, this.pending[i].y, true);
			this.pending.splice(i, 1);
		}
		for (let i = this.requests.length - 1; i >= 0; i--) {
			const r = this.requests[i];
			if (r.wait > 0) {
				r.wait -= dt;
				if (r.wait <= 0) {
					const node = r.legs[r.leg].node;
					if (node !== null) this.nodes[node].queue--;
					r.leg++;
					r.d = 0;
				}
				continue;
			}
			const leg = r.legs[r.leg];
			r.d += SPEED * dt;
			if (r.d < leg.len) continue;
			if (leg.node === null) {
				if (r.shown) this.statuses.push({ x: r.ox, y: r.oy, age: 0, code: this.rand() < 0.08 ? '201' : this.rand() < 0.06 ? '304' : '200' });
				this.requests.splice(i, 1);
				continue;
			}
			const kind = this.nodes[leg.node].kind;
			// Stores take longest; on the way back a service only passes the response on
			r.wait = leg.back ? 0.03 : kind === 'store' ? 0.22 + this.rand() * 0.25 : 0.06 + this.rand() * 0.16;
			this.nodes[leg.node].queue++;
		}
		for (const n of this.nodes) n.load = approach(n.load, n.queue, 8, dt);
		for (let i = this.statuses.length - 1; i >= 0; i--) {
			this.statuses[i].age += dt;
			if (this.statuses[i].age > 1.3) this.statuses.splice(i, 1);
		}
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const traces = clamp(f.intro * 1.6, 0, 1);
		ctx.lineWidth = 1;
		ctx.strokeStyle = p.ink(0.13 * traces);
		ctx.beginPath();
		for (const pts of this.routes) {
			ctx.moveTo(pts[0], pts[1]);
			for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
		}
		ctx.stroke();

		const { bw, bh } = this;
		this.nodes.forEach((n, i) => {
			const a = clamp(f.intro * 2.2 - (n.u * 1.2 + i * 0.02), 0, 1);
			if (a <= 0) return;
			const w = n.kind === 'gate' ? (this.vertical ? bw * 2.4 : bw) : bw;
			const h = n.kind === 'gate' ? (this.vertical ? bh : bh * 3.2) : bh;
			const x = n.x - w / 2;
			const y = n.y - h / 2;
			ctx.globalAlpha = a;
			ctx.fillStyle = p.bg;
			ctx.fillRect(x, y, w, h);
			ctx.fillStyle = p.ink(0.1);
			ctx.fillRect(x, y, w, h);
			// How full it is: up to four requests waiting fill the box
			const fill = clamp(n.load / 4, 0, 1);
			if (fill > 0.01) {
				ctx.fillStyle = p.accent(0.55);
				ctx.fillRect(x, y + h * (1 - fill), w, h * fill);
			}
			ctx.strokeStyle = p.ink(0.3);
			ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
			if (n.kind === 'store') {
				ctx.strokeStyle = p.ink(0.22);
				ctx.beginPath();
				ctx.moveTo(x, y + h / 3);
				ctx.lineTo(x + w, y + h / 3);
				ctx.moveTo(x, y + (2 * h) / 3);
				ctx.lineTo(x + w, y + (2 * h) / 3);
				ctx.stroke();
			}
		});
		ctx.globalAlpha = 1;

		// Requests in the ink, responses in the accent
		for (const back of [false, true]) {
			ctx.fillStyle = back ? p.accent(0.95) : p.ink(0.8);
			for (const r of this.requests) {
				const leg = r.legs[r.leg];
				if (!leg || leg.back !== back || r.wait > 0) continue;
				const [x, y] = pointAt(leg.pts, r.d);
				ctx.fillRect(x - 2.5, y - 2.5, 5, 5);
			}
		}

		ctx.font = `500 13px ${p.body}`;
		ctx.textAlign = 'center';
		for (const s of this.statuses) {
			const k = s.age / 1.3;
			ctx.fillStyle = p.accent(0.85 * (1 - k));
			ctx.fillText(s.code, clamp(s.x, 18, f.w - 18), clamp(s.y, 24, f.h - 8) - 10 - k * 18);
		}
		ctx.textAlign = 'left';
	}

	poke(x: number, y: number) {
		for (let i = 0; i < 5; i++) this.pending.push({ at: this.clock + i * 0.07, x, y });
	}
}
