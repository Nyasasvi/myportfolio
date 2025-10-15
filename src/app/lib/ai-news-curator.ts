// AI-powered news curation from trusted sources
import Parser from 'rss-parser';
import { AIArticle } from './newsletter-storage';

const rssParser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

// Trusted news sources - all free!
const NEWS_SOURCES = {
  // 1. Hacker News - Tech community favorite
  hackerNews: 'https://hacker-news.firebaseio.com/v0/topstories.json',
  
  // 2. Dev.to - Quality developer content
  devTo: 'https://dev.to/api/articles?tag=ai&top=7',
  
  // 3. NewsAPI - Premium sources (requires free API key)
  newsApi: (apiKey: string) => 
    `https://newsapi.org/v2/everything?q=(artificial+intelligence+OR+machine+learning+OR+AI+OR+LLM+OR+GPT)&sortBy=publishedAt&language=en&pageSize=50&apiKey=${apiKey}`,
  
  // 4. ArXiv - Academic research
  arxiv: 'http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CV&sortBy=submittedDate&max_results=30',
  
  // 5. GitHub Trending - Popular AI projects
  githubTrending: 'https://api.gtrend.yapie.me/repositories?since=weekly&spoken_language=en',
  
  // 6. RSS Feeds from trusted tech publications
  rssFeeds: [
    'https://venturebeat.com/category/ai/feed/',
    'https://techcrunch.com/category/artificial-intelligence/feed/',
    'https://www.technologyreview.com/topic/artificial-intelligence/feed',
  ],
};

interface RawArticle {
  title: string;
  url: string;
  score: number;
  publishedDate: string;
  source: string;
  comments: number;
  description?: string;
  author?: string;
  imageUrl?: string;
}

interface ScoredArticle extends RawArticle {
  qualityScore: number;
  relevanceScore: number;
  finalScore: number;
}

// ============= SOURCE 1: HACKER NEWS =============
async function fetchHackerNews(): Promise<RawArticle[]> {
  try {
    const topStoriesResponse = await fetch(NEWS_SOURCES.hackerNews);
    if (!topStoriesResponse.ok) throw new Error('HN API failed');
    
    const topStoryIds = await topStoriesResponse.json();
    
    // Fetch top 100 stories
    const storyPromises = topStoryIds.slice(0, 100).map(async (id: number) => {
      try {
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (!storyResponse.ok) return null;
        return storyResponse.json();
      } catch {
        return null;
      }
    });
    
    const stories = (await Promise.all(storyPromises)).filter(Boolean);
    
    // Filter for AI-related content with better keyword matching
    const aiKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning',
      'neural', 'llm', 'gpt', 'chatgpt', 'claude', 'gemini', 'openai', 'anthropic',
      'computer vision', 'nlp', 'natural language', 'transformer', 'diffusion',
      'generative', 'stable diffusion', 'midjourney', 'dalle', 'reinforcement learning'
    ];
    
    return stories
      .filter((story: any) => {
        if (!story || !story.title) return false;
        const title = story.title.toLowerCase();
        const url = (story.url || '').toLowerCase();
        return aiKeywords.some(keyword => title.includes(keyword) || url.includes(keyword));
      })
      .map((story: any) => ({
        title: story.title,
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        score: story.score || 0,
        publishedDate: new Date(story.time * 1000).toISOString(),
        source: 'Hacker News',
        comments: story.descendants || 0,
        author: story.by,
      }));
  } catch (error) {
    console.error('Error fetching Hacker News:', error);
    return [];
  }
}

// ============= SOURCE 2: DEV.TO =============
async function fetchDevTo(): Promise<RawArticle[]> {
  try {
    const response = await fetch(NEWS_SOURCES.devTo);
    if (!response.ok) throw new Error('Dev.to API failed');
    
    const articles = await response.json();
    
    return articles.map((article: any) => ({
      title: article.title,
      url: article.url,
      score: article.positive_reactions_count || 0,
      publishedDate: article.published_at,
      source: 'Dev.to',
      comments: article.comments_count || 0,
      description: article.description,
      author: article.user?.name,
      imageUrl: article.cover_image,
    }));
  } catch (error) {
    console.error('Error fetching Dev.to:', error);
    return [];
  }
}

