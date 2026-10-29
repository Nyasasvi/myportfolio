import { clamp, rng, type Frame, type Palette, type Scene } from '@/app/components/field/types';

/*
 * AI & ML: a small feed-forward network. Input nodes fire on their own every second or so; each
 * firing sends pulses along a node's strongest outgoing weights, and a node that gathers enough
 * charge fires in turn, so activity travels layer by layer to the outputs, whose bars read like a
 * softmax. The pointer charges the nodes it passes over, and a skill row fires the input nearest it.
 */

type Node = { x: number; y: number; layer: number; a: number; charge: number; rest: number; out: number[] };
type Edge = { from: number; to: number; w: number; len: number };
type Pulse = { e: number; t: number; s: number };

const SPEED = 460; // px per second along an edge
const THRESHOLD = 0.55;

export class NetworkScene implements Scene {
	private nodes: Node[] = [];
	private edges: Edge[] = [];
	private layers: number[][] = [];
	private pulses: Pulse[] = [];
	private outputs: number[] = [];
	private nextInput = 0.3;
	private vertical = false;
	private rand = rng(11);

	resize(w: number, h: number) {
		this.vertical = w < 700 && h > w;
		const sizes = this.vertical ? [4, 6, 7, 6, 3] : w < 1100 ? [4, 7, 9, 7, 3] : [5, 8, 11, 11, 8, 3];
		const rand = rng(29);
		this.nodes = [];
		this.edges = [];
		this.layers = [];
		this.pulses = [];
		// Along the flow the network spans most of the field; across it, nodes keep an even pitch
		const along = this.vertical ? h : w;
		const across = this.vertical ? w : h;
		const a0 = along * (this.vertical ? 0.1 : 0.07);
		const a1 = along * (this.vertical ? 0.86 : 0.84);
		sizes.forEach((n, l) => {
			const ids: number[] = [];
			const pitch = Math.min(this.vertical ? 56 : 74, (across * 0.8) / n);
			for (let i = 0; i < n; i++) {
				const u = a0 + ((a1 - a0) * l) / (sizes.length - 1) + (rand() - 0.5) * 10;
				const v = across / 2 + (i - (n - 1) / 2) * pitch + (rand() - 0.5) * 8;
				ids.push(this.nodes.length);
				this.nodes.push({ x: this.vertical ? v : u, y: this.vertical ? u : v, layer: l, a: 0, charge: 0, rest: 0, out: [] });
			}
			this.layers.push(ids);
		});
		for (let l = 0; l < this.layers.length - 1; l++) {
			for (const from of this.layers[l]) {
				for (const to of this.layers[l + 1]) {
					const a = this.nodes[from];
					const b = this.nodes[to];
					this.edges.push({ from, to, w: rand() * 2 - 1, len: Math.hypot(b.x - a.x, b.y - a.y) });
				}
			}
		}
		// Each node sends along its strongest positive weights first
		this.nodes.forEach((n, i) => {
			n.out = this.edges
				.map((e, k) => ({ e, k }))
				.filter(({ e }) => e.from === i && e.w > 0)
				.sort((p, q) => q.e.w - p.e.w)
				.map(({ k }) => k);
		});
		this.outputs = this.layers[this.layers.length - 1].map(() => 0);
	}

