import { clamp, rng, type Frame, type Palette, type Scene } from '../types';

/*
 * Tools & testing: a git history moving right to left. Branches leave main, collect commits and merge
 * back once their checks pass; every commit runs its checks (a pending square that becomes a tick, or
 * now and then a cross followed by a fix). Hovering a commit shows its hash and check result; a skill
 * row opens a branch named after that tool.
 */

type Check = 'pending' | 'pass' | 'fail';
type Commit = { t: number; lane: number; parent: Commit | null; merge: Commit | null; kind: 'main' | 'branch' | 'merge'; check: Check; checkAt: number; hash: string; label: string | null; branch: Branch | null };
type Branch = { lane: number; head: Commit; first: Commit; count: number; target: number; open: boolean; label: string | null; fixing: boolean };

const TESTING = /junit|jest|selenium|playwright|postman|sonarqube/i;

export class CommitsScene implements Scene {
	private commits: Commit[] = [];
	private branches: Branch[] = [];
	private mainHead: Commit | null = null;
	private clock = 0;
	private nextEvent = 0;
	private fixes: { at: number; branch: Branch }[] = [];
	private w = 0;
	private mainY = 0;
	private spacing = 44;
	private maxLane = 3;
	private speed = 60;
	private rand = rng(23);
	private hover: Commit | null = null;

	resize(w: number, h: number) {
		this.w = w;
		this.mainY = h * 0.52;
		this.spacing = clamp(h * 0.085, 34, 60);
		this.maxLane = clamp(Math.floor((h * 0.4) / this.spacing), 2, 4);
		this.speed = w < 700 ? 40 : 60;
		this.commits = [];
		this.branches = [];
		this.fixes = [];
		this.clock = 0;
		this.mainHead = this.add('main', 0, null);
		this.mainHead.check = 'pass';
		// Fill the screen with history before the first frame
		const steps = Math.ceil((w / this.speed + 2) / 0.1);
		for (let i = 0; i < steps; i++) this.tick(0.1);
	}

	private x(c: Commit) {
		return this.w + 14 - (this.clock - c.t) * this.speed;
	}

	private y(lane: number) {
		return this.mainY + lane * this.spacing;
	}

	private add(kind: Commit['kind'], lane: number, parent: Commit | null, branch: Branch | null = null, merge: Commit | null = null) {
		const hash = Array.from({ length: 7 }, () => '0123456789abcdef'[Math.floor(this.rand() * 16)]).join('');
		const c: Commit = { t: this.clock, lane, parent, merge, kind, check: 'pending', checkAt: this.clock + 1.4 + this.rand() * 2.2, hash, label: null, branch };
		this.commits.push(c);
		return c;
	}

	private freeLane() {
		for (let k = 1; k <= this.maxLane; k++) {
			for (const lane of [k, -k]) if (!this.branches.some((b) => b.open && b.lane === lane)) return lane;
		}
		return 0;
	}

	private open(label: string | null) {
		let lane = this.freeLane();
		if (!lane) {
			// Every lane is busy: merge the oldest branch to make room
			const oldest = this.branches.find((b) => b.open);
			if (!oldest) return;
			this.merge(oldest);
			lane = oldest.lane;
		}
		const first = this.add('branch', lane, this.mainHead);
		first.label = label;
		const b: Branch = { lane, head: first, first, count: 1, target: 2 + Math.floor(this.rand() * 4), open: true, label, fixing: false };
		first.branch = b;
		this.branches.push(b);
	}

	private commitOn(b: Branch) {
		b.head = this.add('branch', b.lane, b.head, b);
		b.count++;
	}

	private merge(b: Branch) {
		b.open = false;
		this.mainHead = this.add('merge', 0, this.mainHead, null, b.head);
	}

	private event() {
		const open = this.branches.filter((b) => b.open);
		const ready = open.find((b) => b.count >= b.target && b.head.check === 'pass');
		const r = this.rand();
		if (ready && r < 0.5) this.merge(ready);
		else if (open.length < this.maxLane * 2 - 1 && r < 0.62) this.open(null);
		else if (open.length && r < 0.92) this.commitOn(open[Math.floor(this.rand() * open.length)]);
		else this.mainHead = this.add('main', 0, this.mainHead);
	}

	private tick(dt: number) {
		this.clock += dt;
		this.nextEvent -= dt;
		if (this.nextEvent <= 0) {
			this.nextEvent = 0.45 + this.rand() * 0.45;
			this.event();
		}
		for (const c of this.commits) {
			if (c.check !== 'pending' || c.checkAt > this.clock) continue;
			c.check = c.kind !== 'merge' && this.rand() < 0.1 ? 'fail' : 'pass';
			const b = c.branch;
			if (c.check === 'fail' && b && b.open && !b.fixing) {
				b.fixing = true;
				this.fixes.push({ at: this.clock + 0.7, branch: b });
			}
		}
		for (let i = this.fixes.length - 1; i >= 0; i--) {
			const fix = this.fixes[i];
			if (fix.at > this.clock) continue;
			fix.branch.fixing = false;
			if (fix.branch.open) this.commitOn(fix.branch);
			this.fixes.splice(i, 1);
		}
		// Forget what has scrolled off, and let it forget its own past
		while (this.commits.length && this.x(this.commits[0]) < -80) {
			const gone = this.commits.shift()!;
			gone.parent = null;
			gone.merge = null;
		}
		this.branches = this.branches.filter((b) => b.open || this.x(b.head) > -80);
	}

