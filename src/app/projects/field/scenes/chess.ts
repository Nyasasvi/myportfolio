import { clamp, easeInOut, rng, type Frame, type Palette, type Scene, type Zone } from '@/app/components/field/types';
import { stageFor, tag, text, type Stage } from '../stage';

/*
 * Chess Bellator: a board and the Monte Carlo search behind each move. Before every move the engine
 * plays out games from each candidate: a rollout runs down from a candidate, and its result travels
 * back up to the root, so the candidates that keep winning collect visits and grow. When the time is
 * up the most visited move is played on the board. The game is a real opening (the Giuoco Piano),
 * replayed from the start when it ends. Pointing at a candidate sends more rollouts through it; the
 * MCTS row runs a burst of rollouts.
 */

type Piece = { kind: string; white: boolean };
type Ply = { san: string; moves: [string, string][] };
type Candidate = { san: string; visits: number; wins: number; x: number };
type Rollout = { c: number; t: number; win: boolean; back: boolean; depth: number; drift: number };

const GAME: Ply[] = [
	['e4', [['e2', 'e4']]], ['e5', [['e7', 'e5']]], ['Nf3', [['g1', 'f3']]], ['Nc6', [['b8', 'c6']]],
	['Bc4', [['f1', 'c4']]], ['Bc5', [['f8', 'c5']]], ['c3', [['c2', 'c3']]], ['Nf6', [['g8', 'f6']]],
	['d4', [['d2', 'd4']]], ['exd4', [['e5', 'd4']]], ['cxd4', [['c3', 'd4']]], ['Bb4+', [['c5', 'b4']]],
	['Bd2', [['c1', 'd2']]], ['Bxd2+', [['b4', 'd2']]], ['Nbxd2', [['b1', 'd2']]], ['d5', [['d7', 'd5']]],
	['exd5', [['e4', 'd5']]], ['Nxd5', [['f6', 'd5']]], ['Qb3', [['d1', 'b3']]], ['Nce7', [['c6', 'e7']]],
	['O-O', [['e1', 'g1'], ['h1', 'f1']]], ['O-O', [['e8', 'g8'], ['h8', 'f8']]],
].map(([san, moves]) => ({ san: san as string, moves: moves as [string, string][] }));

// Other moves the search weighs at each turn; the played move is always among the candidates
const OTHERS = ['d4', 'Nc3', 'Bb5', 'h3', 'a3', 'Qe2', 'Re1', 'Bg5', 'c4', 'd3', 'Be2', 'g3', 'Nbd2', 'Qe7', 'a6', 'h6', 'd6', 'Be7', 'Bd6', 'Qf6'];
const BACK = 'RNBQKBNR';
const THINK = 2.4;

const square = (sq: string): [number, number] => [sq.charCodeAt(0) - 97, 8 - Number(sq[1])];

export class ChessScene implements Scene {
	private s: Stage = { x: 0, y: 0, w: 0, h: 0 };
	private board: (Piece | null)[][] = [];
	private ply = 0;
	private think = 0;
	private candidates: Candidate[] = [];
	private rollouts: Rollout[] = [];
	private moving: { from: [number, number]; to: [number, number]; piece: Piece; t: number }[] = [];
	private nextRollout = 0;
	private hover = -1;
	private burst = 0;
	private rand = rng(31);
	private bx = 0;
	private by = 0;
	private bs = 0;
	private tx = 0;
	private tw = 0;
	private rootY = 0;
	private kidsY = 0;
	private floorY = 0;
	private pause = 0;

	constructor() {
		this.reset();
	}

	private reset() {
		this.board = Array.from({ length: 8 }, () => Array(8).fill(null));
		for (let i = 0; i < 8; i++) {
			this.board[0][i] = { kind: BACK[i], white: false };
			this.board[1][i] = { kind: 'P', white: false };
			this.board[6][i] = { kind: 'P', white: true };
			this.board[7][i] = { kind: BACK[i], white: true };
		}
		this.ply = 0;
		this.startThinking();
	}

	resize(w: number, h: number, zone: Zone) {
		this.s = stageFor(w, h, zone);
		const { s } = this;
		const side = s.w > s.h * 1.3;
		this.bs = Math.min(side ? s.w * 0.44 : s.w * 0.62, side ? s.h * 0.8 : s.h * 0.52, 440);
		this.bx = s.x;
		this.by = side ? s.y + (s.h - this.bs) / 2 : s.y;
		// The tree sits beside the board on a wide stage, below it on a tall one
		this.tx = side ? s.x + this.bs + Math.max(36, s.w * 0.06) : s.x;
		this.tw = side ? s.x + s.w - this.tx : s.w;
		this.rootY = side ? this.by + 20 : this.by + this.bs + 40;
		this.floorY = side ? this.by + this.bs - 10 : s.y + s.h - 10;
		this.kidsY = this.rootY + (this.floorY - this.rootY) * (side ? 0.3 : 0.36);
		this.layoutCandidates();
	}

