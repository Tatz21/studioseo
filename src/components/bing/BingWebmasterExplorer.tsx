import React, { useState, useMemo } from 'react';
import {
  Compass,
  Zap,
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Plus,
  Search,
  FileCode,
  Layers,
  Send,
  Key,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import { BingStore } from '../../bing/bingStore';
import { submitIndexNowBatch, submitSitemapToBing, DEFAULT_BING_API_KEY } from '../../bing/bingApi';
import { BingDateRange, IndexNowSubmission, BingSitemapItem } from '../../bing/types';

export const BingWebmasterExplorer: React.FC = () => {
  const properties = useMemo(() => BingStore.getAvailableProperties(), []);
  const [selectedProperty, setSelectedProperty] = useState<string>(properties[0]);
  const [dateRange, setDateRange] = useState<BingDateRange>('28d');
  const [activeSubTab, setActiveSubTab] = useState<'indexnow' | 'keywords' | 'pages' | 'crawl' | 'sitemaps'>('indexnow');

  const [propertyData, setPropertyData] = useState(() => BingStore.getPropertyData(selectedProperty, dateRange));

  // IndexNow state
  const [indexNowUrlInput, setIndexNowUrlInput] = useState('');
  const [isSubmittingIndexNow, setIsSubmittingIndexNow] = useState(false);
  const [indexNowSubmissions, setIndexNowSubmissions] = useState<IndexNowSubmission[]>(() => BingStore.getIndexNowSubmissions());
  const [indexNowSuccessMsg, setIndexNowSuccessMsg] = useState<string | null>(null);

  // Keyword filter
  const [querySearch, setQuerySearch] = useState('');

  // Sitemap state
  const [sitemaps, setSitemaps] = useState<BingSitemapItem[]>(() => propertyData.sitemaps);
  const [newSitemapPath, setNewSitemapPath] = useState('');
  const [isSubmittingSitemap, setIsSubmittingSitemap] = useState(false);
  const [sitemapSuccessMsg, setSitemapSuccessMsg] = useState<string | null>(null);

  const handlePropertyChange = (prop: string) => {
    setSelectedProperty(prop);
    const updated = BingStore.getPropertyData(prop, dateRange);
    setPropertyData(updated);
    setSitemaps(updated.sitemaps);
  };

  const handleDateRangeChange = (range: BingDateRange) => {
    setDateRange(range);
    const updated = BingStore.getPropertyData(selectedProperty, range);
    setPropertyData(updated);
    setSitemaps(updated.sitemaps);
  };

  const handleRefresh = () => {
    const updated = BingStore.getPropertyData(selectedProperty, dateRange);
    setPropertyData(updated);
    setSitemaps(updated.sitemaps);
    setIndexNowSubmissions(BingStore.getIndexNowSubmissions());
  };

  // Submit to IndexNow
  const handleSubmitIndexNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indexNowUrlInput.trim()) return;

    setIsSubmittingIndexNow(true);
    setIndexNowSuccessMsg(null);

    const urls = indexNowUrlInput
      .split(/[\n,]+/)
      .map(u => u.trim())
      .filter(u => u.length > 0);

    try {
      const res = await submitIndexNowBatch(selectedProperty, DEFAULT_BING_API_KEY, urls);
      const updatedSubmissions = BingStore.addIndexNowSubmission(res);
      setIndexNowSubmissions(updatedSubmissions);
      setIndexNowSuccessMsg(`Submitted ${res.urlList.length} URL(s) to IndexNow (Bing & Yandex) with HTTP 200.`);
      setIndexNowUrlInput('');

      // update remaining quota
      const updatedProp = BingStore.getPropertyData(selectedProperty, dateRange);
      setPropertyData(updatedProp);

      setTimeout(() => setIndexNowSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit URLs to IndexNow');
    } finally {
      setIsSubmittingIndexNow(false);
    }
  };

  // Submit Sitemap
  const handleSubmitSitemap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSitemapPath.trim()) return;

    setIsSubmittingSitemap(true);
    setSitemapSuccessMsg(null);

    try {
      const res = await submitSitemapToBing(selectedProperty, newSitemapPath.trim());
      const updated = BingStore.addSitemap(res);
      setSitemaps(updated);
      setSitemapSuccessMsg(`Sitemap "${res.path}" submitted to Bing Webmaster Tools.`);
      setNewSitemapPath('');
      setTimeout(() => setSitemapSuccessMsg(null), 4000);
    } finally {
      setIsSubmittingSitemap(false);
    }
  };

  const filteredQueries = useMemo(() => {
    if (!querySearch.trim()) return propertyData.queries;
    return propertyData.queries.filter(q => q.query.toLowerCase().includes(querySearch.toLowerCase()));
  }, [propertyData.queries, querySearch]);

  const maskedKey = `${DEFAULT_BING_API_KEY.slice(0, 6)}...${DEFAULT_BING_API_KEY.slice(-4)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Brand & Property */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0, 164, 239, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
              border: '1px solid rgba(0, 164, 239, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Compass size={22} color="#00A4EF" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Bing Webmaster Tools & IndexNow
                </h2>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={11} />
                  IndexNow Active
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Organic Bing and Copilot search analytics, crawl issue telemetry, and instant IndexNow publishing.
              </p>
            </div>

            {/* Property Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
              <Globe size={15} color="var(--text-secondary)" />
              <select
                className="input-base"
                value={selectedProperty}
                onChange={(e) => handlePropertyChange(e.target.value)}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', width: 'auto', background: 'var(--bg-card)' }}
              >
                {properties.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* API Key Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)'
            }}>
              <Key size={13} color="#00A4EF" />
              <span>Bing Key: <strong style={{ color: 'var(--text-primary)' }}>{maskedKey}</strong></span>
            </div>

            {/* Date Range Selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-subtle)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}>
              <button
                onClick={() => handleDateRangeChange('7d')}
                style={{
                  background: dateRange === '7d' ? 'var(--accent-primary)' : 'transparent',
                  color: dateRange === '7d' ? '#042F2E' : 'var(--text-secondary)',
                  fontWeight: dateRange === '7d' ? 600 : 400,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.7rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                7 Days
              </button>
              <button
                onClick={() => handleDateRangeChange('28d')}
                style={{
                  background: dateRange === '28d' ? 'var(--accent-primary)' : 'transparent',
                  color: dateRange === '28d' ? '#042F2E' : 'var(--text-secondary)',
                  fontWeight: dateRange === '28d' ? 600 : 400,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.7rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                28 Days
              </button>
              <button
                onClick={() => handleDateRangeChange('3m')}
                style={{
                  background: dateRange === '3m' ? 'var(--accent-primary)' : 'transparent',
                  color: dateRange === '3m' ? '#042F2E' : 'var(--text-secondary)',
                  fontWeight: dateRange === '3m' ? 600 : 400,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.7rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                3 Months
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
              title="Refresh Bing Webmaster Data"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Executive Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem'
      }}>
        {/* Total Clicks */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #00A4EF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Bing Clicks</span>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
              <TrendingUp size={11} style={{ marginRight: '3px' }} /> +15.2%
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            {propertyData.totals.clicks.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            vs prev period: {propertyData.totals.previousPeriod?.clicks.toLocaleString()}
          </div>
        </div>

        {/* Total Impressions */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Bing Impressions</span>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
              <TrendingUp size={11} style={{ marginRight: '3px' }} /> +8.7%
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            {propertyData.totals.impressions >= 1000000 
              ? `${(propertyData.totals.impressions / 1000000).toFixed(2)}M` 
              : `${(propertyData.totals.impressions / 1000).toFixed(1)}K`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            vs prev period: {propertyData.totals.previousPeriod ? (propertyData.totals.previousPeriod.impressions >= 1000000 ? `${(propertyData.totals.previousPeriod.impressions / 1000000).toFixed(2)}M` : `${(propertyData.totals.previousPeriod.impressions / 1000).toFixed(1)}K`) : 'N/A'}
          </div>
        </div>

        {/* Average CTR */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #06B6D4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Bing CTR</span>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
              <TrendingUp size={11} style={{ marginRight: '3px' }} /> +0.3%
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            {propertyData.totals.ctr}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            vs prev period: {propertyData.totals.previousPeriod?.ctr}%
          </div>
        </div>

        {/* Average Position */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Bing Avg Rank</span>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
              <TrendingUp size={11} style={{ marginRight: '3px' }} /> +1.1 pos
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            {propertyData.totals.position}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            vs prev period: {propertyData.totals.previousPeriod?.position}
          </div>
        </div>
      </div>

      {/* Crawl Health Summary Banner */}
      <div className="card" style={{ padding: '1rem 1.25rem', background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <ShieldCheck size={24} color="var(--accent-primary)" />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Bingbot Crawl Health: <strong style={{ color: 'var(--accent-primary)' }}>{propertyData.totals.crawlSuccessRate}% Success</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {propertyData.totals.pagesCrawled.toLocaleString()} pages crawled by Bingbot • {propertyData.totals.crawlErrors} crawl errors detected
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveSubTab('crawl')}
            className="btn btn-ghost"
            style={{ fontSize: '0.775rem', padding: '0.35rem 0.75rem' }}
          >
            <span>View Crawl Diagnostics ({propertyData.crawlIssues.length} issues)</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveSubTab('indexnow')}
          className={`btn ${activeSubTab === 'indexnow' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}
        >
          <Zap size={15} />
          <span>IndexNow Submitter</span>
        </button>

        <button
          onClick={() => setActiveSubTab('keywords')}
          className={`btn ${activeSubTab === 'keywords' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}
        >
          <Search size={15} />
          <span>Search Keywords ({propertyData.queries.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pages')}
          className={`btn ${activeSubTab === 'pages' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}
        >
          <Layers size={15} />
          <span>Page Traffic</span>
        </button>

        <button
          onClick={() => setActiveSubTab('crawl')}
          className={`btn ${activeSubTab === 'crawl' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}
        >
          <AlertTriangle size={15} />
          <span>Crawl Issues ({propertyData.crawlIssues.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sitemaps')}
          className={`btn ${activeSubTab === 'sitemaps' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}
        >
          <FileCode size={15} />
          <span>Bing Sitemaps ({sitemaps.length})</span>
        </button>
      </div>

      {/* Tab 1: IndexNow Instant Submitter */}
      {activeSubTab === 'indexnow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Submission Form Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={18} color="#00A4EF" />
                  <span>Instant IndexNow Publishing</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                  Notify Bing, Yandex, Seznam, and Naver instantly whenever pages are created, updated, or deleted without waiting for crawler discovery.
                </p>
              </div>

              {/* Quota Tracker */}
              <div style={{
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Daily Submission Quota</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {propertyData.indexNowQuota.remaining.toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/ {propertyData.indexNowQuota.dailyLimit.toLocaleString()} remaining</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitIndexNow} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  URLs to Submit (one per line or comma-separated)
                </label>
                <textarea
                  rows={4}
                  placeholder={`https://${selectedProperty}/features/seo-crawler\nhttps://${selectedProperty}/blog/ai-search-optimization\nhttps://${selectedProperty}/pricing`}
                  className="input-base"
                  value={indexNowUrlInput}
                  onChange={(e) => setIndexNowUrlInput(e.target.value)}
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.825rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                {/* Presets */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Quick Insert:</span>
                  <button
                    type="button"
                    onClick={() => setIndexNowUrlInput(`https://${selectedProperty}/blog/seo-trends-2026`)}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                  >
                    + New Blog Post
                  </button>
                  <button
                    type="button"
                    onClick={() => setIndexNowUrlInput(`https://${selectedProperty}/features/indexnow\nhttps://${selectedProperty}/pricing`)}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                  >
                    + Updated Features
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingIndexNow || !indexNowUrlInput.trim()}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1.35rem' }}
                >
                  <Send size={15} />
                  <span>{isSubmittingIndexNow ? 'Broadcasting to IndexNow...' : 'Submit to IndexNow'}</span>
                </button>
              </div>
            </form>

            {indexNowSuccessMsg && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--accent-primary)',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <CheckCircle2 size={18} />
                <span>{indexNowSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* Submission History Log */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="var(--accent-cyan)" />
              <span>Recent IndexNow Submissions ({indexNowSubmissions.length})</span>
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Timestamp</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Host</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'center' }}>URLs</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>HTTP Response</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {indexNowSubmissions.map((sub, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-secondary)' }}>
                        {new Date(sub.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {sub.host}
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>
                        <span className="badge badge-cyan" style={{ fontSize: '0.725rem' }}>
                          {sub.urlList.length} URL{sub.urlList.length > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem' }}>
                        <span style={{ fontFamily: 'monospace', color: 'var(--accent-primary)', fontSize: '0.75rem' }}>
                          HTTP {sub.httpResponseCode} OK
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem' }}>
                        <span className="badge badge-emerald" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Check size={11} /> Accepted
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Keywords */}
      {activeSubTab === 'keywords' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
              Top Bing & Copilot Search Keywords
            </h3>

            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Filter search queries..."
                className="input-base"
                value={querySearch}
                onChange={(e) => setQuerySearch(e.target.value)}
                style={{ padding: '0.35rem 0.75rem 0.35rem 2rem', fontSize: '0.8rem', width: '220px' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Query Keyword</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Clicks</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Impressions</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>CTR</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Avg Position</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'center' }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueries.map((q, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {q.query}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontWeight: 600, color: '#FFFFFF' }}>
                      {q.clicks.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {q.impressions.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: '#00A4EF', fontWeight: 600 }}>
                      {q.ctr}%
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>
                      {q.position}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>
                      {q.trend === 'up' && (
                        <span className="badge badge-emerald" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <TrendingUp size={11} /> +{q.change}
                        </span>
                      )}
                      {q.trend === 'down' && (
                        <span className="badge badge-rose" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <TrendingDown size={11} /> {q.change}
                        </span>
                      )}
                      {q.trend === 'stable' && (
                        <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Minus size={11} /> 0.0
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Pages */}
      {activeSubTab === 'pages' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
            Top Bing Search Landing Pages
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Page URL</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Clicks</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Impressions</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>CTR</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Avg Position</th>
                </tr>
              </thead>
              <tbody>
                {propertyData.pages.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.65rem 0.5rem' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.path}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>{p.url}</div>
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontWeight: 600, color: '#FFFFFF' }}>
                      {p.clicks.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {p.impressions.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      {p.ctr}%
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>
                      {p.position}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Crawl Issues */}
      {activeSubTab === 'crawl' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Status Code Visual Bar */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
              Bingbot HTTP Response Distribution
            </h3>

            <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden', marginBottom: '0.75rem' }}>
              <div style={{ width: '92%', background: 'var(--accent-primary)' }} title="200 OK (92%)" />
              <div style={{ width: '4%', background: '#F43F5E' }} title="404 Not Found (4%)" />
              <div style={{ width: '2.5%', background: '#F59E0B' }} title="403 Blocked (2.5%)" />
              <div style={{ width: '1.5%', background: '#9333EA' }} title="500 Server Error (1.5%)" />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
                <span>200 OK (3,146)</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F43F5E' }} />
                <span>404 Not Found (24)</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                <span>403 Robots Blocked (15)</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9333EA' }} />
                <span>500 Server Error (6)</span>
              </span>
            </div>
          </div>

          {/* Issues List */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
              Detected Crawl Issues & Evidence
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {propertyData.crawlIssues.map(issue => (
                <div
                  key={issue.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {issue.severity === 'critical' && <AlertOctagon size={18} color="#F43F5E" />}
                      {issue.severity === 'warning' && <AlertTriangle size={18} color="#F59E0B" />}
                      {issue.severity === 'info' && <CheckCircle2 size={18} color="var(--accent-cyan)" />}
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{issue.issueType}</span>
                      <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.05)' }}>
                        HTTP {issue.statusCode}
                      </span>
                    </div>

                    <span className={`badge ${issue.severity === 'critical' ? 'badge-rose' : issue.severity === 'warning' ? 'badge-amber' : 'badge-cyan'}`} style={{ fontSize: '0.7rem' }}>
                      {issue.count} affected URLs
                    </span>
                  </div>

                  <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {issue.description}
                  </p>

                  <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Sample URLs:</div>
                    {issue.sampleUrls.map((url, uidx) => (
                      <div key={uidx} style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
                        {url}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Sitemaps */}
      {activeSubTab === 'sitemaps' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Submit Sitemap */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
              Submit Sitemap to Bing Webmaster
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
              Submit your XML sitemap URL to instruct Bingbot to discover and index your pages.
            </p>

            <form onSubmit={handleSubmitSitemap} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder={`https://${selectedProperty}/sitemap.xml`}
                className="input-base"
                value={newSitemapPath}
                onChange={(e) => setNewSitemapPath(e.target.value)}
                style={{ flex: 1, minWidth: '280px', fontSize: '0.85rem' }}
              />
              <button
                type="submit"
                disabled={isSubmittingSitemap || !newSitemapPath.trim()}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
              >
                <Plus size={16} />
                <span>{isSubmittingSitemap ? 'Submitting to Bing...' : 'Submit Sitemap'}</span>
              </button>
            </form>

            {sitemapSuccessMsg && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.6rem 0.85rem',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--accent-primary)',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={16} />
                <span>{sitemapSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* Sitemaps Table */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
              Bing Sitemaps Catalog ({sitemaps.length})
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Sitemap URL</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Type</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Discovered</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Indexed by Bing</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Last Crawled</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sitemaps.map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.65rem 0.5rem', fontWeight: 500, color: 'var(--accent-cyan)' }}>
                        {s.path}
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-secondary)' }}>
                        <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.05)' }}>
                          {s.type}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontWeight: 600, color: '#FFFFFF' }}>
                        {s.discoveredUrls}
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontWeight: 600, color: 'var(--accent-primary)' }}>
                        {s.indexedUrls}
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-secondary)' }}>
                        {new Date(s.lastCrawlDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>
                        <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                          Success
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
