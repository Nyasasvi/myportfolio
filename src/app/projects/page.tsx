'use client'

import { useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { ArrowUpRight, Github } from 'lucide-react';
import './index.css';
import { projects } from "../resources/consts";

const categories = [
    { id: 'all', label: 'All', count: projects.length },
    { id: 'featured', label: 'Featured', count: projects.filter(p => p.featured).length },
    { id: 'ai', label: 'AI & ML', count: projects.filter(p => p.category === 'ai').length },
    { id: 'fullstack', label: 'Full-stack', count: projects.filter(p => p.category === 'fullstack').length },
    { id: 'algorithm', label: 'Algorithms', count: projects.filter(p => p.category === 'algorithm').length },
];

const isRepo = (url?: string) => !!url && url.includes('github.com');

export default function Page() {
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredProjects = activeCategory === 'all'
        ? projects
        : activeCategory === 'featured'
            ? projects.filter(p => p.featured)
            : projects.filter(p => p.category === activeCategory);

    return (
        <MotionConfig reducedMotion="user">
            <main className="projects">
                <header className="projects-intro">
                    <h1 className="ds-h1">Projects</h1>
                    <p className="ds-lede">
                        Side projects and experiments, mostly in applied AI and full-stack web. Work projects are on the About page.
                    </p>
                </header>

                <div className="ds-segmented" role="group" aria-label="Filter projects">
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

                <motion.ul layout className="projects-grid" role="list">
                    {filteredProjects.map((project) => {
                        const demo = project.liveDemo;
                        const repo = isRepo(project.githubLink) ? project.githubLink : undefined;
                        const primaryHref = demo ?? repo ?? project.githubLink;
                        return (
                            <motion.li
                                key={project.name}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="ds-card project-card"
                            >
                                <div className="project-card__media">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={project.imageUrl} alt="" loading="lazy" decoding="async" />
                                </div>
                                <div className="project-card__body">
                                    <div className="project-card__head">
                                        <h2 className="ds-h3">
                                            <a href={primaryHref} target="_blank" rel="noopener noreferrer" className="project-card__title">
                                                {project.name}
                                            </a>
                                        </h2>
                                        {project.featured && <span className="ds-chip project-card__featured">Featured</span>}
                                    </div>
                                    <p className="project-card__desc">{project.description}</p>
                                    <ul className="project-card__tech" role="list" aria-label="Technologies">
                                        {project.technologies.map((tech) => (
                                            <li key={tech} className="ds-chip">{tech}</li>
                                        ))}
                                    </ul>
                                    <div className="project-card__actions">
                                        {demo && (
                                            <a href={demo} target="_blank" rel="noopener noreferrer" className="ds-btn ds-btn--primary">
                                                Live demo
                                                <ArrowUpRight aria-hidden="true" />
                                            </a>
                                        )}
                                        {repo && (
                                            <a href={repo} target="_blank" rel="noopener noreferrer" className="ds-btn">
                                                <Github aria-hidden="true" />
                                                Code
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.li>
                        );
                    })}
                </motion.ul>

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
