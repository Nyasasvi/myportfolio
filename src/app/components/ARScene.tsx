'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import Link from 'next/link';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { experience } from '../resources/consts';
import { showcase } from '../resources/showcase';
import { AVATAR_FOOT, AVATAR_H, AVATAR_W, REST_POSE, createAvatarRig, drawAvatar, type AvatarRig } from './ar/avatar';
import './ar-scene.css';

// ---------- What orbits ----------

type Detail = { title: string; text: string; links: { label: string; href: string }[] };

type Card = { id: string; detail: Detail } & (
	| { kind: 'intro'; title: string; line: string; foot: string }
	| { kind: 'figure'; figure: string; line: string; foot: string }
	| { kind: 'project'; title: string; foot: string; image: string; thumb: string }
);

const [twistedX, jpmorgan, colombo, hcl] = experience;

function projectCard(name: string): Card[] {
	const p = showcase.find((s) => s.name === name);
	if (!p) return [];
	const links: Detail['links'] = [];
	if (p.liveDemo) links.push({ label: 'Open the demo', href: p.liveDemo });
	if (p.repo) links.push({ label: 'Read the code', href: p.repo });
	return [
		{
			id: p.slug || p.name,
			kind: 'project',
			title: p.name,
			foot: p.technologies.slice(0, 3).join(' · '),
			image: p.image.large,
			thumb: p.image.small,
			detail: { title: p.name, text: p.why, links },
		},
	];
}

// Figures and roles alternate with projects so neighbours on the ring never look alike
const CARDS: Card[] = [
	{
		id: 'intro',
		kind: 'intro',
		title: 'Yasasvi Nellore',
		line: `${twistedX.role} at Twisted X Global Brands`,
		foot: 'Dallas, Texas · 4+ years building software',
		detail: {
			title: 'Yasasvi Nellore',
			text: 'Software engineer in Dallas with 4+ years across Java, Python and TypeScript. Since December 2024 I’ve built AI agents and the software around them at Twisted X.',
			links: [
				{ label: 'About me', href: '/about' },
				{ label: 'Resume (PDF)', href: '/assets/resume.pdf' },
			],
		},
	},
	{
		id: 'twisted-x',
		kind: 'figure',
		figure: '70%',
		line: 'less time spent on supply-chain reporting',
		foot: `Agentic AI platform · ${twistedX.company.replace(' Global Brands', '')}`,
		detail: {
			title: 'Agentic supply chain',
			text: 'Built on LangChain, LangGraph and RAG, it reasons across NetSuite, supplier APIs and logistics data. Reporting takes 70% less time and fulfillment is up 15%.',
			links: [{ label: 'Read the Twisted X chapter', href: '/about#twisted-x' }],
		},
	},
	...projectCard('AI Image Generation Platform'),
	{
		id: 'forecast',
		kind: 'figure',
		figure: '11–21%',
		line: 'forecast error (WAPE), down from 24–31%',
		foot: 'TimesFM 3 forecasting · Twisted X',
		detail: {
			title: 'Forecasts that miss by less',
			text: 'Rolling 12-month averages missed by 24–31% WAPE. Google TimesFM 3, with feature engineering and fine-tuning, brought that to 11–21% across SKUs and cut manual tracking by 40%.',
			links: [{ label: 'Read the Twisted X chapter', href: '/about#twisted-x' }],
		},
	},
	...projectCard('AI Mock Interview Platform'),
	{
		id: 'jpmorgan',
		kind: 'figure',
		figure: '+15%',
		line: 'more relevant answers from RAG prototypes',
		foot: `AI research · ${jpmorgan.company}`,
		detail: {
			title: `RAG at ${jpmorgan.company}`,
			text: 'LLM prototypes built with retrieval-augmented generation and prompt engineering gave answers 15% more relevant than the baseline on internal test sets.',
			links: [{ label: 'Read the JPMorgan chapter', href: '/about#jpmorgan' }],
		},
	},
	...projectCard('Diet AI Agent'),
	{
		id: 'colombo-ai',
		kind: 'figure',
		figure: '+30%',
		line: 'engagement from the personalized feed',
		foot: `Feed ranking · ${colombo.company}`,
		detail: {
			title: 'The Colombo AI feed',
			text: 'The personalized feed, end to end in TypeScript, Node.js, React and PostgreSQL, ranked on affinity, engagement and recency. Engagement rose 30%.',
			links: [{ label: 'Read the Colombo AI chapter', href: '/about#colombo-ai' }],
		},
	},
	...projectCard('Chess Bellator'),
	{
		id: 'hcl',
		kind: 'figure',
		figure: '500 GB',
		line: 'of data a day through Spark and Kafka',
		foot: `Data pipelines · ${hcl.company}`,
		detail: {
			title: '500 GB a day at HCL',
			text: 'ETL and streaming pipelines on Spark, Kafka and HDFS processed 500 GB a day and cut job latency by 30%.',
			links: [{ label: 'Read the HCL chapter', href: '/about#hcl' }],
		},
	},
];

