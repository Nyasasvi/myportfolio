'use client'

import { useState } from "react"
import { Flex, Text, Button, Spinner } from "@/once-ui/components"
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

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters'
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        // Message validation
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required'
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
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

        if (!validateForm()) {
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
                setSubmitMessage('Thank you for your message! I\'ll get back to you soon.')
                // Reset form
                setFormData({ name: '', email: '', message: '' })
            } else {
                setSubmitStatus('error')
                setSubmitMessage(data.message || 'Something went wrong. Please try again.')
            }
        } catch (error) {
            setSubmitStatus('error')
            setSubmitMessage('Failed to send message. Please try again later.')
            console.error('Error submitting form:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Flex
            as="main"
            direction="column"
            justifyContent="normal"
            fillWidth
            fillHeight
            padding="xs"
            gap="m"
        >
            <Flex fillWidth direction="column">
                <Text
                    variant="heading-strong-xl"
                    style={{ fontSize: "32px" }}
                    onBackground="accent-medium"
                    marginBottom="s"
                >
                    GET IN TOUCH
                </Text>
                <Text variant="body-default-m" marginBottom="m" onBackground="neutral-weak">
                    Have a question or want to work together? Feel free to reach out!
                </Text>
            </Flex>

            <Flex
                fillWidth
                direction="row"
                mobileDirection="column"
                gap="l"
            >
                {/* Contact Form */}
                <Flex
                    flex={2}
                    direction="column"
                    gap="m"
                >
                    <form onSubmit={handleSubmit} className="contact-form">
                        {/* Name Field */}
                        <Flex direction="column" gap="4">
                            <label htmlFor="name" className="form-label">
                                <Text variant="body-strong-m">Name *</Text>
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`form-input ${errors.name ? 'error' : ''}`}
                                placeholder="Your name"
                                disabled={isSubmitting}
                            />
                            {errors.name && (
                                <Text variant="body-default-s" className="error-text">
                                    {errors.name}
                                </Text>
                            )}
                        </Flex>

                        {/* Email Field */}
                        <Flex direction="column" gap="4">
                            <label htmlFor="email" className="form-label">
                                <Text variant="body-strong-m">Email *</Text>
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`form-input ${errors.email ? 'error' : ''}`}
                                placeholder="your.email@example.com"
                                disabled={isSubmitting}
                            />
                            {errors.email && (
                                <Text variant="body-default-s" className="error-text">
                                    {errors.email}
                                </Text>
                            )}
                        </Flex>

                        {/* Message Field */}
                        <Flex direction="column" gap="4">
                            <label htmlFor="message" className="form-label">
                                <Text variant="body-strong-m">Message *</Text>
                            </label>
                            <textarea
                                id="message"
                                value={formData.message}
                                onChange={(e) => handleInputChange('message', e.target.value)}
                                className={`form-textarea ${errors.message ? 'error' : ''}`}
                                placeholder="Your message here..."
                                rows={6}
                                disabled={isSubmitting}
                            />
                            {errors.message && (
                                <Text variant="body-default-s" className="error-text">
                                    {errors.message}
                                </Text>
                            )}
                        </Flex>

                        {/* Submit Status Messages */}
                        {submitStatus === 'success' && (
                            <Flex className="status-message success">
                                <Text variant="body-default-m">{submitMessage}</Text>
                            </Flex>
                        )}

                        {submitStatus === 'error' && (
                            <Flex className="status-message error">
                                <Text variant="body-default-m">{submitMessage}</Text>
                            </Flex>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                            style={{ width: '100%' }}
                        >
                            {isSubmitting ? (
                                <Flex alignItems="center" gap="8">
                                    <Spinner size="s" />
                                    <span>Sending...</span>
                                </Flex>
                            ) : (
                                'Send Message'
                            )}
                        </Button>
                    </form>
                </Flex>

                {/* Contact Info & Calendly */}
                <Flex
                    flex={1}
                    direction="column"
                    gap="l"
                >
                    {/* Quick Contact Info */}
                    <Flex direction="column" gap="m" className="contact-info-card">
                        <Text variant="heading-strong-l" marginBottom="s">
                            Other Ways to Connect
                        </Text>
                        
                        <Flex direction="column" gap="s">
                            <Flex alignItems="center" gap="8">
                                <Text variant="body-strong-m">📧 Email:</Text>
                            </Flex>
                            <a href="mailto:yasasvi.nellore@gmail.com" className="contact-link">
                                <Text variant="body-default-m">yasasvi.nellore@gmail.com</Text>
                            </a>
                        </Flex>

                        <Flex direction="column" gap="s">
                            <Flex alignItems="center" gap="8">
                                <Text variant="body-strong-m">💼 LinkedIn:</Text>
                            </Flex>
                            <a 
                                href="https://www.linkedin.com/in/yasasvi-nellore/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="contact-link"
                            >
                                <Text variant="body-default-m">linkedin.com/in/yasasvi-nellore</Text>
                            </a>
                        </Flex>

                        <Flex direction="column" gap="s">
                            <Flex alignItems="center" gap="8">
                                <Text variant="body-strong-m">💻 GitHub:</Text>
                            </Flex>
                            <a 
                                href="https://github.com/Nyasasvi/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="contact-link"
                            >
                                <Text variant="body-default-m">github.com/Nyasasvi</Text>
                            </a>
                        </Flex>
                    </Flex>

                    {/* Calendly Integration */}
                    <Flex direction="column" gap="m" className="calendly-card">
                        <Text variant="heading-strong-l" marginBottom="s">
                            Schedule a Call
                        </Text>
                        <Text variant="body-default-m" marginBottom="s" onBackground="neutral-weak">
                            Prefer to talk? Book a time slot that works for you.
                        </Text>
                        <Button
                            href="https://calendly.com/yasasvi-nellore/30min"
                            variant="secondary"
                            target="_blank"
                        >
                            📅 Schedule 30min Meeting
                        </Button>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                            Book a convenient time to discuss your project or opportunity
                        </Text>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    )
}
