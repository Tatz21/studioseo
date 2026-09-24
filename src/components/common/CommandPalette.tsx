import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Globe,
  Bot,
  Layers,
  ShieldCheck,
  Award,
  Network,
  BarChart3,
  Zap,
  LineChart,
  Compass,
  Target,
  Users,
  FileSpreadsheet,
  Code2,
  Database,
  ArrowRight,
  Download,
  Link2,
  FileText,
  MapPin
} from 'lucide-react';
import { NavigationTab } from '../Header';

interface CommandItem {
  id: NavigationTab | 'export' | 'paste_html';
  title: string;
  category: 'Audits & Core' | 'Integrations' | 'Keywords & Competitors' | 'Authority & Content' | 'AI & Future Search' | 'Developer Tools' | 'Projects' | 'Actions';
  description: string;
  icon: React.ReactNode;
  keywords: string[];
}

const COMMAND_ITEMS: CommandItem[] = [
  // Projects
  {
    id: 'websites',
    title: 'Websites & Projects',
    category: 'Projects',
    description: 'Manage registered domains, crawl depth limits, and project presets',
    icon: <Globe size={18} color="var(--accent-primary)" />,
    keywords: ['sites', 'projects', 'domain', 'add site', 'settings']
  },
  // Audits & Core
  {
    id: 'audit',
    title: 'Page Audit',
    category: 'Audits & Core',
    description: 'Full on-page technical checks, Core Web Vitals, and prioritized recommendations',
    icon: <BarChart3 size={18} color="var(--accent-primary)" />,
    keywords: ['audit', 'page audit', 'on-page', 'health', 'issues', 'vitals']
  },
  {
    id: 'map',
    title: 'SEO Architecture Map',
    category: 'Audits & Core',
    description: 'Interactive canvas network visualization of crawl hierarchy and link equity',
    icon: <Network size={18} color="#06B6D4" />,
    keywords: ['map', 'graph', 'hierarchy', 'internal links', 'tree', 'canvas']
  },
  {
    id: 'technical',
    title: 'Technical Rules Engine',
    category: 'Audits & Core',
    description: '24 deterministic rule evaluations with measured criteria and code remediation',
    icon: <ShieldCheck size={18} color="#10B981" />,
    keywords: ['technical', 'rules', 'engine', 'checks', 'canonical', 'meta', 'status']
  },
  {
    id: 'scoring',
    title: 'SEO Scoring & Snapshots',
    category: 'Audits & Core',
    description: 'Versioned multi-category scoring grades (A+ to F) and historical timeline diffs',
    icon: <Award size={18} color="#F59E0B" />,
    keywords: ['score', 'grading', 'snapshot', 'history', 'timeline', 'grade']
  },
  {
    id: 'extraction',
    title: 'Data Extraction Inspector',
    category: 'Audits & Core',
    description: 'DOM AST tree inspection for metadata, headings, canonicals, and Schema JSON-LD',
    icon: <Layers size={18} color="#8B5CF6" />,
    keywords: ['extract', 'dom', 'headings', 'ast', 'metadata', 'json-ld']
  },
  {
    id: 'crawler',
    title: 'Crawler Engine Monitor',
    category: 'Audits & Core',
    description: 'Live robots.txt RFC 9309 parser, XML sitemap indexer, and BFS priority crawler',
    icon: <Bot size={18} color="#06B6D4" />,
    keywords: ['crawler', 'spider', 'robots', 'sitemap', 'fetch', 'queue']
  },

  // Integrations
  {
    id: 'gsc',
    title: 'Google Search Console',
    category: 'Integrations',
    description: 'Search performance analytics, query CTR rankings, and real Googlebot URL inspector',
    icon: <LineChart size={18} color="#3B82F6" />,
    keywords: ['gsc', 'search console', 'google', 'queries', 'impressions', 'clicks']
  },
  {
    id: 'pagespeed',
    title: 'Google PageSpeed Insights',
    category: 'Integrations',
    description: 'Official Lighthouse 13.4.1 audits, Core Web Vitals (LCP, FCP, CLS), and opportunities',
    icon: <Zap size={18} color="#F59E0B" />,
    keywords: ['pagespeed', 'lighthouse', 'speed', 'performance', 'cwv', 'lcp']
  },
  {
    id: 'bing',
    title: 'Bing Webmaster & IndexNow',
    category: 'Integrations',
    description: 'Bing search query telemetry, crawl issues, and instant IndexNow batch submission',
    icon: <Compass size={18} color="#06B6D4" />,
    keywords: ['bing', 'webmaster', 'indexnow', 'crawl health', 'instant index']
  },

  // Keywords & Competitors
  {
    id: 'ranktracker',
    title: 'Keyword Tracking',
    category: 'Keywords & Competitors',
    description: 'Rank tracking, 14-day trajectories, search intent attribution, and desktop vs mobile',
    icon: <Target size={18} color="#10B981" />,
    keywords: ['keywords', 'rank tracker', 'positions', 'intent', 'trajectory']
  },
  {
    id: 'serp',
    title: 'SERP Intelligence',
    category: 'Keywords & Competitors',
    description: 'Multi-engine organic results, Featured Snippets, PAA accordions, and Algorithm Radar',
    icon: <Search size={18} color="#06B6D4" />,
    keywords: ['serp', 'google search', 'snippets', 'paa', 'volatility', 'radar', 'weather']
  },
  {
    id: 'competitors',
    title: 'Competitor Discovery',
    category: 'Keywords & Competitors',
    description: 'Organic competitors matrix, 2D positioning scatter quadrant, and head-to-head battles',
    icon: <Users size={18} color="#EF4444" />,
    keywords: ['competitors', 'rivals', 'market share', 'battle', 'overlap', 'displacement']
  },
  {
    id: 'keywordgap',
    title: 'Keyword Gap Analysis',
    category: 'Keywords & Competitors',
    description: 'Multi-domain keyword overlap, Venn distribution, missing high-volume opportunities, and arbitrage quick wins',
    icon: <Layers size={18} color="#06B6D4" />,
    keywords: ['gap', 'keyword gap', 'overlap', 'missing keywords', 'arbitrage', 'venn', 'content gap']
  },
  {
    id: 'keywords',
    title: 'Headings & Keyword Density',
    category: 'Keywords & Competitors',
    description: 'Heading hierarchy visual tree and unigram/bigram/trigram keyword density table',
    icon: <FileSpreadsheet size={18} color="#A855F7" />,
    keywords: ['density', 'ngrams', 'headings', 'hierarchy', 'h1', 'h2']
  },

  // Authority & Content
  {
    id: 'backlinks',
    title: 'Backlinks & Domain Authority',
    category: 'Authority & Content',
    description: 'Backlink profile explorer, Domain Rating (DR), toxic spam audit, and Google disavow file generator',
    icon: <Link2 size={18} color="var(--accent-primary)" />,
    keywords: ['backlinks', 'dr', 'ur', 'inlinks', 'referring domains', 'disavow', 'toxic links', 'authority', 'anchor']
  },
  {
    id: 'content',
    title: 'Content Analysis & NLP Optimizer',
    category: 'Authority & Content',
    description: 'Readability indices (Flesch, Fog, SMOG), semantic TF-IDF terms, scannability, and live copywriting editor',
    icon: <FileText size={18} color="var(--accent-cyan)" />,
    keywords: ['content', 'readability', 'flesch', 'nlp', 'tf-idf', 'scannability', 'editor', 'copywriting', 'writing assistant']
  },

  // AI & Future Search
  {
    id: 'geo',
    title: 'GEO & Local SEO Explorer',
    category: 'AI & Future Search',
    description: 'Geo-grid rankings (3x3 / 5x5), Google 3-Pack simulator, NAP citations consistency & LocalBusiness schema',
    icon: <MapPin size={18} color="var(--accent-primary)" />,
    keywords: ['geo', 'local seo', 'local pack', 'geo grid', 'nap', 'citations', 'google business profile', 'gbp', 'local schema', 'near me', 'map pin']
  },

  // Developer Tools
  {
    id: 'schema',
    title: 'Schema.org Generator',
    category: 'Developer Tools',
    description: 'Interactive JSON-LD structured data generator for Article, Product, Organization, FAQ',
    icon: <Code2 size={18} color="#10B981" />,
    keywords: ['schema', 'json-ld', 'structured data', 'rich snippets', 'faq']
  },
  {
    id: 'robots',
    title: 'Robots & Sitemaps Tester',
    category: 'Developer Tools',
    description: 'Interactive robots.txt rule simulator and XML sitemap validator',
    icon: <Bot size={18} color="#06B6D4" />,
    keywords: ['robots.txt', 'sitemap.xml', 'tester', 'directives', 'allow', 'disallow']
  },
  {
    id: 'links',
    title: 'Links & Images Inspector',
    category: 'Developer Tools',
    description: 'Internal vs external link distribution, rel attributes, and media alt tag audits',
    icon: <Layers size={18} color="#8B5CF6" />,
    keywords: ['links', 'images', 'internal links', 'alt tags', 'nofollow', 'dofollow']
  },
  {
    id: 'database',
    title: 'Database Schema Explorer',
    category: 'Developer Tools',
    description: 'PostgreSQL 10-table relational schema viewer and interactive SQL query workbench',
    icon: <Database size={18} color="#F59E0B" />,
    keywords: ['sql', 'database', 'postgres', 'tables', 'schema', 'workbench']
  },

  // Actions
  {
    id: 'export',
    title: 'Export Audit Report',
    category: 'Actions',
    description: 'Download structured HTML, JSON, or CSV audit reports',
    icon: <Download size={18} color="#06B6D4" />,
    keywords: ['export', 'download', 'pdf', 'csv', 'json', 'report']
  },
  {
    id: 'paste_html',
    title: 'Paste Raw HTML',
    category: 'Actions',
    description: 'Paste direct HTML source markup to run instantaneous audits without network fetch',
    icon: <Code2 size={18} color="#10B981" />,
    keywords: ['paste', 'html', 'raw', 'offline', 'source']
  }
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenExport: () => void;
  onOpenPasteHtml: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenExport,
  onOpenPasteHtml
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return COMMAND_ITEMS;
    }
    const q = query.toLowerCase().trim();
    return COMMAND_ITEMS.filter(item => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.some(k => k.toLowerCase().includes(q))
      );
    });
  }, [query]);

  // Reset selection index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          executeItem(selected);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems]);

  const executeItem = (item: CommandItem) => {
    if (item.id === 'export') {
      onOpenExport();
    } else if (item.id === 'paste_html') {
      onOpenPasteHtml();
    } else {
      onSelectTab(item.id as NavigationTab);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div className="command-palette-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <Search size={20} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, tool, or search keyword..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '1rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          />
          <button
            onClick={onClose}
            className="badge"
            style={{
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-muted)',
              fontSize: '0.65rem'
            }}
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '0.5rem' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No tools or commands matching "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                    transition: 'all 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: isSelected ? 'var(--accent-primary)' : '#FFFFFF' }}>
                          {item.title}
                        </span>
                        <span className="badge" style={{ fontSize: '0.62rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                          {item.category}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <ArrowRight size={14} color={isSelected ? 'var(--accent-primary)' : 'transparent'} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div style={{
          padding: '0.65rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Dismiss</span>
          </div>
          <span>SEO Studio Pro Command Bar</span>
        </div>
      </div>
    </div>
  );
};
