import { NextRequest, NextResponse } from 'next/server'

// For production, you can use services like:
// - SendGrid
// - Resend
// - NodeMailer with your email provider
// - EmailJS
// This example uses a simple nodemailer setup

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, message } = body

        // Validate input
        if (!name || !email || !message) {
            return NextResponse.json(
                { message: 'All fields are required' },
                { status: 400 }
            )
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: 'Invalid email address' },
                { status: 400 }
            )
        }

        // Option 1: Using SendGrid (Recommended for production)
        // Uncomment and configure when you have SendGrid API key
        /*
        const sgMail = require('@sendgrid/mail')
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        
        const msg = {
            to: 'yasasvi.nellore@gmail.com',
            from: 'noreply@yourportfolio.com', // Must be verified in SendGrid
            replyTo: email,
            subject: `Portfolio Contact: ${name}`,
            text: message,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `,
        }
        
        await sgMail.send(msg)
        */

        // Option 2: Using Resend (Modern alternative to SendGrid)
        // Uncomment and configure when you have Resend API key
        /*
        const { Resend } = require('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        
        await resend.emails.send({
            from: 'Portfolio <noreply@yourportfolio.com>',
            to: 'yasasvi.nellore@gmail.com',
            replyTo: email,
            subject: `Portfolio Contact: ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `,
        })
        */

        // Option 3: Using NodeMailer (For any SMTP provider)
        const nodemailer = require('nodemailer')
        
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        })

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: 'yasasvi.nellore@gmail.com',
            replyTo: email,
            subject: `Portfolio Contact: ${name}`,
            text: message,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `,
        })

        // Log successful submission
        console.log('Email sent successfully to yasasvi.nellore@gmail.com from:', email)

        return NextResponse.json(
            { 
                message: 'Message sent successfully! I\'ll get back to you soon.',
                success: true 
            },
            { status: 200 }
        )

    } catch (error) {
        console.error('Error sending email:', error)
        return NextResponse.json(
            { message: 'Failed to send message. Please try again later.' },
            { status: 500 }
        )
    }
}

