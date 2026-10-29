import { approach, clamp, rng, type Frame, type Palette, type Scene, type Zone } from '@/app/components/field/types';
import { stageFor, tag, text, type Stage } from '@/app/components/field/stage';

/*
 * Book a call: this working week in Dallas, nine to five, in half-hour rows, with the real time now in
 * Dallas and in the visitor's own time zone, and a line across today at the current hour. Hours that
 * have passed are shaded. A thirty-minute block follows the pointer, snapped to the half hour, and
 * reads its time in Dallas and in the visitor's zone; left alone it moves between open hours ahead.
 * Nothing here shows Yasasvi's real availability: the booking page does that.
 */

const ZONE = 'America/Chicago';
const START = 9;
const SLOTS = 16; // half hours from nine to five
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

/** The wall clock in Dallas, as a Date whose local fields read Dallas time */
const dallasNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: ZONE }));
const clock = (d: Date, zone?: string) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', ...(zone ? { timeZone: zone } : {}) }).toLowerCase();

export class CalendarScene implements Scene {
	private s: Stage = { x: 0, y: 0, w: 0, h: 0 };
	private grid = { x: 0, y: 0, cw: 0, rh: 0 };
	private wall = dallasNow();
	private offset = 0; // Dallas wall time minus true time, ms
	private monday = new Date();
	private today = -1;
	private tick = 0;
	private block = { col: 2, row: 6, x: 0, y: 0 };
	private auto = 0;
	private flash = 0;
	private zoneName = '';
	private rand = rng(67);

	constructor() {
		this.refresh();
		// The visitor's zone by its name ("India Standard Time"), not its database city
		for (const timeZoneName of ['longGeneric', 'long'] as const) {
			try {
				this.zoneName = new Intl.DateTimeFormat('en-US', { timeZoneName }).formatToParts(new Date()).find((part) => part.type === 'timeZoneName')?.value ?? '';
				if (this.zoneName) break;
			} catch {
				this.zoneName = '';
			}
		}
	}

	/** Read the clocks again and work out which week to show */
	private refresh() {
		const now = new Date();
		this.wall = dallasNow();
		this.offset = this.wall.getTime() - now.getTime();
		const day = this.wall.getDay(); // 0 Sunday
		const monday = new Date(this.wall);
		// On a weekend, the coming week
		monday.setDate(this.wall.getDate() - ((day + 6) % 7) + (day === 0 || day === 6 ? 7 : 0));
		monday.setHours(0, 0, 0, 0);
		this.monday = monday;
		this.today = day >= 1 && day <= 5 ? day - 1 : -1;
	}

	resize(w: number, h: number, zone: Zone) {
		this.s = stageFor(w, h, zone);
		const { s } = this;
		const left = 54;
		const top = 96;
		this.grid = { x: s.x + left, y: s.y + top, cw: (s.w - left) / 5, rh: (s.h - top - 10) / SLOTS };
		this.block.x = this.grid.x + this.block.col * this.grid.cw;
		this.block.y = this.grid.y + this.block.row * this.grid.rh;
	}

	/** Hours of the shown week that are still ahead, in Dallas */
	private ahead(col: number, row: number) {
		if (this.today < 0) return true;
		if (col !== this.today) return col > this.today;
		const minutes = this.wall.getHours() * 60 + this.wall.getMinutes();
		return START * 60 + row * 30 >= minutes;
	}

