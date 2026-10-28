'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Copy } from 'lucide-react';
import { contactLinks } from '../../resources/navigation';

const CALENDLY = 'https://calendly.com/yasasvi-nellore/30min';
const TIME_ZONE = 'America/Chicago';

// Local time in Dallas, refreshed every 30 seconds, so a visitor can tell whether now is a good time to call
function useDallasTime() {
	const [time, setTime] = useState<string | null>(null);
	useEffect(() => {
		const format = () =>
			setTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TIME_ZONE }));
		format();
		const id = window.setInterval(format, 30_000);
		return () => window.clearInterval(id);
	}, []);
	return time;
}

const channels = [
	{ label: 'LinkedIn', value: 'in/yasasvi-nellore', href: contactLinks.linkedin },
	{ label: 'GitHub', value: 'github.com/Nyasasvi', href: contactLinks.github },
	{ label: 'Book a call', value: '30 minutes, on Calendly', href: CALENDLY },
];

/** A compact contact band: the invitation and one action on the left, every channel as a row on the right */
export function Reach() {
	const [copied, setCopied] = useState(false);
	const time = useDallasTime();

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
		<section className="reach" data-chapter="base" data-hide-fab aria-labelledby="reach-title">
			<div className="reach__intro" data-reveal>
				<h2 id="reach-title" className="reach__title">Get in touch</h2>
				<p className="reach__lede">
					Hiring for an AI or full-stack role, or want to talk about something I built? I usually reply within a day.
				</p>
				<p className="reach__clock">
					<span className="reach__pulse" aria-hidden="true" />
					{time ? <>It&apos;s {time} in Dallas</> : 'Based in Dallas, Texas'}
				</p>
				<Link href="/contact" className="reach__send">
					Send a message
					<span className="reach__go" aria-hidden="true"><ArrowRight /></span>
				</Link>
			</div>

			<ul className="reach__list" role="list" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
				<li className="reach__row">
					<a href={`mailto:${contactLinks.email}`} className="reach__link">
						<span className="reach__label">Email</span>
						<span className="reach__value">{contactLinks.email}</span>
					</a>
					<button
						type="button"
						className={`reach__copy${copied ? ' is-done' : ''}`}
						onClick={copyEmail}
						aria-label={copied ? 'Email address copied' : 'Copy email address'}
					>
						{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
						<span aria-hidden="true">{copied ? 'Copied' : 'Copy'}</span>
					</button>
				</li>
				{channels.map(({ label, value, href }) => (
					<li key={label} className="reach__row">
						<a href={href} target="_blank" rel="noopener noreferrer" className="reach__link">
							<span className="reach__label">{label}</span>
							<span className="reach__value">{value}</span>
						</a>
						<ArrowUpRight className="reach__arrow" aria-hidden="true" />
					</li>
				))}
			</ul>
		</section>
	);
}
