import React from 'react';
import { HeadingItem } from '../engine/types';
import { ListTree, AlertTriangle } from 'lucide-react';

interface HeadingHierarchyTreeProps {
  headings: HeadingItem[];
}

export const HeadingHierarchyTree: React.FC<HeadingHierarchyTreeProps> = ({ headings }) => {
  const h1Count = headings.filter(h => h.level === 1).length;
  const h2Count = headings.filter(h => h.level === 2).length;
  const h3Count = headings.filter(h => h.level === 3).length;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ListTree size={20} color="var(--accent-primary)" />
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Heading Hierarchy & Outline (H1 - H6)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Inspect topical flow and detect improper nesting or missing levels.
            </p>
          </div>
        </div>

        {/* Heading Count Badges */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-cyan">H1: {h1Count}</span>
          <span className="badge badge-info">H2: {h2Count}</span>
          <span className="badge badge-warning">H3+: {h3Count}</span>
        </div>
      </div>

      {/* Headings Tree List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxHeight: '420px',
        overflowY: 'auto',
        paddingRight: '0.5rem'
      }}>
        {headings.map((heading, index) => {
          const indent = (heading.level - 1) * 24;
          const isH1 = heading.level === 1;
          const isH2 = heading.level === 2;

          let badgeClass = 'badge-warning';
          if (isH1) badgeClass = 'badge-success';
          else if (isH2) badgeClass = 'badge-cyan';

          return (
            <div
              key={index}
              style={{
                marginLeft: `${indent}px`,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '0.6rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'border-color var(--transition-fast)'
              }}
            >
              <span className={`badge ${badgeClass}`} style={{ fontSize: '0.7rem', minWidth: '38px', justifyContent: 'center' }}>
                H{heading.level}
              </span>
              <span style={{
                fontSize: isH1 ? '0.95rem' : isH2 ? '0.875rem' : '0.8125rem',
                fontWeight: isH1 ? 700 : isH2 ? 600 : 400,
                color: isH1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {heading.text}
              </span>
            </div>
          );
        })}

        {headings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <AlertTriangle size={32} color="var(--status-critical)" style={{ margin: '0 auto 0.5rem' }} />
            <p>No headings (&lt;h1&gt; - &lt;h6&gt;) found on this page.</p>
          </div>
        )}
      </div>
    </div>
  );
};
