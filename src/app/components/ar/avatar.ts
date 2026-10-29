// An illustrated, animated me for the AR scene, drawn from my photo: swept wavy hair, brown cat-eye
// sunglasses, a full beard, the grey-green plaid shirt with rolled sleeves, black jeans, a watch on
// my left wrist, the red thread at my neck, and boots for Twisted X. Flat shapes on Canvas 2D,
// rigged at the neck, shoulders, elbows and wrists so it can breathe, look, talk, wave and present.

export const AVATAR_W = 640;
export const AVATAR_H = 1000;
/** Where the soles touch the ground, as a share of the canvas height from the top */
export const AVATAR_FOOT = 988 / AVATAR_H;

// The figure is drawn around x = 200; this shifts it to the middle of a canvas wide enough to wave in
const OX = 120;

const C = {
	skin: '#a86f4c',
	skinShade: '#8b5739',
	skinDeep: '#6a3f28',
	hair: '#1b1512',
	hairLight: '#43342a',
	beard: '#2b201a',
	beardLight: 'rgba(120, 90, 70, 0.35)',
	lens: '#3d2419',
	frame: '#22140e',
	plaidBase: '#9aa79e',
	plaidDark: 'rgba(42, 64, 50, 0.6)',
	plaidLight: 'rgba(236, 240, 236, 0.45)',
	cuff: '#6b7c71',
	button: '#2b2f2c',
	jeans: '#1f232b',
	jeansShade: '#15181e',
	boot: '#7a4a2a',
	bootShade: '#5a341d',
	sole: '#2a1a12',
	thread: '#c8372b',
	mouth: '#4a1d18',
	teeth: '#f2ece2',
	tongue: '#b5534a',
	watchBand: '#2c3d50',
	watchRim: '#c39064',
	watchFace: '#1d1f24',
	line: 'rgba(18, 12, 9, 0.55)',
	rim: 'rgba(255, 178, 150, 0.55)',
};

type Arm = [number, number, number]; // shoulder, elbow, wrist, in radians

export type Pose = {
	sway: number; // px, the upper body side to side
	breath: number; // 0..1
	headTilt: number; // radians
	lookX: number; // -1..1, the face turning left to right
	lookY: number; // -1..1, up to down
	brow: number; // 0..1 raised
	mouth: number; // 0 smiling .. 1 open
	glint: number; // -1 for none, else 0..1 across the lenses
	hairLag: number; // px
	armL: Arm; // my right arm, on the viewer's left
	armR: Arm; // my left arm, with the watch
};

// Hands by the front pockets, elbows a little out, as in the photo
const ARM_L_REST: Arm = [0.09, -0.44, 0.12];
const ARM_R_REST: Arm = [-0.09, 0.44, -0.12];
const ARM_L_WAVE: Arm = [2.1, 0.95, 0];
const ARM_R_PRESENT: Arm = [-0.2, -0.93, -0.52];

export const REST_POSE: Pose = {
	sway: 0,
	breath: 0.5,
	headTilt: 0,
	lookX: 0,
	lookY: 0,
	brow: 0,
	mouth: 0,
	glint: -1,
	hairLag: 0,
	armL: [...ARM_L_REST],
	armR: [...ARM_R_REST],
};

// ---------- Shapes ----------

type Paths = ReturnType<typeof buildPaths>;
let cache: Paths | null = null;

