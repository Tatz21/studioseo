import React, { useState } from 'react';
import { X, Code2, Play } from 'lucide-react';

interface HtmlPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuditHtml: (html: string, simulatedUrl: string) => void;
}

export const HtmlPasteModal: React.FC<HtmlPasteModalProps> = ({
  isOpen,
  onClose,
  onAuditHtml
}) => {
  const [htmlInput, setHtmlInput] = useState('');
  const [simulatedUrl, setSimulatedUrl] = useState('https://localhost:3000');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (htmlInput.trim()) {
      onAuditHtml(htmlInput.trim(), simulatedUrl.trim() || 'https://localhost:3000');
      onClose();
    }
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
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '720px',
        width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: '12px',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.25rem' }}>Direct HTML Inspector & Code Auditor</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.35rem' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Paste raw HTML source code directly from any local file, dev server, or private intranet to perform an immediate full SEO audit.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Simulated Base URL
            </label>
            <input
              type="text"
              value={simulatedUrl}
              onChange={e => setSimulatedUrl(e.target.value)}
              placeholder="https://mysite.com"
              className="input-text font-mono"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Raw HTML Source Code
            </label>
            <textarea
              value={htmlInput}
              onChange={e => setHtmlInput(e.target.value)}
              placeholder="<!DOCTYPE html><html><head><title>My Page</title>...</head><body>...</body></html>"
              rows={10}
              className="textarea font-mono"
              style={{ fontSize: '0.775rem' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={!htmlInput.trim()} className="btn btn-primary">
              <Play size={16} />
              <span>Run Audit on HTML</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
