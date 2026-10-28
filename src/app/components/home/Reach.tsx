'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Copy } from 'lucide-react';
import { contactLinks } from '../../resources/navigation';

const CALENDLY = 'https://calendly.com/yasasvi-nellore/30min';

/** The contact facts set as display rows: each row is the thing itself, and a link to it */
export function Reach() {
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
		<section className="reach" data-chapter="base" data-hide-fab aria-labelledby="reach-title">
			<h2 id="reach-title" className="reach__row reach__title">Get in touch</h2>
			<ul className="reach__rows" role="list">
				<li className="reach__row reach__row--email">
					<a href={`mailto:${contactLinks.email}`} className="reach__link">{contactLinks.email}</a>
					<button type="button" className="reach__copy" onClick={copyEmail}>
						{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
						<span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
					</button>
				</li>
				<li className="reach__row">
					<a href={contactLinks.linkedin} target="_blank" rel="noopener noreferrer" className="reach__link">
						LinkedIn <ArrowUpRight className="reach__arrow" aria-hidden="true" />
					</a>
				</li>
				<li className="reach__row">
					<a href={contactLinks.github} target="_blank" rel="noopener noreferrer" className="reach__link">
						GitHub <ArrowUpRight className="reach__arrow" aria-hidden="true" />
					</a>
				</li>
				<li className="reach__row">
					<a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="reach__link">
						Book a call <ArrowUpRight className="reach__arrow" aria-hidden="true" />
					</a>
				</li>
				<li className="reach__row reach__row--send">
					<Link href="/contact" className="reach__link reach__send">
						Send a message
						<span className="reach__go" aria-hidden="true"><ArrowRight /></span>
					</Link>
				</li>
			</ul>
		</section>
	);
}
