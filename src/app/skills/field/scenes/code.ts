import { approach, clamp, easeInOut, type Frame, type Palette, type Scene, type Zone } from '@/app/components/field/types';

/*
 * Languages: one small function, a rolling average over the last twelve months of sales, written in
 * each language on the list. Every few seconds it is rewritten in the next one: words the two
 * versions share (sales, window, return, the function's name) glide to their new places, and the
 * syntax that belongs to one language gives way to the other's. Pointing at a language's row
 * rewrites the function in that language; the pointer nudges the words it passes.
 */

const VERSIONS: { name: string; src: string }[] = [
	{
		name: 'Java',
		src: `// Java
double rollingMean(double[] sales, int window) {
    double sum = 0;
    for (int i = sales.length - window; i < sales.length; i++) {
        sum += sales[i];
    }
    return sum / window;
}`,
	},
	{
		name: 'JavaScript',
		src: `// JavaScript
function rollingMean(sales, window = 12) {
  const recent = sales.slice(-window);
  return recent.reduce((sum, x) => sum + x, 0) / recent.length;
}`,
	},
	{
		name: 'Python',
		src: `# Python
def rolling_mean(sales, window=12):
    recent = sales[-window:]
    return sum(recent) / len(recent)`,
	},
	{
		name: 'TypeScript',
		src: `// TypeScript
function rollingMean(sales: number[], window = 12): number {
  const recent = sales.slice(-window);
  return recent.reduce((sum, x) => sum + x, 0) / recent.length;
}`,
	},
	{
		name: 'C++',
		src: `// C++
double rollingMean(const std::vector<double>& sales, size_t window) {
    auto first = sales.end() - window;
    return std::accumulate(first, sales.end(), 0.0) / window;
}`,
	},
	{
		name: 'Go',
		src: `// Go
func rollingMean(sales []float64, window int) float64 {
    sum := 0.0
    for _, x := range sales[len(sales)-window:] {
        sum += x
    }
    return sum / float64(window)
}`,
	},
];

type Kind = 'comment' | 'keyword' | 'type' | 'ident' | 'number' | 'punct';
type Token = { text: string; kind: Kind; key: string; col: number; line: number };

const KEYWORDS = new Set(['def', 'return', 'function', 'const', 'func', 'for', 'range', 'auto', 'in']);
const TYPES = new Set(['double', 'int', 'float64', 'number', 'size_t', 'std', 'vector']);

