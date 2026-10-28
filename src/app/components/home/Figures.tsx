'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Activity } from 'lucide-react';
import { showSystemRoute } from './systemEvents';

/*
 * Each result carries the chart that shows it. Most results on the resume are relative changes
 * with no published starting value, so those are drawn against an index where before = 100; the
 * forecast uses its real WAPE ranges, and the HCL figure is a live view of one day at that rate.
 */
type Bar = { name: string; from: number; to: number; value: string };
type Chart = {
	title: string;
	note: string;
	max: number;
	ticks: { at: number; label: string }[];
	before: Bar;
	after: Bar;
	gain: { dir: 'up' | 'down' | 'live'; text: string };
	/** Show where the "before" bar sat, behind the "after" bar */
	ghost: boolean;
	live?: 'day';
	describe: string;
};

const INDEX_TICKS = [
	{ at: 0, label: '0' },
	{ at: 50, label: '50' },
	{ at: 100, label: '100' },
];

const indexed = (opts: { title: string; better: 'lower' | 'higher'; afterName: string; after: number; gain: string; context: string }): Chart => ({
	title: opts.title,
	note: `Indexed so before = 100. ${opts.better === 'lower' ? 'Lower' : 'Higher'} is better.`,
	max: 140,
	ticks: INDEX_TICKS,
	before: { name: 'Before', from: 0, to: 100, value: '100' },
	after: { name: opts.afterName, from: 0, to: opts.after, value: String(opts.after) },
	gain: { dir: opts.better === 'lower' ? 'down' : 'up', text: opts.gain },
	ghost: true,
	describe: `${opts.title}, indexed so before is 100: ${opts.context} it went to ${opts.after}.`,
});

// Results stated on the resume (resources/consts.ts); nothing here is rounded up or added.
// `route` points at the live diagram question that explains the result, where one exists.
const rows: {
	value: string;
	text: string;
	company: string;
	route?: { graph: string; id: string };
	chart: Chart;
}[] = [
	{
		value: '70%',
		text: 'less time spent on supply-chain reporting with the agentic platform at Twisted X.',
		company: 'Twisted X',
		route: { graph: 'twisted-x', id: 'stock' },
		chart: indexed({ title: 'Time spent on supply-chain reporting', better: 'lower', afterName: 'With the agentic platform', after: 30, gain: '70% less time', context: 'with the agentic platform' }),
	},
	{
		value: '15%',
		text: 'better order fulfillment from the same platform.',
		company: 'Twisted X',
		route: { graph: 'twisted-x', id: 'stock' },
		chart: indexed({ title: 'Order fulfillment', better: 'higher', afterName: 'With the agentic platform', after: 115, gain: '15% better', context: 'with the agentic platform' }),
	},
	{
		value: '11–21%',
		text: 'forecast error across SKUs with a fine-tuned TimesFM model, down from 24–31% with rolling 12-month averages.',
		company: 'Twisted X',
		chart: {
			title: 'Forecast error across SKUs, as WAPE',
			note: 'Lower is better.',
			max: 35,
			ticks: [0, 10, 20, 30].map((t) => ({ at: t, label: `${t}%` })),
			before: { name: 'Rolling 12-month average', from: 24, to: 31, value: '24–31%' },
			after: { name: 'Fine-tuned TimesFM', from: 11, to: 21, value: '11–21%' },
			gain: { dir: 'down', text: '10–13 points lower at both ends' },
			ghost: true,
			describe: 'Forecast error fell from 24 to 31 percent with rolling 12-month averages to 11 to 21 percent with fine-tuned TimesFM.',
		},
	},
	{
		value: '40%',
		text: 'lower retrieval latency for the MCP tool-calling agents over NetSuite.',
		company: 'Twisted X',
		chart: indexed({ title: 'Retrieval latency for the MCP agents', better: 'lower', afterName: 'Optimized RESTlet flows', after: 60, gain: '40% lower latency', context: 'with optimized RESTlet flows' }),
	},
	{
		value: '30%',
		text: 'more engagement from the personalized feed I built at Colombo AI.',
		company: 'Colombo AI',
		route: { graph: 'colombo-ai', id: 'next' },
		chart: indexed({ title: 'Engagement with the feed', better: 'higher', afterName: 'Personalized feed', after: 130, gain: '30% more engagement', context: 'with the personalized feed' }),
	},
	{
		value: '500 GB',
		text: 'of data a day through the Spark and Kafka pipelines I built at HCL Technologies.',
		company: 'HCL',
		route: { graph: 'hcl', id: 'pipeline' },
		chart: {
			title: 'One day through the pipeline',
			note: 'Live, on Dallas time: how much of today’s 500 GB has moved so far.',
			max: 500,
			ticks: [
				{ at: 0, label: '0' },
				{ at: 250, label: '250 GB' },
				{ at: 500, label: '500 GB' },
			],
			before: { name: 'A full day', from: 0, to: 500, value: '500 GB' },
			after: { name: 'So far today', from: 0, to: 0, value: '' },
			gain: { dir: 'live', text: 'About 5.8 MB every second' },
			ghost: false,
			live: 'day',
			describe: 'At 500 gigabytes a day, the pipeline moves about 5.8 megabytes a second.',
		},
	},
];

