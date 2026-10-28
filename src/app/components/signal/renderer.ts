/*
 * SignalRenderer: light trails that run along the system graph in ./graph.ts.
 *
 * Every particle is one instanced quad stretched from its head to a point a little way back along
 * its path, so a streak reads like a long exposure. Positions are computed in the vertex shader from
 * bezier edges held in uniforms, which keeps the CPU out of the frame loop: per frame, JavaScript only
 * advances a clock per edge, eases route weights and the pointer, and issues one draw call.
 *
 * Lifecycle: the loop runs only while the canvas is on screen and the tab is visible. Under
 * prefers-reduced-motion it draws single still frames when something changes. Without WebGL it
 * draws a still version with Canvas 2D.
 *
 * Quality adapts to the device: software renderers (no GPU) start light, and if frames still run
 * long the field steps down from full to half to a quarter at 30fps, and finally to a still frame.
 */

import { EDGES, type Layout } from './graph';

export type Theme = 'dark' | 'light';
export type Rect = { x0: number; y0: number; x1: number; y1: number };

export type SignalOptions = {
	layout: (aspect: number) => Layout;
	/** Particle counts for large and small screens */
	count: [number, number];
	/** Seconds for a particle to travel a whole path at full activity */
	period: number;
	/** Trail length as a fraction of the path */
	trail: number;
	/** Half the streak width, in CSS pixels */
	halfWidth: number;
	/** 0..1, how strongly particles part around the pointer */
	pointer: number;
	alpha: number;
	onFirstFrame?: () => void;
};

const MAX_EDGES = 8;
const MAX_HUBS = 3;
const SPLIT = 0.55;

