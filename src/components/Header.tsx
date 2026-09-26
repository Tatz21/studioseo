import React, { useState, useRef, useEffect } from 'react';
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
  Network,
  Zap,
  LineChart,
  Compass,
  Target,
  Users,
  ChevronDown,
  Check,
  ArrowRight,
  Link2,
  FileText,
  MapPin,
  Eye
} from 'lucide-react';
import { UserProfileDropdown } from './auth/UserProfileDropdown';
import { PRESET_SITES } from '../engine/presets';

export type NavigationTab = 
  | 'websites'
  | 'crawler'
  | 'extraction'
  | 'technical'
  | 'scoring'
  | 'map'
  | 'audit' 
  | 'pagespeed'
  | 'gsc'
  | 'bing'
  | 'ranktracker'
  | 'serp' 
  | 'competitors'
  | 'keywordgap'
  | 'backlinks'
  | 'content'
  | 'geo'
  | 'aeo'
  | 'aivisibility'
  | 'assistant'
  | 'keywords' 
  | 'links' 
  | 'schema' 
  | 'robots'
  | 'database';

export type WorkspaceDomain = 'audits' | 'integrations' | 'keywords' | 'authority' | 'ai' | 'devtools' | 'websites';

export const TAB_TO_WORKSPACE: Record<NavigationTab, WorkspaceDomain> = {
  websites: 'websites',
  crawler: 'audits',
  extraction: 'audits',
  technical: 'audits',
  scoring: 'audits',
  map: 'audits',
  audit: 'audits',
  pagespeed: 'integrations',
  gsc: 'integrations',
  bing: 'integrations',
  ranktracker: 'keywords',
  serp: 'keywords',
  competitors: 'keywords',
  keywordgap: 'keywords',
  backlinks: 'authority',
  content: 'authority',
  geo: 'ai',
  aeo: 'ai',
  aivisibility: 'ai',
  assistant: 'ai',
  keywords: 'keywords',
  links: 'devtools',
  schema: 'devtools',
  robots: 'devtools',
  database: 'devtools',
};

