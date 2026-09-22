import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Plus,
  Trash2,
  LineChart,
  Tag,
  Monitor,
  Smartphone,
  Filter,
  X,
  Target,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';
import { KeywordStore } from '../../keywords/keywordStore';
import { TrackedKeyword, SearchIntent, KeywordDevice } from '../../keywords/types';

export interface KeywordTrackerExplorerProps {
  onInspectSerp?: (keyword: string) => void;
}

export const KeywordTrackerExplorer: React.FC<KeywordTrackerExplorerProps> = ({ onInspectSerp }) => {
  const [keywords, setKeywords] = useState<TrackedKeyword[]>(() => KeywordStore.getKeywords());

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<KeywordDevice | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedIntent, setSelectedIntent] = useState<SearchIntent | 'all'>('all');

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [historyDrawerKeyword, setHistoryDrawerKeyword] = useState<TrackedKeyword | null>(null);

  // New Keyword Form
  const [newKeywordText, setNewKeywordText] = useState('');
  const [newTargetUrl, setNewTargetUrl] = useState('https://posterscraft.com');
  const [newVolume, setNewVolume] = useState<number>(5000);
  const [newRank, setNewRank] = useState<number>(8);
  const [newIntent, setNewIntent] = useState<SearchIntent>('Commercial');
  const [newTagsInput, setNewTagsInput] = useState('Product, High Priority');
  const [newDevice, setNewDevice] = useState<KeywordDevice>('desktop');

  // Available tags
  const availableTags = useMemo(() => KeywordStore.getAvailableTags(keywords), [keywords]);

  // Filtered keywords
  const filteredKeywords = useMemo(() => {
    return keywords.filter(k => {
      if (selectedDevice !== 'all' && k.device !== selectedDevice) return false;
      if (selectedTag !== 'all' && !k.tags.includes(selectedTag)) return false;
      if (selectedIntent !== 'all' && k.intent !== selectedIntent) return false;
      if (searchQuery.trim() && !k.keyword.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [keywords, selectedDevice, selectedTag, selectedIntent, searchQuery]);

  // Statistics Summary
  const stats = useMemo(() => KeywordStore.getStatsSummary(filteredKeywords), [filteredKeywords]);

  // Handle Add Keyword
  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordText.trim()) return;

    const tags = newTagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const updated = KeywordStore.addKeyword({
      keyword: newKeywordText.trim(),
      searchVolume: Number(newVolume) || 1000,
      cpc: 1.5,
      difficulty: 35,
      currentRank: Number(newRank) || 10,
      intent: newIntent,
      tags,
      targetUrl: newTargetUrl.trim(),
      device: newDevice
    });

    setKeywords(updated);
    setNewKeywordText('');
    setIsAddModalOpen(false);
  };

  // Handle Delete Keyword
  const handleDeleteKeyword = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to stop tracking this keyword?')) {
      const updated = KeywordStore.deleteKeyword(id);
      setKeywords(updated);
      if (historyDrawerKeyword?.id === id) {
        setHistoryDrawerKeyword(null);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Target size={22} color="var(--accent-primary)" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Keyword Tracking & Rank Intelligence
                </h2>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                  Live SERP Sync
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Track search engine ranking positions, SERP volatility, intent attribution, and historical rank trajectories.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
          >
            <Plus size={16} />
            <span>Add Keywords</span>
          </button>
        </div>
      </div>

      {/* 4 Executive Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {/* Total Tracked */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Tracked Keywords</span>
            <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Active</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            {stats.totalKeywords}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Avg Position: <strong style={{ color: 'var(--accent-primary)' }}>#{stats.avgPosition}</strong>
          </div>
        </div>

        {/* Top 3 & Top 10 */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #06B6D4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Top 3 Rankings</span>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
              {stats.totalKeywords > 0 ? `${Math.round((stats.inTop3 / stats.totalKeywords) * 100)}%` : '0%'}
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            {stats.inTop3} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}>keywords</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Top 10: <strong style={{ color: '#FFFFFF' }}>{stats.inTop10}</strong> keywords
          </div>
        </div>

        {/* Rank Movements */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Rank Movement</span>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
              <TrendingUp size={11} style={{ marginRight: '3px' }} /> Net Positive
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '-0.02em' }}>
              +{stats.improvedCount}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F43F5E' }}>
              -{stats.declinedCount}
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {stats.stableCount} positions unchanged
          </div>
        </div>

        {/* SERP Volatility */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>SERP Volatility</span>
            <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
              Score: {stats.volatilityScore}
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            {stats.volatilityScore < 3 ? 'Low' : stats.volatilityScore < 7 ? 'Moderate' : 'High'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Across all tracked keyword sets
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search tracked keywords..."
              className="input-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.2rem', fontSize: '0.85rem' }}
            />
          </div>

          {/* Filters Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Device Switcher */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-subtle)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}>
              <button
                onClick={() => setSelectedDevice('all')}
                style={{
                  background: selectedDevice === 'all' ? 'var(--accent-primary)' : 'transparent',
                  color: selectedDevice === 'all' ? '#042F2E' : 'var(--text-secondary)',
                  fontWeight: selectedDevice === 'all' ? 600 : 400,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                All
              </button>
              <button
                onClick={() => setSelectedDevice('desktop')}
                style={{
                  background: selectedDevice === 'desktop' ? 'var(--accent-primary)' : 'transparent',
                  color: selectedDevice === 'desktop' ? '#042F2E' : 'var(--text-secondary)',
                  fontWeight: selectedDevice === 'desktop' ? 600 : 400,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Monitor size={12} />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setSelectedDevice('mobile')}
                style={{
                  background: selectedDevice === 'mobile' ? 'var(--accent-primary)' : 'transparent',
                  color: selectedDevice === 'mobile' ? '#042F2E' : 'var(--text-secondary)',
                  fontWeight: selectedDevice === 'mobile' ? 600 : 400,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Smartphone size={12} />
                <span>Mobile</span>
              </button>
            </div>

            {/* Tag Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Tag size={14} color="var(--text-secondary)" />
              <select
                className="input-base"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: 'auto', background: 'var(--bg-card)' }}
              >
                <option value="all">All Tags</option>
                {availableTags.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Intent Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={14} color="var(--text-secondary)" />
              <select
                className="input-base"
                value={selectedIntent}
                onChange={(e) => setSelectedIntent(e.target.value as any)}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: 'auto', background: 'var(--bg-card)' }}
              >
                <option value="all">All Intents</option>
                <option value="Commercial">Commercial</option>
                <option value="Informational">Informational</option>
                <option value="Transactional">Transactional</option>
                <option value="Navigational">Navigational</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords Table Card */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Keyword</th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Intent</th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Search Volume</th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>CPC</th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'center' }}>Difficulty</th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Rank</th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'center' }}>Change</th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>SERP Features</th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'center' }}>History</th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'center' }}>SERP</th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeywords.map((k) => {
                const rankDelta = k.previousRank - k.currentRank;

                return (
                  <tr
                    key={k.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => setHistoryDrawerKeyword(k)}
                    className="table-row-hover"
                  >
                    {/* Keyword & Tags */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {k.keyword}
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                        {k.tags.map((t, idx) => (
                          <span key={idx} className="badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', background: 'rgba(255, 255, 255, 0.05)' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Intent Badge */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`badge ${
                        k.intent === 'Commercial' ? 'badge-emerald' :
                        k.intent === 'Informational' ? 'badge-cyan' :
                        k.intent === 'Transactional' ? 'badge-purple' : 'badge-amber'
                      }`} style={{ fontSize: '0.7rem' }}>
                        {k.intent}
                      </span>
                    </td>

                    {/* Volume */}
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600, color: '#FFFFFF' }}>
                      {k.searchVolume.toLocaleString()}
                    </td>

                    {/* CPC */}
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      ${k.cpc.toFixed(2)}
                    </td>

                    {/* Difficulty */}
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: k.difficulty <= 30 ? 'var(--accent-primary)' : k.difficulty <= 50 ? '#F59E0B' : '#F43F5E'
                        }}>
                          {k.difficulty}%
                        </span>
                      </div>
                    </td>

                    {/* Rank */}
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: k.currentRank <= 3 ? 'var(--accent-primary)' : k.currentRank <= 10 ? '#FFFFFF' : 'var(--text-secondary)'
                      }}>
                        #{k.currentRank}
                      </span>
                    </td>

                    {/* Change */}
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                      {rankDelta > 0 && (
                        <span className="badge badge-emerald" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <TrendingUp size={11} /> +{rankDelta}
                        </span>
                      )}
                      {rankDelta < 0 && (
                        <span className="badge badge-rose" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <TrendingDown size={11} /> {rankDelta}
                        </span>
                      )}
                      {rankDelta === 0 && (
                        <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Minus size={11} /> 0
                        </span>
                      )}
                    </td>

                    {/* SERP Features */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {k.serpFeatures.slice(0, 2).map((sf, idx) => (
                          <span key={idx} className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                            {sf}
                          </span>
                        ))}
                        {k.serpFeatures.length > 2 && (
                          <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255, 255, 255, 0.05)' }}>
                            +{k.serpFeatures.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* History Button */}
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHistoryDrawerKeyword(k);
                        }}
                        className="btn btn-ghost"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="View 14-day Rank Trajectory"
                      >
                        <LineChart size={14} color="var(--accent-primary)" />
                      </button>
                    </td>

                    {/* Inspect SERP Button */}
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onInspectSerp) onInspectSerp(k.keyword);
                        }}
                        className="btn btn-ghost"
                        style={{ padding: '0.25rem 0.45rem', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}
                        title="Inspect Live SERP & Competitors"
                      >
                        <Search size={14} />
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                      <button
                        onClick={(e) => handleDeleteKeyword(k.id, e)}
                        className="btn btn-ghost"
                        style={{ padding: '0.25rem 0.45rem', color: '#F43F5E' }}
                        title="Delete keyword"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rank History Modal / Slide-over Drawer */}
      {historyDrawerKeyword && (
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
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '640px', width: '100%', padding: '1.75rem', position: 'relative' }}>
            <button
              onClick={() => setHistoryDrawerKeyword(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <BarChart3 size={22} color="var(--accent-primary)" />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {historyDrawerKeyword.keyword}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  14-Day Search Engine Rank Trajectory ({historyDrawerKeyword.device})
                </span>
              </div>
            </div>

            {/* Trajectory Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Current Rank</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  #{historyDrawerKeyword.currentRank}
                </div>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Best Rank</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#06B6D4' }}>
                  #{historyDrawerKeyword.bestRank}
                </div>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Initial Rank</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                  #{historyDrawerKeyword.initialRank}
                </div>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Overall Gain</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  +{historyDrawerKeyword.initialRank - historyDrawerKeyword.currentRank}
                </div>
              </div>
            </div>

            {/* Interactive Rank Chart */}
            <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <span>Rank #1 (Top)</span>
                <span>Rank #15+ (Lower)</span>
              </div>

              {/* Step Visualization Bar Graph (Inverted so rank 1 is tallest) */}
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '110px', gap: '6px' }}>
                {historyDrawerKeyword.history.map((pt, idx) => {
                  // Invert scale: rank 1 = 100px, rank 20 = 15px
                  const barHeight = Math.max(12, 100 - (pt.rank - 1) * 6);

                  return (
                    <div
                      key={idx}
                      title={`${pt.date}: Rank #${pt.rank}`}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        height: '100%'
                      }}
                    >
                      <span style={{ fontSize: '0.65rem', color: pt.rank <= 3 ? 'var(--accent-primary)' : 'var(--text-secondary)', marginBottom: '4px' }}>
                        #{pt.rank}
                      </span>
                      <div
                        style={{
                          width: '100%',
                          height: `${barHeight}px`,
                          borderRadius: '3px 3px 0 0',
                          background: pt.rank <= 3
                            ? 'linear-gradient(180deg, var(--accent-primary) 0%, rgba(16, 185, 129, 0.4) 100%)'
                            : 'linear-gradient(180deg, #06B6D4 0%, rgba(6, 182, 212, 0.4) 100%)'
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <span>{historyDrawerKeyword.history[0]?.date}</span>
                <span>{historyDrawerKeyword.history[historyDrawerKeyword.history.length - 1]?.date}</span>
              </div>
            </div>

            {/* Target URL */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.02)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target URL:</span>
              <a
                href={historyDrawerKeyword.targetUrl}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
              >
                <span>{historyDrawerKeyword.targetUrl}</span>
                <ArrowUpRight size={13} />
              </a>
            </div>

            {onInspectSerp && (
              <button
                onClick={() => {
                  onInspectSerp(historyDrawerKeyword.keyword);
                  setHistoryDrawerKeyword(null);
                }}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.85rem', fontSize: '0.85rem', padding: '0.5rem', justifyContent: 'center' }}
              >
                <Search size={15} />
                <span>Inspect Live SERP for "{historyDrawerKeyword.keyword}"</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Keyword Modal */}
      {isAddModalOpen && (
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
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '1.75rem', position: 'relative' }}>
            <button
              onClick={() => setIsAddModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
              Add Keyword to Track
            </h3>

            <form onSubmit={handleAddKeyword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Target Keyword
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. vintage wall posters"
                  className="input-base"
                  value={newKeywordText}
                  onChange={(e) => setNewKeywordText(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Target URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://posterscraft.com/category/vintage"
                  className="input-base"
                  value={newTargetUrl}
                  onChange={(e) => setNewTargetUrl(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Monthly Search Volume
                  </label>
                  <input
                    type="number"
                    className="input-base"
                    value={newVolume}
                    onChange={(e) => setNewVolume(parseInt(e.target.value, 10))}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Current SERP Rank
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    className="input-base"
                    value={newRank}
                    onChange={(e) => setNewRank(parseInt(e.target.value, 10))}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Search Intent
                  </label>
                  <select
                    className="input-base"
                    value={newIntent}
                    onChange={(e) => setNewIntent(e.target.value as SearchIntent)}
                    style={{ width: '100%', fontSize: '0.85rem', background: 'var(--bg-card)' }}
                  >
                    <option value="Commercial">Commercial</option>
                    <option value="Informational">Informational</option>
                    <option value="Transactional">Transactional</option>
                    <option value="Navigational">Navigational</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Device Tracking
                  </label>
                  <select
                    className="input-base"
                    value={newDevice}
                    onChange={(e) => setNewDevice(e.target.value as KeywordDevice)}
                    style={{ width: '100%', fontSize: '0.85rem', background: 'var(--bg-card)' }}
                  >
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Product, High Priority, Campaign 2026"
                  className="input-base"
                  value={newTagsInput}
                  onChange={(e) => setNewTagsInput(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
                >
                  <Plus size={16} />
                  <span>Start Tracking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
