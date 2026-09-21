import React from 'react';
import { 
  BarChart3, 
  Search, 
  Code2, 
  FileSpreadsheet, 
  Bot, 
  Download, 
  Sparkles,
  Layers, 
  Database, 
  Globe,
  ShieldCheck,
  Award,
  Network
} from 'lucide-react';
import { UserProfileDropdown } from './auth/UserProfileDropdown';

export type NavigationTab = 
  | 'websites'
  | 'crawler'
  | 'extraction'
  | 'technical'
  | 'scoring'
  | 'map'
  | 'audit' 
  | 'serp' 
  | 'keywords' 
  | 'links' 
  | 'schema' 
  | 'robots'
  | 'database';

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onOpenExport: () => void;
  onOpenPasteHtml: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  onOpenPasteHtml
}) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(11, 15, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #06B6D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            <Sparkles size={22} color="#042F2E" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 800, 
                fontSize: '1.25rem',
                letterSpacing: '-0.02em',
                color: '#FFFFFF'
              }}>
                SEO Studio <span style={{ color: 'var(--accent-primary)' }}>Pro</span>
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>v2.4 Live</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Enterprise SEO Audit & Optimization Suite
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('websites')}
            className={`btn ${activeTab === 'websites' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.9rem' }}
          >
            <Globe size={16} />
            <span>Websites & Projects</span>
          </button>

          <button
            onClick={() => setActiveTab('crawler')}
            className={`btn ${activeTab === 'crawler' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.9rem' }}
          >
            <Bot size={16} />
            <span>Crawler Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('extraction')}
            className={`btn ${activeTab === 'extraction' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.9rem' }}
          >
            <Layers size={16} />
            <span>Data Extraction</span>
          </button>

          <button
            onClick={() => setActiveTab('technical')}
            className={`btn ${activeTab === 'technical' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.9rem' }}
          >
            <ShieldCheck size={16} />
            <span>Technical Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('scoring')}
            className={`btn ${activeTab === 'scoring' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.9rem' }}
          >
            <Award size={16} />
            <span>SEO Scoring</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`btn ${activeTab === 'map' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.9rem' }}
          >
            <Network size={16} />
            <span>SEO Map</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.9rem' }}
          >
            <BarChart3 size={16} />
            <span>Audit & Issues</span>
          </button>

          <button
            onClick={() => setActiveTab('serp')}
            className={`btn ${activeTab === 'serp' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.9rem' }}
          >
            <Search size={16} />
            <span>SERP & Social Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('keywords')}
            className={`btn ${activeTab === 'keywords' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.9rem' }}
          >
            <FileSpreadsheet size={16} />
            <span>Keywords & Headings</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`btn ${activeTab === 'links' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.9rem' }}
          >
            <Layers size={16} />
            <span>Links & Images</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`btn ${activeTab === 'schema' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.9rem' }}
          >
            <Code2 size={16} />
            <span>Schema.org Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('robots')}
            className={`btn ${activeTab === 'robots' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.9rem' }}
          >
            <Bot size={16} />
            <span>Robots & Sitemaps</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`btn ${activeTab === 'database' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.9rem' }}
          >
            <Database size={16} />
            <span>Database & Schema</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={onOpenPasteHtml}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            title="Paste raw HTML directly"
          >
            <Code2 size={15} />
            <span>Paste HTML</span>
          </button>

          <button
            onClick={onOpenExport}
            className="btn btn-outline-eme