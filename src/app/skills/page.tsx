'use client'

import { useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import './index.css'
import { skillsData } from "../resources/consts"

const categories = [
    { id: 'aiml', label: 'AI & ML' },
    { id: 'languages', label: 'Languages' },
    { id: 'backend', label: 'Backend' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'cloud', label: 'Cloud & DevOps' },
    { id: 'database', label: 'Data' },
    { id: 'tools', label: 'Tools & testing' },
];

const filters = [{ id: 'all', label: 'All' }, ...categories];

// Self-assessed levels shown as three tiers rather than false-precision percentages
const tier = (level: number) =>
    level >= 90 ? { label: 'Expert', filled: 3 } : level >= 80 ? { label: 'Advanced', filled: 2 } : { label: 'Working knowledge', filled: 1 };

export default function SkillsPage() {
    const [activeCategory, setActiveCategory] = useState('all');

    const visible = categories
        .filter((category) => activeCategory === 'all' || category.id === activeCategory)
        .map((category) => ({
            ...category,
            skills: skillsData
                .filter((skill) => skill.category === category.id)
                .sort((a, b) => b.level - a.level),
        }))
        .filter((group) => group.skills.length);

    return (
        <MotionConfig reducedMotion="user">
            <main className="skills">
                <header className="skills-intro" data-reveal>
                    <h1 className="ds-h1">Skills</h1>
                    <p className="ds-lede">
                        What I use to build agentic AI systems and the full-stack products around them, from four years of production work.
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
                                onClick={() => setActiveCategory(filter.id)}
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


                <div className="skills-groups">
                    {visible.map((group) => (
                        <motion.section
                            key={group.id}
                            layout="position"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="skills-group"
                            aria-labelledby={`skills-${group.id}`}
                        >
                            <h2 id={`skills-${group.id}`} className="skills-group__title" data-reveal>
                                {group.label}
                                <span className="skills-group__count">{group.skills.length}</span>
                            </h2>
                            <ul className="skills-list" role="list" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
                                {group.skills.map((skill) => {
                                    const t = tier(skill.level);
                                    return (
                                        <li key={skill.name} className="skill-row">
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
                        </motion.section>
                    ))}
                </div>
            </main>
        </MotionConfig>
    );
}
