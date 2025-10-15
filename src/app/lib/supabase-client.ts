// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
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
