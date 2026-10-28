'use client'

import { useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { ArrowUpRight, Github } from 'lucide-react';
import './index.css';
import { showcase } from "../resources/showcase";

const categories = [
    { id: 'all', label: 'All', count: showcase.length },
    { id: 'featured', label: 'Featured', count: showcase.filter(p => p.featured).length },
    { id: 'ai', label: 'AI & ML', count: showcase.filter(p => p.category === 'ai').length },
    { id: 'fullstack', label: 'Full-stack', count: showcase.filter(p => p.category === 'fullstack').length },
    { id: 'algorithm', label: 'Algorithms', count: showcase.filter(p => p.category === 'algorithm').length },
];

export default function Page() {
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredProjects = activeCategory === 'all'
        ? showcase
        : activeCategory === 'featured'
            ? showcase.filter(p => p.featured)
            : showcase.filter(p => p.category === activeCategory);

    return (
        <MotionConfig reducedMotion="user">
            <main className="projects">
                <header className="projects-intro" data-reveal>
                    <h1 className="ds-h1">Projects</h1>
                    <p className="ds-lede">
                        Side projects and experiments, mostly in applied AI and full-stack web. Work at Twisted X, JPMorgan Chase and the rest is on the About page.
                    </p>
                </header>

                <div className="ds-segmented" role="group" aria-label="Filter projects" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
                    {categories.map((category) => {
                        const active = activeCategory === category.id;
                        return (
                            <button
                                key={category.id}
                                type="button"
                                className={`ds-segmented__btn${active ? ' is-active' : ''}`}
                                aria-pressed={active}
                                onClick={() => setActiveCategory(category.id)}
                            >
                                {active && (
                                    <motion.span
                                        layoutId="projects-filter-indicator"
                                        className="ds-segmented__indicator"
                                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                                    />
                                )}
                                <span className="ds-segmented__label">{category.label}</span>
                                <span className="ds-segmented__count">{category.count}</span>
                            </button>
                        );
                    })}
                </div>

                <p className="ds-visually-hidden" aria-live="polite">
                    Showing {filteredProjects.length} projects
                </p>

                <motion.ol layout className="projects-list" role="list">
                    {filteredProjects.map((project) => {
                        const primaryHref = project.liveDemo ?? project.repo ?? project.githubLink;
                        return (
                            <motion.li
                                key={project.name}
                                layout="position"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                                className="project-row"
                            >
                                <figure className="project-row__media" data-reveal>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={project.image.large}
                                        srcSet={`${project.image.small} 480w, ${project.image.large} 960w`}
                                        sizes="(max-width: 760px) 100vw, 34vw"
                                        alt={`Cover image for ${project.name}`}
                                        width={960}
                                        height={960}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </figure>
                                <div className="project-row__body" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
                                    <h2 className="project-row__title">
                                        <a href={primaryHref} target="_blank" rel="noopener noreferrer">{project.name}</a>
                                    </h2>
                                    <p className="project-row__why">{project.why}</p>
                                    <dl className="project-row__facts">
                                        <div>
                                            <dt>Highlights</dt>
                                            <dd>{project.features.join(', ')}</dd>
                                        </div>
                                        <div>
                                            <dt>Built with</dt>
                                            <dd>{project.technologies.join(', ')}</dd>
                                        </div>
                                    </dl>
                                    <div className="project-row__actions">
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
                            </motion.li>
                        );
                    })}
                </motion.ol>

                {filteredProjects.length === 0 && (
                    <div className="projects-empty">
                        <p>No projects in this category yet.</p>
                        <button type="button" className="ds-btn" onClick={() => setActiveCategory('all')}>Show all projects</button>
                    </div>
                )}
            </main>
        </MotionConfig>
    );
}