// ---------- Theme ----------

type Ink = { card: string; edge: string; fg: string; muted: string; accent: string; display: string; body: string };

function readInk(): Ink {
	const probe = document.createElement('span');
	probe.style.display = 'none';
	document.body.appendChild(probe);
	const color = (v: string) => {
		probe.style.color = `var(${v})`;
		return getComputedStyle(probe).color;
	};
	const font = (v: string) => {
		probe.style.fontFamily = `var(${v})`;
		return getComputedStyle(probe).fontFamily;
	};
	const light = document.documentElement.getAttribute('data-theme') === 'light';
	const ink = {
		card: color(light ? '--ds-glass-bg' : '--ds-surface-2'),
		edge: color('--ds-border-strong'),
		fg: color('--ds-fg'),
		muted: color('--ds-fg-muted'),
		accent: color('--ds-accent'),
		display: font('--ds-font-display'),
		body: font('--ds-font-body'),
	};
	probe.remove();
	return ink;
}

function rgba(css: string, alpha: number) {
	const m = css.match(/\d+(\.\d+)?/g) ?? ['0', '0', '0'];
	return `rgba(${m[0]}, ${m[1]}, ${m[2]}, ${alpha})`;
}

// ---------- Drawing the cards ----------

const TEX_W = 768;
const TEX_H = 512;
const CARD_W = 1.2; // world units; the texture keeps the same 3:2
const CARD_H = 0.8;

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
	const lines: string[] = [];
	let line = '';
	for (const word of text.split(' ')) {
		const next = line ? `${line} ${word}` : word;
		if (line && ctx.measureText(next).width > max) {
			lines.push(line);
			line = word;
		} else line = next;
	}
	if (line) lines.push(line);
	return lines;
}

function fit(ctx: CanvasRenderingContext2D, text: string, max: number) {
	if (ctx.measureText(text).width <= max) return text;
	let t = text;
	while (t.length > 1 && ctx.measureText(`${t}…`).width > max) t = t.slice(0, -1);
	return `${t.trimEnd()}…`;
}

function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
	const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
	const sw = w / s;
	const sh = h / s;
	ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, w, h);
}

function drawCard(ctx: CanvasRenderingContext2D, card: Card, ink: Ink, image?: HTMLImageElement) {
	const pad = 44;
	const inner = TEX_W - pad * 2;
	ctx.clearRect(0, 0, TEX_W, TEX_H);
	ctx.fillStyle = ink.card;
	ctx.fillRect(0, 0, TEX_W, TEX_H);
	ctx.textBaseline = 'alphabetic';

	if (card.kind === 'project') {
		const ih = 300;
		if (image?.complete && image.naturalWidth) cover(ctx, image, TEX_W, ih);
		else {
			ctx.fillStyle = ink.edge;
			ctx.fillRect(0, 0, TEX_W, ih);
		}
		// Long names shrink a little before they would be cut short
		ctx.fillStyle = ink.fg;
		let size = 46;
		ctx.font = `700 ${size}px ${ink.display}`;
		while (size > 34 && ctx.measureText(card.title).width > inner) {
			size -= 2;
			ctx.font = `700 ${size}px ${ink.display}`;
		}
		ctx.fillText(fit(ctx, card.title, inner), pad, ih + 82);
		ctx.fillStyle = ink.muted;
		ctx.font = `400 31px ${ink.body}`;
		ctx.fillText(fit(ctx, card.foot, inner), pad, TEX_H - pad);
	} else if (card.kind === 'figure') {
		ctx.fillStyle = ink.accent;
		ctx.font = `700 150px ${ink.display}`;
		ctx.fillText(fit(ctx, card.figure, inner), pad - 4, pad + 128);
		ctx.fillStyle = ink.fg;
		ctx.font = `500 40px ${ink.body}`;
		wrap(ctx, card.line, inner)
			.slice(0, 2)
			.forEach((l, i) => ctx.fillText(l, pad, 262 + i * 52));
		ctx.fillStyle = ink.muted;
		ctx.font = `400 31px ${ink.body}`;
		ctx.fillText(fit(ctx, card.foot, inner), pad, TEX_H - pad);
	} else {
		ctx.fillStyle = ink.fg;
		ctx.font = `700 76px ${ink.display}`;
		ctx.fillText(fit(ctx, card.title, inner), pad - 2, pad + 92);
		ctx.font = `500 40px ${ink.body}`;
		wrap(ctx, card.line, inner)
			.slice(0, 2)
			.forEach((l, i) => ctx.fillText(l, pad, 236 + i * 52));
		ctx.fillStyle = ink.muted;
		ctx.font = `400 31px ${ink.body}`;
		ctx.fillText(fit(ctx, card.foot, inner), pad, TEX_H - pad);
	}

	ctx.strokeStyle = ink.edge;
	ctx.lineWidth = 4;
	ctx.strokeRect(2, 2, TEX_W - 4, TEX_H - 4);
}

