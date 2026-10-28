'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { showSystemRoute } from './systemEvents';

// Results stated on the resume (resources/consts.ts); nothing here is rounded up or added.
// `route` points at the live diagram question that explains the result, where one exists.
const rows = [
	{ value: '70%', text: 'less time spent on supply-chain reporting with the agentic platform at Twisted X.', company: 'Twisted X', route: { graph: 'twisted-x', id: 'stock' } },
	{ value: '15%', text: 'better order fulfillment from the same platform.', company: 'Twisted X', route: { graph: 'twisted-x', id: 'stock' } },
	{ value: '11–21%', text: 'forecast error across SKUs with a fine-tuned TimesFM model, down from 24–31% with rolling 12-month averages.', company: 'Twisted X' },
	{ value: '40%', text: 'lower retrieval latency for the MCP tool-calling agents over NetSuite.', company: 'Twisted X' },
	{ value: '30%', text: 'more engagement from the personalized feed I built at Colombo AI.', company: 'Colombo AI', route: { graph: 'colombo-ai', id: 'next' } },
	{ value: '500 GB', text: 'of data a day through the Spark and Kafka pipelines I built at HCL Technologies.', company: 'HCL', route: { graph: 'hcl', id: 'pipeline' } },
];

// Forecast error (WAPE) ranges on one 0–35% axis: the baseline in grey, the change in the accent
const AXIS_MAX = 35;
const ranges = [
	{ name: 'Rolling 12-month average', from: 24, to: 31, emphasis: false },
	{ name: 'Fine-tuned TimesFM', from: 11, to: 21, emphasis: true },
];
const ticks = [0, 10, 20, 30];
const pct = (v: number) => `${(v / AXIS_MAX) * 100}%`;
// Points of improvement at each end of the range: 24 → 11 and 31 → 21
const gain = [ranges[0].from - ranges[1].from, ranges[0].to - ranges[1].to].sort((a, b) => a - b);

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

export function Figures() {
	const [listRef, listSeen] = useSeen<HTMLDListElement>();
	const [chartRef, chartSeen] = useSeen<HTMLDivElement>();
	const [focus, setFocus] = useState<number | null>(null);

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
							data-reveal
							style={{ '--i': i } as React.CSSProperties}
							onMouseEnter={() => setFocus(i)}
							onFocus={() => setFocus(i)}
							onBlur={() => setFocus(null)}
						>
							<dt className="figure-row__value">
								<CountUp value={row.value} run={listSeen} delay={i * 90} />
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
			<figure className="forecast" data-seen={chartSeen || undefined} data-reveal style={{ '--i': 2 } as React.CSSProperties}>
				<figcaption className="forecast__title">Forecast error across SKUs, as WAPE. Lower is better.</figcaption>
				<div
					ref={chartRef}
					className="forecast__plot"
					role="img"
					aria-label={`Forecast error fell from 24 to 31 percent with rolling 12-month averages to 11 to 21 percent with fine-tuned TimesFM, ${gain[0]} to ${gain[1]} points lower.`}
				>
					{ranges.map((r, i) => (
						<div key={r.name} className={`forecast__row${r.emphasis ? ' is-emphasis' : ''}`} style={{ '--i': i } as React.CSSProperties}>
							<span className="forecast__name">{r.name}</span>
							<span className="forecast__track">
								{/* Where the error used to be, so the new range reads as a drop from it */}
								{r.emphasis && (
									<span className="forecast__ghost" aria-hidden="true" style={{ left: pct(ranges[0].from), width: pct(ranges[0].to - ranges[0].from) }} />
								)}
								<span
									className="forecast__range"
									style={{ left: pct(r.from), width: pct(r.to - r.from), '--shift': `${((ranges[0].from - r.from) / (r.to - r.from)) * 100}%` } as React.CSSProperties}
									tabIndex={0}
									data-tip={`${r.name}: ${r.from}–${r.to}%`}
								/>
								{/* The emphasis label sits left of its bar, clear of the ghost range on the right */}
								<span
									className="forecast__value"
									style={r.emphasis ? { right: `calc(100% - ${pct(r.from)} + 8px)` } : { left: `calc(${pct(r.to)} + 8px)` }}
								>
									{r.from}–{r.to}%
								</span>
							</span>
						</div>
					))}
					<div className="forecast__axis" aria-hidden="true">
						{ticks.map((t) => (
							<span key={t} style={{ left: pct(t) }}>{t}%</span>
						))}
					</div>
				</div>
				<p className="forecast__gain" aria-hidden="true">
					<ArrowDown />
					{gain[0]}–{gain[1]} points lower at both ends of the range
				</p>
				<table className="ds-visually-hidden">
					<caption>Forecast error (WAPE) across SKUs</caption>
					<thead>
						<tr><th scope="col">Method</th><th scope="col">Low</th><th scope="col">High</th></tr>
					</thead>
					<tbody>
						{ranges.map((r) => (
							<tr key={r.name}><th scope="row">{r.name}</th><td>{r.from}%</td><td>{r.to}%</td></tr>
						))}
					</tbody>
				</table>
			</figure>
		</section>
	);
}
