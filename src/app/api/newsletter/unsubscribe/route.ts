// Newsletter unsubscribe endpoint
import { NextRequest, NextResponse } from 'next/server';
import { unsubscribe } from '@/app/lib/newsletter-storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.html(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribe - AI Weekly Newsletter</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #f6f9fc; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #333; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
            .error { color: #ef4444; background: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🤖 AI Weekly Newsletter</h1>
            <div class="error">
              <p><strong>Error:</strong> No email address provided for unsubscribe.</p>
            </div>
            <p>Please contact us at <a href="mailto:yasasvi.nellore@gmail.com">yasasvi.nellore@gmail.com</a> for assistance.</p>
          </div>
        </body>
        </html>
      `);
    }

    const success = unsubscribe(email);

    if (!success) {
      return NextResponse.html(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribe - AI Weekly Newsletter</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #f6f9fc; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #333; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
            .error { color: #ef4444; background: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; }
            .success { color: #10b981; background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🤖 AI Weekly Newsletter</h1>
            <div class="error">
              <p><strong>Email not found:</strong> The email address <strong>${email}</strong> was not found in our subscriber list.</p>
            </div>
            <p>This email may have already been unsubscribed or was never subscribed to our newsletter.</p>
          </div>
        </body>
        </html>
      `);
    }

    return NextResponse.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed - AI Weekly Newsletter</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #f6f9fc; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); text-align: center; }
          h1 { color: #333; margin-bottom: 20px; }
          p { color: #666; line-height: 1.6; }
          .success { color: #10b981; background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 20px 0; }
          .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🤖 AI Weekly Newsletter</h1>
          <div class="success">
            <p><strong>Successfully Unsubscribed!</strong></p>
            <p>You have been unsubscribed from the AI Weekly Newsletter.</p>
          </div>
          <p>We're sorry to see you go! If you change your mind, you can always <a href="https://yourportfolio.com/newsletter" class="btn">resubscribe here</a>.</p>
          <p>Thank you for being part of our AI community!</p>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('❌ Unsubscribe error:', error);
    return NextResponse.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - AI Weekly Newsletter</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #f6f9fc; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); text-align: center; }
          h1 { color: #333; margin-bottom: 20px; }
          p { color: #666; line-height: 1.6; }
          .error { color: #ef4444; background: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🤖 AI Weekly Newsletter</h1>
          <div class="error">
            <p><strong>Error:</strong> Something went wrong while processing your unsubscribe request.</p>
          </div>
          <p>Please contact us at <a href="mailto:yasasvi.nellore@gmail.com">yasasvi.nellore@gmail.com</a> for assistance.</p>
        </div>
      </body>
      </html>
    `);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const success = unsubscribe(email);

    return NextResponse.json({
      success,
      message: success 
        ? 'Successfully unsubscribed from AI Weekly Newsletter'
        : 'Email not found in subscriber list'
    });

  } catch (error) {
    console.error('❌ Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