/** One canvas texture per card, redrawn when the theme changes or a picture arrives */
function useCardTextures(ink: Ink) {
	const set = useMemo(
		() =>
			CARDS.map(() => {
				const canvas = document.createElement('canvas');
				canvas.width = TEX_W;
				canvas.height = TEX_H;
				const texture = new THREE.CanvasTexture(canvas);
				texture.colorSpace = THREE.SRGBColorSpace;
				texture.anisotropy = 4;
				return { canvas, texture, image: undefined as HTMLImageElement | undefined };
			}),
		[],
	);

	useEffect(() => {
		let live = true;
		const paint = (i: number) => {
			const { canvas, texture, image } = set[i];
			const ctx = canvas.getContext('2d');
			if (!ctx) return;
			drawCard(ctx, CARDS[i], ink, image);
			texture.needsUpdate = true;
		};
		// Paint now with whatever fonts are ready, then again once the page's fonts have loaded
		CARDS.forEach((_, i) => paint(i));
		document.fonts?.ready.then(() => live && CARDS.forEach((_, i) => paint(i)));
		CARDS.forEach((card, i) => {
			if (card.kind !== 'project' || set[i].image) return;
			const img = new Image();
			img.decoding = 'async';
			img.onload = () => live && paint(i);
			img.src = card.image;
			set[i].image = img;
		});
		return () => {
			live = false;
		};
	}, [ink, set]);

	useEffect(() => () => set.forEach((s) => s.texture.dispose()), [set]);

	return set.map((s) => s.texture);
}

function useCanvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void, deps: unknown[]) {
	const texture = useMemo(() => {
		const canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		const t = new THREE.CanvasTexture(canvas);
		t.colorSpace = THREE.SRGBColorSpace;
		return t;
	}, [size]);
	useEffect(() => {
		const canvas = texture.image as HTMLCanvasElement;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, size, size);
		draw(ctx, size);
		texture.needsUpdate = true;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [texture, ...deps]);
	useEffect(() => () => texture.dispose(), [texture]);
	return texture;
}

// ---------- The ring's motion ----------

const TAU = Math.PI * 2;
const COUNT = CARDS.length;
const STEP = TAU / COUNT;
const DWELL = 4.2; // seconds each card rests in front before the ring moves on
const HOLD = 10; // after the visitor steers, the ring waits this long before moving on its own

type Ring = {
	phi: number;
	from: number;
	target: number | null;
	targetIndex: number;
	start: number;
	dur: number;
	omega: number; // a fling, coasting to a stop
	nextStep: number;
	hovered: number | null;
	dragging: boolean;
	paused: boolean;
	reduced: boolean;
	pointer: { x: number; y: number };
};

const now = () => performance.now() / 1000;
const wrapIndex = (i: number) => ((i % COUNT) + COUNT) % COUNT;
const frontIndex = (phi: number) => wrapIndex(-Math.round(phi / STEP));
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

/** Turn the ring so card i comes to the front by the shortest way round */
function aim(r: Ring, i: number, dur: number) {
	const k = Math.round((r.phi + i * STEP) / TAU);
	r.from = r.phi;
	r.target = k * TAU - i * STEP;
	r.targetIndex = i;
	r.start = now();
	r.dur = r.reduced ? 0 : dur;
	r.omega = 0;
}

function advance(r: Ring, dt: number, t: number) {
	if (r.dragging) return;
	if (r.omega !== 0) {
		r.omega *= Math.exp(-dt * 1.8);
		r.phi += r.omega * dt;
		if (Math.abs(r.omega) < 0.35) aim(r, frontIndex(r.phi), 0.7);
		return;
	}
	if (r.target !== null) {
		const p = r.dur ? Math.min(1, (t - r.start) / r.dur) : 1;
		r.phi = r.from + (r.target - r.from) * easeInOut(p);
		if (p >= 1) {
			r.phi = r.target;
			r.target = null;
			r.nextStep = Math.max(r.nextStep, t + DWELL);
		}
		return;
	}
	if (!r.paused && !r.reduced && r.hovered === null && t >= r.nextStep) aim(r, wrapIndex(frontIndex(r.phi) + 1), 1.7);
}

// ---------- Scene layout ----------

const FOV = 38;

type Layout = ReturnType<typeof layoutFor>;

