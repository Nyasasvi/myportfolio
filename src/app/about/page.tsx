'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, FileText, Heart, Pause, Play } from 'lucide-react'
import './index.css'
import { experience, researchExperience, aboutMe } from '../resources/consts'
import { contactLinks } from '../resources/navigation'
import { ABOUT_TAP_EVENT } from './BackgroundStage'
import type { SceneId } from './scenes'

const BackgroundStage = dynamic(() => import('./BackgroundStage'), { ssr: false })

/*
 * The About page as five chapters, newest first. Scrolling into a chapter hands the background
 * over to a scene from that employer's world (see scenes.ts). Every role, date, figure and point
 * comes from resources/consts.ts and the resume.
 */

const highlights = [
    { value: '4+', label: 'years building production software' },
    { value: '4', label: 'companies, from a startup to JPMorgan Chase' },
    { value: '70%', label: 'faster reporting from an AI assistant I built' },
    { value: '500 GB', label: 'of data a day through pipelines I built' },
]

const job = (company: string) => experience.find((e) => e.company === company)!
const span = (timeframe: string) => timeframe.replace(/\s*-\s*/, ' to ').replace(/present/i, 'now')

type Figure = { value: string; label: string }
type Chapter = {
    id: string
    scene: SceneId
    title: string
    short: string
    roles: { role: string; org: string; when: string; where: string; kind?: string; points: string[] }[]
    figures: Figure[]
    /** What the background shows, said plainly */
    scene_caption: string
    photo?: { src: string; srcSet: string; alt: string; width: number; height: number }
}

const fromJob = (company: string) => {
    const j = job(company)
    return {
        role: j.role,
        org: j.company,
        when: span(j.timeframe),
        where: j.location.replace(', USA', ''),
        kind: j.type !== 'Full-Time' ? j.type.toLowerCase() : undefined,
        points: j.achievements,
    }
}

const chapters: Chapter[] = [
    {
        id: 'twisted-x',
        scene: 'boots',
        title: 'Twisted X',
        short: 'Twisted X',
        roles: [fromJob('Twisted X Global Brands')],
        figures: [
            { value: '70%', label: 'less time on supply-chain reporting' },
            { value: '15%', label: 'better order fulfillment' },
            { value: '11–21%', label: 'forecast error, down from 24–31%' },
            { value: '40%', label: 'lower retrieval latency for MCP agents' },
        ],
        scene_caption: 'Behind this chapter: boot prints and shipments, for a footwear company’s supply chain. The walker follows your pointer.',
    },
    {
        id: 'jpmorgan',
        scene: 'market',
        title: 'JPMorgan Chase',
        short: 'JPMorgan',
        roles: [fromJob('JPMorgan Chase')],
        figures: [
            { value: '15%', label: 'more relevant LLM answers than the baseline' },
            { value: '12%', label: 'better than baseline on target tasks' },
            { value: '35%', label: 'less data prep time' },
            { value: '30%', label: 'faster new-experiment setup' },
        ],
        scene_caption: 'Behind this chapter: a live candlestick tape, for AI research in markets. Point at a candle to light it.',
    },
    {
        id: 'colombo-ai',
        scene: 'feed',
        title: 'Colombo AI',
        short: 'Colombo AI',
        roles: [fromJob('Colombo AI')],
        figures: [
            { value: '30%', label: 'more engagement from the personalized feed' },
            { value: '20%', label: 'more content created with Magic Pen' },
            { value: '40%', label: 'faster API responses' },
        ],
        scene_caption: 'Behind this chapter: likes and comments rising, for a social feed. Click or tap the background to add yours.',
    },
    {
        id: 'ut-arlington',
        scene: 'network',
        title: 'UT Arlington',
        short: 'UT Arlington',
        roles: [
            {
                role: 'M.S. in Computer Science',
                org: 'The University of Texas at Arlington',
                when: 'Aug 2022 to May 2024',
                where: 'Texas',
                points: ['Specialization in intelligent systems, big data and cloud computing.'],
            },
            {
                role: researchExperience.role,
                org: researchExperience.company,
                when: span(researchExperience.timeframe),
                where: 'Texas',
                points: researchExperience.achievements,
            },
        ],
        figures: [],
        scene_caption: 'Behind this chapter: a neural network firing, for a degree in intelligent systems. Move your pointer near a neuron to fire it.',
        photo: {
            src: '/images/color/graduation-960.webp',
            srcSet: '/images/color/graduation-640.webp 640w, /images/color/graduation-960.webp 960w',
            alt: 'Yasasvi in cap and gown at his graduation',
            width: 960,
            height: 1200,
        },
    },
    {
        id: 'hcl',
        scene: 'stream',
        title: 'HCL Technologies',
        short: 'HCL',
        roles: [fromJob('HCL Technologies')],
        figures: [
            { value: '500 GB', label: 'of data a day through Spark and Kafka' },
            { value: '300ms', label: 'faster APIs, saving $12,000 a year' },
            { value: '1.8s', label: 'page loads, down from 3s' },
            { value: '320', label: 'fewer EC2 hours a year after moving to Lambda' },
        ],
        scene_caption: 'Behind this chapter: data streaming through a processing column, for pipelines that moved 500 GB a day. The lane nearest your pointer runs faster.',
    },
]

