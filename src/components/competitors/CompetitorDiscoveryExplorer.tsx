import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Target,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Zap,
  Check,
  Copy,
  Globe,
  X,
  Swords
} from 'lucide-react';
import { CompetitorStore } from '../../competitors/competitorStore';
import { 
  CompetitorDomain, 
  CompetitorType, 
  DisplacementOpportunity 
} from '../../competitors/types';

interface CompetitorDiscoveryExplorerProps {
  onInspectSerp?: (keyword: string) => void;
  onNavigateToKeywords?: () => void;
}

export const CompetitorDiscoveryExplorer: React.FC<CompetitorDiscoveryExplorerProps> = ({
  onInspectSerp,
  onNavigateToKeywords
}) => {
  // Navigation subtabs
  const [activeSubtab, setActiveSubtab] = useState<'matrix' | 'map' | 'battle' | 'displacement'>('matrix');

  // Competitor list state
  const [competitors, setCompetitors] = useState<CompetitorDomain[]>(() => CompetitorStore.getCompetitors());
  const userMetrics = useMemo(() => CompetitorStore.getUserMetrics(), []);
  const displacementOpps = useMemo(() => CompetitorStore.getDisplacementOpportunities(), []);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<CompetitorType | 'all'>('all');
  const [selectedBattleCompId, setSelectedBattleCompId] = useState<string>(competitors[0]?.id || 'comp-allposters');

  // Modals & Interactive states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<CompetitorType>('direct');
  const [selectedMapComp, setSelectedMapComp] = useState<CompetitorDomain | null>(null);
  const [hasCopiedPlanId, setHasCopiedPlanId] = useState<string | null>(null);

  // Filtered competitors
  const filteredCompetitors = useMemo(() => {
    return competitors.filter(c => {
      if (selectedType !== 'all' && c.type !== selectedType) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return c.domain.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [competitors, selectedType, searchTerm]);

  // Active Head to Head comparison
  const headToHead = useMemo(() => {
    return CompetitorStore.getHeadToHeadComparison(selectedBattleCompId);
  }, [competitors, selectedBattleCompId]);

  // Handle Add Competitor
  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    const updated = CompetitorStore.addCompetitor({
      domain: newDomain.trim(),
      name: newName.trim(),
      type: newType
    });

    setCompetitors(updated);
    setNewDomain('');
    setNewName('');
    setIsAddModalOpen(false);
  };

  // Handle Delete Competitor
  const handleDeleteCompetitor = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this competitor from tracking?')) {
      const updated = CompetitorStore.deleteCompetitor(id);
      setCompetitors(updated);
      if (selectedBattleCompId === id && updated.length > 0) {
        setSelectedBattleCompId(updated[0].id);
      }
    }
  };

  // Handle Copy Plan
  const handleCopyPlan = (opp: DisplacementOpportunity) => {
    const text = `SERP Displacement Action Plan for "${opp.keyword}"\nCompetitor to Overtake: ${opp.competitorDomain} (Rank #${opp.competitorRank})\nYour Current Rank: #${opp.userRank}\nVulnerability: ${opp.vulnerabilityReason}\n\nAction Steps:\n${opp.actionPlan.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setHasCopiedPlanId(opp.id);
    setTimeout(() => setHasCopiedPlanId(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Top Banner Card */}
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
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.2)'
            }}>
              <Users size={22} color="#F59E0B" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Competitor Discovery & Intelligence
                </h2>
                <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                  Phase 16
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                  Target: {userMetrics.domain} (DR {userMetrics.domainRating})
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                Automated search competitor discovery, 2D market positioning quadrant, head-to-head keyword battles, and SERP displacement roadmap.
              </p>
            </div>
          </div>

          {/* Subtab Switcher & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '3px',
              gap: '3px'
            }}>
              <button
                onClick={() => setActiveSubtab('matrix')}
                className={`btn ${activeSubtab === 'matrix' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
              >
                <Layers size={14} />
                <span>Competitor Matrix</span>
              </button>
              <button
                onClick={() => setActiveSubtab('map')}
                className={`btn ${activeSubtab === 'map' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
              >
                <Target size={14} color="#06B6D4" />
                <span>Positioning Map</span>
              </button>
              <button
                onClick={() => setActiveSubtab('battle')}
                className={`btn ${activeSubtab === 'battle' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
              >
                <Swords size={14} color="#EF4444" />
                <span>Head-to-Head</span>
              </button>
              <button
                onClick={() => setActiveSubtab('displacement')}
                className={`btn ${activeSubtab === 'displacement' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
              >
                <Zap size={14} color="#10B981" />
                <span>Displacement Radar</span>
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            >
              <Plus size={14} />
              <span>Add Competitor</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: ORGANIC COMPETITORS MATRIX */}
      {/* ========================================================================= */}
      {activeSubtab === 'matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Discovery Callout Alert */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Sparkles size={20} color="#F59E0B" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Auto-Discovered {competitors.length} Organic Competitors in Your Niche
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Derived from ranking cross-sections in Google US search results for your 11 active tracked keywords.
                </div>
              </div>
            </div>

            {onNavigateToKeywords && (
              <button
                onClick={onNavigateToKeywords}
                className="btn btn-ghost"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                <span>View Tracked Keywords</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>

          {/* Filter Toolbar */}
          <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '220px' }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by domain name..."
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    width: '100%'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Type:</span>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {(['all', 'direct', 'marketplace', 'publisher'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedType(t)}
                      className={`badge ${selectedType === t ? 'badge-amber' : 'badge-subtle'}`}
                      style={{ cursor: 'pointer', border: 'none', fontSize: '0.72rem', textTransform: 'capitalize' }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Competitors Table */}
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Competitor Domain</th>
                  <th style={{ padding: '0.85rem 1rem', width: '100px' }}>Type</th>
                  <th style={{ padding: '0.85rem 1rem', width: '80px', textAlign: 'center' }}>DR</th>
                  <th style={{ padding: '0.85rem 1rem', width: '140px' }}>Overlap Score</th>
                  <th style={{ padding: '0.85rem 1rem', width: '130px', textAlign: 'right' }}>Common Keywords</th>
                  <th style={{ padding: '0.85rem 1rem', width: '140px', textAlign: 'right' }}>Monthly Traffic</th>
                  <th style={{ padding: '0.85rem 1rem', width: '120px', textAlign: 'center' }}>Competition</th>
                  <th style={{ padding: '0.85rem 1rem', width: '160px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompetitors.map((comp) => (
                  <tr
                    key={comp.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* Domain & Title */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: 'var(--bg-surface-elevated)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Globe size={14} color="var(--accent-cyan)" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {comp.name}
                          </div>
                          <a
                            href={`https://${comp.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <span className="font-mono">{comp.domain}</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${
                        comp.type === 'direct' ? 'badge-red' :
                        comp.type === 'marketplace' ? 'badge-purple' : 'badge-cyan'
                      }`} style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>
                        {comp.type}
                      </span>
                    </td>

                    {/* Domain Rating */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: comp.domainRating >= 80 ? 'var(--accent-primary)' : comp.domainRating >= 60 ? 'var(--accent-cyan)' : 'var(--status-warning)'
                      }}>
                        {comp.domainRating}
                      </span>
                    </td>

                    {/* Overlap Score */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', width: '36px', color: 'var(--text-primary)' }}>
                          {comp.overlapScore}%
                        </span>
                        <div style={{ flex: 1, height: '6px', background: 'var(--bg-canvas)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${comp.overlapScore}%`,
                              height: '100%',
                              background: comp.overlapScore > 75 ? 'var(--status-critical)' : comp.overlapScore > 50 ? 'var(--status-warning)' : 'var(--accent-primary)',
                              borderRadius: '3px'
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Common Keywords */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {comp.commonKeywordsCount} / 11
                    </td>

                    {/* Monthly Traffic */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      ~{comp.organicTrafficMonthly >= 1000000 
                        ? `${(comp.organicTrafficMonthly / 1000000).toFixed(1)}M` 
                        : `${Math.round(comp.organicTrafficMonthly / 1000)}k`}
                    </td>

                    {/* Competition Badge */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <span className={`badge ${
                        comp.serpCompetitionLevel === 'High' ? 'badge-red' :
                        comp.serpCompetitionLevel === 'Medium' ? 'badge-amber' : 'badge-emerald'
                      }`} style={{ fontSize: '0.7rem' }}>
                        {comp.serpCompetitionLevel}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <button
                          onClick={() => {
                            setSelectedBattleCompId(comp.id);
                            setActiveSubtab('battle');
                          }}
                          className="btn btn-ghost"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--accent-primary)' }}
                          title="Head-to-head comparison"
                        >
                          <Swords size={13} />
                          <span>Battle</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteCompetitor(comp.id, e)}
                          className="btn btn-ghost"
                          style={{ padding: '0.3rem 0.45rem', color: '#F43F5E' }}
                          title="Untrack competitor"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: COMPETITIVE POSITIONING MAP (2D SCATTER QUADRANT) */}
      {/* ========================================================================= */}
      {activeSubtab === 'map' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  2D Organic Search Positioning Quadrant
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Relative market footprint: Organic Keywords (X-axis) vs. Monthly Search Traffic (Y-axis). Bubble size indicates Domain Rating.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                  ★ You: {userMetrics.domain}
                </span>
              </div>
            </div>

            {/* 2D Canvas / SVG Scatter Visualizer */}
            <div style={{
              position: 'relative',
              height: '420px',
              background: 'linear-gradient(135deg, rgba(11, 15, 23, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              {/* Quadrant Divider Grid Lines */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', borderLeft: '1px dashed rgba(255, 255, 255, 0.12)', zIndex: 1 }} />
              <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', borderTop: '1px dashed rgba(255, 255, 255, 0.12)', zIndex: 1 }} />

              {/* Quadrant Watermark Labels */}
              <div style={{ position: 'absolute', top: '15px', right: '20px', fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.18)', textTransform: 'uppercase', letterSpacing: '0.08em', zIndex: 1 }}>
                Market Leaders
              </div>
              <div style={{ position: 'absolute', top: '15px', left: '20px', fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.18)', textTransform: 'uppercase', letterSpacing: '0.08em', zIndex: 1 }}>
                Established Authority
              </div>
              <div style={{ position: 'absolute', bottom: '15px', right: '20px', fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.18)', textTransform: 'uppercase', letterSpacing: '0.08em', zIndex: 1 }}>
                Niche Specialists
              </div>
              <div style={{ position: 'absolute', bottom: '15px', left: '20px', fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.18)', textTransform: 'uppercase', letterSpacing: '0.08em', zIndex: 1 }}>
                Emerging Rivals
              </div>

              {/* Axis Labels */}
              <div style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.72rem', color: 'var(--text-muted)', zIndex: 2 }}>
                Organic Keywords Footprint →
              </div>
              <div style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%) rotate(-90deg)', fontSize: '0.72rem', color: 'var(--text-muted)', zIndex: 2 }}>
                Monthly Traffic →
              </div>

              {/* Competitors Bubbles */}
              {competitors.map((comp) => {
                // Logarithmic mapping for visual balance
                const xPos = Math.min(88, Math.max(12, Math.round(15 + Math.log10(comp.totalKeywordsCount) * 14)));
                const yPos = Math.min(88, Math.max(12, Math.round(92 - Math.log10(comp.organicTrafficMonthly) * 12)));
                const radius = Math.round(comp.domainRating / 4);

                return (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedMapComp(comp)}
                    style={{
                      position: 'absolute',
                      left: `${xPos}%`,
                      top: `${yPos}%`,
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      zIndex: 10,
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: `${radius * 2}px`,
                      height: `${radius * 2}px`,
                      borderRadius: '50%',
                      background: comp.type === 'direct' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.4)',
                      border: comp.type === 'direct' ? '2px solid #EF4444' : '2px solid #06B6D4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 12px rgba(0, 0, 0, 0.5)'
                    }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#FFFFFF' }}>
                        {comp.domainRating}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginTop: '3px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      {comp.domain}
                    </span>
                  </div>
                );
              })}

              {/* USER DOMAIN PINPOINT */}
              <div style={{
                position: 'absolute',
                left: '28%',
                top: '68%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 20
              }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.35)',
                  border: '3px solid var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.8)',
                  animation: 'pulse 2s infinite'
                }}>
                  <Shield size={16} color="#FFFFFF" />
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  marginTop: '4px',
                  background: 'rgba(4, 47, 46, 0.9)',
                  border: '1px solid var(--accent-primary)',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap'
                }}>
                  ★ PostersCraft (You)
                </span>
              </div>
            </div>

            {/* Selected Bubble Details Panel */}
            {selectedMapComp && (
              <div style={{
                marginTop: '1.25rem',
                padding: '1rem',
                borderRadius: '8px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedMapComp.name} ({selectedMapComp.domain})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Quadrant: <strong>{selectedMapComp.quadrant}</strong> • DR: <strong>{selectedMapComp.domainRating}</strong> • Monthly Traffic: <strong>~{selectedMapComp.organicTrafficMonthly.toLocaleString()}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setSelectedBattleCompId(selectedMapComp.id);
                      setActiveSubtab('battle');
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                  >
                    <Swords size={13} />
                    <span>Battle Head-to-Head</span>
                  </button>
                  <button
                    onClick={() => setSelectedMapComp(null)}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.5rem' }}
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: HEAD-TO-HEAD BATTLE (USER VS COMPETITOR) */}
      {/* ========================================================================= */}
      {activeSubtab === 'battle' && headToHead && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Competitor Selector Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Swords size={18} color="#EF4444" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Select Competitor to Battle:
                </span>
                <select
                  value={selectedBattleCompId}
                  onChange={(e) => setSelectedBattleCompId(e.target.value)}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {competitors.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.domain}) — DR {c.domainRating}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                  You Lead on {headToHead.userRankAdvantageCount} Keywords
                </span>
                <span className="badge badge-red" style={{ fontSize: '0.75rem' }}>
                  Competitor Leads on {headToHead.competitorRankAdvantageCount} Keywords
                </span>
              </div>
            </div>
          </div>

          {/* Metric Confrontation Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Domain Authority (DR)
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>PostersCraft (You)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{headToHead.user.domainRating}</div>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>vs</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{headToHead.competitor.name}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{headToHead.competitor.domainRating}</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Estimated Monthly Traffic
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>PostersCraft</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>~18.5k</div>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>vs</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{headToHead.competitor.name}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ~{Math.round(headToHead.competitor.organicTrafficMonthly / 1000)}k
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Tracked Overlap Keywords
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    {headToHead.sharedKeywordsCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Direct head-to-head battles</div>
                </div>
                <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                  {headToHead.competitor.overlapScore}% Overlap
                </span>
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Referring Domains
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {headToHead.user.referringDomains}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your Backlink Profile</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {headToHead.competitor.referringDomains.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Competitor Ref Domains</div>
                </div>
              </div>
            </div>
          </div>

          {/* Keyword Face-off Table */}
          <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Direct Keyword Face-off: PostersCraft vs {headToHead.competitor.name}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Comparing active Google US search positions
              </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Keyword</th>
                  <th style={{ padding: '0.75rem 1rem', width: '110px', textAlign: 'right' }}>Volume</th>
                  <th style={{ padding: '0.75rem 1rem', width: '120px', textAlign: 'center' }}>Your Rank</th>
                  <th style={{ padding: '0.75rem 1rem', width: '140px', textAlign: 'center' }}>Competitor Rank</th>
                  <th style={{ padding: '0.75rem 1rem', width: '130px', textAlign: 'center' }}>Position Advantage</th>
                  <th style={{ padding: '0.75rem 1rem', width: '120px', textAlign: 'center' }}>SERP Inspect</th>
                </tr>
              </thead>
              <tbody>
                {headToHead.competitor.topOverlapKeywords.map((kw, kidx) => {
                  const userWins = kw.userRank < kw.competitorRank;
                  const tie = kw.userRank === kw.competitorRank;

                  return (
                    <tr key={kidx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{kw.keyword}</div>
                        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.2rem' }}>
                          {kw.serpFeatures.map(f => (
                            <span key={f} className="badge badge-subtle" style={{ fontSize: '0.62rem' }}>
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#FFFFFF' }}>
                        {kw.searchVolume.toLocaleString()}
                      </td>

                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: 800,
                          color: kw.userRank <= 3 ? 'var(--accent-primary)' : 'var(--text-primary)',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          #{kw.userRank}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: 800,
                          color: kw.competitorRank <= 3 ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          #{kw.competitorRank}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        {userWins ? (
                          <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                            ★ You Win (+{kw.competitorRank - kw.userRank})
                          </span>
                        ) : tie ? (
                          <span className="badge badge-subtle" style={{ fontSize: '0.72rem' }}>
                            Tie (#{kw.userRank})
                          </span>
                        ) : (
                          <span className="badge badge-red" style={{ fontSize: '0.72rem' }}>
                            Competitor (+{kw.userRank - kw.competitorRank})
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        {onInspectSerp && (
                          <button
                            onClick={() => onInspectSerp(kw.keyword)}
                            className="btn btn-ghost"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}
                            title="Inspect SERP"
                          >
                            <Search size={13} />
                            <span>SERP</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: SERP DISPLACEMENT OPPORTUNITIES */}
      {/* ========================================================================= */}
      {activeSubtab === 'displacement' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={20} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  SERP Displacement Opportunities
                </h3>
              </div>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Target keywords where competitors hold fragile rankings (#2–#7) with on-page or technical weaknesses that your site can overtake.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {displacementOpps.map((opp) => (
                <div
                  key={opp.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginBottom: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                        Opportunity Score: {opp.opportunityScore}/100
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        "{opp.keyword}"
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        ({opp.searchVolume.toLocaleString()} searches/mo • CPC ${opp.cpc.toFixed(2)})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {onInspectSerp && (
                        <button
                          onClick={() => onInspectSerp(opp.keyword)}
                          className="btn btn-ghost"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <Search size={13} />
                          <span>Inspect SERP</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleCopyPlan(opp)}
                        className="btn btn-primary"
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        {hasCopiedPlanId === opp.id ? <Check size={13} /> : <Copy size={13} />}
                        <span>{hasCopiedPlanId === opp.id ? 'Copied!' : 'Copy Plan'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Vulnerability Callout */}
                  <div style={{
                    padding: '0.75rem',
                    borderRadius: '6px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    marginBottom: '0.85rem',
                    fontSize: '0.825rem'
                  }}>
                    <strong style={{ color: '#EF4444' }}>Target: {opp.competitorDomain} (Rank #{opp.competitorRank})</strong> vs <strong style={{ color: 'var(--accent-primary)' }}>You (Rank #{opp.userRank})</strong>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>
                      {opp.vulnerabilityReason}
                    </p>
                  </div>

                  {/* Action Steps */}
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Displacement Playbook:
                    </span>
                    <ol style={{ margin: '0.4rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      {opp.actionPlan.map((step, sidx) => (
                        <li key={sidx} style={{ marginBottom: '0.25rem' }}>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD CUSTOM COMPETITOR */}
      {/* ========================================================================= */}
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
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '1.5rem', position: 'relative' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <Users size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Track New Organic Competitor
              </h3>
            </div>

            <form onSubmit={handleAddCompetitor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Competitor Domain *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. art.com, posterstore.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="input-text font-mono"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Brand / Commercial Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Art.com Gallery"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input-text"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Competitor Classification
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as CompetitorType)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  <option value="direct">Direct Commercial Rival</option>
                  <option value="marketplace">Marketplace / Aggregator (e.g. Etsy, Amazon)</option>
                  <option value="publisher">Content Publisher / Magazine</option>
                  <option value="indirect">Indirect Competitor</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Start Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