function layoutFor(w: number, h: number) {
	const narrow = w < 640;
	const radius = narrow ? 1.6 : 2.65;
	const card = narrow ? 0.76 : 0.92;
	const tanH = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
	const aspect = w / Math.max(h, 1);
	// Far enough back that the whole figure stays in view, and on wider stages the ring's sides too;
	// on a phone the sides run off the edge so I stay large
	const sideFit = (radius + CARD_W * 0.42 * card) / (tanH * aspect) + 0.3;
	const heightFit = 2.65 / tanH;
	return {
		narrow,
		radius,
		card,
		camZ: narrow ? heightFit : Math.min(10.5, Math.max(sideFit, heightFit)),
		camY: 0.55,
		lookY: narrow ? 0.3 : 0,
		floor: -1.62,
		personH: 3.9,
		// The ring circles my waist: it passes in front low down and slips behind my back
		ringY: narrow ? -0.05 : 0,
		tilt: narrow ? 0.7 : 0.8,
	};
}

// ---------- Scene pieces ----------

function Rig({ layout, ring }: { layout: Layout; ring: MutableRefObject<Ring> }) {
	useFrame(({ camera }, dt) => {
		const r = ring.current;
		const sway = r.reduced ? 0 : 1;
		const k = 1 - Math.exp(-Math.min(dt, 0.05) * 3);
		const tx = r.pointer.x * 0.7 * sway;
		const ty = layout.camY - r.pointer.y * 0.3 * sway;
		camera.position.x += (tx - camera.position.x) * k;
		camera.position.y += (ty - camera.position.y) * k;
		camera.position.z += (layout.camZ - camera.position.z) * k;
		camera.lookAt(0, layout.lookY, 0);
	});
	return null;
}

type AvatarProps = {
	layout: Layout;
	ring: MutableRefObject<Ring>;
	rig: MutableRefObject<AvatarRig>;
	onHover: (on: boolean) => void;
	onTap: () => void;
};

/** The drawn me, redrawn into a texture up to 30 times a second as the rig moves */
function Avatar({ layout, ring, rig, onHover, onTap }: AvatarProps) {
	const scale = layout.narrow ? 0.7 : 1;
	const art = useMemo(() => {
		const canvas = document.createElement('canvas');
		canvas.width = Math.round(AVATAR_W * scale);
		canvas.height = Math.round(AVATAR_H * scale);
		const texture = new THREE.CanvasTexture(canvas);
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.anisotropy = 8;
		return { canvas, ctx: canvas.getContext('2d'), texture };
	}, [scale]);
	useEffect(() => () => art.texture.dispose(), [art]);

	const group = useRef<THREE.Group>(null);
	const clock = useRef({ since: 1, drawnStill: false, greeted: false });
	const h = layout.personH;
	const w = h * (AVATAR_W / AVATAR_H);

	useFrame(({ camera }, delta) => {
		const g = group.current;
		const ctx = art.ctx;
		if (!g || !ctx) return;
		// Turn to face the viewer around the vertical axis only, so I always stand upright and face on
		g.rotation.y = Math.atan2(camera.position.x, camera.position.z);

		const r = ring.current;
		const a = rig.current;
		const c = clock.current;
		const still = r.reduced;
		if (!c.greeted) {
			c.greeted = true;
			a.wave(now() + 0.6);
		}
		// Look at the card under the pointer, or else towards the pointer itself
		if (r.hovered !== null) a.lookAt(Math.sin(r.phi + r.hovered * STEP), 0.3);
		else a.lookAt(r.pointer.x, r.pointer.y * 0.6);

		c.since += delta;
		if (still ? c.drawnStill : c.since < 1 / 30) return;
		const pose = a.pose(now(), Math.min(c.since, 0.1), still, r.paused);
		c.since = 0;
		c.drawnStill = still;
		ctx.clearRect(0, 0, art.canvas.width, art.canvas.height);
		drawAvatar(ctx, pose, scale);
		art.texture.needsUpdate = true;
	});

	return (
		<group ref={group} position={[0, layout.floor - (1 - AVATAR_FOOT) * h, 0]}>
			<mesh position={[0, h / 2, 0]} raycast={() => null}>
				<planeGeometry args={[w, h]} />
				<meshBasicMaterial map={art.texture} transparent alphaTest={0.02} toneMapped={false} />
			</mesh>
			{/* A tighter, invisible target over my body, for a tap to say hi */}
			<mesh
				position={[0, h * 0.5, 0.01]}
				onPointerOver={(e: ThreeEvent<PointerEvent>) => {
					e.stopPropagation();
					onHover(true);
				}}
				onPointerOut={() => onHover(false)}
				onClick={(e: ThreeEvent<MouseEvent>) => {
					e.stopPropagation();
					if (e.delta > 8) return;
					onTap();
				}}
			>
				<planeGeometry args={[w * 0.42, h * 0.95]} />
				<meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
			</mesh>
		</group>
	);
}

