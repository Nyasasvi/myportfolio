'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Activity, AlertCircle, Pause, RefreshCw } from 'lucide-react';
import './analytics.css';

// Real-time analytics data structure
interface AnalyticsData {
  overview: {
    totalVisitors: number;
    pageViews: number;
    avgSessionDuration: string;
    bounceRate: number;
    newVisitors: number;
    returningVisitors: number;
  };
  visitorTrends: Array<{
    date: string;
    visitors: number;
    pageViews: number;
  }>;
  topPages: Array<{
    page: string;
    views: number;
    title: string;
  }>;
  trafficSources: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  geographicData: Array<{
    country: string;
    visitors: number;
    percentage: number;
  }>;
  deviceData: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  realTimeData: {
    activeUsers: number;
    currentPage: string;
    topReferrer: string;
    avgLoadTime: string;
  };
}

const RANGES = [
  { id: '1d', label: '24h' },
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: '90d', label: '90d' },
];

type ChartTheme = { mark: string; grid: string; text: string; muted: string; surface: string; border: string };

// Recharts writes colors into SVG attributes, which can't resolve CSS variables, so read the tokens and follow theme changes
function useChartTheme(): ChartTheme {
  const read = (): ChartTheme => {
    if (typeof window === 'undefined') {
      return { mark: '#6f7ff0', grid: 'rgba(236,238,246,0.07)', text: '#eceef6', muted: '#7c839c', surface: '#1c2135', border: 'rgba(236,238,246,0.18)' };
    }
    const css = getComputedStyle(document.documentElement);
    const v = (name: string) => css.getPropertyValue(name).trim();
    return { mark: v('--ds-chart-1'), grid: v('--ds-chart-grid'), text: v('--ds-fg'), muted: v('--ds-fg-subtle'), surface: v('--ds-surface-2'), border: v('--ds-border-strong') };
  };
  const [theme, setTheme] = useState<ChartTheme>(read);
  useEffect(() => {
    setTheme(read());
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

const formatDay = (value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function ChartTooltip({ active, payload, label, unit, labelFormatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="an-tooltip">
      <p className="an-tooltip__label">{labelFormatter ? labelFormatter(label) : label}</p>
      <p className="an-tooltip__value">
        <span className="an-tooltip__swatch" style={{ background: payload[0].color || payload[0].fill }} />
        {Number(payload[0].value).toLocaleString()} {unit}
      </p>
    </div>
  );
}

function ChartCard({ title, summary, table, children, wide }: {
  title: string;
  summary?: string;
  table: { columns: [string, string]; rows: Array<[string, string | number]> };
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section className={`ds-card an-chart${wide ? ' an-chart--wide' : ''}`} aria-label={title}>
      <header className="an-chart__head">
        <h2 className="an-chart__title">{title}</h2>
        {summary && <p className="an-chart__summary">{summary}</p>}
      </header>
      <div className="an-chart__plot" aria-hidden="true">{children}</div>
      <details className="an-chart__table">
        <summary>View as table</summary>
        <table>
          <thead><tr><th scope="col">{table.columns[0]}</th><th scope="col">{table.columns[1]}</th></tr></thead>
          <tbody>
            {table.rows.map(([a, b], i) => (
              <tr key={i}><td>{a}</td><td>{typeof b === 'number' ? b.toLocaleString() : b}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}

function HBarChart({ data, dataKey, nameKey, unit, theme }: { data: any[]; dataKey: string; nameKey: string; unit: string; theme: ChartTheme }) {
  const sorted = [...data].sort((a, b) => b[dataKey] - a[dataKey]);
  const height = Math.max(160, sorted.length * 36 + 16);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 4 }} barCategoryGap={8}>
        <CartesianGrid horizontal={false} stroke={theme.grid} />
        <XAxis type="number" hide />
        <YAxis
          dataKey={nameKey}
          type="category"
          width={110}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: theme.muted }}
        />
        <Tooltip cursor={{ fill: theme.grid }} content={<ChartTooltip unit={unit} />} />
        <Bar dataKey={dataKey} fill={theme.mark} radius={[0, 4, 4, 0]} maxBarSize={20} isAnimationActive={false}>
          <LabelList dataKey={dataKey} position="right" style={{ fontSize: 12, fill: theme.text, fontVariantNumeric: 'tabular-nums' }} formatter={(v: React.ReactNode) => (typeof v === 'number' ? v.toLocaleString() : v)} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLive, setIsLive] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const theme = useChartTheme();

  // Fetch real analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics/dashboard?range=${timeRange}`);

      if (!response.ok) {
        throw new Error('The analytics service returned an error.');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analytics couldn\'t be loaded.');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  useEffect(() => {
    // Real-time updates every 30 seconds when live
    const interval = setInterval(() => {
      if (isLive && !loading) {
        fetchAnalyticsData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLive, loading, fetchAnalyticsData]);

  const share = (part: number, total: number) => (total > 0 ? `${Math.round((part / total) * 100)}%` : '—');
  // Keep showing the previous data during a background refresh so the layout doesn't jump
  const showSkeleton = loading && !data;

  return (
    <main className="an" aria-busy={loading}>
      <header className="an-header">
        <div className="an-header__text">
          <h1 className="ds-h1">Analytics</h1>
          <p className="ds-body-text">Traffic and engagement for this site, from Vercel Analytics.</p>
        </div>
        <div className="an-controls">
          <div className="an-range" role="group" aria-label="Time range">
            {RANGES.map((range) => (
              <button
                key={range.id}
                type="button"
                className={`an-range__btn${timeRange === range.id ? ' is-active' : ''}`}
                aria-pressed={timeRange === range.id}
                onClick={() => setTimeRange(range.id)}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`an-live${isLive ? ' is-live' : ''}`}
            aria-pressed={isLive}
            onClick={() => setIsLive(!isLive)}
            title={isLive ? 'Refreshing every 30 seconds. Click to pause.' : 'Paused. Click to refresh every 30 seconds.'}
          >
            {isLive ? <Activity size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
            {isLive ? 'Live' : 'Paused'}
          </button>
        </div>
      </header>

      {error && (
        <div className="an-error" role="alert">
          <AlertCircle aria-hidden="true" />
          <div>
            <p className="an-error__title">Analytics couldn&apos;t be loaded</p>
            <p className="an-error__detail">{error}</p>
          </div>
          <button type="button" onClick={fetchAnalyticsData} className="ds-btn">
            <RefreshCw aria-hidden="true" />
            Try again
          </button>
        </div>
      )}

      {showSkeleton && (
        <div className="an-skeleton" aria-label="Loading analytics">
          <div className="an-metrics">
            {[0, 1, 2, 3].map((i) => <div key={i} className="ds-card an-skel-tile"><span className="an-skel an-skel--sm" /><span className="an-skel an-skel--lg" /></div>)}
          </div>
          <div className="an-charts">
            {[0, 1, 2, 3].map((i) => <div key={i} className={`ds-card an-skel-chart${i === 0 ? ' an-chart--wide' : ''}`}><span className="an-skel an-skel--sm" /><span className="an-skel an-skel--block" /></div>)}
          </div>
        </div>
      )}

      {data && !error && (
        <>
          <dl className="an-live-strip" aria-label="Right now">
            <div><dt>Active now</dt><dd>{data.realTimeData.activeUsers}</dd></div>
            <div><dt>Most viewed page</dt><dd>{data.realTimeData.currentPage}</dd></div>
            <div><dt>Top referrer</dt><dd>{data.realTimeData.topReferrer}</dd></div>
            <div><dt>Avg load time</dt><dd>{data.realTimeData.avgLoadTime}</dd></div>
          </dl>

          <dl className="an-metrics">
            <div className="ds-card an-metric"><dt>Visitors</dt><dd>{data.overview.totalVisitors.toLocaleString()}</dd></div>
            <div className="ds-card an-metric"><dt>Page views</dt><dd>{data.overview.pageViews.toLocaleString()}</dd></div>
            <div className="ds-card an-metric"><dt>Avg session</dt><dd>{data.overview.avgSessionDuration}</dd></div>
            <div className="ds-card an-metric"><dt>Bounce rate</dt><dd>{data.overview.bounceRate}%</dd></div>
          </dl>

          <div className="an-charts">
            <ChartCard
              wide
              title="Visitors per day"
              summary={`${data.visitorTrends.reduce((s, d) => s + d.visitors, 0).toLocaleString()} visitors in this range`}
              table={{ columns: ['Date', 'Visitors'], rows: data.visitorTrends.map((d) => [formatDay(d.date), d.visitors]) }}
            >
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.visitorTrends} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                  <defs>
                    <linearGradient id="an-visitors-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.mark} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={theme.mark} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={theme.grid} />
                  <XAxis dataKey="date" tickFormatter={formatDay} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: theme.muted }} minTickGap={24} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: theme.muted }} allowDecimals={false} width={44} />
                  <Tooltip
                    cursor={{ stroke: theme.border, strokeWidth: 1 }}
                    content={<ChartTooltip unit="visitors" labelFormatter={formatDay} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke={theme.mark}
                    strokeWidth={2}
                    fill="url(#an-visitors-fill)"
                    activeDot={{ r: 5, stroke: theme.surface, strokeWidth: 2, fill: theme.mark }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Top pages"
              summary="Page views by path"
              table={{ columns: ['Page', 'Views'], rows: data.topPages.map((p) => [p.page, p.views]) }}
            >
              <HBarChart data={data.topPages} dataKey="views" nameKey="page" unit="views" theme={theme} />
            </ChartCard>

            <ChartCard
              title="Traffic sources"
              summary="Where visitors came from"
              table={{ columns: ['Source', 'Visits'], rows: data.trafficSources.map((s) => [s.name, s.value]) }}
            >
              <HBarChart data={data.trafficSources} dataKey="value" nameKey="name" unit="visits" theme={theme} />
            </ChartCard>

            <ChartCard
              title="Countries"
              summary="Visitors by country"
              table={{ columns: ['Country', 'Visitors'], rows: data.geographicData.map((g) => [g.country, g.visitors]) }}
            >
              <HBarChart data={data.geographicData} dataKey="visitors" nameKey="country" unit="visitors" theme={theme} />
            </ChartCard>

            <section className="ds-card an-chart an-insights" aria-label="Visitor mix">
              <header className="an-chart__head">
                <h2 className="an-chart__title">Visitor mix</h2>
              </header>
              <dl className="an-insights__grid">
                <div>
                  <dt>New visitors</dt>
                  <dd>{data.overview.newVisitors.toLocaleString()}<span>{share(data.overview.newVisitors, data.overview.totalVisitors)}</span></dd>
                </div>
                <div>
                  <dt>Returning visitors</dt>
                  <dd>{data.overview.returningVisitors.toLocaleString()}<span>{share(data.overview.returningVisitors, data.overview.totalVisitors)}</span></dd>
                </div>
                <div>
                  <dt>Pages per session</dt>
                  <dd>{data.overview.totalVisitors > 0 ? (data.overview.pageViews / data.overview.totalVisitors).toFixed(1) : '—'}</dd>
                </div>
                <div>
                  <dt>Avg session length</dt>
                  <dd>{data.overview.avgSessionDuration}</dd>
                </div>
              </dl>
            </section>
          </div>
        </>
      )}

      <footer className="an-footer ds-meta" aria-live="polite">
        {updatedAt ? `Updated ${updatedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}` : 'Not loaded yet'}
        {loading && data ? ', refreshing…' : ''}
      </footer>
    </main>
  );
}
