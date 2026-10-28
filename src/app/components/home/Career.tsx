'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { experience, researchExperience } from '../../resources/consts';

/*
 * The career as a timeline drawn to scale, May 2021 to today. Drag the playhead (or press Play)
 * to see what was happening in any month; the current role grows to today's date on every visit.
 * Every role, date and point comes from resources/consts.ts.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Months counted from year 0, so arithmetic on them is plain subtraction
const monthIndex = (label: string) => {
	const [mon, year] = label.trim().split(/\s+/);
	return Number(year) * 12 + MONTHS.indexOf(mon.slice(0, 3));
};
const monthLabel = (m: number, long = false) => `${(long ? FULL_MONTHS : MONTHS)[m % 12]} ${Math.floor(m / 12)}`;
const nowIndex = (d = new Date()) => d.getFullYear() * 12 + d.getMonth();

type Entry = {
	id: string;
	short: string;
	role: string;
	org: string;
	place: string;
	start: number;
	/** null while it is still going */
	end: number | null;
	points: string[];
};

const parseSpan = (timeframe: string) => {
	const [from, to] = timeframe.split(/\s*-\s*/);
	return { start: monthIndex(from), end: /present/i.test(to) ? null : monthIndex(to) };
};

const SHORT: Record<string, string> = {
	'Twisted X Global Brands': 'Twisted X',
	'JPMorgan Chase': 'JPMorgan',
	'Colombo AI': 'Colombo AI',
	'HCL Technologies': 'HCL',
};

const work: Entry[] = experience
	.map((job) => ({
		id: job.company,
		short: SHORT[job.company] ?? job.company,
		role: job.role,
		org: job.company,
		place: job.location.replace(', USA', ''),
		...parseSpan(job.timeframe),
		points: job.achievements,
	}))
	.sort((a, b) => a.start - b.start);

// The M.S. and the research post share their dates, so they share one bar
const study: Entry[] = [
	{
		id: 'uta-ms',
		short: 'UT Arlington',
		role: 'M.S. in Computer Science',
		org: 'The University of Texas at Arlington',
		place: 'Texas',
		start: monthIndex('Aug 2022'),
		end: monthIndex('May 2024'),
		points: ['Focus on intelligent systems, big data and cloud computing.'],
	},
	{
		id: 'uta-gra',
		short: 'UT Arlington',
		role: researchExperience.role,
		org: researchExperience.company,
		place: 'Texas',
		...parseSpan(researchExperience.timeframe),
		points: researchExperience.achievements,
	},
];

const START = work[0].start;
// A fixed month for the first render, so server and browser agree; the real month replaces it on load
const FIRST_RENDER_NOW = monthIndex('Oct 2026');

const isActiveAt = (e: Entry, m: number, now: number) => m >= e.start && m <= (e.end ?? now);

function tenure(months: number) {
	const y = Math.floor(months / 12);
	const r = months % 12;
	const part = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;
	if (y && r) return `${part(y, 'year')}, ${part(r, 'month')}`;
	return y ? part(y, 'year') : part(Math.max(r, 1), 'month');
}

/**
 * Bars sit on a month grid; when one role ends in the month the next begins (JPMorgan into
 * Twisted X), both meet at the middle of that month instead of overlapping.
 */
function laneBars(entries: Entry[], now: number) {
	return entries.map((e, i) => {
		const prev = entries[i - 1];
		const next = entries[i + 1];
		const end = e.end ?? now;
		const from = prev && prev.end === e.start ? e.start + 0.5 : e.start;
		const to = next && next.start === end ? end + 0.5 : end + 1;
		return { entry: e, from, to };
	});
}