const VERT = `
precision highp float;
attribute vec2 a_corner;
attribute vec4 a_p;
attribute vec2 a_q;

uniform vec2 u_res;
uniform vec4 u_inA[${MAX_EDGES}];
uniform vec4 u_inB[${MAX_EDGES}];
uniform float u_inHub[${MAX_EDGES}];
uniform float u_edgeT[${MAX_EDGES}];
uniform float u_edgeW[${MAX_EDGES}];
uniform vec4 u_outA[${MAX_HUBS}];
uniform vec4 u_outB[${MAX_HUBS}];
uniform vec3 u_spread;
uniform float u_trail;
uniform float u_time;
uniform vec4 u_ptr;
uniform vec4 u_mask0;
uniform vec4 u_mask1;
uniform float u_halfW;
uniform vec3 u_colA;
uniform vec3 u_colB;
uniform vec3 u_colDim;
uniform float u_alpha;

varying vec2 v_uv;
varying vec3 v_col;
varying float v_a;

vec2 bez(vec4 A, vec4 B, float t) {
	float s = 1.0 - t;
	return s * s * s * A.xy + 3.0 * s * s * t * A.zw + 3.0 * s * t * t * B.xy + t * t * t * B.zw;
}

vec2 bezD(vec4 A, vec4 B, float t) {
	float s = 1.0 - t;
	return 3.0 * s * s * (A.zw - A.xy) + 6.0 * s * t * (B.xy - A.zw) + 3.0 * t * t * (B.zw - B.xy);
}

vec2 pathAt(int ei, int hi, float u, float seed, float depth) {
	vec2 p;
	vec2 d;
	float spread;
	if (u < ${SPLIT.toFixed(2)}) {
		float s = u / ${SPLIT.toFixed(2)};
		p = bez(u_inA[ei], u_inB[ei], s);
		d = bezD(u_inA[ei], u_inB[ei], s);
		spread = mix(u_spread.x, u_spread.y, smoothstep(0.0, 1.0, s));
	} else {
		float s = (u - ${SPLIT.toFixed(2)}) / ${(1 - SPLIT).toFixed(2)};
		p = bez(u_outA[hi], u_outB[hi], s);
		d = bezD(u_outA[hi], u_outB[hi], s);
		spread = mix(u_spread.y, u_spread.z, smoothstep(0.0, 1.0, s));
	}
	vec2 n = normalize(vec2(-d.y, d.x) + 1e-5);
	float lane = fract(seed * 7.13) - 0.5;
	float wob = sin(u * 9.0 + seed * 61.0 + u_time * 0.5) * 0.6 + sin(u * 23.0 + seed * 17.0 - u_time * 0.35) * 0.4;
	return p + n * spread * (lane * 1.7 + wob * 0.45) * (0.6 + depth * 0.8);
}

vec2 push(vec2 p) {
	vec2 d = p - u_ptr.xy;
	float r = u_ptr.w;
	float f = exp(-dot(d, d) / (r * r)) * u_ptr.z;
	vec2 dir = d / (length(d) + 1e-3);
	return p + dir * f * r * 0.42 + vec2(-dir.y, dir.x) * f * r * 0.16;
}

float maskAt(vec2 p, vec4 r) {
	vec2 a = smoothstep(r.xy - 28.0, r.xy, p) * (1.0 - smoothstep(r.zw, r.zw + 28.0, p));
	return a.x * a.y;
}

void main() {
	int ei = int(a_p.x + 0.5);
	int hi = int(u_inHub[ei] + 0.5);
	float w = u_edgeW[ei];
	float depth = a_q.x;
	float u = fract(a_p.y + u_edgeT[ei] * a_p.z);
	float trail = u_trail * (0.55 + depth * 0.9) * mix(0.55, 1.0, w);
	float ut = max(u - trail, 0.0);

	vec2 head = push(pathAt(ei, hi, u, a_p.w, depth));
	vec2 tail = push(pathAt(ei, hi, ut, a_p.w, depth));
	vec2 dir = head - tail;
	float len = length(dir);
	dir = len > 1e-3 ? dir / len : vec2(1.0, 0.0);
	vec2 nrm = vec2(-dir.y, dir.x);
	float hw = u_halfW * (0.5 + depth * 0.9);
	vec2 pos = mix(head + dir * hw, tail, a_corner.x) + nrm * a_corner.y * hw;

	float ends = smoothstep(0.0, 0.05, u) * (1.0 - smoothstep(0.93, 1.0, u));
	float keep = (1.0 - 0.82 * maskAt(head, u_mask0)) * (1.0 - 0.82 * maskAt(head, u_mask1));
	vec2 toPtr = head - u_ptr.xy;
	float near = exp(-dot(toPtr, toPtr) / (u_ptr.w * u_ptr.w)) * u_ptr.z;

	v_col = mix(u_colDim, mix(u_colA, u_colB, a_q.y), w);
	v_a = u_alpha * ends * keep * mix(0.14, 1.0, w) * (0.3 + depth * 0.7) * (1.0 + near * 0.9);
	v_uv = a_corner;

	vec2 clip = pos / u_res * 2.0 - 1.0;
	gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
varying vec2 v_uv;
varying vec3 v_col;
varying float v_a;
void main() {
	float along = 1.0 - v_uv.x;
	float k = along * along * exp(-v_uv.y * v_uv.y * 2.8) * v_a;
	gl_FragColor = vec4(v_col * k, k);
}
`;

const PALETTE: Record<Theme, { a: number[]; b: number[]; dim: number[]; additive: boolean; alpha: number }> = {
	// Tail-light coral and sodium amber, added like light on the obsidian ground
	dark: { a: [1.0, 0.396, 0.29], b: [0.969, 0.667, 0.345], dim: [0.62, 0.6, 0.57], additive: true, alpha: 1 },
	// On the light ground the trails are ink: deep coral and burnt amber, blended normally
	light: { a: [0.7, 0.16, 0.06], b: [0.72, 0.39, 0.06], dim: [0.3, 0.29, 0.28], additive: false, alpha: 1.6 },
};

type Uniforms = Record<string, WebGLUniformLocation | null>;

type Instancing = {
	divisor: (index: number, divisor: number) => void;
	draw: (mode: number, first: number, count: number, instances: number) => void;
};

const OFFSCREEN_RECT: [number, number, number, number] = [-1e5, -1e5, -1e5 + 1, -1e5 + 1];