function buildPaths() {
	const p = (d: string) => new Path2D(d);
	return {
		bootL: p('M128,884 L182,884 L184,944 C188,962 192,976 188,986 L112,986 C106,978 114,958 122,944 Z'),
		bootR: p('M218,884 L272,884 L278,944 C286,958 294,978 288,986 L212,986 C208,976 212,962 216,944 Z'),
		soleL: p('M110,977 L190,977 L189,989 L111,989 Z'),
		soleR: p('M210,977 L290,977 L289,989 L211,989 Z'),
		toeL: p('M126,952 C134,944 160,944 170,952 C160,958 136,958 126,952 Z'),
		toeR: p('M230,952 C240,944 266,944 274,952 C266,958 240,958 230,952 Z'),
		jeans: p(
			'M118,560 L282,560 C287,650 281,790 275,908 L221,908 C217,800 211,700 203,632 L197,632 C189,700 183,800 179,908 L125,908 C119,790 113,650 118,560 Z',
		),
		jeansShade: p(
			'M262,570 C268,660 266,800 262,906 L275,908 C281,790 287,650 282,560 Z M197,632 C192,700 187,800 184,906 L196,906 C198,800 200,700 201,640 Z',
		),
		neck: p('M180,196 L220,196 L225,262 L175,262 Z'),
		neckShade: p('M180,200 C190,226 210,226 220,200 L222,238 C210,246 190,246 178,238 Z'),
		chest: p('M172,248 L228,248 L200,338 Z'),
		shirt: p(
			'M176,256 L200,334 L224,256 C252,260 292,270 312,290 C320,334 308,432 298,500 C294,540 292,570 290,586 C252,604 148,604 110,586 C108,570 106,540 102,500 C92,432 80,334 88,290 C108,270 148,260 176,256 Z',
		),
		shirtShade: p('M284,300 C296,380 292,470 280,594 L290,586 C292,570 294,540 298,500 C308,432 320,334 312,290 Z'),
		hemShade: p('M110,586 C148,604 252,604 290,586 L289,594 C252,612 148,612 111,594 Z'),
		collarBack: p('M170,254 C186,240 214,240 230,254 L226,266 C212,257 188,257 174,266 Z'),
		collarL: p('M178,250 C166,256 156,262 145,270 L160,320 L199,337 Z'),
		collarR: p('M222,250 C234,256 244,262 255,270 L240,320 L201,337 Z'),
		placket: p('M194,337 L206,337 L206,600 L194,600 Z'),
		pocket: p('M224,366 L264,366 L264,410 C252,416 236,416 224,410 Z'),
		face: p('M138,118 C138,80 166,60 200,60 C234,60 262,80 262,118 L262,150 C262,192 242,230 200,242 C158,230 138,192 138,150 Z'),
		cheekShade: p('M250,118 C260,150 256,190 238,214 L248,206 C258,186 262,152 262,118 Z'),
		// A trimmed full beard: along the jaw and up to the cheekbones, cheeks left clear
		beard: p(
			'M139,146 C139,198 160,240 200,251 C240,240 261,198 261,146 L255,148 C253,172 246,186 238,196 C228,191 214,188 200,190 C186,188 172,191 162,196 C154,186 147,172 145,148 Z',
		),
		mustache: p('M168,195 C178,184 194,183 200,188 C206,183 222,184 232,195 C220,192 207,192 200,195 C193,192 180,192 168,195 Z'),
		nose: p('M197,140 C195,156 189,166 191,173 C195,178 205,178 209,173 C211,166 205,156 203,140 Z'),
		browL: p('M147,108 C160,97 180,97 193,105 L191,113 C178,106 162,106 150,115 Z'),
		browR: p('M253,108 C240,97 220,97 207,105 L209,113 C222,106 238,106 250,115 Z'),
		lensL: p('M141,115 L193,122 L192,142 C190,150 183,154 172,154 L160,153 C150,152 146,146 145,138 Z'),
		lensR: p('M259,115 L207,122 L208,142 C210,150 217,154 228,154 L240,153 C250,152 254,146 255,138 Z'),
		lenses: p(
			'M141,115 L193,122 L192,142 C190,150 183,154 172,154 L160,153 C150,152 146,146 145,138 Z M259,115 L207,122 L208,142 C210,150 217,154 228,154 L240,153 C250,152 254,146 255,138 Z',
		),
		sideHairL: p('M134,98 L146,100 L147,142 L137,144 Z'),
		sideHairR: p('M266,98 L254,100 L253,142 L263,144 Z'),
		// Swept, wavy and full on top, with a fringe falling to one side
		hair: p(
			'M136,130 C128,108 126,86 134,70 C130,56 140,44 154,42 C158,30 174,22 188,26 C198,16 218,16 228,26 C242,22 258,30 262,44 C274,50 280,66 274,82 C280,96 276,114 266,132 C262,118 256,106 246,100 C236,104 222,102 212,96 C204,104 190,110 178,108 C168,116 160,112 152,120 C148,124 142,128 136,130 Z',
		),
		lock: p('M166,100 C174,84 196,80 208,92 C196,92 186,98 180,110 C176,118 170,123 162,126 C166,118 167,108 166,100 Z'),
		upperArm: p('M-24,-12 C-28,40 -24,100 -21,148 L21,148 C24,100 28,40 24,-12 C15,-24 -15,-24 -24,-12 Z'),
		upperShade: p('M8,-16 C16,40 14,100 12,148 L21,148 C24,100 28,40 24,-12 Z'),
		cuff: p('M-24,-8 L24,-8 L23,30 L-23,30 Z'),
		forearm: p('M-17,26 C-18,60 -16,100 -14,130 L14,130 C16,100 18,60 17,26 Z'),
		forearmShade: p('M6,26 C8,60 8,100 7,130 L14,130 C16,100 18,60 17,26 Z'),
		hand: p('M-15,-2 C-19,18 -17,40 -6,52 C2,57 12,52 15,42 C19,28 17,12 15,-2 Z'),
		thumb: p('M12,6 C22,12 24,26 16,32 C12,26 10,16 12,6 Z'),
		watchBand: p('M-16,-4 L16,-4 L16,9 L-16,9 Z'),
	};
}

