'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Github } from 'lucide-react';
import { showcase, type ShowcaseProject } from '../../resources/showcase';

const CATEGORIES = [
	{ id: 'all', label: 'All' },
	{ id: 'ai', label: 'AI' },
	{ id: 'fullstack', label: 'Full-stack' },
	{ id: 'algorithm', label: 'Algorithms' },
] as const;

const categoryName: Record<string, string> = { ai: 'Applied AI', fullstack: 'Full-stack web', algorithm: 'Algorithms' };

type DemoStatus = 'checking' | 'up' | 'down';

/**
 * Checks each deployed demo from the visitor's browser, so "online" means online right now.
 * A no-cors request can't read the page, but it only resolves if the server answered.
 */
function useDemoStatus(projects: ShowcaseProject[]) {
	const [status, setStatus] = useState<Record<string, DemoStatus>>({});
	useEffect(() => {
		const withDemo = projects.filter((p) => p.liveDemo);
		setStatus(Object.fromEntries(withDemo.map((p) => [p.slug, 'checking'])));
		const controller = new AbortController();
		withDemo.forEach((p) => {
			const timeout = window.setTimeout(() => controller.abort(), 8000);
			fetch(p.liveDemo!, { mode: 'no-cors', cache: 'no-store', signal: controller.signal })
				.then(() => setStatus((s) => ({ ...s, [p.slug]: 'up' })))
				.catch(() => setStatus((s) => ({ ...s, [p.slug]: s[p.slug] === 'up' ? 'up' : 'down' })))
				.finally(() => window.clearTimeout(timeout));
		});
		return () => controller.abort();
	}, [projects]);
	return status;
}

function DemoLine({ status }: { status?: DemoStatus }) {
	if (!status || status === 'down') return null;
	return (
		<span className={`work-live work-live--${status}`}>
			<span className="work-live__dot" aria-hidden="true" />
			{status === 'up' ? 'Live demo online now' : 'Checking the live demo'}
		</span>
	);
}

function Detail({ project, status, inline = false }: { project: ShowcaseProject; status?: DemoStatus; inline?: boolean }) {
	return (
		<>
			<figure className="work__picture" key={`${project.slug}-picture`}>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={inline ? project.image.small : project.image.large}
					srcSet={`${project.image.small} 480w, ${project.image.large} 960w`}
					// Inline (tablet and phone) the picture shares its row with the text above 600px
					sizes={inline ? '(max-width: 600px) 92vw, 40vw' : '(max-width: 900px) 100vw, 40vw'}
					alt={`Cover image for ${project.name}`}
					width={960}
					height={960}
					loading="lazy"
					decoding="async"
					style={{ objectPosition: project.image.focus }}
				/>
			</figure>
			<div className="work__detail" key={`${project.slug}-text`}>
				{!inline && <h3 className="work__title">{project.name}</h3>}
				<p className="work__why">{project.why}</p>
				<p className="work__stack">Built with {project.technologies.join(', ')}.</p>
				<DemoLine status={status} />
				<div className="work__links">
					{project.liveDemo && (
						<a href={project.liveDemo} target="_blank" rel="noopener noreferrer" className="ds-btn ds-btn--primary">
							Open the live demo
							<ArrowUpRight aria-hidden="true" />
						</a>
					)}
					{project.repo && (
						<a href={project.repo} target="_blank" rel="noopener noreferrer" className="ds-btn">
							<Github aria-hidden="true" />
							Read the code
						</a>
					)}
				</div>
			</div>
		</>
	);
}

/**
 * The projects as an index in large type. Pointing at, focusing or tapping a name brings it into
 * the pinned panel beside the list (on a phone, the panel opens under the name instead).
 */
export function Work() {
	const [filter, setFilter] = useState<(typeof CATEGORIES)[number]['id']>('all');
	const [active, setActive] = useState(showcase[0].slug);
	const [canHover, setCanHover] = useState(false);
	const status = useDemoStatus(showcase);

	const visible = filter === 'all' ? showcase : showcase.filter((p) => p.category === filter);
	const project = visible.find((p) => p.slug === active) ?? visible[0];

	useEffect(() => {
		setCanHover(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
	}, []);

	// Keep the panel on a project that is still in the list after filtering
	useEffect(() => {
		if (!visible.some((p) => p.slug === active)) setActive(visible[0].slug);
	}, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<section id="work" className="work chapter-alt" data-chapter="alt" aria-labelledby="work-title">
			<div className="work__head" data-reveal>
				<h2 id="work-title" className="work__heading">Projects</h2>
				<div className="work__filters" role="group" aria-label="Show projects by kind">
					{CATEGORIES.map((c) => {
						const count = c.id === 'all' ? showcase.length : showcase.filter((p) => p.category === c.id).length;
						return (
							<button
								key={c.id}
								type="button"
								className="work__filter"
								aria-pressed={filter === c.id}
								onClick={() => setFilter(c.id)}
							>
								{c.label}
								<span className="work__filter-count">{count}</span>
							</button>
						);
					})}
				</div>
			</div>

			<ul className="work__list" role="list" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
				{visible.map((p) => {
					const isActive = p.slug === project.slug;
					return (
						<li key={p.slug} className={`work__row${isActive ? ' is-active' : ''}`}>
							<button
								type="button"
								className="work__name"
								aria-pressed={isActive}
								aria-controls="work-show"
								onClick={() => setActive(p.slug)}
								onFocus={() => setActive(p.slug)}
								onMouseEnter={canHover ? () => setActive(p.slug) : undefined}
							>
								<span className="work__name-text">{p.name}</span>
								<span className="work__meta">
									{categoryName[p.category] ?? p.category}
									{status[p.slug] === 'up' && (
										<>
											<span className="work-live__dot" aria-hidden="true" />
											<span className="ds-visually-hidden">, live demo online</span>
										</>
									)}
								</span>
							</button>
							{/* On a phone the project opens right under its name */}
							{isActive && (
								<div className="work__inline">
									<Detail project={p} status={status[p.slug]} inline />
								</div>
							)}
						</li>
					);
				})}
			</ul>

			<article id="work-show" className="work__show" aria-live="polite" aria-label={project.name}>
				<Detail project={project} status={status[project.slug]} />
			</article>

			<p className="work__foot">
				{showcase.length} side projects in applied AI, algorithms and full-stack web.{' '}
				<Link href="/projects" className="ds-link">Browse them all</Link>
			</p>
		</section>
	);
}
