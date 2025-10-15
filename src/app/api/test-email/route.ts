// Test email endpoint to verify Gmail setup
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Test email address is required' },
        { status: 400 }
      );
    }

    console.log('🧪 Testing email configuration...');
    console.log('SMTP User:', process.env.SMTP_USER ? 'Set ✅' : 'Not set ❌');
    console.log('SMTP Password:', process.env.SMTP_PASS ? 'Set ✅' : 'Not set ❌');

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Test email content
    const testEmailContent = {
      from: {
        name: 'Yasasvi Nellore - AI Weekly',
        address: process.env.SMTP_USER || 'yasasvi.nellore@gmail.com'
      },
      to: testEmail,
      subject: '🎉 Newsletter Email Test - Gmail Setup Working!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Test</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #f6f9fc;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
            <h1 style="color: #333; margin-bottom: 20px;">Email Test Successful!</h1>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Congratulations! Your Gmail configuration is working perfectly. 
              Newsletter emails will now be sent automatically to all subscribers.
            </p>
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">✅ Gmail SMTP Connected</h3>
              <p style="margin: 0; opacity: 0.9;">Newsletter system is ready to go!</p>
            </div>
            <p style="color: #888; font-size: 14px;">
              Test sent from: ${process.env.SMTP_USER}<br>
              Sent at: ${new Date().toLocaleString()}
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
🎉 Email Test Successful!

Congratulations! Your Gmail configuration is working perfectly. 
Newsletter emails will now be sent automatically to all subscribers.

✅ Gmail SMTP Connected
Newsletter system is ready to go!

Test sent from: ${process.env.SMTP_USER}
Sent at: ${new Date().toLocaleString()}
      `
    };

    // Send test email
    const info = await transporter.sendMail(testEmailContent);
    
    console.log('✅ Test email sent successfully:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      messageId: info.messageId,
      testEmail: testEmail,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test email failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error',
        troubleshooting: [
          'Check if SMTP_USER environment variable is set correctly',
          'Verify SMTP_PASS is a valid 16-character app password',
          'Ensure 2-Factor Authentication is enabled on your Google account',
          'Make sure you generated an App Password (not your regular password)'
        ]
      },
      { status: 500 }
    );
  }
}
