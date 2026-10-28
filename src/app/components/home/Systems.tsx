'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { DIAGRAM, DIAGRAM_NARROW, TWISTED_X, hubOfEdgeStart, isHubEdge, type Point, type SystemGraph } from '../signal/graph';

import { SHOW_ROUTE_EVENT, type ShowRouteDetail } from './systemEvents';

const SignalField = dynamic(() => import('../signal/SignalField'), { ssr: false });

// Label positions for the wide diagram and, under 600px, the narrow one the canvas switches to
const pos = (wide: Point, narrow: Point) =>
	({ '--x': `${wide.x * 100}%`, '--y': `${wide.y * 100}%`, '--xn': `${narrow.x * 100}%`, '--yn': `${narrow.y * 100}%` }) as React.CSSProperties;

type Props = {
	graph?: SystemGraph;
	/** Put the diagram on the right, so consecutive companies alternate sides */
	flip?: boolean;
};

/**
 * The live part of the page: pick a question and the diagram re-routes its light through the
 * system that answers it, while the steps beside it spell out the route.
 */
export function Systems({ graph = TWISTED_X, flip = false }: Props) {
	const [active, setActive] = useState(0);
	const sectionRef = useRef<HTMLElement>(null);
	const { sources, hubs, outputs, edges, routes } = graph;

	// Other sections (the figures) can open this diagram on a specific question
	useEffect(() => {
		const onShow = (e: Event) => {
			const { graph: graphId, route: routeId } = (e as CustomEvent<ShowRouteDetail>).detail;
			if (graphId !== graph.id) return;
			const index = routes.findIndex((r) => r.id === routeId);
			if (index < 0) return;
			setActive(index);
			const section = sectionRef.current;
			if (!section) return;
			const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			section.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
			// Move focus to the chosen question so keyboard and screen reader users land in context
			section.querySelectorAll<HTMLButtonElement>('.question')[index]?.focus({ preventScroll: true });
		};
		window.addEventListener(SHOW_ROUTE_EVENT, onShow);
		return () => window.removeEventListener(SHOW_ROUTE_EVENT, onShow);
	}, [graph.id, routes]);
	const route = routes[active];
	const routeEdges = edges.filter(([, hub]) => hub === route.hub);
	const litSources = new Set(routeEdges.filter(([src]) => !isHubEdge(src)).map(([src]) => src));
	// Systems that feed the active one (for example the comparison API behind the monitoring agent)
	const feedingHubs = new Set(routeEdges.filter(([src]) => isHubEdge(src)).map(([src]) => hubOfEdgeStart(src)));
	const inputs = [
		...sources.filter((_, i) => litSources.has(i)).map((source) => source.label),
		...hubs.filter((_, i) => feedingHubs.has(i)).map((hub) => hub.label),
	];
	const summary = `${inputs.join(', ')} feed the ${hubs[route.hub].label.toLowerCase()}, which returns: ${outputs[route.hub].toLowerCase()}.`;
	// Twisted X keeps the original anchor so existing #systems links still land
	const sectionId = graph.id === TWISTED_X.id ? 'systems' : `systems-${graph.id}`;
	const titleId = `${sectionId}-title`;
	const stepsId = `${sectionId}-steps`;

	return (
		<section ref={sectionRef} className={`systems${flip ? ' systems--flip' : ''}`} id={sectionId} data-chapter="base" aria-labelledby={titleId}>
			<div className="systems__stage">
				<figure className="systems__diagram" data-reveal>
					<SignalField variant="diagram" hub={route.hub} edges={edges} className="systems__canvas" />
					<div className="systems__labels" aria-hidden="true">
						{sources.map((source, i) => (
							<span key={source.id} className={`sys-node sys-node--source${litSources.has(i) ? ' is-lit' : ''}`} style={pos(DIAGRAM.sources[i], DIAGRAM_NARROW.sources[i])}>
								{source.label}
							</span>
						))}
						{hubs.map((hub, i) => (
							<span key={hub.id} className={`sys-node sys-node--hub${i === route.hub || feedingHubs.has(i) ? ' is-lit' : ''}`} style={pos(DIAGRAM.hubs[i], DIAGRAM_NARROW.hubs[i])}>
								<span className="sys-node__name">{hub.label}</span>
								<span className="sys-node__detail">{hub.detail}</span>
							</span>
						))}
						{outputs.map((output, i) => (
							<span key={output} className={`sys-node sys-node--output${i === route.hub ? ' is-lit' : ''}`} style={pos(DIAGRAM.outputs[i], DIAGRAM_NARROW.outputs[i])}>
								{output}
							</span>
						))}
					</div>
					<figcaption className="ds-visually-hidden">{summary}</figcaption>
				</figure>
			</div>

			<div className="systems__text">
				<h2 id={titleId} className="section-title" data-reveal>{graph.title}</h2>
				<p className="systems__intro" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
					{graph.intro}
				</p>

				<div className="systems__questions" role="group" aria-label={`Choose a question about ${graph.company}`} data-reveal style={{ '--i': 2 } as React.CSSProperties}>
					{routes.map((r, i) => (
						<button
							key={r.id}
							type="button"
							className="question"
							aria-pressed={i === active}
							aria-controls={stepsId}
							onClick={() => setActive(i)}
						>
							{r.question}
						</button>
					))}
				</div>

				<ol id={stepsId} className="systems__steps" key={route.id} aria-live="polite">
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
