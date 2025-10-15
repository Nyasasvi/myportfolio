import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  postedDate: Date;
  matchScore?: number;
  source?: string;
}

interface JobFilters {
  keywords?: string;
  location?: string;
  remote?: boolean;
  jobType?: string; // 'full_time' | 'part_time' | 'contract' | 'permanent'
  experienceLevel?: string; // 'entry' | 'mid' | 'senior' | 'lead'
  salaryMin?: number;
  maxDaysOld?: number;
  minMatchPercentage?: number; // Minimum match percentage (default: 80)
}

interface ScraperRequest {
  email: string;
  resume: string;
  filters?: JobFilters;
}

// Build Adzuna API URL with filters
function buildAdzunaUrl(appId: string, apiKey: string, filters: JobFilters): string {
  const baseUrl = 'https://api.adzuna.com/v1/api/jobs/us/search/1';
  const params = new URLSearchParams({
    app_id: appId,
    app_key: apiKey,
    results_per_page: '100', // Increased to get more results
    'content-type': 'application/json',
  });
  
  // Keywords with experience level
  let searchQuery = filters.keywords || 'software engineer developer';
  
  // Add experience level to search query
  if (filters.experienceLevel) {
    const levelMap: Record<string, string> = {
      'entry': 'junior entry level',
      'mid': 'mid-level',
      'senior': 'senior',
      'lead': 'lead principal staff'
    };
    searchQuery = `${levelMap[filters.experienceLevel]} ${searchQuery}`;
  }
  
  // Add remote keyword if selected
  if (filters.remote) {
    searchQuery = `${searchQuery} remote`;
  }
  
  params.append('what', searchQuery);
  
  // Location
  if (filters.location && filters.location.trim()) {
    params.append('where', filters.location);
  }
  
  // Max days old (default to 1 day, but allow customization)
  params.append('max_days_old', (filters.maxDaysOld || 1).toString());
  
  // Job type filtering
  if (filters.jobType) {
    // Adzuna supports: full_time, part_time, contract, permanent
    if (filters.jobType === 'full_time') {
      params.append('full_time', '1');
    } else if (filters.jobType === 'part_time') {
      params.append('part_time', '1');
    } else if (filters.jobType === 'contract') {
      params.append('contract', '1');
    } else if (filters.jobType === 'permanent') {
      params.append('permanent', '1');
    }
  }
  
  // Salary minimum
  if (filters.salaryMin && filters.salaryMin > 0) {
    params.append('salary_min', filters.salaryMin.toString());
  }
  
  const url = `${baseUrl}?${params.toString()}`;
  console.log(`🔍 Adzuna API URL: ${url.replace(apiKey, 'REDACTED')}`);
  
  return url;
}