	/** A slot's start, as a real instant */
	private instant(col: number, row: number) {
		const wall = new Date(this.monday);
		wall.setDate(this.monday.getDate() + col);
		wall.setHours(START + Math.floor(row / 2), (row % 2) * 30, 0, 0);
		return new Date(wall.getTime() - this.offset);
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		this.tick -= dt;
		if (this.tick <= 0) {
			this.tick = 1;
			this.refresh();
		}
		this.flash = Math.max(0, this.flash - dt);
		const g = this.grid;
		const over = pointer.active && pointer.x >= g.x && pointer.x < g.x + g.cw * 5 && pointer.y >= g.y && pointer.y < g.y + g.rh * SLOTS;
		if (over) {
			this.block.col = clamp(Math.floor((pointer.x - g.x) / g.cw), 0, 4);
			this.block.row = clamp(Math.floor((pointer.y - g.y) / g.rh), 0, SLOTS - 1);
		} else if (f.intro >= 1) {
			this.auto -= dt;
			if (this.auto <= 0) {
				this.auto = 1.6;
				// Wander to another hour still ahead
				for (let k = 0; k < 20; k++) {
					const col = Math.floor(this.rand() * 5);
					const row = Math.floor(this.rand() * (SLOTS - 1));
					if (this.ahead(col, row)) {
						this.block.col = col;
						this.block.row = row;
						break;
					}
				}
			}
		}
		this.block.x = approach(this.block.x, g.x + this.block.col * g.cw, 12, dt);
		this.block.y = approach(this.block.y, g.y + this.block.row * g.rh, 12, dt);
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const a = clamp(f.intro * 1.6, 0, 1);
		ctx.globalAlpha = a;
		const { s, grid: g } = this;

		// Two clocks, read live
		const now = new Date();
		text(ctx, p, 'Dallas', s.x, s.y + 16, p.muted(0.85), 13);
		text(ctx, p, clock(now, ZONE), s.x, s.y + 44, p.ink(0.95), 26);
		const yours = clock(now);
		const same = yours === clock(now, ZONE);
		text(ctx, p, same ? 'You, same time' : `You${this.zoneName ? `, ${this.zoneName}` : ''}`, s.x + Math.min(240, s.w * 0.45), s.y + 16, p.muted(0.85), 13);
		text(ctx, p, yours, s.x + Math.min(240, s.w * 0.45), s.y + 44, p.accent(1), 26);

		// The week
		for (let c = 0; c < 5; c++) {
			const date = new Date(this.monday);
			date.setDate(this.monday.getDate() + c);
			text(ctx, p, `${DAYS[c]} ${date.getDate()}`, g.x + c * g.cw + 8, g.y - 12, c === this.today ? p.accent(1) : p.ink(0.8), 13);
			for (let r = 0; r < SLOTS; r++) {
				ctx.fillStyle = this.ahead(c, r) ? p.ink(r % 2 ? 0.05 : 0.08) : p.ink(0.02);
				ctx.fillRect(g.x + c * g.cw + 2, g.y + r * g.rh + 1, g.cw - 4, g.rh - 2);
			}
		}
		for (let hr = 0; hr <= SLOTS / 2; hr++) {
			const h24 = START + hr;
			const label = `${((h24 + 11) % 12) + 1} ${h24 < 12 ? 'am' : 'pm'}`;
			text(ctx, p, label, g.x - 10, g.y + hr * 2 * g.rh + 4, p.muted(0.75), 11, 'right');
		}

		// Now, across today
		if (this.today >= 0) {
			const minutes = this.wall.getHours() * 60 + this.wall.getMinutes() - START * 60;
			if (minutes >= 0 && minutes <= SLOTS * 30) {
				const y = g.y + (minutes / 30) * g.rh;
				ctx.fillStyle = p.accent(0.95);
				ctx.fillRect(g.x + this.today * g.cw, y - 1, g.cw, 2);
				ctx.fillRect(g.x + this.today * g.cw - 4, y - 4, 8, 8);
			}
		}

		// The thirty-minute block, with its time in both zones
		const bx = this.block.x + 2;
		const by = this.block.y + 1;
		const bw = g.cw - 4;
		const bh = g.rh - 2;
		ctx.fillStyle = p.accent(0.9);
		ctx.fillRect(bx, by, bw, bh);
		if (this.flash > 0) {
			ctx.strokeStyle = p.accent(this.flash);
			ctx.lineWidth = 2;
			ctx.strokeRect(bx - 4, by - 4, bw + 8, bh + 8);
		}
		const start = this.instant(this.block.col, this.block.row);
		const label = `${clock(start, ZONE)} Dallas${same ? '' : ` · ${clock(start)} yours`}`;
		const right = bx + bw + 8 + 220 < s.x + s.w;
		tag(ctx, p, label, right ? bx + bw + 8 : bx - 8, by + bh / 2, { align: right ? 'left' : 'right', size: 12, ink: p.ink(0.95) });
		ctx.globalAlpha = 1;
	}

	poke() {
		this.flash = 1.2;
	}
}
