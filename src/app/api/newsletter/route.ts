// API route for newsletter operations
import { NextResponse } from 'next/server';
import { getAllNewsletters, getNewsletterById } from '@/app/lib/newsletter-storage';

export const dynamic = 'force-dynamic';

// GET all newsletters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const newsletter = getNewsletterById(id);
      if (!newsletter) {
        return NextResponse.json(
          { error: 'Newsletter not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(newsletter);
    }

    const newsletters = getAllNewsletters();
    
    return NextResponse.json({
      newsletters,
      total: newsletters.length,
      activeSubscribers: newsletters.length > 0 ? newsletters[0].subscribers : 0
    });
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletters' },
      { status: 500 }
    );
  }
}