// Scrape jobs from Adzuna API
async function scrapeAdzunaJobs(filters: JobFilters): Promise<Job[]> {
  const adzunaAppId = process.env.ADZUNA_APP_ID;
  const adzunaApiKey = process.env.ADZUNA_API_KEY;
  
  if (!adzunaAppId || !adzunaApiKey) {
    console.log('⚠️ Adzuna API credentials not found');
    return [];
  }
  
  try {
    console.log('🔍 Fetching jobs from Adzuna API...');
    const apiUrl = buildAdzunaUrl(adzunaAppId, adzunaApiKey, filters);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      const jobs = data.results?.map((job: any) => ({
        id: `adzuna-${job.id}`,
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        description: job.description,
        url: job.redirect_url,
        postedDate: new Date(job.created),
        source: 'Adzuna'
      })) || [];
      
      console.log(`✅ Scraped ${jobs.length} jobs from Adzuna`);
      return jobs;
    } else {
      console.error(`❌ Adzuna API error: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching from Adzuna:', error);
    return [];
  }
}

// Scrape jobs from RemoteOK API (free, no auth required)
async function scrapeRemoteOKJobs(filters: JobFilters): Promise<Job[]> {
  try {
    console.log('🔍 Fetching jobs from RemoteOK API...');
    
    const response = await fetch('https://remoteok.com/api', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      const jobs = data.slice(1) // Remove first element (metadata)
        .filter((job: any) => {
          // Filter by date (last 30 days max)
          const jobDate = new Date(job.date);
          const maxDate = new Date(Date.now() - (filters.maxDaysOld || 1) * 24 * 60 * 60 * 1000);
          return jobDate >= maxDate;
        })
        .filter((job: any) => {
          // Filter by keywords if provided
          if (!filters.keywords) return true;
          const text = `${job.position} ${job.company} ${job.description}`.toLowerCase();
          return filters.keywords.toLowerCase().split(' ').some(keyword => 
            text.includes(keyword.trim())
          );
        })
        .map((job: any) => ({
          id: `remoteok-${job.id}`,
          title: job.position,
          company: job.company,
          location: 'Remote',
          description: job.description || 'Remote position',
          url: `https://remoteok.com/remote-jobs/${job.id}`,
          postedDate: new Date(job.date),
          source: 'RemoteOK'
        }));
      
      console.log(`✅ Scraped ${jobs.length} jobs from RemoteOK`);
      return jobs;
    } else {
      console.error(`❌ RemoteOK API error: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching from RemoteOK:', error);
    return [];
  }
}

// Scrape jobs from GitHub Jobs (deprecated but still has data)
async function scrapeGitHubJobs(filters: JobFilters): Promise<Job[]> {
  try {
    console.log('🔍 Fetching jobs from GitHub Jobs...');
    
    const params = new URLSearchParams();
    if (filters.keywords) params.append('description', filters.keywords);
    if (filters.location) params.append('location', filters.location);
    
    const response = await fetch(`https://jobs.github.com/positions.json?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      const jobs = data
        .filter((job: any) => {
          // Filter by date
          const jobDate = new Date(job.created_at);
          const maxDate = new Date(Date.now() - (filters.maxDaysOld || 1) * 24 * 60 * 60 * 1000);
          return jobDate >= maxDate;
        })
        .map((job: any) => ({
          id: `github-${job.id}`,
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description.replace(/<[^>]*>/g, ''), // Strip HTML
          url: job.url,
          postedDate: new Date(job.created_at),
          source: 'GitHub Jobs'
        }));
      
      console.log(`✅ Scraped ${jobs.length} jobs from GitHub Jobs`);
      return jobs;
    } else {
      console.error(`❌ GitHub Jobs API error: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching from GitHub Jobs:', error);
    return [];
  }
}

// Scrape jobs from TheMuse API
async function scrapeTheMuseJobs(filters: JobFilters): Promise<Job[]> {
  try {
    console.log('🔍 Fetching jobs from TheMuse API...');
    
    const params = new URLSearchParams();
    params.append('page', '0');
    if (filters.keywords) params.append('category', filters.keywords);
    if (filters.location) params.append('location', filters.location);
    
    const response = await fetch(`https://www.themuse.com/api/public/jobs?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      const jobs = data.results
        .filter((job: any) => {
          // Filter by date
          const jobDate = new Date(job.publication_date);
          const maxDate = new Date(Date.now() - (filters.maxDaysOld || 1) * 24 * 60 * 60 * 1000);
          return jobDate >= maxDate;
        })
        .map((job: any) => ({
          id: `themuse-${job.id}`,
          title: job.name,
          company: job.company.name,
          location: job.locations[0]?.name || 'Not specified',
          description: job.contents || 'Job description not available',
          url: job.refs.landing_page,
          postedDate: new Date(job.publication_date),
          source: 'TheMuse'
        }));
      
      console.log(`✅ Scraped ${jobs.length} jobs from TheMuse`);
      return jobs;
    } else {
      console.error(`❌ TheMuse API error: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching from TheMuse:', error);
    return [];
  }
}

// Scrape jobs from Y Combinator Work At A Startup
async function scrapeYCombinatorJobs(filters: JobFilters): Promise<Job[]> {
  try {
    console.log('🔍 Fetching jobs from Y Combinator...');
    
    // Use YC's Work at a Startup JSON endpoint
    const response = await fetch('https://www.workatastartup.com/jobs.json', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'JobMatchPortfolio/1.0'
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      
      const jobs = data
        .filter((job: any) => {
          // Filter by keywords if provided
          if (!filters.keywords) return true;
          const searchText = `${job.title} ${job.description} ${job.company}`.toLowerCase();
          return filters.keywords.toLowerCase().split(' ').some(keyword => 
            searchText.includes(keyword.trim())
          );
        })
        .filter((job: any) => {
          // Filter by remote if specified
          if (filters.remote) {
            return job.remote === true || job.location?.toLowerCase().includes('remote');
          }
          return true;
        })
        .filter((job: any) => {
          // Filter by date if available
          if (job.posted_at) {
            const jobDate = new Date(job.posted_at);
            const maxDate = new Date(Date.now() - (filters.maxDaysOld || 30) * 24 * 60 * 60 * 1000);
            return jobDate >= maxDate;
          }
          return true;
        })
        .slice(0, 100) // Limit to 100 jobs
        .map((job: any) => ({
          id: `yc-${job.id}`,
          title: job.title,
          company: job.company?.name || job.company || 'YC Startup',
          location: job.location || 'Remote / YC Startup',
          description: job.description || `Join a Y Combinator startup. ${job.company?.oneLiner || ''}`,
          url: job.url || `https://www.workatastartup.com/jobs/${job.id}`,
          postedDate: job.posted_at ? new Date(job.posted_at) : new Date(),
          source: 'Y Combinator'
        }));
      
      console.log(`✅ Scraped ${jobs.length} jobs from Y Combinator`);
      return jobs;
    } else {
      console.error(`❌ Y Combinator API error: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching from Y Combinator:', error);
    return [];
  }
}

// Scrape jobs from Hacker News (YC's monthly "Who's Hiring" threads)
async function scrapeHackerNewsJobs(filters: JobFilters): Promise<Job[]> {
  try {
    console.log('🔍 Fetching jobs from Hacker News...');
    
    // Get job stories from Hacker News API
    const response = await fetch('https://hacker-news.firebaseio.com/v0/jobstories.json', {
      method: 'GET',
    });
    
    if (response.ok) {
      const jobIds = await response.json();
      
      // Get the latest 30 job postings (reduced for speed)
      const jobPromises = jobIds.slice(0, 30).map(async (id: number) => {
        try {
          const jobResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          return jobResponse.json();
        } catch {
          return null;
        }
      });
      
      const jobItems = await Promise.all(jobPromises);
      
      const jobs = jobItems
        .filter((item: any) => item && item.title)
        .filter((item: any) => {
          // Filter by keywords if provided
          if (!filters.keywords) return true;
          const text = `${item.title} ${item.text || ''}`.toLowerCase();
          return filters.keywords.toLowerCase().split(' ').some(keyword => 
            text.includes(keyword.trim())
          );
        })
        .filter((item: any) => {
          // Filter by date
          const jobDate = new Date(item.time * 1000);
          const maxDate = new Date(Date.now() - (filters.maxDaysOld || 30) * 24 * 60 * 60 * 1000);
          return jobDate >= maxDate;
        })
        .map((item: any) => {
          const company = extractCompanyFromHN(item.title);
          const description = item.text ? item.text.replace(/<[^>]*>/g, '').substring(0, 500) : item.title;
          
          return {
            id: `hn-${item.id}`,
            title: item.title,
            company: company,
            location: extractLocationFromHN(item.text || item.title) || 'See posting',
            description: description,
            url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
            postedDate: new Date(item.time * 1000),
            source: 'Hacker News'
          };
        });
      
      console.log(`✅ Scraped ${jobs.length} jobs from Hacker News`);
      return jobs;
    } else {
      console.error(`❌ Hacker News API error: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching from Hacker News:', error);
    return [];
  }
}