// Twisted X start, from experience[0].timeframe
const TWISTED_X_START = new Date(2024, 11, 1)

function tenureText(now: Date) {
    const months = (now.getFullYear() - TWISTED_X_START.getFullYear()) * 12 + (now.getMonth() - TWISTED_X_START.getMonth())
    const y = Math.floor(months / 12)
    const r = months % 12
    const part = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`
    if (y && r) return `${part(y, 'year')}, ${part(r, 'month')}`
    return y ? part(y, 'year') : part(Math.max(r, 1), 'month')
}

/** Twisted X: how long so far, on the visitor's own clock */
function TwistedXLive() {
    const [text, setText] = useState<string | null>(null)
    useEffect(() => setText(tenureText(new Date())), [])
    return (
        <p className="chapter__live">
            <span className="chapter__pulse" aria-hidden="true" />
            {text ? <>{text} in, and still building.</> : <>Since December 2024, and still building.</>}
        </p>
    )
}

// 500 GB a day, in bytes per second (decimal units, as storage is sold)
const HCL_RATE = 500e9 / 86400

function formatBytes(b: number) {
    if (b >= 1e9) return `${(b / 1e9).toFixed(2)} GB`
    return `${Math.round(b / 1e6).toLocaleString()} MB`
}

/** HCL: what 500 GB a day adds up to while the visitor reads */
function HclLive() {
    const opened = useRef<number | null>(null)
    const [bytes, setBytes] = useState(0)
    useEffect(() => {
        opened.current = performance.now()
        const id = window.setInterval(() => {
            setBytes(((performance.now() - (opened.current ?? 0)) / 1000) * HCL_RATE)
        }, 250)
        return () => window.clearInterval(id)
    }, [])
    return (
        <p className="chapter__live">
            <span className="chapter__pulse" aria-hidden="true" />
            <span>
                At 500 GB a day, that pipeline moves about 5.8 MB a second. Since you opened this page, that’s{' '}
                <strong className="chapter__count">{formatBytes(bytes)}</strong>.
            </span>
        </p>
    )
}

/** Colombo AI: send likes into the feed behind the chapter */
function ColomboLive() {
    const [likes, setLikes] = useState(0)
    return (
        <div className="chapter__live chapter__live--action">
            <button
                type="button"
                className="chapter__like"
                onClick={() => {
                    setLikes((n) => n + 1)
                    window.dispatchEvent(new Event(ABOUT_TAP_EVENT))
                }}
            >
                <Heart aria-hidden="true" />
                Send a like
            </button>
            <span aria-live="polite">{likes > 0 ? `${likes} ${likes === 1 ? 'like' : 'likes'} from you so far.` : ''}</span>
        </div>
    )
}

const LIVE: Record<string, () => JSX.Element> = {
    'twisted-x': TwistedXLive,
    'colombo-ai': ColomboLive,
    hcl: HclLive,
}

export default function Page() {
    const [active, setActive] = useState<string | null>(null)
    const [paused, setPaused] = useState(false)
    const barRef = useRef<HTMLElement>(null)

    // The chapter under the middle of the screen owns the background; how far through it the
    // reader is goes straight to a CSS variable on the bar, so scrolling never re-renders the page
    useEffect(() => {
        const els = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter-id]'))
        const update = () => {
            const mid = window.innerHeight / 2
            let found: string | null = null
            let progress = 0
            for (const el of els) {
                const r = el.getBoundingClientRect()
                if (r.top <= mid && r.bottom > mid) {
                    found = el.dataset.chapterId ?? null
                    progress = (mid - r.top) / r.height
                    break
                }
            }
            setActive(found)
            barRef.current?.style.setProperty('--p', progress.toFixed(3))
        }
        // Scroll events already arrive at most once a frame, and the work is five rectangle reads
        update()
        window.addEventListener('scroll', update, { passive: true })
        window.addEventListener('resize', update)
        return () => {
            window.removeEventListener('scroll', update)
            window.removeEventListener('resize', update)
        }
    }, [])

    const scene = chapters.find((c) => c.id === active)?.scene ?? null

    return (
        <main className="about">
            <BackgroundStage scene={scene} paused={paused} />

            <header className="about-intro">
                <h1 className="about-intro__title" data-reveal="now">About</h1>
                <figure className="about-intro__photo" data-reveal="now" style={{ '--i': 1 } as React.CSSProperties}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/color/mountains-800.webp"
                        srcSet="/images/color/mountains-480.webp 480w, /images/color/mountains-800.webp 800w"
                        sizes="(max-width: 860px) 60vw, 30vw"
                        alt="Yasasvi in a winter jacket in front of misty mountains"
                        width={800}
                        height={1000}
                    />
                </figure>
                <div className="about-intro__text" data-reveal="now" style={{ '--i': 2 } as React.CSSProperties}>
                    <p className="about-intro__summary">{aboutMe}</p>
                    <p className="about-intro__hint">
                        Scroll on: each chapter below brings its own company to life in the background.
                    </p>
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

            <div className="about-chapters" data-active={active ?? undefined}>
                <nav className="chapter-bar" aria-label="Chapters" ref={barRef}>
                    <ul className="chapter-bar__list" role="list">
                        {chapters.map((c) => {
                            const on = c.id === active
                            return (
                                <li key={c.id}>
                                    <a
                                        href={`#${c.id}`}
                                        className={`chapter-bar__link${on ? ' is-on' : ''}`}
                                        aria-current={on ? 'true' : undefined}
                                    >
                                        {c.short}
                                    </a>
                                </li>
                            )
                        })}
                    </ul>
                    <button
                        type="button"
                        className="chapter-bar__pause"
                        onClick={() => setPaused((p) => !p)}
                        aria-pressed={paused}
                    >
                        {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
                        <span className="chapter-bar__pause-label">{paused ? 'Play background' : 'Pause background'}</span>
                    </button>
                </nav>

                {chapters.map((c) => {
                    const Live = LIVE[c.id]
                    return (
                        <section
                            key={c.id}
                            id={c.id}
                            data-chapter-id={c.id}
                            className={`chapter${c.id === active ? ' is-active' : ''}`}
                            aria-labelledby={`${c.id}-title`}
                        >
                            <div className="chapter__body">
                                <h2 id={`${c.id}-title`} className="chapter__title" data-reveal>{c.title}</h2>

                                {c.roles.map((r, i) => (
                                    <div key={r.role} className="chapter__role" data-reveal style={{ '--i': i + 1 } as React.CSSProperties}>
                                        <p className="chapter__role-name">{r.role}</p>
                                        <p className="chapter__role-meta">
                                            {r.org}, {r.where}. {r.when.charAt(0).toUpperCase() + r.when.slice(1)}{r.kind ? `, ${r.kind}` : ''}.
                                        </p>
                                        {i === 0 && Live && <Live />}
                                        {c.figures.length > 0 && i === 0 && (
                                            <dl className="chapter__figures">
                                                {c.figures.map((f) => (
                                                    <div key={f.label} className="chapter__figure">
                                                        <dt>{f.value}</dt>
                                                        <dd>{f.label}</dd>
                                                    </div>
                                                ))}
                                            </dl>
                                        )}
                                        <ul className="chapter__points">
                                            {r.points.map((p) => <li key={p}>{p}</li>)}
                                        </ul>
                                    </div>
                                ))}

                                <p className="chapter__caption">{c.scene_caption}</p>
                            </div>

                            {c.photo && (
                                <figure className="chapter__photo" data-reveal>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img {...c.photo} sizes="(max-width: 900px) 70vw, 28vw" loading="lazy" decoding="async" />
                                </figure>
                            )}
                        </section>
                    )
                })}
            </div>

            <section className="about-close" aria-labelledby="close-title">
                <figure className="about-close__band" data-reveal>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/color/canyon-1280.webp"
                        srcSet="/images/color/canyon-1280.webp 1280w, /images/color/canyon-2000.webp 2000w"
                        sizes="100vw"
                        alt="Yasasvi standing in front of a wide desert canyon"
                        width={2000}
                        height={857}
                        loading="lazy"
                        decoding="async"
                    />
                </figure>
                <div className="about-close__row" data-reveal>
                    <figure className="about-close__portrait">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/images/color/portrait-640.webp"
                            srcSet="/images/color/portrait-320.webp 320w, /images/color/portrait-640.webp 640w"
                            sizes="(max-width: 900px) 40vw, 16vw"
                            alt="Portrait of Yasasvi beside a river"
                            width={640}
                            height={640}
                            loading="lazy"
                            decoding="async"
                        />
                    </figure>
                    <h2 id="close-title" className="about-close__title">What’s next</h2>
                    <p className="about-close__text">
                        I’m open to AI and full-stack engineering roles. If something here lines up with what you’re building,
                        I’d like to hear about it.
                    </p>
                    <div className="about-close__actions">
                        <Link href="/contact" className="ds-btn ds-btn--primary">
                            Get in touch
                            <ArrowRight aria-hidden="true" />
                        </Link>
                        <a href={contactLinks.resume} target="_blank" rel="noopener noreferrer" className="ds-btn">
                            <FileText aria-hidden="true" />
                            Open the resume
                        </a>
                    </div>
                </div>
            </section>
        </main>
    )
}
