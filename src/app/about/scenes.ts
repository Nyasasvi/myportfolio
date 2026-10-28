/*
 * Background scenes for the About page, one per chapter, drawn with Canvas 2D. Each one shows
 * something from that employer's world in plain shapes (no logos or brand marks):
 *
 *   boots    Twisted X, a footwear company: boot prints walking, shipments along a route
 *   market   JPMorgan Chase, AI research in markets: a live candlestick tape
 *   feed     Colombo AI, a social platform: likes and comments rising like a live feed
 *   network  UT Arlington, intelligent systems: a neural network with signals firing
 *   stream   HCL Technologies, data pipelines: packets streaming through a processing column
 *
 * Scenes draw inside a region (the right half on desktop, the whole screen on a phone) so the
 * text column stays clear. Coordinates are CSS pixels; the stage applies the device scale.
 */

export type RGB = [number, number, number];
export type Palette = { ink: RGB; accent: RGB; signal: RGB };
export type Region = { x0: number; y0: number; x1: number; y1: number };

export interface Scene {
	resize(r: Region): void;
	/** Advance by dt seconds */
	step(dt: number): void;
	draw(ctx: CanvasRenderingContext2D, p: Palette, alpha: number): void;
	/** Pointer position in CSS pixels; inside is false when the pointer is outside the region */
	pointer(x: number, y: number, inside: boolean): void;
	/** A click or tap, or the chapter's own button, at a point */
	tap?(x: number, y: number): void;
}

export type SceneId = 'boots' | 'market' | 'feed' | 'network' | 'stream';

