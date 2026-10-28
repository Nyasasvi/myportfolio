'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { contactLinks } from '../../resources/navigation';

/*
 * About, at the length the visitor has time for. Each step adds to the one before, and the photo
 * pulls back as the story gets longer: a close portrait, then a half-length shot, then full length.
 * Every sentence comes from the resume (resources/consts.ts).
 */
const LENGTHS = [
	{
		id: 'short',
		label: '5 seconds',
		photo: {
			src: '/images/color/portrait-640.webp',
			srcSet: '/images/color/portrait-320.webp 320w, /images/color/portrait-640.webp 640w',
			alt: 'Portrait of Yasasvi beside a river',
			position: '50% 30%',
		},
	},
	{
		id: 'medium',
		label: '30 seconds',
		photo: {
			src: '/images/color/mountains-800.webp',
			srcSet: '/images/color/mountains-480.webp 480w, /images/color/mountains-800.webp 800w',
			alt: 'Yasasvi in a winter jacket in front of misty mountains',
			position: '50% 50%',
		},
	},
	{
		id: 'long',
		label: '2 minutes',
		photo: {
			src: '/images/color/graduation-960.webp',
			srcSet: '/images/color/graduation-640.webp 640w, /images/color/graduation-960.webp 960w',
			alt: 'Yasasvi in cap and gown at his graduation',
			position: '50% 40%',
		},
	},
] as const;

// Twisted X start date, from experience[0].timeframe
const TWISTED_X_START = new Date(2024, 11, 1);

function timeSince(start: Date, now: Date) {
	const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
	const years = Math.floor(months / 12);
	const rest = months % 12;
	const part = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;
	if (years && rest) return `${part(years, 'year')}, ${part(rest, 'month')}`;
	if (years) return part(years, 'year');
	return part(Math.max(rest, 1), 'month');
}

/** "1 year, 10 months", worked out on the visitor's own clock so the line never goes stale */
function useTenure() {
	const [tenure, setTenure] = useState<string | null>(null);
	useEffect(() => setTenure(timeSince(TWISTED_X_START, new Date())), []);
	return tenure;
}

export function AboutBlock() {
	// Start at the middle length; it is also what readers without JavaScript see
	const [length, setLength] = useState(1);
	// Until the script runs, every paragraph stays readable (the CSS only collapses them under html.js)
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const tenure = useTenure();
	const groupRef = useRef<HTMLDivElement>(null);

	// Radio-group keys: arrows move and select, so one Tab reaches the control and arrows change it
	const onKeyDown = (e: React.KeyboardEvent) => {
		const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
		if (!delta) return;
		e.preventDefault();
		const next = (length + delta + LENGTHS.length) % LENGTHS.length;
		setLength(next);
		groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
	};

	const show = (min: number) => ({
		className: `about-home__more-text${length >= min ? ' is-shown' : ''}`,
		'aria-hidden': (mounted && length < min) || undefined,
	});

	return (
		<section className="about-home" data-chapter="base" aria-labelledby="about-title">
			<figure className="about-home__band">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src="/images/color/canyon-1280.webp"
					srcSet="/images/color/canyon-1280.webp 1280w, /images/color/canyon-2000.webp 2000w"
					sizes="100vw"
					alt="Yasasvi standing in front of a wide desert canyon"
					width={2000}
					height={857}
					loading="lazy"
					decoding="async"
				/>
			</figure>

			<div className="about-home__grid">
				<div className="about-home__facts" data-reveal>
					<h2 id="about-title" className="section-title">About</h2>
					<figure className="about-home__photo" data-length={LENGTHS[length].id}>
						{LENGTHS.map((l, i) => (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								key={l.id}
								src={l.photo.src}
								srcSet={l.photo.srcSet}
								sizes="(max-width: 900px) 40vw, 26vw"
								alt={i === length ? l.photo.alt : ''}
								aria-hidden={i !== length || undefined}
								className={i === length ? 'is-shown' : ''}
								style={{ objectPosition: l.photo.position }}
								width={800}
								height={1000}
								loading="lazy"
								decoding="async"
							/>
						))}
					</figure>
					<ul className="about-home__list" role="list">
						<li>
							<span className="about-home__live" aria-hidden="true" />
							{tenure ? <>Now at Twisted X, {tenure} in</> : <>At Twisted X since December 2024</>}
						</li>
						<li>Based in Dallas, Texas</li>
						<li><a href={`mailto:${contactLinks.email}`} className="ds-link">{contactLinks.email}</a></li>
					</ul>
				</div>

				<div className="about-home__bio">
					<div className="about-home__control" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
						<p id="about-length-label" className="about-home__ask">How much time do you have?</p>
						<div
							ref={groupRef}
							className="about-home__lengths"
							role="radiogroup"
							aria-labelledby="about-length-label"
							onKeyDown={onKeyDown}
							style={{ '--n': LENGTHS.length, '--at': length } as React.CSSProperties}
						>
							<span className="about-home__thumb" aria-hidden="true" />
							{LENGTHS.map((l, i) => (
								<button
									key={l.id}
									type="button"
									role="radio"
									aria-checked={i === length}
									tabIndex={i === length ? 0 : -1}
									aria-controls="about-text"
									className="about-home__length"
									onClick={() => setLength(i)}
								>
									{l.label}
								</button>
							))}
						</div>
					</div>

					<div id="about-text" className="about-home__story" data-reveal style={{ '--i': 2 } as React.CSSProperties}>
						<p className="about-home__text">
							<strong>Yasasvi Nellore.</strong> I build AI agents and the full-stack software around them, in Dallas.
						</p>

						<div {...show(1)}>
							<div>
								<p className="about-home__text about-home__text--soft">
									I’ve spent four years building distributed web applications and cloud-native microservices in Java,
									Python and TypeScript, shipped on AWS with Docker, Kubernetes and Jenkins. Since December 2024 I’ve built
									LLM systems at Twisted X Global Brands with RAG, MCP, multi-agent orchestration and the OpenAI, Gemini
									and Claude APIs.
								</p>
							</div>
						</div>

						<div {...show(2)}>
							<div>
								<p className="about-home__text about-home__text--soft">
									Before that I was a Senior Associate in AI research at JPMorgan Chase, prototyping retrieval-augmented
									LLM tools and machine-learning pipelines on financial data. At Colombo AI I built the personalized feed
									and the recommendation pipeline behind it. I started at HCL Technologies in Hyderabad, on Java
									microservices and Spark and Kafka pipelines moving 500 GB a day.
								</p>
								<p className="about-home__text about-home__text--soft">
									I hold an M.S. in Computer Science from The University of Texas at Arlington, with a focus on
									intelligent systems, big data and cloud computing, and worked there as a graduate research assistant.
									I’m open to AI and full-stack engineering roles.
								</p>
							</div>
						</div>
					</div>

					<p className="about-home__more" data-reveal style={{ '--i': 3 } as React.CSSProperties}>
						<Link href="/about" className="ds-link">Full experience and education</Link>
					</p>
				</div>
			</div>
		</section>
	);
}
