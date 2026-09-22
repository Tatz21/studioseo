import React, { useState, useMemo } from 'react';
import {
  Search,
  Globe,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Smartphone,
  Monitor,
  Tablet,
  Plus,
  RefreshCw,
  ShieldCheck,
  FileCode,
  Layers,
  ArrowUpRight,
  Key
} from 'lucide-react';
import { GscStore } from '../../gsc/gscStore';
import { inspectUrlInGoogle, submitSitemapToGoogle, DEFAULT_GSC_API_KEY } from '../../gsc/gscApi';
import { GscDateRange, GscUrlInspectionResult, GscSitemapItem } from '../../gsc/types';

export const GoogleSearchConsoleExplorer: React.FC = () => {
  const properties = useMemo(() => GscStore.getAvailableProperties(), []);
  const [selectedProperty, setSelectedProperty] = useState<string>(properties[0]);
  const [dateRange, setDateRange] = useState<GscDateRange>('28d');
  const [activeSubTab, setActiveSubTab] = useState<'queries' | 'pages' | 'devices' | 'sitemaps' | 'inspect'>('queries');

  // Load property data from store
  const [propertyData, setPropertyData] = useState(() => GscStore.getPropertyData(selectedProperty, dateRange));

  // Query filter
  const [querySearch, setQuerySearch] = useState('');

  // Sitemap submission state
  const [newSitemapPath, setNewSitemapPath] = useState('');
  const [sitemaps, setSitemaps] = useState<GscSitemapItem[]>(() => propertyData.sitemaps);
  const [isSubmittingSitemap, setIsSubmittingSitemap] = useState(false);
  const [sitemapSuccessMsg, setSitemapSuccessMsg] = useState<string | null>(null);

  // URL inspection state
  const [inspectInputUrl, setInspectInputUrl] = useState('https://techflow.io/');
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<GscUrlInspectionResult | null>(null);

  // Switch property or date range
  const handlePropertyChange = (prop: string) => {
    setSelectedProperty(prop);
    const updated = GscStore.getPropertyData(prop, dateRange);
    setPropertyData(updated);
    setSitemaps(updated.sitemaps);
  };

  const handleDateRangeChange = (range: GscDateRange) => {
    setDateRange(range);
    const updated = GscStore.getPropertyData(selectedProperty, range);
    setPropertyData(updated);
    setSitemaps(updated.sitemaps);
  };

  const handleRefresh = () => {
    const updated = GscStore.getPropertyData(selectedProperty, dateRange);
    setPropertyData(updated);
    setSitemaps(updated.sitemaps);
  };

  // Submit sitemap handler
  const handleSubmitSitemap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSitemapPath.trim()) return;
    setIsSubmittingSitemap(true);
    setSitemapSuccessMsg(null);

    try {
      const newSitemap = await submitSitemapToGoogle(selectedProperty, newSitemapPath.trim());
      const updatedList = GscStore.addSitemap(newSitemap);
      setSitemaps(updatedList);
      setSitemapSuccessMsg(`Sitemap "${newSitemap.path}" successfully submitted to Google.`);
      setNewSitemapPath('');
      setTimeout(() => setSitemapSuccessMsg(null), 4000);
    } finally {
      setIsSubmittingSitemap(false);
    }
  };

  // URL Inspection handler
  const handleInspectUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inspectInputUrl.trim()) return;
    setIsInspecting(true);

    try {
      const res = await inspectUrlInGoogle(inspectInputUrl.trim());
      setInspectionResult(res);
    } finally {
      setIsInspecting(false);
    }
  };

  // Filtered queries
  const filteredQueries = useMemo(() => {
    if (!querySearch.trim()) return propertyData.queries;
    return propertyData.queries.filter(q => 
      q.query.toLowerCase().includes(querySearch.toLowerCase())
    );
  }, [propertyData.queries, querySearch]);

  const maskedKey = `${DEFAULT_GSC_API_KEY.slice(0, 6)}...${DEFAULT_GSC_API_KEY.slice(-4)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Top Header Controls */}
      <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Title & Property Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.2) 0%, rgba(52, 168, 83, 0.2) 100%)',
              border: '1px solid rgba(66, 133, 244, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Search size={22} color="#4285F4" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Google Search Console
                </h2>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
                  Connected
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Organic impressions, keyword rankings, click-through rates, and Google index inspection.
              </p>
            </div>

            {/* Property Dropdown */}
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

          {/* Controls: Date Range & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* API Key status badge */}
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
              <Key size={13} color="var(--accent-cyan)" />
              <span>Key: <strong style={{ color: 'var(--text-primary)' }}>{maskedKey}</strong></span>
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

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
              title="Refresh Google Search Console Data"
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
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #4285F4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Clicks</span>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
              <TrendingUp size={11} style={{ marginRight: '3px' }} /> +13.6%
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
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #9333EA' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Impressions</span>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
              <TrendingUp size={11} style={{ marginRight: '3px' }} /> +9.9%
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
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Average CTR</span>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
              <TrendingUp size={11} style={{ marginRight: '3px' }} /> +0.2%
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Average Position</span>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
              <TrendingUp size={11} style={{ marginRight: '3px' }} /> +0.9 pos
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

      {/* Time-Series Trend Visualizer */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
              Search Performance Timeline
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Daily clicks and organic impressions over {dateRange}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#4285F4' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Clicks</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#9333EA' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Impressions</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '4px',
          height: '140px',
          padding: '1rem 0.5rem 0 0.5rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {propertyData.timeSeries.map((pt, idx) => {
            const maxClicks = Math.max(...propertyData.timeSeries.map(p => p.clicks), 1);
            const clickHeight = Math.max(8, (pt.clicks / maxClicks) * 110);

            return (
              <div
                key={idx}
                title={`${pt.date}: ${pt.clicks} clicks, ${pt.impressions} imp, ${pt.ctr}% CTR, Pos ${pt.position}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '100%',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${clickHeight}px`,
                    background: 'linear-gradient(180deg, #4285F4 0%, rgba(66, 133, 244, 0.4) 100%)',
                    borderRadius: '3px 3px 0 0',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'brightness(1.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'none';
                  }}
                />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          <span>{propertyData.timeSeries[0]?.date}</span>
          <span>{propertyData.timeSeries[Math.floor(propertyData.timeSeries.length / 2)]?.date}</span>
          <span>{propertyData.timeSeries[propertyData.timeSeries.length - 1]?.date}</span>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveSubTab('queries')}
          className={`btn ${activeSubTab === 'queries' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}
        >
          <Search size={15} />
          <span>Top Queries ({propertyData.queries.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pages')}
          className={`btn ${activeSubTab === 'pages' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}
        >
          <Layers size={15} />
          <span>Pages ({propertyData.pages.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('devices')}
          className={`btn ${activeSubTab === 'devices' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}
        >
          <Smartphone size={15} />
          <span>Devices & Geography</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sitemaps')}
          className={`btn ${activeSubTab === 'sitemaps' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}
        >
          <FileCode size={15} />
          <span>Sitemaps ({sitemaps.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inspect')}
          className={`btn ${activeSubTab === 'inspect' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}
        >
          <ShieldCheck size={15} />
          <span>URL Inspection Tool</span>
        </button>
      </div>

      {/* Tab 1: Queries Table */}
      {activeSubTab === 'queries' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
              Top Organic Search Queries
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Filter keywords..."
                  className="input-base"
                  value={querySearch}
                  onChange={(e) => setQuerySearch(e.target.value)}
                  style={{ padding: '0.35rem 0.75rem 0.35rem 2rem', fontSize: '0.8rem', width: '220px' }}
                />
              </div>
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
                    <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: 'var(--accent-primary)', fontWeight: 600 }}>
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

      {/* Tab 2: Pages Table */}
      {activeSubTab === 'pages' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
            Top Performing Landing Pages
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Page URL</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Clicks</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Impressions</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>CTR</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Position</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'center' }}>Inspect</th>
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
                    <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setInspectInputUrl(p.url);
                          setActiveSubTab('inspect');
                          handleInspectUrl();
                        }}
                        className="btn btn-ghost"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.725rem' }}
                        title="Inspect in Google index"
                      >
                        <ShieldCheck size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Devices & Geography */}
      {activeSubTab === 'devices' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Devices Breakdown */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Smartphone size={16} color="var(--accent-primary)" />
              <span>Device Split</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {propertyData.devices.map((d, idx) => (
                <div key={idx} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {d.device === 'Desktop' && <Monitor size={16} color="#4285F4" />}
                      {d.device === 'Mobile' && <Smartphone size={16} color="var(--accent-primary)" />}
                      {d.device === 'Tablet' && <Tablet size={16} color="#9333EA" />}
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.device}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{d.share}%</span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                    <div style={{
                      width: `${d.share}%`,
                      height: '100%',
                      background: d.device === 'Desktop' ? '#4285F4' : d.device === 'Mobile' ? 'var(--accent-primary)' : '#9333EA',
                      borderRadius: '3px'
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>{d.clicks.toLocaleString()} clicks</span>
                    <span>{d.impressions.toLocaleString()} imp</span>
                    <span>CTR: {d.ctr}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geography / Countries */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={16} color="var(--accent-cyan)" />
              <span>Geographic Distribution</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {propertyData.countries.map((c, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ 
                      padding: '0.15rem 0.4rem', 
                      borderRadius: '4px', 
                      background: 'rgba(6, 182, 212, 0.15)', 
                      color: 'var(--accent-cyan)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {c.countryCode}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {c.countryName}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{c.clicks.toLocaleString()} clicks</span>
                    <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{c.share}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Sitemaps */}
      {activeSubTab === 'sitemaps' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Submit New Sitemap Form */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
              Submit a New Sitemap
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
              Enter the relative or absolute XML sitemap URL to submit directly to Googlebot crawler.
            </p>

            <form onSubmit={handleSubmitSitemap} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="/sitemap.xml or https://techflow.io/sitemap-news.xml"
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
                <span>{isSubmittingSitemap ? 'Submitting...' : 'Submit Sitemap'}</span>
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

          {/* Submitted Sitemaps Table */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
              Submitted Sitemaps ({sitemaps.length})
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Sitemap</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Type</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Discovered</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Indexed</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Last Submitted</th>
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
                        {new Date(s.lastSubmitted).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>
                        {s.status === 'success' && (
                          <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Success</span>
                        )}
                        {s.status === 'has_errors' && (
                          <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>Has errors</span>
                        )}
                        {s.status === 'pending' && (
                          <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: URL Inspection Tool */}
      {activeSubTab === 'inspect' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Input Bar */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
              Inspect Any URL in Google Index
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
              Diagnose indexation coverage, Googlebot crawler user-agent, canonical tag status, and mobile usability.
            </p>

            <form onSubmit={handleInspectUrl} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="https://techflow.io/features/seo-crawler"
                  className="input-base"
                  value={inspectInputUrl}
                  onChange={(e) => setInspectInputUrl(e.target.value)}
                  style={{ width: '100%', paddingLeft: '2.4rem', fontSize: '0.85rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={isInspecting || !inspectInputUrl.trim()}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
              >
                <ShieldCheck size={16} />
                <span>{isInspecting ? 'Inspecting Google Index...' : 'Inspect in Google'}</span>
              </button>
            </form>
          </div>

          {/* Inspection Result Display */}
          {inspectionResult && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Verdict Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: '8px',
                background: inspectionResult.verdict === 'PASS' 
                  ? 'rgba(16, 185, 129, 0.08)' 
                  : inspectionResult.verdict === 'FAIL'
                  ? 'rgba(244, 63, 94, 0.08)'
                  : 'rgba(245, 158, 11, 0.08)',
                border: inspectionResult.verdict === 'PASS'
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : inspectionResult.verdict === 'FAIL'
                  ? '1px solid rgba(244, 63, 94, 0.3)'
                  : '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {inspectionResult.verdict === 'PASS' && <CheckCircle2 size={26} color="var(--accent-primary)" />}
                  {inspectionResult.verdict === 'FAIL' && <XCircle size={26} color="#F43F5E" />}
                  {inspectionResult.verdict === 'NEUTRAL' && <AlertTriangle size={26} color="#F59E0B" />}

                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {inspectionResult.verdict === 'PASS' && 'URL is on Google'}
                      {inspectionResult.verdict === 'FAIL' && 'URL is not on Google: Indexing errors'}
                      {inspectionResult.verdict === 'NEUTRAL' && 'URL is on Google, but has issues'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Coverage: <strong>{inspectionResult.coverageState}</strong>
                    </div>
                  </div>
                </div>

                <span className={`badge ${inspectionResult.verdict === 'PASS' ? 'badge-emerald' : inspectionResult.verdict === 'FAIL' ? 'badge-rose' : 'badge-amber'}`} style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                  Verdict: {inspectionResult.verdict}
                </span>
              </div>

              {/* Inspection Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem'
              }}>
                {/* Crawl & Indexing Card */}
                <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={15} color="var(--accent-primary)" />
                    <span>Crawl & Discovery</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Crawled As:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{inspectionResult.crawledAs}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Crawl Allowed:</span>
                      <strong style={{ color: inspectionResult.crawlAllowed ? 'var(--accent-primary)' : '#F43F5E' }}>
                        {inspectionResult.crawlAllowed ? 'Yes (robots.txt)' : 'Blocked'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Page Fetch:</span>
                      <strong style={{ color: inspectionResult.pageFetch === 'Successful' ? 'var(--accent-primary)' : '#F43F5E' }}>
                        {inspectionResult.pageFetch}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Indexing Allowed:</span>
                      <strong style={{ color: inspectionResult.indexingAllowed ? 'var(--accent-primary)' : '#F43F5E' }}>
                        {inspectionResult.indexingAllowed ? 'Yes' : 'No'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Last Crawl:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{new Date(inspectionResult.lastCrawlTime).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Canonical Status Card */}
                <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={15} color="var(--accent-cyan)" />
                    <span>Canonical Evaluation</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>User-Declared Canonical:</div>
                      <div style={{ color: 'var(--text-primary)', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {inspectionResult.userCanonical}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>Google-Selected Canonical:</div>
                      <div style={{ color: 'var(--text-primary)', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {inspectionResult.googleCanonical}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Canonical Match:</span>
                      <span className={`badge ${inspectionResult.canonicalMatch ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.7rem' }}>
                        {inspectionResult.canonicalMatch ? 'Matches' : 'Mismatch'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile Usability & Rich Snippets */}
                <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Smartphone size={15} color="#9333EA" />
                    <span>Mobile & Enhancements</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Mobile Usability:</span>
                      <span style={{ color: inspectionResult.mobileUsability.includes('usable') ? 'var(--accent-primary)' : '#F43F5E', fontWeight: 600 }}>
                        {inspectionResult.mobileUsability}
                      </span>
                    </div>

                    <div style={{ marginTop: '0.25rem' }}>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Detected Rich Results:</div>
                      {inspectionResult.richResults.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {inspectionResult.richResults.map((r, i) => (
                            <span key={i} className="badge badge-cyan" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <ArrowUpRight size={11} /> {r}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>No structured rich items detected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