const DEFAULT_PICK = 2; // the forecast: the one result with real before-and-after values

const prefersReducedMotion = () =>
	typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True once the element has scrolled into view; stays true */
function useSeen<T extends Element>() {
	const ref = useRef<T>(null);
	const [seen, setSeen] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (!('IntersectionObserver' in window)) return setSeen(true);
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setSeen(true);
					io.disconnect();
				}
			},
			{ threshold: 0.35 },
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);
	return [ref, seen] as const;
}

/**
 * Counts every number in `value` up from zero once `run` turns true. The final text is laid out
 * invisibly underneath, so the row never changes width while the digits move. The server renders
 * the real figures; the browser only zeroes them while they are still waiting below the fold.
 */
function CountUp({ value, run, delay = 0 }: { value: string; run: boolean; delay?: number }) {
	const parts = value.split(/(\d+)/);
	const targets = parts.map((part) => (/^\d+$/.test(part) ? Number(part) : null));
	const [progress, setProgress] = useState(1);

	useEffect(() => {
		if (!run && !prefersReducedMotion()) setProgress(0);
		// Only on mount: zero the figures once, before the row is seen
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!run) return;
		if (prefersReducedMotion()) return setProgress(1);
		let raf = 0;
		let start = 0;
		const duration = 1100;
		const tick = (now: number) => {
			if (!start) start = now + delay;
			const t = Math.min(1, Math.max(0, (now - start) / duration));
			setProgress(1 - Math.pow(1 - t, 3));
			if (t < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [run, delay]);

	return (
		<span className="count">
			<span className="count__final" aria-hidden="true">{value}</span>
			<span className="count__live" aria-hidden="true">
				{parts.map((part, i) => (targets[i] === null ? part : Math.round((targets[i] as number) * progress)))}
			</span>
			<span className="ds-visually-hidden">{value}</span>
		</span>
	);
}

/** Fraction of the day gone in Dallas, ticking once a second while `on` */
function useDallasDay(on: boolean) {
	const [fraction, setFraction] = useState<number | null>(null);
	useEffect(() => {
		if (!on) return;
		const read = () => {
			const parts = new Intl.DateTimeFormat('en-US', {
				timeZone: 'America/Chicago',
				hour: 'numeric',
				minute: 'numeric',
				second: 'numeric',
				hourCycle: 'h23',
			}).formatToParts(new Date());
			const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
			setFraction((get('hour') * 3600 + get('minute') * 60 + get('second')) / 86400);
		};
		read();
		const id = window.setInterval(read, 1000);
		return () => window.clearInterval(id);
	}, [on]);
	return fraction;
}

function FigureChart({ chart, plotRef }: { chart: Chart; plotRef: React.RefObject<HTMLDivElement> }) {
	const day = useDallasDay(chart.live === 'day');
	let after = chart.after;
	if (chart.live === 'day' && day !== null) {
		const gb = 500 * day;
		after = { ...after, to: gb, value: `${gb.toFixed(1)} GB` };
	}
	const pct = (v: number) => `${(v / chart.max) * 100}%`;
	const bars = [
		{ bar: chart.before, emphasis: false },
		{ bar: after, emphasis: true },
	];
	const GainIcon = chart.gain.dir === 'up' ? ArrowUp : chart.gain.dir === 'down' ? ArrowDown : Activity;

	return (
		<>
			{/* The words swap with a short fade; the bars below morph from the previous chart */}
			<figcaption className="forecast__title" key={`${chart.title}-title`}>
				<span className="forecast__heading">{chart.title}</span>
				<span className="forecast__note">{chart.note}</span>
			</figcaption>
			<div ref={plotRef} className="forecast__plot" role="img" aria-label={chart.describe}>
				{bars.map(({ bar, emphasis }, i) => (
					<div key={i} className={`forecast__row${emphasis ? ' is-emphasis' : ''}`}>
						<span className="forecast__name">{bar.name}</span>
						<span className="forecast__lane">
							<span className="forecast__track">
								{emphasis && chart.ghost && (
									<span
										className="forecast__ghost"
										aria-hidden="true"
										style={{ left: pct(chart.before.from), width: pct(chart.before.to - chart.before.from) }}
									/>
								)}
								<span
									className="forecast__range"
									style={{ left: pct(bar.from), width: pct(Math.max(0, bar.to - bar.from)) }}
								/>
							</span>
							<span className="forecast__value">{bar.value || '…'}</span>
						</span>
					</div>
				))}
				<div className="forecast__axis" aria-hidden="true">
					{chart.ticks.map((t) => (
						<span key={t.label} style={{ left: pct(t.at) }} data-edge={t.at === 0 ? 'start' : t.at === chart.max ? 'end' : undefined}>
							{t.label}
						</span>
					))}
				</div>
			</div>
			<p className="forecast__gain" key={`${chart.title}-gain`}>
				<GainIcon aria-hidden="true" />
				{chart.gain.text}
			</p>
			<table className="ds-visually-hidden">
				<caption>{chart.title}</caption>
				<thead>
					<tr><th scope="col">Series</th><th scope="col">Value</th></tr>
				</thead>
				<tbody>
					{bars.map(({ bar }) => (
						<tr key={bar.name}><th scope="row">{bar.name}</th><td>{bar.value}</td></tr>
					))}
				</tbody>
			</table>
		</>
	);
}

export function Figures() {
	const [listRef, listSeen] = useSeen<HTMLDListElement>();
	const [chartRef, chartSeen] = useSeen<HTMLDivElement>();
	const [focus, setFocus] = useState<number | null>(null);
	const [picked, setPicked] = useState(DEFAULT_PICK);

	const pick = (i: number) => {
		setFocus(i);
		setPicked(i);
	};

	return (
		<section className="figures" data-chapter="base" aria-labelledby="figures-title">
			<div className="figures__list">
				<h2 id="figures-title" className="section-title" data-reveal>What changed</h2>
				<dl
					ref={listRef}
					className="figures__rows"
					data-has-focus={focus !== null || undefined}
					onMouseLeave={() => setFocus(null)}
				>
					{rows.map((row, i) => (
						<div
							key={i}
							className="figure-row"
							data-focus={focus === i || undefined}
							data-picked={picked === i || undefined}
							data-reveal
							style={{ '--i': i } as React.CSSProperties}
							onMouseEnter={() => pick(i)}
							onFocus={() => pick(i)}
							onBlur={() => setFocus(null)}
							onClick={() => setPicked(i)}
						>
							<dt className="figure-row__value">
								<button
									type="button"
									className="figure-row__pick"
									aria-pressed={picked === i}
									aria-controls="figure-chart"
									aria-label={`Show the chart for ${row.value} ${row.text}`}
								>
									<CountUp value={row.value} run={listSeen} delay={i * 90} />
								</button>
							</dt>
							<dd className="figure-row__text">
								{row.text}
								<span className="figure-row__meta">
									<span className="figure-row__company">{row.company}</span>
									{row.route && (
										<button
											type="button"
											className="figure-row__how"
											onClick={() => showSystemRoute(row.route!.graph, row.route!.id)}
										>
											See how it works
											<ArrowDown aria-hidden="true" />
										</button>
									)}
								</span>
							</dd>
						</div>
					))}
				</dl>
			</div>

			{/* State goes in data attributes: the reveal script adds is-in to the class list, and a
			    changing className would wipe it and hide the element */}
			<figure
				id="figure-chart"
				className="forecast"
				data-seen={chartSeen || undefined}
				data-reveal
				style={{ '--i': 2 } as React.CSSProperties}
			>
				<FigureChart chart={rows[picked].chart} plotRef={chartRef} />
			</figure>
		</section>
	);
}