export class SignalRenderer {
	private canvas: HTMLCanvasElement;
	private opts: SignalOptions;
	private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
	private ctx2d: CanvasRenderingContext2D | null = null;
	private program: WebGLProgram | null = null;
	private buffers: WebGLBuffer[] = [];
	private u: Uniforms = {};
	private inst: Instancing | null = null;

	private count = 0;
	private drawCount = 0;
	private dpr = 1;
	private width = 1;
	private height = 1;
	private layout: Layout | null = null;

	private raf = 0;
	private last = 0;
	private time = 0;
	private edgeT = new Float32Array(MAX_EDGES);
	private edgeW = new Float32Array(MAX_EDGES).fill(1);
	private targetW = new Float32Array(MAX_EDGES).fill(1);
	private ptr = { x: -1e4, y: -1e4, s: 0, tx: -1e4, ty: -1e4, ts: 0 };
	private masks: Rect[] = [];
	private theme: Theme = 'dark';

	private visible = false;
	private hidden = false;
	private reduced = false;
	private destroyed = false;
	private firstFrame = false;
	private frameTimes: number[] = [];
	private quality = 0;
	private minFrameGap = 0;
	private lastDraw = 0;
	private stillOnly = false;

	private io: IntersectionObserver | null = null;
	private ro: ResizeObserver | null = null;
	private motionQuery: MediaQueryList | null = null;

	constructor(canvas: HTMLCanvasElement, opts: SignalOptions) {
		this.canvas = canvas;
		this.opts = opts;
		this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		this.reduced = this.motionQuery.matches;
		this.hidden = document.hidden;

		this.initGL();
		this.resize();

		this.ro = new ResizeObserver(() => {
			this.resize();
			this.requestStill();
		});
		this.ro.observe(canvas);

		this.io = new IntersectionObserver(
			([entry]) => {
				this.visible = entry.isIntersecting;
				this.updateLoop();
			},
			{ rootMargin: '80px 0px' },
		);
		this.io.observe(canvas);

		document.addEventListener('visibilitychange', this.onVisibility);
		window.addEventListener('pointermove', this.onPointer, { passive: true });
		window.addEventListener('pointerdown', this.onPointer, { passive: true });
		document.documentElement.addEventListener('pointerleave', this.onPointerLeave);
		this.motionQuery.addEventListener('change', this.onMotionChange);
		canvas.addEventListener('webglcontextlost', this.onContextLost);
		canvas.addEventListener('webglcontextrestored', this.onContextRestored);

		this.requestStill();
	}

	/** Light one system's edges and dim the rest; null lights everything */
	setRoute(hub: number | null) {
		for (let e = 0; e < MAX_EDGES; e++) {
			const edge = EDGES[e];
			this.targetW[e] = !edge ? 0 : hub === null || edge[1] === hub ? 1 : 0;
		}
		if (this.reduced || !this.loopWanted()) {
			this.edgeW.set(this.targetW);
			this.requestStill();
		}
	}

	setTheme(theme: Theme) {
		if (theme === this.theme) return;
		this.theme = theme;
		this.requestStill();
	}

	/** Rects in CSS pixels relative to the canvas where trails dim so text stays readable */
	setMasks(rects: Rect[]) {
		this.masks = rects.slice(0, 2);
		this.requestStill();
	}

