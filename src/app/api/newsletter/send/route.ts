// Manual newsletter sending endpoint (for testing)
import { NextRequest, NextResponse } from 'next/server';
import { getNewsletterById, getActiveSubscribers } from '@/app/lib/newsletter-storage-supabase';
import { sendNewsletterToAllSubscribers } from '@/app/lib/email-template';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { newsletterId, testEmail } = body;

    if (!newsletterId) {
      return NextResponse.json(
        { error: 'Newsletter ID is required' },
        { status: 400 }
      );
    }

    // Get newsletter by ID
    const newsletter = await getNewsletterById(newsletterId);
    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    // Get active subscribers
    const allSubscribers = await getActiveSubscribers();
    let subscribersToSend = allSubscribers;

    // If test email is provided, send only to that email
    if (testEmail) {
      subscribersToSend = [{ 
        id: 'test-' + Date.now(),
        email: testEmail, 
        subscribedAt: new Date().toISOString(), 
        unsubscribed: false, 
        interests: [] 
      }];
    }

    if (subscribersToSend.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No subscribers found',
        emailResults: { sent: 0, failed: 0, total: 0, errors: [] }
      });
    }

    console.log(`📧 Sending newsletter #${newsletter.edition} to ${subscribersToSend.length} subscribers...`);

    // Send emails
    const emailResults = await sendNewsletterToAllSubscribers(newsletter, subscribersToSend);

    return NextResponse.json({
      success: true,
      message: `Newsletter #${newsletter.edition} sent successfully`,
      newsletter: {
        id: newsletter.id,
        edition: newsletter.edition,
        title: newsletter.title,
        articlesCount: newsletter.articles.length
      },
      emailResults: {
        sent: emailResults.sent,
        failed: emailResults.failed,
        total: subscribersToSend.length,
        errors: emailResults.errors
      }
    });

  } catch (error) {
    console.error('❌ Error sending newsletter:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send newsletter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
