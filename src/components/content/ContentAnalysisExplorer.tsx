import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  Edit3,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Type,
  List,
  Target,
  Copy,
  Check,
  Zap
} from 'lucide-react';
import { ContentAnalysisReport } from '../../engine/contentAnalysisTypes';
import { ContentAnalysisService } from '../../engine/contentAnalysisService';

interface ContentAnalysisExplorerProps {
  currentUrl: string;
  initialHtml?: string;
  defaultKeyword?: string;
  onNavigateToKeywords?: () => void;
}

type ContentTab = 'scorecard' | 'readability' | 'nlp' | 'structure' | 'editor';

export const ContentAnalysisExplorer: React.FC<ContentAnalysisExplorerProps> = ({
  currentUrl,
  initialHtml,
  defaultKeyword = 'vintage movie posters',
  onNavigateToKeywords
}) => {
  const [activeTab, setActiveTab] = useState<ContentTab>('scorecard');
  const [focusKeyword, setFocusKeyword] = useState<string>(defaultKeyword);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ContentAnalysisReport | null>(null);

  // Live Editor State
  const [editorText, setEditorText] = useState<string>(() => {
    return initialHtml ? initialHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  });
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [termFilter, setTermFilter] = useState<'all' | 'missing' | 'optimal' | 'overused'>('all');

  // Load Content Analysis Report
  const loadAnalysis = async (keywordOverride?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const kw = keywordOverride !== undefined ? keywordOverride : focusKeyword;
      const res = await ContentAnalysisService.analyzeContent({
        url: currentUrl,
        html: initialHtml,
        text: editorText || undefined,
        focusKeyword: kw
      });
      setReport(res);
      if (!editorText && initialHtml) {
        setEditorText(initialHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze page content');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, [currentUrl, initialHtml]);

  // Handle Real-Time Editor Updates
  const handleEditorChange = (newText: string) => {
    setEditorText(newText);
    // Instant client-side re-evaluation for zero typing lag
    const instantReport = ContentAnalysisService.clientSideAnalyze({
      url: currentUrl,
      text: newText,
      focusKeyword
    });
    setReport(instantReport);
  };

  const handleCopyEditorContent = () => {
    navigator.clipboard.writeText(editorText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleLoadSampleContent = () => {
    const sample = `PostersCraft Studio: Curated Vintage Movie Posters & Cinema Lithographs

Welcome to PostersCraft, an independent printmaking atelier dedicated to archiving, restoring, and reproducing authentic vintage movie posters from the golden age of Hollywood cinema and European avant-garde art movements.

Museum-Grade Lithographic Printing & Archival Standards
Every edition in our curated collection is meticulously rendered on 310gsm museum-grade archival cotton rag using fine art giclée pigment inks. We do not use digital gloss paper or cheap commercial poster stocks; our substrates resist UV yellowing for up to 200 years, preserving deep carbon blacks and rich saturated hues.

Preserving Classic Film Noir & 1920s German Expressionism
From Heinz Schulz-Neudamm's iconic Metropolis (1927) French release to 1940s film noir classics like Casablanca and The Maltese Falcon, our master lithographers manually restore scanned film negatives, correcting age tears and chemical fading while preserving original typographic letterforms.

- High-resolution 2400 DPI optical scans from private cinema archives
- Custom bespoke walnut and matte black aluminum framing options
- Museum linen backing available for oversized collectors editions

Gallery Wall Styling & Interior Decor Inspiration
Whether you are curating a mid-century modern living room or creating an atmospheric home theater, vintage cinema prints provide authoritative focal points. Pair graphic Bauhaus typography with minimalist architecture to create high-contrast spaces.`;
    handleEditorChange(sample);
  };

  // Helper color for score
  const getScoreColor = (sc: number) => {
    if (sc >= 85) return 'var(--accent-primary)';
    if (sc >= 70) return '#38BDF8';
    if (sc >= 50) return '#F59E0B';
    return 'var(--status-critical)';
  };

  return (
    <div className="tab-pane active" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner / Focus Keyword Selector */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(17, 24, 39, 0.95) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        padding: '1.5rem',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-primary)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                Phase 19 • Authority & Content
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                NLP Readability & Semantic Content Optimization
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
              <FileText size={26} color="var(--accent-primary)" />
              Content Analysis & Optimization
              <span style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                Focus: "{focusKeyword}"
              </span>
            </h1>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') loadAnalysis(focusKeyword);
                }}
                placeholder="Set focus keyword..."
                className="input-field"
                style={{ fontSize: '0.85rem', paddingRight: '4.5rem', width: '220px' }}
              />
              <button
                onClick={() => loadAnalysis(focusKeyword)}
                disabled={isLoading}
                className="btn btn-secondary"
                style={{
                  position: 'absolute',
                  right: '3px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem'
                }}
              >
                Apply
              </button>
            </div>

            <button
              onClick={() => setActiveTab('editor')}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
              <Edit3 size={15} />
              Live Editor
            </button>
          </div>
        </div>

        {/* KPI Summary Strip */}
        {report && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            {/* Overall Content Score */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Content Health Score
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor(report.overallScore) }}>
                  {report.overallScore}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Grade: <strong style={{ color: 'var(--text-primary)' }}>{report.scannability.scannabilityGrade} Scannability</strong>
              </div>
            </div>

            {/* Word Count & Depth */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Word Count Depth
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                {report.wordCount.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Target: {report.recommendedWordCount.min}–{report.recommendedWordCount.max} words
              </div>
            </div>

            {/* Flesch Reading Ease */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Flesch Reading Ease
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38BDF8', marginTop: '0.35rem' }}>
                {report.readability.fleschReadingEase}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {report.readability.readingLevel}
              </div>
            </div>

            {/* Reading Time */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Est. Reading Time
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  {report.readability.estimatedReadingTimeMinutes}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>min read</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {report.sentenceCount} sentences • {report.readability.averageSentenceLength} wps
              </div>
            </div>

            {/* NLP Entities Coverage */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Semantic TF-IDF Coverage
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#A855F7', marginTop: '0.35rem' }}>
                {report.tfIdfTerms.filter(t => t.status === 'optimal').length} / {report.tfIdfTerms.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {report.tfIdfTerms.filter(t => t.status === 'missing').length} missing entities
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'scorecard', label: 'Scorecard & Action Plan', icon: <Award size={15} /> },
          { id: 'readability', label: 'Readability (6 Indexes)', icon: <BookOpen size={15} /> },
          { id: 'nlp', label: `Semantic NLP & TF-IDF (${report?.tfIdfTerms.length ?? 0})`, icon: <Sparkles size={15} />, badge: 'Entities' },
          { id: 'structure', label: 'Structure & Scannability', icon: <Layers size={15} /> },
          { id: 'editor', label: 'Live Content Optimizer', icon: <Edit3 size={15} />, badge: 'Realtime' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ContentTab)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px'
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span style={{
                fontSize: '0.65rem',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                background: activeTab === tab.id ? 'rgba(0,0,0,0.25)' : 'rgba(16, 185, 129, 0.2)',
                color: activeTab === tab.id ? '#fff' : 'var(--accent-primary)',
                fontWeight: 600
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--status-critical)',
          borderRadius: '8px',
          padding: '1rem',
          color: 'var(--status-critical)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: SCORECARD & ACTION PLAN */}
      {activeTab === 'scorecard' && report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Prioritized Action Checklist */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={18} color="var(--accent-primary)" />
                  Prioritized Content Optimization Action Plan
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Complete these items to lift the Content Score from <strong>{report.overallScore}</strong> towards <strong>95+</strong>.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {report.actions.map(act => (
                <div
                  key={act.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    background: act.severity === 'critical'
                      ? 'rgba(239, 68, 68, 0.08)'
                      : act.severity === 'warning'
                      ? 'rgba(245, 158, 11, 0.08)'
                      : act.severity === 'opportunity'
                      ? 'rgba(6, 182, 212, 0.08)'
                      : 'rgba(16, 185, 129, 0.08)',
                    border: `1px solid ${
                      act.severity === 'critical'
                        ? 'rgba(239, 68, 68, 0.25)'
                        : act.severity === 'warning'
                        ? 'rgba(245, 158, 11, 0.25)'
                        : act.severity === 'opportunity'
                        ? 'rgba(6, 182, 212, 0.25)'
                        : 'rgba(16, 185, 129, 0.25)'
                    }`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ marginTop: '2px' }}>
                      {act.severity === 'critical' && <AlertCircle size={18} color="var(--status-critical)" />}
                      {act.severity === 'warning' && <AlertTriangle size={18} color="var(--status-warning)" />}
                      {act.severity === 'opportunity' && <Sparkles size={18} color="var(--accent-cyan)" />}
                      {act.severity === 'passed' && <CheckCircle2 size={18} color="var(--accent-primary)" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {act.description}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                        Recommendation: {act.recommendation}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '90px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: act.severity === 'passed' ? 'var(--accent-primary)' : 'var(--status-warning)'
                    }}>
                      +{act.impactScore} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: READABILITY (6 FORMULAS) */}
      {activeTab === 'readability' && report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="var(--accent-primary)" />
              6 Comprehensive Readability Indices
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Search engines reward content that strikes the ideal balance between authoritative technical vocabulary and effortless consumer comprehension.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {/* Flesch Reading Ease */}
              <div style={{ background: 'rgba(17, 24, 39, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Flesch Reading Ease</span>
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-primary)' }}>0–100 Scale</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', margin: '0.5rem 0' }}>
                  {report.readability.fleschReadingEase}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Level: <strong style={{ color: 'var(--text-primary)' }}>{report.readability.readingLevel}</strong>
                </div>
              </div>

              {/* Flesch-Kincaid Grade Level */}
              <div style={{ background: 'rgba(17, 24, 39, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Flesch-Kincaid Grade</span>
                  <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8' }}>US School Grade</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38BDF8', margin: '0.5rem 0' }}>
                  Grade {report.readability.fleschKincaidGrade}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Optimal SEO range: <strong style={{ color: 'var(--text-primary)' }}>7.0 – 9.0</strong>
                </div>
              </div>

              {/* Gunning Fog Index */}
              <div style={{ background: 'rgba(17, 24, 39, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Gunning Fog Index</span>
                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}>Complexity</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B', margin: '0.5rem 0' }}>
                  {report.readability.gunningFogIndex}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Complex Words: <strong style={{ color: 'var(--text-primary)' }}>{report.readability.complexWordsPercentage}%</strong>
                </div>
              </div>

              {/* SMOG Index */}
              <div style={{ background: 'rgba(17, 24, 39, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SMOG Index</span>
                  <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#A855F7' }}>Accuracy</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#A855F7', margin: '0.5rem 0' }}>
                  {report.readability.smogIndex}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Years of formal education required for 100% comprehension.
                </div>
              </div>

              {/* Coleman-Liau Index */}
              <div style={{ background: 'rgba(17, 24, 39, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Coleman-Liau Index</span>
                  <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#06B6D4' }}>Character-Based</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#06B6D4', margin: '0.5rem 0' }}>
                  {report.readability.colemanLiauIndex}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Evaluates letter count per 100 words vs sentence length.
                </div>
              </div>

              {/* Automated Readability Index (ARI) */}
              <div style={{ background: 'rgba(17, 24, 39, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Automated Readability (ARI)</span>
                  <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--status-critical)' }}>Real-Time</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F43F5E', margin: '0.5rem 0' }}>
                  {report.readability.automatedReadabilityIndex}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Corresponds to reader age: ~{Math.round(report.readability.automatedReadabilityIndex + 5)} years old
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NLP ENTITIES & TF-IDF */}
      {activeTab === 'nlp' && report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filter Terms:</span>
              {(['all', 'missing', 'optimal', 'overused'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTermFilter(f)}
                  className="btn"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    background: termFilter === f ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
                    color: termFilter === f ? '#000' : 'var(--text-secondary)',
                    fontWeight: termFilter === f ? 700 : 400
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {onNavigateToKeywords && (
              <button
                onClick={onNavigateToKeywords}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Target size={13} />
                Keyword Tracker
              </button>
            )}
          </div>

          {/* TF-IDF Terms Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0, 0, 0, 0.4)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Semantic Term</th>
                  <th style={{ padding: '0.75rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>TF-IDF Weight</th>
                  <th style={{ padding: '0.75rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>Frequency</th>
                  <th style={{ padding: '0.75rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>Recommended</th>
                  <th style={{ padding: '0.75rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Action Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {report.tfIdfTerms
                  .filter(t => termFilter === 'all' || t.status === termFilter)
                  .map(term => (
                    <tr key={term.term} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        "{term.term}"
                      </td>

                      <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                        <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                          {(term.tfIdfScore * 100).toFixed(0)}%
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>
                        {term.currentCount}
                      </td>

                      <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {term.recommendedMin} – {term.recommendedMax}
                      </td>

                      <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                        <span className="badge" style={{
                          fontSize: '0.68rem',
                          background: term.status === 'optimal'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : term.status === 'missing'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(245, 158, 11, 0.2)',
                          color: term.status === 'optimal'
                            ? 'var(--accent-primary)'
                            : term.status === 'missing'
                            ? 'var(--status-critical)'
                            : 'var(--status-warning)'
                        }}>
                          {term.status.toUpperCase()}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {term.suggestedAction}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Named Entities Catalog */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={16} color="var(--accent-cyan)" />
              Extracted Named Entities & Topical Salience
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {report.entities.map(ent => (
                <div
                  key={ent.name}
                  style={{
                    background: 'rgba(17, 24, 39, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {ent.type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                      Salience: {(ent.salience * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {ent.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    {ent.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STRUCTURE & SCANNABILITY */}
      {activeTab === 'structure' && report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Scannability Grade Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Type size={18} color="var(--accent-primary)" />
                  Content Scannability & Skimmability Audit
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Digital users skim before they read. Short paragraphs, bullet lists, and bold callouts keep bounce rates low.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scannability Grade:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  {report.scannability.scannabilityGrade}
                </span>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginTop: '1.25rem'
            }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Paragraph Length</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {report.scannability.avgParagraphWords} words
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Walls of Text (&gt; 100 words)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: report.scannability.wallOfTextCount > 0 ? 'var(--status-critical)' : 'var(--accent-primary)', marginTop: '0.2rem' }}>
                  {report.scannability.wallOfTextCount}
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bullet / Numbered Lists</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {report.scannability.bulletListsCount + report.scannability.numberedListsCount}
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Text-to-HTML Ratio</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38BDF8', marginTop: '0.2rem' }}>
                  {report.scannability.textToHtmlRatio}%
                </div>
              </div>
            </div>
          </div>

          {/* Heading Structure Tree */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <List size={16} color="var(--accent-cyan)" />
              Heading Outline & Keyword Placement
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {report.headings.map((h, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingLeft: `${Math.min(3, h.level - 1) * 1.5 + 0.85}rem`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.35rem',
                      borderRadius: '4px',
                      background: h.level === 1 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
                      color: h.level === 1 ? '#000' : 'var(--text-secondary)'
                    }}>
                      H{h.level}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: h.level <= 2 ? 600 : 400 }}>
                      {h.text}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {h.containsFocusKeyword && (
                      <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-primary)', fontSize: '0.65rem' }}>
                        Keyword Match
                      </span>
                    )}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {h.charCount} chars
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LIVE CONTENT OPTIMIZATION EDITOR */}
      {activeTab === 'editor' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1.4fr) minmax(320px, 1fr)', gap: '1.25rem' }}>
          {/* Left: Textarea Editor */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={16} color="var(--accent-primary)" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Interactive Copywriting Studio</h3>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleLoadSampleContent}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                >
                  Load Sample
                </button>
                <button
                  onClick={handleCopyEditorContent}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  {copiedText ? <Check size={12} color="var(--accent-primary)" /> : <Copy size={12} />}
                  {copiedText ? 'Copied' : 'Copy Text'}
                </button>
              </div>
            </div>

            <textarea
              value={editorText}
              onChange={(e) => handleEditorChange(e.target.value)}
              placeholder="Paste or write your SEO article here. The scorecard will calculate your readability, keyword density, and overall content score live in real-time..."
              className="input-field"
              style={{
                width: '100%',
                minHeight: '440px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                padding: '1rem',
                resize: 'vertical'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Words: <strong style={{ color: 'var(--text-primary)' }}>{(editorText.match(/[a-zA-Z0-9']+/g) || []).length}</strong></span>
              <span>Characters: <strong style={{ color: 'var(--text-primary)' }}>{editorText.length}</strong></span>
              <span>Sentences: <strong style={{ color: 'var(--text-primary)' }}>{(editorText.split(/[.!?]+/).filter(Boolean)).length}</strong></span>
            </div>
          </div>

          {/* Right: Live Updating Scorecard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Live Score Dial */}
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Live Content Score
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: getScoreColor(report?.overallScore || 0), margin: '0.5rem 0' }}>
                {report?.overallScore || 0}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Focus: <strong style={{ color: 'var(--accent-cyan)' }}>"{focusKeyword}"</strong>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', margin: '1rem 0 0.5rem 0', overflow: 'hidden' }}>
                <div style={{ width: `${report?.overallScore || 0}%`, height: '100%', background: getScoreColor(report?.overallScore || 0), transition: 'width 0.3s ease' }} />
              </div>
            </div>

            {/* Live Recommendations Checklist */}
            <div className="card" style={{ padding: '1.25rem', flex: 1 }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 600 }}>
                Live Recommendations
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto' }}>
                {report?.actions.map(act => (
                  <div
                    key={act.id}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: '6px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                      fontSize: '0.75rem'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                      {act.title}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      {act.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
