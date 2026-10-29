import { clamp, type Frame, type Palette, type Scene, type Zone } from '@/app/components/field/types';
import { stageFor, text, type Stage } from '@/app/components/field/stage';

/*
 * GitHub: a terminal cloning Yasasvi's public repositories, the ones behind the projects on this
 * site, one after another: the command, the clone, objects received, deltas resolved. Below it the
 * list of repositories marks each one as it arrives. Pointing at a repository clones it next; the
 * GitHub link skips the wait.
 */

// Repository names exactly as they are on GitHub (see the project links in resources/consts.ts)
const REPOS = ['chess-bellator', 'Diffusion-Model-To-Generate-Faces', 'AI_Resume_Generator', 'canvas-react-web-app-', 'Shopping-App', 'diet-ai-agent'];

type Line = { text: string; kind: 'cmd' | 'out' | 'bar' | 'done' };
type Step = 'cmd' | 'cloning' | 'receive' | 'resolve' | 'pause' | 'idle';
const LENGTH: Record<Step, number> = { cmd: 0.6, cloning: 0.45, receive: 1.4, resolve: 0.45, pause: 0.5, idle: 2.4 };

export class TerminalScene implements Scene {
	private s: Stage = { x: 0, y: 0, w: 0, h: 0 };
	private term = { x: 0, y: 0, w: 0, h: 0 };
	private lines: Line[] = [];
	private step: Step = 'pause';
	private t = 0;
	private repo = -1;
	private done = new Array(REPOS.length).fill(false);
	private queued = -1;
	private hover = -1;
	private clock = 0;
	private list: { x: number; y: number; w: number }[] = [];

	resize(w: number, h: number, zone: Zone) {
		this.s = stageFor(w, h, zone);
		const { s } = this;
		// On a narrow stage the list runs in one column, so the terminal gives up some height
		const cols = s.w > 520 ? 2 : 1;
		this.term = { x: s.x, y: s.y + 6, w: s.w, h: s.h * (cols === 2 ? 0.6 : 0.42) };
		const top = this.term.y + this.term.h + 54;
		const rowH = cols === 2 ? 30 : 20;
		this.list = REPOS.map((_, i) => ({ x: s.x + (i % cols) * (s.w / cols), y: top + Math.floor(i / cols) * rowH, w: s.w / cols - 12 }));
	}

	private nextRepo() {
		if (this.queued >= 0 && !this.done[this.queued]) {
			const q = this.queued;
			this.queued = -1;
			return q;
		}
		return this.done.findIndex((d) => !d);
	}

	private push(line: Line) {
		this.lines.push(line);
		const room = Math.max(3, Math.floor((this.term.h - 44) / 21));
		while (this.lines.length > room) this.lines.shift();
	}

	private go(step: Step) {
		this.step = step;
		this.t = 0;
		const name = REPOS[this.repo];
		if (step === 'cmd') this.push({ text: `$ git clone https://github.com/Nyasasvi/${name}.git`, kind: 'cmd' });
		if (step === 'cloning') this.push({ text: `Cloning into '${name}'...`, kind: 'out' });
		if (step === 'receive') this.push({ text: '', kind: 'bar' });
		if (step === 'resolve') {
			this.push({ text: 'Resolving deltas: 100%, done.', kind: 'done' });
			this.done[this.repo] = true;
		}
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		this.clock += dt;
		if (f.intro >= 0.6) this.t += dt;
		this.hover = -1;
		if (pointer.active) {
			this.hover = this.list.findIndex((r) => pointer.x >= r.x && pointer.x <= r.x + r.w && Math.abs(pointer.y - r.y) < 12);
			if (this.hover >= 0 && !this.done[this.hover] && this.hover !== this.repo) this.queued = this.hover;
		}
		if (this.step === 'receive') {
			const bar = this.lines[this.lines.length - 1];
			const pct = Math.min(100, Math.round((this.t / LENGTH.receive) * 100));
			const filled = Math.round(pct / 5);
			if (bar) bar.text = `Receiving objects: ${String(pct).padStart(3)}% [${'#'.repeat(filled)}${' '.repeat(20 - filled)}]`;
		}
		if (this.t < LENGTH[this.step]) return;
		if (this.step === 'pause') {
			this.repo = this.nextRepo();
			if (this.repo < 0) {
				this.push({ text: '$ ', kind: 'cmd' });
				this.step = 'idle';
				this.t = 0;
			} else this.go('cmd');
		} else if (this.step === 'cmd') this.go('cloning');
		else if (this.step === 'cloning') this.go('receive');
		else if (this.step === 'receive') this.go('resolve');
		else if (this.step === 'resolve') this.go('pause');
		else {
			// Everything is cloned: clear the screen and start again
			this.lines = [];
			this.done = this.done.map(() => false);
			this.go('pause');
		}
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const a = clamp(f.intro * 1.6, 0, 1);
		ctx.globalAlpha = a;
		const { term } = this;

		ctx.fillStyle = p.bg;
		ctx.fillRect(term.x, term.y, term.w, term.h);
		ctx.fillStyle = p.ink(0.07);
		ctx.fillRect(term.x, term.y, term.w, term.h);
		ctx.fillStyle = p.ink(0.1);
		ctx.fillRect(term.x, term.y, term.w, 28);
		text(ctx, p, 'Terminal', term.x + 14, term.y + 19, p.muted(0.85), 12);

		ctx.save();
		ctx.beginPath();
		ctx.rect(term.x, term.y + 28, term.w, term.h - 28);
		ctx.clip();
		ctx.font = `${term.w > 460 ? 14 : 12}px ${p.code}`;
		this.lines.forEach((line, i) => {
			const y = term.y + 54 + i * 21;
			ctx.fillStyle = line.kind === 'cmd' ? p.ink(0.92) : line.kind === 'done' ? p.accent(0.9) : line.kind === 'bar' ? p.amber(0.9) : p.ink(0.6);
			ctx.fillText(line.text, term.x + 16, y);
			// The cursor, after the last thing typed
			if (i === this.lines.length - 1 && (this.step === 'cmd' || this.step === 'idle') && Math.floor(this.clock * 1.8) % 2 === 0) {
				const w = ctx.measureText(line.text).width;
				ctx.fillStyle = p.accent(0.9);
				ctx.fillRect(term.x + 18 + w, y - 12, 8, 15);
			}
		});
		ctx.restore();

		text(ctx, p, 'github.com/Nyasasvi', this.s.x, this.list[0].y - 28, p.ink(0.85), 14);
		REPOS.forEach((name, i) => {
			const r = this.list[i];
			const now = i === this.repo && this.step !== 'pause' && this.step !== 'idle' && !this.done[i];
			const mark = this.done[i] ? p.accent(0.95) : now ? p.amber(0.95) : p.ink(0.3);
			ctx.fillStyle = mark;
			ctx.fillRect(r.x, r.y - 5, 10, 10);
			ctx.font = `13px ${p.code}`;
			ctx.fillStyle = i === this.hover ? p.accent(1) : this.done[i] ? p.ink(0.9) : p.ink(0.6);
			ctx.fillText(name, r.x + 20, r.y + 4.5);
		});
		ctx.globalAlpha = 1;
	}

	poke() {
		if (this.step === 'pause' || this.step === 'idle') this.t = LENGTH[this.step];
	}
}