	destroy() {
		this.destroyed = true;
		cancelAnimationFrame(this.raf);
		this.io?.disconnect();
		this.ro?.disconnect();
		document.removeEventListener('visibilitychange', this.onVisibility);
		window.removeEventListener('pointermove', this.onPointer);
		window.removeEventListener('pointerdown', this.onPointer);
		document.documentElement.removeEventListener('pointerleave', this.onPointerLeave);
		this.motionQuery?.removeEventListener('change', this.onMotionChange);
		this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
		this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored);
		const gl = this.gl;
		if (gl) {
			this.buffers.forEach((b) => gl.deleteBuffer(b));
			if (this.program) gl.deleteProgram(this.program);
			// Release the context only once the canvas has left the page; a canvas that stays
			// (a remount of the same element) must keep a live context for the next renderer
			const canvas = this.canvas;
			setTimeout(() => {
				if (!canvas.isConnected) gl.getExtension('WEBGL_lose_context')?.loseContext();
			}, 0);
		}
		this.gl = null;
		this.ctx2d = null;
	}

	// ---------- setup ----------

	private initGL() {
		const attrs: WebGLContextAttributes = { alpha: true, antialias: false, premultipliedAlpha: true, depth: false, stencil: false, powerPreference: 'high-performance' };
		const gl2 = this.canvas.getContext('webgl2', attrs) as WebGL2RenderingContext | null;
		let gl: WebGLRenderingContext | WebGL2RenderingContext | null = gl2;
		if (gl2) {
			this.inst = {
				divisor: (i, d) => gl2.vertexAttribDivisor(i, d),
				draw: (m, f, c, n) => gl2.drawArraysInstanced(m, f, c, n),
			};
		} else {
			const gl1 = this.canvas.getContext('webgl', attrs) as WebGLRenderingContext | null;
			const ext = gl1?.getExtension('ANGLE_instanced_arrays');
			if (gl1 && ext) {
				gl = gl1;
				this.inst = {
					divisor: (i, d) => ext.vertexAttribDivisorANGLE(i, d),
					draw: (m, f, c, n) => ext.drawArraysInstancedANGLE(m, f, c, n),
				};
			} else {
				gl = null;
			}
		}

		if (!gl || !this.buildProgram(gl)) {
			this.gl = null;
			this.ctx2d = this.canvas.getContext('2d');
			return;
		}
		this.gl = gl;

		// Without a GPU (blocklisted drivers, VMs, remote desktops) WebGL runs on the CPU: start light
		const info = gl.getExtension('WEBGL_debug_renderer_info');
		const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
		if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) this.setQuality(2);
	}

	/** 0 full, 1 half the particles at pixel ratio 1, 2 a quarter at 30fps, 3 a still frame */
	private setQuality(level: number) {
		this.quality = level;
		this.canvas.dataset.quality = String(level);
		this.drawCount = Math.max(1, Math.floor(this.count * [1, 0.5, 0.25, 0.25][level]));
		this.minFrameGap = level >= 2 ? 1000 / 30 : 0;
		this.frameTimes = [];
		if (level >= 3) {
			this.stillOnly = true;
			this.updateLoop();
		}
	}

	private buildProgram(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
		const compile = (type: number, src: string) => {
			const s = gl.createShader(type);
			if (!s) return null;
			gl.shaderSource(s, src);
			gl.compileShader(s);
			if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
				console.warn('[signal] shader:', gl.getShaderInfoLog(s));
				gl.deleteShader(s);
				return null;
			}
			return s;
		};
		const vs = compile(gl.VERTEX_SHADER, VERT);
		const fs = compile(gl.FRAGMENT_SHADER, FRAG);
		if (!vs || !fs) return false;
		const program = gl.createProgram();
		if (!program) return false;
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.bindAttribLocation(program, 0, 'a_corner');
		gl.bindAttribLocation(program, 1, 'a_p');
		gl.bindAttribLocation(program, 2, 'a_q');
		gl.linkProgram(program);
		gl.deleteShader(vs);
		gl.deleteShader(fs);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.warn('[signal] link:', gl.getProgramInfoLog(program));
			return false;
		}
		this.program = program;
		gl.useProgram(program);

		const names = ['u_res', 'u_inA', 'u_inB', 'u_inHub', 'u_edgeT', 'u_edgeW', 'u_outA', 'u_outB', 'u_spread', 'u_trail', 'u_time', 'u_ptr', 'u_mask0', 'u_mask1', 'u_halfW', 'u_colA', 'u_colB', 'u_colDim', 'u_alpha'];
		for (const n of names) this.u[n] = gl.getUniformLocation(program, n);

		// Quad corners: x runs head (0) to tail (1), y across the streak
		const corner = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, corner);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, -1, 1, -1, 0, 1, 1, 1]), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		this.inst!.divisor(0, 0);

		const small = Math.min(window.innerWidth, window.innerHeight) < 700 || navigator.hardwareConcurrency <= 4;
		this.count = small ? this.opts.count[1] : this.opts.count[0];
		this.drawCount = this.count;

		// Per particle: edge, phase, speed, seed | depth, hue. Seeded so every visit draws the same field.
		let s = 1234567;
		const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
		const p = new Float32Array(this.count * 4);
		const q = new Float32Array(this.count * 2);
		for (let i = 0; i < this.count; i++) {
			p[i * 4] = Math.floor(rand() * EDGES.length);
			p[i * 4 + 1] = rand();
			p[i * 4 + 2] = 0.7 + rand() * 0.6;
			p[i * 4 + 3] = rand();
			q[i * 2] = Math.pow(rand(), 1.4);
			q[i * 2 + 1] = rand() < 0.72 ? rand() * 0.35 : 0.65 + rand() * 0.35;
		}
		const pBuf = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, pBuf);
		gl.bufferData(gl.ARRAY_BUFFER, p, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(1);
		gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
		this.inst!.divisor(1, 1);

		const qBuf = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, qBuf);
		gl.bufferData(gl.ARRAY_BUFFER, q, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(2);
		gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
		this.inst!.divisor(2, 1);

		this.buffers = [corner, pBuf, qBuf];

		const hubOf = new Float32Array(MAX_EDGES);
		EDGES.forEach(([, hub], e) => (hubOf[e] = hub));
		gl.uniform1fv(this.u.u_inHub, hubOf);
		return true;
	}

	private resize() {
		const rect = this.canvas.getBoundingClientRect();
		const cap = this.quality >= 1 ? 1 : Math.min(window.innerWidth, window.innerHeight) < 700 ? 1.5 : 1.75;
		this.dpr = Math.min(window.devicePixelRatio || 1, cap);
		this.width = Math.max(1, Math.round(rect.width * this.dpr));
		this.height = Math.max(1, Math.round(rect.height * this.dpr));
		if (this.canvas.width !== this.width || this.canvas.height !== this.height) {
			this.canvas.width = this.width;
			this.canvas.height = this.height;
		}
		this.layout = this.opts.layout(rect.width / Math.max(1, rect.height));
		if (this.gl) this.uploadLayout();
	}

	private uploadLayout() {
		const gl = this.gl!;
		const L = this.layout!;
		const W = this.width;
		const H = this.height;
		const px = (pt: { x: number; y: number }) => [pt.x * W, pt.y * H];
		const curve = (a: number[], b: number[]) => {
			const k = 0.5;
			const c1 = L.axis === 'x' ? [a[0] + (b[0] - a[0]) * k, a[1]] : [a[0], a[1] + (b[1] - a[1]) * k];
			const c2 = L.axis === 'x' ? [b[0] - (b[0] - a[0]) * k, b[1]] : [b[0], b[1] - (b[1] - a[1]) * k];
			return [[a[0], a[1], c1[0], c1[1]], [c2[0], c2[1], b[0], b[1]]];
		};
		const inA = new Float32Array(MAX_EDGES * 4);
		const inB = new Float32Array(MAX_EDGES * 4);
		EDGES.forEach(([src, hub], e) => {
			const [A, B] = curve(px(L.sources[src]), px(L.hubs[hub]));
			inA.set(A, e * 4);
			inB.set(B, e * 4);
		});
		const outA = new Float32Array(MAX_HUBS * 4);
		const outB = new Float32Array(MAX_HUBS * 4);
		L.hubs.forEach((hub, h) => {
			const [A, B] = curve(px(hub), px(L.outputs[h]));
			outA.set(A, h * 4);
			outB.set(B, h * 4);
		});
		gl.useProgram(this.program);
		gl.uniform4fv(this.u.u_inA, inA);
		gl.uniform4fv(this.u.u_inB, inB);
		gl.uniform4fv(this.u.u_outA, outA);
		gl.uniform4fv(this.u.u_outB, outB);
		const short = Math.min(W, H);
		gl.uniform3f(this.u.u_spread, L.spread[0] * short, L.spread[1] * short, L.spread[2] * short);
	}

	// ---------- loop ----------

	private loopWanted() {
		return this.visible && !this.hidden && !this.reduced && !this.stillOnly && !this.destroyed && !!this.gl;
	}

	private updateLoop() {
		if (this.loopWanted()) {
			if (!this.raf) {
				this.last = performance.now();
				this.raf = requestAnimationFrame(this.tick);
			}
		} else {
			cancelAnimationFrame(this.raf);
			this.raf = 0;
			if (this.visible) this.requestStill();
		}
	}

	private tick = (now: number) => {
		this.raf = 0;
		if (!this.loopWanted()) return;
		// At the capped quality level, skip display frames instead of drawing every one
		if (this.minFrameGap && now - this.lastDraw < this.minFrameGap - 2) {
			this.raf = requestAnimationFrame(this.tick);
			return;
		}
		const frame = (now - this.last) / 1000;
		const dt = Math.min(0.05, frame);
		this.last = now;
		this.lastDraw = now;
		this.step(dt);
		this.draw();
		this.watchFrameRate(frame);
		this.raf = requestAnimationFrame(this.tick);
	};

	private step(dt: number) {
		this.time += dt;
		const ease = 1 - Math.exp(-dt * 3.2);
		for (let e = 0; e < MAX_EDGES; e++) {
			this.edgeW[e] += (this.targetW[e] - this.edgeW[e]) * ease;
			// Lit routes run at full pace, the others idle; integrating keeps positions continuous
			this.edgeT[e] += (dt / this.opts.period) * (0.45 + 0.55 * this.edgeW[e]);
		}
		const p = this.ptr;
		const k = 1 - Math.exp(-dt * 7);
		p.x += (p.tx - p.x) * k;
		p.y += (p.ty - p.y) * k;
		p.s += (p.ts - p.s) * (1 - Math.exp(-dt * 2.5));
	}

	/** Under reduced motion or when paused, draw one finished frame */
	private requestStill() {
		if (this.destroyed || this.loopWanted()) return;
		if (!this.firstFrame || this.reduced) {
			// A settled moment in the flow, the same on every visit
			this.time = 14;
			for (let e = 0; e < MAX_EDGES; e++) this.edgeT[e] = (14 / this.opts.period) * (0.45 + 0.55 * this.edgeW[e]);
		}
		this.edgeW.set(this.targetW);
		this.ptr.s = 0;
		this.draw();
	}

	/** If frames keep running long, step quality down one level (see setQuality) */
	private watchFrameRate(frame: number) {
		if (this.quality >= 3) return;
		this.frameTimes.push(frame);
		if (this.frameTimes.length < 60) return;
		const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
		this.frameTimes = [];
		// Full and half quality should hold 40fps; the capped level only has to hold 20fps
		const budget = this.quality >= 2 ? 1 / 20 : 1 / 40;
		if (avg > budget) {
			this.setQuality(this.quality + 1);
			this.resize();
			if (this.stillOnly) this.requestStill();
		}
	}

	private draw() {
		if (this.gl) this.drawGL();
		else if (this.ctx2d) this.draw2D();
		if (!this.firstFrame) {
			this.firstFrame = true;
			this.opts.onFirstFrame?.();
		}
	}

	private drawGL() {
		const gl = this.gl!;
		const pal = PALETTE[this.theme];
		gl.viewport(0, 0, this.width, this.height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.BLEND);
		if (pal.additive) gl.blendFunc(gl.ONE, gl.ONE);
		else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

		gl.useProgram(this.program);
		gl.uniform2f(this.u.u_res, this.width, this.height);
		gl.uniform1fv(this.u.u_edgeT, this.edgeT);
		gl.uniform1fv(this.u.u_edgeW, this.edgeW);
		gl.uniform1f(this.u.u_trail, this.opts.trail);
		gl.uniform1f(this.u.u_time, this.time);
		const radius = Math.min(this.width, this.height) * 0.16;
		gl.uniform4f(this.u.u_ptr, this.ptr.x * this.dpr, this.ptr.y * this.dpr, this.ptr.s * this.opts.pointer, radius);
		const m = (i: number) => {
			const r = this.masks[i];
			return r ? [r.x0 * this.dpr, r.y0 * this.dpr, r.x1 * this.dpr, r.y1 * this.dpr] : OFFSCREEN_RECT;
		};
		gl.uniform4fv(this.u.u_mask0, m(0));
		gl.uniform4fv(this.u.u_mask1, m(1));
		gl.uniform1f(this.u.u_halfW, this.opts.halfWidth * this.dpr);
		gl.uniform3fv(this.u.u_colA, pal.a);
		gl.uniform3fv(this.u.u_colB, pal.b);
		gl.uniform3fv(this.u.u_colDim, pal.dim);
		gl.uniform1f(this.u.u_alpha, this.opts.alpha * pal.alpha);
		this.inst!.draw(gl.TRIANGLE_STRIP, 0, 4, this.drawCount);
	}

	/** Still fallback without WebGL: the same bundles as thin strokes */
	private draw2D() {
		const c = this.ctx2d!;
		const L = this.layout!;
		const W = this.width;
		const H = this.height;
		const pal = PALETTE[this.theme];
		const rgb = (v: number[], a: number) => `rgba(${Math.round(v[0] * 255)},${Math.round(v[1] * 255)},${Math.round(v[2] * 255)},${a})`;
		c.clearRect(0, 0, W, H);
		c.globalCompositeOperation = pal.additive ? 'lighter' : 'source-over';
		c.lineWidth = Math.max(1, this.dpr);
		const short = Math.min(W, H);
		const strokeBundle = (a: { x: number; y: number }, b: { x: number; y: number }, spreadA: number, spreadB: number, color: string) => {
			for (let i = 0; i < 18; i++) {
				const o = (i / 17 - 0.5) * 2;
				const ax = a.x * W, ay = a.y * H, bx = b.x * W, by = b.y * H;
				const oa = o * spreadA * short, ob = o * spreadB * short;
				c.strokeStyle = color;
				c.beginPath();
				if (L.axis === 'x') {
					const mx = (ax + bx) / 2;
					c.moveTo(ax, ay + oa);
					c.bezierCurveTo(mx, ay + oa, mx, by + ob, bx, by + ob);
				} else {
					const my = (ay + by) / 2;
					c.moveTo(ax + oa, ay);
					c.bezierCurveTo(ax + oa, my, bx + ob, my, bx + ob, by);
				}
				c.stroke();
			}
		};
		EDGES.forEach(([src, hub], e) => {
			const color = this.targetW[e] > 0.5 ? rgb(pal.a, 0.22) : rgb(pal.dim, 0.08);
			strokeBundle(L.sources[src], L.hubs[hub], L.spread[0], L.spread[1], color);
		});
		L.hubs.forEach((hub, h) => {
			const lit = EDGES.some(([, eh], e) => eh === h && this.targetW[e] > 0.5);
			strokeBundle(hub, L.outputs[h], L.spread[1], L.spread[2], lit ? rgb(pal.b, 0.2) : rgb(pal.dim, 0.08));
		});
	}

	// ---------- events ----------

	private onPointer = (e: PointerEvent) => {
		const r = this.canvas.getBoundingClientRect();
		const x = e.clientX - r.left;
		const y = e.clientY - r.top;
		const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
		this.ptr.tx = x;
		this.ptr.ty = y;
		this.ptr.ts = inside ? 1 : 0;
		if (inside && this.ptr.s === 0) {
			this.ptr.x = x;
			this.ptr.y = y;
		}
	};

	private onPointerLeave = () => {
		this.ptr.ts = 0;
	};

	private onVisibility = () => {
		this.hidden = document.hidden;
		this.updateLoop();
	};

	private onMotionChange = (e: MediaQueryListEvent) => {
		this.reduced = e.matches;
		this.updateLoop();
		this.requestStill();
	};

	private onContextLost = (e: Event) => {
		e.preventDefault();
		cancelAnimationFrame(this.raf);
		this.raf = 0;
		this.gl = null;
	};

	private onContextRestored = () => {
		this.buffers = [];
		this.initGL();
		this.resize();
		this.updateLoop();
		this.requestStill();
	};
}