function Platform({ layout, ink }: { layout: Layout; ink: Ink }) {
	const texture = useCanvasTexture(
		512,
		(ctx, s) => {
			const c = s / 2;
			const pool = ctx.createRadialGradient(c, c, 0, c, c, c);
			pool.addColorStop(0, rgba(ink.accent, 0.34));
			pool.addColorStop(0.42, rgba(ink.accent, 0.12));
			pool.addColorStop(1, rgba(ink.accent, 0));
			ctx.fillStyle = pool;
			ctx.fillRect(0, 0, s, s);
			// A darker patch where my boots meet the floor, so I stand on it rather than float
			const footing = ctx.createRadialGradient(c, c, 0, c, c, s * 0.13);
			footing.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
			footing.addColorStop(1, 'rgba(0, 0, 0, 0)');
			ctx.fillStyle = footing;
			ctx.fillRect(0, 0, s, s);
			ctx.lineWidth = 3;
			ctx.strokeStyle = rgba(ink.accent, 0.6);
			ctx.beginPath();
			ctx.arc(c, c, s * 0.3, 0, TAU);
			ctx.stroke();
			ctx.lineWidth = 2;
			ctx.strokeStyle = rgba(ink.fg, 0.14);
			ctx.beginPath();
			ctx.arc(c, c, s * 0.47, 0, TAU);
			ctx.stroke();
		},
		[ink],
	);
	return (
		<mesh rotation-x={-Math.PI / 2} position={[0, layout.floor + 0.002, 0]} raycast={() => null}>
			<circleGeometry args={[layout.narrow ? 1.6 : 1.9, 64]} />
			<meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
		</mesh>
	);
}

/** The ring's path, drawn as a faint line so the cards read as one orbit */
function Orbit({ layout, ink }: { layout: Layout; ink: Ink }) {
	const geometry = useMemo(() => {
		const pts: THREE.Vector3[] = [];
		for (let i = 0; i < 160; i++) {
			const a = (i / 160) * TAU;
			pts.push(new THREE.Vector3(Math.sin(a) * layout.radius, layout.ringY - Math.cos(a) * layout.tilt, Math.cos(a) * layout.radius));
		}
		return new THREE.BufferGeometry().setFromPoints(pts);
	}, [layout.radius, layout.ringY, layout.tilt]);
	useEffect(() => () => geometry.dispose(), [geometry]);
	return (
		<lineLoop geometry={geometry} raycast={() => null}>
			<lineBasicMaterial color={ink.fg} transparent opacity={0.16} toneMapped={false} />
		</lineLoop>
	);
}

function Dust({ layout, ink, ring }: { layout: Layout; ink: Ink; ring: MutableRefObject<Ring> }) {
	const count = layout.narrow ? 90 : 170;
	const points = useRef<THREE.Points>(null);
	const { geometry, speed } = useMemo(() => {
		const pos = new Float32Array(count * 3);
		const speed = new Float32Array(count);
		for (let i = 0; i < count; i++) {
			const a = Math.random() * TAU;
			const d = 0.9 + Math.random() * 3.8;
			pos[i * 3] = Math.sin(a) * d;
			pos[i * 3 + 1] = layout.floor + Math.random() * 4.6;
			pos[i * 3 + 2] = Math.cos(a) * d;
			speed[i] = 0.04 + Math.random() * 0.12;
		}
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
		return { geometry, speed };
	}, [count, layout.floor]);

	// Mostly ink, one in six in the accent
	useEffect(() => {
		const colors = geometry.getAttribute('color') as THREE.BufferAttribute;
		const fg = new THREE.Color(ink.fg);
		const accent = new THREE.Color(ink.accent);
		for (let i = 0; i < count; i++) {
			const c = i % 6 === 0 ? accent : fg;
			colors.setXYZ(i, c.r, c.g, c.b);
		}
		colors.needsUpdate = true;
	}, [geometry, ink, count]);
	useEffect(() => () => geometry.dispose(), [geometry]);

	const dot = useCanvasTexture(
		64,
		(ctx, s) => {
			const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
			g.addColorStop(0, 'rgba(255,255,255,1)');
			g.addColorStop(0.5, 'rgba(255,255,255,0.5)');
			g.addColorStop(1, 'rgba(255,255,255,0)');
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, s, s);
		},
		[],
	);

	useFrame((_, dt) => {
		const r = ring.current;
		if (r.reduced || r.paused) return;
		const step = Math.min(dt, 0.05);
		const pos = geometry.getAttribute('position') as THREE.BufferAttribute;
		const top = layout.floor + 4.6;
		for (let i = 0; i < count; i++) {
			let y = pos.getY(i) + speed[i] * step;
			if (y > top) y = layout.floor;
			pos.setY(i, y);
		}
		pos.needsUpdate = true;
		if (points.current) points.current.rotation.y += step * 0.03;
	});

	return (
		<points ref={points} geometry={geometry} raycast={() => null}>
			<pointsMaterial
				map={dot}
				size={layout.narrow ? 0.07 : 0.06}
				sizeAttenuation
				vertexColors
				transparent
				opacity={0.5}
				depthWrite={false}
				toneMapped={false}
			/>
		</points>
	);
}

