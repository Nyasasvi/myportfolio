// Free storage solution using JSON files
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const NEWSLETTERS_FILE = path.join(DATA_DIR, 'newsletters.json');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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

// Initialize files if they don't exist
function initFile(filePath: string, defaultData: any) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

initFile(NEWSLETTERS_FILE, []);
initFile(SUBSCRIBERS_FILE, []);

// Newsletter operations
export function getAllNewsletters(): Newsletter[] {
  const data = fs.readFileSync(NEWSLETTERS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getNewsletterById(id: string): Newsletter | null {
  const newsletters = getAllNewsletters();
  return newsletters.find(n => n.id === id) || null;
}

export function getNewsletterByEdition(edition: number): Newsletter | null {
  const newsletters = getAllNewsletters();
  return newsletters.find(n => n.edition === edition) || null;
}

export function saveNewsletter(newsletter: Newsletter): Newsletter {
  const newsletters = getAllNewsletters();
  const existingIndex = newsletters.findIndex(n => n.id === newsletter.id);
  
  if (existingIndex >= 0) {
    newsletters[existingIndex] = newsletter;
  } else {
    newsletters.push(newsletter);
  }
  
  // Sort by edition descending
  newsletters.sort((a, b) => b.edition - a.edition);
  
  fs.writeFileSync(NEWSLETTERS_FILE, JSON.stringify(newsletters, null, 2));
  return newsletter;
}

export function getLatestEditionNumber(): number {
  const newsletters = getAllNewsletters();
  if (newsletters.length === 0) return 0;
  return Math.max(...newsletters.map(n => n.edition));
}

// Subscriber operations
export function getAllSubscribers(): Subscriber[] {
  const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getActiveSubscribers(): Subscriber[] {
  return getAllSubscribers().filter(s => !s.unsubscribed);
}

export function addSubscriber(email: string, interests: string[] = []): Subscriber {
  const subscribers = getAllSubscribers();
  
  // Check if already subscribed
  const existing = subscribers.find(s => s.email === email);
  if (existing && !existing.unsubscribed) {
    return existing;
  }
  
  if (existing && existing.unsubscribed) {
    // Resubscribe
    existing.unsubscribed = false;
    existing.subscribedAt = new Date().toISOString();
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
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
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
  return newSubscriber;
}

export function unsubscribe(email: string): boolean {
  const subscribers = getAllSubscribers();
  const subscriber = subscribers.find(s => s.email === email);
  
  if (!subscriber) return false;
  
  subscriber.unsubscribed = true;
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
  return true;
}

