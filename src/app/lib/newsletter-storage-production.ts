// Production-compatible storage solution using in-memory storage
// This works for Vercel's serverless environment where file system is read-only

export interface AIArticle {
  id: string;
  rank: number;
  title: string;
  summary: string;
  whyItMatters: string;
  url: string;
  imageUrl?: string;
  publishedDate: string;
  references: {
    title: string;
    url: string;
    source: string;
    publishedAt: string;
  }[];
  credibilityScore: number;
  tags: string[];
}

export interface Newsletter {
  id: string;
  edition: number;
  title: string;
  publishedAt: string;
  articles: AIArticle[];
  subscribers: number;
  status: 'draft' | 'published';
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  unsubscribed: boolean;
  interests: string[];
}

// In-memory storage (resets on each serverless function invocation)
// In production, you should use a database like MongoDB, PostgreSQL, or Supabase
let newsletters: Newsletter[] = [];
let subscribers: Subscriber[] = [];

// Newsletter operations
export function getAllNewsletters(): Newsletter[] {
  return newsletters;
}

export function getNewsletterById(id: string): Newsletter | null {
  return newsletters.find(n => n.id === id) || null;
}

export function getNewsletterByEdition(edition: number): Newsletter | null {
  return newsletters.find(n => n.edition === edition) || null;
}

export function saveNewsletter(newsletter: Newsletter): Newsletter {
  const existingIndex = newsletters.findIndex(n => n.id === newsletter.id);
  
  if (existingIndex >= 0) {
    newsletters[existingIndex] = newsletter;
  } else {
    newsletters.push(newsletter);
  }
  
  // Sort by edition descending
  newsletters.sort((a, b) => b.edition - a.edition);
  
  console.log(`📝 Newsletter #${newsletter.edition} saved to memory storage`);
  return newsletter;
}

export function getLatestEditionNumber(): number {
  if (newsletters.length === 0) return 0;
  return Math.max(...newsletters.map(n => n.edition));
}

// Subscriber operations
export function getAllSubscribers(): Subscriber[] {
  return subscribers;
}

export function getActiveSubscribers(): Subscriber[] {
  return subscribers.filter(s => !s.unsubscribed);
}

export function addSubscriber(email: string, interests: string[] = []): Subscriber {
  // Check if already subscribed
  const existing = subscribers.find(s => s.email === email);
  if (existing && !existing.unsubscribed) {
    return existing;
  }
  
  if (existing && existing.unsubscribed) {
    // Resubscribe
    existing.unsubscribed = false;
    existing.subscribedAt = new Date().toISOString();
    return existing;
  }
  
  const newSubscriber: Subscriber = {
    id: Date.now().toString(),
    email,
    subscribedAt: new Date().toISOString(),
    unsubscribed: false,
    interests
  };
  
  subscribers.push(newSubscriber);
  console.log(`📧 New subscriber added: ${email}`);
  return newSubscriber;
}

export function unsubscribe(email: string): boolean {
  const subscriber = subscribers.find(s => s.email === email);
  
  if (!subscriber) return false;
  
  subscriber.unsubscribed = true;
  console.log(`📧 Subscriber unsubscribed: ${email}`);
  return true;
}

// Initialize with some default data for demo purposes
export function initializeDefaultData() {
  if (newsletters.length === 0) {
    // Add some sample newsletters if none exist
    const sampleNewsletter: Newsletter = {
      id: 'sample-1',
      edition: 1,
      title: 'AI Weekly #1: Top 10 Updates',
      publishedAt: new Date().toISOString(),
      articles: [],
      subscribers: 0,
      status: 'published'
    };
    newsletters.push(sampleNewsletter);
  }
  
  if (subscribers.length === 0) {
    // Add some sample subscribers for testing
    const sampleSubscribers: Subscriber[] = [
      {
        id: 'sub-1',
        email: 'yasasvi.nellore@gmail.com',
        subscribedAt: new Date().toISOString(),
        unsubscribed: false,
        interests: ['AI', 'Machine Learning']
      }
    ];
    subscribers.push(...sampleSubscribers);
  }
}

// Call this function to initialize default data
initializeDefaultData();