// ============= SOURCE 3: NEWS API =============
async function fetchNewsAPI(): Promise<RawArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.log('NewsAPI key not found in .env, skipping premium sources...');
    return [];
  }
  
  try {
    const response = await fetch(NEWS_SOURCES.newsApi(apiKey), {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    
    if (!response.ok) {
      console.error('NewsAPI failed:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (data.status !== 'ok' || !data.articles) {
      console.error('NewsAPI returned error:', data.message);
      return [];
    }
    
    return data.articles
      .filter((article: any) => article.title && article.url && article.title !== '[Removed]')
      .map((article: any) => ({
        title: article.title,
        url: article.url,
        score: 150, // Premium source, give higher base score
        publishedDate: article.publishedAt,
        source: article.source.name,
        comments: 0,
        description: article.description,
        author: article.author,
        imageUrl: article.urlToImage,
      }));
  } catch (error) {
    console.error('Error fetching NewsAPI:', error);
    return [];
  }
}

// ============= SOURCE 4: ARXIV =============
async function fetchArxiv(): Promise<RawArticle[]> {
  try {
    const response = await fetch(NEWS_SOURCES.arxiv);
    if (!response.ok) throw new Error('ArXiv API failed');
    
    const xmlText = await response.text();
    
    // Parse ArXiv Atom feed
    const entries = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    
    return entries.map((entry: string) => {
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim().replace(/\n/g, ' ') || '';
      const id = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim() || '';
      const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim() || '';
      const summary = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.trim().replace(/\n/g, ' ').substring(0, 200) || '';
      const author = entry.match(/<name>([\s\S]*?)<\/name>/)?.[1]?.trim() || '';
      
      return {
        title: title,
        url: id,
        score: 80, // Academic papers get good base score
        publishedDate: published,
        source: 'ArXiv',
        comments: 0,
        description: summary,
        author: author,
      };
    }).filter(article => article.title && article.url);
  } catch (error) {
    console.error('Error fetching ArXiv:', error);
    return [];
  }
}

// ============= SOURCE 5: GITHUB TRENDING =============
async function fetchGitHubTrending(): Promise<RawArticle[]> {
  try {
    const response = await fetch(NEWS_SOURCES.githubTrending);
    if (!response.ok) throw new Error('GitHub Trending API failed');
    
    const repos = await response.json();
    
    // Filter for AI-related repos
    const aiKeywords = [
      'ai', 'ml', 'machine-learning', 'deep-learning', 'neural', 'llm',
      'gpt', 'transformer', 'pytorch', 'tensorflow', 'diffusion', 'stable-diffusion',
      'computer-vision', 'nlp', 'chatbot', 'generative'
    ];
    
    return repos
      .filter((repo: any) => {
        const name = (repo.name || '').toLowerCase();
        const desc = (repo.description || '').toLowerCase();
        return aiKeywords.some(keyword => name.includes(keyword) || desc.includes(keyword));
      })
      .slice(0, 15) // Top 15 AI repos
      .map((repo: any) => ({
        title: `📦 ${repo.name}: ${repo.description || 'Trending AI Project'}`,
        url: repo.url,
        score: repo.stars || 0,
        publishedDate: new Date().toISOString(), // Trending is current
        source: 'GitHub Trending',
        comments: 0,
        description: repo.description,
        author: repo.owner,
      }));
  } catch (error) {
    console.error('Error fetching GitHub Trending:', error);
    return [];
  }
}

// ============= SOURCE 6: RSS FEEDS =============
async function fetchRSSFeeds(): Promise<RawArticle[]> {
  const allArticles: RawArticle[] = [];
  
  for (const feedUrl of NEWS_SOURCES.rssFeeds) {
    try {
      const feed = await rssParser.parseURL(feedUrl);
      
      const sourceName = feed.title || feedUrl.includes('venturebeat') ? 'VentureBeat' :
                         feedUrl.includes('techcrunch') ? 'TechCrunch' :
                         feedUrl.includes('technologyreview') ? 'MIT Tech Review' : 'RSS Feed';
      
      const articles = feed.items.slice(0, 20).map((item: any) => ({
        title: item.title || '',
        url: item.link || '',
        score: 120, // RSS feeds from premium sources get high score
        publishedDate: item.pubDate || item.isoDate || new Date().toISOString(),
        source: sourceName,
        comments: 0,
        description: item.contentSnippet || item.content || '',
        author: item.creator || item.author,
        imageUrl: item.enclosure?.url || item.mediaContent?.url,
      }));
      
      allArticles.push(...articles);
    } catch (error) {
      console.error(`Error fetching RSS feed ${feedUrl}:`, error);
    }
  }
  
  return allArticles.filter(article => article.title && article.url);
}

// ============= MAIN AGGREGATION =============
export async function aggregateAINews(): Promise<RawArticle[]> {
  console.log('🔍 Starting news aggregation from 6 trusted sources...\n');
  
  const results = await Promise.allSettled([
    fetchHackerNews(),
    fetchDevTo(),
    fetchNewsAPI(),
    fetchArxiv(),
    fetchGitHubTrending(),
    fetchRSSFeeds(),
  ]);
  
  const allNews: RawArticle[] = [];
  const sources = ['Hacker News', 'Dev.to', 'NewsAPI', 'ArXiv', 'GitHub', 'RSS Feeds'];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`✅ ${sources[index]}: ${result.value.length} articles`);
      allNews.push(...result.value);
    } else {
      console.log(`❌ ${sources[index]}: Failed`);
    }
  });
  
  console.log(`\n📊 Total articles: ${allNews.length}`);
  return allNews;
}

