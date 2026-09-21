import React, { useState } from 'react';
import { SeoIssue, IssueSeverity } from '../engine/types';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Wrench
} from 'lucide-react';

interface IssueTrackerProps {
  issues: SeoIssue[];
}

export const IssueTracker: React.FC<IssueTrackerProps> = ({ issues }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | IssueSeverity>('all');
  const [expandedIssues, setExpandedIssues] = useState<Record<string, boolean>>({});
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIssues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopySnippet = (id: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const filteredIssues = issues.filter(issue => {
    if (activeFilter === 'all') return true;
    return issue.severity === activeFilter;
  });

  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const passedCount = issues.filter(i => i.severity === 'passed').length;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Header & Severity Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>SEO Issues & Remediation Action Center</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Prioritized checklist of detected blockers, performance warnings, and passed validations.
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveFilter('all')}
            className={`btn ${activeFilter === 'all' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            All ({issues.length})
          </button>
          <button
            onClick={() => setActiveFilter('critical')}
            className={`btn ${activeFilter === 'critical' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', color: 'var(--status-critical)' }}
          >
            <AlertCircle size={13} />
            Critical ({criticalCount})
          </button>
          <button
            onClick={() => setActiveFilter('warning')}
            className={`btn ${activeFilter === 'warning' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', color: 'var(--status-warning)' }}
          >
            <AlertTriangle size={13} />
            Warnings ({warningCount})
          </button>
          <button
            onClick={() => setActiveFilter('passed')}
            className={`btn ${activeFilter === 'passed' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', color: 'var(--status-success)' }}
          >
            <CheckCircle2 size={13} />
            Passed ({passedCount})
          </button>
        </div>
      </div>

      {/* Issues List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredIssues.map((issue) => {
          const isExpanded = !!expandedIssues[issue.id];
          
          let severityBadge = <span className="badge badge-success"><CheckCircle2 size={12} /> Passed</span>;
          let severityBorder = 'var(--status-success)';
          if (issue.severity === 'critical') {
            severityBadge = <span className="badge badge-critical"><AlertCircle size={12} /> Critical</span>;
            severityBorder = 'var(--status-critical)';
          } else if (issue.severity === 'warning') {
            severityBadge = <span className="badge badge-warning"><AlertTriangle size={12} /> Warning</span>;
            severityBorder = 'var(--status-warning)';
          } else if (issue.severity === 'info') {
            severityBadge = <span className="badge badge-info"><Info size={12} /> Info</span>;
            severityBorder = 'var(--status-info)';
          }

          return (
            <div
              key={issue.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderLeft: `4px solid ${severityBorder}`,
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'all var(--transition-fast)'
              }}
            >
              {/* Collapsed Header Bar */}
              <div
                onClick={() => toggleExpand(issue.id)}
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                  {severityBadge}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {issue.title}
                    </span>
                    <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                      {issue.description}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                    {issue.category}
                  </span>
                  {isExpanded ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                </div>
              </div>

              {/* Expanded Details Pane */}
              {isExpanded && (
                <div style={{
                  padding: '1rem 1.25rem 1.25rem',
                  borderTop: '1px solid var(--border-subtle)',
                  background: 'rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}>
                  {/* Values row */}
                  {(issue.value !== undefined || issue.expected !== undefined) && (
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.8125rem' }}>
                      {issue.value !== undefined && (
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Current Detected Value: </span>
                          <strong style={{ color: 'var(--text-primary)' }}>{String(issue.value)}</strong>
                        </div>
                      )}
                      {issue.expected !== undefined && (
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Recommended Target: </span>
                          <strong style={{ color: 'var(--accent-primary)' }}>{String(issue.expected)}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Impact */}
                  <div style={{ fontSize: '0.8125rem' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Impact on Search Ranking: </strong>
                    <span style={{ color: 'var(--text-primary)' }}>{issue.impact}</span>
                  </div>

                  {/* Recommendation */}
                  <div style={{
                    background: 'var(--bg-surface-elevated)',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.8125rem', fontWeight: 600 }}>
                      <Wrench size={15} />
                      <span>How to Fix</span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                      {issue.recommendation}
                    </p>

                    {/* Code Snippet */}
                    {issue.snippet && (
                      <div style={{ position: 'relative', marginTop: '0.35rem' }}>
                        <pre style={{
                          background: 'var(--bg-canvas)',
                          padding: '0.75rem 1rem',
                          borderRadius: '6px',
                          fontSize: '0.775rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--accent-cyan)',
                          overflowX: 'auto',
                          border: '1px solid var(--border-subtle)'
                        }}>
                          {issue.snippet}
                        </pre>
                        <button
                          onClick={() => handleCopySnippet(issue.id, issue.snippet!)}
                          className="btn btn-secondary"
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            fontSize: '0.7rem',
                            padding: '0.25rem 0.5rem'
                          }}
                          title="Copy snippet"
                        >
                          {copiedSnippetId === issue.id ? <Check size={12} color="var(--accent-primary)" /> : <Copy size={12} />}
                          <span>{copiedSnippetId === issue.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredIssues.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={36} color="var(--accent-primary)" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontWeight: 600 }}>No issues found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