// Strands that follow the sweep of the hair, drawn in a lighter brown
const STRANDS = [
	'M146,78 C160,58 190,46 222,48',
	'M150,98 C168,76 200,66 236,70',
	'M182,40 C204,30 236,34 256,52',
	'M214,82 C232,74 252,78 266,92',
	'M140,110 C146,96 156,86 170,80',
	'M240,58 C256,62 266,72 270,84',
];

const BEARD_FLECKS: [number, number][] = [
	[148, 168], [152, 186], [158, 204], [166, 220], [178, 232], [192, 238], [208, 238], [222, 232],
	[234, 220], [242, 204], [248, 186], [252, 168], [186, 222], [214, 222], [200, 230],
];

let strandCache: Path2D[] | null = null;
const strands = () => (strandCache ??= STRANDS.map((d) => new Path2D(d)));

const patterns = new WeakMap<CanvasRenderingContext2D, CanvasPattern | string>();

/** The shirt's plaid as a repeating tile; it turns with each arm because patterns follow the transform */
function plaid(ctx: CanvasRenderingContext2D) {
	const hit = patterns.get(ctx);
	if (hit) return hit;
	const tile = document.createElement('canvas');
	tile.width = 60;
	tile.height = 60;
	const t = tile.getContext('2d');
	let result: CanvasPattern | string = C.plaidBase;
	if (t) {
		t.fillStyle = C.plaidBase;
		t.fillRect(0, 0, 60, 60);
		t.fillStyle = C.plaidDark;
		t.fillRect(0, 0, 24, 60);
		t.fillRect(0, 0, 60, 24);
		t.fillStyle = C.plaidLight;
		t.fillRect(36, 0, 3, 60);
		t.fillRect(0, 36, 60, 3);
		t.fillStyle = 'rgba(40, 55, 46, 0.35)';
		t.fillRect(50, 0, 2, 60);
		t.fillRect(0, 50, 60, 2);
		result = ctx.createPattern(tile, 'repeat') ?? C.plaidBase;
	}
	patterns.set(ctx, result);
	return result;
}

