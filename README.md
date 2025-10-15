# My Portfolio

A modern, AI-powered portfolio website built with Next.js 14, featuring advanced job matching and automated job discovery capabilities.

## 🌟 Features

### 📰 AI-Powered Newsletter (NEW!)
Curated AI news from 6 trusted sources:
- **Hacker News** - Top tech community discussions
- **Dev.to** - Quality developer articles  
- **NewsAPI** - TechCrunch, Wired, MIT Tech Review (optional)
- **ArXiv** - Latest AI research papers
- **GitHub Trending** - Popular AI projects
- **RSS Feeds** - VentureBeat, TechCrunch, MIT Tech Review
- **Smart ranking** - Quality, relevance, and recency scoring
- **Auto-generation** - Weekly curated top 10 AI updates
- **Email delivery** - Subscribers get beautifully formatted newsletters

### 📊 Job Match Analyzer
Analyze your compatibility with any job posting using AI:
- Compare your skills against job requirements
- Get detailed gap analysis and recommendations
- View personalized learning paths
- Support for custom resumes or default profile

### 🔍 Automated Job Finder
AI-powered job discovery and matching:
- **Auto-scrapes job boards** for positions posted recently (customizable time range)
- **AI analyzes each job** against your resume
- **Filters to 80%+ matches** - only the best opportunities
- **Email delivery** - all matching jobs sent directly to your inbox
- **Real-time analysis** with detailed compatibility scores

### 🎨 Modern UI/UX
- Beautiful, responsive design with dark/light theme support
- Smooth animations and transitions
- Interactive 3D elements
- Particle effects and dynamic backgrounds

### 🤖 AI Chatbot
Intelligent assistant to answer questions about your experience and skills.

