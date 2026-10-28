'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { EDGES, DIAGRAM, DIAGRAM_NARROW, HUBS, OUTPUTS, ROUTES, SOURCES, type Point } from '../signal/graph';

const SignalField = dynamic(() => import('../signal/SignalField'), { ssr: false });

// Label positions for the wide diagram and, under 600px, the narrow one the canvas switches to
const pos = (wide: Point, narrow: Point) =>
	({ '--x': `${wide.x * 100}%`, '--y': `${wide.y * 100}%`, '--xn': `${narrow.x * 100}%`, '--yn': `${narrow.y * 100}%` }) as React.CSSProperties;

/**
 * The live part of the page: pick a question and the diagram re-routes its light through the
 * system that answers it, while the steps beside it spell out the route.
 */
export function Systems() {
	const [active, setActive] = useState(0);
	const route = ROUTES[active];
	const litSources = new Set(EDGES.filter(([, hub]) => hub === route.hub).map(([src]) => src));
	const summary = `${SOURCES.filter((_, i) => litSources.has(i)).map((source) => source.label).join(', ')} feed the ${HUBS[route.hub].label.toLowerCase()}, which returns: ${OUTPUTS[route.hub].toLowerCase()}.`;

	return (
		<section className="systems" id="systems" data-chapter="base" aria-labelledby="systems-title">
			<div className="systems__stage">
				<figure className="systems__diagram" data-reveal>
					<SignalField variant="diagram" hub={route.hub} className="systems__canvas" />
					<div className="systems__labels" aria-hidden="true">
						{SOURCES.map((source, i) => (
							<span key={source.id} className={`sys-node sys-node--source${litSources.has(i) ? ' is-lit' : ''}`} style={pos(DIAGRAM.sources[i], DIAGRAM_NARROW.sources[i])}>
								{source.label}
							</span>
						))}
						{HUBS.map((hub, i) => (
							<span key={hub.id} className={`sys-node sys-node--hub${i === route.hub ? ' is-lit' : ''}`} style={pos(DIAGRAM.hubs[i], DIAGRAM_NARROW.hubs[i])}>
								<span className="sys-node__name">{hub.label}</span>
								<span className="sys-node__detail">{hub.detail}</span>
							</span>
						))}
						{OUTPUTS.map((output, i) => (
							<span key={output} className={`sys-node sys-node--output${i === route.hub ? ' is-lit' : ''}`} style={pos(DIAGRAM.outputs[i], DIAGRAM_NARROW.outputs[i])}>
								{output}
							</span>
						))}
					</div>
					<figcaption className="ds-visually-hidden">{summary}</figcaption>
				</figure>
			</div>

			<div className="systems__text">
				<h2 id="systems-title" className="section-title" data-reveal>Agents I built at Twisted X</h2>
				<p className="systems__intro" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
					Twisted X Global Brands is a footwear company in Texas. Since December 2024 I’ve built the AI systems its planners
					and merchandisers use, on top of ERP, supplier and logistics data. Pick a question to see the route it takes.
				</p>

				<div className="systems__questions" role="group" aria-label="Choose a question" data-reveal style={{ '--i': 2 } as React.CSSProperties}>
					{ROUTES.map((r, i) => (
						<button
							key={r.id}
							type="button"
							className="question"
							aria-pressed={i === active}
							aria-controls="route-steps"
							onClick={() => setActive(i)}
						>
							{r.question}
						</button>
					))}
				</div>

				<ol id="route-steps" className="systems__steps" key={route.id} aria-live="polite">
					{route.steps.map((step, i) => (
						<li key={step.verb} style={{ '--i': i } as React.CSSProperties}>
							<strong>{step.verb}</strong> {step.text}
						</li>
					))}
				</ol>
				<p className="systems__note">Routes are simplified; the tools named are the ones each system uses.</p>
			</div>
		</section>
	);
}