// ---------- Drawing ----------

let rimPx = 3;

/** A main shape: a warm rim of light from the platform's glow on its upper left, then an ink line */
function shape(ctx: CanvasRenderingContext2D, path: Path2D, fill: string | CanvasPattern, line = true, rim = true) {
	ctx.fillStyle = fill;
	if (rim) {
		ctx.shadowColor = C.rim;
		ctx.shadowOffsetX = -rimPx;
		ctx.shadowOffsetY = -rimPx;
	}
	ctx.fill(path);
	ctx.shadowColor = 'transparent';
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	if (line) {
		ctx.lineWidth = 2.4;
		ctx.strokeStyle = C.line;
		ctx.stroke(path);
	}
}

function tint(ctx: CanvasRenderingContext2D, path: Path2D, color: string) {
	ctx.fillStyle = color;
	ctx.fill(path);
}

function drawLegs(ctx: CanvasRenderingContext2D, P: Paths) {
	for (const [boot, sole, toe] of [
		[P.bootL, P.soleL, P.toeL],
		[P.bootR, P.soleR, P.toeR],
	]) {
		shape(ctx, boot, C.boot);
		tint(ctx, toe, 'rgba(255, 220, 190, 0.16)');
		shape(ctx, sole, C.sole, false, false);
	}
	shape(ctx, P.jeans, C.jeans);
	tint(ctx, P.jeansShade, C.jeansShade);
	// Front pockets and the seam down each leg
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(124, 600);
	ctx.quadraticCurveTo(146, 604, 158, 576);
	ctx.moveTo(276, 600);
	ctx.quadraticCurveTo(254, 604, 242, 576);
	ctx.moveTo(150, 640);
	ctx.quadraticCurveTo(150, 780, 152, 904);
	ctx.moveTo(250, 640);
	ctx.quadraticCurveTo(250, 780, 248, 904);
	ctx.stroke();
}

function drawTorso(ctx: CanvasRenderingContext2D, P: Paths, check: string | CanvasPattern) {
	shape(ctx, P.neck, C.skin, false);
	tint(ctx, P.neckShade, C.skinShade);
	tint(ctx, P.chest, C.skin);
	// The red thread at my neck
	ctx.strokeStyle = C.thread;
	ctx.lineWidth = 2.5;
	ctx.beginPath();
	ctx.moveTo(182, 262);
	ctx.quadraticCurveTo(196, 306, 214, 266);
	ctx.stroke();

	shape(ctx, P.collarBack, check);
	tint(ctx, P.collarBack, 'rgba(0, 0, 0, 0.28)');
	shape(ctx, P.shirt, check);
	tint(ctx, P.shirtShade, 'rgba(18, 28, 22, 0.3)');
	tint(ctx, P.hemShade, 'rgba(18, 28, 22, 0.25)');
	tint(ctx, P.placket, 'rgba(18, 28, 22, 0.16)');
	ctx.strokeStyle = 'rgba(18, 28, 22, 0.35)';
	ctx.lineWidth = 1.5;
	ctx.stroke(P.placket);
	ctx.stroke(P.pocket);
	ctx.fillStyle = C.button;
	for (const y of [356, 414, 472, 530, 584]) {
		ctx.beginPath();
		ctx.arc(200, y, 4.2, 0, Math.PI * 2);
		ctx.fill();
	}
	for (const collar of [P.collarL, P.collarR]) {
		shape(ctx, collar, check);
		tint(ctx, collar, 'rgba(255, 255, 255, 0.07)');
	}
}

