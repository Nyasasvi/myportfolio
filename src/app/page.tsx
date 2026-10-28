"use client";

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Check, Copy, FileText, Github, Linkedin } from 'lucide-react';
import { experience } from './resources/consts';
import { toolsNav, contactLinks } from './resources/navigation';
import './homepage.css';

const profilePhotos = [
	{ src: '/images/profilePic.png', alt: 'Yasasvi at graduation' },
	{ src: '/images/IMG_4940.jpg', alt: 'Yasasvi, portrait' },
	{ src: '/images/IMG_7264.jpg', alt: 'Yasasvi, outdoors' },
	{ src: '/images/IMG_7613.jpg', alt: 'Yasasvi, candid' },
];

const platformMetrics = [
	{ value: '70%', label: 'less time spent on supply chain reporting' },
	{ value: '15%', label: 'better order fulfillment' },
	{ value: '40%', label: 'lower retrieval latency for MCP agents' },
];

const stack = [
	'Python', 'TypeScript', 'Java', 'LangChain', 'LangGraph', 'RAG', 'MCP',
	'React', 'Next.js', 'Spring Boot', 'Node.js', 'Snowflake', 'AWS', 'Docker', 'Kubernetes',
];

// Short year ranges for the compact timeline, derived from the about page data
const yearRange = (timeframe: string) => {
	const years = timeframe.match(/\d{4}/g) ?? [];
	const end = /present/i.test(timeframe) ? 'Now' : years[1];
	return years[0] === end ? years[0] : `${years[0]}–${end}`;
};

