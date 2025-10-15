'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flex, Text, Button, Spinner } from '@/once-ui/components';
import './newsletter.css';

interface Newsletter {
  id: string;
  edition: number;
  title: string;
  publishedAt: string;
  articles: any[];
  subscribers: number;
  status: string;
}

export default function NewsletterPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const response = await fetch('/api/newsletter');
      const data = await response.json();
      setNewsletters(data.newsletters || []);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribed(true);
        setEmail('');
      } else {
        setError(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      setError('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleGenerateNewsletter = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/newsletter/generate', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh newsletters list
        await fetchNewsletters();
        alert(`✅ Newsletter #${data.newsletter.edition} generated successfully!`);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to generate newsletter');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Flex
      as="main"
      direction="column"
      justifyContent="normal"
      fillWidth
      fillHeight
      padding="xs"
      gap="l"
      className="newsletter-page"
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="newsletter-hero"
      >
        <div className="hero-content">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="hero-icon"
          >
            🤖
          </motion.div>
          
          <Text
            variant="heading-strong-xl"
            style={{
              fontSize: '48px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '16px',
              textAlign: 'center'
            }}
          >
            AI Weekly Newsletter
          </Text>

          <Text
            variant="body-default-l"
            onBackground="neutral-medium"
            style={{ 
              maxWidth: '700px', 
              margin: '0 auto 32px',
              textAlign: 'center',
              lineHeight: '1.7'
            }}
          >
            Top 10 AI updates every week, curated and verified from multiple sources.
            Stay ahead of the curve with the latest developments in artificial intelligence.
          </Text>

          {/* Subscription Form */}
          <AnimatePresence mode="wait">
            {!subscribed ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubscribe}
                className="subscribe-form"
              >
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={subscribing}
                  className="subscribe-input"
                />
                <button 
                  type="submit" 
                  disabled={subscribing}
                  className="subscribe-button"
                >
                  {subscribing ? (
                    <Flex alignItems="center" gap="xs">
                      <Spinner size="s" />
                      <span>Subscribing...</span>
                    </Flex>
                  ) : (
                    '📧 Subscribe Free'
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="success-message"
              >
                <span className="success-icon">✅</span>
                <Text variant="body-default-l">
                  Subscribed! You'll receive weekly AI updates in your inbox.
                </Text>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="error-message"
            >
              {error}
            </motion.div>
          )}

          {/* Stats */}
          <div className="newsletter-stats">
            <div className="stat-item">
              <span className="stat-icon">📧</span>
              <span className="stat-value">{newsletters.length}</span>
              <span className="stat-label">Editions</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-icon">👥</span>
              <span className="stat-value">
                {newsletters.reduce((sum, n) => sum + (n.subscribers || 0), 0)}
              </span>
              <span className="stat-label">Subscribers</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-icon">🔥</span>
              <span className="stat-value">100%</span>
              <span className="stat-label">Free</span>
            </div>
          </div>

          {/* Admin: Generate Newsletter Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ marginTop: '24px' }}
          >
            <Button
              onClick={handleGenerateNewsletter}
              disabled={generating}
              variant="secondary"
              size="m"
              style={{
                borderColor: '#667eea',
                borderWidth: '2px'
              }}
            >
              {generating ? (
                <Flex alignItems="center" gap="xs">
                  <Spinner size="s" />
                  <span>Generating Newsletter...</span>
                </Flex>
              ) : (
                '⚡ Generate New Edition'
              )}
            </Button>
            <Text 
              variant="body-default-xs" 
              onBackground="neutral-weak"
              style={{ marginTop: '8px', textAlign: 'center' }}
            >
              Automatically curates top 10 AI news from Reddit
            </Text>
          </motion.div>
        </div>
      </motion.div>

      {/* Newsletter Archive */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="newsletter-archive"
      >
        <Flex
          direction="column"
          gap="m"
          style={{ marginBottom: '32px' }}
        >
          <Text
            variant="heading-strong-l"
            style={{ 
              fontSize: '32px',
              textAlign: 'center'
            }}
          >
            📚 Newsletter Archive
          </Text>
          <Text
            variant="body-default-m"
            onBackground="neutral-medium"
            style={{ textAlign: 'center' }}
          >
            Browse past editions and catch up on AI developments
          </Text>
        </Flex>

        {loading ? (
          <Flex justifyContent="center" padding="xl">
            <Spinner size="l" />
          </Flex>
        ) : newsletters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="empty-state"
          >
            <span className="empty-icon">📰</span>
            <Text variant="heading-default-l">No newsletters yet</Text>
            <Text variant="body-default-m" onBackground="neutral-medium">
              Generate the first edition to get started!
            </Text>
          </motion.div>
        ) : (
          <div className="newsletters-grid">
            {newsletters.map((newsletter, index) => (
              <motion.div
                key={newsletter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="newsletter-card"
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="card-header">
                  <span className="edition-badge">
                    Edition #{newsletter.edition}
                  </span>
                  <span className="date-badge">
                    {new Date(newsletter.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <Text 
                  variant="heading-strong-m"
                  style={{ fontSize: '20px', marginBottom: '12px' }}
                >
                  {newsletter.title}
                </Text>

                {/* Preview articles */}
                <div className="articles-preview">
                  <Text 
                    variant="label-default-s" 
                    onBackground="neutral-weak"
                    style={{ marginBottom: '8px' }}
                  >
                    TOP STORIES:
                  </Text>
                  <ul className="preview-list">
                    {newsletter.articles.slice(0, 3).map((article, i) => (
                      <li key={i} className="preview-item">
                        <span className="item-rank">#{article.rank}</span>
                        <span className="item-title">{article.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-footer">
                  <Button
                    href={`/newsletter/${newsletter.edition}`}
                    variant="primary"
                    size="s"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  >
                    Read Full Edition →
                  </Button>
                </div>

                <div className="card-meta">
                  <span>📊 {newsletter.subscribers} subscribers</span>
                  <span>📝 {newsletter.articles.length} articles</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </Flex>
  );
}