function drawHead(ctx: CanvasRenderingContext2D, P: Paths, pose: Pose) {
	const fx = pose.lookX * 6;
	const fy = pose.lookY * 3;
	ctx.save();
	ctx.translate(200, 238);
	ctx.rotate(pose.headTilt);
	ctx.translate(-200, -238);

	// Ears slide a touch the other way as the face turns
	ctx.fillStyle = C.skin;
	for (const x of [136 - fx * 0.4, 264 - fx * 0.4]) {
		ctx.beginPath();
		ctx.ellipse(x, 150, 9, 17, 0, 0, Math.PI * 2);
		ctx.shadowColor = C.rim;
		ctx.shadowOffsetX = -rimPx;
		ctx.shadowOffsetY = -rimPx;
		ctx.fill();
		ctx.shadowColor = 'transparent';
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.strokeStyle = C.line;
		ctx.lineWidth = 2.4;
		ctx.stroke();
		ctx.fillStyle = C.skinShade;
		ctx.beginPath();
		ctx.ellipse(x, 151, 4, 10, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = C.skin;
	}

	shape(ctx, P.face, C.skin);
	tint(ctx, P.cheekShade, C.skinShade);
	tint(ctx, P.sideHairL, C.hair);
	tint(ctx, P.sideHairR, C.hair);

	ctx.save();
	ctx.translate(fx * 0.45, fy * 0.5);
	shape(ctx, P.beard, C.beard, false, false);
	// A few short strokes so the beard reads as hair, not a mask
	ctx.save();
	ctx.clip(P.beard);
	ctx.strokeStyle = C.beardLight;
	ctx.lineWidth = 1.6;
	ctx.beginPath();
	for (const [x, y] of BEARD_FLECKS) {
		ctx.moveTo(x, y);
		ctx.lineTo(x + (x < 200 ? 2 : -2), y + 7);
	}
	ctx.stroke();
	ctx.restore();
	ctx.restore();

	ctx.save();
	ctx.translate(fx, fy);
	// Mouth: a wide grin that opens while I talk
	const o = Math.max(0, Math.min(1, pose.mouth));
	tint(ctx, new Path2D(`M174,198 C184,${220 + o * 12} 216,${220 + o * 12} 226,198 C212,${203 + o * 2} 188,${203 + o * 2} 174,198 Z`), C.mouth);
	if (o > 0.25) {
		ctx.fillStyle = C.tongue;
		ctx.beginPath();
		ctx.ellipse(200, 210 + o * 7, 10, 4 * o, 0, 0, Math.PI * 2);
		ctx.fill();
	}
	tint(
		ctx,
		new Path2D(`M178,${199 + o} C188,${204 + o * 2} 212,${204 + o * 2} 222,${199 + o} L220,${206 + o * 2} C210,${210 + o * 2} 190,${210 + o * 2} 180,${206 + o * 2} Z`),
		C.teeth,
	);
	tint(ctx, P.mustache, C.beard);
	tint(ctx, P.nose, C.skinShade);

	ctx.save();
	ctx.translate(0, -pose.brow * 6);
	tint(ctx, P.browL, C.hair);
	tint(ctx, P.browR, C.hair);
	ctx.restore();

	// Sunglasses
	ctx.fillStyle = C.lens;
	ctx.fill(P.lenses);
	ctx.save();
	ctx.clip(P.lenses);
	ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
	ctx.fillRect(146, 120, 40, 7);
	ctx.fillRect(212, 120, 40, 7);
	if (pose.glint >= 0) {
		const x = 130 + pose.glint * 150;
		ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
		ctx.beginPath();
		ctx.moveTo(x, 112);
		ctx.lineTo(x + 16, 112);
		ctx.lineTo(x - 6, 158);
		ctx.lineTo(x - 22, 158);
		ctx.closePath();
		ctx.fill();
	}
	ctx.restore();
	ctx.strokeStyle = C.frame;
	ctx.lineWidth = 4;
	ctx.lineJoin = 'round';
	ctx.stroke(P.lenses);
	ctx.beginPath();
	ctx.moveTo(193, 125);
	ctx.quadraticCurveTo(200, 120, 207, 125);
	ctx.moveTo(141, 118);
	ctx.lineTo(136, 124);
	ctx.moveTo(259, 118);
	ctx.lineTo(264, 124);
	ctx.stroke();
	ctx.restore();

	// Hair, which lags the head a little
	ctx.save();
	ctx.translate(fx * 0.3, pose.hairLag);
	ctx.shadowColor = C.rim;
	ctx.shadowOffsetX = -rimPx;
	ctx.shadowOffsetY = -rimPx;
	ctx.fillStyle = C.hair;
	ctx.fill(P.hair);
	ctx.shadowColor = 'transparent';
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	ctx.lineWidth = 2.4;
	ctx.strokeStyle = C.line;
	ctx.stroke(P.hair);
	ctx.fill(P.lock);
	ctx.strokeStyle = C.hairLight;
	ctx.lineWidth = 3;
	ctx.lineCap = 'round';
	for (const d of strands()) ctx.stroke(d);
	ctx.restore();

	ctx.restore();
}

function drawArm(ctx: CanvasRenderingContext2D, P: Paths, check: string | CanvasPattern, x: number, y: number, a: Arm, inner: 1 | -1, watch: boolean) {
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(a[0]);

	// Forearm and hand first, so the sleeve sits over the elbow
	ctx.save();
	ctx.translate(0, 142);
	ctx.rotate(a[1]);
	shape(ctx, P.forearm, C.skin);
	ctx.save();
	ctx.scale(inner, 1);
	tint(ctx, P.forearmShade, C.skinShade);
	ctx.restore();

	ctx.save();
	ctx.translate(0, 128);
	ctx.rotate(a[2]);
	ctx.save();
	ctx.scale(inner, 1);
	shape(ctx, P.thumb, C.skin);
	ctx.restore();
	shape(ctx, P.hand, C.skin);
	ctx.strokeStyle = 'rgba(60, 30, 18, 0.35)';
	ctx.lineWidth = 1.6;
	ctx.beginPath();
	ctx.moveTo(-7, 36);
	ctx.lineTo(-6, 50);
	ctx.moveTo(1, 38);
	ctx.lineTo(2, 53);
	ctx.moveTo(8, 36);
	ctx.lineTo(9, 48);
	ctx.stroke();
	if (watch) {
		ctx.fillStyle = C.watchBand;
		ctx.fill(P.watchBand);
		ctx.beginPath();
		ctx.arc(0, 2, 9, 0, Math.PI * 2);
		ctx.fillStyle = C.watchFace;
		ctx.fill();
		ctx.lineWidth = 2.5;
		ctx.strokeStyle = C.watchRim;
		ctx.stroke();
	}
	ctx.restore();

	// The rolled-up sleeve
	shape(ctx, P.cuff, C.cuff);
	ctx.strokeStyle = 'rgba(18, 28, 22, 0.35)';
	ctx.lineWidth = 1.5;
	ctx.beginPath();
	ctx.moveTo(-23, 11);
	ctx.lineTo(23, 11);
	ctx.stroke();
	ctx.restore();

	shape(ctx, P.upperArm, check);
	ctx.save();
	ctx.scale(inner, 1);
	tint(ctx, P.upperShade, 'rgba(18, 28, 22, 0.24)');
	ctx.restore();
	ctx.restore();
}

/** Draw me in a pose. `scale` maps the 640 × 1000 design onto the canvas. */
export function drawAvatar(ctx: CanvasRenderingContext2D, pose: Pose, scale = 1) {
	if (!cache) cache = buildPaths();
	const P = cache;
	const check = plaid(ctx);
	rimPx = Math.max(1.5, 3 * scale);
	ctx.save();
	ctx.scale(scale, scale);
	ctx.translate(OX, 0);
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	drawLegs(ctx, P);
	// Everything above the waist sways and rises a little with each breath
	ctx.save();
	ctx.translate(pose.sway, -pose.breath * 3);
	drawTorso(ctx, P, check);
	drawHead(ctx, P, pose);
	drawArm(ctx, P, check, 100, 300, pose.armL, 1, false);
	drawArm(ctx, P, check, 300, 300, pose.armR, -1, true);
	ctx.restore();
	ctx.restore();
}

// ---------- Motion ----------

const smooth = (k: number) => k * k * (3 - 2 * k);

/** 0 outside [start, start + dur], easing up to 1 and back down inside it */
function envelope(t: number, start: number, dur: number, rise: number, fall: number) {
	const u = t - start;
	if (u <= 0 || u >= dur) return 0;
	return smooth(Math.min(1, u / rise, (dur - u) / fall));
}

const mix = (a: Arm, b: Arm, k: number): Arm => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

export type AvatarRig = ReturnType<typeof createAvatarRig>;

/** Turns events (a wave, a new card in front, where the pointer is) into a pose for each frame */
export function createAvatarRig() {
	const s = { wave: -99, present: -99, talk: -99, glint: 2.5, lookX: 0, lookY: 0, tx: 0, ty: 0 };
	return {
		wave(t: number) {
			if (t - s.wave < 2.6) return;
			s.wave = t;
			s.talk = t + 0.2;
		},
		present(t: number) {
			s.present = t;
			s.talk = t + 0.15;
		},
		lookAt(x: number, y: number) {
			s.tx = Math.max(-1, Math.min(1, x));
			s.ty = Math.max(-1, Math.min(1, y));
		},
		/** `still` (reduced motion) holds the rest pose; `calm` (paused) drops the idle motion but still
		 * plays a wave or a present that the visitor asked for */
		pose(t: number, dt: number, still: boolean, calm = false): Pose {
			if (still) return REST_POSE;
			const idle = calm ? 0 : 1;
			const k = 1 - Math.exp(-dt * 4);
			s.lookX += (s.tx - s.lookX) * k;
			s.lookY += (s.ty - s.lookY) * k;
			const wave = envelope(t, s.wave, 2.4, 0.45, 0.55);
			const present = envelope(t, s.present, 1.9, 0.4, 0.6);
			const talk = envelope(t, s.talk, 1.3, 0.1, 0.3);
			if (t > s.glint + 0.8) s.glint = t + 5 + Math.random() * 4;
			const g = (t - s.glint) / 0.8;
			const flap = Math.sin((t - s.wave) * 10);

			const armL = mix(ARM_L_REST, ARM_L_WAVE, wave);
			armL[0] += Math.sin(t * 1.25) * 0.015 * idle;
			armL[1] += flap * 0.3 * wave;
			armL[2] += Math.sin((t - s.wave) * 10 - 0.6) * 0.25 * wave;
			const armR = mix(ARM_R_REST, ARM_R_PRESENT, present);
			armR[0] -= Math.sin(t * 1.25) * 0.015 * idle;
			armR[2] += Math.sin((t - s.present) * 3) * 0.08 * present;

			return {
				sway: Math.sin(t * 0.45) * 2 * idle,
				breath: 0.5 + 0.5 * Math.sin(t * 1.25) * idle,
				headTilt: Math.sin(t * 0.7) * 0.03 * idle + s.lookX * 0.05 + wave * 0.06 - present * 0.04,
				// While presenting, I look down at the card in front
				lookX: Math.max(-1, Math.min(1, s.lookX * (1 - present))),
				lookY: Math.max(-1, Math.min(1, s.lookY + present * 0.8)),
				brow: Math.max(wave * 0.9, present * 0.5),
				mouth: talk * (0.45 + 0.45 * Math.sin((t - s.talk) * 17)),
				glint: idle && g >= 0 && g <= 1 ? g : -1,
				hairLag: Math.sin(t * 1.25 - 0.7) * 1.2 * idle + wave * flap * 1.5,
				armL,
				armR,
			};
		},
	};
}