	private layoutCandidates() {
		const n = this.candidates.length;
		this.candidates.forEach((c, i) => {
			c.x = this.tx + ((i + 0.5) / n) * this.tw;
		});
	}

	private startThinking() {
		const played = GAME[this.ply].san;
		const pool = OTHERS.filter((m) => m !== played);
		const picks = new Set<string>([played]);
		while (picks.size < 5) picks.add(pool[Math.floor(this.rand() * pool.length)]);
		const list: string[] = [];
		picks.forEach((m) => list.push(m));
		list.sort(() => this.rand() - 0.5);
		this.candidates = list.map((san) => ({ san, visits: 0, wins: 0, x: 0 }));
		this.layoutCandidates();
		this.think = 0;
		this.rollouts = [];
	}

	private rollout() {
		// Mostly the move that is strongest, sometimes another: exploration
		const played = this.candidates.findIndex((c) => c.san === GAME[this.ply].san);
		const pick = this.hover >= 0 && this.rand() < 0.6 ? this.hover : this.rand() < 0.5 ? played : Math.floor(this.rand() * this.candidates.length);
		const win = this.rand() < (pick === played ? 0.68 : 0.42);
		this.rollouts.push({ c: pick, t: 0, win, back: false, depth: 0.55 + this.rand() * 0.45, drift: (this.rand() - 0.5) * 40 });
	}

	private play() {
		const ply = GAME[this.ply];
		for (const [a, b] of ply.moves) {
			const from = square(a);
			const to = square(b);
			const piece = this.board[from[1]][from[0]];
			if (!piece) continue;
			this.board[from[1]][from[0]] = null;
			this.moving.push({ from, to, piece, t: 0 });
		}
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		this.hover = -1;
		if (pointer.active && pointer.y > this.kidsY - 30 && pointer.y < this.floorY) {
			this.candidates.forEach((c, i) => { if (Math.abs(pointer.x - c.x) < this.tw / this.candidates.length / 2) this.hover = i; });
		}
		for (let i = this.moving.length - 1; i >= 0; i--) {
			const m = this.moving[i];
			m.t += dt / 0.55;
			if (m.t >= 1) {
				this.board[m.to[1]][m.to[0]] = m.piece;
				this.moving.splice(i, 1);
			}
		}
		if (this.pause > 0) {
			this.pause -= dt;
			if (this.pause <= 0) {
				if (this.ply >= GAME.length) this.reset();
				else this.startThinking();
			}
			return;
		}
		if (f.intro < 0.5) return;
		this.think += dt;
		this.nextRollout -= dt;
		const rate = this.burst > 0 ? 0.02 : 0.07;
		this.burst = Math.max(0, this.burst - dt);
		while (this.nextRollout <= 0) {
			this.nextRollout += rate;
			if (this.rollouts.length < 60) this.rollout();
		}
		for (let i = this.rollouts.length - 1; i >= 0; i--) {
			const r = this.rollouts[i];
			r.t += dt / (r.back ? 0.35 : 0.3);
			if (r.t < 1) continue;
			if (!r.back) {
				r.back = true;
				r.t = 0;
			} else {
				const c = this.candidates[r.c];
				c.visits++;
				if (r.win) c.wins++;
				this.rollouts.splice(i, 1);
			}
		}
		if (this.think > THINK) {
			// The move with the most visits is played; the search is built so the book move holds up
			const played = this.candidates.find((c) => c.san === GAME[this.ply].san)!;
			const top = Math.max(...this.candidates.map((c) => c.visits));
			if (played.visits < top) played.visits = top + 1 + Math.floor(this.rand() * 4);
			this.play();
			this.ply++;
			this.pause = 0.9;
		}
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const a = clamp(f.intro * 1.6, 0, 1);
		ctx.globalAlpha = a;
		const sq = this.bs / 8;

		// The board
		for (let r = 0; r < 8; r++) {
			for (let c = 0; c < 8; c++) {
				ctx.fillStyle = (r + c) % 2 ? p.ink(0.13) : p.ink(0.05);
				ctx.fillRect(this.bx + c * sq, this.by + r * sq, sq, sq);
			}
		}
		const last = this.ply > 0 && this.pause > 0 ? GAME[this.ply - 1] : null;
		if (last) {
			ctx.fillStyle = p.accent(0.22);
			for (const [from, to] of last.moves) {
				for (const s of [from, to]) {
					const [c, r] = square(s);
					ctx.fillRect(this.bx + c * sq, this.by + r * sq, sq, sq);
				}
			}
		}
		const drawPiece = (piece: Piece, x: number, y: number) => {
			const rad = sq * (piece.kind === 'P' ? 0.22 : 0.33);
			ctx.beginPath();
			ctx.arc(x, y, rad, 0, Math.PI * 2);
			ctx.fillStyle = piece.white ? p.ink(0.88) : p.bg;
			ctx.fill();
			ctx.lineWidth = 1.5;
			ctx.strokeStyle = piece.white ? p.ink(0.88) : p.ink(0.7);
			ctx.stroke();
			if (piece.kind !== 'P') {
				ctx.font = `700 ${Math.round(sq * 0.36)}px ${p.body}`;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillStyle = piece.white ? p.bg : p.ink(0.85);
				ctx.fillText(piece.kind, x, y + 1);
				ctx.textAlign = 'left';
				ctx.textBaseline = 'alphabetic';
			}
		};
		for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
			const piece = this.board[r][c];
			if (piece) drawPiece(piece, this.bx + (c + 0.5) * sq, this.by + (r + 0.5) * sq);
		}
		for (const m of this.moving) {
			const k = easeInOut(m.t);
			drawPiece(m.piece, this.bx + (m.from[0] + (m.to[0] - m.from[0]) * k + 0.5) * sq, this.by + (m.from[1] + (m.to[1] - m.from[1]) * k + 0.5) * sq - Math.sin(k * Math.PI) * sq * 0.3);
		}