### 📧 Contact Form
Direct communication with integrated email functionality.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key (for AI features)
- Gmail account (for email features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd myportfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Required for AI features
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Required for email features
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_gmail_app_password
   
   # Optional: Enhanced newsletter with premium sources (free tier: 100 requests/day)
   NEWS_API_KEY=your_newsapi_key_here
   
   # Optional: For enhanced job scraping (7 sources work without these)
   RAPID_API_KEY=your_rapidapi_key_here    # JSearch - 150 req/month free
   ADZUNA_APP_ID=your_adzuna_app_id        # Adzuna - 1000 req/month free
   ADZUNA_API_KEY=your_adzuna_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration Guide

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or log in
3. Generate a new API key
4. Add to `.env.local`

### Gmail App Password
1. Enable 2-Step Verification in your Google Account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail"
4. Use this password in `.env.local` (remove spaces)

### NewsAPI (Optional - For Premium Newsletter Sources)
1. Sign up at [NewsAPI.org](https://newsapi.org/register)
2. Get your free API key (100 requests/day)
3. Add to `.env.local` as `NEWS_API_KEY`
4. Newsletter will now include articles from TechCrunch, Wired, MIT Tech Review, etc.

**Note:** The newsletter works great without this! It uses 5 other free sources (Hacker News, Dev.to, ArXiv, GitHub, RSS feeds).

### RapidAPI - JSearch (Optional - For Google Jobs Access)
1. Sign up at [RapidAPI.com](https://rapidapi.com/)
2. Subscribe to [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) (Free plan)
3. Copy your RapidAPI key
4. Add to `.env.local` as `RAPID_API_KEY`
5. You'll now get jobs from Google Jobs (includes LinkedIn, Indeed, Glassdoor)

**Note:** Free tier gives 150 requests/month. The job scraper works great with 7 free sources even without this!

### Adzuna API (Optional - For Additional Job Aggregation)
1. Sign up at [Adzuna Developer Portal](https://developer.adzuna.com/)
2. Create an application
3. Copy App ID and API Key
4. Add to `.env.local`
5. You'll now get jobs from LinkedIn, Indeed, Monster, CareerBuilder via Adzuna

**Note:** Free tier gives 1000 requests/month.

For detailed setup instructions, see [JOB_SCRAPER_SETUP.md](./JOB_SCRAPER_SETUP.md)

## 📖 Usage

### Job Match Analyzer
1. Navigate to the "Job Match" page
2. Choose "Analyze Single Job" tab
3. Paste a job description
4. Optionally provide your own resume
5. Click "Analyze Match" to get instant AI-powered insights

### Automated Job Finder
1. Navigate to the "Job Match" page
2. Choose "Find Matching Jobs" tab
3. Enter your email address
4. Paste your complete resume
5. Click "Find Matching Jobs"
6. Wait for analysis (10-30 seconds)
7. Check your email for curated job matches!

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: SCSS with custom design system
- **AI**: OpenAI GPT-4o-mini
- **Email**: Nodemailer
- **3D Graphics**: Three.js, React Three Fiber
- **Animations**: Framer Motion
- **Icons**: React Icons

## 📁 Project Structure

```
myportfolio/
├── src/
│   ├── app/
│   │   ├── about/          # About page
│   │   ├── api/            # API routes
│   │   │   ├── chatbot/    # AI chatbot endpoint
│   │   │   ├── contact/    # Contact form endpoint
│   │   │   └── job-match/  # Job matching endpoint
│   │   │   └── job-scraper/# Job scraping endpoint (NEW)
│   │   ├── components/     # Reusable components
│   │   ├── contact/        # Contact page
│   │   ├── job-match/      # Job matching pages
│   │   ├── projects/       # Projects showcase
│   │   ├── skills/         # Skills page
│   │   └── resources/      # Constants and data
│   └── once-ui/            # Custom UI component library
├── public/                 # Static assets
└── ...config files
```

## 🎯 Key Features Explained

### AI Job Matching
- Uses natural language processing to understand job requirements
- Compares skills, experience levels, and qualifications
- Provides actionable recommendations for skill improvement
- Generates personalized learning paths

### Job Scraping Engine
- Integrates with **9 job sources** (7 free, 2 optional):
  - **Adzuna** (optional) - Aggregates from LinkedIn, Indeed, Monster, CareerBuilder
  - **JSearch/RapidAPI** (optional) - Google Jobs: LinkedIn, Indeed, Glassdoor, ZipRecruiter
  - **Remotive** (free) - Remote tech positions
  - **Indeed RSS** (free) - Direct Indeed job postings
  - **RemoteOK** (free) - Remote positions from tech companies
  - **GitHub Jobs** (free) - Tech and open-source positions
  - **TheMuse** (free) - Diverse companies and roles
  - **Y Combinator** (free) - YC startup job board
  - **Hacker News** (free) - Tech startup community postings
- **7 sources work without any API keys!**
- Filters jobs with customizable time range (1-30 days)
- Uses AI (GPT-4) to calculate compatibility scores
- Sends beautifully formatted HTML emails with job matches
- Multi-source parallel scraping for best performance

### Smart Filtering
- Minimum 80% match threshold ensures quality (falls back to 30%+ if needed)
- Considers required vs. preferred qualifications
- Weights critical skills higher in scoring
- Shows all matching positions sorted by compatibility score

## 🔒 Privacy & Security

- Resumes are processed in-memory only (never stored)
- Email addresses used only for delivery (not stored)
- All API communications use HTTPS
- Environment variables for sensitive data
- No tracking or analytics

## 🐛 Troubleshooting

**Email not sending?**
- Verify Gmail app password is correct
- Check 2-Step Verification is enabled
- Review server logs for error messages

**No jobs found?**
- System will use mock data if APIs aren't configured
- Check Adzuna API limits if using real data
- Ensure resume is detailed enough (100+ characters)

**Low match scores?**
- Include more technical keywords in resume
- Ensure resume covers all relevant experience
- Try adjusting the match threshold in code

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI features |
| `EMAIL_USER` | Yes | Gmail address for sending emails |
| `EMAIL_PASSWORD` | Yes | Gmail app-specific password |
| `NEWS_API_KEY` | No | NewsAPI key for premium newsletter sources (100 req/day free) |
| `RAPID_API_KEY` | No | RapidAPI key for JSearch/Google Jobs (150 req/month free) |
| `ADZUNA_APP_ID` | No | Adzuna API app ID (1000 req/month free) |
| `ADZUNA_API_KEY` | No | Adzuna API key (1000 req/month free) |

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify  
- Railway
- Render

## 🤝 Contributing

This is a personal portfolio project, but suggestions and feedback are welcome!

## 📄 License

© 2025 - All rights reserved

## 📧 Contact

For questions or feedback about the job scraper feature, see the [setup guide](./JOB_SCRAPER_SETUP.md).