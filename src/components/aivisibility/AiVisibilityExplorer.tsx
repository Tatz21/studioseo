import React, { useState, useEffect } from 'react';
import {
  Eye,
  Bot,
  Award,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Search,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  ThumbsUp,
  FileCode,
  Users,
  ShieldAlert
} from 'lucide-react';
import {
  AiVisibilityAnalysis,
  PromptBenchmarkItem
} from '../../engine/aiVisibilityTypes';
import { AiVisibilityService } from '../../engine/aiVisibilityService';

interface AiVisibilityExplorerProps {
  targetUrl?: string;
  initialQuery?: string;
}

type VisibilityTab = 'overview' | 'benchmarks' | 'competitors' | 'crawlers' | 'sentinel';

export const AiVisibilityExplorer: React.FC<AiVisibilityExplorerProps> = ({
  targetUrl = 'https://www.posterscraft.com'
}) => {
  const [activeTab, setActiveTab] = useState<VisibilityTab>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<AiVisibilityAnalysis | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptBenchmarkItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Custom Prompt Tester State
  const [customPromptInput, setCustomPromptInput] = useState<string>('Which agency in Kolkata provides the best custom Next.js web development?');
  const [testingCustomPrompt, setTestingCustomPrompt] = useState<boolean>(false);
  const [customPromptResult, setCustomPromptResult] = useState<PromptBenchmarkItem | null>(null);

  // Policy Mode Toggle
  const [policyMode, setPolicyMode] = useState<'max_visibility' | 'privacy_balanced'>('max_visibility');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await AiVisibilityService.getAnalysis({ url: targetUrl });
      setData(res);
      if (res.prompts.length > 0) {
        setSelectedPrompt(res.prompts[0]);
      }
    } catch (err) {
      console.error('Failed to load AI Visibility data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [targetUrl]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunCustomPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPromptInput.trim()) return;
    setTestingCustomPrompt(true);
    try {
      const result = await AiVisibilityService.testCustomPrompt({
        prompt: customPromptInput.trim(),
        url: targetUrl
      });
      setCustomPromptResult(result);
      setSelectedPrompt(result);
    } catch (err) {
      console.error('Error running custom prompt test:', err);
    } finally {
      setTestingCustomPrompt(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="radar-loader" style={{ margin: '0 auto 1.5rem auto' }} />
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Synthesizing Generative LLM Share of Voice...</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Tracking brand citation frequency across OpenAI ChatGPT, Google Gemini, Anthropic Claude, Perplexity AI, and Microsoft Copilot.
        </p>
      </div>
    );
  }

  const analysis = data;

  const filteredPrompts = analysis?.prompts.filter(p => {
    if (categoryFilter === 'all') return true;
    return p.category === categoryFilter;
  }) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Top Banner Header */}
      <div className="card" style={{
        padding: '1.5rem 1.75rem',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(16, 185, 129, 0.05) 50%, rgba(17, 24, 39, 0.95) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid #06B6D4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#06B6D4',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)'
          }}>
            <Eye size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                AI Visibility & LLM Share of Voice
              </h2>
              <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#06B6D4', border: '1px solid #06B6D4', fontSize: '0.7rem' }}>
                Phase 22
              </span>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-primary)', fontSize: '0.7rem' }}>
                6 Models Tracked
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Track how frequently generative AI models (ChatGPT, Gemini, Claude, Perplexity, Copilot, Llama) cite and recommend your brand.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={() => setActiveTab('benchmarks')}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Search size={14} />
            Test Prompt Benchmark
          </button>
          <button
            onClick={() => loadData()}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.5rem',
        overflowX: 'auto'
      }}>
        {[
          { id: 'overview', label: 'Overview & Share of Voice', icon: <TrendingUp size={15} /> },
          { id: 'benchmarks', label: 'Prompt Benchmark Library', icon: <Bot size={15} />, badge: `${analysis?.prompts.length || 0} Tested` },
          { id: 'competitors', label: 'Competitor AI Head-to-Head', icon: <Users size={15} /> },
          { id: 'crawlers', label: 'AI Crawlers & Robots Policy', icon: <FileCode size={15} /> },
          { id: 'sentinel', label: 'Hallucination Sentinel', icon: <ShieldAlert size={15} />, badge: `${analysis?.hallucinations.length || 0} Alerts` },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as VisibilityTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ color: isActive ? '#06B6D4' : 'var(--text-muted)' }}>{tab.icon}</span>
              {tab.label}
              {tab.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '10px',
                  background: isActive ? '#06B6D4' : 'rgba(255, 255, 255, 0.1)',
                  color: isActive ? '#000' : 'var(--text-secondary)',
                  fontWeight: 700
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & SHARE OF VOICE */}
      {activeTab === 'overview' && analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top High-Density Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>AI Visibility Index</span>
                <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#06B6D4' }}>Tier-1 Visibility</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#06B6D4' }}>{analysis.aiVisibilityIndex}</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
              <div style={{ marginTop: '0.75rem', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${analysis.aiVisibilityIndex}%`, height: '100%', background: 'linear-gradient(90deg, #06B6D4, #10B981)' }} />
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>AI Share of Voice (SoV)</span>
                <TrendingUp size={16} color="var(--accent-primary)" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{analysis.shareOfVoicePercentage}%</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--status-success)' }}>Market Leader</span>
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Target domain appears in {analysis.brandMentionedPromptsCount} of {analysis.totalPromptsTested} monitored buyer prompts
              </p>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Avg Recommendation Rank</span>
                <Award size={16} color="#F59E0B" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B' }}>#{analysis.averageRecommendationRank}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Position in Lists</span>
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Average ordinal rank when recommended alongside other vendors
              </p>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>LLM Sentiment Score</span>
                <ThumbsUp size={16} color="#A855F7" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#A855F7' }}>{analysis.overallSentimentScore}%</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--status-success)' }}>Highly Favorable</span>
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Consistently highlighted for engineering rigor and high Core Web Vitals
              </p>
            </div>
          </div>

          {/* Model Breakdown Leaderboard */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                  Model-by-Model Visibility Leaderboard
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Brand recommendation rates across the 6 leading commercial generative models.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('benchmarks')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                Inspect All Prompts <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {analysis.models.map((mod) => {
                const isDominant = mod.status === 'dominant';
                const isStrong = mod.status === 'strong';
                const statusColor = isDominant ? 'var(--accent-primary)' : isStrong ? '#06B6D4' : '#F59E0B';

                return (
                  <div
                    key={mod.id}
                    style={{
                      background: 'rgba(17, 24, 39, 0.6)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {mod.name}
                          </h4>
                          <span className="badge" style={{
                            fontSize: '0.65rem',
                            background: isDominant ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                            color: statusColor,
                            fontWeight: 600
                          }}>
                            {mod.status.toUpperCase()}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{mod.developer} • {mod.version}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: statusColor }}>
                          {mod.shareOfVoice}%
                        </span>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Share of Voice</div>
                      </div>
                    </div>

                    <div style={{
                      padding: '0.65rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '6px',
                      fontSize: '0.775rem',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic',
                      lineHeight: 1.4,
                      borderLeft: `3px solid ${statusColor}`
                    }}>
                      {mod.sampleRecommendationQuote}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.725rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Mention Rate: <strong style={{ color: 'var(--text-primary)' }}>{mod.mentionRate}%</strong></span>
                      <span style={{ color: 'var(--text-muted)' }}>Avg Rank: <strong style={{ color: 'var(--text-primary)' }}>#{mod.averageRank}</strong></span>
                      <span style={{ color: 'var(--text-muted)' }}>Sentiment: <strong style={{ color: 'var(--status-success)' }}>{mod.sentimentScore}%</strong></span>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Top Sources:</span>
                      {mod.preferredSources.map((src, i) => (
                        <span key={i} style={{ fontSize: '0.675rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Brand Attribute Cloud */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Semantic Brand Entity Associations in LLMs
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              What key attributes, specializations, and adjectives do AI models consistently associate with your brand?
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {analysis.attributes.map((attr, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(17, 24, 39, 0.7)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {attr.attribute}
                    </span>
                    <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-primary)', fontSize: '0.675rem' }}>
                      +{Math.round(attr.sentimentWeight * 100)}% Salience
                    </span>
                  </div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                    {attr.sampleSnippet}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROMPT BENCHMARKS */}
      {activeTab === 'benchmarks' && analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Custom Prompt Interactive Tester */}
          <div className="card" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Real-Time Custom Prompt LLM Simulator
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Type any high-intent commercial prompt to simulate real-time citation results across ChatGPT, Gemini, Claude, and Perplexity.
            </p>

            <form onSubmit={handleRunCustomPrompt} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="input-field"
                value={customPromptInput}
                onChange={(e) => setCustomPromptInput(e.target.value)}
                placeholder="Enter prompt e.g. Which agency in Kolkata builds the best Next.js web apps?"
                style={{ flex: 1, fontSize: '0.85rem' }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={testingCustomPrompt}
                style={{ fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
              >
                <Search size={14} className={testingCustomPrompt ? 'spin' : ''} />
                {testingCustomPrompt ? 'Simulating Models...' : 'Run LLM Benchmark'}
              </button>
            </form>
          </div>

          {customPromptResult && (
            <div style={{
              padding: '0.85rem 1.25rem',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: 'var(--text-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--status-success)" />
                <span>Simulated benchmark verdict across 6 models for: <strong>"{customPromptResult.prompt}"</strong></span>
              </div>
              <span className="badge" style={{ background: 'var(--accent-primary)', color: '#000', fontWeight: 700 }}>
                {customPromptResult.targetBrandMentioned ? `Rank #${customPromptResult.bestRank}` : 'Unmentioned'}
              </span>
            </div>
          )}

          {/* Prompts Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(340px, 0.9fr)', gap: '1.25rem' }}>
            {/* Left Prompt Table */}
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Monitored Buying Prompts ({filteredPrompts.length})
                </h4>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {['all', 'Vendor Recommendation', 'Technical Comparison', 'Local Discovery'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      style={{
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                        background: categoryFilter === cat ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                        color: categoryFilter === cat ? '#000' : 'var(--text-secondary)',
                        border: 'none',
                        fontWeight: categoryFilter === cat ? 700 : 500
                      }}
                    >
                      {cat === 'all' ? 'All Prompts' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredPrompts.map((p) => {
                  const isSelected = selectedPrompt?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPrompt(p)}
                      style={{
                        padding: '0.85rem 1rem',
                        background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(17, 24, 39, 0.6)',
                        border: isSelected ? '1px solid #06B6D4' : '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>
                          {p.category}
                        </span>
                        {p.targetBrandMentioned ? (
                          <span style={{ fontSize: '0.725rem', color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                            <CheckCircle2 size={13} /> Recommended Rank #{p.bestRank}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.725rem', color: 'var(--status-warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <AlertTriangle size={13} /> Unmentioned
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        "{p.prompt}"
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Detailed Model Verdicts Viewer */}
            {selectedPrompt && (
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Selected Prompt Benchmark:</span>
                  <h4 style={{ margin: '0.25rem 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    "{selectedPrompt.prompt}"
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.35rem' }}>
                    💡 Play: {selectedPrompt.recommendedPlay}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Object.entries(selectedPrompt.modelVerdicts).map(([mId, verdict]) => (
                    <div
                      key={mId}
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(11, 15, 23, 0.85)',
                        border: verdict.mentioned ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {verdict.modelName}
                        </span>
                        <span className="badge" style={{
                          fontSize: '0.65rem',
                          background: verdict.mentioned ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          color: verdict.mentioned ? 'var(--status-success)' : 'var(--text-muted)'
                        }}>
                          {verdict.mentioned ? `Cited #${verdict.rank}` : 'Not Cited'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {verdict.extractedQuote}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COMPETITOR HEAD-TO-HEAD */}
      {activeTab === 'competitors' && analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Competitive AI Share of Voice (Head-to-Head)
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Comparison of prompt win rates, total AI citations, and retrieval sources across regional market competitors.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analysis.competitors.map((comp) => (
                <div
                  key={comp.domain}
                  style={{
                    background: comp.isTargetBrand ? 'rgba(6, 182, 212, 0.08)' : 'rgba(17, 24, 39, 0.6)',
                    border: comp.isTargetBrand ? '1px solid #06B6D4' : '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: comp.isTargetBrand ? '#06B6D4' : 'var(--text-primary)' }}>
                          {comp.brandName}
                        </h4>
                        {comp.isTargetBrand && (
                          <span className="badge" style={{ background: '#06B6D4', color: '#000', fontWeight: 700, fontSize: '0.65rem' }}>
                            Target Website
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>https://{comp.domain}</span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: comp.isTargetBrand ? '#06B6D4' : 'var(--text-primary)' }}>
                        {comp.shareOfVoice}%
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI Share of Voice</span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${comp.shareOfVoice}%`, height: '100%', background: comp.isTargetBrand ? '#06B6D4' : 'var(--text-secondary)' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.775rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Total Prompt Mentions: <strong style={{ color: 'var(--text-primary)' }}>{comp.mentionCount}</strong>
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Head-to-Head Record: <strong style={{ color: 'var(--status-success)' }}>{comp.headToHeadWins}W</strong> - <strong style={{ color: 'var(--status-critical)' }}>{comp.headToHeadLosses}L</strong>
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Top Winning Models: <strong style={{ color: 'var(--text-primary)' }}>{comp.topWinningModels.join(', ')}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI CRAWLERS & ROBOTS POLICY */}
      {activeTab === 'crawlers' && analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              AI Search Bots & LLM Crawler Telemetry
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Audit crawler permissions for generative models. Allowing search retrieval bots is mandatory for live answer engine citations.
            </p>

            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Crawler Bot</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Entity / Owner</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Purpose</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Access Status</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Impact on Visibility</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Recommended Directive</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.crawlerBots.map((bot) => (
                    <tr key={bot.botName} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#06B6D4' }}>
                        {bot.botName}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)' }}>
                        {bot.owner}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>
                          {bot.purpose}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{ color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={13} /> {bot.currentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className="badge" style={{
                          background: bot.impactOnAiVisibility === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: bot.impactOnAiVisibility === 'critical' ? 'var(--status-critical)' : 'var(--status-success)'
                        }}>
                          {bot.impactOnAiVisibility.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                        {bot.recommendedDirective}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Generated Policy Studio */}
            <div style={{
              background: 'rgba(11, 15, 23, 0.9)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setPolicyMode('max_visibility')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: policyMode === 'max_visibility' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                      color: policyMode === 'max_visibility' ? '#000' : 'var(--text-secondary)',
                      border: 'none'
                    }}
                  >
                    Maximum AI Visibility Policy (Recommended)
                  </button>
                  <button
                    onClick={() => setPolicyMode('privacy_balanced')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: policyMode === 'privacy_balanced' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                      color: policyMode === 'privacy_balanced' ? '#000' : 'var(--text-secondary)',
                      border: 'none'
                    }}
                  >
                    Training Shield Policy (Search Allowed, Training Blocked)
                  </button>
                </div>
                <button
                  onClick={() => handleCopy(
                    policyMode === 'max_visibility' 
                      ? analysis.generatedRobotsPolicy.maxVisibilitySnippet 
                      : analysis.generatedRobotsPolicy.privacyBalancedSnippet,
                    'robots_policy'
                  )}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {copiedKey === 'robots_policy' ? <Check size={12} color="var(--status-success)" /> : <Copy size={12} />}
                  Copy robots.txt Policy
                </button>
              </div>

              <pre style={{
                margin: 0,
                padding: '1rem',
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: '#38BDF8',
                overflowX: 'auto'
              }}>
                {policyMode === 'max_visibility' 
                  ? analysis.generatedRobotsPolicy.maxVisibilitySnippet 
                  : analysis.generatedRobotsPolicy.privacyBalancedSnippet}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: HALLUCINATION SENTINEL */}
      {activeTab === 'sentinel' && analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              LLM Factuality & Hallucination Sentinel
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Automated surveillance detecting when generative AI answers state inaccurate facts, outdated contact details, or false service offerings about your business.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analysis.hallucinations.map((hal) => (
                <div
                  key={hal.id}
                  style={{
                    background: 'rgba(17, 24, 39, 0.75)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--status-warning)' }}>
                        {hal.issueType}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Detected in: {hal.modelName}
                      </h4>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Severity: {hal.severity.toUpperCase()}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--status-critical)', fontWeight: 700, marginBottom: '0.25rem' }}>HALLUCINATED CLAIM:</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>"{hal.hallucinatedClaim}"</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--status-success)', fontWeight: 700, marginBottom: '0.25rem' }}>VERIFIED GROUND TRUTH:</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>"{hal.actualFact}"</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                    💡 <strong>Remediation Play:</strong> {hal.remediationAction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
