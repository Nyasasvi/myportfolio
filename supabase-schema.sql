-- Supabase Database Schema for Newsletter System
-- Run this in your Supabase SQL Editor

-- Create newsletters table
CREATE TABLE IF NOT EXISTS newsletters (
  id TEXT PRIMARY KEY,
  edition INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  articles JSONB NOT NULL DEFAULT '[]',
  subscribers INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  unsubscribed BOOLEAN NOT NULL DEFAULT FALSE,
  interests TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_newsletters_edition ON newsletters(edition);
CREATE INDEX IF NOT EXISTS idx_newsletters_published_at ON newsletters(published_at);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_unsubscribed ON subscribers(unsubscribed);

-- Enable Row Level Security (RLS)
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access to newsletters" ON newsletters
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to subscribers" ON subscribers
  FOR SELECT USING (true);

-- Create policies for insert/update (you may want to restrict these)
CREATE POLICY "Allow insert newsletters" ON newsletters
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update newsletters" ON newsletters
  FOR UPDATE USING (true);

CREATE POLICY "Allow insert subscribers" ON subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update subscribers" ON subscribers
  FOR UPDATE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_newsletters_updated_at 
  BEFORE UPDATE ON newsletters 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at 
  BEFORE UPDATE ON subscribers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