	private fire(i: number, s: number) {
		const n = this.nodes[i];
		n.a = 1;
		n.rest = 0.42;
		n.charge = 0;
		const last = this.layers.length - 1;
		if (n.layer === last) {
			const k = this.layers[last].indexOf(i);
			this.outputs[k] += s;
			return;
		}
		const fan = Math.min(n.out.length, 2 + Math.floor(this.rand() * 2));
		for (let j = 0; j < fan && this.pulses.length < 420; j++) {
			this.pulses.push({ e: n.out[j], t: 0, s: s * (0.8 + 0.2 * this.rand()) });
		}
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		if (f.intro > 0.5) {
			this.nextInput -= dt;
			if (this.nextInput <= 0) {
				this.nextInput = 0.4 + this.rand() * 0.6;
				const inputs = this.layers[0];
				this.fire(inputs[Math.floor(this.rand() * inputs.length)], 0.95);
				if (this.rand() < 0.55) this.fire(inputs[Math.floor(this.rand() * inputs.length)], 0.85);
			}
		}
		const decayA = Math.exp(-dt * 2.4);
		const decayC = Math.exp(-dt * 1.1);
		for (let i = 0; i < this.nodes.length; i++) {
			const n = this.nodes[i];
			if (pointer.active) {
				const d = Math.hypot(n.x - pointer.x, n.y - pointer.y);
				if (d < 120) n.charge += dt * 2.6 * (1 - d / 120);
			}
			n.a *= decayA;
			n.charge *= decayC;
			n.rest -= dt;
			if (n.charge > THRESHOLD && n.rest <= 0) this.fire(i, Math.min(1, n.charge));
		}
		for (let k = this.pulses.length - 1; k >= 0; k--) {
			const q = this.pulses[k];
			const e = this.edges[q.e];
			q.t += (dt * SPEED) / e.len;
			if (q.t < 1) continue;
			const n = this.nodes[e.to];
			n.a = Math.min(1, n.a + q.s * 0.5);
			n.charge += q.s * e.w * 0.95;
			this.pulses[k] = this.pulses[this.pulses.length - 1];
			this.pulses.pop();
		}
		const decayO = Math.exp(-dt * 0.5);
		for (let k = 0; k < this.outputs.length; k++) this.outputs[k] *= decayO;
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const L = this.layers.length;
		// Layer by layer as the chapter arrives
		const shown = (l: number) => clamp(f.intro * (L + 1.5) - l, 0, 1);

		ctx.lineWidth = 1;
		ctx.strokeStyle = p.ink(0.1);
		for (let l = 0; l < L - 1; l++) {
			const a = Math.min(shown(l), shown(l + 1));
			if (a <= 0) continue;
			ctx.globalAlpha = a;
			ctx.beginPath();
			for (const e of this.edges) {
				if (this.nodes[e.from].layer !== l) continue;
				const s = this.nodes[e.from];
				const t = this.nodes[e.to];
				ctx.moveTo(s.x, s.y);
				ctx.lineTo(t.x, t.y);
			}
			ctx.stroke();
		}
		ctx.globalAlpha = 1;

		// Pulses: a short streak behind each head, so direction reads at a glance
		ctx.lineWidth = 2;
		ctx.strokeStyle = p.accent(1);
		for (const q of this.pulses) {
			const e = this.edges[q.e];
			const s = this.nodes[e.from];
			const t = this.nodes[e.to];
			const t0 = Math.max(0, q.t - 64 / e.len);
			ctx.globalAlpha = clamp(q.s, 0.2, 1) * 0.85;
			ctx.beginPath();
			ctx.moveTo(s.x + (t.x - s.x) * t0, s.y + (t.y - s.y) * t0);
			ctx.lineTo(s.x + (t.x - s.x) * q.t, s.y + (t.y - s.y) * q.t);
			ctx.stroke();
		}
		ctx.globalAlpha = 1;

		for (const n of this.nodes) {
			const a = shown(n.layer);
			if (a <= 0) continue;
			const size = (7 + n.a * 6) * a;
			ctx.fillStyle = p.ink(0.48);
			ctx.fillRect(n.x - size / 2, n.y - size / 2, size, size);
			if (n.a > 0.02) {
				ctx.fillStyle = p.accent(n.a);
				ctx.fillRect(n.x - size / 2, n.y - size / 2, size, size);
			}
		}

		// Outputs read as a distribution: bars share one total, the leader in the accent
		const outs = this.layers[L - 1];
		const total = Math.max(1, this.outputs.reduce((s, v) => s + v, 0));
		let lead = 0;
		this.outputs.forEach((v, k) => { if (v > this.outputs[lead]) lead = k; });
		const reach = this.vertical ? f.h * 0.09 : f.w * 0.1;
		const a = shown(L - 1);
		outs.forEach((id, k) => {
			const n = this.nodes[id];
			const len = Math.max(2, (this.outputs[k] / total) * reach) * a;
			ctx.fillStyle = k === lead && this.outputs[k] > 0.05 ? p.accent(0.8) : p.ink(0.28);
			if (this.vertical) ctx.fillRect(n.x - 2, n.y + 12, 4, len);
			else ctx.fillRect(n.x + 12, n.y - 2, len, 4);
		});
	}

	poke(x: number, y: number) {
		// Fire the input whose position across the flow is nearest the skill pointed at
		const inputs = this.layers[0];
		if (!inputs) return;
		let best = inputs[0];
		let bestD = Infinity;
		for (const id of inputs) {
			const n = this.nodes[id];
			const d = this.vertical ? Math.abs(n.x - x) : Math.abs(n.y - y);
			if (d < bestD) { bestD = d; best = id; }
		}
		this.fire(best, 1);
		const idx = inputs.indexOf(best);
		const next = inputs[idx + 1] ?? inputs[idx - 1];
		if (next !== undefined) this.fire(next, 0.85);
	}
}