export function Career() {
	const [now, setNow] = useState(FIRST_RENDER_NOW);
	const [at, setAt] = useState(FIRST_RENDER_NOW);
	const [playing, setPlaying] = useState(false);
	const raf = useRef(0);

	// Use the visitor's own month, so the current role always reaches today
	useEffect(() => {
		const n = nowIndex();
		setNow(n);
		setAt(n);
	}, []);

	// Play walks the playhead from the first job to today, about four months a second
	useEffect(() => {
		if (!playing) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			setAt(now);
			setPlaying(false);
			return;
		}
		let from: number | null = null;
		const startAt = at >= now ? START : at;
		const tick = (t: number) => {
			if (from === null) from = t;
			const m = Math.min(now, startAt + ((t - from) / 1000) * 4);
			setAt(Math.round(m));
			if (m < now) raf.current = requestAnimationFrame(tick);
			else setPlaying(false);
		};
		raf.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf.current);
	}, [playing]); // eslint-disable-line react-hooks/exhaustive-deps

	const span = now + 1 - START;
	const pct = (m: number) => `${((m - START) / span) * 100}%`;
	const years: number[] = [];
	for (let y = Math.floor(START / 12) + 1; y <= Math.floor(now / 12); y++) years.push(y);

	const activeWork = work.filter((e) => isActiveAt(e, at, now));
	const activeStudy = study.filter((e) => isActiveAt(e, at, now));
	const active = [...activeWork, ...activeStudy];
	const atNow = at >= now;
	const lanes = [
		{ id: 'work', label: 'Work', bars: laneBars(work, now) },
		{ id: 'study', label: 'Study and research', bars: laneBars([study[0]], now) },
	];

	const jumpTo = (e: Entry) => {
		setPlaying(false);
		setAt(e.start);
	};

	const summary = active.length
		? active.map((e) => `${e.role} at ${e.org}`).join(' and ')
		: 'Between roles';

	return (
		<section className="career chapter-alt" data-chapter="alt" aria-labelledby="career-title">
			<h2 id="career-title" className="career__title" data-reveal>From banking to boots</h2>
			<p className="career__lead" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
				Four years across IT services, a social media startup, AI research at JPMorgan Chase and supply-chain AI at
				Twisted X. Drag through the timeline, or press play, to see where I was in any month.
			</p>

			<figure className="timeline" data-reveal style={{ '--i': 2 } as React.CSSProperties}>
				<div className="timeline__bar-row">
					<button
						type="button"
						className="timeline__play"
						onClick={() => setPlaying((p) => !p)}
						aria-label={playing ? 'Pause the timeline' : 'Play the timeline from 2021 to today'}
					>
						{playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
						<span aria-hidden="true">{playing ? 'Pause' : 'Play'}</span>
					</button>
					<p className="timeline__when" aria-hidden="true">
						{atNow ? 'Today' : monthLabel(at, true)}
					</p>
				</div>

				<div className="timeline__plot">
					{lanes.map((lane) => (
						<div key={lane.id} className="timeline__lane">
							<span className="timeline__lane-name">{lane.label}</span>
							<div className="timeline__track">
								{lane.bars.map(({ entry, from, to }) => {
									const on = lane.id === 'work' ? activeWork.includes(entry) : activeStudy.length > 0;
									return (
										<button
											key={entry.id}
											type="button"
											className={`timeline__bar${on ? ' is-on' : ''}${entry.end === null ? ' is-current' : ''}`}
											style={{ left: pct(from), width: `calc(${pct(to)} - ${pct(from)})` }}
											onClick={() => jumpTo(entry)}
											aria-label={`Go to ${entry.short}, ${monthLabel(entry.start)} to ${entry.end === null ? 'now' : monthLabel(entry.end)}`}
										>
											<span className="timeline__bar-label">{entry.short}</span>
										</button>
									);
								})}
							</div>
						</div>
					))}
					<span className="timeline__head" aria-hidden="true" style={{ left: `calc(${pct(at + 0.5)})` }} />
				</div>

				<div className="timeline__axis" aria-hidden="true">
					{years.map((y) => (
						<span key={y} style={{ left: pct(y * 12) }}>{y}</span>
					))}
				</div>

				<label className="ds-visually-hidden" htmlFor="career-month">Month on the timeline</label>
				<input
					id="career-month"
					className="timeline__range"
					type="range"
					min={START}
					max={now}
					step={1}
					value={at}
					onChange={(e) => {
						setPlaying(false);
						setAt(Number(e.target.value));
					}}
					aria-valuetext={`${atNow ? 'Today' : monthLabel(at, true)}: ${summary}`}
				/>
			</figure>

			<div className="career__grid">
				<figure className="career__photo" data-reveal>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="/images/color/graduation-960.webp"
						srcSet="/images/color/graduation-640.webp 640w, /images/color/graduation-960.webp 960w"
						sizes="(max-width: 760px) 60vw, 26vw"
						alt="Yasasvi in cap and gown at his graduation"
						width={960}
						height={1200}
						loading="lazy"
						decoding="async"
					/>
				</figure>

				<div className="career__now" aria-live="polite">
					{active.length === 0 ? (
						<div className="career-card">
							<p className="career-card__role">Between roles</p>
							{(() => {
								// Name the roles on either side of the gap, taken from the data
								const all = [...work, ...study].sort((a, b) => a.start - b.start);
								const before = all.filter((e) => e.end !== null && e.end < at).pop();
								const after = all.find((e) => e.start > at);
								return before && after ? (
									<p className="career-card__org">After {before.org}, before {after.org}.</p>
								) : null;
							})()}
						</div>
					) : (
						active.map((e) => (
							<div key={e.id} className="career-card">
								<p className="career-card__role">{e.role}</p>
								<p className="career-card__org">{e.org}, {e.place}</p>
								<p className="career-card__when">
									{monthLabel(e.start)} to {e.end === null ? 'now' : monthLabel(e.end)}
									{e.end === null && `, ${tenure(now - e.start)} so far`}
								</p>
								<ul className="career-card__points">
									{e.points.slice(0, 3).map((p) => <li key={p}>{p}</li>)}
								</ul>
							</div>
						))
					)}
				</div>
			</div>
		</section>
	);
}
