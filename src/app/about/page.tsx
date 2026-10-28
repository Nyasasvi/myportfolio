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

// "Dec 2024 - Present" → "Dec 2024 – now"
const span = (timeframe: string) => timeframe.replace(/\s*-\s*/, ' – ').replace(/present/i, 'now')

type Photo = { src: string; srcSet: string; alt: string; width: number; height: number }
type Entry = { role: string; org: string; when: string; where: string; kind?: string; points: string[]; photo?: Photo }

const jobs: Entry[] = experience.map((job) => ({
    role: job.role.replace(' – ', ', '),
    org: job.company,
    when: span(job.timeframe),
    where: job.location,
    kind: job.type !== 'Full-Time' ? job.type : undefined,
    points: job.achievements,
}))

const photo = (name: string, sizes: [number, number], ratio: number, alt: string): Photo => ({
    src: `/images/mono/${name}-${sizes[1]}.webp`,
    srcSet: `/images/mono/${name}-${sizes[0]}.webp ${sizes[0]}w, /images/mono/${name}-${sizes[1]}.webp ${sizes[1]}w`,
    alt,
    width: sizes[1],
    height: Math.round(sizes[1] * ratio),
})

function EntryRow({ entry }: { entry: Entry }) {
    return (
        <li className="about-entry" data-reveal>
            <p className="about-entry__when">{entry.when}</p>
            <p className="about-entry__where">{entry.where}{entry.kind ? `, ${entry.kind.toLowerCase()}` : ''}</p>
            <h3 className="about-entry__role">{entry.role}</h3>
            <p className="about-entry__org">{entry.org}</p>
            {entry.points.length > 0 && (
                <ul className="about-entry__points">
                    {entry.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
            )}
            {entry.photo && (
                <figure className="about-entry__photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img {...entry.photo} sizes="(max-width: 860px) 60vw, 26vw" loading="lazy" decoding="async" />
                </figure>
            )}
        </li>
    )
}

export default function Page() {
    return (
        <main className="about">
            <header className="about-intro">
                <h1 className="ds-h1" data-reveal>About</h1>
                <figure className="about-intro__photo" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/mono/mountains-800.webp"
                        srcSet="/images/mono/mountains-480.webp 480w, /images/mono/mountains-800.webp 800w"
                        sizes="(max-width: 860px) 60vw, 30vw"
                        alt="Yasasvi in a winter jacket in front of misty mountains"
                        width={800}
                        height={1000}
                    />
                </figure>
                <div className="about-intro__text" data-reveal style={{ '--i': 2 } as React.CSSProperties}>
                    <p className="about-intro__summary">{aboutMe}</p>
                    <a href={contactLinks.resume} target="_blank" rel="noopener noreferrer" className="ds-btn ds-btn--primary">
                        <FileText aria-hidden="true" />
                        Open the resume
                    </a>
                </div>
            </header>

            <dl className="about-highlights">
                {highlights.map((item, i) => (
                    <div key={item.label} className="about-highlight" data-reveal style={{ '--i': i } as React.CSSProperties}>
                        <dt className="about-highlight__value">{item.value}</dt>
                        <dd className="about-highlight__label">{item.label}</dd>
                    </div>
                ))}
            </dl>

            <section className="about-section" aria-labelledby="experience-title">
                <h2 id="experience-title" className="about-section__title" data-reveal>Experience</h2>
                <ol className="about-entries" role="list">
                    {jobs.map((entry) => <EntryRow key={`${entry.org}-${entry.when}`} entry={entry} />)}
                </ol>
            </section>

            <figure className="about-band" data-reveal>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/images/mono/canyon-1280.webp"
                    srcSet="/images/mono/canyon-1280.webp 1280w, /images/mono/canyon-2000.webp 2000w"
                    sizes="100vw"
                    alt="Yasasvi standing in front of a wide desert canyon"
                    width={2000}
                    height={857}
                    loading="lazy"
                    decoding="async"
                />
            </figure>

            <section className="about-section" aria-labelledby="research-title">
                <h2 id="research-title" className="about-section__title" data-reveal>Research</h2>
                <ol className="about-entries" role="list">
                    <EntryRow
                        entry={{
                            role: researchExperience.title,
                            org: researchExperience.company,
                            when: span(researchExperience.timeframe),
                            where: researchExperience.location,
                            points: researchExperience.achievements,
                            photo: photo('portrait', [320, 640], 1, 'Portrait of Yasasvi beside a river'),
                        }}
                    />
                </ol>
            </section>

            <section className="about-section" aria-labelledby="education-title">
                <h2 id="education-title" className="about-section__title" data-reveal>Education</h2>
                <ol className="about-entries" role="list">
                    <EntryRow
                        entry={{
                            role: 'M.S. in Computer Science',
                            org: 'The University of Texas at Arlington',
                            when: 'Aug 2022 – May 2024',
                            where: 'Texas, USA',
                            points: ['Intelligent Systems, Big Data and Cloud Computing'],
                            photo: photo('graduation', [640, 960], 1.25, 'Yasasvi in cap and gown at his graduation'),
                        }}
                    />
                </ol>
            </section>
        </main>
    )
}
