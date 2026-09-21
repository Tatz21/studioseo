import React, { useState } from 'react';
import { KeywordMetric } from '../engine/types';
import { 
  FileSpreadsheet, 
  Search, 
  Check, 
  X, 
  AlertTriangle 
} from 'lucide-react';

interface KeywordDensityTableProps {
  unigrams: KeywordMetric[];
  bigrams: KeywordMetric[];
  trigrams: KeywordMetric[];
}

export const KeywordDensityTable: React.FC<KeywordDensityTableProps> = ({
  unigrams,
  bigrams,
  trigrams
}) => {
  const [activeGram, setActiveGram] = useState<'1' | '2' | '3'>('1');
  const [searchTerm, setSearchTerm] = useState('');

  const currentList = activeGram === '1' ? unigrams : activeGram === '2' ? bigrams : trigrams;

  const filteredList = currentList.filter(item => 
    item.term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Header & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSpreadsheet size={20} color="var(--accent-cyan)" />
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Keyword Density & Semantic Distribution</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Evaluate term frequency, density percentages, and presence in key SEO tags.
            </p>
          </div>
        </div>

        {/* N-gram Selector & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* N-Gram Switcher */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setActiveGram('1')}
              className={`btn ${activeGram === '1' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              1-Word
            </button>
            <button
              onClick={() => setActiveGram('2')}
              className={`btn ${activeGram === '2' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              2-Words
            </button>
            <button
              onClick={() => setActiveGram('3')}
              className={`btn ${activeGram === '3' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              3-Words
            </button>
          </div>

          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '0.25rem 0.6rem'
          }}>
            <Search size={14} color="var(--text-muted)" style={{ marginRight: '0.35rem' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search keyword..."
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                outline: 'none',
                width: '130px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.85rem',
          textAlign: 'left'
        }}>
          <thead>
            <tr style={{
              borderBottom: '1px solid var(--border-medium)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <th style={{ padding: '0.75rem 1rem' }}>Keyword / Term</th>
              <th style={{ padding: '0.75rem 1rem' }}>Occurrences</th>
              <th style={{ padding: '0.75rem 1rem' }}>Density %</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>In Title</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>In H1</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>In H2</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>In Meta Desc</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                  transition: 'background var(--transition-fast)'
                }}
              >
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {item.term}
                </td>
                <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)' }}>
                  {item.count}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      color: item.isWarning ? 'var(--status-warning)' : 'var(--accent-primary)',
                      fontWeight: 600
                    }}>
                      {item.density}%
                    </span>
                    {item.isWarning && (
                      <span title="High keyword density (> 3.5%). Risk of keyword stuffing." style={{ color: 'var(--status-warning)' }}>
                        <AlertTriangle size={14} />
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                  {item.inTitle ? <Check size={16} color="var(--status-success)" style={{ margin: '0 auto' }} /> : <X size={14} color="var(--text-muted)" style={{ margin: '0 auto' }} />}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                  {item.inH1 ? <Check size={16} color="var(--status-success)" style={{ margin: '0 auto' }} /> : <X size={14} color="var(--text-muted)" style={{ margin: '0 auto' }} />}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                  {item.inH2 ? <Check size={16} color="var(--status-success)" style={{ margin: '0 auto' }} /> : <X size={14} color="var(--text-muted)" style={{ margin: '0 auto' }} />}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                  {item.inMetaDesc ? <Check size={16} color="var(--status-success)" style={{ margin: '0 auto' }} /> : <X size={14} color="var(--text-muted)" style={{ margin: '0 auto' }} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredList.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No keywords found matching query.
          </div>
        )}
      </div>
    </div>
  );
};
