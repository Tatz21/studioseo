import React, { useState } from 'react';
import { MetaData } from '../engine/types';
import { 
  Globe, 
  Smartphone, 
  Monitor, 
  Share2, 
  Sliders, 
  ExternalLink 
} from 'lucide-react';

interface SerpSocialPreviewProps {
  metadata: MetaData;
  targetUrl: string;
}

export const SerpSocialPreview: React.FC<SerpSocialPreviewProps> = ({ metadata, targetUrl }) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // Editable sandbox fields
  const [editTitle, setEditTitle] = useState(metadata.title || 'Page Title Not Specified');
  const [editDesc, setEditDesc] = useState(metadata.description || 'Meta description not found. Search engines will extract a snippet automatically.');
  const [editUrl, setEditUrl] = useState(metadata.canonicalUrl || targetUrl || 'https://yourwebsite.com');

  // Sync if metadata changes from new scan
  React.useEffect(() => {
    setEditTitle(metadata.title || 'Page Title Not Specified');
    setEditDesc(metadata.description || 'Meta description not found. Search engines will extract a snippet automatically.');
    setEditUrl(metadata.canonicalUrl || targetUrl || 'https://yourwebsite.com');
  }, [metadata, targetUrl]);

  // Truncate rules
  const displayTitle = editTitle.length > 60 ? `${editTitle.slice(0, 58)}...` : editTitle;
  const displayDesc = editDesc.length > 158 ? `${editDesc.slice(0, 155)}...` : editDesc;

  let cleanHostname = 'yourwebsite.com';
  try {
    cleanHostname = new URL(editUrl.startsWith('http') ? editUrl : `https://${editUrl}`).hostname;
  } catch {
    cleanHostname = editUrl;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Live Editor Sandbox */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <Sliders size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.1rem' }}>SERP & Social Sandbox</h3>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8125rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>SEO Title Tag</label>
            <span style={{ 
              color: editTitle.length > 60 ? 'var(--status-critical)' : editTitle.length >= 45 ? 'var(--status-success)' : 'var(--status-warning)',
              fontFamily: 'var(--font-mono)'
            }}>
              {editTitle.length} / 60 chars
            </span>
          </div>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="input-text"
            placeholder="Enter optimized title tag"
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8125rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Meta Description</label>
            <span style={{ 
              color: editDesc.length > 160 ? 'var(--status-critical)' : editDesc.length >= 120 ? 'var(--status-success)' : 'var(--status-warning)',
              fontFamily: 'var(--font-mono)'
            }}>
              {editDesc.length} / 160 chars
            </span>
          </div>
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            className="textarea"
            rows={4}
            placeholder="Enter optimized meta description"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Canonical / Target URL
          </label>
          <input
            type="text"
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            className="input-text font-mono"
            style={{ fontSize: '0.8125rem' }}
            placeholder="https://example.com/target-page"
          />
        </div>
      </div>

      {/* Visual Live Previews */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Google SERP Snippet */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem' }}>Google Search Result Preview</h3>
            </div>

            {/* Desktop / Mobile Switcher */}
            <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`btn ${deviceMode === 'desktop' ? 'btn-secondary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                <Monitor size={14} />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`btn ${deviceMode === 'mobile' ? 'btn-secondary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                <Smartphone size={14} />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          {/* Google Search Result Card (Realistic Google Dark/Light Simulation) */}
          <div style={{
            background: '#202124',
            border: '1px solid #303134',
            borderRadius: deviceMode === 'mobile' ? '12px' : '8px',
            maxWidth: deviceMode === 'mobile' ? '380px' : '650px',
            margin: '0 auto',
            padding: '1.25rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            transition: 'max-width 0.3s ease'
          }}>
            {/* SERP URL & Favicon Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: '#303134',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Globe size={14} color="#8AB4F8" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.8125rem', color: '#BDC1C6', fontWeight: 400 }}>
                  {cleanHostname}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#9AA0A6', fontFamily: 'var(--font-mono)' }}>
                  {editUrl}
                </span>
              </div>
            </div>

            {/* Title */}
            <h4 style={{
              color: '#8AB4F8',
              fontSize: deviceMode === 'mobile' ? '1.1rem' : '1.25rem',
              fontWeight: 400,
              fontFamily: 'arial, sans-serif',
              lineHeight: 1.3,
              marginBottom: '0.4rem',
              cursor: 'pointer',
              textDecoration: 'none'
            }}>
              {displayTitle}
            </h4>

            {/* Description */}
            <p style={{
              color: '#BDC1C6',
              fontSize: '0.875rem',
              fontFamily: 'arial, sans-serif',
              lineHeight: 1.5,
              wordBreak: 'break-word'
            }}>
              {displayDesc}
            </p>
          </div>
        </div>

        {/* Social Card Previews: Facebook / LinkedIn & Twitter */}
        <div className="grid-2">
          {/* OpenGraph / Facebook Card */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem', color: '#1877F2' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Open Graph / Facebook Card</span>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {/* Image banner */}
              <div style={{
                height: '140px',
                background: metadata.ogImage 
                  ? `url(${metadata.ogImage}) center/cover no-repeat` 
                  : 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)'
              }}>
                {!metadata.ogImage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                    <Share2 size={16} />
                    <span>No og:image detected</span>
                  </div>
                )}
              </div>

              <div style={{ padding: '0.85rem' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {cleanHostname}
                </span>
                <h5 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0.25rem 0', fontWeight: 600 }}>
                  {metadata.ogTitle || editTitle}
                </h5>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {metadata.ogDescription || editDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Twitter / X Card */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Twitter / X Summary Card</span>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '140px',
                background: metadata.twitterImage || metadata.ogImage
                  ? `url(${metadata.twitterImage || metadata.ogImage}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)'
              }}>
                {!metadata.twitterImage && !metadata.ogImage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                    <Share2 size={16} />
                    <span>No twitter:image detected</span>
                  </div>
                )}
              </div>

              <div style={{ padding: '0.85rem' }}>
                <h5 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem', fontWeight: 600 }}>
                  {metadata.twitterTitle || editTitle}
                </h5>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.4rem' }}>
                  {metadata.twitterDescription || editDesc}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <ExternalLink size={12} />
                  <span>{cleanHostname}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
