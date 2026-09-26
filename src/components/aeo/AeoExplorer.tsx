import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Compass,
  Bot,
  Layers,
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Search,
  RefreshCw,
  Volume2,
  Mic,
  FileText,
  Code2,
  HelpCircle,
  ArrowRight,
  Globe,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import {
  AeoAnalysis,
  AnswerEngineId,
  AeoDraftingAnalysis
} from '../../engine/aeoTypes';
import { AeoService } from '../../engine/aeoService';

interface AeoExplorerProps {
  targetUrl?: string;
  initialQuery?: string;
}

type AeoTab = 'overview' | 'simulator' | 'content_audit' | 'schema_studio' | 'opportunities' | 'sandbox';

export const AeoExplorer: React.FC<AeoExplorerProps> = ({
  targetUrl = 'https://www.posterscraft.com',
  initialQuery = 'What is the best web development agency in Kolkata?'
}) => {
  const [activeTab, setActiveTab] = useState<AeoTab>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<AeoAnalysis | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<string>(initialQuery);
  const [customQueryInput, setCustomQueryInput] = useState<string>(initialQuery);
  const [selectedEngine, setSelectedEngine] = useState<AnswerEngineId>('google_ai_overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Sandbox State
  const [draftQuery, setDraftQuery] = useState<string>('What is the best web development agency in Kolkata?');
  const [draftText, setDraftText] = useState<string>(
    'PostersCraft is a premier web development and digital marketing agency in Kolkata, specializing in custom React applications, high-performance e-commerce portals, and enterprise SEO growth. Founded with a focus on engineering excellence, they deliver an average 3.4x organic traffic lift across 150+ client deployments.'
  );
  const [draftAnalysis, setDraftAnalysis] = useState<AeoDraftingAnalysis | null>(null);

  // Load AEO data
  const loadAeoData = async (query = selectedQuery) => {
    setLoading(true);
    try {
      const res = await AeoService.getAnalysis({
        url: targetUrl,
        query
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load AEO analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAeoData(selectedQuery);
  }, [targetUrl]);

  // Handle draft analysis
  useEffect(() => {
    const analysis = AeoService.evaluateDraftLocal(draftQuery, draftText);
    setDraftAnalysis(analysis);
  }, [draftQuery, draftText]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQueryInput.trim()) return;
    setSelectedQuery(customQueryInput.trim());
    loadAeoData(customQueryInput.trim());
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      window.speechSynthesis?.cancel();
    } else {
      setIsPlayingAudio(true);
      const textToSpeak = data?.simulatedResponses.voice_search?.spokenText || draftText;
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.0;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlayingAudio(false), 4000);
      }
    }
  };

  if (loading && !data) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="radar-loader" style={{ margin: '0 auto 1.5rem auto' }} />
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Synthesizing AEO Knowledge Graph...</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Evaluating answer engine readiness for Google AI Overviews, Perplexity AI, ChatGPT Search, and Voice Assistants.
        </p>
      </div>
    );
  }

  const analysis = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Top Banner Header */}
      <div className="card" style={{
        padding: '1.5rem 1.75rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.05) 50%, rgba(17, 24, 39, 0.95) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
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
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
          }}>
            <Sparkles size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                AEO Studio — Answer Engine Optimization
              </h2>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', fontSize: '0.7rem' }}>
                Phase 21
              </span>
              <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#06B6D4', fontSize: '0.7rem' }}>
                AI Search Ready
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Optimize your web content for direct citations in Google AI Overviews, Perplexity AI, ChatGPT Search, Microsoft Copilot, and Voice Search.
            </p>
          </div>
        </div>

        {/* Query Input / Simulator Trigger */}
        <form onSubmit={handleSimulateCustomQuery} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '340px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              value={customQueryInput}
              onChange={(e) => setCustomQueryInput(e.target.value)}
              placeholder="Test conversational search query..."
              style={{
                paddingLeft: '34px',
                fontSize: '0.825rem',
                height: '38px',
                background: 'rgba(11, 15, 23, 0.8)'
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ height: '38px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Evaluate
          </button>
        </form>
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
          { id: 'overview', label: 'Overview & Readiness', icon: <Award size={15} /> },
          { id: 'simulator', label: 'Multi-Engine Simulator', icon: <Bot size={15} />, badge: 'Live Preview' },
          { id: 'content_audit', label: 'Direct Answer & Structure', icon: <Layers size={15} /> },
          { id: 'schema_studio', label: 'Speakable & Schema Studio', icon: <Code2 size={15} /> },
          { id: 'opportunities', label: 'Query Opportunity Matrix', icon: <Compass size={15} /> },
          { id: 'sandbox', label: 'AEO Drafting Sandbox', icon: <FileText size={15} />, badge: 'Real-Time' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AeoTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}>{tab.icon}</span>
              {tab.label}
              {tab.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '10px',
                  background: isActive ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
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

      {/* TAB 1: OVERVIEW & READINESS */}
      {activeTab === 'overview' && analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top KPI Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>AEO Readiness Score</span>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-primary)' }}>Grade {analysis.grade}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{analysis.overallAeoScore}</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
              <div style={{ marginTop: '0.75rem', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${analysis.overallAeoScore}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #06B6D4)' }} />
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Citation Probability</span>
                <Sparkles size={16} color="#06B6D4" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#06B6D4' }}>{analysis.citationLikelihoodScore}%</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--status-success)' }}>High Probability</span>
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Likelihood of target brand appearing in AI answer source cards
              </p>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Information Gain</span>
                <TrendingUp size={16} color="#F59E0B" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B' }}>{analysis.informationGainScore}%</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>8 Unique Stats</span>
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Proprietary benchmark numbers, case metrics, and research proof
              </p>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Voice Search Audio</span>
                <Volume2 size={16} color="#A855F7" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#A855F7' }}>{analysis.voiceReadinessScore}%</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--status-warning)' }}>Speakable Needed</span>
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Readability ease optimal (71), requires Speakable schema
              </p>
            </div>
          </div>

          {/* Engine Readiness Cards Grid */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                  Answer Engine Coverage Matrix
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Diagnostic evaluation of content synthesizability across all major answer engines.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('simulator')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                Open Live Simulator <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {analysis.engineScores.map((engine) => {
                const isOptimal = engine.status === 'optimal';
                const isModerate = engine.status === 'moderate';
                const statusColor = isOptimal ? 'var(--status-success)' : isModerate ? 'var(--status-warning)' : 'var(--status-critical)';

                return (
                  <div
                    key={engine.id}
                    style={{
                      background: 'rgba(17, 24, 39, 0.6)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: statusColor
                        }}>
                          {engine.id === 'google_ai_overview' && <Sparkles size={16} />}
                          {engine.id === 'perplexity' && <Compass size={16} />}
                          {engine.id === 'chatgpt_search' && <Bot size={16} />}
                          {engine.id === 'copilot' && <Layers size={16} />}
                          {engine.id === 'voice_search' && <Volume2 size={16} />}
                          {engine.id === 'featured_snippet' && <Award size={16} />}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {engine.name}
                          </h4>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{engine.category}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: statusColor }}>
                          {engine.score} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 100</span>
                        </div>
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          background: isOptimal ? 'rgba(16, 185, 129, 0.15)' : isModerate ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: statusColor,
                          fontWeight: 600
                        }}>
                          {engine.badge}
                        </span>
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {engine.description}
                    </p>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-primary)', fontWeight: 600 }}>Strengths:</div>
                      {engine.primaryStrengths.slice(0, 2).map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                          <CheckCircle2 size={12} color="var(--status-success)" style={{ flexShrink: 0 }} />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Citation Prob: <strong style={{ color: 'var(--text-primary)' }}>{engine.citationProbability}%</strong>
                      </span>
                      <button
                        onClick={() => {
                          setSelectedEngine(engine.id);
                          setActiveTab('simulator');
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--accent-primary)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          padding: 0
                        }}
                      >
                        Preview Response <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Prioritized AEO Remediation Playbook
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analysis.actionableRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    background: 'rgba(17, 24, 39, 0.75)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className="badge" style={{
                        background: rec.priority === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: rec.priority === 'critical' ? 'var(--status-critical)' : 'var(--status-warning)',
                        textTransform: 'uppercase',
                        fontSize: '0.65rem'
                      }}>
                        {rec.priority}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category: {rec.category}</span>
                      <h4 style={{ margin: 0, fontSize: '0.925rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {rec.title}
                      </h4>
                    </div>
                    {rec.remedySnippet && (
                      <button
                        onClick={() => handleCopy(rec.remedySnippet!, rec.id)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        {copiedKey === rec.id ? <Check size={12} color="var(--status-success)" /> : <Copy size={12} />}
                        {copiedKey === rec.id ? 'Copied' : 'Copy Remediation Snippet'}
                      </button>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {rec.description}
                  </p>
                  {rec.remedySnippet && (
                    <pre style={{
                      margin: 0,
                      padding: '0.85rem 1rem',
                      background: 'rgba(11, 15, 23, 0.95)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: '#E2E8F0',
                      overflowX: 'auto',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      {rec.remedySnippet}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-ENGINE SIMULATOR */}
      {activeTab === 'simulator' && analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Engine Selector Pills */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem'
          }}>
            {[
              { id: 'google_ai_overview', label: 'Google AI Overview (SGE)', icon: <Sparkles size={14} /> },
              { id: 'perplexity', label: 'Perplexity AI', icon: <Compass size={14} /> },
              { id: 'chatgpt_search', label: 'ChatGPT Search', icon: <Bot size={14} /> },
              { id: 'copilot', label: 'Microsoft Copilot', icon: <Layers size={14} /> },
              { id: 'voice_search', label: 'Voice Assistant (Audio)', icon: <Volume2 size={14} /> },
              { id: 'featured_snippet', label: 'Featured Snippet (#0)', icon: <Award size={14} /> },
            ].map((eng) => {
              const isSelected = selectedEngine === eng.id;
              return (
                <button
                  key={eng.id}
                  onClick={() => setSelectedEngine(eng.id as AnswerEngineId)}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.5rem 0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {eng.icon}
                  {eng.label}
                </button>
              );
            })}
          </div>

          {/* Simulated Answer Canvas */}
          {(() => {
            const sim = analysis.simulatedResponses[selectedEngine];
            if (!sim) return <div>No simulation data available.</div>;

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.25rem' }}>
                {/* Main Simulator Viewport */}
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Header info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target Query:</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>"{sim.query}"</span>
                    </div>
                    {sim.targetDomainCited && (
                      <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={12} /> Target Brand Cited #{sim.citationIndex || 1}
                      </span>
                    )}
                  </div>

                  {/* Engine Specific Visual Canvas */}
                  {selectedEngine === 'google_ai_overview' && (
                    <div style={{
                      background: 'rgba(17, 24, 39, 0.85)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Sparkles size={18} color="var(--accent-primary)" />
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Google AI Overview
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Experimental SGE Preview</span>
                      </div>

                      {/* Source Cards Carousel */}
                      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {sim.sourceCards.map((src, i) => (
                          <div
                            key={i}
                            style={{
                              minWidth: '180px',
                              maxWidth: '200px',
                              background: src.isTargetDomain ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                              border: src.isTargetDomain ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '8px',
                              padding: '0.75rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.35rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Globe size={12} color={src.isTargetDomain ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: src.isTargetDomain ? 'var(--accent-primary)' : 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {src.siteName}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                              {src.pageTitle}
                            </div>
                            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {src.snippetQuote}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Synthesized Text */}
                      <div style={{
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        color: 'var(--text-primary)',
                        whiteSpace: 'pre-line',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        paddingTop: '0.75rem'
                      }}>
                        {sim.synthesizedAnswer}
                      </div>

                      {/* Follow-up Prompts */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Explore further:</span>
                        {sim.followUpQueries.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedQuery(q);
                              setCustomQueryInput(q);
                              loadAeoData(q);
                            }}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '16px',
                              padding: '0.25rem 0.65rem',
                              fontSize: '0.725rem',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer'
                            }}
                          >
                            + {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEngine === 'perplexity' && (
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Compass size={18} color="#06B6D4" />
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Perplexity AI Answer
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#06B6D4' }}>Pro Search Citation Synthesis</span>
                      </div>

                      {/* Sources bar */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {sim.sourceCards.map((src, i) => (
                          <span
                            key={i}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.725rem',
                              background: src.isTargetDomain ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              border: src.isTargetDomain ? '1px solid #06B6D4' : '1px solid rgba(255, 255, 255, 0.1)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '6px',
                              color: src.isTargetDomain ? '#06B6D4' : 'var(--text-secondary)'
                            }}
                          >
                            <span style={{ fontWeight: 700 }}>[{i + 1}]</span> {src.siteName}
                          </span>
                        ))}
                      </div>

                      <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                        {sim.synthesizedAnswer}
                      </div>

                      {/* Related follow-ups */}
                      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Related Searches:</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {sim.followUpQueries.map((q, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedQuery(q);
                                setCustomQueryInput(q);
                                loadAeoData(q);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.4rem 0.6rem',
                                background: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: '6px',
                                fontSize: '0.775rem',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer'
                              }}
                            >
                              <span>{q}</span>
                              <ChevronRight size={13} color="var(--text-muted)" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEngine === 'chatgpt_search' && (
                    <div style={{
                      background: 'rgba(23, 23, 23, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Bot size={18} color="#10B981" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          ChatGPT Search (OpenAI)
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                        {sim.synthesizedAnswer}
                      </div>
                    </div>
                  )}

                  {selectedEngine === 'copilot' && (
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={18} color="#6366F1" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Microsoft Copilot (Bing Index)
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                        {sim.synthesizedAnswer}
                      </div>
                    </div>
                  )}

                  {selectedEngine === 'voice_search' && (
                    <div style={{
                      background: 'radial-gradient(circle at top right, rgba(168, 85, 247, 0.15) 0%, rgba(17, 24, 39, 0.95) 70%)',
                      border: '1px solid rgba(168, 85, 247, 0.35)',
                      borderRadius: '12px',
                      padding: '1.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Volume2 size={20} color="#A855F7" />
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Voice Search Speech Synthesizer
                          </span>
                        </div>
                        <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#C084FC' }}>
                          Siri / Google Assistant
                        </span>
                      </div>

                      {/* Audio playback controls */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        background: 'rgba(0, 0, 0, 0.4)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        <button
                          onClick={handleToggleAudio}
                          className="btn btn-primary"
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isPlayingAudio ? 'var(--status-critical)' : 'var(--accent-primary)',
                            borderColor: isPlayingAudio ? 'var(--status-critical)' : 'var(--accent-primary)'
                          }}
                        >
                          {isPlayingAudio ? <Volume2 size={18} className="pulse" /> : <Mic size={18} />}
                        </button>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                            {isPlayingAudio ? 'Speaking simulated response aloud...' : 'Click to hear synthetic speech playback'}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                            Spoken Duration: ~{sim.spokenDurationSeconds || 8.5}s • Reading Level: {sim.readingGradeLevel || '7th Grade'}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        borderLeft: '4px solid #A855F7',
                        fontSize: '0.9rem',
                        fontStyle: 'italic',
                        lineHeight: 1.5,
                        color: 'var(--text-primary)'
                      }}>
                        "{sim.spokenText || sim.synthesizedAnswer}"
                      </div>
                    </div>
                  )}

                  {selectedEngine === 'featured_snippet' && (
                    <div style={{
                      background: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Award size={18} color="var(--accent-primary)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Google Featured Snippet #0
                        </span>
                      </div>

                      <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          {sim.synthesizedAnswer}
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>https://www.{analysis.targetDomain} › services</div>
                          <div style={{ fontSize: '0.85rem', color: '#60A5FA', fontWeight: 600 }}>{sim.sourceCards[0]?.pageTitle || 'Web Services'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Engine Diagnostic Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                      Citation Probability Audit
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                        {analysis.engineScores.find(e => e.id === selectedEngine)?.citationProbability || 78}%
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chance of Citation</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Brand Mention Position:</span>
                        <strong style={{ color: 'var(--accent-primary)' }}>#1 Citation Slot</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Citation Format:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>Direct Quote & Source Card</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>LLM Extractability:</span>
                        <strong style={{ color: 'var(--status-success)' }}>High (92/100)</strong>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                      Competitor Sources in Overview
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {sim.sourceCards.map((src, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '0.5rem',
                            background: src.isTargetDomain ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                            border: src.isTargetDomain ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', fontWeight: src.isTargetDomain ? 700 : 500, color: src.isTargetDomain ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                            {src.siteName}
                          </span>
                          <span className="badge" style={{ fontSize: '0.65rem', background: src.isTargetDomain ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)', color: src.isTargetDomain ? '#000' : 'var(--text-muted)' }}>
                            {src.isTargetDomain ? 'Our Site' : 'Competitor'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: DIRECT ANSWER & CONTENT AUDIT */}
      {activeTab === 'content_audit' && analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Inverted Pyramid Assessment */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                  Inverted Pyramid Direct Answer Audit
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Answer engines scan the first 40–60 words under introductory headings to extract definitive answers.
                </p>
              </div>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-primary)', fontSize: '0.75rem' }}>
                Score: {analysis.invertedPyramid.concisenessScore}/100
              </span>
            </div>

            <div style={{
              background: 'rgba(11, 15, 23, 0.8)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                  Detected Direct Answer Snippet ({analysis.invertedPyramid.leadParagraphWords} words):
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Target Range: 40–60 words
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{analysis.invertedPyramid.detectedSnippet}"
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem' }}>
                💡 {analysis.invertedPyramid.recommendation}
              </div>
            </div>
          </div>

          {/* Question Headings Table */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Conversational Question Headings Audit
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Headings structured as natural language questions (What, How, Cost, Why) receive 3.2x higher citation frequency.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Level</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Heading Text</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Question Type</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Immediate Answer</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Words</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Information Gain</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.questionHeadings.map((h) => (
                    <tr key={h.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {h.level.toUpperCase()}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {h.headingText}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {h.questionType}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {h.hasImmediateAnswerUnderneath ? (
                          <span style={{ color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={13} /> Present Underneath
                          </span>
                        ) : (
                          <span style={{ color: 'var(--status-critical)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <XCircle size={13} /> Missing Direct Answer
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)' }}>
                        {h.directAnswerWordCount}w
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className="badge" style={{
                          background: h.informationGainRating === 'high' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: h.informationGainRating === 'high' ? 'var(--status-success)' : 'var(--status-warning)'
                        }}>
                          {h.informationGainRating.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Information Gain Signals */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Information Gain Signals (Proprietary Proof Points)
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              LLMs prioritize citing pages that offer net-new data, statistics, and verifiable claims absent from general consensus.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {analysis.informationGainSignals.map((sig) => (
                <div
                  key={sig.id}
                  style={{
                    background: 'rgba(17, 24, 39, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {sig.label}
                    </h4>
                    <span className="badge" style={{
                      background: sig.status === 'passed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: sig.status === 'passed' ? 'var(--status-success)' : 'var(--status-warning)'
                    }}>
                      {sig.foundCount} Detected
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {sig.description}
                  </p>
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Discovered Citations:</div>
                    {sig.examples.map((ex, i) => (
                      <div key={i} style={{ fontSize: '0.725rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ color: 'var(--accent-primary)' }}>•</span> {ex}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SPEAKABLE & SCHEMA STUDIO */}
      {activeTab === 'schema_studio' && analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              AEO Structured Data & Schema Coverage
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Rich structured schemas explicitly declare which sections of the webpage answer engines should cite and read aloud.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {analysis.schemaAudit.map((sch) => (
                <div
                  key={sch.type}
                  style={{
                    background: 'rgba(17, 24, 39, 0.7)',
                    border: sch.detected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Code2 size={16} color={sch.detected ? 'var(--accent-primary)' : 'var(--status-critical)'} />
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {sch.type} Schema
                      </h4>
                    </div>
                    <span className="badge" style={{
                      background: sch.detected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: sch.detected ? 'var(--status-success)' : 'var(--status-critical)'
                    }}>
                      {sch.detected ? 'Detected & Valid' : 'Missing in Production'}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {sch.impactExplanation}
                  </p>

                  {sch.jsonLdSnippet && (
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Generated JSON-LD:</span>
                        <button
                          onClick={() => handleCopy(sch.jsonLdSnippet!, sch.type)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent-primary)',
                            fontSize: '0.725rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          {copiedKey === sch.type ? <Check size={12} /> : <Copy size={12} />}
                          {copiedKey === sch.type ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre style={{
                        margin: 0,
                        padding: '0.75rem',
                        background: 'rgba(11, 15, 23, 0.95)',
                        borderRadius: '6px',
                        fontSize: '0.725rem',
                        color: '#E2E8F0',
                        overflowX: 'auto',
                        maxHeight: '160px'
                      }}>
                        {sch.jsonLdSnippet}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: QUERY OPPORTUNITIES */}
      {activeTab === 'opportunities' && analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              AEO Query Opportunity Matrix
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              High-value conversational queries triggering AI Overviews where your domain can claim top citations.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Target Query</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Intent</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Search Vol</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>AI Overview Rate</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Brand Cited</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Recommended Format</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.queryOpportunities.map((qo) => (
                    <tr key={qo.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {qo.query}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>
                          {qo.intent}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)' }}>
                        {qo.searchVolume.toLocaleString()}/mo
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                          {qo.aiOverviewTriggerRate}%
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {qo.brandCited ? (
                          <span style={{ color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={13} /> Position #{qo.brandCitationPosition}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--status-warning)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <AlertTriangle size={13} /> Uncited
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                        {qo.recommendedFormat}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => {
                              setSelectedQuery(qo.query);
                              setCustomQueryInput(qo.query);
                              setActiveTab('simulator');
                              loadAeoData(qo.query);
                            }}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                          >
                            Simulate
                          </button>
                          <button
                            onClick={() => {
                              setDraftQuery(qo.query);
                              setActiveTab('sandbox');
                            }}
                            className="btn btn-primary"
                            style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                          >
                            Draft Answer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DRAFTING SANDBOX */}
      {activeTab === 'sandbox' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)', gap: '1.25rem' }}>
          {/* Left Editing Workbench */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                Interactive AEO Answer Sandbox
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                Draft, edit, and fine-tune your answer snippet. Receive real-time metrics on inverted pyramid conciseness, readability, and instant schema generation.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Target Question / Query
              </label>
              <input
                type="text"
                className="input-field"
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                placeholder="e.g. What is the best web development agency in Kolkata?"
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Draft Answer Paragraph (Golden Ratio: 40–60 words)
                </label>
                <span style={{
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  color: draftAnalysis?.invertedPyramidPass ? 'var(--status-success)' : 'var(--status-warning)'
                }}>
                  {draftAnalysis?.wordCount || 0} words • {draftAnalysis?.charCount || 0} chars
                </span>
              </div>
              <textarea
                className="input-field"
                rows={5}
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder="Write concise direct answer with proof points..."
                style={{ width: '100%', fontSize: '0.85rem', lineHeight: 1.5, resize: 'vertical' }}
              />
            </div>

            {/* Live Feedback alerts */}
            {draftAnalysis && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {draftAnalysis.feedback.map((fb, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.775rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: fb.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : fb.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(6, 182, 212, 0.1)',
                      border: fb.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : fb.type === 'warning' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(6, 182, 212, 0.3)',
                      color: fb.type === 'success' ? 'var(--status-success)' : fb.type === 'warning' ? 'var(--status-warning)' : '#06B6D4'
                    }}
                  >
                    {fb.type === 'success' && <CheckCircle2 size={14} />}
                    {fb.type === 'warning' && <AlertTriangle size={14} />}
                    {fb.type === 'info' && <HelpCircle size={14} />}
                    <span>{fb.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Generated Schema for this draft */}
            {draftAnalysis && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    Instant Speakable & FAQ Schema
                  </h4>
                  <button
                    onClick={() => handleCopy(draftAnalysis.generatedSpeakableJsonLd, 'speakable_draft')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    {copiedKey === 'speakable_draft' ? <Check size={12} color="var(--status-success)" /> : <Copy size={12} />}
                    Copy Speakable JSON-LD
                  </button>
                </div>
                <pre style={{
                  margin: 0,
                  padding: '0.75rem',
                  background: 'rgba(11, 15, 23, 0.95)',
                  borderRadius: '6px',
                  fontSize: '0.725rem',
                  color: '#E2E8F0',
                  overflowX: 'auto',
                  maxHeight: '140px'
                }}>
                  {draftAnalysis.generatedSpeakableJsonLd}
                </pre>
              </div>
            )}
          </div>

          {/* Right Live Gauge Panel */}
          {draftAnalysis && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  AEO Synthesis Metrics
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Direct Answer Clarity:</span>
                      <strong style={{ color: 'var(--accent-primary)' }}>{draftAnalysis.directAnswerClarityScore}/100</strong>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${draftAnalysis.directAnswerClarityScore}%`, height: '100%', background: 'var(--accent-primary)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Quotability Index:</span>
                      <strong style={{ color: '#06B6D4' }}>{draftAnalysis.quotabilityIndex}/100</strong>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${draftAnalysis.quotabilityIndex}%`, height: '100%', background: '#06B6D4' }} />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.775rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Reading Ease:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{draftAnalysis.fleschScore}/100</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Grade Level:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{draftAnalysis.readingGradeLevel}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Speaking Duration:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>~{draftAnalysis.speakableEstimatedSeconds}s</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ready to insert HTML snippet */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Copyable HTML Block
                  </h4>
                  <button
                    onClick={() => handleCopy(`<div class="aeo-direct-answer">\n  <h2>${draftQuery}</h2>\n  <p>${draftText}</p>\n</div>`, 'html_draft')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '0.725rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}
                  >
                    {copiedKey === 'html_draft' ? <Check size={12} /> : <Copy size={12} />}
                    Copy HTML
                  </button>
                </div>
                <pre style={{
                  margin: 0,
                  padding: '0.75rem',
                  background: 'rgba(11, 15, 23, 0.95)',
                  borderRadius: '6px',
                  fontSize: '0.725rem',
                  color: '#93C5FD',
                  overflowX: 'auto'
                }}>
{`<div class="aeo-direct-answer">
  <h2>${draftQuery}</h2>
  <p>${draftText}</p>
</div>`}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
