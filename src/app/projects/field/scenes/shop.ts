import { clamp, easeInOut, easeOut, rng, type Frame, type Palette, type Scene, type Zone } from '@/app/components/field/types';
import { arc, stageFor, tag, text, type Stage } from '@/app/components/field/stage';

/*
 * E-Commerce Shopping Platform: a shop from catalog to doorstep. Products are picked into the cart;
 * at checkout a card is charged (Stripe), the cart becomes a parcel, and the parcel travels the order
 * tracking line from ordered to delivered, where its buyer leaves a review on the product. The seller's
 * week of orders grows on the right. Pointing at a product adds it to the cart; the Stripe row checks
 * out, any other row adds something.
 */

type Product = { name: string; price: number; shape: number; x: number; y: number; added: number; stars: number; starT: number };
type Flying = { product: number; t: number };
type Parcel = { t: number; items: number[]; stage: number };
type Phase = 'shop' | 'pay' | 'pack';

const PRODUCTS: [string, number][] = [['Mug', 14], ['Lamp', 48], ['Tee', 22], ['Cap', 18], ['Plant', 26], ['Book', 16], ['Bag', 39], ['Vase', 31]];
const STOPS = ['Ordered', 'Packed', 'Shipped', 'Delivered'];

export class ShopScene implements Scene {
	private s: Stage = { x: 0, y: 0, w: 0, h: 0 };
	private products: Product[] = PRODUCTS.map(([name, price], i) => ({ name, price, shape: i % 6, x: 0, y: 0, added: -9, stars: 0, starT: 9 }));
	private tile = 80;
	private cart = { x: 0, y: 0, w: 0, h: 0 };
	private track = { x0: 0, x1: 0, y: 0 };
	private chart = { x: 0, y: 0, w: 0, h: 0 };
	private inCart: number[] = [];
	private flying: Flying[] = [];
	private parcels: Parcel[] = [];
	private phase: Phase = 'shop';
	private t = 0;
	private nextPick = 0.5;
	private week = [3, 5, 4, 6, 5, 7, 2];
	private clock = 0;
	private wantCheckout = false;
	private rand = rng(43);

	resize(w: number, h: number, zone: Zone) {
		this.s = stageFor(w, h, zone);
		const { s } = this;
		const side = s.w > 520;
		const cols = 4;
		const gap = side ? 12 : 8;
		const shelf = s.w * (side ? 0.62 : 1);
		// On a narrow stage the shelf, the cart and the tracking line all share the height
		this.tile = side ? clamp((shelf - gap * (cols - 1)) / cols, 56, 110) : clamp(Math.min((shelf - gap * 3) / 4, (s.h - 210) / 2 - 30), 40, 90);
		this.products.forEach((pr, i) => {
			pr.x = s.x + (i % cols) * (this.tile + gap);
			pr.y = s.y + 30 + Math.floor(i / cols) * (this.tile + 34);
		});
		const rows = Math.ceil(this.products.length / cols);
		const below = s.y + 30 + rows * (this.tile + 34);
		const cartX = side ? s.x + cols * (this.tile + gap) + 24 : s.x;
		const cartY = side ? s.y + 30 : below + 10;
		this.cart = { x: cartX, y: cartY + (side ? 0 : 14), w: side ? s.x + s.w - cartX : s.w * 0.5, h: side ? this.tile + 20 : 70 };
		this.chart = side
			? { x: cartX, y: cartY + this.cart.h + 46, w: this.cart.w, h: Math.min(110, this.tile) }
			: { x: s.x + s.w * 0.58, y: cartY + 14, w: s.w * 0.42, h: 70 };
		this.track = side
			? { x0: s.x + 8, x1: s.x + s.w - 8, y: Math.min(s.y + s.h - 40, Math.max(below, this.chart.y + this.chart.h) + 70) }
			: { x0: s.x + 8, x1: s.x + s.w - 8, y: this.cart.y + this.cart.h + 56 };
	}

	private add(i: number) {
		if (this.phase !== 'shop' || this.inCart.length + this.flying.length >= 4) return;
		this.products[i].added = this.clock;
		this.flying.push({ product: i, t: 0 });
	}

	private checkout() {
		if (this.phase !== 'shop') return;
		// Items still on their way to the cart are paid for once they land; an empty cart gets one first
		if (this.flying.length || !this.inCart.length) {
			if (!this.flying.length) this.add(Math.floor(this.rand() * this.products.length));
			this.wantCheckout = true;
			return;
		}
		this.wantCheckout = false;
		this.phase = 'pay';
		this.t = 0;
	}

