import { approach, clamp, easeInOut, type Frame, type Palette, type Scene } from '../types';

/*
 * Cloud & DevOps: a build pipeline above a row of nodes. Load on each node rises and falls, and the
 * scheduler adds or retires containers to match. Every so often a change runs the pipeline; when it
 * reaches deploy, the new version rolls out one container at a time, each shipped from the end of
 * the pipeline to its slot. Pointing at a node adds load there; a CI or infrastructure tool's row
 * starts a deploy, any other row scales up the nearest node.
 */

type State = 'fly' | 'run' | 'exit';
type Box = { node: number; slot: number; ver: number; state: State; t: number; fx: number; fy: number; fresh: number };

const STAGES = ['build', 'test', 'package', 'deploy'];
const GAP = 4;

export class ContainersScene implements Scene {
	private boxes: Box[] = [];
	private k = 4;
	private rows = 6;
	private size = 20;
	private nodeX: number[] = [];
	private nodeW = 80;
	private base = 0;
	private pipeY = 0;
	private pipeX0 = 0;
	private pipeX1 = 0;
	private boost: number[] = [];
	private tick: number[] = [];
	private version = 1;
	private pipe = -1; // progress through the pipeline, or -1 when idle
	private rollout: Box[] = [];
	private nextRoll = 0;
	private idle = 0;
	private clock = 0;

	resize(w: number, h: number, quiet: number) {
		this.k = clamp(Math.floor(w / 190), 3, 7);
		const x0 = w * 0.05;
		const span = w * 0.9;
		const col = span / this.k;
		this.nodeW = col * 0.66;
		this.nodeX = Array.from({ length: this.k }, (_, i) => x0 + col * (i + 0.5));
		this.size = Math.min((this.nodeW - GAP * 2) / 3, 28);
		this.base = h * 0.9;
		this.pipeY = quiet ? Math.min(quiet + 44, h * 0.5) : h * 0.13;
		this.pipeX0 = w * (w < 700 ? 0.1 : 0.2);
		this.pipeX1 = w * (w < 700 ? 0.9 : 0.8);
		this.rows = clamp(Math.floor((this.base - this.pipeY - 76) / (this.size + GAP)), 3, 10);
		this.boost = this.nodeX.map(() => 0);
		this.tick = this.nodeX.map((_, i) => i * 0.07);
		this.boxes = [];
		this.rollout = [];
		this.pipe = -1;
		// Start with every node at its current load
		this.nodeX.forEach((_, n) => {
			const want = this.target(n);
			for (let s = 0; s < want; s++) this.boxes.push({ node: n, slot: s, ver: this.version, state: 'run', t: 1, fx: 0, fy: 0, fresh: 0 });
		});
	}

	private get capacity() {
		return this.rows * 3;
	}

	private target(n: number) {
		const load = 0.42 + 0.22 * Math.sin(this.clock * 0.35 + n * 1.3) + this.boost[n];
		return clamp(Math.round(this.capacity * load), 2, this.capacity);
	}

	private slotXY(n: number, slot: number): [number, number] {
		const total = 3 * this.size + 2 * GAP;
		const col = slot % 3;
		const row = Math.floor(slot / 3);
		return [this.nodeX[n] - total / 2 + col * (this.size + GAP), this.base - 8 - (row + 1) * (this.size + GAP)];
	}

	private ship(n: number, slot: number) {
		this.boxes.push({ node: n, slot, ver: this.version, state: 'fly', t: 0, fx: this.pipeX1, fy: this.pipeY, fresh: 1 });
	}

	private freeSlot(n: number) {
		const used = new Array(this.capacity).fill(false);
		for (const b of this.boxes) if (b.node === n && b.state !== 'exit') used[b.slot] = true;
		return used.indexOf(false);
	}