export default function Home() {
	const [photoIndex, setPhotoIndex] = useState(0);
	const [copied, setCopied] = useState(false);

	const copyEmail = async () => {
		try {
			await navigator.clipboard.writeText(contactLinks.email);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			window.location.href = `mailto:${contactLinks.email}`;
		}
	};

	return (
		<main className="home">
			<section className="home-hero" aria-labelledby="hero-title">
				<div className="home-hero__text">
					<p className="ds-status home-reveal" style={{ '--i': 0 } as React.CSSProperties}>
						Open to AI and full-stack engineering roles
					</p>
					<h1 id="hero-title" className="home-hero__name ds-display home-reveal" style={{ '--i': 1 } as React.CSSProperties}>
						Yasasvi<br />Nellore
					</h1>
					<p className="home-hero__lede home-reveal" style={{ '--i': 2 } as React.CSSProperties}>
						I&apos;m a software engineer who builds agentic AI systems and the full-stack products around them.
						Right now I&apos;m at Twisted X in Dallas, turning ERP, supplier and logistics data into an assistant planners actually use.
					</p>
					<div className="home-hero__actions home-reveal" style={{ '--i': 3 } as React.CSSProperties}>
						<Link href="/projects" className="ds-btn ds-btn--primary">View projects</Link>
						<a href={contactLinks.resume} target="_blank" rel="noopener noreferrer" className="ds-btn">
							<FileText aria-hidden="true" />
							Resume
						</a>
						<span className="home-hero__social">
							<a href={contactLinks.github} target="_blank" rel="noopener noreferrer" className="ds-icon-btn" aria-label="GitHub">
								<Github aria-hidden="true" />
							</a>
							<a href={contactLinks.linkedin} target="_blank" rel="noopener noreferrer" className="ds-icon-btn" aria-label="LinkedIn">
								<Linkedin aria-hidden="true" />
							</a>
						</span>
					</div>
				</div>

				<figure className="home-hero__photo home-reveal" style={{ '--i': 2 } as React.CSSProperties}>
					<div className="home-hero__frame">
						{profilePhotos.map((photo, index) => (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								key={photo.src}
								src={photo.src}
								alt={index === photoIndex ? photo.alt : ''}
								aria-hidden={index !== photoIndex}
								className={index === photoIndex ? 'is-active' : ''}
								loading={index === 0 ? 'eager' : 'lazy'}
								decoding="async"
							/>
						))}
					</div>
					<div className="home-hero__switcher" role="group" aria-label="Choose photo">
						{profilePhotos.map((photo, index) => (
							<button
								key={photo.src}
								type="button"
								aria-label={`Photo ${index + 1} of ${profilePhotos.length}`}
								aria-pressed={index === photoIndex}
								onClick={() => setPhotoIndex(index)}
							/>
						))}
					</div>
				</figure>
			</section>

			<section className="home-section" aria-labelledby="now-title">
				<div className="home-section__head">
					<h2 id="now-title" className="ds-h2">What I&apos;m working on</h2>
					<Link href="/about" className="home-link">Full experience</Link>
				</div>

				<div className="home-bento">
					<article className="ds-card home-bento__platform">
						<p className="ds-meta">Twisted X Global Brands, since Dec 2024</p>
						<h3 className="ds-h3">An agentic supply chain assistant</h3>
						<p className="ds-body-text">
							Built with LangChain, LangGraph and RAG over NetSuite ERP, supplier APIs and logistics data.
							It plans multi-step questions, calls tools, and is checked by an eval harness before changes ship.
						</p>
						<dl className="home-metrics">
							{platformMetrics.map((metric) => (
								<div key={metric.label} className="home-metric">
									<dt className="home-metric__value">{metric.value}</dt>
									<dd className="home-metric__label">{metric.label}</dd>
								</div>
							))}
						</dl>
					</article>

					<article className="ds-card home-bento__forecast" aria-labelledby="forecast-title">
						<h3 id="forecast-title" className="ds-h3">Sharper demand forecasts</h3>
						<p className="ds-body-text">
							Replaced rolling 12-month averages with a fine-tuned Google TimesFM model. Error (WAPE) across SKUs dropped by about half.
						</p>
						<div className="home-forecast" role="img" aria-label="Forecast error fell from 24 to 31 percent with rolling averages to 11 to 21 percent with TimesFM">
							<div className="home-forecast__row">
								<span className="home-forecast__name">Rolling average</span>
								<span className="home-forecast__track">
									<span className="home-forecast__range is-before" style={{ left: '48%', width: '14%' }} />
								</span>
								<span className="home-forecast__value">24–31%</span>
							</div>
							<div className="home-forecast__row">
								<span className="home-forecast__name">TimesFM</span>
								<span className="home-forecast__track">
									<span className="home-forecast__range is-after" style={{ left: '22%', width: '20%' }} />
								</span>
								<span className="home-forecast__value">11–21%</span>
							</div>
							<div className="home-forecast__axis" aria-hidden="true">
								<span>0%</span><span>25%</span><span>50%</span>
							</div>
						</div>
					</article>

					<article className="ds-card home-bento__timeline">
						<h3 className="ds-h3">Where I&apos;ve worked</h3>
						<ol className="home-timeline">
							{experience.map((job) => (
								<li key={job.company}>
									<span className="home-timeline__company">{job.company}</span>
									<span className="home-timeline__role">{job.role}</span>
									<span className="home-timeline__years">{yearRange(job.timeframe)}</span>
								</li>
							))}
						</ol>
					</article>

					<article className="ds-card home-bento__stack">
						<h3 className="ds-h3">Daily tools</h3>
						<ul className="home-stack" role="list">
							{stack.map((tool) => <li key={tool} className="ds-chip">{tool}</li>)}
						</ul>
						<Link href="/skills" className="home-link">All skills</Link>
					</article>
				</div>
			</section>

			<section className="home-section" aria-labelledby="tools-title">
				<div className="home-section__head">
					<h2 id="tools-title" className="ds-h2">Try something</h2>
					<p className="ds-body-text">Small tools I built into this site.</p>
				</div>
				<ul className="home-tools" role="list">
					{toolsNav.filter((tool) => tool.href !== '/analytics').map((tool) => (
						<li key={tool.href}>
							<Link href={tool.href} className="ds-card home-tool">
								<span className="home-tool__label">{tool.label}</span>
								<span className="home-tool__desc">{tool.description}</span>
								<ArrowUpRight className="home-tool__icon" aria-hidden="true" />
							</Link>
						</li>
					))}
				</ul>
			</section>

			<section className="home-contact" aria-labelledby="contact-title">
				<div>
					<h2 id="contact-title" className="ds-h2">Hiring for an AI or full-stack role?</h2>
					<p className="ds-body-text">I usually reply within a day.</p>
				</div>
				<div className="home-contact__actions">
					<Link href="/contact" className="ds-btn ds-btn--primary">Send a message</Link>
					<button type="button" className="ds-btn" onClick={copyEmail} aria-live="polite">
						{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
						{copied ? 'Email copied' : 'Copy email'}
					</button>
				</div>
			</section>
		</main>
	);
}