const tokenize = (src: string): Token[] => {
	const out: Token[] = [];
	src.split('\n').forEach((text, line) => {
		const re = /(\/\/.*|#.*)|([A-Za-z_][A-Za-z0-9_]*)|(\d+(?:\.\d+)?)|(:=|=>|\+=|::|<=|\+\+)|(\S)/g;
		let m: RegExpExecArray | null;
		while ((m = re.exec(text))) {
			const t = m[0];
			const kind: Kind = m[1] ? 'comment' : m[2] ? (KEYWORDS.has(t) ? 'keyword' : TYPES.has(t) ? 'type' : 'ident') : m[3] ? 'number' : 'punct';
			// rolling_mean and rollingMean are the same word in two spellings
			const key = m[2] ? t.toLowerCase().replace(/_/g, '') : kind === 'comment' ? '#comment' : t;
			out.push({ text: t, kind, key, col: m.index, line });
		}
	});
	return out;
};

const PARSED = VERSIONS.map((v) => tokenize(v.src));
const MAX_COLS = Math.max(...VERSIONS.map((v) => Math.max(...v.src.split('\n').map((l) => l.length))));
const MAX_LINES = Math.max(...VERSIONS.map((v) => v.src.split('\n').length));

type Live = Token & { fromCol: number; fromLine: number; matched: boolean };

const HOLD = 3.2;
const MORPH = 1.2;

export class CodeScene implements Scene {
	private cur = 0;
	private live: Live[] = [];
	private leaving: Token[] = [];
	private since = HOLD; // seconds since the last rewrite began
	private w = 0;
	private h = 0;
	private quiet = 0;
	private size = 16;
	private cw = 9.6;
	private measured: Palette | null = null;
	private px = -1e4;
	private py = -1e4;
	private presence = 0;

	constructor() {
		this.live = PARSED[0].map((t) => ({ ...t, fromCol: t.col, fromLine: t.line, matched: true }));
	}

	resize(w: number, h: number, { quiet }: Zone) {
		this.w = w;
		this.h = h;
		this.quiet = quiet;
		this.measured = null;
	}

	/** The band the block may use: below the held title, or, where the title scrolls, the top of the field */
	private get band(): [number, number] {
		return this.quiet ? [this.quiet + 28, this.h * 0.96] : [this.h * 0.05, this.h * 0.5];
	}

	/** Where a word is right now, partway through a rewrite or at rest */
	private progress(t: Live) {
		return easeInOut((this.since - t.line * 0.05) / (MORPH - 0.3));
	}

	private rewrite(next: number) {
		if (next === this.cur) return;
		// Start from where each word is now, so a rewrite can interrupt another without a jump
		const before: Token[] = this.live.map((t) => {
			const k = this.progress(t);
			return { ...t, col: t.fromCol + (t.col - t.fromCol) * k, line: t.fromLine + (t.line - t.fromLine) * k };
		});
		const used = new Array(before.length).fill(false);
		this.live = PARSED[next].map((t) => {
			const k = before.findIndex((b, i) => !used[i] && b.key === t.key);
			if (k < 0) return { ...t, fromCol: t.col, fromLine: t.line, matched: false };
			used[k] = true;
			return { ...t, fromCol: before[k].col, fromLine: before[k].line, matched: true };
		});
		this.leaving = before.filter((_, i) => !used[i]);
		this.cur = next;
		this.since = 0;
	}

	update(f: Frame) {
		this.since += f.dt;
		if (f.intro >= 1 && this.since > HOLD + MORPH) this.rewrite((this.cur + 1) % VERSIONS.length);
		const p = f.pointer;
		if (p.active) {
			this.px = this.presence < 0.05 ? p.x : approach(this.px, p.x, 12, f.dt);
			this.py = this.presence < 0.05 ? p.y : approach(this.py, p.y, 12, f.dt);
		}
		this.presence = approach(this.presence, p.active ? 1 : 0, 6, f.dt);
	}

	private measure(ctx: CanvasRenderingContext2D, p: Palette) {
		const wide = this.w >= 900;
		const room = wide ? Math.min(this.w * 0.66, 1080) : this.w * 0.9;
		ctx.font = `100px ${p.code}`;
		const per100 = ctx.measureText('0').width || 60;
		// Columns plus a four-column gutter for line numbers, and every line within the band
		const [b0, b1] = this.band;
		// On a phone no line fits whole at a readable size, so the block keeps its size and runs off the right edge
		const fit = wide ? (room / (MAX_COLS + 4)) * (100 / per100) : 14;
		this.size = clamp(Math.min(fit, (b1 - b0) / (MAX_LINES * 1.75)), 11, 26);
		this.cw = (per100 * this.size) / 100;
		this.measured = p;
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		if (this.measured !== p) this.measure(ctx, p);
		const lh = this.size * 1.75;
		const wide = this.w >= 900;
		const x0 = wide ? this.w * 0.055 : this.w * 0.05;
		const [b0, b1] = this.band;
		const y0 = b0 + Math.max(0, (b1 - b0 - MAX_LINES * lh) / 2) + lh * 0.8;
		const gutter = 4 * this.cw;
		const col = (c: number) => x0 + gutter + c * this.cw;
		const row = (l: number) => y0 + l * lh;
		const lines = VERSIONS[this.cur].src.split('\n').length;
		ctx.font = `${this.size}px ${p.code}`;
		ctx.textBaseline = 'alphabetic';

		// Line numbers, as an editor shows them
		ctx.fillStyle = p.muted(0.28);
		ctx.textAlign = 'right';
		for (let l = 0; l < lines; l++) {
			const a = clamp(f.intro * (lines + 2) - l, 0, 1);
			if (a <= 0) continue;
			ctx.globalAlpha = a;
			ctx.fillText(String(l + 1), x0 + gutter - this.cw * 1.5, row(l));
		}
		ctx.textAlign = 'left';
		ctx.globalAlpha = 1;

		const colour = (k: Kind, a: number) =>
			k === 'keyword' ? p.accent(a * 0.75) : k === 'type' || k === 'number' ? p.amber(a * 0.7) : k === 'comment' ? p.muted(a * 0.6) : k === 'punct' ? p.ink(a * 0.32) : p.ink(a * 0.55);

		const out = clamp(this.since / (MORPH * 0.5), 0, 1);
		for (const t of this.leaving) {
			if (out >= 1) break;
			ctx.fillStyle = colour(t.kind, 1 - out);
			ctx.fillText(t.text, col(t.col), row(t.line) - out * lh * 0.4);
		}

		for (const t of this.live) {
			// Lines move one after another, top to bottom
			const k = this.progress(t);
			let x = col(t.fromCol + (t.col - t.fromCol) * k);
			let y = row(t.fromLine + (t.line - t.fromLine) * k);
			let a = t.matched ? 1 : k;
			if (!t.matched) y += (1 - k) * lh * 0.4;
			a *= clamp(f.intro * (lines + 2) - t.line, 0, 1);
			if (a <= 0) continue;
			let lift = 0;
			if (this.presence > 0.01) {
				const cx = x + (t.text.length * this.cw) / 2;
				const d = Math.hypot(cx - this.px, y - this.size * 0.35 - this.py);
				if (d < 160) {
					lift = (1 - d / 160) * this.presence;
					const push = lift * lift * 16;
					x += ((cx - this.px) / (d || 1)) * push;
					y += ((y - this.py) / (d || 1)) * push;
				}
			}
			ctx.fillStyle = colour(t.kind, clamp(a * (1 + lift * 0.9), 0, 1.4));
			ctx.fillText(t.text, x, y);
		}
	}

	poke(_x: number, _y: number, label: string) {
		const next = VERSIONS.findIndex((v) => v.name === label);
		if (next >= 0) this.rewrite(next);
	}
}