// ============= SMART RANKING ALGORITHM =============
export function rankArticles(articles: RawArticle[]): AIArticle[] {
  console.log('\n🧠 Applying intelligent ranking...');
  
  // Step 1: Remove duplicates (smart deduplication)
  const uniqueArticles = removeDuplicates(articles);
  console.log(`  Removed duplicates: ${articles.length} → ${uniqueArticles.length}`);
  
  // Step 2: Score each article
  const scoredArticles: ScoredArticle[] = uniqueArticles.map(article => {
    const qualityScore = calculateQualityScore(article);
    const relevanceScore = calculateRelevanceScore(article);
    const recencyScore = calculateRecencyScore(article);
    
    // Weighted final score
    const finalScore = (qualityScore * 0.4) + (relevanceScore * 0.4) + (recencyScore * 0.2);
    
    return {
      ...article,
      qualityScore,
      relevanceScore,
      finalScore,
    };
  });

  // Step 3: Sort by final score
  scoredArticles.sort((a, b) => b.finalScore - a.finalScore);
  
  // Step 4: Ensure diversity in sources
  const diverseArticles = ensureSourceDiversity(scoredArticles);
  
  // Step 5: Convert to AIArticle format (top 10)
  const topArticles = diverseArticles.slice(0, 10).map((article, index) => {
    const tags = categorizeArticle(article.title, article.description || '');
    
    return {
      id: Date.now().toString() + index,
      rank: index + 1,
      title: cleanTitle(article.title),
      summary: generateSummary(article.title, article.description || '', article.source),
      whyItMatters: generateWhyItMatters(tags, article.source),
      url: article.url,
      publishedDate: article.publishedDate,
      references: [
        {
          title: article.title,
          url: article.url,
          source: article.source,
          publishedAt: article.publishedDate,
        }
      ],
      credibilityScore: calculateCredibilityScore(article),
      tags,
    };
  });
  
  console.log(`  Final selection: ${topArticles.length} top articles\n`);
  return topArticles;
}

// ============= HELPER FUNCTIONS =============

function removeDuplicates(articles: RawArticle[]): RawArticle[] {
  const seen = new Map<string, RawArticle>();
  
  articles.forEach(article => {
    const normalizedTitle = article.title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
    
    // Keep the one with higher score
    const existing = seen.get(normalizedTitle);
    if (!existing || article.score > existing.score) {
      seen.set(normalizedTitle, article);
    }
  });
  
  return Array.from(seen.values());
}

function calculateQualityScore(article: RawArticle): number {
  let score = 0;
  
  // Source reputation
  const sourceScores: { [key: string]: number } = {
    'ArXiv': 100,
    'MIT Tech Review': 95,
    'TechCrunch': 90,
    'VentureBeat': 90,
    'Hacker News': 85,
    'Dev.to': 75,
    'GitHub Trending': 70,
  };
  
  score += sourceScores[article.source] || 50;
  
  // Engagement (normalized)
  score += Math.min(50, Math.log(article.score + 1) * 10);
  
  // Comments indicate discussion quality
  score += Math.min(30, Math.log(article.comments + 1) * 5);
  
  // Has description?
  if (article.description && article.description.length > 50) score += 20;
  
  return score;
}