type RingProps = {
	layout: Layout;
	ink: Ink;
	ring: MutableRefObject<Ring>;
	rig: MutableRefObject<AvatarRig>;
	onShown: (i: number) => void;
	onHover: (on: boolean) => void;
	onPick: (i: number) => void;
	onTapMe: () => void;
};

function CardRing({ layout, ink, ring, rig, onShown, onHover, onPick }: RingProps) {
	const textures = useCardTextures(ink);
	const cards = useRef<(THREE.Mesh | null)[]>([]);
	const frames = useRef<(THREE.Mesh | null)[]>([]);
	const eased = useRef(CARDS.map(() => ({ hover: 0, shown: 0 })));
	const shownRef = useRef(-1);
	const presented = useRef(0);
	const accent = useMemo(() => new THREE.Color(ink.accent), [ink.accent]);

	useFrame((state, delta) => {
		const r = ring.current;
		const dt = Math.min(delta, 0.05);
		const t = now();
		advance(r, dt, t);

		const shown = r.target !== null ? r.targetIndex : frontIndex(r.phi);
		if (shown !== shownRef.current) {
			shownRef.current = shown;
			onShown(shown);
		}
		// Once a new card has come to rest in front, I turn to it and present it
		const settled = r.target === null && r.omega === 0 && !r.dragging;
		if (settled && shown !== presented.current) {
			presented.current = shown;
			rig.current.present(t);
		}

		const still = r.reduced || r.paused;
		const clock = state.clock.elapsedTime;
		const k = 1 - Math.exp(-dt * 10);
		for (let i = 0; i < COUNT; i++) {
			const mesh = cards.current[i];
			const frame = frames.current[i];
			if (!mesh || !frame) continue;
			const a = r.phi + i * STEP;
			const c = Math.cos(a);
			const depth = (c + 1) / 2; // 1 in front, 0 behind me
			const bob = still ? 0 : Math.sin(clock * 0.8 + i * 1.7) * 0.045;
			mesh.position.set(Math.sin(a) * layout.radius, layout.ringY - c * layout.tilt + bob, c * layout.radius);
			// Always square to the viewer, so the text never turns away or reads backwards
			mesh.quaternion.copy(state.camera.quaternion);

			const e = eased.current[i];
			e.hover += ((r.hovered === i ? 1 : 0) - e.hover) * k;
			e.shown += ((i === shown ? 1 : 0) - e.shown) * k;
			mesh.scale.setScalar(layout.card * (0.66 + 0.42 * depth) * (1 + 0.06 * e.hover));
			(mesh.material as THREE.MeshBasicMaterial).opacity = Math.min(1, 0.12 + 0.88 * Math.pow(depth, 1.8) + 0.5 * e.hover);
			const fm = frame.material as THREE.MeshBasicMaterial;
			fm.opacity = e.shown * Math.pow(depth, 2);
			frame.visible = fm.opacity > 0.01;
		}
	});

	return (
		<>
				{CARDS.map((card, i) => (
					<mesh
						key={card.id}
						ref={(m) => {
							cards.current[i] = m;
						}}
						onPointerOver={(e: ThreeEvent<PointerEvent>) => {
							e.stopPropagation();
							ring.current.hovered = i;
							onHover(true);
						}}
						onPointerOut={() => {
							if (ring.current.hovered === i) ring.current.hovered = null;
							onHover(false);
						}}
						onClick={(e: ThreeEvent<MouseEvent>) => {
							e.stopPropagation();
							if (e.delta > 8) return;
							onPick(i);
						}}
					>
						<planeGeometry args={[CARD_W, CARD_H]} />
						<meshBasicMaterial map={textures[i]} transparent toneMapped={false} />
						{/* The accent frame behind whichever card is in front */}
						<mesh
							ref={(m) => {
								frames.current[i] = m;
							}}
							position={[0, 0, -0.004]}
							raycast={() => null}
						>
							<planeGeometry args={[CARD_W + 0.05, CARD_H + 0.05]} />
							<meshBasicMaterial color={accent} transparent opacity={0} depthWrite={false} toneMapped={false} />
						</mesh>
					</mesh>
				))}
		</>
	);
}

function Scene(props: Omit<RingProps, 'layout'>) {
	const size = useThree((s) => s.size);
	const layout = useMemo(() => layoutFor(size.width, size.height), [size.width, size.height]);
	const { ink, ring, rig } = props;
	return (
		<>
			<Rig layout={layout} ring={ring} />
			<Platform layout={layout} ink={ink} />
			<Orbit layout={layout} ink={ink} />
			<Dust layout={layout} ink={ink} ring={ring} />
			<Avatar layout={layout} ring={ring} rig={rig} onHover={props.onHover} onTap={props.onTapMe} />
			<CardRing {...props} layout={layout} />
		</>
	);
}

