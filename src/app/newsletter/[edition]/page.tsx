'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Check, Link2, Linkedin } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

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
        setError(`Edition ${edition} doesn't exist.`);
      }
    } catch (err) {
      setError('This edition couldn\'t be loaded.');
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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="nld" aria-busy="true" aria-label="Loading edition">
        <span className="nl-skel nl-skel--sm" />
        <span className="nl-skel nl-skel--lg" />
        <span className="nl-skel nl-skel--md" />
        {[0, 1].map((i) => (
          <div key={i} className="nld-skel-block">
            <span className="nl-skel nl-skel--lg" />
            <span className="nl-skel" />
            <span className="nl-skel" />
            <span className="nl-skel nl-skel--md" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !newsletter) {
    return (
      <div className="nld nld--empty">
        <h1 className="ds-h2">{error || 'This edition doesn\'t exist.'}</h1>
        <Link href="/newsletter" className="ds-btn">
          <ArrowLeft aria-hidden="true" />
          All editions
        </Link>
      </div>
    );
  }

  return (
    <article className="nld">
      <Link href="/newsletter" className="nld-back">
        <ArrowLeft aria-hidden="true" />
        All editions
      </Link>

      <header className="nld-header">
        <p className="ds-meta">
          Edition {newsletter.edition}, published{' '}
          <time dateTime={newsletter.publishedAt}>
            {new Date(newsletter.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </time>
        </p>
        <h1 className="ds-h1">{newsletter.title}</h1>
        <p className="ds-body-text">{newsletter.articles.length} stories, read by {newsletter.subscribers} subscribers.</p>

        <div className="nld-share" role="group" aria-label="Share this edition">
          <button type="button" onClick={shareOnTwitter} className="ds-btn ds-btn--ghost">
            <span aria-hidden="true" className="nld-x">𝕏</span>
            Share on X
          </button>
          <button type="button" onClick={shareOnLinkedIn} className="ds-btn ds-btn--ghost">
            <Linkedin aria-hidden="true" />
            Share on LinkedIn
          </button>
          <button type="button" onClick={copyLink} className="ds-btn ds-btn--ghost" aria-live="polite">
            {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
            {copied ? 'Link copied' : 'Copy link'}
          </button>
        </div>
      </header>

      <ol className="nld-stories">
        {newsletter.articles.map((article) => (
          <li key={article.id} className="nld-story">
            <span className="nld-story__rank" aria-hidden="true">{article.rank}</span>
            <div className="nld-story__body">
              <h2 className="ds-h3">
                <span className="ds-visually-hidden">Story {article.rank}: </span>
                {article.title}
              </h2>

              <div className="nld-story__tags">
                {article.tags.map((tag) => <span key={tag} className="ds-chip">{tag}</span>)}
                <span className="ds-chip nld-cred" title="How many independent sources confirmed the story, scored out of 10">
                  Credibility {article.credibilityScore}/10
                </span>
              </div>

              <p className="nld-story__summary">{article.summary}</p>

              <div className="nld-why">
                <p className="nld-why__label">Why it matters</p>
                <p>{article.whyItMatters}</p>
              </div>

              <a href={article.url} target="_blank" rel="noopener noreferrer" className="ds-btn nld-story__read">
                Read the full article
                <ArrowUpRight aria-hidden="true" />
              </a>

              {article.references.length > 0 && (
                <details className="nld-refs">
                  <summary>
                    Confirmed by {article.references.length} {article.references.length === 1 ? 'source' : 'sources'}
                  </summary>
                  <ul>
                    {article.references.map((ref, i) => (
                      <li key={i}>
                        <a href={ref.url} target="_blank" rel="noopener noreferrer">
                          <span className="nld-refs__source">{ref.source}</span>
                          <span className="nld-refs__title">{ref.title}</span>
                          <time className="nld-refs__date" dateTime={ref.publishedAt}>
                            {new Date(ref.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </time>
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </li>
        ))}
      </ol>

      <footer className="nld-footer">
        <div>
          <h2 className="ds-h3">Get the next edition by email</h2>
          <p className="ds-body-text">One email a week with the ten stories worth your time.</p>
        </div>
        <Link href="/newsletter" className="ds-btn ds-btn--primary">Subscribe</Link>
        <nav className="nld-pager" aria-label="Editions">
          {newsletter.edition > 1 && (
            <Link href={`/newsletter/${newsletter.edition - 1}`} className="ds-btn ds-btn--ghost">
              <ArrowLeft aria-hidden="true" />
              Edition {newsletter.edition - 1}
            </Link>
          )}
          <Link href="/newsletter" className="ds-btn ds-btn--ghost">All editions</Link>
        </nav>
      </footer>
    </article>
  );
}
