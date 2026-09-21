import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Layers, 
  HardDrive, 
  Trophy,
  Filter,
  CheckCheck
} from 'lucide-react';
import { PageAuditEngine } from '../../pageaudit/pageAuditEngine';
import { 
  PageAuditResult, 
  RecommendationPriority, 
  RecommendationCategory,
  WebVitalMetric
} from '../../pageaudit/types';

interface PageAuditViewProps {
  initialHtml: string;
  initialUrl: string;
}

export const PageAuditView: React.FC<PageAuditViewProps> = ({
  initialHtml,
  initialUrl,
}) => {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [auditResult, setAuditResult] = useState<PageAuditResult>(() => {
    return PageAuditEngine.auditPage(initialHtml, initialUrl);
  });
  const [activeTab, setActiveTab] = useState<'recommendations' | 'webvitals' | 'checks'>('recommendations');
  const [priorityFilter, setPriorityFilter] = useState<'all' | RecommendationPriority>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | RecommendationCategory>('all');
  const [expandedRecId, setExpandedRecId] = useState<string | null>('rec-cls-dimensions');
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [checkStatusFilter, setCheckStatusFilter] = useState<'all' | 'passed' | 'warning' | 'critical'>('all');
  const [checkSearch, setCheckSearch] = useState('');

  const handleReAudit = () => {
    const result = PageAuditEngine.auditPage(initialHtml, currentUrl);
    setAuditResult(result);
  };

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const filteredRecommendations = useMemo(() => {
    return auditResult.recommendations.filter(rec => {
      if (priorityFilter !== 'all' && rec.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all' && rec.category !== categoryFilter) return false;
      return true;
    });
  }, [auditResult.recommendations, priorityFilter, categoryFilter]);

  const filteredChecks = useMemo(() => {
    return auditResult.checks.filter(check => {
      if (checkStatusFilter !== 'all' && check.status !== checkStatusFilter) return false;
      if (checkSearch.trim()) {
        const query = checkSearch.toLowerCase();
        return check.name.toLowerCase().includes(query) || check.category.toLowerCase().includes(query);
      }
      return true;
    });
  }, [auditResult.checks, checkStatusFilter, checkSearch]);

  const getStatusColor = (status: 'good' | 'needs-work' | 'poor') => {
    switch (status) {
      case 'good': return '#10B981';
      case 'needs-work': return '#F59E0B';
      case 'poor': return '#EF4444';
    }
  };

  const getPriorityBadge = (priority: RecommendationPriority) => {
    switch (priority) {
      case 'critical':
        return <span className="badge badge-rose">Critical Priority</span>;
      case 'high':
        return <span className="badge badge-amber">High Priority</span>;
      case 'medium':
        return <span className="badge badge-cyan">Medium Priority</span>;
      case 'quick-win':
        return <span className="badge badge-emerald">Quick Win</span>;
    }
  };

  const renderMetricTile = (metric: WebVitalMetric) => {
    const color = getStatusColor(metric.status);
    return (
      <div 
        key={metric.acronym}
        className="card" 
        style={{ 
          padding: '1rem 1.15rem', 
          borderTop: `3px solid ${color}`,
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
              {metric.status.toUpperCase().replace('-', ' ')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
              {metric.formatted}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              (Target &lt; {metric.thresholds.good}{metric.unit})
            </span>
          </div>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.35 }}>
          {metric.description}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* 1. MVP Milestone Completion Ribbon */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #06B6D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            <Trophy size={22} color="#042F2E" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Core MVP Boundary Reached — Phase 10 Complete
              </h3>
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                <CheckCheck size={12} style={{ marginRight: '3px' }} /> 10 of 10 Phases Operational
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Website Manager → Crawler → Extractor → Technical SEO → SEO Scoring → SEO Map → <strong>Page Audit & Actionable Recommendations</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <input
            type="text"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              width: '260px'
            }}
          />
          <button
            onClick={handleReAudit}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', whiteSpace: 'nowrap' }}
          >
            <RotateCcw size={14} />
            <span>Re-Audit Page</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Dual-Score Card & Checks Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1rem'
      }}>
        {/* Left: Overall Health & PageSpeed Scores */}
        <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Executive Audit Scores
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {/* Overall SEO Score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  border: '3px solid var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(16, 185, 129, 0.1)',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)'
                }}>
                  <span style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    {auditResult.overallScore}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Overall Page Health
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <span className="badge badge-emerald">Grade {auditResult.grade}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weighted Audit</span>
                  </div>
                </div>
              </div>

              {/* PageSpeed Performance Score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  border: '3px solid #06B6D4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(6, 182, 212, 0.1)',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.25)'
                }}>
                  <span style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#06B6D4' }}>
                    {auditResult.pageSpeedScore}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    PageSpeed Score
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <span className="badge badge-cyan">Core Web Vitals</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mobile / Desktop</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            marginTop: '1.25rem', 
            paddingTop: '0.85rem', 
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Audited Target: <strong style={{ color: 'var(--text-primary)' }}>{auditResult.targetUrl}</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>Scanned at {auditResult.scannedAt}</span>
          </div>
        </div>

        {/* Right: Checks Summary Matrix & Tally */}
        <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Verification Rule Health
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginTop: '0.85rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.75rem' }}>
                  <CheckCircle2 size={14} /> Passed
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
                  {auditResult.checksSummary.passed}
                </div>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#F59E0B', fontSize: '0.75rem' }}>
                  <AlertTriangle size={14} /> Warnings
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FCD34D', marginTop: '0.2rem' }}>
                  {auditResult.checksSummary.warnings}
                </div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#EF4444', fontSize: '0.75rem' }}>
                  <ShieldAlert size={14} /> Critical
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FCA5A5', marginTop: '0.2rem' }}>
                  {auditResult.checksSummary.critical}
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            marginTop: '1.25rem', 
            paddingTop: '0.85rem', 
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Total Evaluated Checks: <strong style={{ color: 'var(--text-primary)' }}>{auditResult.checksSummary.total} Standard Rules</strong></span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
              {Math.round((auditResult.checksSummary.passed / auditResult.checksSummary.total) * 100)}% Pass Rate
            </span>
          </div>
        </div>
      </div>

      {/* 3. Core Web Vitals Metric Tiles Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.85rem'
      }}>
        {renderMetricTile(auditResult.webVitals.lcp)}
        {renderMetricTile(auditResult.webVitals.inp)}
        {renderMetricTile(auditResult.webVitals.cls)}
        {renderMetricTile(auditResult.webVitals.fcp)}
        {renderMetricTile(auditResult.webVitals.ttfb)}
        {renderMetricTile(auditResult.webVitals.speedIndex)}
      </div>

      {/* 4. Diagnostic Sub-Tabs Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '0.5rem',
        marginTop: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`btn ${activeTab === 'recommendations' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}
        >
          <Sparkles size={16} />
          <span>Prioritized Action Plan ({auditResult.recommendations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('webvitals')}
          className={`btn ${activeTab === 'webvitals' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}
        >
          <Zap size={16} />
          <span>PageSpeed & Resource Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab('checks')}
          className={`btn ${activeTab === 'checks' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}
        >
          <Layers size={16} />
          <span>All On-Page Checks ({auditResult.checks.length})</span>
        </button>
      </div>

      {/* 5. Sub-Tab 1: Prioritized Action Plan & Recommendations */}
      {activeTab === 'recommendations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filter Bar */}
          <div className="card" style={{
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            {/* Priority Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginRight: '0.3rem' }}>Priority:</span>
              {(['all', 'critical', 'high', 'quick-win'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    background: priorityFilter === p ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.03)',
                    color: priorityFilter === p ? '#042F2E' : 'var(--text-secondary)',
                    fontWeight: priorityFilter === p ? 700 : 400,
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {p === 'all' ? 'All Priorities' : p === 'quick-win' ? 'Quick Wins' : p.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Categories</option>
                <option value="Performance">Performance</option>
                <option value="Content">Content & Structure</option>
                <option value="Technical">Technical</option>
                <option value="Schema">Schema.org</option>
                <option value="Mobile">Mobile & Social</option>
              </select>
            </div>
          </div>

          {/* Recommendation Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredRecommendations.length === 0 ? (
              <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No recommendations matching selected filter criteria.
              </div>
            ) : (
              filteredRecommendations.map((rec) => {
                const isExpanded = expandedRecId === rec.id;
                return (
                  <div 
                    key={rec.id} 
                    className="card"
                    style={{
                      padding: '1.25rem',
                      borderLeft: rec.priority === 'critical' ? '4px solid #EF4444' : rec.priority === 'high' ? '4px solid #F59E0B' : '4px solid var(--accent-primary)'
                    }}
                  >
                    {/* Collapsed Header */}
                    <div 
                      onClick={() => setExpandedRecId(isExpanded ? null : rec.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {getPriorityBadge(rec.priority)}
                          <span className="badge badge-cyan">{rec.category}</span>
                          <span className="badge badge-emerald">Impact: {rec.estimatedImpact}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Effort: {rec.effort.toUpperCase()}</span>
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {rec.title}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                          {rec.explanation}
                        </p>
                      </div>

                      <button
                        className="btn btn-ghost"
                        style={{ padding: '0.35rem', color: 'var(--text-muted)', borderRadius: '6px' }}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>

                    {/* Expanded Remediation Body */}
                    {isExpanded && (
                      <div style={{
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        {/* Action Steps */}
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                            Action Plan Steps:
                          </div>
                          <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            {rec.actionSteps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>

                        {/* Code Snippet Fix */}
                        {rec.codeSnippet && (
                          <div style={{
                            background: 'rgba(11, 15, 23, 0.8)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              padding: '0.4rem 0.75rem',
                              background: 'rgba(255, 255, 255, 0.03)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)'
                            }}>
                              <span>Recommended Code Fix ({rec.codeSnippet.language})</span>
                              <button
                                onClick={() => handleCopyCode(rec.id, rec.codeSnippet?.after || '')}
                                className="btn btn-ghost"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: copiedSnippetId === rec.id ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                              >
                                {copiedSnippetId === rec.id ? (
                                  <>
                                    <Check size={12} />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} />
                                    <span>Copy Snippet</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre style={{
                              margin: 0,
                              padding: '0.85rem',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.775rem',
                              color: '#34D399',
                              overflowX: 'auto'
                            }}>
                              {rec.codeSnippet.after}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 6. Sub-Tab 2: PageSpeed & Resource Breakdown */}
      {activeTab === 'webvitals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Asset Weight Distribution Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Page Payload & Resource Weight Breakdown
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                  Total Page Weight: <strong style={{ color: 'var(--text-primary)' }}>{auditResult.assetWeights.totalKb} KB</strong> across {auditResult.assetWeights.requestsCount} HTTP requests
                </p>
              </div>
              <HardDrive size={20} color="#06B6D4" />
            </div>

            {/* Visual Multi-Segment Bar */}
            <div style={{
              height: '14px',
              borderRadius: '7px',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <div 
                style={{ 
                  width: `${(auditResult.assetWeights.htmlKb / auditResult.assetWeights.totalKb) * 100}%`, 
                  background: '#10B981' 
                }} 
                title={`HTML: ${auditResult.assetWeights.htmlKb} KB`} 
              />
              <div 
                style={{ 
                  width: `${(auditResult.assetWeights.cssKb / auditResult.assetWeights.totalKb) * 100}%`, 
                  background: '#06B6D4' 
                }} 
                title={`CSS: ${auditResult.assetWeights.cssKb} KB`} 
              />
              <div 
                style={{ 
                  width: `${(auditResult.assetWeights.jsKb / auditResult.assetWeights.totalKb) * 100}%`, 
                  background: '#F59E0B' 
                }} 
                title={`JavaScript: ${auditResult.assetWeights.jsKb} KB`} 
              />
              <div 
                style={{ 
                  width: `${(auditResult.assetWeights.imageKb / auditResult.assetWeights.totalKb) * 100}%`, 
                  background: '#8B5CF6' 
                }} 
                title={`Images: ${auditResult.assetWeights.imageKb} KB`} 
              />
              <div 
                style={{ 
                  width: `${(auditResult.assetWeights.fontKb / auditResult.assetWeights.totalKb) * 100}%`, 
                  background: '#EC4899' 
                }} 
                title={`Fonts: ${auditResult.assetWeights.fontKb} KB`} 
              />
            </div>

            {/* Legend & Breakdown Tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} /> HTML Document
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {auditResult.assetWeights.htmlKb} KB
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06B6D4' }} /> CSS Styles
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {auditResult.assetWeights.cssKb} KB
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} /> JavaScript
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {auditResult.assetWeights.jsKb} KB
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }} /> Images & Media
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {auditResult.assetWeights.imageKb} KB
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EC4899' }} /> Web Fonts
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {auditResult.assetWeights.fontKb} KB
                </div>
              </div>
            </div>
          </div>

          {/* Core Web Vitals Optimization Guidance */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Core Web Vitals Optimization Checklist
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <CheckCircle2 size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Preload Hero LCP Image:</strong> Add <code>&lt;link rel="preload" as="image" href="..." fetchpriority="high"&gt;</code> in <code>&lt;head&gt;</code> to shave up to 800ms from LCP.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <CheckCircle2 size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Defer Non-Critical JavaScript:</strong> Add <code>defer</code> or <code>async</code> to all analytical and widget scripts to keep the main thread responsive for low INP.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <CheckCircle2 size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Font Display Swap:</strong> Ensure all Google Fonts have <code>&amp;display=swap</code> to prevent FOIT (Flash of Invisible Text) layout shifts during initial render.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Sub-Tab 3: All On-Page Checks Matrix */}
      {activeTab === 'checks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filter & Search Bar */}
          <div className="card" style={{
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {(['all', 'passed', 'warning', 'critical'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setCheckStatusFilter(s)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    background: checkStatusFilter === s ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.03)',
                    color: checkStatusFilter === s ? '#042F2E' : 'var(--text-secondary)',
                    fontWeight: checkStatusFilter === s ? 700 : 400,
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search check name or category..."
              value={checkSearch}
              onChange={(e) => setCheckSearch(e.target.value)}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                minWidth: '220px'
              }}
            />
          </div>

          {/* Checks Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Check Name</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Measured vs Expected</th>
                </tr>
              </thead>
              <tbody>
                {filteredChecks.map(check => (
                  <tr key={check.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {check.status === 'passed' && <span className="badge badge-emerald">Passed</span>}
                      {check.status === 'warning' && <span className="badge badge-amber">Warning</span>}
                      {check.status === 'critical' && <span className="badge badge-rose">Critical</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{check.name}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{check.explanation}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {check.category.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.725rem' }}>
                      <span style={{ color: 'var(--text-primary)' }}>{check.measuredValue}</span>
                      <span style={{ color: 'var(--text-muted)' }}> (Req: {check.criteria})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