/** My head and shoulders, drawn once, for the intro card in the list */
function AvatarThumb() {
	const ref = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		const canvas = ref.current;
		const ctx = canvas?.getContext('2d');
		if (!canvas || !ctx) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(480 * dpr);
		canvas.height = Math.round(320 * dpr);
		// A 3:2 window from the top of the hair to the top of the shirt
		const k = canvas.width / 420;
		ctx.scale(k, k);
		ctx.translate(-110, -4);
		drawAvatar(ctx, REST_POSE, 1);
	}, []);
	return <canvas ref={ref} className="ar-index__avatar" />;
}

// ---------- The stage ----------

function createRing(): Ring {
	return {
		phi: 0,
		from: 0,
		target: null,
		targetIndex: 0,
		start: 0,
		dur: 0,
		omega: 0,
		nextStep: now() + DWELL,
		hovered: null,
		dragging: false,
		paused: false,
		reduced: false,
		pointer: { x: 0, y: 0 },
	};
}

export default function ARScene() {
	const ring = useRef<Ring>(createRing());
	const rig = useRef<AvatarRig>(createAvatarRig());
	const view = useRef<HTMLDivElement>(null);
	const drag = useRef({ id: -1, x: 0, t: 0, v: 0, moved: 0 });
	const [ink, setInk] = useState<Ink | null>(null);
	const [shown, setShown] = useState(0);
	const [steered, setSteered] = useState(false);
	const [hovering, setHovering] = useState(false);
	const [dragging, setDragging] = useState(false);
	const [paused, setPaused] = useState(false);
	const [reduced, setReduced] = useState(false);
	const [running, setRunning] = useState(true);
	const index = useRef<HTMLElement>(null);
	const [indexIn, setIndexIn] = useState(false);

	// The list of cards rises in once, the first time it scrolls into view
	useEffect(() => {
		const el = index.current;
		if (!el || !('IntersectionObserver' in window)) return setIndexIn(true);
		const io = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				setIndexIn(true);
				io.disconnect();
			},
			{ rootMargin: '0px 0px -10% 0px' },
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	// Theme, motion preference, and running only while on screen and the tab is visible
	useEffect(() => {
		setInk(readInk());
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const applyMotion = () => {
			ring.current.reduced = motion.matches;
			setReduced(motion.matches);
		};
		applyMotion();
		motion.addEventListener('change', applyMotion);

		const themeObserver = new MutationObserver(() => setInk(readInk()));
		themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

		let onScreen = true;
		const update = () => setRunning(onScreen && !document.hidden);
		const io = new IntersectionObserver(([entry]) => {
			onScreen = entry.isIntersecting;
			update();
		});
		if (view.current) io.observe(view.current);
		document.addEventListener('visibilitychange', update);

		return () => {
			motion.removeEventListener('change', applyMotion);
			themeObserver.disconnect();
			io.disconnect();
			document.removeEventListener('visibilitychange', update);
		};
	}, []);

	const steer = useCallback(() => {
		ring.current.nextStep = now() + HOLD;
		setSteered(true);
	}, []);

	const pick = useCallback(
		(i: number) => {
			const r = ring.current;
			const apart = wrapIndex(i - frontIndex(r.phi));
			const turn = Math.min(apart, COUNT - apart);
			aim(r, wrapIndex(i), Math.min(1.4, 0.55 + turn * 0.18));
			steer();
		},
		[steer],
	);

	const sayHi = useCallback(() => {
		rig.current.wave(now());
		pick(0);
	}, [pick]);

	const shownCard = CARDS[shown];

	const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		if (e.button !== 0) return;
		drag.current = { id: e.pointerId, x: e.clientX, t: performance.now(), v: 0, moved: 0 };
	};

	const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
		const el = view.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		if (e.pointerType === 'mouse') {
			ring.current.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
			ring.current.pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
		}
		const d = drag.current;
		if (d.id !== e.pointerId) return;
		const dx = e.clientX - d.x;
		d.moved += Math.abs(dx);
		const r = ring.current;
		if (!r.dragging && d.moved > 6) {
			r.dragging = true;
			r.target = null;
			r.omega = 0;
			el.setPointerCapture(e.pointerId);
			setDragging(true);
			steer();
		}
		if (r.dragging) {
			// About half a turn for a drag across the whole stage, cards following the finger
			const turn = dx * (3.4 / rect.width);
			r.phi += turn;
			const t = performance.now();
			const dt = Math.max(1, t - d.t) / 1000;
			d.v = d.v * 0.6 + (turn / dt) * 0.4;
			d.t = t;
		}
		d.x = e.clientX;
	};

	const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
		const d = drag.current;
		if (d.id !== e.pointerId) return;
		d.id = -1;
		const r = ring.current;
		if (!r.dragging) return;
		r.dragging = false;
		setDragging(false);
		// A flick keeps the ring coasting; a slow release settles the nearest card in front
		const v = performance.now() - d.t > 80 ? 0 : d.v;
		if (Math.abs(v) > 0.6 && !r.reduced) r.omega = Math.max(-4, Math.min(4, v));
		else aim(r, frontIndex(r.phi), 0.6);
		steer();
	};

	const togglePause = () => {
		ring.current.paused = !paused;
		setPaused(!paused);
	};

	return (
		<>
		<div className="ar-scene">
			<div
				ref={view}
				className="ar-scene__view"
				data-hovering={hovering || undefined}
				data-dragging={dragging || undefined}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={endDrag}
				onPointerCancel={endDrag}
				onPointerLeave={() => {
					ring.current.pointer.x = 0;
					ring.current.pointer.y = 0;
				}}
				role="img"
				aria-label={`An animated drawing of Yasasvi standing on a lit platform, with ${COUNT} cards about Yasasvi’s work orbiting around.`}
			>
				{ink && (
					<Canvas
						className="ar-scene__canvas"
						flat
						dpr={[1, 2]}
						frameloop={running ? 'always' : 'never'}
						camera={{ fov: FOV, position: [0, 0.55, 7], near: 0.1, far: 60 }}
						gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
						fallback={<p className="ar-scene__fallback">This browser can’t show the 3D scene, but every card is listed below it.</p>}
					>
						<Scene
							rig={rig}
							ink={ink}
							ring={ring}
							onShown={setShown}
							onHover={setHovering}
							onPick={pick}
							onTapMe={sayHi}
						/>
					</Canvas>
				)}
				<p className="ar-scene__hint" data-gone={steered || undefined}>
					Drag to spin the ring, tap a card to bring it forward, or tap me to say hi.
				</p>
			</div>

			<section className="ar-scene__panel" aria-label="The card in front" aria-live={steered ? 'polite' : 'off'}>
				<div className="ar-scene__detail" key={shownCard.id}>
					<h2 className="ar-scene__title">{shownCard.detail.title}</h2>
					<p className="ar-scene__text">{shownCard.detail.text}</p>
					{shownCard.detail.links.length > 0 && (
						<ul className="ar-scene__links">
							{shownCard.detail.links.map((link) =>
								link.href.startsWith('http') ? (
									<li key={link.href}>
										<a className="ds-link" href={link.href} target="_blank" rel="noopener noreferrer">
											{link.label}
										</a>
									</li>
								) : (
									<li key={link.href}>
										<Link className="ds-link" href={link.href}>
											{link.label}
										</Link>
									</li>
								),
							)}
						</ul>
					)}
				</div>

				<div className="ar-scene__controls">
					<button type="button" className="ds-icon-btn" aria-label="Previous card" onClick={() => pick(shown - 1)}>
						<ChevronLeft aria-hidden="true" />
					</button>
					<span className="ar-scene__count" aria-hidden="true">
						{shown + 1} / {COUNT}
					</span>
					<button type="button" className="ds-icon-btn" aria-label="Next card" onClick={() => pick(shown + 1)}>
						<ChevronRight aria-hidden="true" />
					</button>
					{!reduced && (
						<button type="button" className="ds-btn ds-btn--ghost ar-scene__pause" aria-pressed={paused} onClick={togglePause}>
							{paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
							{paused ? 'Play' : 'Pause'}
						</button>
					)}
				</div>
			</section>
		</div>

		<section ref={index} className="ar-index" aria-labelledby="ar-index-title" data-in={indexIn || undefined}>
			<h2 id="ar-index-title" className="ds-h2">
				Everything in the ring
			</h2>
			<ol className="ar-index__list">
				{CARDS.map((card, i) => (
					<li key={card.id} style={{ '--i': i } as React.CSSProperties}>
						<button
							type="button"
							className="ar-index__item"
							aria-current={i === shown || undefined}
							onClick={() => {
								pick(i);
								view.current?.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
							}}
						>
							<span className="ar-index__picture" aria-hidden="true">
								{card.kind === 'figure' ? (
									<span className="ar-index__figure">{card.figure}</span>
								) : card.kind === 'intro' ? (
									<AvatarThumb />
								) : (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={card.thumb}
										alt=""
										width={480}
										height={320}
										loading="lazy"
										decoding="async"
									/>
								)}
							</span>
							<span className="ar-index__title">{card.detail.title}</span>
							<span className="ar-index__foot">{card.foot}</span>
						</button>
					</li>
				))}
			</ol>
		</section>
		</>
	);
}
