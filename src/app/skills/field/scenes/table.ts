import { clamp, easeInOut, rng, type Frame, type Palette, type Scene, type Zone } from '@/app/components/field/types';

/*
 * Data: a table of numbers, each cell drawn as a bar, with the query that runs against it written
 * above. A scan line passes down the rows and marks the ones that match, the rows sort by that
 * column so the matches rise to the top, and after a moment a few values change and the next query
 * starts. The pointer reads the cell under it; a skill row runs a query on the column beneath it.
 */

type Row = { vals: number[]; at: number; from: number; to: number; match: boolean; hit: number; changed: number[] };
type Phase = 'idle' | 'scan' | 'sort' | 'hold';

const PHASES: Record<Phase, number> = { idle: 0.9, scan: 1.3, sort: 1.2, hold: 2.4 };

export class TableScene implements Scene {
	private rows: Row[] = [];
	private cols = 8;
	private x0 = 0;
	private cellW = 100;
	private top = 0;
	private rowH = 24;
	private sqlY = 0;
	private phase: Phase = 'idle';
	private phaseT = 0;
	private col = 2;
	private limit = 0.62;
	private matches = 0;
	private rand = rng(17);
	private hoverRow = -1;
	private hoverCol = -1;

	resize(w: number, h: number, { quiet }: Zone) {
		const narrow = w < 700;
		this.x0 = w * 0.04;
		const span = w * 0.92;
		this.cols = clamp(Math.floor(span / 120), 4, 12);
		this.cellW = span / this.cols;
		this.rowH = narrow ? 22 : 24;
		this.sqlY = quiet ? quiet + 32 : h * 0.075;
		this.top = this.sqlY + 30;
		const count = clamp(Math.floor((h * 0.96 - this.top - this.rowH) / this.rowH), 6, 40);
		const rand = rng(41);
		this.rows = Array.from({ length: count }, (_, i) => ({
			vals: Array.from({ length: this.cols }, () => Math.pow(rand(), 0.8)),
			at: i,
			from: i,
			to: i,
			match: false,
			hit: 0,
			changed: new Array(this.cols).fill(0),
		}));
		this.col = Math.min(this.col, this.cols - 1);
		this.phase = 'idle';
		this.phaseT = 0;
	}

