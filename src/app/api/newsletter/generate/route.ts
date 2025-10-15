// API route to generate new newsletter
import { NextResponse } from 'next/server';
import { 
  saveNewsletter, 
  getLatestEditionNumber,
  getActiveSubscribers,
  initializeSampleData
} from '@/app/lib/newsletter-storage-supabase';
import { Newsletter } from '@/app/lib/supabase-client';
import { aggregateAINews, rankArticles, enhanceWithAI } from '@/app/lib/ai-news-curator';

export const dynamic = 'force-dynamic';

// POST - Generate new newsletter edition
export async function POST(request: Request) {
  try {
    console.log('Starting newsletter generation...');

    // Initialize sample data if needed
    await initializeSampleData();

    // Step 1: Aggregate news from free sources
    console.log('Aggregating AI news from Reddit...');
    const rawNews = await aggregateAINews();
    
    if (rawNews.length === 0) {
      return NextResponse.json(
        { error: 'No news articles found' },
        { status: 500 }
      );
    }

    console.log(`Found ${rawNews.length} articles, ranking...`);

    // Step 2: Rank and select top 10
    const top10Articles = rankArticles(rawNews);

    // Step 3: Enhance with AI (if API key available)
    const enhancedArticles = await enhanceWithAI(top10Articles);

    // Step 4: Create newsletter
    const latestEdition = await getLatestEditionNumber();
    const newEdition = latestEdition + 1;
    const activeSubscribers = await getActiveSubscribers();

    const newsletter: Newsletter = {
      id: Date.now().toString(),
      edition: newEdition,
      title: `AI Weekly #${newEdition}: Top 10 Updates`,
      publishedAt: new Date().toISOString(),
      articles: enhancedArticles,
      subscribers: activeSubscribers.length,
      status: 'published'
    };

    // Step 5: Save to storage
    const saved = await saveNewsletter(newsletter);

    console.log(`Newsletter #${newEdition} generated successfully!`);

    return NextResponse.json({
      success: true,
      newsletter: saved,
      message: `Newsletter #${newEdition} created with ${enhancedArticles.length} articles`
    });

  } catch (error) {
    console.error('Error generating newsletter:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate newsletter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

