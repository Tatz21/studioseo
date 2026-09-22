import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Globe,
  Monitor,
  Smartphone,
  Sparkles,
  Sliders,
  Share2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Flame,
  Zap,
  Target,
  Layers,
  Award,
  BarChart2,
  Copy,
  Check,
  RotateCw,
  Calendar,
  Eye,
  Star
} from 'lucide-react';
import { 
  SerpEngine, 
  SerpCountry, 
  SerpDevice, 
  SerpQuery, 
  SerpAnalysisResponse, 
  SerpOpportunityItem
} from '../../serp/types';
import { SerpApi } from '../../serp/serpApi';
import { SerpStore } from '../../serp/serpStore';
import { MetaData } from '../../engine/types';

interface SerpExplorerProps {
  initialKeyword?: string;
  initialUrl?: string;
  pageMetadata?: MetaData;
  onNavigateToKeywords?: () => void;
  onNavigateToCompetitors?: () => void;
}

export const SerpExplorer: React.FC<SerpExplorerProps> = ({
  initialKeyword = 'vintage movie posters',
  initialUrl = 'https://posterscraft.com',
  pageMetadata,
  onNavigateToKeywords,
  onNavigateToCompetitors
}) => {
  // Navigation subtabs
  const [activeSubtab, setActiveSubtab] = useState<'analysis' | 'volatility' | 'opportunities' | 'sandbox'>('analysis');

  // Search parameters
  const [keywordInput, setKeywordInput] = useState(initialKeyword);
  const [selectedEngine, setSelectedEngine] = useState<SerpEngine>('google');
  const [selectedCountry, setSelectedCountry] = useState<SerpCountry>('US');
  const [selectedDevice, setSelectedDevice] = useState<SerpDevice>('desktop');

  // Data states
  const [isLoading, setIsLoading] = useState(false);
  const [serpData, setSerpData] = useState<SerpAnalysisResponse | null>(null);
  const [expandedPaaIndex, setExpandedPaaIndex] = useState<number | null>(0);
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual');
  const [recentQueries, setRecentQueries] = useState<string[]>(() => SerpStore.getRecentQueries());

  // Volatility data
  const volatilityData = useMemo(() => SerpStore.getVolatilityData(), []);
  // Opportunities data
  const opportunities = useMemo(() => SerpStore.getOpportunityMatrix(), []);

  // Sandbox states
  const [sandboxTitle, setSandboxTitle] = useState(pageMetadata?.title || 'Vintage Movie Posters | Archival Prints & Custom Framing — PostersCraft');
  const [sandboxDesc, setSandboxDesc] = useState(pageMetadata?.description || 'Explore museum-grade vintage movie posters printed on 250gsm archival acid-free paper. UV-resistant pigment inks, solid wood frames, and fast shipping.');
  const [sandboxUrl, setSandboxUrl] = useState(pageMetadata?.canonicalUrl || initialUrl || 'https://posterscraft.com/collections/vintage-movie-posters');
  const [sandboxDevice, setSandboxDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [sandboxPreviewType, setSandboxPreviewType] = useState<'google' | 'facebook' | 'twitter'>('google');
  const [hasCopiedPlanId, setHasCopiedPlanId] = useState<string | null>(null);

  // Sync if initialKeyword prop updates
  useEffect(() => {
    if (initialKeyword) {
      setKeywordInput(initialKeyword);
      handleExecuteSearch(initialKeyword);
    }
  }, [initialKeyword]);

  // Initial fetch on mount
  useEffect(() => {
    handleExecuteSearch(keywordInput);
  }, []);

  const handleExecuteSearch = async (kw: string) => {
    if (!kw || !kw.trim()) return;
    setIsLoading(true);
    const query: SerpQuery = {
      keyword: kw.trim(),
      engine: selectedEngine,
      country: selectedCountry,
      device: selectedDevice,
      language: 'en'
    };
    try {
      const data = await SerpApi.fetchSerpAnalysis(query);
      setSerpData(data);
      setRecentQueries(SerpStore.getRecentQueries());
    } catch (err) {
      console.error('Error fetching SERP analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteSearch(keywordInput);
  };

  const handleQuickChipClick = (kw: string) => {
    setKeywordInput(kw);
    handleExecuteSearch(kw);
  };

  const handleCopyOpportunity = (opp: SerpOpportunityItem) => {
    const text = `SERP Opportunity Plan for "${opp.keyword}"\nFeature: ${opp.feature} (${opp.opportunityType})\nPotential Gain: ${opp.potentialTrafficGain}\n\nAction Steps:\n${opp.actionableSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setHasCopiedPlanId(opp.id);
    setTimeout(() => setHasCopiedPlanId(null), 2500);
  };

  // Google Pixel Width Approximation (Arial ~16px for title, ~14px for desc)
  const titlePixelWidth = useMemo(() => {
    return Math.round(sandboxTitle.length * 9.8);
  }, [sandboxTitle]);

  const descPixelWidth = useMemo(() => {
    return Math.round(sandboxDesc.length * 6.2);
  }, [sandboxDesc]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Top Banner Card */}
      <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.25)'
            }}>
              <Search size={22} color="var(--accent-primary)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  SERP Intelligence & Analysis
                </h2>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                  Phase 15
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                  Live Multi-Engine
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                Live Search Engine Results Page analysis, Featured Snippets, People Also Ask, algorithm volatility radar, and snippet sandbox.
              </p>
            </div>
          </div>

          {/* Quick Subtab Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '3px',
            gap: '3px'
          }}>
            <button
              onClick={() => setActiveSubtab('analysis')}
              className={`btn ${activeSubtab === 'analysis' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
            >
              <Search size={14} />
              <span>Live SERP</span>
            </button>
            <button
              onClick={() => setActiveSubtab('volatility')}
              className={`btn ${activeSubtab === 'volatility' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
            >
              <Flame size={14} color="#EF4444" />
              <span>Algorithm Radar</span>
            </button>
            <button
              onClick={() => setActiveSubtab('opportunities')}
              className={`btn ${activeSubtab === 'opportunities' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
            >
              <Target size={14} color="#F59E0B" />
              <span>Feature Matrix</span>
            </button>
            <button
              onClick={() => setActiveSubtab('sandbox')}
              className={`btn ${activeSubtab === 'sandbox' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
            >
              <Eye size={14} color="#06B6D4" />
              <span>Snippet Sandbox</span>
            </button>
          </div>
        </div>

        {/* Global Search Bar (Shown on analysis tab) */}
        {activeSubtab === 'analysis' && (
          <form onSubmit={handleFormSubmit} style={{ marginTop: '1.25rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '0.5rem 0.75rem'
            }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Enter any search query (e.g. vintage movie posters, minimalist art prints)..."
                style={{
                  flex: 1,
                  minWidth: '220px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.925rem',
                  outline: 'none'
                }}
              />

              {/* Engine Switcher */}
              <select
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value as SerpEngine)}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.8rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="google">Google Search</option>
                <option value="bing">Bing Search</option>
                <option value="yahoo">Yahoo!</option>
                <option value="duckduckgo">DuckDuckGo</option>
              </select>

              {/* Country Selector */}
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value as SerpCountry)}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.8rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="US">🇺🇸 United States</option>
                <option value="UK">🇬🇧 United Kingdom</option>
                <option value="CA">🇨🇦 Canada</option>
                <option value="AU">🇦🇺 Australia</option>
                <option value="DE">🇩🇪 Germany</option>
                <option value="FR">🇫🇷 France</option>
                <option value="IN">🇮🇳 India</option>
                <option value="Global">🌐 Global</option>
              </select>

              {/* Device Toggle */}
              <div style={{
                display: 'flex',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '2px'
              }}>
                <button
                  type="button"
                  onClick={() => setSelectedDevice('desktop')}
                  className={`btn ${selectedDevice === 'desktop' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px' }}
                  title="Desktop SERP"
                >
                  <Monitor size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDevice('mobile')}
                  className={`btn ${selectedDevice === 'mobile' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px' }}
                  title="Mobile SERP"
                >
                  <Smartphone size={13} />
                </button>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
              >
                {isLoading ? <RotateCw size={15} className="animate-spin" /> : <Search size={15} />}
                <span>{isLoading ? 'Scanning...' : 'Inspect SERP'}</span>
              </button>
            </div>

            {/* Quick Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Queries:</span>
              {recentQueries.map((rq) => (
                <button
                  key={rq}
                  type="button"
                  onClick={() => handleQuickChipClick(rq)}
                  className={`badge ${rq.toLowerCase() === keywordInput.toLowerCase() ? 'badge-emerald' : 'badge-subtle'}`}
                  style={{ cursor: 'pointer', border: 'none', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                >
                  {rq}
                </button>
              ))}
            </div>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: LIVE SERP ANALYSIS & MATRIX */}
      {/* ========================================================================= */}
      {activeSubtab === 'analysis' && serpData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Metrics Overview Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem'
          }}>
            <div className="card" style={{ padding: '1rem 1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Monthly Volume
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {serpData.searchVolume.toLocaleString()}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>searches/mo</span>
              </div>
            </div>

            <div className="card" style={{ padding: '1rem 1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Estimated CPC
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  ${serpData.cpc.toFixed(2)}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>USD</span>
              </div>
            </div>

            <div className="card" style={{ padding: '1rem 1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Keyword Difficulty
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
                <span style={{ 
                  fontSize: '1.6rem', 
                  fontWeight: 700, 
                  color: serpData.difficulty > 60 ? 'var(--status-critical)' : serpData.difficulty > 35 ? 'var(--status-warning)' : 'var(--status-success)' 
                }}>
                  {serpData.difficulty}/100
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {serpData.difficulty > 60 ? 'Hard' : serpData.difficulty > 35 ? 'Moderate' : 'Easy'}
                </span>
              </div>
            </div>

            <div className="card" style={{ padding: '1rem 1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Domain Rank
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
                {serpData.userRanking ? (
                  <>
                    <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      #{serpData.userRanking.rank}
                    </span>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      ~{serpData.userRanking.trafficShare.toLocaleString()} visits
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                    Not in Top 10
                  </span>
                )}
              </div>
            </div>

            <div className="card" style={{ padding: '1rem 1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Index Speed / Total
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {(serpData.totalOrganicResults / 1000000).toFixed(1)}M
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ({serpData.searchTimeSeconds}s)
                </span>
              </div>
            </div>
          </div>

          {/* SERP Features Detected Bar */}
          <div className="glass-panel" style={{
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Sparkles size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Active SERP Features:
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {serpData.featuredSnippet && (
                <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                  ★ Featured Snippet ({serpData.featuredSnippet.type})
                </span>
              )}
              {serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0 && (
                <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                  💬 People Also Ask ({serpData.peopleAlsoAsk.length})
                </span>
              )}
              {serpData.knowledgePanel && (
                <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                  🏛 Knowledge Panel
                </span>
              )}
              {serpData.videos && serpData.videos.length > 0 && (
                <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                  ▶ Video Carousel ({serpData.videos.length})
                </span>
              )}
              <span className="badge badge-subtle" style={{ fontSize: '0.75rem' }}>
                🔗 Sitelinks Active
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Display:</span>
              <button
                onClick={() => setViewMode('visual')}
                className={`btn ${viewMode === 'visual' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              >
                Visual Mockup
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              >
                Matrix Table
              </button>
            </div>
          </div>

          {/* Grid Layout: Left Column = Organic Results / Mockup, Right Column = SERP Features Sidebar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.2fr)',
            gap: '1.5rem',
            alignItems: 'start'
          }}>
            {/* Left Column: Organic Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Featured Snippet Card (if present) */}
              {serpData.featuredSnippet && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={18} color="var(--accent-primary)" />
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Google Featured Snippet
                      </span>
                    </div>
                    <span className="badge badge-subtle" style={{ fontSize: '0.7rem' }}>
                      Position Zero #0
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {serpData.featuredSnippet.title}
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: '#E2E8F0', lineHeight: 1.6, marginBottom: '0.85rem' }}>
                    {serpData.featuredSnippet.content}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.65rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.8rem'
                  }}>
                    <a
                      href={serpData.featuredSnippet.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--accent-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <span>{serpData.featuredSnippet.sourceTitle}</span>
                      <ExternalLink size={12} />
                    </a>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Owned by: <strong style={{ color: 'var(--text-primary)' }}>{serpData.featuredSnippet.sourceDomain}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* View Mode 1: Visual SERP Mockup */}
              {viewMode === 'visual' ? (
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      Google Organic Results (Page 1 Top 10)
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Showing {serpData.organicResults.length} organic rankings
                    </span>
                  </div>

                  {serpData.organicResults.map((item) => (
                    <div
                      key={item.rank}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        background: item.isUserDomain ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
                        border: item.isUserDomain ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      {/* Rank Pin */}
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {item.isUserDomain && (
                          <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                            Your Site
                          </span>
                        )}
                        <span style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: item.rank <= 3 ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                          color: item.rank <= 3 ? '#042F2E' : 'var(--text-primary)',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          #{item.rank}
                        </span>
                      </div>

                      {/* URL Breadcrumb & Favicon */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', paddingRight: '4.5rem' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          background: '#1F2937',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          <Globe size={12} color="var(--text-muted)" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.domain}</span>
                          <span>›</span>
                          <span className="font-mono">{item.displayUrl}</span>
                        </div>
                      </div>

                      {/* Clickable SERP Title */}
                      <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem', fontWeight: 600 }}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: item.isUserDomain ? 'var(--accent-primary)' : '#60A5FA',
                            textDecoration: 'none'
                          }}
                        >
                          {item.title}
                        </a>
                      </h4>

                      {/* Rating rich snippet (if present) */}
                      {item.rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.78rem', color: '#F59E0B' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={11} fill="#F59E0B" color="#F59E0B" />
                            ))}
                          </div>
                          <span style={{ fontWeight: 600 }}>{item.rating.value}</span>
                          <span style={{ color: 'var(--text-muted)' }}>({item.rating.count.toLocaleString()} reviews)</span>
                        </div>
                      )}

                      {/* Snippet Description */}
                      <p style={{
                        margin: '0 0 0.65rem 0',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.55
                      }}>
                        {item.snippet}
                      </p>

                      {/* Sitelinks (if present) */}
                      {item.sitelinks && item.sitelinks.length > 0 && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '0.5rem',
                          margin: '0.75rem 0 0.5rem 0',
                          padding: '0.75rem',
                          background: 'rgba(0, 0, 0, 0.2)',
                          borderRadius: '6px'
                        }}>
                          {item.sitelinks.map((sl, sidx) => (
                            <div key={sidx} style={{ fontSize: '0.8rem' }}>
                              <a
                                href={sl.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <span>{sl.title}</span>
                                <ExternalLink size={10} />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Bottom Footer: CTR, DA, and Badges */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        paddingTop: '0.65rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <span>
                            Est. CTR: <strong style={{ color: 'var(--text-primary)' }}>{item.estimatedCtr}%</strong>
                          </span>
                          <span>
                            Est. Traffic: <strong style={{ color: 'var(--accent-primary)' }}>~{item.estimatedTraffic.toLocaleString()}/mo</strong>
                          </span>
                          <span>
                            Domain Rating: <strong style={{ color: 'var(--text-primary)' }}>{item.domainAuthorityScore}</strong>
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {item.badges.map(b => (
                            <span key={b} className="badge badge-subtle" style={{ fontSize: '0.65rem' }}>
                              {b}
                            </span>
                          ))}
                          {!item.isUserDomain && onNavigateToCompetitors && (
                            <button
                              onClick={() => onNavigateToCompetitors()}
                              className="btn btn-ghost"
                              style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem', color: 'var(--accent-cyan)' }}
                              title="Inspect Competitor Intelligence"
                            >
                              Track Competitor
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* View Mode 2: Matrix Data Table */
                <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem 1rem', width: '50px' }}>Rank</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Title & Landing URL</th>
                        <th style={{ padding: '0.75rem 1rem', width: '90px' }}>DA</th>
                        <th style={{ padding: '0.75rem 1rem', width: '110px' }}>Est. CTR</th>
                        <th style={{ padding: '0.75rem 1rem', width: '120px' }}>Est. Traffic</th>
                        <th style={{ padding: '0.75rem 1rem', width: '140px' }}>SERP Features</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serpData.organicResults.map((item) => (
                        <tr
                          key={item.rank}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            background: item.isUserDomain ? 'rgba(16, 185, 129, 0.08)' : 'transparent'
                          }}
                        >
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                            <span style={{
                              color: item.rank <= 3 ? 'var(--accent-primary)' : 'var(--text-secondary)'
                            }}>
                              #{item.rank}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: item.isUserDomain ? 'var(--accent-primary)' : 'var(--text-primary)', marginBottom: '0.2rem' }}>
                              {item.title}
                            </div>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <span className="font-mono">{item.displayUrl}</span>
                              <ExternalLink size={10} />
                            </a>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span className="badge badge-subtle" style={{ fontSize: '0.75rem' }}>
                              {item.domainAuthorityScore}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)', width: '38px' }}>
                                {item.estimatedCtr}%
                              </span>
                              <div style={{ width: '40px', height: '4px', background: 'var(--bg-surface-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${(item.estimatedCtr / 30) * 100}%`, height: '100%', background: 'var(--accent-primary)' }} />
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                            ~{item.estimatedTraffic.toLocaleString()}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                              {item.badges.slice(0, 2).map(b => (
                                <span key={b} className="badge badge-subtle" style={{ fontSize: '0.65rem' }}>
                                  {b}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Column: SERP Features Sidebar (PAA, Knowledge Panel, Videos, Related) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* People Also Ask (PAA) Interactive Accordion */}
              {serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0 && (
                <div className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <HelpCircleIcon />
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        People Also Ask (PAA)
                      </h3>
                    </div>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      {serpData.peopleAlsoAsk.length} Questions
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {serpData.peopleAlsoAsk.map((paa, idx) => {
                      const isExpanded = expandedPaaIndex === idx;
                      return (
                        <div
                          key={idx}
                          style={{
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                            background: isExpanded ? 'var(--bg-surface-elevated)' : 'transparent',
                            overflow: 'hidden',
                            transition: 'background 0.2s ease'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedPaaIndex(isExpanded ? null : idx)}
                            style={{
                              width: '100%',
                              padding: '0.75rem 0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              textAlign: 'left',
                              cursor: 'pointer'
                            }}
                          >
                            <span>{paa.question}</span>
                            {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                          </button>

                          {isExpanded && (
                            <div style={{ padding: '0 0.85rem 0.85rem 0.85rem', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                              <p style={{ margin: '0 0 0.6rem 0' }}>{paa.answerSnippet}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Source:</span>
                                <a
                                  href={paa.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}
                                >
                                  {paa.sourceTitle}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Knowledge Panel (if present) */}
              {serpData.knowledgePanel && (
                <div className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Layers size={16} color="var(--accent-cyan)" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      Knowledge Graph Panel
                    </h3>
                  </div>

                  <div style={{ marginBottom: '0.65rem' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {serpData.knowledgePanel.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                      {serpData.knowledgePanel.subtitle}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                    {serpData.knowledgePanel.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    {serpData.knowledgePanel.attributes.map((attr, aidx) => (
                      <div key={aidx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{attr.label}:</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right' }}>{attr.value}</span>
                      </div>
                    ))}
                  </div>

                  {serpData.knowledgePanel.wikiUrl && (
                    <div style={{ marginTop: '0.85rem', textAlign: 'right' }}>
                      <a
                        href={serpData.knowledgePanel.wikiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <span>Wikipedia Reference</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Videos Carousel (if present) */}
              {serpData.videos && serpData.videos.length > 0 && (
                <div className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Zap size={16} color="#A855F7" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      Video Results
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {serpData.videos.map((vid, vidx) => (
                      <div
                        key={vidx}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          background: 'rgba(0,0,0,0.15)'
                        }}
                      >
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                          {vid.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>{vid.channel} • {vid.duration}</span>
                          <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                            {vid.source}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Searches */}
              {serpData.relatedSearches && (
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                    Related Searches
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {serpData.relatedSearches.map((rs, rsidx) => (
                      <button
                        key={rsidx}
                        type="button"
                        onClick={() => handleQuickChipClick(rs)}
                        className="badge badge-subtle"
                        style={{
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          padding: '0.3rem 0.6rem',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        {rs}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: SERP VOLATILITY RADAR (GOOGLE SENSOR / WEATHER) */}
      {/* ========================================================================= */}
      {activeSubtab === 'volatility' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Volatility Dial Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <Flame size={20} color="#EF4444" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Algorithm Volatility Index
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    {volatilityData.overallScore}
                  </span>
                  <div>
                    <span className="badge badge-red" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                      🔥 HIGH VOLATILITY
                    </span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      As of {volatilityData.date} • Significant ranking fluctuations observed
                    </p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem',
                background: 'var(--bg-canvas)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>0.0 - 3.0</span>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--status-success)' }}>Calm</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>3.1 - 5.5</span>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>Normal</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>5.6 - 7.5</span>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--status-warning)' }}>High</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>7.6 - 10.0</span>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--status-critical)' }}>Storm</div>
                </div>
              </div>
            </div>

            {/* 14-Day Timeline Bar Chart */}
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  14-Day Algorithmic Volatility Timeline
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Daily Google US SERP Ranking Flux
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                height: '140px',
                gap: '8px',
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--border-subtle)'
              }}>
                {volatilityData.history14Days.map((day, didx) => {
                  const barHeight = Math.round((day.score / 10) * 100);
                  const isPeak = day.score >= 8.5;
                  const isHigh = day.score >= 6.0;
                  const barColor = isPeak ? '#EF4444' : isHigh ? '#F59E0B' : '#10B981';

                  return (
                    <div
                      key={didx}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', color: barColor, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {day.score}
                      </span>
                      <div
                        style={{
                          width: '100%',
                          height: `${barHeight}%`,
                          background: `linear-gradient(180deg, ${barColor} 0%, rgba(17, 24, 39, 0.4) 100%)`,
                          borderRadius: '4px 4px 0 0',
                          boxShadow: isPeak ? '0 0 10px rgba(239, 68, 68, 0.4)' : 'none',
                          transition: 'height 0.3s ease'
                        }}
                      />
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {day.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Industry Category Breakdown & Recent Updates Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Category Breakdown */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <BarChart2 size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Volatility by Industry Sector
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {volatilityData.categories.map((cat, cidx) => (
                  <div key={cidx} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.category}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: cat.volatility >= 8 ? '#EF4444' : cat.volatility >= 6 ? '#F59E0B' : '#10B981'
                        }}>
                          {cat.volatility.toFixed(1)} / 10
                        </span>
                        <span style={{
                          fontSize: '0.7rem',
                          color: cat.delta > 0 ? '#EF4444' : cat.delta < 0 ? '#10B981' : 'var(--text-muted)'
                        }}>
                          {cat.delta > 0 ? `+${cat.delta}` : cat.delta}
                        </span>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-canvas)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${(cat.volatility / 10) * 100}%`,
                          height: '100%',
                          background: cat.volatility >= 8 ? '#EF4444' : cat.volatility >= 6 ? '#F59E0B' : '#10B981',
                          borderRadius: '3px'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Algorithm Updates Timeline */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Calendar size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Confirmed Algorithm Updates Log
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {volatilityData.recentUpdates.map((update) => (
                  <div
                    key={update.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'rgba(0,0,0,0.2)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{update.date}</span>
                      <span className={`badge ${update.severity === 'critical' ? 'badge-red' : update.severity === 'high' ? 'badge-amber' : 'badge-subtle'}`} style={{ fontSize: '0.65rem' }}>
                        {update.severity.toUpperCase()}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {update.name}
                    </h4>

                    <p style={{ margin: '0 0 0.65rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {update.impactDescription}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sectors:</span>
                      {update.categoriesImpacted.map(c => (
                        <span key={c} className="badge badge-subtle" style={{ fontSize: '0.65rem' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: FEATURE OPPORTUNITY MATRIX */}
      {/* ========================================================================= */}
      {activeSubtab === 'opportunities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  SERP Feature Opportunity Roadmap
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Identified high-probability opportunities to capture Position Zero snippets, PAA accordions, and rich review schemas.
                </p>
              </div>

              {onNavigateToKeywords && (
                <button
                  onClick={onNavigateToKeywords}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.8rem' }}
                >
                  <Target size={14} />
                  <span>View All Tracked Keywords</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginBottom: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                        {opp.feature}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        "{opp.keyword}"
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        ({opp.searchVolume.toLocaleString()} searches/mo)
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                        Est. Gain: {opp.potentialTrafficGain}
                      </span>
                      <button
                        onClick={() => handleCopyOpportunity(opp)}
                        className="btn btn-ghost"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        {hasCopiedPlanId === opp.id ? <Check size={13} color="var(--status-success)" /> : <Copy size={13} />}
                        <span>{hasCopiedPlanId === opp.id ? 'Copied!' : 'Copy Plan'}</span>
                      </button>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginBottom: '1rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <span>Current Rank: <strong style={{ color: 'var(--text-primary)' }}>#{opp.userRank}</strong></span>
                    <span>•</span>
                    <span>Current Feature Holder: <strong style={{ color: 'var(--accent-cyan)' }}>{opp.currentOwner}</strong></span>
                    <span>•</span>
                    <span>Capture Difficulty: <strong style={{ color: opp.difficulty === 'Low' ? 'var(--status-success)' : 'var(--status-warning)' }}>{opp.difficulty}</strong></span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Actionable Optimization Steps:
                    </span>
                    <ol style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      {opp.actionableSteps.map((step, sidx) => (
                        <li key={sidx} style={{ marginBottom: '0.35rem' }}>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: SERP & SOCIAL PREVIEW SANDBOX (ENHANCED) */}
      {/* ========================================================================= */}
      {activeSubtab === 'sandbox' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 440px) 1fr',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Left Column: Live Editable Controls */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                  Snippet Editor
                </h3>
              </div>

              {pageMetadata && (
                <button
                  onClick={() => {
                    if (pageMetadata.title) setSandboxTitle(pageMetadata.title);
                    if (pageMetadata.description) setSandboxDesc(pageMetadata.description);
                    if (pageMetadata.canonicalUrl) setSandboxUrl(pageMetadata.canonicalUrl);
                  }}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  <RotateCw size={12} />
                  <span>Sync Scanned Meta</span>
                </button>
              )}
            </div>

            {/* Title Field & Pixel Width Meter */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
                <label style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Title Tag</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{
                    color: sandboxTitle.length > 60 ? 'var(--status-critical)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {sandboxTitle.length} chars
                  </span>
                  <span style={{
                    color: titlePixelWidth > 580 ? 'var(--status-critical)' : 'var(--status-success)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600
                  }}>
                    ~{titlePixelWidth}px / 580px
                  </span>
                </div>
              </div>
              <input
                type="text"
                value={sandboxTitle}
                onChange={(e) => setSandboxTitle(e.target.value)}
                className="input-text"
                style={{ width: '100%' }}
                placeholder="Enter title tag..."
              />
              {/* Pixel Meter Progress */}
              <div style={{ width: '100%', height: '4px', background: 'var(--bg-canvas)', borderRadius: '2px', marginTop: '0.4rem', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, (titlePixelWidth / 580) * 100)}%`,
                    height: '100%',
                    background: titlePixelWidth > 580 ? 'var(--status-critical)' : 'var(--accent-primary)',
                    transition: 'width 0.2s ease'
                  }}
                />
              </div>
            </div>

            {/* Description Field & Pixel Width Meter */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
                <label style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Meta Description</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{
                    color: sandboxDesc.length > 160 ? 'var(--status-critical)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {sandboxDesc.length} chars
                  </span>
                  <span style={{
                    color: descPixelWidth > 990 ? 'var(--status-critical)' : 'var(--status-success)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600
                  }}>
                    ~{descPixelWidth}px / 990px
                  </span>
                </div>
              </div>
              <textarea
                value={sandboxDesc}
                onChange={(e) => setSandboxDesc(e.target.value)}
                className="textarea"
                rows={4}
                style={{ width: '100%', fontSize: '0.85rem' }}
                placeholder="Enter meta description..."
              />
              {/* Pixel Meter Progress */}
              <div style={{ width: '100%', height: '4px', background: 'var(--bg-canvas)', borderRadius: '2px', marginTop: '0.4rem', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, (descPixelWidth / 990) * 100)}%`,
                    height: '100%',
                    background: descPixelWidth > 990 ? 'var(--status-critical)' : 'var(--accent-cyan)',
                    transition: 'width 0.2s ease'
                  }}
                />
              </div>
            </div>

            {/* Canonical URL Field */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Canonical / Destination URL
              </label>
              <input
                type="text"
                value={sandboxUrl}
                onChange={(e) => setSandboxUrl(e.target.value)}
                className="input-text font-mono"
                style={{ width: '100%', fontSize: '0.8rem' }}
                placeholder="https://example.com/page"
              />
            </div>

            {/* Platform Previews Switcher */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Target Platform Preview
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSandboxPreviewType('google')}
                  className={`btn ${sandboxPreviewType === 'google' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1, fontSize: '0.78rem', padding: '0.4rem' }}
                >
                  Google SERP
                </button>
                <button
                  type="button"
                  onClick={() => setSandboxPreviewType('facebook')}
                  className={`btn ${sandboxPreviewType === 'facebook' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1, fontSize: '0.78rem', padding: '0.4rem' }}
                >
                  Facebook / OG
                </button>
                <button
                  type="button"
                  onClick={() => setSandboxPreviewType('twitter')}
                  className={`btn ${sandboxPreviewType === 'twitter' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1, fontSize: '0.78rem', padding: '0.4rem' }}
                >
                  Twitter Card
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Preview Canvas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {sandboxPreviewType === 'google' && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={16} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Google Search Result Snippet
                    </span>
                  </div>

                  <div style={{ display: 'flex', background: 'var(--bg-canvas)', borderRadius: '6px', padding: '2px', border: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => setSandboxDevice('desktop')}
                      className={`btn ${sandboxDevice === 'desktop' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      <Monitor size={12} />
                      <span>Desktop</span>
                    </button>
                    <button
                      onClick={() => setSandboxDevice('mobile')}
                      className={`btn ${sandboxDevice === 'mobile' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      <Smartphone size={12} />
                      <span>Mobile</span>
                    </button>
                  </div>
                </div>

                {/* Google Desktop Preview Frame */}
                {sandboxDevice === 'desktop' ? (
                  <div style={{
                    background: '#FFFFFF',
                    borderRadius: '8px',
                    padding: '1.25rem 1.5rem',
                    color: '#202124',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    {/* URL Breadcrumb */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '14px', color: '#202124', marginBottom: '4px' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#F1F3F4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Globe size={11} color="#5F6368" />
                      </div>
                      <span style={{ fontWeight: 500 }}>
                        {getCleanDomain(sandboxUrl)}
                      </span>
                      <span style={{ color: '#5F6368' }}>› collections</span>
                    </div>

                    {/* Title */}
                    <h3 style={{
                      margin: '0 0 4px 0',
                      fontSize: '20px',
                      fontWeight: 400,
                      color: '#1A0DAB',
                      lineHeight: 1.3,
                      maxWidth: '580px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }}>
                      {sandboxTitle}
                    </h3>

                    {/* Rating rich snippet */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#70757A', marginBottom: '4px' }}>
                      <span style={{ color: '#E37400' }}>★★★★★</span>
                      <span>Rating: 4.9 · 420 reviews</span>
                    </div>

                    {/* Description */}
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#4D5156',
                      lineHeight: 1.58,
                      maxWidth: '600px'
                    }}>
                      {sandboxDesc}
                    </p>
                  </div>
                ) : (
                  /* Google Mobile Card Preview */
                  <div style={{
                    maxWidth: '380px',
                    margin: '0 auto',
                    background: '#F8F9FA',
                    border: '1px solid #DADCE0',
                    borderRadius: '16px',
                    padding: '1rem',
                    color: '#202124',
                    fontFamily: 'Arial, sans-serif',
                    boxShadow: '0 1px 6px rgba(32, 33, 36, 0.12)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '12px', color: '#202124', marginBottom: '6px' }}>
                      <Globe size={12} color="#5F6368" />
                      <span style={{ fontWeight: 600 }}>{getCleanDomain(sandboxUrl)}</span>
                    </div>
                    <h3 style={{
                      margin: '0 0 6px 0',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#1A0DAB',
                      lineHeight: 1.35
                    }}>
                      {sandboxTitle}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#4D5156',
                      lineHeight: 1.45
                    }}>
                      {sandboxDesc}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Facebook / OpenGraph Card Preview */}
            {sandboxPreviewType === 'facebook' && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <Share2 size={16} color="#3B82F6" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Facebook / LinkedIn Open Graph Card
                  </span>
                </div>

                <div style={{
                  maxWidth: '520px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #3A3B3C',
                  background: '#242526',
                  color: '#E4E6EB',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  {/* Image Placeholder */}
                  <div style={{
                    height: '240px',
                    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    borderBottom: '1px solid #3A3B3C'
                  }}>
                    <Sparkles size={36} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>og:image 1200 x 630px</span>
                  </div>

                  <div style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#B0B3B8', marginBottom: '4px' }}>
                      {getCleanDomain(sandboxUrl)}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#E4E6EB', lineHeight: 1.3, marginBottom: '6px' }}>
                      {sandboxTitle}
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#B0B3B8', lineHeight: 1.45, maxHeight: '38px', overflow: 'hidden' }}>
                      {sandboxDesc}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Twitter / X Summary Large Image Card Preview */}
            {sandboxPreviewType === 'twitter' && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <Share2 size={16} color="var(--text-primary)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Twitter / X Summary Card with Large Image
                  </span>
                </div>

                <div style={{
                  maxWidth: '500px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #2F3336',
                  background: '#000000',
                  color: '#E7E9EA',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  {/* Image banner */}
                  <div style={{
                    height: '240px',
                    background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    position: 'relative'
                  }}>
                    <Sparkles size={36} color="var(--accent-cyan)" />
                    <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>twitter:image 2:1 ratio</span>
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      background: 'rgba(0, 0, 0, 0.77)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: '#FFFFFF'
                    }}>
                      {getCleanDomain(sandboxUrl)}
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#E7E9EA', lineHeight: 1.3, marginBottom: '4px' }}>
                      {sandboxTitle}
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#71767B', lineHeight: 1.45 }}>
                      {sandboxDesc}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function HelpCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function getCleanDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname;
  } catch {
    return url;
  }
}
