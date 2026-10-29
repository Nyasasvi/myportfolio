'use client'

import { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import './index.css'
import { skillsData } from "../resources/consts"
import type { ChapterField } from '@/app/components/field/ChapterField';

// Each area has a live scene of that kind of work behind it (./field); the line under its title says what the scene shows
const categories = [
    { id: 'aiml', label: 'AI & ML', scene: 'A small network passing signals forward, layer by layer, to its outputs.' },
    { id: 'languages', label: 'Languages', scene: 'One function, a rolling average of sales, rewritten in each language.' },
    { id: 'backend', label: 'Backend', scene: 'Requests travelling through a gateway and two tiers of services to a store, and back.' },
    { id: 'frontend', label: 'Frontend', scene: 'A layout on a twelve-column grid, reflowing as it would across screen sizes.' },
    { id: 'cloud', label: 'Cloud & DevOps', scene: 'A pipeline shipping each new version to containers across a row of nodes.' },
    { id: 'database', label: 'Data', scene: 'A table queried, scanned and sorted, one column at a time.' },
    { id: 'tools', label: 'Tools & testing', scene: 'A git history: branches open, run their checks and merge back.' },
];

const filters = [{ id: 'all', label: 'All' }, ...categories];

// Self-assessed levels shown as three tiers rather than false-precision percentages
const tier = (level: number) =>
    level >= 90 ? { label: 'Expert', filled: 3 } : level >= 80 ? { label: 'Advanced', filled: 2 } : { label: 'Working knowledge', filled: 1 };

const groups = categories.map((category) => ({
    ...category,
    skills: skillsData.filter((skill) => skill.category === category.id).sort((a, b) => b.level - a.level),
}));

export default function SkillsPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [current, setCurrent] = useState<string | null>(null);
    const [ready, setReady] = useState(false);
    const chaptersRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fieldRef = useRef<ChapterField | null>(null);

    // The field is loaded in idle time, so it never competes with the first paint; it fades in when drawn
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
                    // No canvas: the chapters read the same without their scenes
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

    // Which chapter holds the middle of the screen, shown on the filter while every area is listed
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
        // From deep in the list, bring the chosen area to the top rather than leaving the reader mid-page
        const host = chaptersRef.current;
        if (host && host.getBoundingClientRect().top < 0) {
            const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            requestAnimationFrame(() => host.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' }));
        }
    };

    return (
        <MotionConfig reducedMotion="user">
            <main className="skills">
                <header className="skills-intro" data-reveal>
                    <h1 className="ds-h1">Skills</h1>
                    <p className="ds-lede">
                        What I use to build agentic AI systems and the full-stack products around them, from four years of production work.
                    </p>
                    <p className="skills-intro__note">
                        Each area below runs a live scene of that kind of work. Point at a skill and its scene answers.
                    </p>
                    <div className="skills-legend" aria-hidden="true">
                        {[3, 2, 1].map((filled) => (
                            <span key={filled} className="skills-legend__item">
                                <span className="skill-meter" data-filled={filled}><i /><i /><i /></span>
                                {tier(filled === 3 ? 95 : filled === 2 ? 85 : 70).label}
                            </span>
                        ))}
                    </div>
                </header>

                <div className="skills-filter">
                    <div className="ds-segmented" role="group" aria-label="Filter skills by area">
                        {filters.map((filter) => {
                            const active = activeCategory === filter.id;
                            const count = filter.id === 'all' ? skillsData.length : skillsData.filter((s) => s.category === filter.id).length;
                            return (
                                <button
                                    key={filter.id}
                                    type="button"
                                    className={`ds-segmented__btn${active ? ' is-active' : ''}`}
                                    aria-pressed={active}
                                    data-current={(activeCategory === 'all' && current === filter.id) || undefined}
                                    onClick={() => choose(filter.id)}
                                >
                                    {active && (
                                        <motion.span
                                            layoutId="skills-filter-indicator"
                                            className="ds-segmented__indicator"
                                            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                                        />
                                    )}
                                    <span className="ds-segmented__label">{filter.label}</span>
                                    <span className="ds-segmented__count">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="skills-chapters" ref={chaptersRef}>
                    <div className="skills-field" aria-hidden="true">
                        <canvas ref={canvasRef} data-ready={ready || undefined} />
                    </div>

                    {groups.map((group) => (
                        <section
                            key={group.id}
                            className="skills-chapter"
                            data-scene={group.id}
                            hidden={activeCategory !== 'all' && activeCategory !== group.id}
                            aria-labelledby={`skills-${group.id}`}
                        >
                            <div className="skills-chapter__head" data-reveal>
                                <h2 id={`skills-${group.id}`} className="skills-chapter__title">
                                    <span>{group.label}</span>
                                </h2>
                                <p className="skills-chapter__count"><span>{group.skills.length} skills</span></p>
                                <p className="skills-chapter__scene"><span>{group.scene}</span></p>
                            </div>
                            <ul className="skills-list" role="list" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
                                {group.skills.map((skill) => {
                                    const t = tier(skill.level);
                                    return (
                                        <li
                                            key={skill.name}
                                            className="skill-row"
                                            onPointerEnter={(e) => fieldRef.current?.poke(group.id, e.clientX, e.clientY, skill.name)}
                                        >
                                            <span className="skill-row__text">
                                                <span className="skill-row__name">{skill.name}</span>{' '}
                                                <span className="skill-row__tags">{skill.tags.join(', ')}</span>
                                            </span>
                                            <span className="skill-row__years">{skill.experience}</span>
                                            <span className="skill-meter" data-filled={t.filled} role="img" aria-label={t.label} title={t.label}>
                                                <i /><i /><i />
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ))}
                </div>
            </main>
        </MotionConfig>
    );
}
