'use client';

import dynamic from 'next/dynamic';
import { contactLinks } from '../../resources/navigation';

// The field loads after first paint; the name, sentence and action are in the HTML from the start
const SignalField = dynamic(() => import('../signal/SignalField'), { ssr: false });

export function Hero() {
	return (
		<section className="hero" data-chapter="hero" data-hide-fab aria-labelledby="hero-title">
			<div className="hero__field" aria-hidden="true">
				<SignalField variant="hero" maskSelector="[data-signal-mask]" className="hero__canvas" />
			</div>

			<div className="hero__intro" data-signal-mask>
				<p className="hero__lead">
					I’m Yasasvi Nellore, a software engineer in Dallas building agentic AI systems and the full-stack products around them.
				</p>
				<div className="hero__actions">
					<a href="#work" className="ds-btn ds-btn--primary">See my work</a>
					<a href={contactLinks.resume} target="_blank" rel="noopener noreferrer" className="hero__resume ds-link">
						Resume, PDF
					</a>
				</div>
			</div>

			<h1 id="hero-title" className="hero__name">
				<span className="hero__name-scale">
					<span className="hero__name-word">Yasasvi</span>
				</span>
			</h1>
		</section>
	);
}
