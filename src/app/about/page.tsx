'use client'

import { FileText } from 'lucide-react'
import './index.css'
import { experience, researchExperience, aboutMe } from "../resources/consts"
import { contactLinks } from "../resources/navigation"

const highlights = [
    { value: '4+', label: 'years building production software' },
    { value: '4', label: 'companies, from startup to JPMorgan Chase' },
    { value: '70%', label: 'faster reporting from an AI assistant I built' },
    { value: '500 GB', label: 'of data processed per day in pipelines I built' },
]

export default function Page() {
    return (
        <main className="about">
            <header className="about-intro">
                <h1 className="ds-h1">About</h1>
                <p className="about-intro__summary">{aboutMe}</p>
                <div className="about-intro__actions">
                    <a href={contactLinks.resume} target="_blank" rel="noopener noreferrer" className="ds-btn">
                        <FileText aria-hidden="true" />
                        Open resume
                    </a>
                </div>
            </header>

            <dl className="about-highlights">
                {highlights.map((item) => (
                    <div key={item.label} className="about-highlight">
                        <dt className="about-highlight__value">{item.value}</dt>
                        <dd className="about-highlight__label">{item.label}</dd>
                    </div>
                ))}
            </dl>

            <section className="about-section" aria-labelledby="experience-title">
                <h2 id="experience-title" className="ds-h2">Experience</h2>
                <ol className="about-timeline">
                    {experience.map((job) => (
                        <li key={`${job.company}-${job.timeframe}`} className="about-job" style={{ '--job-color': job.color } as React.CSSProperties}>
                            <div className="about-job__meta">
                                <p className="about-job__dates">{job.timeframe}</p>
                                <p className="about-job__location">{job.location}</p>
                                {job.type !== 'Full-Time' && <span className="ds-chip">{job.type}</span>}
                            </div>
                            <div className="about-job__body">
                                <h3 className="ds-h3">{job.role}</h3>
                                <p className="about-job__company">{job.company}</p>
                                <ul className="about-job__points">
                                    {job.achievements.map((point) => <li key={point}>{point}</li>)}
                                </ul>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="about-section" aria-labelledby="research-title">
                <h2 id="research-title" className="ds-h2">Research</h2>
                <article className="ds-card about-research">
                    <div className="about-research__head">
                        <div>
                            <h3 className="ds-h3">{researchExperience.title}</h3>
                            <p className="about-job__company">{researchExperience.company}</p>
                        </div>
                        <p className="about-job__dates">{researchExperience.timeframe}</p>
                    </div>
                    <ul className="about-job__points">
                        {researchExperience.achievements.map((point) => <li key={point}>{point}</li>)}
                    </ul>
                </article>
            </section>

            <section className="about-section" aria-labelledby="education-title">
                <h2 id="education-title" className="ds-h2">Education</h2>
                <article className="ds-card about-research">
                    <div className="about-research__head">
                        <div>
                            <h3 className="ds-h3">M.S. in Computer Science</h3>
                            <p className="about-job__company">The University of Texas at Arlington</p>
                            <p className="ds-meta">Intelligent Systems, Big Data and Cloud Computing</p>
                        </div>
                        <p className="about-job__dates">Aug 2022 - May 2024</p>
                    </div>
                </article>
            </section>
        </main>
    )
}
