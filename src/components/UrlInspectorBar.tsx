import React, { useState } from 'react';
import { Search, Globe, Sparkles, Loader2, PlayCircle } from 'lucide-react';
import { PRESET_SITES } from '../engine/presets';

interface UrlInspectorBarProps {
  currentUrl: string;
  isLoading: boolean;
  onScanUrl: (url: string) => void;
  onSelectPreset: (presetId: string) => void;
}

export const UrlInspectorBar: React.FC<UrlInspectorBarProps> = ({
  currentUrl,
  isLoading,
  onScanUrl,
  onSelectPreset
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim() && !isLoading) {
      onScanUrl(inputUrl.trim());
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* URL Input Box */}
        <div style={{
          flex: 1,
          minWidth: '280px',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '0.25rem 0.75rem',
          transition: 'border-color var(--transition-fast)'
        }}>
          <Globe size={18} color="var(--accent-primary)" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter full website URL (e.g. https://timelinerskolkata.com)"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.9375rem',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              padding: '0.5rem 0'
            }}
          />
        </div>

        {/* Scan CTA Button */}
        <button
          type="submit"
          disabled={isLoading || !inputUrl.trim()}
          className="btn btn-primary"
          style={{ minWidth: '140px' }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search size={18} />
              <span>Audit URL</span>
            </>
          )}
        </button>
      </form>

      {/* Preset Benchmarks & Quick Demos */}
      <div style={{
        marginTop: '1rem',
        paddingTop: '0.85rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={15} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Instant Benchmark Demos:
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {PRESET_SITES.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setInputUrl(preset.url);
                onSelectPreset(preset.id);
              }}
              className="btn btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px'
              }}
            >
              <PlayCircle size={13} color="var(--accent-primary)" />
              <span>{preset.name.split('(')[0].trim()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