// Helper function to extract company name from HN job title
function extractCompanyFromHN(title: string): string {
  // Titles are usually like "Company Name (YC W21) is hiring..." or "Company is hiring..."
  const patterns = [
    /^([^(]+)\s*\(/,  // "Company (YC W21)"
    /^([^-]+)\s*-/,   // "Company - Job Title"
    /^(.+?)\s+(?:is hiring|hiring|seeks)/i,  // "Company is hiring"
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  // If no pattern matches, return first 3 words
  const words = title.split(' ').slice(0, 3).join(' ');
  return words || 'Startup';
}

// Helper function to extract location from HN job text
function extractLocationFromHN(text: string): string | null {
  if (!text) return null;
  
  // Look for common location patterns
  const patterns = [
    /(?:location|based in|located in|office in)[:\s]+([^<.\n,]+)/i,
    /\b(remote|onsite|hybrid)\b/i,
    /\b([A-Z][a-z]+,\s*[A-Z]{2})\b/, // "City, ST"
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
}

// Scrape jobs from JSearch API (RapidAPI - Google Jobs aggregator)
async function scrapeJSearchJobs(filters: JobFilters): Promise<Job[]> {
  const apiKey = process.env.RAPID_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️ RapidAPI key not found, skipping JSearch');
    return [];
  }
  
  try {
    console.log('🔍 Fetching jobs from JSearch (Google Jobs)...');
    
    const query = filters.keywords || 'software engineer';
    const location = filters.location || 'United States';
    const daysOld = filters.maxDaysOld || 7;
    
    // Map days to JSearch date filter
    let datePosted = 'month';
    if (daysOld <= 1) datePosted = 'today';
    else if (daysOld <= 3) datePosted = '3days';
    else if (daysOld <= 7) datePosted = 'week';
    
    const searchQuery = `${query} in ${location}`;
    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&page=1&num_pages=1&date_posted=${datePosted}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (!data.data || data.data.length === 0) {
        console.log('⚠️ JSearch returned no results');
        return [];
      }
      
      const jobs = data.data
        .filter((job: any) => job.job_title && job.employer_name)
        .map((job: any) => ({
          id: `jsearch-${job.job_id}`,
          title: job.job_title,
          company: job.employer_name,
          location: job.job_city && job.job_state 
            ? `${job.job_city}, ${job.job_state}` 
            : job.job_country || 'Location not specified',
          description: job.job_description || job.job_highlights?.Qualifications?.join(', ') || 'See job posting for details',
          url: job.job_apply_link || job.job_google_link,
          postedDate: job.job_posted_at_datetime_utc 
            ? new Date(job.job_posted_at_datetime_utc) 
            : new Date(),
          source: `Google Jobs via ${job.job_publisher || 'JSearch'}`
        }));
      
      console.log(`✅ Scraped ${jobs.length} jobs from JSearch (Google Jobs)`);
      return jobs;
    } else {
      console.error(`❌ JSearch API error: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching from JSearch:', error);
    return [];
  }
}

// Scrape jobs from Remotive API (Remote jobs)
async function scrapeRemotiveJobs(filters: JobFilters): Promise<Job[]> {
  try {
    console.log('🔍 Fetching jobs from Remotive API...');
    
    const response = await fetch('https://remotive.com/api/remote-jobs', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'JobMatchPortfolio/1.0'
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      
      const jobs = data.jobs
        .filter((job: any) => {
          // Filter by date
          const jobDate = new Date(job.publication_date);
          const maxDate = new Date(Date.now() - (filters.maxDaysOld || 7) * 24 * 60 * 60 * 1000);
          return jobDate >= maxDate;
        })
        .filter((job: any) => {
          // Filter by keywords if provided
          if (!filters.keywords) return true;
          const text = `${job.title} ${job.company_name} ${job.description} ${job.category}`.toLowerCase();
          return filters.keywords.toLowerCase().split(' ').some(keyword => 
            text.includes(keyword.trim())
          );
        })
        .map((job: any) => ({
          id: `remotive-${job.id}`,
          title: job.title,
          company: job.company_name,
          location: 'Remote',
          description: job.description || `${job.category} position at ${job.company_name}`,
          url: job.url,
          postedDate: new Date(job.publication_date),
          source: 'Remotive'
        }));
      
      console.log(`✅ Scraped ${jobs.length} jobs from Remotive`);
      return jobs;
    } else {
      console.error(`❌ Remotive API error: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching from Remotive:', error);
    return [];
  }
}

// Scrape jobs from Indeed RSS feeds
async function scrapeIndeedRSS(filters: JobFilters): Promise<Job[]> {
  try {
    console.log('🔍 Fetching jobs from Indeed RSS...');
    
    const query = encodeURIComponent(filters.keywords || 'software engineer');
    const location = encodeURIComponent(filters.location || '');
    
    // Indeed RSS URL format
    const rssUrl = `https://www.indeed.com/rss?q=${query}${location ? `&l=${location}` : ''}&limit=50`;
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      const xmlText = await response.text();
      
      // Parse RSS XML manually
      const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
      
      const jobs = items
        .map((item: string) => {
          const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || '';
          const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
          const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || '';
          const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
          
          // Extract company and location from title
          // Indeed format: "Job Title - Company Name - Location"
          const titleParts = title.split(' - ');
          const jobTitle = titleParts[0]?.trim() || title;
          const company = titleParts[1]?.trim() || 'Company not specified';
          const locationStr = titleParts[2]?.trim() || filters.location || 'See posting';
          
          return {
            id: `indeed-${link.split('jk=')[1]?.split('&')[0] || Date.now()}`,
            title: jobTitle,
            company: company,
            location: locationStr,
            description: description.replace(/<[^>]*>/g, '').substring(0, 500),
            url: link,
            postedDate: pubDate ? new Date(pubDate) : new Date(),
            source: 'Indeed'
          };
        })
        .filter((job: any) => {
          // Filter by date
          const jobDate = new Date(job.postedDate);
          const maxDate = new Date(Date.now() - (filters.maxDaysOld || 7) * 24 * 60 * 60 * 1000);
          return jobDate >= maxDate && job.title && job.url;
        });
      
      console.log(`✅ Scraped ${jobs.length} jobs from Indeed RSS`);
      return jobs;
    } else {
      console.error(`❌ Indeed RSS error: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching from Indeed RSS:', error);
    return [];
  }
}

// Main function to scrape jobs from multiple sources
async function scrapeJobs(filters: JobFilters = {}): Promise<Job[]> {
  console.log('🚀 Starting multi-source job scraping...');
  
  // Run all scrapers in parallel for better performance
  const scrapingPromises = [
    scrapeAdzunaJobs(filters),
    scrapeJSearchJobs(filters),
    scrapeRemotiveJobs(filters),
    scrapeIndeedRSS(filters),
    scrapeRemoteOKJobs(filters),
    scrapeGitHubJobs(filters),
    scrapeTheMuseJobs(filters),
    scrapeYCombinatorJobs(filters),
    scrapeHackerNewsJobs(filters),
  ];
  
  try {
    const results = await Promise.allSettled(scrapingPromises);
    
    // Combine all successful results
    let allJobs: Job[] = [];
    let totalScraped = 0;
    let successfulSources = 0;
    
    results.forEach((result, index) => {
      const sourceNames = [
        'Adzuna (LinkedIn, Indeed, Monster)', 
        'JSearch (Google Jobs)', 
        'Remotive', 
        'Indeed RSS',
        'RemoteOK', 
        'GitHub Jobs', 
        'TheMuse', 
        'Y Combinator', 
        'Hacker News'
      ];
      
      if (result.status === 'fulfilled') {
        allJobs.push(...result.value);
        totalScraped += result.value.length;
        successfulSources++;
        console.log(`✅ ${sourceNames[index]}: ${result.value.length} jobs`);
      } else {
        console.log(`❌ ${sourceNames[index]}: Failed - ${result.reason}`);
      }
    });
    
    // Remove duplicates based on title and company
    const uniqueJobs = allJobs.filter((job, index, self) => 
      index === self.findIndex(j => 
        j.title.toLowerCase() === job.title.toLowerCase() && 
        j.company.toLowerCase() === job.company.toLowerCase()
      )
    );
    
    console.log(`🎯 Total: ${totalScraped} jobs scraped, ${uniqueJobs.length} unique jobs from ${successfulSources} sources`);
    
    if (uniqueJobs.length === 0) {
      console.log('⚠️ No jobs found from any source with current filters.');
      return [];
    }
    
    return uniqueJobs;
    
  } catch (error) {
    console.error('❌ Error in multi-source scraping:', error);
    return [];
  }
}

// Mock data removed - system now only returns real jobs from APIs

// Analyze job match using AI
async function analyzeJobMatch(jobDescription: string, resume: string): Promise<number> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️ No OpenAI API key - using keyword matching');
    return performBasicMatching(jobDescription, resume);
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a recruitment expert. Analyze the match between a job description and a candidate's resume. 
            Return ONLY a number between 0-100 representing the match percentage. Consider skills, experience, and requirements.`
          },
          {
            role: 'user',
            content: `Job Description:\n${jobDescription}\n\nResume:\n${resume}\n\nMatch Score (0-100):`
          }
        ],
        temperature: 0.3,
        max_tokens: 10,
      }),
    });
    
    if (!response.ok) {
      throw new Error('OpenAI API error');
    }
    
    const data = await response.json();
    const scoreText = data.choices[0]?.message?.content?.trim() || '0';
    const score = parseInt(scoreText.replace(/[^0-9]/g, '')) || 0;
    
    return Math.min(100, Math.max(0, score));
    
  } catch (error) {
    console.error('Error analyzing job match:', error);
    return performBasicMatching(jobDescription, resume);
  }
}

