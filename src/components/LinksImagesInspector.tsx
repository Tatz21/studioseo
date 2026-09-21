import React, { useState } from 'react';
import { ImageItem, LinkItem } from '../engine/types';
import { 
  Layers, 
  Image as ImageIcon, 
  Link2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Search
} from 'lucide-react';

interface LinksImagesInspectorProps {
  links: LinkItem[];
  images: ImageItem[];
}

export const LinksImagesInspector: React.FC<LinksImagesInspectorProps> = ({ links, images }) => {
  const [activeSubTab, setActiveSubTab] = useState<'links' | 'images'>('links');
  const [linkFilter, setLinkFilter] = useState<'all' | 'internal' | 'external' | 'nofollow'>('all');
  const [imageFilter, setImageFilter] = useState<'all' | 'missing-alt' | 'has-alt'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter links
  const filteredLinks = links.filter(l => {
    if (linkFilter === 'internal' && !l.isInternal) return false;
    if (linkFilter === 'external' && l.isInternal) return false;
    if (linkFilter === 'nofollow' && !l.isNofollow) return false;
    if (searchQuery) {
      return l.url.toLowerCase().includes(searchQuery.toLowerCase()) || 
             l.anchorText.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Filter images
  const filteredImages = images.filter(img => {
    if (imageFilter === 'missing-alt' && !img.isMissingAlt) return false;
    if (imageFilter === 'has-alt' && img.isMissingAlt) return false;
    if (searchQuery) {
      return img.src.toLowerCase().includes(searchQuery.toLowerCase()) || 
             img.alt.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const missingAltCount = images.filter(i => i.isMissingAlt).length;
  const internalCount = links.filter(l => l.isInternal).length;
  const externalCount = links.filter(l => !l.isInternal).length;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Top Header & Main Tab Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} color="var(--accent-primary)" />
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Links & Media Asset Inspector</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Audit internal/external hyperlink architecture and image accessibility.
            </p>
          </div>
        </div>

        {/* Links / Images Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => { setActiveSubTab('links'); setSearchQuery(''); }}
            className={`btn ${activeSubTab === 'links' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
          >
            <Link2 size={15} />
            <span>Links ({links.length})</span>
          </button>
          <button
            onClick={() => { setActiveSubTab('images'); setSearchQuery(''); }}
            className={`btn ${activeSubTab === 'images' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
          >
            <ImageIcon size={15} />
            <span>Images ({images.length})</span>
          </button>
        </div>
      </div>

      {/* Sub-Filters & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        {activeSubTab === 'links' ? (
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={() => setLinkFilter('all')}
              className={`btn ${linkFilter === 'all' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              All ({links.length})
            </button>
            <button
              onClick={() => setLinkFilter('internal')}
              className={`btn ${linkFilter === 'internal' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              Internal ({internalCount})
            </button>
            <button
              onClick={() => setLinkFilter('external')}
              className={`btn ${linkFilter === 'external' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              External ({externalCount})
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={() => setImageFilter('all')}
              className={`btn ${imageFilter === 'all' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              All ({images.length})
            </button>
            <button
              onClick={() => setImageFilter('missing-alt')}
              className={`btn ${imageFilter === 'missing-alt' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: 'var(--status-critical)' }}
            >
              Missing Alt ({missingAltCount})
            </button>
            <button
              onClick={() => setImageFilter('has-alt')}
              className={`btn ${imageFilter === 'has-alt' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: 'var(--status-success)' }}
            >
              Has Alt ({images.length - missingAltCount})
            </button>
          </div>
        )}

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '0.3rem 0.65rem'
        }}>
          <Search size={14} color="var(--text-muted)" style={{ marginRight: '0.4rem' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeSubTab === 'links' ? 'Filter links by URL or anchor...' : 'Filter images by src or alt...'}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              outline: 'none',
              width: '220px'
            }}
          />
        </div>
      </div>

      {/* Links Content Table */}
      {activeSubTab === 'links' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Destination URL</th>
                <th style={{ padding: '0.75rem 1rem' }}>Anchor Text</th>
                <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Attributes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.map((link, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 1rem', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                    >
                      <span className="font-mono" style={{ fontSize: '0.8rem' }}>{link.url}</span>
                      <ExternalLink size={12} />
                    </a>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: link.hasAnchorText ? 'var(--text-primary)' : 'var(--status-critical)', fontWeight: 500 }}>
                    {link.anchorText || '⚠️ [No Anchor Text]'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={`badge ${link.isInternal ? 'badge-cyan' : 'badge-info'}`}>
                      {link.isInternal ? 'Internal' : 'External'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {link.isNofollow && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>nofollow</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLinks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No links match the selected filter.
            </div>
          )}
        </div>
      )}

      {/* Images Content Table */}
      {activeSubTab === 'images' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Image Source</th>
                <th style={{ padding: '0.75rem 1rem' }}>Alt Text Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Format</th>
                <th style={{ padding: '0.75rem 1rem' }}>Loading</th>
              </tr>
            </thead>
            <tbody>
              {filteredImages.map((img, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 1rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{img.src}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {img.isMissingAlt ? (
                      <span className="badge badge-critical">
                        <AlertCircle size={12} /> Missing Alt Tag
                      </span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary)' }}>
                        <CheckCircle2 size={14} color="var(--status-success)" />
                        <span>"{img.alt}"</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{(img.format || 'IMG').toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {img.isLazyLoaded ? (
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>lazy</span>
                    ) : (
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>eager</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredImages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No images match the selected filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