	private deploy() {
		if (this.pipe >= 0 || this.rollout.length) return;
		this.pipe = 0;
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		this.clock += dt;

		if (this.pipe >= 0) {
			this.pipe += dt * 0.55;
			if (this.pipe >= 1) {
				this.pipe = -1;
				this.version++;
				// Roll node by node, bottom slot first
				this.rollout = this.boxes.filter((b) => b.state === 'run' && b.ver < this.version).sort((a, b) => a.node - b.node || a.slot - b.slot);
			}
		} else if (!this.rollout.length && f.intro >= 1) {
			this.idle += dt;
			if (this.idle > 7) {
				this.idle = 0;
				this.deploy();
			}
		}

		if (this.rollout.length) {
			this.nextRoll -= dt;
			if (this.nextRoll <= 0) {
				this.nextRoll = 0.11;
				const old = this.rollout.shift()!;
				if (old.state === 'run') {
					old.state = 'exit';
					old.t = 0;
					this.ship(old.node, old.slot);
				}
			}
		}

		this.nodeX.forEach((x, n) => {
			const over = pointer.active && Math.abs(pointer.x - x) < this.nodeW * 0.75 && pointer.y > this.pipeY + 20;
			this.boost[n] = approach(this.boost[n], over ? 0.4 : 0, over ? 2.5 : 0.35, dt);
			this.tick[n] -= dt;
			if (this.tick[n] > 0 || f.intro < 0.6) return;
			this.tick[n] = 0.32;
			const live = this.boxes.filter((b) => b.node === n && b.state !== 'exit');
			const want = this.target(n);
			if (live.length < want) {
				const slot = this.freeSlot(n);
				if (slot >= 0) this.ship(n, slot);
			} else if (live.length > want + 1) {
				const top = live.filter((b) => b.state === 'run').sort((a, b) => b.slot - a.slot)[0];
				if (top) {
					top.state = 'exit';
					top.t = 0;
				}
			}
		});

		for (let i = this.boxes.length - 1; i >= 0; i--) {
			const b = this.boxes[i];
			b.t += dt;
			b.fresh = Math.max(0, b.fresh - dt * 0.4);
			if (b.state === 'fly' && b.t >= 0.9) {
				b.state = 'run';
				b.t = 0;
			} else if (b.state === 'exit' && b.t >= 0.45) {
				this.boxes.splice(i, 1);
			}
		}
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const s = this.size;
		const a = clamp(f.intro * 1.8, 0, 1);

		// Pipeline: stages passed so far in the accent, the change travelling between them
		ctx.globalAlpha = a;
		ctx.fillStyle = p.ink(0.14);
		ctx.fillRect(this.pipeX0, this.pipeY - 0.5, this.pipeX1 - this.pipeX0, 1);
		ctx.font = `13px ${p.body}`;
		ctx.textAlign = 'center';
		STAGES.forEach((name, i) => {
			const x = this.pipeX0 + ((this.pipeX1 - this.pipeX0) * i) / (STAGES.length - 1);
			const done = this.pipe >= 0 && this.pipe >= i / (STAGES.length - 1);
			ctx.fillStyle = done ? p.accent(0.9) : p.ink(0.3);
			ctx.fillRect(x - 5, this.pipeY - 5, 10, 10);
			ctx.fillStyle = p.muted(0.65);
			ctx.fillText(name, x, this.pipeY + 26);
		});
		ctx.textAlign = 'left';
		ctx.fillStyle = p.muted(0.65);
		ctx.fillText(`v${this.version}`, this.pipeX1 + 14, this.pipeY + 4.5);
		if (this.pipe >= 0) {
			const x = this.pipeX0 + (this.pipeX1 - this.pipeX0) * easeInOut(this.pipe);
			ctx.fillStyle = p.accent(1);
			ctx.fillRect(x - 3, this.pipeY - 3, 6, 6);
		}

		// Nodes: capacity as a faint column, the platform, the name
		this.nodeX.forEach((x, n) => {
			const total = 3 * s + 2 * GAP;
			const height = this.rows * (s + GAP);
			ctx.fillStyle = p.ink(0.03 + this.boost[n] * 0.1);
			ctx.fillRect(x - total / 2 - GAP, this.base - 8 - height - GAP, total + GAP * 2, height + GAP);
			ctx.fillStyle = p.ink(0.24);
			ctx.fillRect(x - this.nodeW / 2, this.base - 6, this.nodeW, 6);
			ctx.fillStyle = p.muted(0.6);
			ctx.textAlign = 'center';
			ctx.fillText(`node ${n + 1}`, x, this.base + 22);
			ctx.textAlign = 'left';
		});
		ctx.globalAlpha = 1;

		for (const b of this.boxes) {
			const [tx, ty] = this.slotXY(b.node, b.slot);
			let x = tx;
			let y = ty;
			let alpha = a;
			if (b.state === 'fly') {
				// Out along the pipeline's line, then down into the slot
				const k = easeInOut(b.t / 0.9);
				const cx = tx;
				const cy = b.fy;
				x = (1 - k) * (1 - k) * b.fx + 2 * (1 - k) * k * cx + k * k * tx - (s / 2) * (1 - k);
				y = (1 - k) * (1 - k) * b.fy + 2 * (1 - k) * k * cy + k * k * ty - (s / 2) * (1 - k);
			} else if (b.state === 'exit') {
				const k = b.t / 0.45;
				y -= k * 14;
				alpha *= 1 - k;
			}
			ctx.globalAlpha = alpha;
			ctx.fillStyle = p.ink(0.26);
			ctx.fillRect(x, y, s, s);
			if (b.fresh > 0) {
				ctx.fillStyle = p.accent(Math.min(1, b.fresh * 1.4));
				ctx.fillRect(x, y, s, s);
			}
			ctx.fillStyle = p.bg;
			ctx.fillRect(x + 3, y + 3, s - 6, 2);
		}
		ctx.globalAlpha = 1;
	}

	poke(x: number, _y: number, label: string) {
		if (/jenkins|github actions|terraform/i.test(label)) {
			this.deploy();
			return;
		}
		let n = 0;
		this.nodeX.forEach((nx, i) => { if (Math.abs(nx - x) < Math.abs(this.nodeX[n] - x)) n = i; });
		this.boost[n] = Math.min(0.5, this.boost[n] + 0.3);
		this.tick[n] = 0;
	}
}
