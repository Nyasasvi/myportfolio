// API route for newsletter subscriptions
import { NextResponse } from 'next/server';
import { addSubscriber, unsubscribe as unsubscribeEmail } from '@/app/lib/newsletter-storage';

export const dynamic = 'force-dynamic';

// POST - Subscribe to newsletter
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, interests = [] } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const subscriber = addSubscriber(email, interests);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to AI Weekly!',
      subscriber: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt
      }
    });

  } catch (error) {
    console.error('Error subscribing:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

// DELETE - Unsubscribe from newsletter
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const success = unsubscribeEmail(email);

    if (!success) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed'
    });

  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