function calculateRelevanceScore(article: RawArticle): number {
  const content = `${article.title} ${article.description || ''}`.toLowerCase();
  let score = 50; // Base score
  
  // High-value keywords
  const highValueKeywords = [
    { term: 'gpt-', weight: 30 },
    { term: 'claude', weight: 30 },
    { term: 'gemini', weight: 30 },
    { term: 'openai', weight: 25 },
    { term: 'anthropic', weight: 25 },
    { term: 'breakthrough', weight: 25 },
    { term: 'llm', weight: 20 },
    { term: 'transformer', weight: 20 },
    { term: 'neural network', weight: 20 },
    { term: 'machine learning', weight: 15 },
    { term: 'deep learning', weight: 15 },
    { term: 'computer vision', weight: 15 },
    { term: 'generative', weight: 15 },
    { term: 'ai model', weight: 15 },
  ];
  
  highValueKeywords.forEach(({ term, weight }) => {
    if (content.includes(term)) score += weight;
  });
  
  // Negative keywords (reduce relevance)
  const negativeKeywords = ['crypto', 'bitcoin', 'nft', 'blockchain'];
  negativeKeywords.forEach(term => {
    if (content.includes(term)) score -= 30;
  });
  
  return Math.max(0, score);
}

function calculateRecencyScore(article: RawArticle): number {
  const now = Date.now();
  const published = new Date(article.publishedDate).getTime();
  const ageInHours = (now - published) / (1000 * 60 * 60);
  
  // Fresher content gets higher scores
  if (ageInHours < 24) return 100;
  if (ageInHours < 48) return 80;
  if (ageInHours < 72) return 60;
  if (ageInHours < 168) return 40; // 1 week
  return 20;
}

function ensureSourceDiversity(articles: ScoredArticle[]): ScoredArticle[] {
  const result: ScoredArticle[] = [];
  const sourceCount = new Map<string, number>();
  
  // First pass: take top articles with source diversity cap
  for (const article of articles) {
    const count = sourceCount.get(article.source) || 0;
    
    // Allow max 3 articles from same source in top 10
    if (count < 3) {
      result.push(article);
      sourceCount.set(article.source, count + 1);
    }
    
    if (result.length >= 15) break; // Get 15 to ensure we have 10 after filtering
  }
  
  return result;
}

function categorizeArticle(title: string, description: string): string[] {
  const content = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];

  const categories = [
    { tag: 'LLMs', keywords: ['gpt', 'llm', 'language model', 'claude', 'gemini', 'chatgpt'] },
    { tag: 'Computer Vision', keywords: ['vision', 'image', 'visual', 'dall-e', 'midjourney', 'stable diffusion'] },
    { tag: 'Robotics', keywords: ['robot', 'autonomous', 'drone', 'self-driving'] },
    { tag: 'Deep Learning', keywords: ['neural', 'deep learning', 'transformer', 'pytorch', 'tensorflow'] },
    { tag: 'AI Companies', keywords: ['openai', 'anthropic', 'google ai', 'microsoft ai', 'meta ai'] },
    { tag: 'AI Ethics', keywords: ['ethics', 'bias', 'safety', 'alignment', 'responsible ai'] },
    { tag: 'Research', keywords: ['paper', 'research', 'arxiv', 'study', 'breakthrough'] },
    { tag: 'Tools & Libraries', keywords: ['library', 'framework', 'tool', 'api', 'sdk'] },
    { tag: 'NLP', keywords: ['nlp', 'natural language', 'text', 'sentiment'] },
  ];

  categories.forEach(({ tag, keywords }) => {
    if (keywords.some(keyword => content.includes(keyword))) {
      tags.push(tag);
    }
  });
  
  if (tags.length === 0) tags.push('AI News');
  
  return tags.slice(0, 3); // Max 3 tags
}

function cleanTitle(title: string): string {
  // Remove common prefixes and clean up
  return title
    .replace(/^(Show HN:|Ask HN:|Tell HN:)/i, '')
    .replace(/\[Research\]/i, '')
    .replace(/\[Paper\]/i, '')
    .trim();
}

