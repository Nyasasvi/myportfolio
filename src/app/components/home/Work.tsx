'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Github } from 'lucide-react';
import { showcase } from '../../resources/showcase';

/**
 * Every project name in one running paragraph, each followed by a small frame of its picture.
 * Pointing at a name (or focusing or tapping it) brings that project into the showcase below.
 */
export function Work() {
	const [selected, setSelected] = useState(0);
	const [canHover, setCanHover] = useState(false);
	const project = showcase[selected];

	useEffect(() => {
		setCanHover(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
	}, []);

	return (
		<section id="work" className="work chapter-alt" data-chapter="alt" aria-labelledby="work-title">
			<div className="work__index" data-reveal>
				<h2 id="work-title" className="work__heading">Projects:</h2>{' '}
				<ul className="work__names" role="list">
					{showcase.map((p, i) => (
						<li key={p.name}>
							<a
								href="#work-show"
								className="work__name"
								aria-current={i === selected ? 'true' : undefined}
								aria-controls="work-show"
								onClick={(e) => {
									e.preventDefault();
									setSelected(i);
								}}
								onFocus={() => setSelected(i)}
								onMouseEnter={canHover ? () => setSelected(i) : undefined}
							>
								{p.name}
								<span className="work__thumb" aria-hidden="true">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img src={p.image.small} alt="" width={48} height={48} loading="lazy" decoding="async" />
								</span>
							</a>
							{i < showcase.length - 1 ? ', ' : ''}
						</li>
					))}
				</ul>
			</div>

			<article id="work-show" className="work__show" aria-live="polite" aria-labelledby="work-show-title">
				<figure className="work__picture" key={project.slug}>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={project.image.large}
						srcSet={`${project.image.small} 480w, ${project.image.large} 960w`}
						sizes="(max-width: 760px) 100vw, 56vw"
						alt={`Cover image for ${project.name}`}
						width={960}
						height={960}
						loading="lazy"
						decoding="async"
					/>
				</figure>
				<div className="work__detail" key={`${project.slug}-text`}>
					<h3 id="work-show-title" className="work__title">{project.name}</h3>
					<p className="work__why">{project.why}</p>
					<p className="work__stack">Built with {project.technologies.join(', ')}.</p>
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
			</article>

			<p className="work__foot">
				{showcase.length} side projects in applied AI, algorithms and full-stack web.{' '}
				<Link href="/projects" className="ds-link">Browse them all</Link>
			</p>
		</section>
	);
}
