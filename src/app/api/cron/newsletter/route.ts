// Cron job endpoint for automatic newsletter generation
import { NextResponse } from 'next/server';
import { 
  saveNewsletter, 
  getLatestEditionNumber,
  getActiveSubscribers,
  Newsletter 
} from '@/app/lib/newsletter-storage';
import { aggregateAINews, rankArticles, enhanceWithAI } from '@/app/lib/ai-news-curator';
import { sendNewsletterToAllSubscribers } from '@/app/lib/email-template';

export const dynamic = 'force-dynamic';

// GET - Cron job endpoint (runs every Monday at 9 AM)
export async function GET(request: Request) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🤖 Auto-generating weekly newsletter...');

    // Step 1: Check if we already generated this week
    const latestEdition = getLatestEditionNumber();
    const latestNewsletter = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/newsletter`)
      .then(r => r.json())
      .then(data => data.newsletters?.[0]);

    if (latestNewsletter) {
      const lastPublished = new Date(latestNewsletter.publishedAt);
      const daysSinceLastPublished = (Date.now() - lastPublished.getTime()) / (1000 * 60 * 60 * 24);
      
      // If we published within the last 6 days, skip generation
      if (daysSinceLastPublished < 6) {
        console.log(`📰 Newsletter already published ${Math.round(daysSinceLastPublished)} days ago, skipping...`);
        return NextResponse.json({
          success: true,
          message: 'Newsletter already published this week',
          skipped: true,
          daysSinceLastPublished: Math.round(daysSinceLastPublished)
        });
      }
    }

    // Step 2: Generate new newsletter
    const rawNews = await aggregateAINews();
    
    if (rawNews.length === 0) {
      return NextResponse.json(
        { error: 'No news articles found' },
        { status: 500 }
      );
    }

    console.log(`📊 Found ${rawNews.length} articles, ranking...`);
    const top10Articles = rankArticles(rawNews);
    const enhancedArticles = await enhanceWithAI(top10Articles);

    // Step 3: Create newsletter
    const newEdition = latestEdition + 1;
    const activeSubscribers = getActiveSubscribers();

    const newsletter: Newsletter = {
      id: Date.now().toString(),
      edition: newEdition,
      title: `AI Weekly #${newEdition}: Top 10 Updates`,
      publishedAt: new Date().toISOString(),
      articles: enhancedArticles,
      subscribers: activeSubscribers.length,
      status: 'published'
    };

    // Step 4: Save to storage
    const saved = saveNewsletter(newsletter);

    console.log(`✅ Newsletter #${newEdition} auto-generated successfully!`);
    console.log(`📧 ${activeSubscribers.length} subscribers will be notified`);

    // Step 5: Send emails to all active subscribers
    let emailResults = { sent: 0, failed: 0, errors: [] as string[] };
    
    if (activeSubscribers.length > 0) {
      try {
        emailResults = await sendNewsletterToAllSubscribers(saved, activeSubscribers);
        console.log(`📊 Email sending results: ${emailResults.sent} sent, ${emailResults.failed} failed`);
      } catch (error) {
        console.error('❌ Error sending newsletter emails:', error);
        emailResults.errors.push(`Email sending failed: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      newsletter: {
        id: saved.id,
        edition: saved.edition,
        title: saved.title,
        articlesCount: saved.articles.length,
        subscribers: saved.subscribers
      },
      message: `Newsletter #${newEdition} auto-generated with ${enhancedArticles.length} articles`,
      subscribers: activeSubscribers.length,
      emailResults: {
        sent: emailResults.sent,
        failed: emailResults.failed,
        total: activeSubscribers.length,
        errors: emailResults.errors
      }
    });

  } catch (error) {
    console.error('❌ Auto-newsletter generation failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to auto-generate newsletter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
