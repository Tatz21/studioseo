import React, { useState } from 'react';
import { 
  Zap, 
  Smartphone, 
  Monitor, 
  Key, 
  AlertTriangle, 
  ArrowUpRight, 
  History, 
  SlidersHorizontal, 
  ChevronRight, 
  ShieldCheck 
} from 'lucide-react';
import { 
  PageSpeedStrategy, 
  PageSpeedAuditReport, 
  WebVitalLabMetric 
} from '../../pagespeed/types';
import { fetchPageSpeedAudit, DEFAULT_API_KEY } from '../../pagespeed/pagespeedApi';
import { PageSpeedStore } from '../../pagespeed/pagespeedStore';

export const PageSpeedExplorer: React.FC = () => {
  const [urlInput, setUrlInput] = useState('https://techflow.io');
  const [strategy, setStrategy] = useState<PageSpeedStrategy>('mobile');
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('pagespeed_custom_api_key') || DEFAULT_API_KEY;
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize report from store
  const [currentReport, setCurrentReport] = useState<PageSpeedAuditReport>(() => {
    const history = PageSpeedStore.getReports();
    return history[0] || null;
  });

  const [activeTab, setActiveTab] = useState<'opportunities' | 'diagnostics' | 'comparison' | 'history'>('opportunities');

  const handleRunAudit = async () => {
    if (!urlInput.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const report = await fetchPageSpeedAudit(urlInput.trim(), strategy, apiKey);
      setCurrentReport(report);
      PageSpeedStore.saveReport(report);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete PageSpeed audit.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    setApiKey(tempApiKey);
    localStorage.setItem('pagespeed_custom_api_key', tempApiKey);
    setIsApiKeyModalOpen(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const renderGauge = (label: string, score: number) => {
    const color = getScoreColor(score);
    return (
      <div 
        className="card" 
        style={{ 
          padding: '1.25rem', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          gap: '0.65rem'
        }}
      >
        <div style={{
          width: '74px',
          height: '74px',
          borderRadius: '50%',
          border: `4px solid ${color}`,
          background: `${color}12`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 20px ${color}30`
        }}>
          <span style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', fontWeight: 800, color }}>
            {score}
          </span>
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {label}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {score >= 90 ? 'Good' : score >= 50 ? 'Needs Work' : 'Poor'}
          </div>
        </div>
      </div>
    );
  };

  const renderLabMetric = (metric: WebVitalLabMetric) => {
    const color = getScoreColor(metric.score * 100);
    return (
      <div 
        key={metric.acronym}
        className="card" 
        style={{ 
          padding: '0.9rem 1.1rem', 
          borderLeft: `3px solid ${color}`,
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between' 
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {metric.name}
            </span>
            <span 
              className="badge" 
              style={{ 
                background: `${color}15`, 
                color, 
                border: `1px solid ${color}30`,
                fontSize: '0.65rem' 
              }}
            >
              {metric.status.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
            {metric.displayValue}
          </div>
        </div>
      </div>
    );
  };

  const comparison = PageSpeedStore.getStrategyComparison(currentReport?.url || urlInput);
  const historyReports = PageSpeedStore.getReports();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* 1. Header & Live API Controls Bar */}
      <div className="card" style={{
        padding: '1.15rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Top Info Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
            }}>
              <Zap size={20} color="#042F2E" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  Google PageSpeed Insights Integration
                </h3>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>API v5 Live</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                Official Lighthouse v13.4 audit engine with Mobile vs Desktop strategies & Core Web Vitals
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setTempApiKey(apiKey);
              setIsApiKeyModalOpen(true);
            }}
            className="btn btn-ghost"
            style={{ 
              fontSize: '0.75rem', 
              padding: '0.35rem 0.75rem', 
              border: '1px solid var(--border-subtle)',
              color: apiKey ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}
          >
            <Key size={13} />
            <span>API Key: {apiKey ? `${apiKey.substring(0, 8)}...` : 'Not Configured'}</span>
          </button>
        </div>

        {/* Input & Action Trigger Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Target URL Input */}
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <input
              type="text"
              placeholder="https://yourwebsite.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Strategy Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setStrategy('mobile')}
              disabled={isLoading}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.775rem',
                background: strategy === 'mobile' ? 'var(--accent-primary)' : 'transparent',
                color: strategy === 'mobile' ? '#042F2E' : 'var(--text-secondary)',
                fontWeight: strategy === 'mobile' ? 700 : 400,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Smartphone size={14} />
              <span>Mobile</span>
            </button>
            <button
              onClick={() => setStrategy('desktop')}
              disabled={isLoading}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.775rem',
                background: strategy === 'desktop' ? 'var(--accent-primary)' : 'transparent',
                color: strategy === 'desktop' ? '#042F2E' : 'var(--text-secondary)',
                fontWeight: strategy === 'desktop' ? 700 : 400,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Monitor size={14} />
              <span>Desktop</span>
            </button>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunAudit}
            disabled={isLoading}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.4rem', fontSize: '0.85rem' }}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                <span>Running Lighthouse...</span>
              </>
            ) : (
              <>
                <Zap size={16} />
                <span>Run PageSpeed Audit</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Try live presets:</span>
          {['https://techflow.io', 'https://example.com', 'https://wikipedia.org'].map(preset => (
            <button
              key={preset}
              onClick={() => {
                setUrlInput(preset);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.725rem'
              }}
            >
              {preset.replace('https://', '')}
            </button>
          ))}
        </div>

        {errorMessage && (
          <div style={{
            background: 'var(--status-critical-bg)',
            border: '1px solid var(--status-critical)',
            color: 'var(--text-primary)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={16} color="var(--status-critical)" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* 2. Executive 4-Category Lighthouse Scores */}
      {currentReport && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="badge badge-emerald">
                {currentReport.strategy === 'mobile' ? <Smartphone size={12} style={{ marginRight: '3px' }} /> : <Monitor size={12} style={{ marginRight: '3px' }} />}
                {currentReport.strategy.toUpperCase()} AUDIT
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {currentReport.url}
              </span>
              {currentReport.isSimulated && (
                <span className="badge badge-amber">Demo Benchmark</span>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Lighthouse {currentReport.lighthouseVersion} • {new Date(currentReport.fetchTime).toLocaleTimeString()}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '0.85rem'
          }}>
            {renderGauge('Performance', currentReport.scores.performance)}
            {renderGauge('Accessibility', currentReport.scores.accessibility)}
            {renderGauge('Best Practices', currentReport.scores.bestPractices)}
            {renderGauge('SEO Engine', currentReport.scores.seo)}
          </div>
        </div>
      )}

      {/* 3. Core Web Vitals Lab Metrics Ribbon */}
      {currentReport && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Core Web Vitals & Lab Diagnostics
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.85rem'
          }}>
            {renderLabMetric(currentReport.labMetrics.fcp)}
            {renderLabMetric(currentReport.labMetrics.lcp)}
            {renderLabMetric(currentReport.labMetrics.tbt)}
            {renderLabMetric(currentReport.labMetrics.cls)}
            {renderLabMetric(currentReport.labMetrics.speedIndex)}
          </div>
        </div>
      )}

      {/* 4. Diagnostic Sub-Tabs Navigation */}
      {currentReport && (
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          gap: '0.5rem',
          marginTop: '0.5rem'
        }}>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`btn ${activeTab === 'opportunities' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}
          >
            <Zap size={15} />
            <span>Opportunities ({currentReport.opportunities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`btn ${activeTab === 'diagnostics' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}
          >
            <SlidersHorizontal size={15} />
            <span>Diagnostics ({currentReport.diagnostics.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`btn ${activeTab === 'comparison' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}
          >
            <ArrowUpRight size={15} />
            <span>Mobile vs Desktop Comparison</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}
          >
            <History size={15} />
            <span>Audit History ({historyReports.length})</span>
          </button>
        </div>
      )}

      {/* 5. Sub-Tab 1: Opportunities */}
      {currentReport && activeTab === 'opportunities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {currentReport.opportunities.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No critical opportunities found — page is highly optimized!
            </div>
          ) : (
            currentReport.opportunities.map(opp => (
              <div 
                key={opp.id} 
                className="card" 
                style={{ 
                  padding: '1.15rem 1.35rem', 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderLeft: '3px solid #F59E0B'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {opp.title}
                    </h4>
                    {opp.displayValue && (
                      <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                        {opp.displayValue}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    {opp.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 6. Sub-Tab 2: Diagnostics */}
      {currentReport && activeTab === 'diagnostics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {currentReport.diagnostics.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No diagnostic issues reported.
            </div>
          ) : (
            currentReport.diagnostics.map(diag => (
              <div 
                key={diag.id} 
                className="card" 
                style={{ 
                  padding: '1.15rem 1.35rem', 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {diag.title}
                    </h4>
                    {diag.displayValue && (
                      <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                        {diag.displayValue}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    {diag.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 7. Sub-Tab 3: Mobile vs Desktop Comparison */}
      {currentReport && activeTab === 'comparison' && (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Mobile vs Desktop Strategy Comparative Breakdown
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Target: <strong style={{ color: 'var(--text-primary)' }}>{comparison.url}</strong>
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Lighthouse Metric</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>📱 Mobile Strategy</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>💻 Desktop Strategy</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Strategy Delta</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Performance Score</td>
                  <td style={{ padding: '0.75rem 1rem', color: getScoreColor(comparison.mobile?.scores.performance || 0), fontWeight: 700 }}>
                    {comparison.mobile ? `${comparison.mobile.scores.performance} / 100` : 'Not run'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: getScoreColor(comparison.desktop?.scores.performance || 0), fontWeight: 700 }}>
                    {comparison.desktop ? `${comparison.desktop.scores.performance} / 100` : 'Not run'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: comparison.scoreDelta.performance >= 0 ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                    {comparison.mobile && comparison.desktop ? `${comparison.scoreDelta.performance > 0 ? '+' : ''}${comparison.scoreDelta.performance} pts` : '—'}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Accessibility</td>
                  <td style={{ padding: '0.75rem 1rem', color: getScoreColor(comparison.mobile?.scores.accessibility || 0) }}>
                    {comparison.mobile ? `${comparison.mobile.scores.accessibility} / 100` : 'Not run'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: getScoreColor(comparison.desktop?.scores.accessibility || 0) }}>
                    {comparison.desktop ? `${comparison.desktop.scores.accessibility} / 100` : 'Not run'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {comparison.mobile && comparison.desktop ? `${comparison.scoreDelta.accessibility > 0 ? '+' : ''}${comparison.scoreDelta.accessibility} pts` : '—'}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Best Practices</td>
                  <td style={{ padding: '0.75rem 1rem', color: getScoreColor(comparison.mobile?.scores.bestPractices || 0) }}>
                    {comparison.mobile ? `${comparison.mobile.scores.bestPractices} / 100` : 'Not run'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: getScoreColor(comparison.desktop?.scores.bestPractices || 0) }}>
                    {comparison.desktop ? `${comparison.desktop.scores.bestPractices} / 100` : 'Not run'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {comparison.mobile && comparison.desktop ? `${comparison.scoreDelta.bestPractices > 0 ? '+' : ''}${comparison.scoreDelta.bestPractices} pts` : '—'}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>SEO Score</td>
                  <td style={{ padding: '0.75rem 1rem', color: getScoreColor(comparison.mobile?.scores.seo || 0) }}>
                    {comparison.mobile ? `${comparison.mobile.scores.seo} / 100` : 'Not run'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: getScoreColor(comparison.desktop?.scores.seo || 0) }}>
                    {comparison.desktop ? `${comparison.desktop.scores.seo} / 100` : 'Not run'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {comparison.mobile && comparison.desktop ? `${comparison.scoreDelta.seo > 0 ? '+' : ''}${comparison.scoreDelta.seo} pts` : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Sub-Tab 4: Audit History */}
      {currentReport && activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {historyReports.map(item => (
            <div 
              key={item.id}
              onClick={() => setCurrentReport(item)}
              className="card"
              style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderLeft: currentReport.id === item.id ? '4px solid var(--accent-primary)' : '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {item.strategy === 'mobile' ? <Smartphone size={12} /> : <Monitor size={12} />}
                  {item.strategy.toUpperCase()}
                </span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.url}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    {new Date(item.fetchTime).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: getScoreColor(item.scores.performance) }}>
                    {item.scores.performance}
                  </div>
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Perf Score</div>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API Key Modal */}
      {isApiKeyModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 150,
          padding: '1rem'
        }}>
          <div className="card" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Key size={20} color="var(--accent-primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Google PageSpeed Insights API Key
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                  Manage your authenticated Google Cloud credentials
                </p>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                API Key
              </label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--accent-primary)' }}>
                <ShieldCheck size={12} />
                <span>Pre-configured and verified operational</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="btn btn-ghost"
                style={{ fontSize: '0.825rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="btn btn-primary"
                style={{ fontSize: '0.825rem' }}
              >
                Save API Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
