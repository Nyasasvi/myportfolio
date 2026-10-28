'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Loader2, RefreshCw } from 'lucide-react';
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

type Notice = { tone: 'success' | 'error'; text: string } | null;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function NewsletterPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    setLoadFailed(false);
    try {
      const response = await fetch('/api/newsletter');
      const data = await response.json();
      setNewsletters(data.newsletters || []);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      setLoadFailed(true);
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
        setError(data.error || 'Subscription failed. Check the address and try again.');
      }
    } catch (error) {
      setError('Subscription failed because the server couldn\'t be reached. Try again in a moment.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleGenerateNewsletter = async () => {
    setGenerating(true);
    setNotice(null);
    try {
      const response = await fetch('/api/newsletter/generate', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh newsletters list
        await fetchNewsletters();
        setNotice({ tone: 'success', text: `Edition #${data.newsletter.edition} generated.` });
      } else {
        setNotice({ tone: 'error', text: `Edition wasn't generated: ${data.error}` });
      }
    } catch (error) {
      setNotice({ tone: 'error', text: 'Edition wasn\'t generated because the server couldn\'t be reached.' });
    } finally {
      setGenerating(false);
    }
  };

  const [latest, ...older] = newsletters;

  return (
    <main className="nl">
      <header className="nl-hero">
        <div className="nl-hero__text">
          <h1 className="ds-h1">AI Weekly</h1>
          <p className="ds-lede">
            The ten AI developments worth knowing each week, collected from several sources and checked before they go out.
          </p>
        </div>

        <div className="ds-card nl-subscribe">
          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="nl-subscribe__form">
              <label htmlFor="nl-email" className="nl-subscribe__label">Get it by email</label>
              <div className="nl-subscribe__row">
                <input
                  id="nl-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={subscribing}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'nl-error' : 'nl-hint'}
                  className="nl-input"
                />
                <button type="submit" disabled={subscribing} aria-busy={subscribing} className="ds-btn ds-btn--primary">
                  {subscribing ? <><Loader2 className="nl-spin" aria-hidden="true" />Subscribing</> : 'Subscribe'}
                </button>
              </div>
              {error ? (
                <p id="nl-error" className="nl-field-msg nl-field-msg--error" role="alert">{error}</p>
              ) : (
                <p id="nl-hint" className="nl-field-msg">Free, weekly. Unsubscribe from any email.</p>
              )}
            </form>
          ) : (
            <p className="nl-subscribed" role="status">
              <Check aria-hidden="true" />
              You&apos;re subscribed. The next edition will arrive in your inbox.
            </p>
          )}
          <dl className="nl-stats">
            <div><dt>{newsletters.length}</dt><dd>editions</dd></div>
            <div><dt>{newsletters.reduce((sum, n) => sum + (n.subscribers || 0), 0)}</dt><dd>subscribers</dd></div>
          </dl>
        </div>
      </header>

      <section className="nl-archive" aria-labelledby="nl-archive-title" aria-busy={loading}>
        <div className="nl-archive__head">
          <h2 id="nl-archive-title" className="ds-h2">Editions</h2>
          <button type="button" onClick={handleGenerateNewsletter} disabled={generating} aria-busy={generating} className="ds-btn ds-btn--ghost nl-generate">
            {generating ? <Loader2 className="nl-spin" aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}
            {generating ? 'Generating edition' : 'Generate new edition'}
          </button>
        </div>

        <div aria-live="polite">
          {notice && <p className={`nl-notice nl-notice--${notice.tone}`}>{notice.text}</p>}
        </div>

        {loading ? (
          <div className="nl-grid" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="ds-card nl-card nl-card--skeleton">
                <span className="nl-skel nl-skel--sm" />
                <span className="nl-skel nl-skel--lg" />
                <span className="nl-skel" />
                <span className="nl-skel" />
                <span className="nl-skel nl-skel--md" />
              </div>
            ))}
          </div>
        ) : loadFailed ? (
          <div className="nl-empty">
            <p>Editions couldn&apos;t be loaded.</p>
            <button type="button" className="ds-btn" onClick={() => { setLoading(true); fetchNewsletters(); }}>Try again</button>
          </div>
        ) : newsletters.length === 0 ? (
          <div className="nl-empty">
            <p>No editions yet.</p>
            <p className="ds-meta">Generate the first one to start the archive.</p>
          </div>
        ) : (
          <div className="nl-grid">
            {[latest, ...older].map((newsletter, index) => (
              <Link
                key={newsletter.id}
                href={`/newsletter/${newsletter.edition}`}
                className={`ds-card nl-card${index === 0 ? ' nl-card--latest' : ''}`}
              >
                <div className="nl-card__meta">
                  <span>Edition {newsletter.edition}</span>
                  <time dateTime={newsletter.publishedAt}>{formatDate(newsletter.publishedAt)}</time>
                </div>
                <h3 className="ds-h3">{newsletter.title}</h3>
                <ol className="nl-card__stories">
                  {newsletter.articles.slice(0, index === 0 ? 5 : 3).map((article, i) => (
                    <li key={i}>{article.title}</li>
                  ))}
                </ol>
                <span className="nl-card__footer">
                  {newsletter.articles.length} stories
                  <span className="nl-card__read">Read edition</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
