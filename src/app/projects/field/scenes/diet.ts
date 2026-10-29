import { approach, clamp, easeInOut, rng, type Frame, type Palette, type Scene, type Zone } from '@/app/components/field/types';
import { arc, stageFor, tag, text, type Stage } from '../stage';

/*
 * Diet AI Agent: a day of eating, logged and analysed. Meals are logged into breakfast, lunch, a snack
 * and dinner; each food breaks into its protein, carbohydrate and fat, which flow into the day's three
 * rings. Before each meal the agent suggests what to eat next, given what the rings still need, and
 * the suggestion is what gets logged. At the end of the day the week's progress moves on. Pointing at
 * a meal logs a snack there; the OpenAI row asks the agent for a suggestion, the PostgreSQL row saves
 * the day.
 */

type Food = { name: string; macro: [number, number, number] }; // grams of protein, carbohydrate, fat
type Logged = { food: Food; meal: number; t: number };
type Grain = { macro: number; x: number; y: number; t: number; grams: number };

const FOODS: Food[] = [
	{ name: 'Oats', macro: [5, 27, 3] }, { name: 'Berries', macro: [1, 14, 0] }, { name: 'Eggs', macro: [12, 1, 10] },
	{ name: 'Toast', macro: [4, 15, 1] }, { name: 'Rice', macro: [4, 45, 0] }, { name: 'Salmon', macro: [25, 0, 13] },
	{ name: 'Greens', macro: [2, 5, 0] }, { name: 'Yogurt', macro: [10, 8, 4] }, { name: 'Lentils', macro: [18, 40, 1] },
	{ name: 'Apple', macro: [0, 25, 0] }, { name: 'Chicken', macro: [31, 0, 4] }, { name: 'Avocado', macro: [3, 12, 21] },
];
const MEALS = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
const MACROS = ['Protein', 'Carbs', 'Fat'];
const TARGET: [number, number, number] = [120, 220, 70];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export class DietScene implements Scene {
	private s: Stage = { x: 0, y: 0, w: 0, h: 0 };
	private slots: number[] = [];
	private slotY = 0;
	private ring = { x: 0, y: 0, r: 60 };
	private weekBox = { x: 0, y: 0, w: 0, h: 0 };
	private logged: Logged[] = [];
	private grains: Grain[] = [];
	private totals: [number, number, number] = [0, 0, 0];
	private shown: [number, number, number] = [0, 0, 0];
	private meal = 0;
	private perMeal = 0;
	private suggestion: Food | null = null;
	private suggestT = 0;
	private next = 1;
	private week = [0.82, 0.95, 0.74, 0.9, 0.86, 0, 0];
	private today = 5;
	private saved = 9;
	private lastHover = -9;
	private clock = 0;
	private rand = rng(47);

	resize(w: number, h: number, zone: Zone) {
		this.s = stageFor(w, h, zone);
		const { s } = this;
		const side = s.w > 560;
		const dayW = side ? s.w * 0.6 : s.w;
		this.slots = MEALS.map((_, i) => s.x + (dayW / MEALS.length) * i);
		this.slotY = s.y + 34;
		// On a narrow stage the rings and the week share the space under the day, legend below the rings
		const under = s.y + 150;
		const r = side ? clamp(Math.min(s.w - dayW - 40, s.h * 0.4) / 2, 50, 110) : clamp(Math.min(s.w * 0.2, (s.y + s.h - under - 70) / 2), 34, 80);
		this.ring = side ? { x: s.x + dayW + 40 + r, y: s.y + 40 + r, r } : { x: s.x + r + 6, y: under + r, r };
		this.weekBox = side
			? { x: s.x, y: s.y + s.h * 0.72, w: dayW - 30, h: s.h * 0.2 }
			: { x: s.x + r * 2 + 44, y: under + 18, w: s.w - r * 2 - 50, h: r * 2 - 30 };
	}

	private chipY(n: number) {
		return this.slotY + 34 + n * 30;
	}

	/** What the rings still need most, from the foods that supply it */
	private suggest(): Food {
		const need = TARGET.map((t, i) => (t - this.totals[i]) / t);
		const want = need.indexOf(Math.max(...need));
		const ranked = FOODS.slice().sort((a, b) => b.macro[want] - a.macro[want]);
		return ranked[Math.floor(this.rand() * 3)];
	}

	private log(food: Food, meal = this.meal) {
		const n = this.logged.filter((l) => l.meal === meal).length;
		if (n >= 3) return;
		this.logged.push({ food, meal, t: 0 });
		const x = this.slots[meal] + 40;
		const y = this.chipY(n);
		// The food breaks into its macros, a grain per ten grams or part of ten
		food.macro.forEach((grams, m) => {
			for (let g = grams; g > 0; g -= 10) this.grains.push({ macro: m, x, y, t: -this.rand() * 0.3, grams: Math.min(10, g) });
		});
	}

	private newDay() {
		this.week[this.today] = clamp((this.totals[0] / TARGET[0] + this.totals[1] / TARGET[1] + this.totals[2] / TARGET[2]) / 3, 0.4, 1);
		this.today = (this.today + 1) % 7;
		if (this.today === 0) this.week = this.week.map(() => 0);
		this.week[this.today] = 0;
		this.totals = [0, 0, 0];
		this.logged = [];
		this.meal = 0;
		this.perMeal = 0;
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		this.clock += dt;
		this.saved += dt;
		if (pointer.active && pointer.y > this.slotY - 20 && pointer.y < this.slotY + 140) {
			const i = this.slots.findIndex((x, k) => pointer.x >= x && pointer.x < (this.slots[k + 1] ?? x + (this.slots[1] - this.slots[0])));
			if (i >= 0 && this.clock - this.lastHover > 0.9) {
				this.lastHover = this.clock;
				this.log(FOODS[Math.floor(this.rand() * FOODS.length)], i);
			}
		}
		if (f.intro > 0.6) {
			this.next -= dt;
			if (this.suggestion) this.suggestT += dt;
			if (this.next <= 0) {
				this.next = 1.1 + this.rand() * 0.5;
				if (this.meal >= MEALS.length) {
					this.newDay();
				} else if (!this.suggestion && this.perMeal === 0) {
					// Before each meal the agent suggests
					this.suggestion = this.suggest();
					this.suggestT = 0;
				} else {
					this.log(this.suggestion ?? FOODS[Math.floor(this.rand() * FOODS.length)]);
					this.suggestion = null;
					this.perMeal++;
					if (this.perMeal >= (this.meal === 2 ? 1 : 2)) {
						this.meal++;
						this.perMeal = 0;
					}
				}
			}
		}
		for (let i = this.grains.length - 1; i >= 0; i--) {
			const g = this.grains[i];
			g.t += dt / 0.9;
			if (g.t >= 1) {
				this.totals[g.macro] += g.grams;
				this.grains.splice(i, 1);
			}
		}
		for (let m = 0; m < 3; m++) this.shown[m] = approach(this.shown[m], this.totals[m], 5, dt);
		for (const l of this.logged) l.t += dt;
		this.week[this.today] = approach(this.week[this.today], clamp((this.shown[0] / TARGET[0] + this.shown[1] / TARGET[1] + this.shown[2] / TARGET[2]) / 3, 0, 1), 3, dt);
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const a = clamp(f.intro * 1.6, 0, 1);
		ctx.globalAlpha = a;
		const tones = [p.ink, p.amber, p.accent];

		// The day: four meals along a line
		const right = this.slots[this.slots.length - 1] + (this.slots[1] - this.slots[0]);
		ctx.fillStyle = p.ink(0.16);
		ctx.fillRect(this.slots[0], this.slotY, right - this.slots[0] - 20, 1);
		MEALS.forEach((name, i) => {
			const x = this.slots[i];
			const now = i === this.meal;
			ctx.fillStyle = now ? p.accent(0.9) : i < this.meal ? p.ink(0.6) : p.ink(0.25);
			ctx.fillRect(x - 4, this.slotY - 4, 8, 8);
			text(ctx, p, name, x + 12, this.slotY + 5, now ? p.ink(0.95) : p.ink(0.65), 13);
		});
		this.logged.forEach((l) => {
			const n = this.logged.filter((k) => k.meal === l.meal).indexOf(l);
			const drop = easeInOut(l.t / 0.4);
			ctx.globalAlpha = a * drop;
			tag(ctx, p, l.food.name, this.slots[l.meal] + 6, this.chipY(n) - (1 - drop) * 14, { size: 12, ink: p.ink(0.9), ground: p.ink(0.12) });
		});
		ctx.globalAlpha = a;
		if (this.suggestion && this.meal < MEALS.length) {
			const n = this.logged.filter((k) => k.meal === this.meal).length;
			const x = this.slots[this.meal] + 6;
			const y = this.chipY(n);
			ctx.globalAlpha = a * clamp(this.suggestT / 0.3, 0, 1);
			const w = tag(ctx, p, `Try ${this.suggestion.name.toLowerCase()}`, x, y, { size: 12, ink: p.accent(1), ground: p.bg });
			ctx.strokeStyle = p.accent(0.9);
			ctx.lineWidth = 1.5;
			ctx.strokeRect(x + 0.75, y - 10.25, w - 1.5, 20.5);
			ctx.globalAlpha = a;
		}

		// The day's rings: protein outside, carbohydrate, fat inside
		const { x: rx, y: ry, r } = this.ring;
		ctx.lineWidth = Math.max(7, r * 0.13);
		for (let m = 0; m < 3; m++) {
			const rad = r - m * (ctx.lineWidth + 5);
			ctx.strokeStyle = p.ink(0.08);
			ctx.beginPath();
			ctx.arc(rx, ry, rad, 0, Math.PI * 2);
			ctx.stroke();
			const k = clamp(this.shown[m] / TARGET[m], 0, 1);
			if (k > 0.002) {
				ctx.strokeStyle = tones[m](0.9);
				ctx.beginPath();
				ctx.arc(rx, ry, rad, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2);
				ctx.stroke();
			}
			const ly = ry + r + 24 + m * 18;
			ctx.fillStyle = tones[m](0.9);
			ctx.fillRect(rx - r, ly - 8, 10, 10);
			text(ctx, p, `${MACROS[m]}  ${Math.round(this.shown[m])} of ${TARGET[m]} g`, rx - r + 18, ly + 1, p.ink(0.8), 12);
		}
		ctx.lineWidth = 1;

		// Grains in flight to their ring
		for (const g of this.grains) {
			if (g.t < 0) continue;
			const rad = r - g.macro * (Math.max(7, r * 0.13) + 5);
			const [x, y] = arc(g.x, g.y, rx, ry - rad, 40, easeInOut(g.t));
			ctx.fillStyle = tones[g.macro](0.95);
			ctx.fillRect(x - 2.5, y - 2.5, 5, 5);
		}

		// The week so far
		const wb = this.weekBox;
		text(ctx, p, 'This week', wb.x, wb.y - 10, p.ink(0.8), 13);
		const bw = wb.w / 7;
		this.week.forEach((v, i) => {
			const bh = v * wb.h;
			ctx.fillStyle = i === this.today ? p.accent(0.85) : p.ink(0.25);
			ctx.fillRect(wb.x + i * bw + 3, wb.y + wb.h - bh, bw - 6, bh);
			text(ctx, p, DAYS[i], wb.x + i * bw + bw / 2, wb.y + wb.h + 16, i === this.today ? p.ink(0.95) : p.muted(0.8), 12, 'center');
		});
		if (this.saved < 1.4) tag(ctx, p, 'Day saved', wb.x + wb.w, wb.y - 14, { align: 'right', ink: p.accent(1) });
		ctx.globalAlpha = 1;
	}

	poke(_x: number, _y: number, label: string) {
		if (/postgres/i.test(label)) {
			this.saved = 0;
			return;
		}
		if (/openai/i.test(label) && this.meal < MEALS.length) {
			this.suggestion = this.suggest();
			this.suggestT = 0;
			this.next = Math.max(this.next, 0.9);
			return;
		}
		if (this.meal < MEALS.length) this.log(FOODS[Math.floor(this.rand() * FOODS.length)]);
	}
}