const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a))})`;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const gauss = () => Math.random() + Math.random() + Math.random() - 1.5;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const w = (r: Region) => r.x1 - r.x0;
const h = (r: Region) => r.y1 - r.y0;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, rw: number, rh: number, rad: number) {
	if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, rw, rh, rad);
	else ctx.rect(x, y, rw, rh);
}

/* ---------------------------------------------------------------- Twisted X: boots */

type Print = { x: number; y: number; a: number; age: number };

class BootsScene implements Scene {
	private r: Region = { x0: 0, y0: 0, x1: 1, y1: 1 };
	private ready = false;
	private x = 0;
	private y = 0;
	private a = -0.5;
	private side = 1;
	private timer = 0;
	private t = 0;
	private prints: Print[] = [];
	private target: { x: number; y: number; life: number } | null = null;
	private static LIFE = 7;

	resize(r: Region) {
		this.r = r;
		if (!this.ready) {
			this.x = r.x0 + w(r) * 0.25;
			this.y = r.y1 - h(r) * 0.2;
			this.ready = true;
		}
		this.x = clamp(this.x, r.x0, r.x1);
		this.y = clamp(this.y, r.y0, r.y1);
	}

	pointer(x: number, y: number, inside: boolean) {
		// The walker heads for the pointer while it is in the region, then wanders again
		if (inside) this.target = { x, y, life: 2.5 };
	}

	step(dt: number) {
		this.t += dt;
		for (const p of this.prints) p.age += dt;
		this.prints = this.prints.filter((p) => p.age < BootsScene.LIFE);
		if (this.target) this.target.life -= dt;
		if (this.target && this.target.life <= 0) this.target = null;
		this.timer += dt;
		while (this.timer >= 0.42) {
			this.timer -= 0.42;
			this.walk();
		}
	}

	private walk() {
		const r = this.r;
		const m = 70;
		let goal = this.a + rand(-0.55, 0.55);
		if (this.target) {
			const d = Math.hypot(this.target.x - this.x, this.target.y - this.y);
			if (d < 40) this.target = null;
			else goal = Math.atan2(this.target.y - this.y, this.target.x - this.x);
		}
		if (this.x < r.x0 + m || this.x > r.x1 - m || this.y < r.y0 + m || this.y > r.y1 - m) {
			goal = Math.atan2((r.y0 + r.y1) / 2 - this.y, (r.x0 + r.x1) / 2 - this.x);
		}
		this.a += clamp(wrapAngle(goal - this.a), -0.4, 0.4);
		const stride = 30;
		this.x += Math.cos(this.a) * stride;
		this.y += Math.sin(this.a) * stride;
		this.side = -this.side;
		const off = 10 * this.side;
		this.prints.push({
			x: this.x + Math.cos(this.a + Math.PI / 2) * off,
			y: this.y + Math.sin(this.a + Math.PI / 2) * off,
			a: this.a,
			age: 0,
		});
	}

	// A supply route across the region: a cubic curve shipments travel along
	private routePoint(t: number) {
		const r = this.r;
		const P = [
			[r.x0 + w(r) * 0.04, r.y0 + h(r) * 0.86],
			[r.x0 + w(r) * 0.42, r.y0 + h(r) * 0.98],
			[r.x0 + w(r) * 0.52, r.y0 + h(r) * 0.12],
			[r.x0 + w(r) * 0.97, r.y0 + h(r) * 0.2],
		];
		const u = 1 - t;
		const x = u * u * u * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t * t * t * P[3][0];
		const y = u * u * u * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t * t * t * P[3][1];
		return [x, y];
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, alpha: number) {
		// Route as a line of dots
		ctx.fillStyle = rgba(p.ink, 0.16 * alpha);
		for (let i = 0; i <= 90; i++) {
			const [x, y] = this.routePoint(i / 90);
			ctx.beginPath();
			ctx.arc(x, y, 1.6, 0, Math.PI * 2);
			ctx.fill();
		}
		// Shipments: small crates moving along it
		for (let i = 0; i < 5; i++) {
			const t = (this.t * 0.035 + i / 5) % 1;
			const [x, y] = this.routePoint(t);
			const fade = Math.min(1, t * 8, (1 - t) * 8);
			ctx.fillStyle = rgba(p.accent, 0.7 * alpha * fade);
			ctx.fillRect(x - 6, y - 6, 12, 12);
			ctx.fillStyle = rgba(p.ink, 0.35 * alpha * fade);
			ctx.fillRect(x - 6, y - 1, 12, 2);
		}
		// Boot prints: a forefoot and a separate heel, rotated to the direction of travel
		for (const pr of this.prints) {
			const life = BootsScene.LIFE;
			const fade = Math.min(1, pr.age / 0.12) * (1 - pr.age / life);
			ctx.save();
			ctx.translate(pr.x, pr.y);
			ctx.rotate(pr.a);
			ctx.fillStyle = rgba(p.ink, 0.42 * alpha * fade);
			ctx.beginPath();
			ctx.ellipse(7, 0, 11, 7, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			roundRect(ctx, -15, -5.5, 9, 11, 3);
			ctx.fill();
			// Tread: two notches cut from the sole
			ctx.fillStyle = rgba(p.ink, 0.25 * alpha * fade);
			ctx.fillRect(4, -5, 2, 10);
			ctx.fillRect(10, -4, 2, 8);
			ctx.restore();
		}
	}
}

/* ---------------------------------------------------------------- JPMorgan: market */

type Candle = { o: number; h: number; l: number; c: number };

class MarketScene implements Scene {
	private r: Region = { x0: 0, y0: 0, x1: 1, y1: 1 };
	private candles: Candle[] = [];
	private price = 100;
	private shift = 0;
	private lo = 90;
	private hi = 110;
	private px = -1;
	private static CW = 9;
	private static GAP = 6;
	private static PERIOD = 0.75;

	private next(): Candle {
		const o = this.price;
		let p = o;
		let hi = o;
		let lo = o;
		for (let i = 0; i < 6; i++) {
			p += gauss() * 0.9 + (100 - p) * 0.02;
			hi = Math.max(hi, p);
			lo = Math.min(lo, p);
		}
		this.price = p;
		return { o, h: hi + Math.random() * 0.4, l: lo - Math.random() * 0.4, c: p };
	}

	resize(r: Region) {
		this.r = r;
		const need = Math.ceil(w(r) / (MarketScene.CW + MarketScene.GAP)) + 2;
		while (this.candles.length < need) this.candles.push(this.next());
		if (this.candles.length > need) this.candles = this.candles.slice(-need);
		this.fitRange(1);
	}

	pointer(x: number, _y: number, inside: boolean) {
		this.px = inside ? x : -1;
	}

	private fitRange(k: number) {
		let lo = Infinity;
		let hi = -Infinity;
		for (const c of this.candles) {
			lo = Math.min(lo, c.l);
			hi = Math.max(hi, c.h);
		}
		const pad = (hi - lo) * 0.12 + 0.5;
		this.lo += (lo - pad - this.lo) * k;
		this.hi += (hi + pad - this.hi) * k;
	}

	step(dt: number) {
		this.shift += dt / MarketScene.PERIOD;
		while (this.shift >= 1) {
			this.shift -= 1;
			this.candles.push(this.next());
			this.candles.shift();
		}
		// The newest candle is still trading: its close keeps moving
		const last = this.candles[this.candles.length - 1];
		last.c += gauss() * 0.25;
		last.h = Math.max(last.h, last.c);
		last.l = Math.min(last.l, last.c);
		this.fitRange(Math.min(1, dt * 2));
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, alpha: number) {
		const r = this.r;
		const step = MarketScene.CW + MarketScene.GAP;
		const top = r.y0 + h(r) * 0.12;
		const span = h(r) * 0.76;
		const Y = (v: number) => top + ((this.hi - v) / (this.hi - this.lo)) * span;
		const n = this.candles.length;
		const xs: number[] = [];
		for (let i = 0; i < n; i++) {
			const c = this.candles[i];
			const x = r.x1 - (n - i - 1 + this.shift) * step - MarketScene.CW;
			xs.push(x + MarketScene.CW / 2);
			if (x < r.x0 - step) continue;
			const up = c.c >= c.o;
			const hot = this.px >= x - MarketScene.GAP / 2 && this.px < x + MarketScene.CW + MarketScene.GAP / 2;
			const col = up ? p.signal : p.accent;
			const a = (hot ? 0.95 : 0.5) * alpha * Math.min(1, (x - r.x0) / 80);
			ctx.fillStyle = rgba(col, a);
			ctx.fillRect(x + MarketScene.CW / 2 - 0.75, Y(c.h), 1.5, Math.max(1, Y(c.l) - Y(c.h)));
			const yo = Y(c.o);
			const yc = Y(c.c);
			ctx.fillRect(x, Math.min(yo, yc), MarketScene.CW, Math.max(2, Math.abs(yo - yc)));
		}
		// Eight-candle moving average
		ctx.strokeStyle = rgba(p.ink, 0.3 * alpha);
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		let started = false;
		for (let i = 7; i < n; i++) {
			let s = 0;
			for (let k = i - 7; k <= i; k++) s += this.candles[k].c;
			const x = xs[i];
			if (x < r.x0) continue;
			const y = Y(s / 8);
			if (!started) {
				ctx.moveTo(x, y);
				started = true;
			} else ctx.lineTo(x, y);
		}
		ctx.stroke();
		// Last price marker on the right edge
		const last = this.candles[n - 1];
		ctx.fillStyle = rgba(last.c >= last.o ? p.signal : p.accent, 0.9 * alpha);
		ctx.fillRect(r.x1 - 4, Y(last.c) - 2, 8, 4);
	}
}

/* ---------------------------------------------------------------- Colombo AI: feed */

type Float = { x: number; y: number; vx: number; vy: number; s: number; heart: boolean; phase: number; age: number };

class FeedScene implements Scene {
	private r: Region = { x0: 0, y0: 0, x1: 1, y1: 1 };
	private items: Float[] = [];
	private spawn = 0;

	resize(r: Region) {
		this.r = r;
	}

	pointer() {}

	tap(x: number, y: number) {
		for (let i = 0; i < 10; i++) {
			this.items.push({ x, y, vx: rand(-90, 90), vy: rand(70, 170), s: rand(10, 18), heart: true, phase: rand(0, 6), age: 0 });
		}
	}

	step(dt: number) {
		const r = this.r;
		this.spawn += dt;
		while (this.spawn > 0.32) {
			this.spawn -= 0.32;
			this.items.push({
				x: rand(r.x0 + 30, r.x1 - 30),
				y: r.y1 + 20,
				vx: 0,
				vy: rand(28, 62),
				s: rand(8, 16),
				heart: Math.random() < 0.62,
				phase: rand(0, 6),
				age: 0,
			});
		}
		for (const it of this.items) {
			it.age += dt;
			it.y -= it.vy * dt;
			it.vx *= Math.pow(0.12, dt);
			it.x += it.vx * dt + Math.sin(it.phase + it.age * 1.6) * 14 * dt;
		}
		this.items = this.items.filter((it) => it.y > r.y0 - 40);
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, alpha: number) {
		const r = this.r;
		for (const it of this.items) {
			const fadeTop = clamp((it.y - r.y0) / (h(r) * 0.3), 0, 1);
			const pop = Math.min(1, it.age / 0.25);
			const s = it.s * (0.6 + 0.4 * pop);
			ctx.save();
			ctx.translate(it.x, it.y);
			if (it.heart) {
				ctx.fillStyle = rgba(p.accent, 0.62 * alpha * fadeTop);
				ctx.beginPath();
				ctx.moveTo(0, s * 0.35);
				ctx.bezierCurveTo(0, s * 0.05, -s * 0.5, s * 0.05, -s * 0.5, s * 0.35);
				ctx.bezierCurveTo(-s * 0.5, s * 0.62, 0, s * 0.75, 0, s * 0.98);
				ctx.bezierCurveTo(0, s * 0.75, s * 0.5, s * 0.62, s * 0.5, s * 0.35);
				ctx.bezierCurveTo(s * 0.5, s * 0.05, 0, s * 0.05, 0, s * 0.35);
				ctx.fill();
			} else {
				// A comment bubble with three dots of typing
				ctx.fillStyle = rgba(p.ink, 0.2 * alpha * fadeTop);
				ctx.beginPath();
				roundRect(ctx, -s, -s * 0.6, s * 2, s * 1.2, s * 0.45);
				ctx.fill();
				ctx.beginPath();
				ctx.moveTo(-s * 0.5, s * 0.55);
				ctx.lineTo(-s * 0.85, s * 0.95);
				ctx.lineTo(-s * 0.1, s * 0.55);
				ctx.fill();
				ctx.fillStyle = rgba(p.ink, 0.45 * alpha * fadeTop);
				for (let k = -1; k <= 1; k++) {
					ctx.beginPath();
					ctx.arc(k * s * 0.45, 0, s * 0.12, 0, Math.PI * 2);
					ctx.fill();
				}
			}
			ctx.restore();
		}
	}
}

/* ---------------------------------------------------------------- UT Arlington: network */

type Node = { x: number; y: number; layer: number; glow: number; last: number };
type Signal = { from: number; to: number; t: number };

class NetworkScene implements Scene {
	private r: Region = { x0: 0, y0: 0, x1: 1, y1: 1 };
	private layers = [4, 6, 6, 3];
	private nodes: Node[] = [];
	private signals: Signal[] = [];
	private timer = 0;
	private clock = 0;
	private ptr: { x: number; y: number } | null = null;

	resize(r: Region) {
		this.r = r;
		const old = this.nodes;
		this.nodes = [];
		this.layers.forEach((count, L) => {
			const x = r.x0 + w(r) * (0.12 + (L / (this.layers.length - 1)) * 0.76);
			for (let i = 0; i < count; i++) {
				const y = r.y0 + h(r) * (0.18 + ((i + 0.5) / count) * 0.64);
				const prev = old[this.nodes.length];
				this.nodes.push({ x, y, layer: L, glow: prev?.glow ?? 0, last: -1 });
			}
		});
	}

	pointer(x: number, y: number, inside: boolean) {
		this.ptr = inside ? { x, y } : null;
	}

	private layerNodes(L: number) {
		const out: number[] = [];
		this.nodes.forEach((n, i) => n.layer === L && out.push(i));
		return out;
	}

	private fire(i: number) {
		const n = this.nodes[i];
		if (this.clock - n.last < 0.35) return;
		n.last = this.clock;
		n.glow = 1;
		const next = this.layerNodes(n.layer + 1);
		if (!next.length) return;
		const count = 1 + Math.floor(Math.random() * 2);
		for (let k = 0; k < count; k++) this.signals.push({ from: i, to: next[Math.floor(Math.random() * next.length)], t: 0 });
	}

	step(dt: number) {
		this.clock += dt;
		this.timer += dt;
		if (this.timer > 0.55) {
			this.timer = 0;
			const inputs = this.layerNodes(0);
			this.fire(inputs[Math.floor(Math.random() * inputs.length)]);
		}
		if (this.ptr) {
			this.nodes.forEach((n, i) => {
				if (Math.hypot(n.x - this.ptr!.x, n.y - this.ptr!.y) < 60) this.fire(i);
			});
		}
		for (const s of this.signals) s.t += dt * 1.5;
		const arrived = this.signals.filter((s) => s.t >= 1);
		this.signals = this.signals.filter((s) => s.t < 1);
		arrived.forEach((s) => {
			if (Math.random() < 0.85) this.fire(s.to);
			else this.nodes[s.to].glow = 1;
		});
		for (const n of this.nodes) n.glow = Math.max(0, n.glow - dt * 1.4);
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, alpha: number) {
		// Connections between neighbouring layers
		ctx.strokeStyle = rgba(p.ink, 0.07 * alpha);
		ctx.lineWidth = 1;
		ctx.beginPath();
		for (const a of this.nodes) {
			for (const b of this.nodes) {
				if (b.layer !== a.layer + 1) continue;
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(b.x, b.y);
			}
		}
		ctx.stroke();
		// Signals in flight
		for (const s of this.signals) {
			const a = this.nodes[s.from];
			const b = this.nodes[s.to];
			const x = a.x + (b.x - a.x) * s.t;
			const y = a.y + (b.y - a.y) * s.t;
			ctx.fillStyle = rgba(p.accent, 0.85 * alpha);
			ctx.beginPath();
			ctx.arc(x, y, 3, 0, Math.PI * 2);
			ctx.fill();
		}
		// Neurons
		for (const n of this.nodes) {
			ctx.fillStyle = rgba(p.ink, 0.28 * alpha);
			ctx.beginPath();
			ctx.arc(n.x, n.y, 7, 0, Math.PI * 2);
			ctx.fill();
			if (n.glow > 0) {
				ctx.fillStyle = rgba(p.accent, n.glow * 0.9 * alpha);
				ctx.beginPath();
				ctx.arc(n.x, n.y, 7 + n.glow * 5, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}
}

/* ---------------------------------------------------------------- HCL: streams */

type Packet = { lane: number; x: number; speed: number; done: boolean };

class StreamScene implements Scene {
	private r: Region = { x0: 0, y0: 0, x1: 1, y1: 1 };
	private lanes = 7;
	private packets: Packet[] = [];
	private spawn: number[] = [];
	private pulse = 0;
	private boost = -1;

	private laneY(i: number) {
		const r = this.r;
		return r.y0 + h(r) * (0.16 + (i / (this.lanes - 1)) * 0.68);
	}

	private get cx() {
		return this.r.x0 + w(this.r) * 0.6;
	}

	resize(r: Region) {
		this.r = r;
		if (!this.spawn.length) this.spawn = Array.from({ length: this.lanes }, () => rand(0, 1));
	}

	pointer(_x: number, y: number, inside: boolean) {
		if (!inside) {
			this.boost = -1;
			return;
		}
		let best = 0;
		for (let i = 1; i < this.lanes; i++) if (Math.abs(this.laneY(i) - y) < Math.abs(this.laneY(best) - y)) best = i;
		this.boost = best;
	}

	step(dt: number) {
		const r = this.r;
		for (let i = 0; i < this.lanes; i++) {
			this.spawn[i] -= dt * (i === this.boost ? 3 : 1);
			if (this.spawn[i] <= 0) {
				this.spawn[i] = rand(0.35, 1.1);
				this.packets.push({ lane: i, x: r.x0 - 20, speed: rand(90, 170), done: false });
			}
		}
		for (const pk of this.packets) {
			pk.x += pk.speed * dt * (pk.lane === this.boost ? 2.4 : 1);
			if (!pk.done && pk.x >= this.cx) {
				pk.done = true;
				this.pulse = Math.min(1, this.pulse + 0.25);
			}
		}
		this.packets = this.packets.filter((pk) => pk.x < r.x1 + 30);
		this.pulse = Math.max(0, this.pulse - dt * 1.2);
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, alpha: number) {
		const r = this.r;
		// Processing column: a stack of storage blocks that brightens as packets arrive
		const blocks = 9;
		const bs = Math.min(16, (h(r) * 0.68) / blocks - 4);
		for (let i = 0; i < blocks; i++) {
			const y = r.y0 + h(r) * 0.16 + i * (bs + 4) + (h(r) * 0.68 - blocks * (bs + 4)) / 2;
			ctx.fillStyle = rgba(p.ink, (0.14 + this.pulse * 0.25) * alpha);
			ctx.fillRect(this.cx - bs / 2, y, bs, bs);
		}
		for (const pk of this.packets) {
			const y = this.laneY(pk.lane);
			const fade = Math.min(1, (pk.x - r.x0 + 20) / 60, (r.x1 + 30 - pk.x) / 60);
			const hot = pk.lane === this.boost;
			ctx.fillStyle = pk.done ? rgba(p.accent, (hot ? 0.9 : 0.6) * alpha * fade) : rgba(p.ink, (hot ? 0.55 : 0.32) * alpha * fade);
			ctx.beginPath();
			roundRect(ctx, pk.x - 9, y - 3.5, 18, 7, 2);
			ctx.fill();
		}
	}
}

export function createScene(id: SceneId): Scene {
	switch (id) {
		case 'boots':
			return new BootsScene();
		case 'market':
			return new MarketScene();
		case 'feed':
			return new FeedScene();
		case 'network':
			return new NetworkScene();
		case 'stream':
			return new StreamScene();
	}
}
