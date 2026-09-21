import React, { useState } from 'react';
import { Website, CrawlConfig } from '../../sites/types';
import { websiteStore } from '../../sites/websiteStore';
import { AddWebsiteModal } from './AddWebsiteModal';
import { CrawlConfigDrawer } from './CrawlConfigDrawer';
import { 
  Globe, 
  Plus, 
  Search, 
  Sliders, 
  Play, 
  Trash2, 
  ExternalLink, 
  Layers, 
  BarChart3,
  Bot
} from 'lucide-react';

interface WebsiteManagerProps {
  onSelectAndAuditWebsite: (canonicalUrl: string) => void;
}

export const WebsiteManager: React.FC<WebsiteManagerProps> = ({
  onSelectAndAuditWebsite
}) => {
  const [websites, setWebsites] = useState<Website[]>(() => websiteStore.getWebsites());
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSiteForConfig, setSelectedSiteForConfig] = useState<Website | null>(null);

  const refreshWebsites = () => {
    setWebsites(websiteStore.getWebsites());
  };

  const handleAddWebsite = (data: {
    domain: string;
    name: string;
    canonicalUrl: string;
    crawlConfig: CrawlConfig;
  }) => {
    websiteStore.addWebsite(data);
    refreshWebsites();
  };

  const handleSaveConfig = (websiteId: string, updatedConfig: CrawlConfig) => {
    websiteStore.updateWebsite(websiteId, { crawlConfig: updatedConfig });
    refreshWebsites();
  };

  const handleDeleteWebsite = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from your managed websites?`)) {
      websiteStore.deleteWebsite(id);
      refreshWebsites();
    }
  };

  const filteredWebsites = websites.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSites = websites.length;
  const totalCrawledPages = websites.reduce((acc, w) => acc + (w.totalPagesCrawled || 0), 0);
  const avgHealth = Math.round(websites.reduce((acc, w) => acc + (w.healthScore || 85), 0) / Math.max(1, totalSites));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
      {/* Top Stat Cards */}
      <div className="grid-3">
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #06B6D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
          }}>
            <Globe size={22} color="#042F2E" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Registered Websites
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {totalSites}
            </h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)'
          }}>
            <Layers size={22} color="#FFFFFF" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Monitored Pages
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {totalCrawledPages}
            </h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
          }}>
            <BarChart3 size={22} color="#042F2E" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Average Health Score
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)', lineHeight: 1.1 }}>
              {avgHealth}%
            </h3>
          </div>
        </div>
      </div>

      {/* Action Bar & Search */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '0.4rem 0.85rem',
          minWidth: '280px'
        }}>
          <Search size={16} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search websites by name or domain..."
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              width: '100%'
            }}
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Add New Website</span>
        </button>
      </div>

      {/* Website Cards Grid */}
      <div className="grid-2">
        {filteredWebsites.map(site => (
          <div
            key={site.id}
            className="glass-panel card-hover"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.25rem',
              position: 'relative'
            }}
          >
            <div>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      {site.name}
                    </h3>
                    <a
                      href={site.canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--accent-cyan)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        textDecoration: 'none'
                      }}
                    >
                      <span className="font-mono">{site.domain}</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>

                {/* Health Score Pill */}
                {site.healthScore ? (
                  <div style={{
                    background: 'var(--status-success-bg)',
                    border: '1px solid var(--status-success)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--status-success)', fontFamily: 'var(--font-display)' }}>
                      {site.healthScore}%
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Score</span>
                  </div>
                ) : (
                  <span className="badge badge-info">Pending Audit</span>
                )}
              </div>

              {/* Crawl Config Summary Chips */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Layers size={13} color="var(--accent-primary)" />
                  <span>Depth Limit: <strong style={{ color: 'var(--text-primary)' }}>{site.crawlConfig.crawlDepthLimit} Levels</strong></span>
                </div>
                <span style={{ color: 'var(--border-medium)' }}>•</span>
                <div>
                  <span>Max Ceiling: <strong style={{ color: 'var(--text-primary)' }}>{site.crawlConfig.maxPagesLimit} Pages</strong></span>
                </div>
                <span style={{ color: 'var(--border-medium)' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Bot size={13} color="var(--accent-cyan)" />
                  <span>Agent: <strong style={{ color: 'var(--text-primary)' }}>{site.crawlConfig.userAgent}</strong></span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => onSelectAndAuditWebsite(site.canonicalUrl)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.775rem', padding: '0.4rem 0.85rem' }}
                >
                  <Play size={14} />
                  <span>Audit Now</span>
                </button>

                <button
                  onClick={() => setSelectedSiteForConfig(site)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.775rem', padding: '0.4rem 0.85rem' }}
                >
                  <Sliders size={14} />
                  <span>Crawl Config</span>
                </button>
              </div>

              <button
                onClick={() => handleDeleteWebsite(site.id, site.name)}
                className="btn btn-ghost"
                style={{ padding: '0.4rem', color: 'var(--status-critical)' }}
                title="Delete Website"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {filteredWebsites.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <Globe size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>No Websites Found</h4>
            <p style={{ fontSize: '0.8125rem', marginBottom: '1.25rem' }}>No websites match your search query. Register a new property to begin tracking.</p>
            <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>Add First Website</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Website Modal */}
      <AddWebsiteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddWebsite={handleAddWebsite}
      />

      {/* Crawl Config Drawer */}
      <CrawlConfigDrawer
        website={selectedSiteForConfig}
        isOpen={!!selectedSiteForConfig}
        onClose={() => setSelectedSiteForConfig(null)}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
};
