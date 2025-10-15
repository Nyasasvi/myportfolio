'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flex, Text, Button, Spinner, Icon } from '@/once-ui/components';
import { useParams } from 'next/navigation';
import '../detail.css';

interface AIArticle {
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

interface Newsletter {
  id: string;
  edition: number;
  title: string;
  publishedAt: string;
  articles: AIArticle[];
  subscribers: number;
  status: string;
}

export default function NewsletterDetailPage() {
  const params = useParams();
  const edition = params.edition as string;
  
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNewsletter();
  }, [edition]);

  const fetchNewsletter = async () => {
    try {
      const response = await fetch('/api/newsletter');
      const data = await response.json();
      
      const found = data.newsletters.find(
        (n: Newsletter) => n.edition === parseInt(edition)
      );
      
      if (found) {
        setNewsletter(found);
      } else {
        setError('Newsletter not found');
      }
    } catch (err) {
      setError('Failed to load newsletter');
    } finally {
      setLoading(false);
    }
  };

  const shareOnTwitter = () => {
    const text = `Check out ${newsletter?.title} - Top AI updates curated by @YasasviNellore`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" fillHeight padding="xl">
        <Spinner size="l" />
      </Flex>
    );
  }

  if (error || !newsletter) {
    return (
      <Flex direction="column" alignItems="center" justifyContent="center" fillHeight padding="xl">
        <Text variant="heading-strong-l" style={{ marginBottom: '16px' }}>
          {error || 'Newsletter not found'}
        </Text>
        <Button href="/newsletter" variant="primary">
          ← Back to Archive
        </Button>
      </Flex>
    );
  }

  return (
    <Flex
      as="article"
      direction="column"
      justifyContent="normal"
      fillWidth
      padding="xs"
      className="newsletter-detail"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="detail-header"
      >
        <Button
          href="/newsletter"
          variant="secondary"
          size="s"
          prefixIcon="chevronLeft"
          className="back-button"
        >
          Back to Archive
        </Button>

        <div className="header-content">
          <span className="edition-badge-large">
            Edition #{newsletter.edition}
          </span>
          
          <Text
            variant="heading-strong-xl"
            style={{
              fontSize: '42px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '16px',
              textAlign: 'center'
            }}
          >
            {newsletter.title}
          </Text>

          <div className="header-meta">
            <span className="meta-item">
              📅 {new Date(newsletter.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span className="meta-divider">•</span>
            <span className="meta-item">
              📝 {newsletter.articles.length} Articles
            </span>
            <span className="meta-divider">•</span>
            <span className="meta-item">
              👥 {newsletter.subscribers} Subscribers
            </span>
          </div>

          {/* Share Buttons */}
          <div className="share-buttons">
            <button onClick={shareOnTwitter} className="share-btn twitter">
              <span>𝕏</span>
              Share on Twitter
            </button>
            <button onClick={shareOnLinkedIn} className="share-btn linkedin">
              <span>in</span>
              Share on LinkedIn
            </button>
            <button onClick={copyLink} className="share-btn copy">
              <span>🔗</span>
              Copy Link
            </button>
          </div>
        </div>
      </motion.div>

      {/* Articles */}
      <div className="articles-container">
        {newsletter.articles.map((article, index) => (
          <motion.section
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="article-card"
          >
            {/* Rank Badge */}
            <div className="rank-badge-large">
              <span className="rank-number">#{article.rank}</span>
              <span className="rank-label">Top Story</span>
            </div>

            {/* Title */}
            <Text
              variant="heading-strong-l"
              style={{ fontSize: '28px', marginBottom: '16px', lineHeight: '1.3' }}
            >
              {article.title}
            </Text>

            {/* Tags */}
            <div className="tags-container">
              {article.tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
              <span className="credibility-badge">
                ✓ Credibility: {article.credibilityScore}/10
              </span>
            </div>

            {/* Summary */}
            <div className="article-summary">
              <Text
                variant="body-default-l"
                style={{ lineHeight: '1.7', marginBottom: '20px' }}
              >
                {article.summary}
              </Text>
            </div>

            {/* Why It Matters */}
            <div className="why-matters-box">
              <div className="box-header">
                <span className="box-icon">💡</span>
                <Text variant="label-strong-m">Why It Matters</Text>
              </div>
              <Text
                variant="body-default-m"
                style={{ lineHeight: '1.6' }}
              >
                {article.whyItMatters}
              </Text>
            </div>

            {/* Original Source */}
            <div className="article-source">
              <Button
                href={article.url}
                target="_blank"
                variant="primary"
                suffixIcon="externalLink"
                size="m"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  width: '100%'
                }}
              >
                Read Full Article
              </Button>
            </div>

            {/* Verified References */}
            <div className="references-section">
              <div className="references-header">
                <span className="verify-icon">✅</span>
                <Text variant="label-strong-s">
                  Verified by {article.references.length} {article.references.length === 1 ? 'source' : 'sources'}
                </Text>
              </div>
              <ul className="references-list">
                {article.references.map((ref, i) => (
                  <li key={i} className="reference-item">
                    <a 
                      href={ref.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="reference-link"
                    >
                      <span className="ref-source">{ref.source}</span>
                      <span className="ref-title">{ref.title}</span>
                      <span className="ref-date">
                        {new Date(ref.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>
        ))}
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="detail-footer"
      >
        <div className="footer-cta">
          <Text variant="heading-strong-l" style={{ marginBottom: '12px' }}>
            Enjoyed this edition?
          </Text>
          <Text variant="body-default-m" onBackground="neutral-medium" style={{ marginBottom: '24px' }}>
            Subscribe to receive weekly AI updates directly in your inbox
          </Text>
          <Button
            href="/newsletter"
            variant="primary"
            size="l"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
            }}
          >
            📧 Subscribe to AI Weekly
          </Button>
        </div>

        {/* Navigation */}
        <div className="edition-navigation">
          {newsletter.edition > 1 && (
            <Button
              href={`/newsletter/${newsletter.edition - 1}`}
              variant="secondary"
              prefixIcon="chevronLeft"
            >
              Edition #{newsletter.edition - 1}
            </Button>
          )}
          <Button
            href="/newsletter"
            variant="secondary"
          >
            View All Editions
          </Button>
        </div>
      </motion.div>
    </Flex>
  );
}