interface WorkspaceDefinition {
  id: WorkspaceDomain;
  label: string;
  defaultTab: NavigationTab;
  icon: React.ReactNode;
  description: string;
  tools: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

const WORKSPACES: WorkspaceDefinition[] = [
  {
    id: 'audits',
    label: 'Audits & Core',
    defaultTab: 'audit',
    icon: <BarChart3 size={15} />,
    description: 'Technical audits, architecture graph, and scoring engine',
    tools: [
      { id: 'audit', label: 'Page Audit', icon: <BarChart3 size={14} /> },
      { id: 'map', label: 'SEO Map', icon: <Network size={14} /> },
      { id: 'technical', label: 'Technical Engine', icon: <ShieldCheck size={14} /> },
      { id: 'scoring', label: 'SEO Scoring', icon: <Award size={14} /> },
      { id: 'extraction', label: 'Data Extraction', icon: <Layers size={14} /> },
      { id: 'crawler', label: 'Crawler Engine', icon: <Bot size={14} /> },
    ]
  },
  {
    id: 'integrations',
    label: 'Search Integrations',
    defaultTab: 'gsc',
    icon: <Zap size={15} />,
    description: 'Google Search Console, PageSpeed Insights, and Bing API',
    tools: [
      { id: 'gsc', label: 'Search Console', icon: <LineChart size={14} />, badge: 'GSC Live' },
      { id: 'pagespeed', label: 'PageSpeed API', icon: <Zap size={14} />, badge: 'PSI' },
      { id: 'bing', label: 'Bing Webmaster', icon: <Compass size={14} /> },
    ]
  },
  {
    id: 'keywords',
    label: 'Keywords & Competitors',
    defaultTab: 'ranktracker',
    icon: <Target size={15} />,
    description: 'Keyword rank tracking, SERP intelligence & competitor discovery',
    tools: [
      { id: 'ranktracker', label: 'Keyword Tracking', icon: <Target size={14} /> },
      { id: 'serp', label: 'SERP Intelligence', icon: <Search size={14} />, badge: 'Phase 15' },
      { id: 'competitors', label: 'Competitor Discovery', icon: <Users size={14} />, badge: 'Phase 16' },
      { id: 'keywordgap', label: 'Keyword Gap', icon: <Layers size={14} />, badge: 'Phase 17' },
      { id: 'keywords', label: 'Headings & Density', icon: <FileSpreadsheet size={14} /> },
    ]
  },
  {
    id: 'authority',
    label: 'Authority & Content',
    defaultTab: 'backlinks',
    icon: <Link2 size={15} />,
    description: 'Backlinks explorer, DR/UR scoring, Google disavow & link gap',
    tools: [
      { id: 'backlinks', label: 'Backlinks & Authority', icon: <Link2 size={14} />, badge: 'Phase 18' },
      { id: 'content', label: 'Content Analysis', icon: <FileText size={14} />, badge: 'Phase 19' },
    ]
  },
  {
    id: 'ai',
    label: 'AI & Future Search',
    defaultTab: 'geo',
    icon: <Sparkles size={15} />,
    description: 'GEO/Local SEO, AEO, AI visibility & recommendation engines',
    tools: [
      { id: 'geo', label: 'GEO & Local SEO', icon: <MapPin size={14} />, badge: 'Phase 20' },
      { id: 'aeo', label: 'AEO (Answer Engine)', icon: <Bot size={14} />, badge: 'Phase 21' },
      { id: 'aivisibility', label: 'AI Visibility (LLM SoV)', icon: <Eye size={14} />, badge: 'Phase 22' },
      { id: 'assistant', label: 'AI SEO Assistant', icon: <Sparkles size={14} />, badge: 'Phase 23' },
    ]
  },
  {
    id: 'devtools',
    label: 'Developer Tools',
    defaultTab: 'schema',
    icon: <Code2 size={15} />,
    description: 'JSON-LD generator, robots tester, link auditor & SQL workbench',
    tools: [
      { id: 'schema', label: 'Schema Generator', icon: <Code2 size={14} /> },
      { id: 'robots', label: 'Robots & Sitemaps', icon: <Bot size={14} /> },
      { id: 'links', label: 'Links & Images', icon: <Layers size={14} /> },
      { id: 'database', label: 'Database Schema', icon: <Database size={14} /> },
    ]
  }
];

export interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onOpenExport: () => void;
  onOpenPasteHtml: () => void;
  onOpenCommandPalette: () => void;
  currentProjectName?: string;
  currentProjectUrl?: string;
  onSelectProjectPreset?: (presetId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  onOpenPasteHtml,
  onOpenCommandPalette,
  currentProjectName = 'PostersCraft',
  currentProjectUrl = 'https://www.posterscraft.com',
  onSelectProjectPreset
}) => {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derive current workspace from active tab
  const currentWorkspaceId = TAB_TO_WORKSPACE[activeTab];
  const currentWorkspace = WORKSPACES.find(w => w.id === currentWorkspaceId);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWorkspaceClick = (ws: WorkspaceDefinition) => {
    // If we are already in this workspace, keep current tab; otherwise switch to workspace defaultTab
    if (TAB_TO_WORKSPACE[activeTab] === ws.id) {
      return;
    }
    setActiveTab(ws.defaultTab);
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(11, 15, 23, 0.92)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Tier 1: Main Global Header Bar */}
      <div style={{
        maxWidth: '1560px',
        margin: '0 auto',
        padding: '0.65rem 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem'
      }}>
        {/* Left: Brand + Active Project Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('audit')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            title="SEO Studio Pro - Return to Overview"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.35)'
            }}>
              <Sparkles size={20} color="#042F2E" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 800, 
                  fontSize: '1.15rem',
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF'
                }}>
                  SEO Studio <span style={{ color: 'var(--accent-primary)' }}>Pro</span>
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>v2.5</span>
              </div>
            </div>
          </div>

          {/* Active Project Selector Pill */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="project-pill"
              title="Active Project / Domain Switcher"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                border: isProjectDropdownOpen ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                background: isProjectDropdownOpen ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)'
              }}
            >
              <div className="status-dot status-dot-emerald" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFFFFF' }}>
                  {currentProjectName}
                </span>
                <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                  {currentProjectUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                </span>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" style={{ marginLeft: '0.25rem' }} />
            </button>

            {/* Active Project Floating Menu */}
            {isProjectDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: '320px',
                background: '#111827',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                padding: '0.65rem',
                zIndex: 100,
                animation: 'scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                <div style={{
                  padding: '0.4rem 0.5rem 0.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Switch Workspace Target</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.6rem' }}>Live Site</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.4rem' }}>
                  {PRESET_SITES.map((site) => {
                    const isSelected = currentProjectUrl.toLowerCase().includes(site.url.replace(/^https?:\/\/(www\.)?/, '').toLowerCase());
                    return (
                      <button
                        key={site.id}
                        onClick={() => {
                          if (onSelectProjectPreset) {
                            onSelectProjectPreset(site.id);
                          }
                          setIsProjectDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.55rem 0.65rem',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                          border: isSelected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <Globe size={16} color={isSelected ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                          <div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: isSelected ? 600 : 500, color: isSelected ? '#FFFFFF' : 'var(--text-secondary)' }}>
                              {site.name}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              {site.category}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check size={14} color="var(--accent-primary)" />}
                      </button>
                    );
                  })}
                </div>

                <div style={{
                  marginTop: '0.5rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <button
                    onClick={() => {
                      setActiveTab('websites');
                      setIsProjectDropdownOpen(false);
                    }}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem', color: 'var(--accent-primary)', width: '100%' }}
                  >
                    <Globe size={13} style={{ marginRight: '0.35rem' }} />
                    Manage All Sites & Crawl Configs →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: 4 Workspace Domains Navigation */}
        <nav style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.3rem',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '0.25rem',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          {WORKSPACES.map((ws) => {
            const isActive = currentWorkspaceId === ws.id;
            return (
              <button
                key={ws.id}
                onClick={() => handleWorkspaceClick(ws)}
                className={`workspace-tab ${isActive ? 'active' : ''}`}
                title={ws.description}
              >
                <span style={{ color: isActive ? 'var(--accent-primary)' : 'inherit', display: 'flex' }}>
                  {ws.icon}
                </span>
                <span>{ws.label}</span>
              </button>
            );
          })}

          <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.08)', margin: '0 0.2rem' }} />

          {/* Websites & Projects direct tab */}
          <button
            onClick={() => setActiveTab('websites')}
            className={`workspace-tab ${activeTab === 'websites' ? 'active' : ''}`}
            title="Registered Websites & Crawl Settings"
          >
            <Globe size={15} color={activeTab === 'websites' ? 'var(--accent-primary)' : 'inherit'} />
            <span>Projects</span>
          </button>
        </nav>

        {/* Right: Command Bar Trigger & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          {/* Spotlight Command Bar Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="command-trigger-btn"
            title="Search all 18 tools and actions (Ctrl+K)"
          >
            <Search size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.78rem' }}>Search tools...</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <kbd className="command-trigger-kbd">⌘K</kbd>
            </div>
          </button>

          {/* Paste Raw HTML */}
          <button
            onClick={onOpenPasteHtml}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
            title="Paste raw HTML source for offline audit"
          >
            <Code2 size={14} />
            <span>Paste HTML</span>
          </button>

          {/* Export Report */}
          <button
            onClick={onOpenExport}
            className="btn btn-outline-emerald"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
            title="Export full audit report"
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          {/* User Profile */}
          <UserProfileDropdown />
        </div>
      </div>

      {/* Tier 2: Contextual Sub-Nav Ribbon */}
      {currentWorkspace && activeTab !== 'websites' && (
        <div className="subnav-ribbon">
          {/* Subnav Breadcrumb & Active Domain */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <span style={{ 
              fontSize: '0.72rem', 
              fontWeight: 600, 
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              {currentWorkspace.label}
              <ArrowRight size={12} color="var(--text-muted)" />
            </span>
          </div>

          {/* Subnav Tool Pills */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.35rem', 
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}>
            {currentWorkspace.tools.map((tool) => {
              const isToolActive = activeTab === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTab(tool.id)}
                  className={`subnav-pill ${isToolActive ? 'active' : ''}`}
                >
                  <span style={{ display: 'flex' }}>{tool.icon}</span>
                  <span>{tool.label}</span>
                  {tool.badge && (
                    <span style={{
                      fontSize: '0.6rem',
                      padding: '0.08rem 0.35rem',
                      borderRadius: '4px',
                      background: isToolActive ? 'rgba(4, 47, 46, 0.8)' : 'rgba(6, 182, 212, 0.15)',
                      color: isToolActive ? '#FFFFFF' : 'var(--accent-cyan)',
                      fontWeight: 700
                    }}>
                      {tool.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Context Indicator */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            flexShrink: 0
          }}>
            <span className="status-dot status-dot-emerald" />
            <span>Live Analysis Mode</span>
          </div>
        </div>
      )}
    </header>
  );
};