	private query(col: number) {
		this.col = col;
		this.limit = 0.55 + this.rand() * 0.2;
		this.phase = 'scan';
		this.phaseT = 0;
		this.matches = 0;
		for (const r of this.rows) {
			r.match = false;
			r.from = r.at;
			r.to = r.at;
		}
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		this.phaseT += dt;
		const R = this.rows.length;

		if (this.phase === 'scan') {
			const line = (this.phaseT / PHASES.scan) * R;
			for (const r of this.rows) {
				if (r.match || r.at > line) continue;
				if (r.vals[this.col] > this.limit) {
					r.match = true;
					r.hit = 1;
					this.matches++;
				}
			}
		}
		if (this.phase === 'sort') {
			for (const r of this.rows) r.at = r.from + (r.to - r.from) * easeInOut((this.phaseT - r.to * 0.012) / (PHASES.sort - 0.4));
		}
		if (this.phaseT >= PHASES[this.phase] && f.intro >= 1) {
			this.phaseT = 0;
			if (this.phase === 'idle') this.query((this.col + 1 + Math.floor(this.rand() * (this.cols - 1))) % this.cols);
			else if (this.phase === 'scan') {
				this.phase = 'sort';
				const order = this.rows.slice().sort((a, b) => b.vals[this.col] - a.vals[this.col]);
				order.forEach((r, i) => {
					r.from = r.at;
					r.to = i;
				});
			} else if (this.phase === 'sort') {
				this.phase = 'hold';
				for (const r of this.rows) r.at = r.to;
			} else {
				this.phase = 'idle';
				// New data arrives: a few values change before the next query
				for (let k = 0; k < Math.ceil(R * this.cols * 0.06); k++) {
					const r = this.rows[Math.floor(this.rand() * R)];
					const c = Math.floor(this.rand() * this.cols);
					r.vals[c] = Math.pow(this.rand(), 0.8);
					r.changed[c] = 1;
				}
			}
		}
		for (const r of this.rows) {
			if (this.phase === 'idle') r.hit = Math.max(0, r.hit - dt * 1.5);
			for (let c = 0; c < this.cols; c++) if (r.changed[c] > 0) r.changed[c] = Math.max(0, r.changed[c] - dt * 0.7);
		}
		this.hoverRow = -1;
		this.hoverCol = -1;
		if (pointer.active) {
			const ri = Math.floor((pointer.y - this.top - this.rowH) / this.rowH);
			const ci = Math.floor((pointer.x - this.x0) / this.cellW);
			if (ri >= 0 && ri < R && ci >= 0 && ci < this.cols) {
				this.hoverRow = ri;
				this.hoverCol = ci;
			}
		}
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const { x0, cellW, rowH, top, cols } = this;
		const R = this.rows.length;
		const span = cellW * cols;
		const rowY = (at: number) => top + rowH * (1 + at);
		const shown = (at: number) => clamp(f.intro * (R * 0.3 + 3) - at * 0.3, 0, 1);

		// The query, written as SQL
		const intro = clamp(f.intro * 2, 0, 1);
		ctx.globalAlpha = intro;
		ctx.font = `14px ${p.code}`;
		const c = `c${this.col + 1}`;
		const parts: [string, boolean][] = [
			['SELECT', true], [' * ', false], ['FROM', true], [' sales ', false], ['WHERE', true],
			[` ${c} > ${this.limit.toFixed(2)} `, false], ['ORDER BY', true], [` ${c} `, false], ['DESC', true], [';', false],
		];
		let x = x0;
		for (const [text, key] of parts) {
			ctx.fillStyle = key ? p.accent(0.85) : p.ink(0.6);
			ctx.fillText(text, x, this.sqlY + 14);
			x += ctx.measureText(text).width;
		}
		if (this.phase === 'sort' || this.phase === 'hold') {
			ctx.fillStyle = p.muted(0.8);
			ctx.fillText(`  ${this.matches} rows`, x, this.sqlY + 14);
		}

		// Column heads
		ctx.font = `12px ${p.code}`;
		for (let k = 0; k < cols; k++) {
			ctx.fillStyle = k === this.col ? p.accent(0.9) : p.muted(0.55);
			ctx.fillText(`c${k + 1}`, x0 + k * cellW + 10, top + rowH * 0.6);
		}
		ctx.fillStyle = p.ink(0.16);
		ctx.fillRect(x0, top + rowH - 1, span, 1);
		ctx.fillStyle = p.accent(0.8);
		ctx.fillRect(x0 + this.col * cellW + 10, top + rowH - 2, cellW - 20, 2);
		ctx.globalAlpha = 1;

		if (this.hoverRow >= 0) {
			ctx.fillStyle = p.ink(0.05);
			ctx.fillRect(x0, rowY(this.hoverRow), span, rowH);
			ctx.fillRect(x0 + this.hoverCol * cellW, top + rowH, cellW, R * rowH);
		}

		for (const r of this.rows) {
			const a = shown(r.at);
			if (a <= 0) continue;
			const y = rowY(r.at);
			ctx.globalAlpha = a;
			if (r.match || r.hit > 0) {
				ctx.fillStyle = p.accent(0.08 * Math.max(r.hit, r.match && this.phase !== 'idle' ? 1 : 0));
				ctx.fillRect(x0, y + 1, span, rowH - 2);
			}
			for (let k = 0; k < cols; k++) {
				const len = r.vals[k] * (cellW - 20);
				const active = k === this.col && this.phase !== 'idle';
				ctx.fillStyle = active && r.match ? p.accent(0.85) : r.changed[k] > 0 ? p.amber(0.25 + r.changed[k] * 0.6) : active ? p.ink(0.34) : p.ink(0.17);
				ctx.fillRect(x0 + k * cellW + 10, y + rowH / 2 - 2, len, 4);
			}
		}
		ctx.globalAlpha = 1;

		if (this.phase === 'scan') {
			const line = rowY(Math.min(R, (this.phaseT / PHASES.scan) * R));
			ctx.fillStyle = p.accent(0.8);
			ctx.fillRect(x0, line - 1, span, 2);
		}

		if (this.hoverRow >= 0) {
			const r = this.rows.find((row) => Math.round(row.at) === this.hoverRow);
			if (r) {
				const v = r.vals[this.hoverCol];
				ctx.font = `12px ${p.code}`;
				const label = v.toFixed(2);
				const lx = x0 + this.hoverCol * cellW + 10 + v * (cellW - 20) + 6;
				const ly = rowY(this.hoverRow) + rowH / 2 + 4;
				ctx.fillStyle = p.bg;
				ctx.fillRect(lx - 3, ly - 12, ctx.measureText(label).width + 6, 16);
				ctx.fillStyle = p.ink(0.9);
				ctx.fillText(label, lx, ly);
			}
		}
	}

	poke(x: number) {
		this.query(clamp(Math.floor((x - this.x0) / this.cellW), 0, this.cols - 1));
	}
}
