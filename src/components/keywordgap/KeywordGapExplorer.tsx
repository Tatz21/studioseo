import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Plus,
  Check,
  Zap,
  TrendingUp,
  Globe,
  Layers,
  AlertCircle,
  Sparkles,
  PieChart,
  FileSpreadsheet,
  CheckCircle2,
  Target,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';
import { 
  KeywordGapItem, 
  GapStatus, 
  GapSummaryMetrics, 
  KeywordGapResponse 
} from '../../keywordgap/types';
import { KeywordGapStore } from '../../keywordgap/gapStore';
import { fetchKeywordGapData } from '../../keywordgap/gapApi';

interface KeywordGapExplorerProps {
  currentUrl?: string;
  onNavigateToTracker?: () => void;
}

export const KeywordGapExplorer: React.FC<KeywordGapExplorerProps> = ({
  currentUrl = 'https://www.posterscraft.com',
  onNavigateToTracker
}) => {
  // Target Domain
  const targetDomain = useMemo(() => {
    return currentUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '') || 'posterscraft.com';
  }, [currentUrl]);

  // Competitor list selection
  const availableCompetitors = useMemo(() => KeywordGapStore.getAvailableCompetitors(), []);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([
    'allposters.com',
    'posterstore.com',
    'desenio.com',
    'etsy.com'
  ]);

  // Active Subtab
  const [activeSubtab, setActiveSubtab] = useState<'matrix' | 'venn' | 'arbitrage' | 'export'>('matrix');

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<GapStatus>('all');
  const [intentFilter, setIntentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'volume' | 'difficulty' | 'opportunity' | 'rank'>('opportunity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: 'volume' | 'difficulty' | 'opportunity' | 'rank') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Data Loading
  const [isLoading, setIsLoading] = useState(false);
  const [gapData, setGapData] = useState<KeywordGapResponse | null>(null);
  const [trackedKeywordsSet, setTrackedKeywordsSet] = useState<Set<string>>(new Set());
  const [recentlyTracked, setRecentlyTracked] = useState<string | null>(null);

  // Fetch or calculate gap data
  const loadGapData = async (target: string, comps: string[]) => {
    setIsLoading(true);
    try {
      const data = await fetchKeywordGapData(target, comps);
      setGapData(data);
    } catch (err) {
      console.error('Error fetching keyword gap data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGapData(targetDomain, selectedCompetitors);
  }, [targetDomain, selectedCompetitors]);

  // Sync tracked status with Phase 14
  useEffect(() => {
    if (gapData) {
      const tracked = new Set<string>();
      gapData.items.forEach(item => {
        if (KeywordGapStore.isKeywordTracked(item.keyword)) {
          tracked.add(item.keyword.toLowerCase());
        }
      });
      setTrackedKeywordsSet(tracked);
    }
  }, [gapData, recentlyTracked]);

  const toggleCompetitor = (domain: string) => {
    if (selectedCompetitors.includes(domain)) {
      if (selectedCompetitors.length <= 1) return; // keep at least 1
      setSelectedCompetitors(selectedCompetitors.filter(d => d !== domain));
    } else {
      if (selectedCompetitors.length >= 5) return; // max 5
      setSelectedCompetitors([...selectedCompetitors, domain]);
    }
  };

  const handleTrackKeyword = (item: KeywordGapItem) => {
    const success = KeywordGapStore.trackGapKeyword(item, targetDomain);
    if (success) {
      setRecentlyTracked(item.keyword);
      setTimeout(() => setRecentlyTracked(null), 3000);
    }
  };

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    if (!gapData) return [];

    return gapData.items.filter(item => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.keyword.toLowerCase().includes(q)) return false;
      }

      // Status Filter
      if (statusFilter !== 'all' && item.gapStatus !== statusFilter) {
        return false;
      }

      // Intent Filter
      if (intentFilter !== 'all' && item.intent.toLowerCase() !== intentFilter.toLowerCase()) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'volume') {
        comparison = b.searchVolume - a.searchVolume;
      } else if (sortBy === 'difficulty') {
        comparison = b.difficulty - a.difficulty;
      } else if (sortBy === 'opportunity') {
        comparison = b.opportunityScore - a.opportunityScore;
      } else if (sortBy === 'rank') {
        const rankA = a.targetRank ?? 999;
        const rankB = b.targetRank ?? 999;
        comparison = rankA - rankB;
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });
  }, [gapData, searchQuery, statusFilter, intentFilter, sortBy, sortOrder]);

  // Venn Segments
  const vennSegments = useMemo(() => {
    if (!gapData) return [];
    return KeywordGapStore.computeVennDistribution(
      gapData.items,
      gapData.metrics,
      targetDomain,
      selectedCompetitors
    );
  }, [gapData, targetDomain, selectedCompetitors]);

  const metrics: GapSummaryMetrics = gapData?.metrics || {
    totalCompared: 0,
    missingCount: 0,
    weakCount: 0,
    strongCount: 0,
    sharedCount: 0,
    estimatedTrafficPotential: 0
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Target Domain & Multi-Competitor Selector Bar */}
      <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {/* Target Website Banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <Globe size={20} color="var(--accent-primary)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                  {targetDomain}
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                  You (Target)
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Multi-domain keyword overlap & content gap footprint
              </p>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Estimated Traffic Gap
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                +{metrics.estimatedTrafficPotential.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>visits/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Competitor Toggle Chips */}
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Compare Against Competitors:
          </span>

          {availableCompetitors.map(comp => {
            const isSelected = selectedCompetitors.includes(comp.domain);
            return (
              <button
                key={comp.domain}
                type="button"
                onClick={() => toggleCompetitor(comp.domain)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)'
                }} />
                <span>{comp.name} ({comp.domain})</span>
                <span className="badge" style={{ fontSize: '0.62rem', padding: '0.05rem 0.35rem', background: 'rgba(255, 255, 255, 0.06)' }}>
                  DR {comp.dr}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {/* Total Compared */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Compared Pool
            </span>
            <Layers size={16} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
            {metrics.totalCompared}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Across {selectedCompetitors.length} active competitors
          </div>
        </div>

        {/* Missing Keywords (Critical) */}
        <div 
          className="card card-interactive" 
          onClick={() => { setStatusFilter('missing'); setActiveSubtab('matrix'); }}
          style={{ 
            padding: '1.25rem',
            borderLeft: '3px solid var(--status-critical)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Missing Keywords
            </span>
            <AlertCircle size={16} color="var(--status-critical)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--status-critical)', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
            {metrics.missingCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Competitors rank, You = unranked
          </div>
        </div>

        {/* Weak Positions */}
        <div 
          className="card card-interactive" 
          onClick={() => { setStatusFilter('weak'); setActiveSubtab('matrix'); }}
          style={{ 
            padding: '1.25rem',
            borderLeft: '3px solid var(--status-warning)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Weak Positions
            </span>
            <TrendingUp size={16} color="var(--status-warning)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--status-warning)', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
            {metrics.weakCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            You rank lower than rivals
          </div>
        </div>

        {/* Shared Footprint */}
        <div 
          className="card card-interactive" 
          onClick={() => { setStatusFilter('shared'); setActiveSubtab('matrix'); }}
          style={{ 
            padding: '1.25rem',
            borderLeft: '3px solid var(--accent-cyan)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Shared Keywords
            </span>
            <Globe size={16} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
            {metrics.sharedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Simultaneously in top 20
          </div>
        </div>

        {/* Strong / Defended */}
        <div 
          className="card card-interactive" 
          onClick={() => { setStatusFilter('strong'); setActiveSubtab('matrix'); }}
          style={{ 
            padding: '1.25rem',
            borderLeft: '3px solid var(--accent-primary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Strong / Dominating
            </span>
            <CheckCircle2 size={16} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
            {metrics.strongCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            You outrank all rivals
          </div>
        </div>
      </div>

      {/* Subtab Navigation Ribbon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.25rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveSubtab('matrix')}
            className={`btn ${activeSubtab === 'matrix' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}
          >
            <FileSpreadsheet size={15} />
            <span>Content Gap Matrix</span>
          </button>

          <button
            onClick={() => setActiveSubtab('venn')}
            className={`btn ${activeSubtab === 'venn' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}
          >
            <PieChart size={15} />
            <span>Visual Overlap & Venn</span>
          </button>

          <button
            onClick={() => setActiveSubtab('arbitrage')}
            className={`btn ${activeSubtab === 'arbitrage' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}
          >
            <Zap size={15} />
            <span>Arbitrage Quick Wins</span>
          </button>

          <button
            onClick={() => setActiveSubtab('export')}
            className={`btn ${activeSubtab === 'export' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}
          >
            <Download size={15} />
            <span>Export & Content Strategy</span>
          </button>
        </div>

        {/* Quick Help / Tooltip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Sparkles size={14} color="var(--accent-primary)" />
          <span>Phase 17 Operational</span>
        </div>
      </div>

      {/* SUBTAB 1: CONTENT GAP MATRIX */}
      {activeSubtab === 'matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Controls Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              {/* Search & Intent Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '0.35rem 0.75rem'
                }}>
                  <Search size={15} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search keywords or topics..."
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <select
                  value={intentFilter}
                  onChange={(e) => setIntentFilter(e.target.value)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    borderRadius: '8px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.8rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Search Intents</option>
                  <option value="commercial">Commercial</option>
                  <option value="transactional">Transactional</option>
                  <option value="informational">Informational</option>
                </select>
              </div>

              {/* Status Segment Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                {(['all', 'missing', 'weak', 'strong', 'shared'] as GapStatus[]).map(status => {
                  const isActive = statusFilter === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                        background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {status === 'all' && `All (${gapData?.items.length || 0})`}
                      {status === 'missing' && `Missing (${metrics.missingCount})`}
                      {status === 'weak' && `Weak (${metrics.weakCount})`}
                      {status === 'strong' && `Strong (${metrics.strongCount})`}
                      {status === 'shared' && `Shared (${metrics.sharedCount})`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recently Tracked Toast */}
          {recentlyTracked && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--accent-primary)',
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              animation: 'fadeIn 0.2s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Check size={18} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.85rem', color: '#FFFFFF' }}>
                  Added <strong>"{recentlyTracked}"</strong> directly to Phase 14 Keyword Tracker with historical trajectory monitoring!
                </span>
              </div>
              {onNavigateToTracker && (
                <button
                  type="button"
                  onClick={onNavigateToTracker}
                  className="btn btn-primary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <span>View Tracker</span>
                  <ExternalLink size={12} />
                </button>
              )}
            </div>
          )}

          {/* Gap Matrix Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            {isLoading && <div className="radar-loader" />}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Keyword & Intent</th>
                    <th 
                      onClick={() => handleSort('volume')}
                      style={{ padding: '0.85rem 0.75rem', color: sortBy === 'volume' ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: 600, textAlign: 'right', cursor: 'pointer' }}
                      title="Sort by Search Volume"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem' }}>
                        <span>Volume</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('difficulty')}
                      style={{ padding: '0.85rem 0.75rem', color: sortBy === 'difficulty' ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: 600, textAlign: 'center', cursor: 'pointer' }}
                      title="Sort by Keyword Difficulty"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                        <span>KD %</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th style={{ padding: '0.85rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>CPC</th>
                    
                    {/* Target Domain Column */}
                    <th 
                      onClick={() => handleSort('rank')}
                      style={{ 
                        padding: '0.85rem 0.85rem', 
                        color: 'var(--accent-primary)', 
                        fontWeight: 700, 
                        textAlign: 'center',
                        background: 'rgba(16, 185, 129, 0.06)',
                        cursor: 'pointer'
                      }}
                      title="Sort by Target Domain Rank"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                        <span>{targetDomain.replace('.com', '')} (You)</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>

                    {/* Competitor Columns */}
                    {selectedCompetitors.map(comp => (
                      <th 
                        key={comp} 
                        style={{ padding: '0.85rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}
                      >
                        {comp.replace('.com', '')}
                      </th>
                    ))}

                    <th style={{ padding: '0.85rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>Gap Status</th>
                    <th 
                      onClick={() => handleSort('opportunity')}
                      style={{ padding: '0.85rem 0.75rem', color: sortBy === 'opportunity' ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: 600, textAlign: 'center', cursor: 'pointer' }}
                      title="Sort by Opportunity Score"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                        <span>Opportunity</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6 + selectedCompetitors.length} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No keywords match your selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, idx) => {
                      const isTracked = trackedKeywordsSet.has(item.keyword.toLowerCase());

                      return (
                        <tr 
                          key={item.keyword}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                            transition: 'background var(--transition-fast)'
                          }}
                        >
                          {/* Keyword & Intent */}
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.85rem' }}>
                              {item.keyword}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                              <span className="badge" style={{
                                fontSize: '0.62rem',
                                padding: '0.05rem 0.35rem',
                                background: item.intent === 'Transactional' ? 'rgba(16, 185, 129, 0.15)' :
                                            item.intent === 'Commercial' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: item.intent === 'Transactional' ? 'var(--accent-primary)' :
                                       item.intent === 'Commercial' ? 'var(--accent-cyan)' : 'var(--status-warning)'
                              }}>
                                {item.intent}
                              </span>
                            </div>
                          </td>

                          {/* Search Volume */}
                          <td style={{ padding: '0.75rem 0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            {item.searchVolume.toLocaleString()}
                          </td>

                          {/* KD % */}
                          <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              background: item.difficulty > 45 ? 'rgba(239, 68, 68, 0.15)' :
                                          item.difficulty > 30 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: item.difficulty > 45 ? 'var(--status-critical)' :
                                     item.difficulty > 30 ? 'var(--status-warning)' : 'var(--accent-primary)'
                            }}>
                              {item.difficulty}%
                            </span>
                          </td>

                          {/* CPC */}
                          <td style={{ padding: '0.75rem 0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                            ${item.cpc.toFixed(2)}
                          </td>

                          {/* Target Domain Rank (You) */}
                          <td style={{ 
                            padding: '0.75rem 0.85rem', 
                            textAlign: 'center',
                            background: 'rgba(16, 185, 129, 0.06)'
                          }}>
                            {item.targetRank !== null ? (
                              <span style={{
                                display: 'inline-block',
                                minWidth: '28px',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.78rem',
                                background: item.targetRank <= 3 ? 'rgba(16, 185, 129, 0.25)' :
                                            item.targetRank <= 10 ? 'rgba(6, 182, 212, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                color: item.targetRank <= 3 ? '#FFFFFF' :
                                       item.targetRank <= 10 ? 'var(--accent-cyan)' : 'var(--status-warning)',
                                border: item.targetRank <= 3 ? '1px solid var(--accent-primary)' : '1px solid transparent'
                              }}>
                                #{item.targetRank}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                            )}
                          </td>

                          {/* Competitor Ranks */}
                          {selectedCompetitors.map(comp => {
                            const r = item.competitorRanks[comp];
                            return (
                              <td key={comp} style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                                {r !== null && r !== undefined ? (
                                  <span style={{
                                    display: 'inline-block',
                                    minWidth: '26px',
                                    padding: '0.12rem 0.35rem',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem',
                                    background: r <= 3 ? 'rgba(16, 185, 129, 0.15)' :
                                                r <= 10 ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                    color: r <= 3 ? 'var(--accent-primary)' :
                                           r <= 10 ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                                  }}>
                                    #{r}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>—</span>
                                )}
                              </td>
                            );
                          })}

                          {/* Gap Status Badge */}
                          <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              background: item.gapStatus === 'missing' ? 'rgba(239, 68, 68, 0.12)' :
                                          item.gapStatus === 'weak' ? 'rgba(245, 158, 11, 0.12)' :
                                          item.gapStatus === 'strong' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(6, 182, 212, 0.12)',
                              color: item.gapStatus === 'missing' ? 'var(--status-critical)' :
                                     item.gapStatus === 'weak' ? 'var(--status-warning)' :
                                     item.gapStatus === 'strong' ? 'var(--accent-primary)' : 'var(--accent-cyan)',
                              border: item.gapStatus === 'missing' ? '1px solid rgba(239, 68, 68, 0.3)' :
                                      item.gapStatus === 'weak' ? '1px solid rgba(245, 158, 11, 0.3)' :
                                      item.gapStatus === 'strong' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(6, 182, 212, 0.3)'
                            }}>
                              {item.gapStatus}
                            </span>
                          </td>

                          {/* Opportunity Score Meter */}
                          <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                              <div style={{ width: '45px', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${item.opportunityScore}%`,
                                  height: '100%',
                                  background: item.opportunityScore > 75 ? 'linear-gradient(90deg, #10B981, #34D399)' :
                                              item.opportunityScore > 50 ? 'linear-gradient(90deg, #06B6D4, #38BDF8)' : 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                                }} />
                              </div>
                              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#FFFFFF' }}>
                                {item.opportunityScore}
                              </span>
                            </div>
                          </td>

                          {/* 1-Click Track Button */}
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            {isTracked ? (
                              <button
                                disabled
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  padding: '0.3rem 0.65rem',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  background: 'rgba(16, 185, 129, 0.1)',
                                  color: 'var(--accent-primary)',
                                  border: '1px solid rgba(16, 185, 129, 0.25)',
                                  cursor: 'default'
                                }}
                              >
                                <Check size={12} />
                                <span>Tracked</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleTrackKeyword(item)}
                                className="btn btn-secondary"
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '0.3rem 0.65rem',
                                  borderRadius: '6px'
                                }}
                                title="Add keyword to Phase 14 Rank Tracker"
                              >
                                <Plus size={12} color="var(--accent-primary)" />
                                <span>Track</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: VISUAL OVERLAP & VENN */}
      {activeSubtab === 'venn' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
              Keyword Footprint Intersection & Set Distribution
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Click any segment below to immediately filter the Content Gap Matrix table for targeted content creation or defensive SEO.
            </p>

            {/* Set Distribution Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem'
            }}>
              {vennSegments.map(seg => (
                <div
                  key={seg.id}
                  className="card card-interactive"
                  onClick={() => {
                    setStatusFilter(seg.gapStatus);
                    setActiveSubtab('matrix');
                  }}
                  style={{
                    padding: '1.25rem',
                    borderTop: `4px solid ${seg.color}`,
                    background: 'rgba(17, 24, 39, 0.9)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {seg.label}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: seg.color
                    }}>
                      {seg.percentage}%
                    </span>
                  </div>

                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', margin: '0.5rem 0', fontFamily: 'var(--font-mono)' }}>
                    {seg.count} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>keywords</span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {seg.description}
                  </p>

                  <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                      Click to inspect in Matrix →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: ARBITRAGE QUICK WINS */}
      {activeSubtab === 'arbitrage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Zap size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                Keyword Arbitrage & Quick Win Opportunities
              </h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              High search volume keywords where Keyword Difficulty is modest (KD &lt; 40%) and competitor rankings are fragile (#5–#18).
              Targeting these delivers maximum organic traffic ROI with minimal backlink investment.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem'
          }}>
            {gapData?.arbitrageOpportunities.map((opp) => {
              const isTracked = trackedKeywordsSet.has(opp.keyword.toLowerCase());

              return (
                <div key={opp.keyword} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Top Row: Keyword & Opportunity Meter */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                          {opp.keyword}
                        </h4>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem' }}>
                          <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>
                            {opp.intent}
                          </span>
                          <span className="badge badge-cyan" style={{ fontSize: '0.62rem' }}>
                            KD {opp.difficulty}%
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Opportunity
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                          {opp.opportunityScore}/100
                        </div>
                      </div>
                    </div>

                    {/* Metrics Pill Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                      margin: '1rem 0',
                      padding: '0.65rem',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      textAlign: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Volume</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                          {opp.searchVolume.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Est. CPC</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          ${opp.cpc.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Target Rank</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--status-critical)', fontFamily: 'var(--font-mono)' }}>
                          Unranked
                        </div>
                      </div>
                    </div>

                    {/* Recommended Action Playbook */}
                    <div style={{
                      padding: '0.75rem',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      fontSize: '0.78rem',
                      color: 'var(--text-primary)',
                      lineHeight: 1.4
                    }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Target size={13} /> Content Action Playbook:
                      </div>
                      {opp.recommendedAction}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {isTracked ? (
                      <button
                        disabled
                        className="btn btn-ghost"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', color: 'var(--accent-primary)', cursor: 'default' }}
                      >
                        <Check size={13} />
                        <span>Tracked</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleTrackKeyword({
                          keyword: opp.keyword,
                          searchVolume: opp.searchVolume,
                          difficulty: opp.difficulty,
                          cpc: opp.cpc,
                          intent: opp.intent,
                          targetRank: null,
                          competitorRanks: {},
                          gapStatus: 'missing',
                          opportunityScore: opp.opportunityScore,
                          recommendedAction: opp.recommendedAction
                        })}
                        className="btn btn-primary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}
                      >
                        <Plus size={13} />
                        <span>Add to Tracker</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 4: EXPORT & CONTENT STRATEGY */}
      {activeSubtab === 'export' && (
        <div className="card" style={{ padding: '1.75rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Export Keyword Gap Intelligence Report
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Export the multi-domain keyword matrix into structured CSV or JSON format for your editorial, SEO, and copywriting teams.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* CSV Export Card */}
            <div style={{
              padding: '1.25rem',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <FileSpreadsheet size={24} color="var(--accent-primary)" style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Spreadsheet CSV Format
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.4 }}>
                  Compatible with Microsoft Excel, Google Sheets, and Notion. Includes columns for keyword, volume, KD, intent, and per-competitor ranks.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (gapData) {
                    KeywordGapStore.exportToCsv(gapData.items, targetDomain, selectedCompetitors);
                  }
                }}
                className="btn btn-primary"
                style={{ marginTop: '1.25rem', width: '100%', fontSize: '0.825rem' }}
              >
                <Download size={14} />
                <span>Download Gap Matrix CSV</span>
              </button>
            </div>

            {/* JSON Export Card */}
            <div style={{
              padding: '1.25rem',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <Layers size={24} color="var(--accent-cyan)" style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Raw JSON Data Payload
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.4 }}>
                  Structured JSON format ideal for programmatic ingest, headless CMS pipelines, and automated reporting scripts.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (gapData) {
                    KeywordGapStore.exportToJson(gapData, targetDomain);
                  }
                }}
                className="btn btn-secondary"
                style={{ marginTop: '1.25rem', width: '100%', fontSize: '0.825rem' }}
              >
                <Download size={14} />
                <span>Download JSON Payload</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
