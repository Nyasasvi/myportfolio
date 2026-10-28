'use client'

import { useRef, useState } from "react"
import { CalendarDays, Check, Copy, Github, Linkedin, Loader2, Mail } from "lucide-react"
import { contactLinks } from "../resources/navigation"
import './index.css'

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
    const formRef = useRef<HTMLFormElement>(null)

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
                setSubmitStatus('success')
                setSubmitMessage('Message sent. I\'ll reply to your email soon.')
                // Reset form
                setFormData({ name: '', email: '', message: '' })
            } else {
                setSubmitStatus('error')
                setSubmitMessage(data.message || 'Your message wasn\'t sent. Try again, or email me directly.')
            }
        } catch (error) {
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
            <header className="contact-intro">
                <h1 className="ds-h1">Get in touch</h1>
                <p className="ds-lede">Hiring, collaborating, or just curious about something I built? Send a note and I&apos;ll reply by email.</p>
            </header>

            <div className="contact-layout">
                <form ref={formRef} onSubmit={handleSubmit} className="ds-card contact-form" noValidate>
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

                <aside className="contact-aside" aria-label="Other ways to reach me">
                    <div className="ds-card contact-channels">
                        <h2 className="ds-h3">Other ways to reach me</h2>
                        <ul className="contact-channels__list" role="list">
                            <li>
                                <a href={`mailto:${contactLinks.email}`} className="contact-channel">
                                    <Mail aria-hidden="true" />
                                    <span>
                                        <span className="contact-channel__label">Email</span>
                                        <span className="contact-channel__value">{contactLinks.email}</span>
                                    </span>
                                </a>
                                <button type="button" className="ds-icon-btn" onClick={copyEmail} aria-label={copied ? 'Email address copied' : 'Copy email address'}>
                                    {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                                </button>
                            </li>
                            <li>
                                <a href={contactLinks.linkedin} target="_blank" rel="noopener noreferrer" className="contact-channel">
                                    <Linkedin aria-hidden="true" />
                                    <span>
                                        <span className="contact-channel__label">LinkedIn</span>
                                        <span className="contact-channel__value">linkedin.com/in/yasasvi-nellore</span>
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a href={contactLinks.github} target="_blank" rel="noopener noreferrer" className="contact-channel">
                                    <Github aria-hidden="true" />
                                    <span>
                                        <span className="contact-channel__label">GitHub</span>
                                        <span className="contact-channel__value">github.com/Nyasasvi</span>
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="ds-card contact-call">
                        <h2 className="ds-h3">Prefer to talk?</h2>
                        <p className="ds-body-text">Book a 30-minute call at a time that works for you.</p>
                        <a href="https://calendly.com/yasasvi-nellore/30min" target="_blank" rel="noopener noreferrer" className="ds-btn">
                            <CalendarDays aria-hidden="true" />
                            Book a call
                        </a>
                    </div>
                </aside>
            </div>
        </main>
    )
}