function generateSummary(title: string, description: string, source: string): string {
  if (description && description.length > 100) {
    // Use existing description if good quality
    const cleanDesc = description
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n/g, ' ')
      .trim();
    
    if (cleanDesc.length > 80) {
      return cleanDesc.substring(0, 250) + (cleanDesc.length > 250 ? '...' : '');
    }
  }
  
  // Generate based on title and source
  const summaries: { [key: string]: string } = {
    'ArXiv': `Academic research paper exploring ${title.toLowerCase()}. This peer-reviewed work presents new findings that could advance the field of artificial intelligence.`,
    'GitHub Trending': `Popular open-source project gaining traction in the AI community. Developers are actively contributing to this tool/library.`,
    'Hacker News': `Trending discussion in the tech community. This topic has generated significant interest among developers and AI practitioners.`,
    'TechCrunch': `Industry news from a leading tech publication, covering the latest developments in AI technology and business.`,
    'MIT Tech Review': `In-depth analysis from MIT Technology Review, examining the implications and technical details of this AI advancement.`,
    'VentureBeat': `Enterprise AI news covering how this technology impacts businesses and industry adoption.`,
  };
  
  return summaries[source] || `${title}. This development represents a significant update in the AI ecosystem with potential implications for developers and practitioners.`;
}

function generateWhyItMatters(tags: string[], source: string): string {
  const reasons: { [key: string]: string } = {
    'LLMs': 'Large Language Models are transforming software development, content creation, and human-computer interaction. Understanding their capabilities and limitations is crucial for modern developers.',
    'Computer Vision': 'Computer vision breakthroughs enable new applications in healthcare, autonomous systems, and creative tools. These advances are making AI more accessible and powerful.',
    'Robotics': 'Robotics and embodied AI represent the next frontier, bringing AI from digital spaces into the physical world with transformative potential.',
    'Deep Learning': 'Deep learning innovations improve model efficiency, accuracy, and capabilities, making AI more practical for real-world applications.',
    'AI Companies': 'Major AI companies drive industry standards and release tools that shape how millions of developers build AI applications.',
    'AI Ethics': 'Responsible AI development ensures technology benefits everyone. Understanding ethics, safety, and alignment is critical for sustainable innovation.',
    'Research': 'Cutting-edge research pushes the boundaries of what\'s possible, often becoming tomorrow\'s production systems.',
    'Tools & Libraries': 'Developer tools and libraries democratize AI, making advanced techniques accessible to engineers without deep ML expertise.',
    'NLP': 'Natural language processing advances enable better human-computer communication and unlock new use cases in search, summarization, and understanding.',
  };

  const primaryTag = tags[0] || 'AI News';
  return reasons[primaryTag] || 'This development impacts the AI ecosystem and has implications for developers building intelligent systems.';
}

function calculateCredibilityScore(article: RawArticle | ScoredArticle): number {
  const sourceCredibility: { [key: string]: number } = {
    'ArXiv': 10,
    'MIT Tech Review': 10,
    'TechCrunch': 9,
    'VentureBeat': 9,
    'Hacker News': 8,
    'Dev.to': 7,
    'GitHub Trending': 7,
  };
  
  const baseScore = sourceCredibility[article.source] || 6;
  
  // Adjust based on engagement
  const engagementBonus = Math.min(1, article.score / 500);
  
  return Math.min(10, Math.round(baseScore + engagementBonus));
}

// ============= AI ENHANCEMENT (OPTIONAL) =============
export async function enhanceWithAI(articles: AIArticle[]): Promise<AIArticle[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('💡 No OpenAI API key found - using smart fallback summaries');
    return articles;
  }

  console.log('🤖 Enhancing articles with AI...');

  try {
    // Enhance summaries with GPT for better quality
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI news curator for software engineers. Create concise, technical, and insightful summaries. Each summary should be 2-3 sentences, focusing on technical details and practical implications.'
          },
          {
            role: 'user',
            content: `Create brief technical summaries for these AI news articles:\n\n${articles.map((a, i) => `${i + 1}. ${a.title}\nCurrent: ${a.summary}`).join('\n\n')}\n\nProvide improved summaries numbered 1-${articles.length}.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.log('AI enhancement failed, using fallback');
      return articles;
    }

    const data = await response.json();
    const enhancedText = data.choices[0]?.message?.content || '';
    
    // Parse enhanced summaries
    const summaries = enhancedText.split(/\d+\.\s+/).filter((s: string) => s.trim());
    
    return articles.map((article, index) => ({
      ...article,
      summary: summaries[index]?.trim() || article.summary,
    }));
  } catch (error) {
    console.error('Error enhancing with AI:', error);
    return articles;
  }
}