	update(f: Frame) {
		this.tick(f.dt);
		this.hover = null;
		if (!f.pointer.active) return;
		let best = 26;
		for (const c of this.commits) {
			const d = Math.hypot(this.x(c) - f.pointer.x, this.y(c.lane) - f.pointer.y);
			if (d < best) {
				best = d;
				this.hover = c;
			}
		}
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		ctx.globalAlpha = clamp(f.intro * 1.6, 0, 1);
		const curve = (x0: number, y0: number, x1: number, y1: number) => {
			ctx.moveTo(x0, y0);
			if (y0 === y1) ctx.lineTo(x1, y1);
			else {
				const mid = (x0 + x1) / 2;
				ctx.bezierCurveTo(mid, y0, mid, y1, x1, y1);
			}
		};
		const named = (c: Commit) => !!(c.branch && c.branch.label);

		// Edges: main in the heaviest ink, branches lighter, branches opened from a skill in the accent
		const passes: [(c: Commit) => boolean, string, number][] = [
			[(c) => c.lane === 0 && c.kind !== 'branch', p.ink(0.42), 2],
			[(c) => c.kind === 'branch' && !named(c), p.ink(0.26), 1.5],
			[(c) => c.kind === 'branch' && named(c), p.accent(0.75), 1.75],
		];
		for (const [match, style, width] of passes) {
			ctx.strokeStyle = style;
			ctx.lineWidth = width;
			ctx.beginPath();
			for (const c of this.commits) {
				if (!match(c) || !c.parent) continue;
				curve(this.x(c.parent), this.y(c.parent.lane), this.x(c), this.y(c.lane));
			}
			ctx.stroke();
		}
		ctx.strokeStyle = p.ink(0.26);
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		for (const c of this.commits) if (c.merge) curve(this.x(c.merge), this.y(c.merge.lane), this.x(c), this.y(0));
		ctx.stroke();

		ctx.lineWidth = 1.5;
		for (const c of this.commits) {
			const x = this.x(c);
			if (x < -20 || x > f.w + 20) continue;
			const y = this.y(c.lane);
			const s = c.kind === 'merge' ? 11 : c.kind === 'main' ? 9 : 8;
			if (c.kind === 'branch') {
				ctx.fillStyle = p.bg;
				ctx.fillRect(x - s / 2, y - s / 2, s, s);
				ctx.strokeStyle = named(c) ? p.accent(0.9) : p.ink(0.55);
				ctx.strokeRect(x - s / 2, y - s / 2, s, s);
			} else {
				ctx.fillStyle = p.ink(0.75);
				ctx.fillRect(x - s / 2, y - s / 2, s, s);
			}
			// The check, just above and to the right
			const cx = x + 8;
			const cy = y - 13;
			if (c.check === 'pending') {
				ctx.strokeStyle = p.muted(0.6);
				ctx.lineWidth = 1;
				ctx.strokeRect(cx + 0.5, cy - 2.5, 5, 5);
				ctx.lineWidth = 1.5;
			} else if (c.check === 'pass') {
				ctx.strokeStyle = p.accent(0.85);
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.lineTo(cx + 2.5, cy + 2.5);
				ctx.lineTo(cx + 7, cy - 3);
				ctx.stroke();
			} else {
				ctx.strokeStyle = p.amber(0.9);
				ctx.beginPath();
				ctx.moveTo(cx, cy - 3);
				ctx.lineTo(cx + 6, cy + 3);
				ctx.moveTo(cx + 6, cy - 3);
				ctx.lineTo(cx, cy + 3);
				ctx.stroke();
			}
		}

		// Branch names opened from the list
		ctx.font = `13px ${p.code}`;
		for (const b of this.branches) {
			if (!b.label) continue;
			const x = this.x(b.first);
			if (x < -200 || x > f.w) continue;
			const y = this.y(b.lane) + (b.lane < 0 ? -22 : 28);
			ctx.fillStyle = p.accent(0.95);
			ctx.fillText(b.label, x - 4, y);
		}
		ctx.globalAlpha = 1;

		if (this.hover) {
			const c = this.hover;
			const text = `${c.hash}  ${c.check === 'pending' ? 'checks running' : c.check === 'pass' ? 'checks passed' : 'checks failed'}`;
			ctx.font = `13px ${p.code}`;
			const tw = ctx.measureText(text).width + 16;
			const x = clamp(this.x(c) + 12, 8, f.w - tw - 8);
			const y = this.y(c.lane) - 46;
			ctx.fillStyle = p.bg;
			ctx.fillRect(x, y, tw, 24);
			ctx.strokeStyle = p.ink(0.3);
			ctx.lineWidth = 1;
			ctx.strokeRect(x + 0.5, y + 0.5, tw - 1, 23);
			ctx.fillStyle = p.ink(0.9);
			ctx.fillText(text, x + 8, y + 16.5);
		}
	}

	poke(_x: number, _y: number, label: string) {
		const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
		this.open(`${TESTING.test(label) ? 'test' : 'chore'}/${slug}`);
	}
}
