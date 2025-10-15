'use client'

import React, { useState, useEffect } from 'react';
import { Flex, Heading, Text, Button } from '@/once-ui/components';
import './index.css';

interface SkillMatch {
  skill: string;
  matched: boolean;
  yourLevel?: number;
  required: string;
  category?: string;
}

interface MatchResult {
  overallScore: number;
  matchedSkills: SkillMatch[];
  missingSkills: SkillMatch[];
  recommendations: string[];
  strengths: string[];
  gapAnalysis: {
    critical: string[];
    nice_to_have: string[];
    learning_path: string[];
  };
  jobTitle?: string;
  matchCategory: 'excellent' | 'good' | 'moderate' | 'needs_improvement';
}

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

interface JobScraperResult {
  success: boolean;
  emailSent?: boolean;
  message: string;
  matchedJobs?: Job[];
  matchThreshold?: number;
  stats?: {
    totalScraped: number;
    recentJobs: number;
    highMatches: number;
  };
  suggestions?: string[];
}

export default function JobMatchPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [useCustomResume, setUseCustomResume] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState('');
  const [jobCharCount, setJobCharCount] = useState(0);
  const [resumeCharCount, setResumeCharCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Job Scraper states
  const [activeTab, setActiveTab] = useState<'analyze' | 'scraper'>('analyze');
  const [scraperEmail, setScraperEmail] = useState('');
  const [scraperResume, setScraperResume] = useState('');
  const [scraperLoading, setScraperLoading] = useState(false);
  const [scraperResult, setScraperResult] = useState<JobScraperResult | null>(null);
  const [scraperError, setScraperError] = useState('');
  
  // Filter states
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState(false);
  const [jobType, setJobType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [maxDaysOld, setMaxDaysOld] = useState('1');
  const [minMatchPercentage, setMinMatchPercentage] = useState('80');

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description to analyze');
      return;
    }

    if (jobDescription.length < 100) {
      setError('Job description seems too short. Please provide more details.');
      return;
    }

    if (useCustomResume && !resume.trim()) {
      setError('Please paste your resume or uncheck "Use My Resume" to use default profile');
      return;
    }

    if (useCustomResume && resume.length < 100) {
      setError('Resume seems too short. Please provide more details.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/job-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          jobDescription,
          resume: useCustomResume ? resume : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze job description');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to analyze job description. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setJobDescription('');
    setResume('');
    setResult(null);
    setError('');
    setJobCharCount(0);
    setResumeCharCount(0);
  };

  const handleJobTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJobDescription(text);
    setJobCharCount(text.length);
    setError('');
  };

  const handleResumeTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setResume(text);
    setResumeCharCount(text.length);
    setError('');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'moderate': return '#f59e0b';
      case 'needs_improvement': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'excellent': return 'Excellent Match';
      case 'good': return 'Good Match';
      case 'moderate': return 'Moderate Match';
      case 'needs_improvement': return 'Needs Improvement';
      default: return 'Match Result';
    }
  };

  // Job Scraper handlers
  const handleJobScraper = async () => {
    if (!scraperEmail.trim()) {
      setScraperError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(scraperEmail)) {
      setScraperError('Please enter a valid email address');
      return;
    }

    if (!scraperResume.trim()) {
      setScraperError('Please paste your resume');
      return;
    }

    if (scraperResume.length < 100) {
      setScraperError('Resume seems too short. Please provide more details.');
      return;
    }

    setScraperLoading(true);
    setScraperError('');
    setScraperResult(null);

    try {
      // Build filters object
      const filters: any = {};
      
      if (keywords.trim()) filters.keywords = keywords.trim();
      if (location.trim()) filters.location = location.trim();
      if (remote) filters.remote = true;
      if (jobType) filters.jobType = jobType;
      if (experienceLevel) filters.experienceLevel = experienceLevel;
      if (salaryMin && parseInt(salaryMin) > 0) filters.salaryMin = parseInt(salaryMin);
      if (maxDaysOld) filters.maxDaysOld = parseInt(maxDaysOld);
      if (minMatchPercentage && parseInt(minMatchPercentage) > 0) filters.minMatchPercentage = parseInt(minMatchPercentage);

      const response = await fetch('/api/job-scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: scraperEmail,
          resume: scraperResume,
          filters,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape jobs');
      }

      setScraperResult(data);
    } catch (err) {
      setScraperError(err instanceof Error ? err.message : 'Failed to scrape jobs. Please try again.');
      console.error(err);
    } finally {
      setScraperLoading(false);
    }
  };

  const handleScraperClear = () => {
    setScraperEmail('');
    setScraperResume('');
    setScraperResult(null);
    setScraperError('');
    setKeywords('');
    setLocation('');
    setRemote(false);
    setJobType('');
    setExperienceLevel('');
    setSalaryMin('');
    setMaxDaysOld('1');
    setMinMatchPercentage('80');
  };

  return (
    <div className={`job-match-container ${isAnimating ? 'fade-in' : ''}`}>
      <div className="job-match-header">
        <div className="header-content">
          <div className="icon-wrapper">
            <span className="header-icon">🎯</span>
          </div>
          <Heading className="main-heading" as="h1">
            Job Match Analyzer
          </Heading>
          <Text className="subtitle">
            Powered by AI • Compare skills with job requirements • Get personalized insights
          </Text>
          
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'analyze' ? 'active' : ''}`}
              onClick={() => setActiveTab('analyze')}
            >
              <span className="tab-icon">📊</span>
              Analyze Single Job
            </button>
            <button
              className={`tab-button ${activeTab === 'scraper' ? 'active' : ''}`}
              onClick={() => setActiveTab('scraper')}
            >
              <span className="tab-icon">🔍</span>
              Find Matching Jobs
            </button>
          </div>
          
          {activeTab === 'analyze' && (
            <div className="mode-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={useCustomResume}
                  onChange={(e) => setUseCustomResume(e.target.checked)}
                  className="toggle-checkbox"
                />
                <span className="toggle-text">
                  {useCustomResume ? '📄 Using Your Resume' : '👤 Using Default Profile (Yasasvi)'}
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="job-match-content">
        {activeTab === 'analyze' ? (
          <>
        {!result ? (
          <div className="input-section">
            {/* Resume Input - Only show when custom resume is enabled */}
            {useCustomResume && (
              <div className="input-card resume-card">
                <div className="card-header">
                  <div className="header-left">
                    <span className="step-badge" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>Step 1</span>
                    <h2 className="card-title">Paste Your Resume</h2>
                  </div>
                  <div className="char-counter">
                    {resumeCharCount.toLocaleString()} characters
                  </div>
                </div>
                
                <textarea
                  className="job-textarea resume-textarea"
                  placeholder="Paste your complete resume/CV here...

Include:
• Professional summary
• Work experience with achievements
• Skills and technologies
• Education and certifications
• Projects (if applicable)
• Any relevant details about your background

💡 Tip: The more comprehensive your resume, the better the analysis!"
                  value={resume}
                  onChange={handleResumeTextChange}
                  rows={14}
                />
              </div>
            )}

            {/* Job Description Input */}
            <div className="input-card">
              <div className="card-header">
                <div className="header-left">
                  <span className="step-badge">{useCustomResume ? 'Step 2' : 'Step 1'}</span>
                  <h2 className="card-title">Paste Job Description</h2>
                </div>
                <div className="char-counter">
                  {jobCharCount.toLocaleString()} characters
                </div>
              </div>
              
              <textarea
                className="job-textarea"
                placeholder="Paste the complete job description here...

Include details like:
• Required skills and technologies
• Years of experience
• Responsibilities and requirements
• Nice-to-have qualifications
• Company and role description

The more details you provide, the better the analysis!"
                value={jobDescription}
                onChange={handleJobTextChange}
                rows={useCustomResume ? 14 : 16}
              />

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <div className="button-group">
                <Button
                  onClick={handleAnalyze}
                  disabled={loading || !jobDescription.trim()}
                  className="analyze-button"
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      Analyze Match
                    </>
                  )}
                </Button>
                
                {jobDescription && (
                  <Button
                    onClick={handleClear}
                    variant="secondary"
                    className="clear-button"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div className="info-cards">
                <div className="info-card">
                  <span className="info-icon">🤖</span>
                  <div>
                    <strong>AI-Powered Analysis</strong>
                    <p>Uses advanced NLP to match skills</p>
                  </div>
                </div>
                <div className="info-card">
                  <span className="info-icon">📊</span>
                  <div>
                    <strong>Detailed Insights</strong>
                    <p>Get comprehensive gap analysis</p>
                  </div>
                </div>
                <div className="info-card">
                  <span className="info-icon">🎯</span>
                  <div>
                    <strong>Personalized Results</strong>
                    <p>{useCustomResume ? 'Based on your resume' : 'Based on default profile'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="results-section">
            {/* Overall Score Card */}
            <div className="score-card" style={{ borderColor: getCategoryColor(result.matchCategory) }}>
              <div className="score-header">
                <h2>Match Result</h2>
                <button className="new-analysis-btn" onClick={handleClear}>
                  New Analysis
                </button>
              </div>
              
              <div className="score-circle-container">
                <svg className="score-circle" viewBox="0 0 200 200">
                  <circle
                    className="score-circle-bg"
                    cx="100"
                    cy="100"
                    r="85"
                  />
                  <circle
                    className="score-circle-progress"
                    cx="100"
                    cy="100"
                    r="85"
                    style={{
                      stroke: getCategoryColor(result.matchCategory),
                      strokeDasharray: `${result.overallScore * 5.34} 534`,
                    }}
                  />
                </svg>
                <div className="score-text">
                  <div className="score-value">{result.overallScore}%</div>
                  <div className="score-label" style={{ color: getCategoryColor(result.matchCategory) }}>
                    {getCategoryLabel(result.matchCategory)}
                  </div>
                </div>
              </div>

              {result.jobTitle && (
                <div className="job-title-display">
                  <span className="job-title-icon">💼</span>
                  <strong>{result.jobTitle}</strong>
                </div>
              )}

              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-icon matched">✓</span>
                  <div>
                    <div className="stat-value">{result.matchedSkills.length}</div>
                    <div className="stat-label">Matched Skills</div>
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-icon missing">○</span>
                  <div>
                    <div className="stat-value">{result.missingSkills.length}</div>
                    <div className="stat-label">Skills to Learn</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths Section */}
            {result.strengths.length > 0 && (
              <div className="section-card strengths-card">
                <div className="section-header">
                  <h3>
                    <span className="section-icon">💪</span>
                    Your Strengths
                  </h3>
                </div>
                <div className="strengths-grid">
                  {result.strengths.map((strength, index) => (
                    <div key={index} className="strength-item">
                      <span className="strength-checkmark">✓</span>
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Skills */}
            {result.matchedSkills.length > 0 && (
              <div className="section-card">
                <div className="section-header">
                  <h3>
                    <span className="section-icon">✅</span>
                    Matched Skills ({result.matchedSkills.length})
                  </h3>
                </div>
                <div className="skills-grid">
                  {result.matchedSkills.map((skill, index) => (
                    <div key={index} className="skill-chip matched">
                      <span className="skill-icon">✓</span>
                      <div className="skill-info">
                        <span className="skill-name">{skill.skill}</span>
                        {skill.yourLevel && (
                          <span className="skill-level">{skill.yourLevel}% proficiency</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gap Analysis */}
            {(result.gapAnalysis.critical.length > 0 || 
              result.gapAnalysis.nice_to_have.length > 0) && (
              <div className="section-card gap-card">
                <div className="section-header">
                  <h3>
                    <span className="section-icon">📊</span>
                    Skills Gap Analysis
                  </h3>
                </div>

                {result.gapAnalysis.critical.length > 0 && (
                  <div className="gap-subsection">
                    <h4 className="gap-title critical">
                      <span>🔴</span> Critical Skills to Learn
                    </h4>
                    <div className="gap-list">
                      {result.gapAnalysis.critical.map((skill, index) => (
                        <div key={index} className="gap-item critical">
                          <span className="gap-priority">High Priority</span>
                          <span className="gap-skill">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.gapAnalysis.nice_to_have.length > 0 && (
                  <div className="gap-subsection">
                    <h4 className="gap-title nice-to-have">
                      <span>🟡</span> Nice to Have
                    </h4>
                    <div className="gap-list">
                      {result.gapAnalysis.nice_to_have.map((skill, index) => (
                        <div key={index} className="gap-item nice-to-have">
                          <span className="gap-priority">Medium Priority</span>
                          <span className="gap-skill">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Learning Path */}
            {result.gapAnalysis.learning_path.length > 0 && (
              <div className="section-card learning-card">
                <div className="section-header">
                  <h3>
                    <span className="section-icon">🎓</span>
                    Recommended Learning Path
                  </h3>
                </div>
                <div className="learning-path">
                  {result.gapAnalysis.learning_path.map((step, index) => (
                    <div key={index} className="learning-step">
                      <div className="step-number">{index + 1}</div>
                      <div className="step-content">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="section-card recommendations-card">
                <div className="section-header">
                  <h3>
                    <span className="section-icon">💡</span>
                    AI Recommendations
                  </h3>
                </div>
                <div className="recommendations-list">
                  {result.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <span className="rec-icon">→</span>
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="action-footer">
              <Button onClick={handleClear} className="analyze-another-btn">
                <span>🔄</span>
                Analyze Another Job
              </Button>
            </div>
          </div>
        )}
          </>
        ) : (
          /* Job Scraper Tab */
          <div className="scraper-section">
            {!scraperResult ? (
              <div className="input-section">
                <div className="input-card scraper-card">
                  <div className="card-header">
                    <div className="header-left">
                      <h2 className="card-title">🔍 Automated Job Finder</h2>
                    </div>
                  </div>
                  
                  <div className="scraper-description">
                    <p>
                      <strong>How it works:</strong>
                    </p>
                    <ul>
                      <li>✨ We scrape job boards for positions posted recently</li>
                      <li>🎯 Use filters to narrow down your search (including match %)</li>
                      <li>🤖 AI analyzes each job against your resume</li>
                      <li>📧 Receive <strong>all matching jobs</strong> via email (customize match %)</li>
                      <li>⚡ Save time by letting AI find the best opportunities for you!</li>
                    </ul>
                  </div>

                  {/* Job Filters Section */}
                  <div className="filters-section">
                    <h3 className="filters-title">
                      <span className="filter-icon">🎯</span>
                      Filter Your Job Search
                    </h3>
                    
                    <div className="filters-grid">
                      {/* Keywords */}
                      <div className="filter-group">
                        <label className="filter-label">
                          <span className="label-icon">🔍</span>
                          Keywords
                        </label>
                        <input
                          type="text"
                          className="filter-input"
                          placeholder="e.g., React, Python, Machine Learning"
                          value={keywords}
                          onChange={(e) => setKeywords(e.target.value)}
                        />
                        <span className="filter-hint">Leave empty for general search</span>
                      </div>

                      {/* Location */}
                      <div className="filter-group">
                        <label className="filter-label">
                          <span className="label-icon">📍</span>
                          Location
                        </label>
                        <input
                          type="text"
                          className="filter-input"
                          placeholder="e.g., San Francisco, New York, Remote"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                        <span className="filter-hint">City, state, or leave empty for all</span>
                      </div>

                      {/* Experience Level */}
                      <div className="filter-group">
                        <label className="filter-label">
                          <span className="label-icon">⭐</span>
                          Experience Level
                        </label>
                        <select
                          className="filter-select"
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                        >
                          <option value="">All Levels</option>
                          <option value="entry">Entry Level / Junior</option>
                          <option value="mid">Mid-Level</option>
                          <option value="senior">Senior</option>
                          <option value="lead">Lead / Principal / Staff</option>
                        </select>
                      </div>

                      {/* Job Type */}
                      <div className="filter-group">
                        <label className="filter-label">
                          <span className="label-icon">💼</span>
                          Job Type
                        </label>
                        <select
                          className="filter-select"
                          value={jobType}
                          onChange={(e) => setJobType(e.target.value)}
                        >
                          <option value="">All Types</option>
                          <option value="full_time">Full Time</option>
                          <option value="part_time">Part Time</option>
                          <option value="contract">Contract</option>
                          <option value="permanent">Permanent</option>
                        </select>
                      </div>

                      {/* Minimum Salary */}
                      <div className="filter-group">
                        <label className="filter-label">
                          <span className="label-icon">💰</span>
                          Minimum Salary (USD)
                        </label>
                        <input
                          type="number"
                          className="filter-input"
                          placeholder="e.g., 100000"
                          value={salaryMin}
                          onChange={(e) => setSalaryMin(e.target.value)}
                          min="0"
                          step="5000"
                        />
                        <span className="filter-hint">Annual salary in USD</span>
                      </div>

                      {/* Max Days Old */}
                      <div className="filter-group">
                        <label className="filter-label">
                          <span className="label-icon">⏰</span>
                          Posted Within
                        </label>
                        <select
                          className="filter-select"
                          value={maxDaysOld}
                          onChange={(e) => setMaxDaysOld(e.target.value)}
                        >
                          <option value="1">Last 24 hours</option>
                          <option value="3">Last 3 days</option>
                          <option value="7">Last week</option>
                          <option value="14">Last 2 weeks</option>
                          <option value="30">Last month</option>
                        </select>
                      </div>

                      {/* Minimum Match Percentage */}
                      <div className="filter-group">
                        <label className="filter-label">
                          <span className="label-icon">🎯</span>
                          Minimum Match %
                        </label>
                        <select
                          className="filter-select"
                          value={minMatchPercentage}
                          onChange={(e) => setMinMatchPercentage(e.target.value)}
                        >
                          <option value="50">50% - Show more opportunities</option>
                          <option value="60">60% - Decent match</option>
                          <option value="70">70% - Good match</option>
                          <option value="80">80% - High quality (default)</option>
                          <option value="90">90% - Excellent match only</option>
                          <option value="95">95% - Perfect match only</option>
                        </select>
                        <p className="filter-hint">
                          Higher % = fewer but better matches. Default is 80%.
                        </p>
                      </div>
                    </div>

                    {/* Remote Toggle */}
                    <div className="remote-toggle-container">
                      <label className="remote-toggle-label">
                        <input
                          type="checkbox"
                          className="remote-checkbox"
                          checked={remote}
                          onChange={(e) => setRemote(e.target.checked)}
                        />
                        <span className="remote-toggle-text">
                          <span className="remote-icon">{remote ? '✅' : '☐'}</span>
                          <strong>Remote Only</strong> - Show only remote positions
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📧</span>
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="your.email@example.com"
                      value={scraperEmail}
                      onChange={(e) => {
                        setScraperEmail(e.target.value);
                        setScraperError('');
                      }}
                    />
                    <p className="form-hint">We'll send the job matches to this email</p>
                  </div>

                  {/* Resume Input */}
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📄</span>
                      Paste Your Resume
                    </label>
                    <textarea
                      className="job-textarea scraper-textarea"
                      placeholder="Paste your complete resume here...

Include:
• Professional summary
• Work experience with achievements
• Skills and technologies
• Education and certifications
• Projects and relevant details

💡 The better your resume, the more accurate the job matches!"
                      value={scraperResume}
                      onChange={(e) => {
                        setScraperResume(e.target.value);
                        setScraperError('');
                      }}
                      rows={16}
                    />
                    <p className="form-hint">
                      {scraperResume.length.toLocaleString()} characters
                    </p>
                  </div>

                  {scraperError && (
                    <div className="error-message">
                      <span className="error-icon">⚠️</span>
                      {scraperError}
                    </div>
                  )}

                  <div className="button-group">
                    <Button
                      onClick={handleJobScraper}
                      disabled={scraperLoading}
                      className="analyze-button scraper-button"
                    >
                      {scraperLoading ? (
                        <>
                          <span className="spinner"></span>
                          Searching Jobs & Analyzing...
                        </>
                      ) : (
                        <>
                          <span>🚀</span>
                          Find Matching Jobs
                        </>
                      )}
                    </Button>
                    
                    {(scraperEmail || scraperResume) && (
                      <Button
                        onClick={handleScraperClear}
                        variant="secondary"
                        className="clear-button"
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  <div className="info-cards">
                    <div className="info-card">
                      <span className="info-icon">⏰</span>
                      <div>
                        <strong>24-Hour Jobs</strong>
                        <p>Only recently posted positions</p>
                      </div>
                    </div>
                    <div className="info-card">
                      <span className="info-icon">🎯</span>
                      <div>
                        <strong>80%+ Match</strong>
                        <p>High compatibility jobs only</p>
                      </div>
                    </div>
                    <div className="info-card">
                      <span className="info-icon">📬</span>
                      <div>
                        <strong>Email Delivery</strong>
                        <p>Results sent to your inbox</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Scraper Results */
              <div className="results-section scraper-results">
                <div className="score-card success-card">
                  <div className="score-header">
                    <h2>{scraperResult.success ? '✅ Job Search Complete!' : '⚠️ Search Complete'}</h2>
                    <button className="new-analysis-btn" onClick={handleScraperClear}>
                      New Search
                    </button>
                  </div>
                  
                  <div className="success-message">
                    <p className="message-text">{scraperResult.message}</p>
                    
                    {/* Match Quality Indicator */}
                    {scraperResult.matchThreshold && (
                      <div className={`match-quality-banner ${scraperResult.matchThreshold >= 80 ? 'high' : 'medium'}`}>
                        <span className="quality-icon">{scraperResult.matchThreshold >= 80 ? '🎯' : '📋'}</span>
                        <div>
                          <strong>
                            {scraperResult.matchThreshold >= 80 
                              ? 'High Quality Matches (80%+)' 
                              : 'Medium Quality Matches (30%+)'}
                          </strong>
                          <p>
                            {scraperResult.matchThreshold >= 80 
                              ? 'Excellent compatibility with your skills!'
                              : 'Some skill overlap - consider learning missing technologies to increase your match rate.'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {scraperResult.stats && (
                      <div className="stats-summary">
                        <div className="stat-box">
                          <div className="stat-number">{scraperResult.stats.totalScraped}</div>
                          <div className="stat-text">Total Jobs Scraped</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-number">{scraperResult.stats.recentJobs}</div>
                          <div className="stat-text">Posted Recently</div>
                        </div>
                        <div className={`stat-box ${scraperResult.matchThreshold && scraperResult.matchThreshold >= 80 ? 'highlight' : 'medium-highlight'}`}>
                          <div className="stat-number">{scraperResult.stats.highMatches}</div>
                          <div className="stat-text">
                            {scraperResult.matchThreshold && scraperResult.matchThreshold >= 80 
                              ? 'High Matches (80%+)' 
                              : 'Medium Matches (30%+)'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Suggestions for improvement */}
                    {scraperResult.suggestions && scraperResult.suggestions.length > 0 && (
                      <div className="suggestions-banner">
                        <span className="suggestions-icon">💡</span>
                        <div>
                          <strong>Try these to get more matches:</strong>
                          <ul>
                            {scraperResult.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {scraperResult.emailSent && (
                      <div className="email-sent-banner">
                        <span className="email-icon">📧</span>
                        <strong>Email sent to {scraperEmail}</strong>
                        <p>Check your inbox for detailed job listings!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Display matched jobs */}
                {scraperResult.matchedJobs && scraperResult.matchedJobs.length > 0 && (
                  <div className="section-card matched-jobs-card">
                    <div className="section-header">
                      <h3>
                        <span className="section-icon">💼</span>
                        Matched Jobs ({scraperResult.matchedJobs.length})
                      </h3>
                    </div>
                    
                    <div className="jobs-list">
                      {scraperResult.matchedJobs.map((job) => (
                        <div key={job.id} className="job-item">
                          <div className="job-item-header">
                            <div>
                              <h4 className="job-item-title">{job.title}</h4>
                              <p className="job-item-company">
                                <span>🏢</span> {job.company}
                              </p>
                              <p className="job-item-location">
                                <span>📍</span> {job.location}
                              </p>
                              {job.source && (
                                <p className="job-item-source">
                                  <span>🔗</span> Source: {job.source}
                                </p>
                              )}
                            </div>
                            <div className="job-match-badge">
                              {job.matchScore}% Match
                            </div>
                          </div>
                          
                          <p className="job-item-description">
                            {job.description.substring(0, 200)}...
                          </p>
                          
                          <a 
                            href={job.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="job-apply-link"
                          >
                            View Full Job →
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="action-footer">
                  <Button onClick={handleScraperClear} className="analyze-another-btn">
                    <span>🔄</span>
                    Search Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Background Animations */}
      <div className="background-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
    </div>
  );
}