	update(f: Frame) {
		const { dt, pointer } = f;
		this.clock += dt;
		this.t += dt;
		if (pointer.active) {
			const i = this.products.findIndex((pr) => pointer.x >= pr.x && pointer.x <= pr.x + this.tile && pointer.y >= pr.y && pointer.y <= pr.y + this.tile);
			if (i >= 0 && this.clock - this.products[i].added > 0.7) this.add(i);
		}
		if (f.intro > 0.6 && this.phase === 'shop') {
			this.nextPick -= dt;
			if (this.nextPick <= 0) {
				this.nextPick = 0.6 + this.rand() * 0.6;
				if (this.inCart.length >= 3) this.checkout();
				else this.add(Math.floor(this.rand() * this.products.length));
			}
		}
		for (let i = this.flying.length - 1; i >= 0; i--) {
			this.flying[i].t += dt / 0.65;
			if (this.flying[i].t >= 1) {
				this.inCart.push(this.flying[i].product);
				this.flying.splice(i, 1);
			}
		}
		if (this.wantCheckout && !this.flying.length) this.checkout();
		if (this.phase === 'pay' && this.t > 1.3) {
			this.phase = 'pack';
			this.t = 0;
		} else if (this.phase === 'pack' && this.t > 0.6) {
			this.parcels.push({ t: 0, items: this.inCart.slice(), stage: 0 });
			this.inCart = [];
			this.phase = 'shop';
			this.t = 0;
		}
		for (let i = this.parcels.length - 1; i >= 0; i--) {
			const pc = this.parcels[i];
			pc.t += dt / 4.2;
			pc.stage = Math.min(3, Math.floor(pc.t * 3.2));
			if (pc.t < 1) continue;
			// Delivered: a review on one of the products, and an order on the seller's chart
			const reviewed = this.products[pc.items[Math.floor(this.rand() * pc.items.length)]];
			reviewed.stars = this.rand() < 0.7 ? 5 : 4;
			reviewed.starT = 0;
			this.week[this.week.length - 1]++;
			this.parcels.splice(i, 1);
		}
		for (const pr of this.products) pr.starT += dt;
	}

	private shape(ctx: CanvasRenderingContext2D, k: number, cx: number, cy: number, r: number) {
		ctx.beginPath();
		if (k === 0) ctx.arc(cx, cy, r, 0, Math.PI * 2);
		else if (k === 1) {
			ctx.moveTo(cx, cy - r);
			ctx.lineTo(cx + r, cy + r * 0.8);
			ctx.lineTo(cx - r, cy + r * 0.8);
		} else if (k === 2) ctx.rect(cx - r * 0.8, cy - r * 0.8, r * 1.6, r * 1.6);
		else if (k === 3) ctx.rect(cx - r * 0.35, cy - r, r * 0.7, r * 2);
		else if (k === 4) {
			ctx.arc(cx, cy, r, Math.PI, 0);
			ctx.lineTo(cx - r, cy);
		} else ctx.rect(cx - r, cy - r * 0.45, r * 2, r * 0.9);
		ctx.fill();
	}

