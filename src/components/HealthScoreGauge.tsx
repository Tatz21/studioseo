import React from 'react';
import { CategoryScores, SeoIssue } from '../engine/types';
import { 
  ShieldCheck, 
  FileText, 
  Share2, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface HealthScoreGaugeProps {
  scores: CategoryScores;
  issues: SeoIssue[];
  wordCount: number;
  readingEase: number;
  readingLevel: string;
  pageSizeKb: number;
  loadTimeMs: number;
}

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({
  scores,
  issues,
  wordCount,
  readingEase,
  readingLevel,
  pageSizeKb,
  loadTimeMs
}) => {
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const passedCount = issues.filter(i => i.severity === 'passed').length;

  // Gauge calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scores.overall / 100) * circumference;

  // Score Color Interpolation
  let scoreColor = 'var(--status-critical)';
  let scoreGlow = 'rgba(239, 68, 68, 0.4)';
  if (scores.overall >= 85) {
    scoreColor = 'var(--status-success)';
    scoreGlow = 'rgba(16, 185, 129, 0.4)';
  } else if (scores.overall >= 70) {
    scoreColor = 'var(--status-warning)';
    scoreGlow = 'rgba(245, 158, 11, 0.4)';
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
      {/* Main Overall Health Card */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: scoreGlow,
          filter: 'blur(35px)',
          pointerEvents: 'none'
        }} />

        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Overall SEO Health Score
        </span>

        {/* Circular Progress Gauge */}
        <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background Track */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              stroke="var(--bg-surface-elevated)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Value Track */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              stroke={scoreColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease'
              }}
            />
          </svg>

          {/* Central Score Text */}
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{
              fontSize: '2rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
              lineHeight: 1
            }}>
              {scores.overall}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>/ 100</span>
          </div>
        </div>

        {/* Grade Badge */}
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge" style={{
            background: scoreColor === 'var(--status-success)' ? 'var(--status-success-bg)' : scoreColor === 'var(--status-warning)' ? 'var(--status-warning-bg)' : 'var(--status-critical-bg)',
            color: scoreColor,
            border: `1px solid ${scoreColor}`,
            fontSize: '0.85rem',
            padding: '0.3rem 0.85rem'
          }}>
            Grade: {scores.grade}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {scores.overall >= 85 ? 'Excellent Health' : scores.overall >= 70 ? 'Good / Needs Polish' : 'Critical Issues Detected'}
          </span>
        </div>
      </div>

      {/* 4 Category Subscore Cards & Fast Telemetry */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Category Gauges Grid */}
        <div className="grid-4" style={{ gap: '1rem' }}>
          {/* Technical SEO */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)' }}>
                <ShieldCheck size={18} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Technical</span>
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {scores.technical}%
              </span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${scores.technical}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 0.6s ease' }} />
            </div>
          </div>

          {/* On-Page Content */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)' }}>
                <FileText size={18} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Content</span>
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {scores.content}%
              </span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${scores.content}%`, height: '100%', background: 'var(--accent-cyan)', transition: 'width 0.6s ease' }} />
            </div>
          </div>

          {/* Social & Meta */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-purple)' }}>
                <Share2 size={18} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Social/OG</span>
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {scores.social}%
              </span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${scores.social}%`, height: '100%', background: 'var(--accent-purple)', transition: 'width 0.6s ease' }} />
            </div>
          </div>

          {/* Performance / Mobile */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--status-warning)' }}>
                <Zap size={18} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Speed</span>
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {scores.performance}%
              </span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${scores.performance}%`, height: '100%', background: 'var(--status-warning)', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        </div>

        {/* Quick Diagnostic Metrics Bar */}
        <div className="glass-panel" style={{
          padding: '0.9rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Issue summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--status-critical)' }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{criticalCount} Critical</span>
            </div>
            <span style={{ color: 'var(--border-medium)' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--status-warning)' }}>
              <AlertTriangle size={16} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{warningCount} Warnings</span>
            </div>
            <span style={{ color: 'var(--border-medium)' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--status-success)' }}>
              <CheckCircle2 size={16} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{passedCount} Passed</span>
            </div>
          </div>

          {/* Telemetry info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Words:</span>{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{wordCount}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Readability:</span>{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{readingEase} ({readingLevel})</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>DOM Size:</span>{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{pageSizeKb} KB</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Response:</span>{' '}
              <strong style={{ color: 'var(--accent-primary)' }}>{loadTimeMs}ms</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