		// The search tree: root, candidates sized by visits, rollouts down and results back up
		const rootX = this.tx + this.tw / 2;
		const total = Math.max(1, this.candidates.reduce((s, c) => s + c.visits, 0));
		const best = this.candidates.reduce((b, c, i) => (c.visits > this.candidates[b].visits ? i : b), 0);
		this.candidates.forEach((c, i) => {
			const share = c.visits / total;
			ctx.lineWidth = 1 + share * 9;
			ctx.strokeStyle = i === best && total > 8 ? p.accent(0.8) : p.ink(0.22 + share * 0.5);
			ctx.beginPath();
			ctx.moveTo(rootX, this.rootY);
			ctx.bezierCurveTo(rootX, (this.rootY + this.kidsY) / 2, c.x, (this.rootY + this.kidsY) / 2, c.x, this.kidsY);
			ctx.stroke();
		});
		ctx.lineWidth = 1;
		for (const r of this.rollouts) {
			const c = this.candidates[r.c];
			const depth = this.kidsY + (this.floorY - this.kidsY - 40) * r.depth;
			if (!r.back) {
				// A rollout: a jagged run of moves down from the candidate
				const end = this.kidsY + (depth - this.kidsY) * r.t;
				ctx.strokeStyle = p.ink(0.35);
				ctx.beginPath();
				ctx.moveTo(c.x, this.kidsY + 14);
				for (let y = this.kidsY + 14, k = 0; y < end; y += 12, k++) ctx.lineTo(c.x + Math.sin(k * 2.1 + r.drift) * (6 + k) + (r.drift * (y - this.kidsY)) / (depth - this.kidsY + 1), y);
				ctx.stroke();
			} else {
				// The result travelling back to the root
				const y = depth + (this.rootY - depth) * r.t;
				const x = r.t < 0.7 ? c.x : c.x + (rootX - c.x) * ((r.t - 0.7) / 0.3);
				ctx.fillStyle = r.win ? p.accent(1) : p.ink(0.6);
				ctx.fillRect(x - 3, y - 3, 6, 6);
			}
		}
		ctx.fillStyle = p.ink(0.85);
		ctx.fillRect(rootX - 7, this.rootY - 7, 14, 14);
		const turn = this.ply < GAME.length ? (this.ply % 2 ? 'Black' : 'White') : 'White';
		text(ctx, p, `${turn} to move`, rootX + 16, this.rootY + 5, p.ink(0.75), 13);
		this.candidates.forEach((c, i) => {
			const size = 8 + (c.visits / total) * 18;
			ctx.fillStyle = i === best && total > 8 ? p.accent(1) : i === this.hover ? p.ink(0.95) : p.ink(0.6);
			ctx.fillRect(c.x - size / 2, this.kidsY - size / 2, size, size);
			tag(ctx, p, c.san, c.x, this.kidsY - size / 2 - 16, { align: 'center', size: 13, ink: i === best && total > 8 ? p.accent(1) : p.ink(0.85) });
			text(ctx, p, `${c.visits}`, c.x, this.kidsY + size / 2 + 18, p.muted(0.8), 12, 'center');
		});
		ctx.globalAlpha = 1;
	}

	poke(_x: number, _y: number, label: string) {
		if (/mcts|monte/i.test(label)) this.burst = 1.2;
		else if (this.pause <= 0) this.think = Math.max(this.think, THINK - 0.6);
	}
}