	private star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
		ctx.beginPath();
		for (let k = 0; k < 10; k++) {
			const rad = k % 2 ? r * 0.45 : r;
			const ang = -Math.PI / 2 + (k * Math.PI) / 5;
			ctx.lineTo(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad);
		}
		ctx.fill();
	}

	draw(ctx: CanvasRenderingContext2D, p: Palette, f: Frame) {
		const a = clamp(f.intro * 1.6, 0, 1);
		ctx.globalAlpha = a;
		const T = this.tile;

		// The catalog
		this.products.forEach((pr, i) => {
			const fresh = clamp(1 - (this.clock - pr.added) / 0.6, 0, 1);
			ctx.fillStyle = p.bg;
			ctx.fillRect(pr.x, pr.y, T, T);
			ctx.fillStyle = fresh ? p.accent(0.12 + fresh * 0.2) : p.ink(0.06);
			ctx.fillRect(pr.x, pr.y, T, T);
			ctx.fillStyle = i % 3 === 1 ? p.amber(0.75) : p.ink(0.45);
			this.shape(ctx, pr.shape, pr.x + T / 2, pr.y + T / 2, T * 0.22);
			text(ctx, p, pr.name, pr.x, pr.y + T + 16, p.ink(0.8), 12);
			// Small tiles keep the name only
			if (T >= 72) text(ctx, p, `$${pr.price}`, pr.x + T, pr.y + T + 16, p.muted(0.85), 12, 'right');
			if (pr.starT < 1.8) {
				ctx.globalAlpha = a * (1 - clamp((pr.starT - 1.3) / 0.5, 0, 1));
				const pop = easeOut(pr.starT / 0.3);
				for (let k = 0; k < 5; k++) {
					ctx.fillStyle = k < pr.stars ? p.accent(1) : p.ink(0.25);
					this.star(ctx, pr.x + T / 2 + (k - 2) * 14, pr.y - 10 - pop * 6, 6);
				}
				ctx.globalAlpha = a;
			}
		});

		// The cart
		const c = this.cart;
		ctx.fillStyle = p.ink(0.06);
		ctx.fillRect(c.x, c.y, c.w, c.h);
		text(ctx, p, `Cart · ${this.inCart.length}`, c.x, c.y - 10, p.ink(0.8), 13);
		const slot = (n: number): [number, number] => [c.x + 14 + n * 34, c.y + c.h - 36];
		const packing = this.phase === 'pack' ? easeInOut(this.t / 0.6) : 0;
		this.inCart.forEach((pi, n) => {
			const [x, y] = slot(n);
			const tx = c.x + c.w / 2 - 13;
			ctx.fillStyle = pi % 3 === 1 ? p.amber(0.75) : p.ink(0.5);
			ctx.fillRect(x + (tx - x) * packing, y, 26, 26);
		});
		for (const fl of this.flying) {
			const pr = this.products[fl.product];
			const [tx, ty] = slot(this.inCart.length + this.flying.indexOf(fl));
			const [x, y] = arc(pr.x + T / 2 - 13, pr.y + T / 2 - 13, tx, ty, 50, easeInOut(fl.t));
			ctx.fillStyle = fl.product % 3 === 1 ? p.amber(0.85) : p.ink(0.6);
			ctx.fillRect(x, y, 26, 26);
		}
		if (this.phase === 'pay') {
			// A card is charged
			const k = easeOut(this.t / 0.5);
			const cw = 74;
			const x = c.x + c.w - cw - 12 + (1 - k) * 40;
			ctx.globalAlpha = a * k;
			ctx.fillStyle = p.ink(0.75);
			ctx.fillRect(x, c.y + 12, cw, 46);
			ctx.fillStyle = p.bg;
			ctx.fillRect(x, c.y + 22, cw, 8);
			if (this.t > 0.6) tag(ctx, p, 'Paid', x - 8, c.y + 36, { align: 'right', ink: p.onAccent, ground: p.accent(1), weight: 700 });
			ctx.globalAlpha = a;
		}

		// The seller's week
		const ch = this.chart;
		text(ctx, p, 'Orders this week', ch.x, ch.y - 10, p.ink(0.8), 13);
		const max = Math.max(...this.week, 8);
		const bw = ch.w / this.week.length;
		this.week.forEach((v, i) => {
			const bh = (v / max) * ch.h;
			ctx.fillStyle = i === this.week.length - 1 ? p.accent(0.85) : p.ink(0.25);
			ctx.fillRect(ch.x + i * bw + 3, ch.y + ch.h - bh, bw - 6, bh);
		});

		// Order tracking
		const tr = this.track;
		ctx.fillStyle = p.ink(0.18);
		ctx.fillRect(tr.x0, tr.y - 1, tr.x1 - tr.x0, 2);
		STOPS.forEach((name, i) => {
			const x = tr.x0 + ((tr.x1 - tr.x0) * i) / (STOPS.length - 1);
			const reached = this.parcels.some((pc) => pc.stage >= i);
			ctx.fillStyle = reached ? p.accent(0.9) : p.ink(0.35);
			ctx.fillRect(x - 5, tr.y - 5, 10, 10);
			text(ctx, p, name, x, tr.y + 24, p.ink(0.7), 12, i === 0 ? 'left' : i === STOPS.length - 1 ? 'right' : 'center');
		});
		for (const pc of this.parcels) {
			const x = tr.x0 + (tr.x1 - tr.x0) * easeInOut(pc.t);
			ctx.fillStyle = p.amber(0.9);
			ctx.fillRect(x - 11, tr.y - 30, 22, 20);
			ctx.fillStyle = p.bg;
			ctx.fillRect(x - 1, tr.y - 30, 2, 20);
		}
		ctx.globalAlpha = 1;
	}

	poke(_x: number, _y: number, label: string) {
		if (/stripe/i.test(label)) this.checkout();
		else this.add(Math.floor(this.rand() * this.products.length));
	}
}
