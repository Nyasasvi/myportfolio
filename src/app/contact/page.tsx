'use client'

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, CalendarDays, Check, Copy, Github, Linkedin, Loader2, Mail } from "lucide-react"
import { contactLinks } from "../resources/navigation"
import type { ChapterField } from '@/app/components/field/ChapterField'
import type { LetterScene } from './field'
import './index.css'

// Each way of getting in touch has a live scene of how it works behind it (./field)
const chapters = [
    { id: 'message', label: 'Message' },
    { id: 'email', label: 'Email' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'github', label: 'GitHub' },
    { id: 'call', label: 'Call' },
]

interface FormData {
    name: string
    email: string
    message: string
}

interface FormErrors {
    name?: string
    email?: string
    message?: string
}

const MIN_MESSAGE_LENGTH = 10

export default function ContactPage() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        message: ''
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [submitMessage, setSubmitMessage] = useState('')
    const [copied, setCopied] = useState(false)
    const [current, setCurrent] = useState<string | null>(null)
    const [ready, setReady] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)
    const chaptersRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fieldRef = useRef<ChapterField | null>(null)
    const draftRef = useRef(formData)
    draftRef.current = formData

    const letter = () => fieldRef.current?.scene('message') as LetterScene | undefined

    // The field is loaded in idle time; the letter starts from whatever is already in the form
    useEffect(() => {
        const canvas = canvasRef.current
        const host = chaptersRef.current
        if (!canvas || !host) return
        let field: ChapterField | null = null
        let cancelled = false
        const start = () => {
            import('./field').then(({ createField }) => {
                if (cancelled) return
                try {
                    field = createField(canvas, Array.from(host.querySelectorAll<HTMLElement>('[data-scene]')), () => setReady(true))
                    fieldRef.current = field
                    ;(field.scene('message') as LetterScene | undefined)?.setDraft(draftRef.current)
                } catch {
                    // No canvas: the page reads the same without its scenes
                }
            })
        }
        const hasIdle = typeof window.requestIdleCallback === 'function'
        const handle = hasIdle ? window.requestIdleCallback(start, { timeout: 1200 }) : globalThis.setTimeout(start, 200)
        return () => {
            cancelled = true
            if (hasIdle) window.cancelIdleCallback(handle as number)
            else globalThis.clearTimeout(handle)
            field?.destroy()
            fieldRef.current = null
        }
    }, [])

    // The letter beside the form is set as the visitor types
    useEffect(() => {
        letter()?.setDraft(formData)
    }, [formData])

    // Which way of getting in touch holds the middle of the screen, marked in the bar
    useEffect(() => {
        const host = chaptersRef.current
        if (!host || !('IntersectionObserver' in window)) return
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) if (entry.isIntersecting) setCurrent((entry.target as HTMLElement).dataset.scene ?? null)
            },
            { rootMargin: '-50% 0px -50% 0px' },
        )
        host.querySelectorAll('[data-scene]').forEach((el) => io.observe(el))
        return () => io.disconnect()
    }, [])

    const poke = (id: string, label = '') => fieldRef.current?.poke(id, 0, 0, label)

    const validateForm = (): FormErrors => {
        const newErrors: FormErrors = {}

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Enter your name'
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name needs at least 2 characters'
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email.trim()) {
            newErrors.email = 'Enter your email so I can reply'
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Enter an email like name@example.com'
        }

        // Message validation
        if (!formData.message.trim()) {
            newErrors.message = 'Write a short message'
        } else if (formData.message.trim().length < MIN_MESSAGE_LENGTH) {
            newErrors.message = `Message needs at least ${MIN_MESSAGE_LENGTH} characters`
        }

        setErrors(newErrors)
        return newErrors
    }

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
        // Clear submit status when user starts editing again
        if (submitStatus !== 'idle') {
            setSubmitStatus('idle')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const newErrors = validateForm()
        const firstInvalid = (['name', 'email', 'message'] as const).find((field) => newErrors[field])
        if (firstInvalid) {
            formRef.current?.querySelector<HTMLElement>(`#${firstInvalid}`)?.focus()
            return
        }

        setIsSubmitting(true)
        setSubmitStatus('idle')

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (response.ok) {
                // The letter folds and goes before the form clears
                letter()?.sent()
                setSubmitStatus('success')
                setSubmitMessage('Message sent. I\'ll reply to your email soon.')
                // Reset form
                setFormData({ name: '', email: '', message: '' })
            } else {
                letter()?.failed()
                setSubmitStatus('error')
                setSubmitMessage(data.message || 'Your message wasn\'t sent. Try again, or email me directly.')
            }
        } catch (error) {
            letter()?.failed()
            setSubmitStatus('error')
            setSubmitMessage('Your message wasn\'t sent because the server couldn\'t be reached. Try again, or email me directly.')
            console.error('Error submitting form:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(contactLinks.email)
            setCopied(true)
            poke('email', 'copy')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            window.location.href = `mailto:${contactLinks.email}`
        }
    }

    const fieldProps = (field: keyof FormData) => ({
        id: field,
        name: field,
        value: formData[field],
        disabled: isSubmitting,
        'aria-invalid': !!errors[field],
        'aria-describedby': errors[field] ? `${field}-error` : field === 'message' ? 'message-hint' : undefined,
        className: `contact-field__control${errors[field] ? ' is-invalid' : ''}`,
    })

    const messageLength = formData.message.trim().length

    return (
        <main className="contact">
            <header className="contact-intro" data-reveal>
                <h1 className="ds-h1">Get in touch</h1>
                <p className="ds-lede">Hiring, collaborating, or just curious about something I built? Send a note and I&apos;ll reply by email.</p>
                <p className="contact-intro__note">Each way of reaching me below has a live scene of how it works. The letter beside the form is yours, set as you type.</p>
            </header>

            <nav className="contact-bar" aria-label="Ways to reach me">
                <ul role="list">
                    {chapters.map((c) => (
                        <li key={c.id}>
                            <a href={`#contact-${c.id}`} aria-current={current === c.id ? 'location' : undefined}>{c.label}</a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="contact-chapters" ref={chaptersRef}>
                <div className="contact-scenes" aria-hidden="true">
                    <canvas ref={canvasRef} data-ready={ready || undefined} />
                </div>

                <section id="contact-message" className="contact-chapter" data-scene="message" aria-labelledby="contact-message-title">
                    <div className="contact-chapter__body" data-reveal>
                        <h2 id="contact-message-title" className="contact-chapter__title"><span>Send a message</span></h2>
                        <form ref={formRef} onSubmit={handleSubmit} className="contact-form" noValidate>
                            <div className="contact-form__row">
                                <div className="contact-field">
                                    <label htmlFor="name" className="contact-field__label">Name</label>
                                    <input
                                        {...fieldProps('name')}
                                        type="text"
                                        autoComplete="name"
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <p id="name-error" className="contact-field__error">{errors.name}</p>}
                                </div>

                                <div className="contact-field">
                                    <label htmlFor="email" className="contact-field__label">Email</label>
                                    <input
                                        {...fieldProps('email')}
                                        type="email"
                                        autoComplete="email"
                                        inputMode="email"
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        required
                                    />
                                    {errors.email && <p id="email-error" className="contact-field__error">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="contact-field">
                                <label htmlFor="message" className="contact-field__label">Message</label>
                                <textarea
                                    {...fieldProps('message')}
                                    rows={7}
                                    onChange={(e) => handleInputChange('message', e.target.value)}
                                    placeholder="What would you like to talk about?"
                                    required
                                />
                                {errors.message ? (
                                    <p id="message-error" className="contact-field__error">{errors.message}</p>
                                ) : (
                                    <p id="message-hint" className="contact-field__hint">
                                        {messageLength < MIN_MESSAGE_LENGTH
                                            ? `At least ${MIN_MESSAGE_LENGTH} characters`
                                            : `${messageLength} characters`}
                                    </p>
                                )}
                            </div>

                            <div aria-live="polite" className="contact-form__status-slot">
                                {submitStatus !== 'idle' && (
                                    <p className={`contact-status contact-status--${submitStatus}`} role={submitStatus === 'error' ? 'alert' : 'status'}>
                                        {submitStatus === 'success' && <Check aria-hidden="true" />}
                                        {submitMessage}
                                    </p>
                                )}
                            </div>

                            <button type="submit" className="ds-btn ds-btn--primary contact-form__submit" disabled={isSubmitting} aria-busy={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="contact-spin" aria-hidden="true" />
                                        Sending message
                                    </>
                                ) : (
                                    'Send message'
                                )}
                            </button>
                        </form>
                    </div>
                </section>

                <section id="contact-email" className="contact-chapter" data-scene="email" aria-labelledby="contact-email-title">
                    <div className="contact-chapter__body" data-reveal>
                        <h2 id="contact-email-title" className="contact-chapter__title"><span>Email</span></h2>
                        <p className="contact-chapter__address">
                            <a href={`mailto:${contactLinks.email}`} onPointerEnter={() => poke('email', 'send')}><span>{contactLinks.email}</span></a>
                        </p>
                        <div className="contact-chapter__actions">
                            <a href={`mailto:${contactLinks.email}`} className="ds-btn ds-btn--primary" onPointerEnter={() => poke('email', 'send')}>
                                <Mail aria-hidden="true" />
                                Write an email
                            </a>
                            <button type="button" className="ds-btn" onClick={copyEmail} aria-live="polite">
                                {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                                {copied ? 'Address copied' : 'Copy the address'}
                            </button>
                        </div>
                    </div>
                </section>

                <section id="contact-linkedin" className="contact-chapter" data-scene="linkedin" aria-labelledby="contact-linkedin-title">
                    <div className="contact-chapter__body" data-reveal>
                        <h2 id="contact-linkedin-title" className="contact-chapter__title"><span>LinkedIn</span></h2>
                        <p className="contact-chapter__address">
                            <a href={contactLinks.linkedin} target="_blank" rel="noopener noreferrer" onPointerEnter={() => poke('linkedin')}><span>linkedin.com/in/yasasvi-nellore</span></a>
                        </p>
                        <div className="contact-chapter__actions">
                            <a href={contactLinks.linkedin} target="_blank" rel="noopener noreferrer" className="ds-btn" onPointerEnter={() => poke('linkedin')}>
                                <Linkedin aria-hidden="true" />
                                Connect on LinkedIn
                            </a>
                        </div>
                    </div>
                </section>

                <section id="contact-github" className="contact-chapter" data-scene="github" aria-labelledby="contact-github-title">
                    <div className="contact-chapter__body" data-reveal>
                        <h2 id="contact-github-title" className="contact-chapter__title"><span>GitHub</span></h2>
                        <p className="contact-chapter__address">
                            <a href={contactLinks.github} target="_blank" rel="noopener noreferrer" onPointerEnter={() => poke('github')}><span>github.com/Nyasasvi</span></a>
                        </p>
                        <p className="contact-chapter__text"><span>The code for most of the projects on this site is here.</span></p>
                        <div className="contact-chapter__actions">
                            <a href={contactLinks.github} target="_blank" rel="noopener noreferrer" className="ds-btn" onPointerEnter={() => poke('github')}>
                                <Github aria-hidden="true" />
                                See my repositories
                                <ArrowUpRight aria-hidden="true" />
                            </a>
                        </div>
                    </div>
                </section>

                <section id="contact-call" className="contact-chapter" data-scene="call" aria-labelledby="contact-call-title">
                    <div className="contact-chapter__body" data-reveal>
                        <h2 id="contact-call-title" className="contact-chapter__title"><span>Book a call</span></h2>
                        <p className="contact-chapter__text"><span>Book a 30-minute call at a time that works for you.</span></p>
                        <div className="contact-chapter__actions">
                            <a href="https://calendly.com/yasasvi-nellore/30min" target="_blank" rel="noopener noreferrer" className="ds-btn ds-btn--primary" onPointerEnter={() => poke('call')}>
                                <CalendarDays aria-hidden="true" />
                                Book a call
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}
