'use client'

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Github } from 'lucide-react';
import './index.css';
import { useSlidingIndicator } from '../components/useSlidingIndicator';
import { showcase } from "../resources/showcase";
import type { ChapterField } from '@/app/components/field/ChapterField';

const categories = [
    { id: 'all', label: 'All', count: showcase.length },
    { id: 'featured', label: 'Featured', count: showcase.filter(p => p.featured).length },
    { id: 'ai', label: 'AI & ML', count: showcase.filter(p => p.category === 'ai').length },
    { id: 'fullstack', label: 'Full-stack', count: showcase.filter(p => p.category === 'fullstack').length },
    { id: 'algorithm', label: 'Algorithms', count: showcase.filter(p => p.category === 'algorithm').length },
];

const inCategory = (project: (typeof showcase)[number], category: string) =>
    category === 'all' || (category === 'featured' ? project.featured : project.category === category);

export default function Page() {
    const [activeCategory, setActiveCategory] = useState('all');
    const filterRef = useRef<HTMLDivElement>(null);
    useSlidingIndicator(filterRef, activeCategory);
    const [current, setCurrent] = useState<string | null>(null);
    const [ready, setReady] = useState(false);
    const chaptersRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fieldRef = useRef<ChapterField | null>(null);

    const filteredProjects = showcase.filter((p) => inCategory(p, activeCategory));
    const position = filteredProjects.findIndex((p) => p.slug === current);

    // Each project has a live scene of what it does behind it (./field), loaded in idle time
    useEffect(() => {
        const canvas = canvasRef.current;
        const host = chaptersRef.current;
        if (!canvas || !host) return;
        let field: ChapterField | null = null;
        let cancelled = false;
        const start = () => {
            import('./field').then(({ createField }) => {
                if (cancelled) return;
                try {
                    field = createField(canvas, Array.from(host.querySelectorAll<HTMLElement>('[data-scene]')), () => setReady(true));
                    fieldRef.current = field;
                } catch {
                    // No canvas: the projects read the same without their scenes
                }
            });
        };
        const hasIdle = typeof window.requestIdleCallback === 'function';
        const handle = hasIdle ? window.requestIdleCallback(start, { timeout: 1200 }) : globalThis.setTimeout(start, 200);
        return () => {
            cancelled = true;
            if (hasIdle) window.cancelIdleCallback(handle as number);
            else globalThis.clearTimeout(handle);
            field?.destroy();
            fieldRef.current = null;
        };
    }, []);

    // Which project holds the middle of the screen, named in the bar
    useEffect(() => {
        const host = chaptersRef.current;
        if (!host || !('IntersectionObserver' in window)) return;
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) if (entry.isIntersecting) setCurrent((entry.target as HTMLElement).dataset.scene ?? null);
            },
            { rootMargin: '-50% 0px -50% 0px' },
        );
        host.querySelectorAll('[data-scene]').forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    const choose = (id: string) => {
        setActiveCategory(id);
        // From deep in the list, bring the first chosen project to the top
        const host = chaptersRef.current;
        if (host && host.getBoundingClientRect().top < 0) {
            const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            requestAnimationFrame(() => host.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' }));
        }
    };

    const poke = (slug: string, e: React.PointerEvent, label: string) => fieldRef.current?.poke(slug, e.clientX, e.clientY, label);

    return (
        <>
            <main className="projects">
                <header className="projects-intro" data-reveal="now">
                    <h1 className="ds-h1">Projects</h1>
                    <p className="ds-lede">
                        Side projects and experiments, mostly in applied AI and full-stack web. Work at Twisted X, JPMorgan Chase and the rest is on the About page.
                    </p>
                    <p className="projects-intro__note">
                        Each project below runs a live model of what it does. Point at it, or at any of the tools it was built with.
                    </p>
                </header>

                <div className="projects-filter">
                    <div className="ds-segmented" role="group" aria-label="Filter projects" ref={filterRef}>
                        {categories.map((category) => {
                            const active = activeCategory === category.id;
                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={`ds-segmented__btn${active ? ' is-active' : ''}`}
                                    aria-pressed={active}
                                    onClick={() => choose(category.id)}
                                >
                                    {active && (
                                        <span className="ds-segmented__indicator" aria-hidden="true" />
                                    )}
                                    <span className="ds-segmented__label">{category.label}</span>
                                    <span className="ds-segmented__count">{category.count}</span>
                                </button>
                            );
                        })}
                    </div>
                    {position >= 0 && (
                        <p className="projects-filter__where">
                            {position + 1} of {filteredProjects.length}
                            <span>{filteredProjects[position].name}</span>
                        </p>
                    )}
                </div>

                <p className="ds-visually-hidden" aria-live="polite">
                    Showing {filteredProjects.length} projects
                </p>

                <div className="projects-chapters" ref={chaptersRef}>
                    <div className="projects-field" aria-hidden="true">
                        <canvas ref={canvasRef} data-ready={ready || undefined} />
                    </div>

                    {showcase.map((project, index) => {
                        const primaryHref = project.liveDemo ?? project.repo ?? project.githubLink;
                        const id = `project-${project.slug}`;
                        return (
                            <section
                                key={project.name}
                                className="project-chapter"
                                data-scene={project.slug}
                                hidden={!inCategory(project, activeCategory)}
                                aria-labelledby={id}
                                onPointerDown={(e) => poke(project.slug, e, '')}
                            >
                                <div className="project-chapter__body" data-reveal={index === 0 ? 'now' : ''}>
                                    <h2 id={id} className="project-chapter__title">
                                        <a href={primaryHref} target="_blank" rel="noopener noreferrer"><span>{project.name}</span></a>
                                    </h2>
                                    <p className="project-chapter__why"><span>{project.why}</span></p>
                                    <dl className="project-chapter__facts">
                                        <div>
                                            <dt><span>Highlights</span></dt>
                                            <dd><span>{project.features.join(', ')}</span></dd>
                                        </div>
                                        <div>
                                            <dt><span>Built with</span></dt>
                                            <dd>
                                                {project.technologies.map((tech, i) => (
                                                    <span key={tech}>
                                                        <span className="project-chapter__tech" onPointerEnter={(e) => poke(project.slug, e, tech)}>{tech}</span>
                                                        {i < project.technologies.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                            </dd>
                                        </div>
                                    </dl>
                                    <div className="project-chapter__actions">
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
                                    <figure className="project-chapter__media">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={project.image.large}
                                            srcSet={`${project.image.small} 480w, ${project.image.large} 960w`}
                                            sizes="(max-width: 900px) 100vw, 40vw"
                                            alt={`Cover image for ${project.name}`}
                                            width={960}
                                            height={960}
                                            loading="lazy"
                                            decoding="async"
                                            style={{ objectPosition: project.image.focus }}
                                        />
                                    </figure>
                                </div>
                            </section>
                        );
                    })}
                </div>

                {filteredProjects.length === 0 && (
                    <div className="projects-empty">
                        <p>No projects in this category yet.</p>
                        <button type="button" className="ds-btn" onClick={() => setActiveCategory('all')}>Show all projects</button>
                    </div>
                )}
            </main>
        </>
    );
}
