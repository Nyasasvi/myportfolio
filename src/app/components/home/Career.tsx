'use client';

import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import { experience, researchExperience } from '../../resources/consts';

// "Dec 2024 - Present" → "Dec 2024 – now"
const span = (timeframe: string) => timeframe.replace(/\s*-\s*/, ' – ').replace(/present/i, 'now');

type Row = { years: string; role: string; org: string; place: string; points: string[] };

const work: Row[] = experience.map((job) => ({
	years: span(job.timeframe),
	role: job.role.replace(' – ', ', '),
	org: job.company,
	place: job.location.replace(', USA', ''),
	points: job.achievements,
}));

const study: Row[] = [
	{
		years: span(researchExperience.timeframe),
		role: researchExperience.role,
		org: researchExperience.company,
		place: 'Texas',
		points: researchExperience.achievements,
	},
	{
		years: 'Aug 2022 – May 2024',
		role: 'M.S. in Computer Science',
		org: 'The University of Texas at Arlington',
		place: 'Texas',
		points: ['Focus on intelligent systems, big data and cloud computing.'],
	},
];

function CareerRow({ row }: { row: Row }) {
	const [open, setOpen] = useState(false);
	const id = useId();
	return (
		<li className="career-row" data-open={open || undefined}>
			<button type="button" className="career-row__head" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
				<span className="career-row__years">{row.years}</span>
				<span className="career-row__what">
					<span className="career-row__role">{row.role}</span>
					<span className="career-row__org">{row.org}</span>
				</span>
				<span className="career-row__place">
					{row.place}
					<Plus className="career-row__icon" aria-hidden="true" />
				</span>
			</button>
			<div id={id} className="career-row__panel" role="region" aria-label={`${row.role} at ${row.org}`}>
				<div className="career-row__inner">
					<ul>
						{row.points.map((p) => <li key={p}>{p}</li>)}
					</ul>
				</div>
			</div>
		</li>
	);
}

export function Career() {
	return (
		<section className="career chapter-alt" data-chapter="alt" aria-labelledby="career-title">
			<h2 id="career-title" className="career__title" data-reveal>From banking to boots</h2>
			<div className="career__grid">
				<figure className="career__photo" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="/images/mono/graduation-960.webp"
						srcSet="/images/mono/graduation-640.webp 640w, /images/mono/graduation-960.webp 960w"
						sizes="(max-width: 760px) 60vw, 26vw"
						alt="Yasasvi in cap and gown at his graduation"
						width={960}
						height={1200}
						loading="lazy"
						decoding="async"
					/>
				</figure>
				<div className="career__table">
					<p className="career__lead" data-reveal>
						Four years across IT services, a social media startup, AI research at JPMorgan Chase and supply-chain AI at
						Twisted X. Open a row for the details.
					</p>
					<ol className="career__rows" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
						{work.map((row) => <CareerRow key={row.org} row={row} />)}
					</ol>
					<ol className="career__rows career__rows--study" data-reveal style={{ '--i': 2 } as React.CSSProperties}>
						{study.map((row) => <CareerRow key={row.role} row={row} />)}
					</ol>
				</div>
			</div>
		</section>
	);
}
