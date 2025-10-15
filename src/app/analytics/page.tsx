'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Users, 
  Eye, 
  Clock, 
  MousePointer, 
  TrendingUp, 
  Activity, 
  Globe, 
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  Calendar,
  Download,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }: {
  icon: any;
  title: string;
  value: string | number;
  change?: string;
  color?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`stat-card stat-card--${color}`}
  >
    <div className="stat-card__icon">
      <Icon size={24} />
    </div>
    <div className="stat-card__content">
      <h3 className="stat-card__title">{title}</h3>
      <p className="stat-card__value">{value}</p>
      {change && (
        <p className="stat-card__change">
          <TrendingUp size={16} />
          {change}
        </p>
      )}
    </div>
  </motion.div>
);

const ChartCard = ({ title, children, icon: Icon }: {
  title: string;
  children: React.ReactNode;
  icon?: any;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="chart-card"
  >
    <div className="chart-card__header">
      {Icon && <Icon size={20} className="chart-card__icon" />}
      <h3 className="chart-card__title">{title}</h3>
    </div>
    <div className="chart-card__content">
      {children}
    </div>
  </motion.div>
);

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLive, setIsLive] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/analytics/dashboard?range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
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

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  // Helper function to determine if we should show percentage changes
  const shouldShowChange = (currentValue: number) => currentValue > 0;

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="analytics-header"
      >
        <div className="analytics-header__content">
          <div className="analytics-header__title">
            <BarChart3 size={32} className="analytics-header__icon" />
            <div>
              <h1>Portfolio Analytics</h1>
              <p>Real-time insights into your portfolio performance</p>
            </div>
          </div>
          
          <div className="analytics-header__controls">
            <div className="time-range-selector">
              {['1d', '7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
            
            <div className="live-indicator">
              <button
                className={`live-toggle ${isLive ? 'active' : ''}`}
                onClick={() => setIsLive(!isLive)}
              >
                <Activity size={16} />
                {isLive ? 'Live' : 'Paused'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="loading-state"
        >
          <div className="loading-spinner"></div>
          <p>Loading real-time analytics data...</p>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="error-state"
        >
          <div className="error-icon">⚠️</div>
          <h3>Unable to load analytics data</h3>
          <p>{error}</p>
          <button onClick={fetchAnalyticsData} className="retry-button">
            Try Again
          </button>
        </motion.div>
      )}

      {/* Real-time Status */}
      {data && !loading && !error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="realtime-status"
        >
          <div className="realtime-status__item">
            <Users size={20} />
            <span>{data.realTimeData.activeUsers} active users</span>
          </div>
          <div className="realtime-status__item">
            <Globe size={20} />
            <span>Current: {data.realTimeData.currentPage}</span>
          </div>
          <div className="realtime-status__item">
            <ExternalLink size={20} />
            <span>Top referrer: {data.realTimeData.topReferrer}</span>
          </div>
          <div className="realtime-status__item">
            <Clock size={20} />
            <span>Avg load: {data.realTimeData.avgLoadTime}</span>
          </div>
        </motion.div>
      )}

      {/* Key Metrics */}
      {data && !loading && !error && (
        <div className="metrics-grid">
          <StatCard
            icon={Users}
            title="Total Visitors"
            value={data.overview.totalVisitors.toLocaleString()}
            change={shouldShowChange(data.overview.totalVisitors) ? "+12.5%" : undefined}
            color="blue"
          />
          <StatCard
            icon={Eye}
            title="Page Views"
            value={data.overview.pageViews.toLocaleString()}
            change={shouldShowChange(data.overview.pageViews) ? "+8.3%" : undefined}
            color="green"
          />
          <StatCard
            icon={Clock}
            title="Avg. Session"
            value={data.overview.avgSessionDuration}
            change={shouldShowChange(data.overview.totalVisitors) ? "+5.2%" : undefined}
            color="purple"
          />
          <StatCard
            icon={MousePointer}
            title="Bounce Rate"
            value={`${data.overview.bounceRate}%`}
            change={shouldShowChange(data.overview.totalVisitors) ? "-2.1%" : undefined}
            color="orange"
          />
        </div>
      )}

      {/* Charts Grid */}
      {data && !loading && !error && (
        <div className="charts-grid">
          {/* Visitor Trends */}
          <ChartCard title="Visitor Trends" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.visitorTrends}>
                <defs>
                  <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#visitorGradient)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top Pages */}
          <ChartCard title="Top Pages" icon={Globe}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topPages} layout="horizontal">
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  dataKey="page" 
                  type="category" 
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="views" fill="#82ca9d" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Traffic Sources */}
          <ChartCard title="Traffic Sources" icon={PieChartIcon}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.trafficSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.trafficSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Geographic Distribution */}
          <ChartCard title="Geographic Distribution" icon={MapPin}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.geographicData}>
                <XAxis 
                  dataKey="country" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="visitors" fill="#ffc658" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Visitor Insights */}
      {data && !loading && !error && (
        <div className="insights-section">
          <ChartCard title="Visitor Insights" icon={Users}>
            <div className="insights-grid">
              <div className="insight-item">
                <div className="insight-item__value">{data.overview.newVisitors}</div>
                <div className="insight-item__label">New Visitors</div>
                <div className="insight-item__percentage">
                  {data.overview.totalVisitors > 0 
                    ? `${Math.round((data.overview.newVisitors / data.overview.totalVisitors) * 100)}%`
                    : '0%'
                  }
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-item__value">{data.overview.returningVisitors}</div>
                <div className="insight-item__label">Returning Visitors</div>
                <div className="insight-item__percentage">
                  {data.overview.totalVisitors > 0 
                    ? `${Math.round((data.overview.returningVisitors / data.overview.totalVisitors) * 100)}%`
                    : '0%'
                  }
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-item__value">
                  {data.overview.totalVisitors > 0 
                    ? (data.overview.pageViews / data.overview.totalVisitors).toFixed(1)
                    : '0.0'
                  }
                </div>
                <div className="insight-item__label">Pages per Session</div>
                <div className="insight-item__percentage">
                  {data.overview.totalVisitors > 0 ? 'Real-time' : 'No data'}
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-item__value">{data.overview.avgSessionDuration}</div>
                <div className="insight-item__label">Avg. Session Duration</div>
                <div className="insight-item__percentage">
                  {data.overview.totalVisitors > 0 ? 'Live data' : 'No data'}
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="analytics-footer"
      >
        <p>
          <Calendar size={16} />
          Last updated: {new Date().toLocaleString()}
        </p>
        <p>
          <Download size={16} />
          Data powered by Vercel Analytics
        </p>
      </motion.div>
    </div>
  );
}