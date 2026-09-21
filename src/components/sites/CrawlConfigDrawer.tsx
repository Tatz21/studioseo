import React, { useState } from 'react';
import { Website, CrawlConfig } from '../../sites/types';
import { X, Sliders, Check, ShieldCheck } from 'lucide-react';

interface CrawlConfigDrawerProps {
  website: Website | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveConfig: (websiteId: string, updatedConfig: CrawlConfig) => void;
}

export const CrawlConfigDrawer: React.FC<CrawlConfigDrawerProps> = ({
  website,
  isOpen,
  onClose,
  onSaveConfig
}) => {
  if (!isOpen || !website) return null;

  const [config, setConfig] = useState<CrawlConfig>({ ...website.crawlConfig });
  const [excludeInput, setExcludeInput] = useState(website.crawlConfig.excludePatterns.join(', '));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const patterns = excludeInput.split(',').map(p => p.trim()).filter(Boolean);
    const updated = {
      ...config,
      excludePatterns: patterns
    };
    onSaveConfig(website.id, updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      zIndex: 100
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        height: '100%',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-medium)',
        padding: '2rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sliders size={20} color="var(--accent-primary)" />
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>Crawl Configuration</h3>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                  {website.domain}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.35rem' }}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Depth & Pages */}
            <div className="grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Crawl Depth Limit
                </label>
                <select
                  value={config.crawlDepthLimit}
                  onChange={e => setConfig({ ...config, crawlDepthLimit: parseInt(e.target.value, 10) })}
                  className="input-text"
                >
                  <option value={1}>1 Level (Root only)</option>
                  <option value={2}>2 Levels</option>
                  <option value={3}>3 Levels (Standard)</option>
                  <option value={4}>4 Levels (Deep)</option>
                  <option value={5}>5 Levels (Full Spider)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Max Pages Ceiling
                </label>
                <input
                  type="number"
                  value={config.maxPagesLimit}
                  onChange={e => setConfig({ ...config, maxPagesLimit: parseInt(e.target.value, 10) || 50 })}
                  min={10}
                  max={5000}
                  className="input-text font-mono"
                />
              </div>
            </div>

            {/* Rate Limit & User-Agent */}
            <div className="grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Spider User-Agent
                </label>
                <select
                  value={config.userAgent}
                  onChange={e => setConfig({ ...config, userAgent: e.target.value as any })}
                  className="input-text"
                >
                  <option value="Googlebot">Googlebot (Google Simulator)</option>
                  <option value="SEOStudioBot">SEOStudioBot (Native)</option>
                  <option value="CustomBot">Custom Internal Crawler</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Rate Limit (req/sec)
                </label>
                <input
                  type="number"
                  value={config.rateLimitPerSecond}
                  onChange={e => setConfig({ ...config, rateLimitPerSecond: parseInt(e.target.value, 10) || 1 })}
                  min={1}
                  max={10}
                  className="input-text font-mono"
                />
              </div>
            </div>

            {/* Exclude Patterns */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Exclude Path Patterns (comma separated)
              </label>
              <input
                type="text"
                value={excludeInput}
                onChange={e => setExcludeInput(e.target.value)}
                placeholder="/admin/*, /cart/*, *.pdf"
                className="input-text font-mono"
                style={{ fontSize: '0.8rem' }}
              />
            </div>

            {/* Checkbox Toggles */}
            <div style={{
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.respectRobotsTxt}
                  onChange={e => setConfig({ ...config, respectRobotsTxt: e.target.checked })}
                />
                <span>Respect robots.txt Disallow Directives</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.checkImages}
                  onChange={e => setConfig({ ...config, checkImages: e.target.checked })}
                />
                <span>Audit Media Assets & Image Alt Attributes</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.checkStructuredData}
                  onChange={e => setConfig({ ...config, checkStructuredData: e.target.checked })}
                />
                <span>Validate Schema.org JSON-LD Structured Data</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {savedSuccess ? <Check size={16} /> : <ShieldCheck size={16} />}
                <span>{savedSuccess ? 'Saved!' : 'Update Crawl Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