// Basic keyword-based matching fallback
function performBasicMatching(jobDescription: string, resume: string): number {
  const jdLower = jobDescription.toLowerCase();
  const resumeLower = resume.toLowerCase();
  
  // Extract common tech keywords
  const keywords = [
    'react', 'node', 'python', 'java', 'javascript', 'typescript',
    'aws', 'docker', 'kubernetes', 'sql', 'mongodb', 'postgresql',
    'api', 'rest', 'graphql', 'microservices', 'agile', 'git',
    'machine learning', 'ai', 'tensorflow', 'pytorch', 'spring boot'
  ];
  
  let matches = 0;
  let total = 0;
  
  keywords.forEach(keyword => {
    if (jdLower.includes(keyword)) {
      total++;
      if (resumeLower.includes(keyword)) {
        matches++;
      }
    }
  });
  
  return total > 0 ? Math.round((matches / total) * 100) : 50;
}

// Send email with job matches
async function sendJobMatchEmail(
  email: string,
  matchedJobs: Job[],
  resume: string,
  matchThreshold: number = 80
): Promise<boolean> {
  try {
    // Configure email transport (supports both EMAIL_* and SMTP_* env variables)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or use SMTP settings
      auth: {
        user: process.env.EMAIL_USER || process.env.SMTP_USER,
        pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASS, // Use app-specific password for Gmail
      },
    });
    
    // Generate HTML email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .job-card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; background: #fff; }
          .job-title { font-size: 20px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
          .company { font-size: 16px; color: #666; margin-bottom: 5px; }
          .location { color: #999; font-size: 14px; margin-bottom: 10px; }
          .source { color: #666; font-size: 12px; margin-bottom: 10px; font-style: italic; }
          .match-score { display: inline-block; background: #10b981; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          .match-score.high { background: #10b981; }
          .match-score.medium { background: #3b82f6; }
          .description { color: #555; margin: 15px 0; line-height: 1.8; }
          .apply-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 40px; padding: 20px; color: #999; font-size: 14px; }
          .stats { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${matchThreshold >= 80 ? '🎯' : '📋'} Your Job Matches Are Ready!</h1>
            <p>${matchThreshold >= 80 
              ? `We found ${matchedJobs.length} high-quality jobs matching your profile with 80%+ compatibility`
              : `We found ${matchedJobs.length} decent matches with 30%+ compatibility (no 80%+ matches available)`}
            </p>
          </div>
          
          <div class="stats">
            <h3>📊 Search Summary</h3>
            <p><strong>Total Matches Found:</strong> ${matchedJobs.length}</p>
            <p><strong>Match Quality:</strong> ${matchThreshold >= 80 ? 'High (80%+)' : 'Medium (30%+)'}</p>
            ${matchThreshold < 80 ? '<p><strong>Note:</strong> These jobs have some skill overlap but may require additional learning</p>' : ''}
          </div>
          
          ${matchedJobs.map(job => `
            <div class="job-card">
              <div class="job-title">${job.title}</div>
              <div class="company">🏢 ${job.company}</div>
              <div class="location">📍 ${job.location}</div>
              ${job.source ? `<div class="source">🔗 Source: ${job.source}</div>` : ''}
              <div class="match-score ${job.matchScore && job.matchScore >= 80 ? 'high' : 'medium'}">
                ${job.matchScore}% Match
              </div>
              <div class="description">
                ${job.description.substring(0, 300)}${job.description.length > 300 ? '...' : ''}
              </div>
              <a href="${job.url}" class="apply-button" style="color: white;">View Job & Apply →</a>
            </div>
          `).join('')}
          
          <div class="footer">
            ${matchThreshold < 80 
              ? '<p>💡 <strong>Note:</strong> These matches are 30%+ compatible. Consider learning missing skills to increase your match rate!</p>'
              : '<p>💡 <strong>Pro Tip:</strong> Customize your resume for each application to highlight relevant skills!</p>'}
            <p>This email was sent by your Portfolio Job Matcher</p>
            <p>© ${new Date().getFullYear()} - All rights reserved</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@jobmatcher.com',
      to: email,
      subject: `🎯 ${matchedJobs.length} Job Matches Found - ${new Date().toLocaleDateString()}`,
      html: emailHtml,
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}`);
    return true;
    
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    const body: ScraperRequest = await request.json();
    const { email, resume, filters } = body;
    
    // Validate input
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }
    
    if (!resume || resume.length < 100) {
      return NextResponse.json(
        { error: 'Please provide a complete resume (minimum 100 characters)' },
        { status: 400 }
      );
    }
    
    console.log(`🔍 Starting job search for ${email} with filters:`, filters);
    
    // Step 1: Scrape jobs from various sources with filters
    const allJobs = await scrapeJobs(filters || {});
    console.log(`📥 Found ${allJobs.length} total jobs`);
    
    // Check if any jobs were found
    if (allJobs.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No jobs found from any source. Your search filters are too narrow.',
        totalJobsScraped: 0,
        recentJobs: 0,
        suggestions: [
          'Use broader keywords (e.g., "engineer" instead of "junior entry level AI engineer")',
          'Increase "Posted Within" to 7-30 days (currently: ' + (filters.maxDaysOld || 1) + ' days)',
          'Remove experience level filter',
          'Try "AI" or "machine learning" instead of very specific terms',
          'RemoteOK and GitHub Jobs APIs may have limited recent jobs',
        ],
      }, { status: 200 });
    }
    
    // Step 2: Filter jobs from past 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentJobs = allJobs.filter(job => job.postedDate >= oneDayAgo);
    console.log(`⏰ ${recentJobs.length} jobs posted in the last 24 hours`);
    
    // Check if any recent jobs were found
    if (recentJobs.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Found ${allJobs.length} jobs total, but none posted in the last 24 hours. Try increasing the "Posted Within" time range to see more jobs.`,
        totalJobsScraped: allJobs.length,
        recentJobs: 0,
        suggestions: [
          'Increase "Posted Within" to 3-7 days to see more jobs',
          'Many job boards don\'t post new jobs every single day',
          'Try broader search terms to find more opportunities',
        ],
      }, { status: 200 });
    }
    
    // Step 3: Analyze each job and calculate match score
    const jobsWithScores = await Promise.all(
      recentJobs.map(async (job) => {
        const matchScore = await analyzeJobMatch(job.description, resume);
        return { ...job, matchScore };
      })
    );
    
    // Step 4: Filter jobs based on user's minimum match percentage (default: 80%)
    const minMatchPercentage = filters.minMatchPercentage || 80;
    const fallbackPercentage = Math.max(30, Math.floor(minMatchPercentage / 2)); // Fallback is half of min, but at least 30%
    
    const primaryMatches = jobsWithScores
      .filter(job => job.matchScore && job.matchScore >= minMatchPercentage)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    
    console.log(`✨ ${primaryMatches.length} jobs with ${minMatchPercentage}%+ match`);
    
    // Step 5: If no matches at requested threshold, try fallback percentage
    let finalMatches = primaryMatches;
    let matchThreshold = minMatchPercentage;
    let matchMessage = `Found ${primaryMatches.length} jobs with ${minMatchPercentage}%+ compatibility`;
    
    if (primaryMatches.length === 0) {
      console.log(`⚠️ No ${minMatchPercentage}%+ matches found. Searching for ${fallbackPercentage}%+ matches as fallback...`);
      
      const fallbackMatches = jobsWithScores
        .filter(job => job.matchScore && job.matchScore >= fallbackPercentage)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      
      console.log(`📋 Found ${fallbackMatches.length} jobs with ${fallbackPercentage}%+ match`);
      
      if (fallbackMatches.length > 0) {
        finalMatches = fallbackMatches;
        matchThreshold = fallbackPercentage;
        matchMessage = `No ${minMatchPercentage}%+ matches found, but found ${fallbackMatches.length} jobs with ${fallbackPercentage}%+ compatibility. These jobs have some overlap with your skills but may require additional learning.`;
      } else {
        // Still no matches even at fallback percentage
        return NextResponse.json({
          success: false,
          message: `No jobs found with ${fallbackPercentage}%+ match. Try lowering your minimum match percentage or broadening your search criteria.`,
          totalJobsScraped: allJobs.length,
          recentJobs: recentJobs.length,
          suggestions: [
            `Lower minimum match percentage to ${Math.max(30, minMatchPercentage - 20)}%`,
            'Try broader keywords (e.g., "developer" instead of specific technologies)',
            'Increase "Posted Within" to 3-7 days',
            'Remove location filter',
            'Remove salary filter',
            'Try different experience level'
          ]
        }, { status: 200 });
      }
    }
    
    // Step 6: Send email with matches
    const emailSent = await sendJobMatchEmail(email, finalMatches, resume, matchThreshold);
    
    if (!emailSent) {
      // If email fails, still return the results
      return NextResponse.json({
        success: true,
        emailSent: false,
        message: 'Jobs found but email could not be sent. Please check your email configuration.',
        matchedJobs: finalMatches,
        matchThreshold,
        stats: {
          totalScraped: allJobs.length,
          recentJobs: recentJobs.length,
          highMatches: finalMatches.length,
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      emailSent: true,
      message: matchMessage + ` Results sent to ${email}!`,
      matchedJobs: finalMatches,
      matchThreshold,
      stats: {
        totalScraped: allJobs.length,
        recentJobs: recentJobs.length,
        highMatches: finalMatches.length,
      }
    });
    
  } catch (error) {
    console.error('Job scraper API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process job search',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

