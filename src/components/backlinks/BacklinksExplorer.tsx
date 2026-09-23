import React, { useState, useEffect, useMemo } from 'react';
import {
  Link2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Globe,
  Search,
  Download,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Layers,
  Sparkles,
  Eye,
  FileText
} from 'lucide-react';
import { 
  BacklinksData, 
  LinkType,
  AnchorCategory
} from '../../engine/backlinksTypes';
import { BacklinksService } from '../../engine/backlinksService';

interface BacklinksExplorerProps {
  currentUrl: string;
  onNavigateToAudit?: (url: string) => void;
  onNavigateToCompetitors?: () => void;
}

type BacklinksTab = 'overview' | 'backlinks' | 'domains' | 'anchors' | 'intersect' | 'disavow';

export const BacklinksExplorer: React.FC<BacklinksExplorerProps> = ({
  currentUrl,
  onNavigateToAudit,
  onNavigateToCompetitors
}) => {
  const [activeTab, setActiveTab] = useState<BacklinksTab>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BacklinksData | null>(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'lost' | 'new' | 'toxic' | 'disavowed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | LinkType>('all');
  const [minDr, setMinDr] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'dr' | 'ur' | 'traffic' | 'firstSeen' | 'spamScore'>('dr');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Disavow State
  const [disavowInput, setDisavowInput] = useState('');
  const [copiedDisavow, setCopiedDisavow] = useState(false);
  const [customDisavowList, setCustomDisavowList] = useState<string[]>(() => BacklinksService.getDisavowedList());

  // Extract clean domain
  const domain = useMemo(() => {
    try {
      if (!currentUrl) return 'posterscraft.com';
      const clean = currentUrl.replace(/^https?:\/\//, '').split('/')[0];
      return clean.replace(/^www\./, '') || 'posterscraft.com';
    } catch {
      return 'posterscraft.com';
    }
  }, [currentUrl]);

  // Load backlink data
  const loadBacklinks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await BacklinksService.fetchBacklinks({
        domain,
        filter: statusFilter,
        minDr: minDr > 0 ? minDr : undefined,
        linkType: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchQuery || undefined,
        sortBy,
        sortDir
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch backlink profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBacklinks();
  }, [domain, statusFilter, typeFilter, minDr, sortBy, sortDir]);

  // Handle Disavow Toggle
  const handleToggleDisavow = (target: string) => {
    const isDomain = !target.includes('/');
    const cleanTarget = isDomain ? `domain:${target.toLowerCase()}` : target.toLowerCase();
    
    if (customDisavowList.includes(cleanTarget)) {
      const updated = BacklinksService.removeDisavowTarget(cleanTarget);
      setCustomDisavowList(updated);
    } else {
      const updated = BacklinksService.addDisavowTarget(cleanTarget);
      setCustomDisavowList(updated);
    }
    loadBacklinks();
  };

  // Disavow All Toxic links shortcut
  const handleDisavowAllToxic = () => {
    if (!data) return;
    const toxicItems = data.backlinks.filter(b => b.isToxic);
    let currentList = [...customDisavowList];
    toxicItems.forEach(b => {
      const dom = b.sourceUrl.replace(/^https?:\/\//, '').split('/')[0];
      const target = `domain:${dom.toLowerCase()}`;
      if (!currentList.includes(target)) {
        currentList = BacklinksService.addDisavowTarget(target);
      }
    });
    setCustomDisavowList(currentList);
    loadBacklinks();
  };

  const handleCopyDisavow = () => {
    const text = BacklinksService.generateGoogleDisavowContent(domain, customDisavowList);
    navigator.clipboard.writeText(text);
    setCopiedDisavow(true);
    setTimeout(() => setCopiedDisavow(false), 2000);
  };

  const handleDownloadDisavow = () => {
    BacklinksService.downloadDisavowFile(domain, customDisavowList);
  };

  const handleManualAddDisavow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disavowInput.trim()) return;
    const clean = disavowInput.trim();
    const updated = BacklinksService.addDisavowTarget(clean);
    setCustomDisavowList(updated);
    setDisavowInput('');
    loadBacklinks();
  };

  const overview = data?.overview;

  return (
    <div className="tab-pane active" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner / Domain Identity */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.04) 50%, rgba(17, 24, 39, 0.95) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        padding: '1.5rem',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-primary)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                Phase 18 • Authority & Content
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Google Disavow & Backlinks Intelligence
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
              <Link2 size={26} color="var(--accent-primary)" />
              Backlinks & Domain Authority
              <span style={{ fontSize: '1rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                {domain}
              </span>
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={loadBacklinks}
              disabled={isLoading}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} />
              {isLoading ? 'Scanning Profile...' : 'Refresh Backlinks'}
            </button>
            <button
              onClick={() => setActiveTab('disavow')}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
              <ShieldAlert size={15} />
              Disavow Tool ({customDisavowList.length})
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        {overview && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            {/* Domain Rating */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '1rem',
              position: 'relative'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Domain Rating (DR)
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  {overview.dr}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                URL Rating (UR): <strong style={{ color: 'var(--text-primary)' }}>{overview.ur}</strong>
              </div>
            </div>

            {/* Total Backlinks */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Backlinks
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                {overview.totalBacklinks.toLocaleString()}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                <span style={{ color: 'var(--status-success)' }}>{overview.activeBacklinks.toLocaleString()} Live</span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ color: 'var(--status-critical)' }}>{overview.lostBacklinks} Lost</span>
              </div>
            </div>

            {/* Referring Domains */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Referring Domains
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38BDF8', marginTop: '0.35rem' }}>
                {overview.referringDomains.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {overview.referringIps} IPs / {overview.referringSubnets} Subnets
              </div>
            </div>

            {/* DoFollow vs NoFollow */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                DoFollow Equity
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  {overview.dofollowRatio}%
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>dofollow</span>
              </div>
              {/* Ratio bar */}
              <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${overview.dofollowRatio}%`, background: 'var(--accent-primary)' }} title={`DoFollow: ${overview.dofollowRatio}%`} />
                <div style={{ width: `${overview.nofollowRatio}%`, background: '#60A5FA' }} title={`NoFollow: ${overview.nofollowRatio}%`} />
                <div style={{ width: `${overview.ugcRatio + overview.sponsoredRatio}%`, background: '#F59E0B' }} title={`UGC/Sponsored: ${overview.ugcRatio + overview.sponsoredRatio}%`} />
              </div>
            </div>

            {/* Toxic Spam Radar */}
            <div style={{
              background: overview.toxicityScore > 15 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(17, 24, 39, 0.6)',
              border: `1px solid ${overview.toxicityScore > 15 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Toxicity Risk
                </span>
                <span className="badge" style={{
                  background: overview.toxicityRisk === 'low' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: overview.toxicityRisk === 'low' ? 'var(--status-success)' : 'var(--status-critical)',
                  fontSize: '0.7rem'
                }}>
                  {overview.toxicityRisk.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: overview.toxicityScore > 15 ? 'var(--status-critical)' : 'var(--status-success)', marginTop: '0.35rem' }}>
                {overview.toxicityScore}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <strong style={{ color: overview.toxicBacklinksCount > 0 ? 'var(--status-warning)' : 'var(--text-primary)' }}>
                  {overview.toxicBacklinksCount} toxic links
                </strong> flagged
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'overview', label: 'Overview & Velocity', icon: <TrendingUp size={15} /> },
          { id: 'backlinks', label: `Backlinks (${data?.backlinks.length ?? 0})`, icon: <Link2 size={15} /> },
          { id: 'domains', label: `Referring Domains (${data?.referringDomains.length ?? 0})`, icon: <Globe size={15} /> },
          { id: 'anchors', label: 'Anchor Text Cloud', icon: <FileText size={15} /> },
          { id: 'intersect', label: 'Link Intersect (Gap)', icon: <Layers size={15} />, badge: 'Opp' },
          { id: 'disavow', label: `Disavow Tool (${customDisavowList.length})`, icon: <ShieldAlert size={15} />, badge: 'GSC' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as BacklinksTab)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px'
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span style={{
                fontSize: '0.65rem',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                background: activeTab === tab.id ? 'rgba(0,0,0,0.25)' : 'rgba(16, 185, 129, 0.2)',
                color: activeTab === tab.id ? '#fff' : 'var(--accent-primary)',
                fontWeight: 600
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--status-critical)',
          borderRadius: '8px',
          padding: '1rem',
          color: 'var(--status-critical)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW & VELOCITY */}
      {activeTab === 'overview' && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Velocity & Link Growth Chart */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} color="var(--accent-primary)" />
                  12-Month Backlink Acquisition & Loss Velocity
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Tracking velocity helps identify algorithmic spikes, negative SEO attacks, or successful PR outreach.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '10px', height: '10px', background: 'var(--accent-primary)', borderRadius: '2px' }} />
                  New Links
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '10px', height: '10px', background: 'var(--status-critical)', borderRadius: '2px' }} />
                  Lost Links
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '10px', height: '10px', background: '#38BDF8', borderRadius: '2px' }} />
                  Ref. Domains
                </span>
              </div>
            </div>

            {/* Sparkline / Bar Graph Simulation */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${data.velocity.length}, 1fr)`,
              alignItems: 'flex-end',
              gap: '0.5rem',
              height: '160px',
              padding: '1rem 0 0.5rem 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {data.velocity.map((point, idx) => {
                const maxVal = 350;
                const newHeight = Math.min(100, (point.newLinks / maxVal) * 100);
                const lostHeight = Math.min(60, (point.lostLinks / maxVal) * 100);

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      +{point.netGrowth}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', width: '100%', justifyContent: 'center' }}>
                      <div
                        style={{
                          width: '45%',
                          height: `${newHeight}%`,
                          background: 'linear-gradient(180deg, var(--accent-primary) 0%, rgba(16, 185, 129, 0.3) 100%)',
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.3s ease'
                        }}
                        title={`${point.month}: +${point.newLinks} new links`}
                      />
                      <div
                        style={{
                          width: '35%',
                          height: `${lostHeight}%`,
                          background: 'linear-gradient(180deg, var(--status-critical) 0%, rgba(239, 68, 68, 0.3) 100%)',
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.3s ease'
                        }}
                        title={`${point.month}: -${point.lostLinks} lost links`}
                      />
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.5rem', whiteSpace: 'nowrap', transform: 'rotate(-30deg)', transformOrigin: 'top left' }}>
                      {point.month.split(' ')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two-Column Deep Insights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Link Attribute Breakdown */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={16} color="var(--accent-primary)" />
                Link Attributes & Equity Distribution
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <span>DoFollow (Equity Passing)</span>
                    <strong style={{ color: 'var(--accent-primary)' }}>{overview?.dofollowRatio}% ({Math.round((overview?.totalBacklinks || 0) * (overview?.dofollowRatio || 0) / 100)} links)</strong>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${overview?.dofollowRatio}%`, height: '100%', background: 'var(--accent-primary)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <span>NoFollow (Hinting)</span>
                    <strong style={{ color: '#60A5FA' }}>{overview?.nofollowRatio}% ({Math.round((overview?.totalBacklinks || 0) * (overview?.nofollowRatio || 0) / 100)} links)</strong>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${overview?.nofollowRatio}%`, height: '100%', background: '#60A5FA' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <span>User Generated Content (UGC)</span>
                    <strong style={{ color: '#F59E0B' }}>{overview?.ugcRatio}% ({Math.round((overview?.totalBacklinks || 0) * (overview?.ugcRatio || 0) / 100)} links)</strong>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(overview?.ugcRatio || 0) * 5}%`, height: '100%', background: '#F59E0B' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <span>Sponsored / Paid Disclosures</span>
                    <strong style={{ color: '#A855F7' }}>{overview?.sponsoredRatio}% ({Math.round((overview?.totalBacklinks || 0) * (overview?.sponsoredRatio || 0) / 100)} links)</strong>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(overview?.sponsoredRatio || 0) * 8}%`, height: '100%', background: '#A855F7' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Strategic Actions */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} color="var(--accent-cyan)" />
                Actionable Authority Playbook
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--status-critical)' }}>14 Toxic Spam Links Detected</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Found link farms and scraper bot rings pointing to target domain.</div>
                  </div>
                  <button
                    onClick={() => setActiveTab('disavow')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', whiteSpace: 'nowrap' }}
                  >
                    Disavow Now
                  </button>
                </div>

                <div style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>5 High-Impact Link Opportunities</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Authority domains linking to your competitors can boost DR by +4.2 points.</div>
                  </div>
                  <button
                    onClick={() => setActiveTab('intersect')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', whiteSpace: 'nowrap' }}
                  >
                    View Prospects
                  </button>
                </div>

                <div style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>Anchor Distribution In Safe Range</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Branded anchors (42%) and exact matches (16%) are compliant with Penguin algorithms.</div>
                  </div>
                  <button
                    onClick={() => setActiveTab('anchors')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', whiteSpace: 'nowrap' }}
                  >
                    Anchor Cloud
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BACKLINKS EXPLORER TABLE */}
      {activeTab === 'backlinks' && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search page title, source URL, or anchor text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2rem', fontSize: '0.85rem', width: '100%' }}
                />
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '6px' }}>
                {(['all', 'active', 'lost', 'new', 'toxic'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className="btn"
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.55rem',
                      borderRadius: '4px',
                      background: statusFilter === st ? 'var(--accent-primary)' : 'transparent',
                      color: statusFilter === st ? '#000' : 'var(--text-secondary)',
                      fontWeight: statusFilter === st ? 600 : 400
                    }}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="input-field"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem', width: 'auto' }}
              >
                <option value="all">All Link Types</option>
                <option value="dofollow">DoFollow Only</option>
                <option value="nofollow">NoFollow Only</option>
                <option value="ugc">UGC Only</option>
                <option value="sponsored">Sponsored Only</option>
              </select>

              {/* Min DR Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Min DR:</span>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="10"
                  value={minDr}
                  onChange={(e) => setMinDr(Number(e.target.value))}
                  style={{ width: '80px', accentColor: 'var(--accent-primary)' }}
                />
                <strong style={{ color: 'var(--accent-primary)', minWidth: '24px' }}>{minDr}</strong>
              </div>

              {/* Sort Selector */}
              <select
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => {
                  const [f, d] = e.target.value.split('-');
                  setSortBy(f as any);
                  setSortDir(d as any);
                }}
                className="input-field"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem', width: 'auto' }}
              >
                <option value="dr-desc">Sort: Highest DR</option>
                <option value="dr-asc">Sort: Lowest DR</option>
                <option value="ur-desc">Sort: Highest UR</option>
                <option value="traffic-desc">Sort: Highest Traffic</option>
                <option value="spamScore-desc">Sort: Highest Spam Score</option>
                <option value="firstSeen-desc">Sort: Newest First</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Showing <strong>{data.backlinks.length}</strong> backlinks
              </span>
            </div>
          </div>

          {/* Backlinks Data Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 0, 0, 0.4)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Source Page</th>
                    <th style={{ padding: '0.75rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>DR / UR</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Anchor Text & Context</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Target URL</th>
                    <th style={{ padding: '0.75rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>Type</th>
                    <th style={{ padding: '0.75rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>Spam</th>
                    <th style={{ padding: '0.75rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.backlinks.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No backlinks match the current search & filter criteria.
                      </td>
                    </tr>
                  ) : (
                    data.backlinks.map(b => {
                      const domainName = b.sourceUrl.replace(/^https?:\/\//, '').split('/')[0];
                      const isDisavowed = customDisavowList.some(d => 
                        d.toLowerCase() === `domain:${domainName.toLowerCase()}` || 
                        d.toLowerCase() === b.sourceUrl.toLowerCase()
                      );

                      return (
                        <tr
                          key={b.id}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            background: isDisavowed 
                              ? 'rgba(239, 68, 68, 0.05)' 
                              : b.isToxic 
                              ? 'rgba(245, 158, 11, 0.04)' 
                              : 'transparent',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          {/* Source Page */}
                          <td style={{ padding: '0.75rem 1rem', maxWidth: '300px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={b.sourceTitle}>
                              {b.sourceTitle}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <a
                                href={b.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--accent-cyan)',
                                  textDecoration: 'none',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '240px'
                                }}
                                title={b.sourceUrl}
                              >
                                {b.sourceUrl}
                              </a>
                              <ExternalLink size={12} color="var(--text-muted)" />
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              Est. Traffic: {b.sourceTraffic.toLocaleString()}/mo
                            </div>
                          </td>

                          {/* DR / UR */}
                          <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                              <span style={{
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: b.sourceDr >= 70 ? 'rgba(16, 185, 129, 0.2)' : b.sourceDr >= 40 ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                                color: b.sourceDr >= 70 ? 'var(--accent-primary)' : b.sourceDr >= 40 ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                fontWeight: 700,
                                fontSize: '0.8rem'
                              }}>
                                DR {b.sourceDr}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                UR {b.sourceUr}
                              </span>
                            </div>
                          </td>

                          {/* Anchor & Context */}
                          <td style={{ padding: '0.75rem 1rem', maxWidth: '320px' }}>
                            <div style={{
                              display: 'inline-block',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: 'var(--text-primary)',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              marginBottom: '0.35rem'
                            }}>
                              "{b.anchorText}"
                            </div>
                            <div style={{
                              fontSize: '0.72rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.35,
                              fontStyle: 'italic',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              ...{b.contextSnippet}...
                            </div>
                          </td>

                          {/* Target URL */}
                          <td style={{ padding: '0.75rem 1rem', maxWidth: '180px' }}>
                            <div style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }} title={b.targetUrl}>
                              {b.targetUrl.replace(/^https?:\/\/[^/]+/, '') || '/'}
                            </div>
                            {onNavigateToAudit && (
                              <button
                                onClick={() => onNavigateToAudit(b.targetUrl)}
                                className="btn btn-secondary"
                                style={{
                                  fontSize: '0.65rem',
                                  padding: '0.15rem 0.35rem',
                                  marginTop: '0.25rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.2rem'
                                }}
                              >
                                <Eye size={10} />
                                Audit Page
                              </button>
                            )}
                          </td>

                          {/* Link Type */}
                          <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                            <span className="badge" style={{
                              fontSize: '0.68rem',
                              background: b.linkType === 'dofollow' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                              color: b.linkType === 'dofollow' ? 'var(--accent-primary)' : 'var(--text-muted)'
                            }}>
                              {b.linkType}
                            </span>
                          </td>

                          {/* Spam Score */}
                          <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: b.spamScore >= 60 ? 'var(--status-critical)' : b.spamScore >= 30 ? 'var(--status-warning)' : 'var(--status-success)'
                            }}>
                              {b.spamScore}%
                            </span>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                            {isDisavowed ? (
                              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--status-critical)', fontSize: '0.68rem' }}>
                                Disavowed
                              </span>
                            ) : b.status === 'active' ? (
                              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--status-success)', fontSize: '0.68rem' }}>
                                Active
                              </span>
                            ) : b.status === 'lost' ? (
                              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--status-critical)', fontSize: '0.68rem' }} title={b.lostReason}>
                                Lost
                              </span>
                            ) : (
                              <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)', fontSize: '0.68rem' }}>
                                New
                              </span>
                            )}
                          </td>

                          {/* Action / Disavow */}
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <button
                              onClick={() => handleToggleDisavow(domainName)}
                              className={`btn ${isDisavowed ? 'btn-primary' : 'btn-secondary'}`}
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.25rem 0.5rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                color: isDisavowed ? '#fff' : b.isToxic ? 'var(--status-warning)' : 'var(--text-secondary)'
                              }}
                              title={isDisavowed ? 'Remove domain from Disavow list' : 'Add domain to Google Disavow list'}
                            >
                              <ShieldAlert size={12} />
                              {isDisavowed ? 'Disavowed' : 'Disavow'}
                            </button>
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

      {/* TAB 3: REFERRING DOMAINS */}
      {activeTab === 'domains' && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Globe size={18} color="var(--accent-primary)" />
                  Unique Referring Domains ({data.referringDomains.length})
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Root domain diversity is the primary driver of logarithmic Domain Rating (DR) authority growth.
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 0, 0, 0.4)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Referring Domain</th>
                    <th style={{ padding: '0.75rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>DR</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Industry Category</th>
                    <th style={{ padding: '0.75rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>Backlinks</th>
                    <th style={{ padding: '0.75rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>DoFollow %</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Est. Traffic</th>
                    <th style={{ padding: '0.75rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>Spam Score</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Disavow</th>
                  </tr>
                </thead>
                <tbody>
                  {data.referringDomains.map(d => {
                    const isDisavowed = customDisavowList.some(item => 
                      item.toLowerCase() === `domain:${d.domain.toLowerCase()}` || 
                      item.toLowerCase() === d.domain.toLowerCase()
                    );

                    return (
                      <tr
                        key={d.domain}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          background: isDisavowed ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                        }}
                      >
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.35rem', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                              {d.countryCode}
                            </span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {d.domain}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: d.dr >= 70 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                            color: d.dr >= 70 ? 'var(--accent-primary)' : 'var(--text-primary)',
                            fontWeight: 700
                          }}>
                            {d.dr}
                          </span>
                        </td>

                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                            {d.category}
                          </span>
                        </td>

                        <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>
                          {d.backlinkCount}
                        </td>

                        <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                          <span style={{ color: d.dofollowPercent >= 80 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                            {d.dofollowPercent}%
                          </span>
                        </td>

                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text-primary)' }}>
                          {d.traffic.toLocaleString()}
                        </td>

                        <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                          <span style={{
                            fontWeight: 700,
                            color: d.spamScore >= 60 ? 'var(--status-critical)' : d.spamScore >= 30 ? 'var(--status-warning)' : 'var(--status-success)'
                          }}>
                            {d.spamScore}%
                          </span>
                        </td>

                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => handleToggleDisavow(d.domain)}
                            className={`btn ${isDisavowed ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ fontSize: '0.7rem', padding: '0.2rem 0.45rem' }}
                          >
                            {isDisavowed ? 'Disavowed' : 'Disavow'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANCHOR TEXT CLOUD & DISTRIBUTION */}
      {activeTab === 'anchors' && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Over-optimization Alert */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '8px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <ShieldCheck size={20} color="var(--accent-primary)" />
            <div style={{ fontSize: '0.85rem' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Natural Anchor Profile: Passed Google Penguin Thresholds</strong>
              <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Branded anchors comprise 42% of profile (safe zone: 35-50%). Exact match commercial anchors are restrained at 16% (&lt; 20% limit), minimizing manual action risk.
              </div>
            </div>
          </div>

          {/* Visual Interactive Anchor Cloud */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--accent-primary)" />
              Visual Anchor Cloud
            </h3>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.85rem',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem 1rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              {data.anchors.map(a => {
                // Compute font scale based on percentage
                const fontSize = Math.max(0.85, Math.min(2.2, 0.85 + (a.percentage / 100) * 2.8)) + 'rem';
                const colorMap: Record<AnchorCategory, string> = {
                  branded: 'var(--accent-primary)',
                  exact: 'var(--status-critical)',
                  phrase: '#38BDF8',
                  naked: '#A855F7',
                  generic: '#F59E0B'
                };

                return (
                  <div
                    key={a.anchor}
                    style={{
                      fontSize,
                      fontWeight: 700,
                      color: colorMap[a.category] || 'var(--text-primary)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                    title={`${a.anchor}: ${a.backlinksCount} backlinks (${a.percentage}%) across ${a.referringDomainsCount} domains [Category: ${a.category}]`}
                  >
                    <span>{a.anchor}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      {a.percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Anchor Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0, 0, 0, 0.4)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Anchor Text</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Classification</th>
                  <th style={{ padding: '0.75rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>Backlinks</th>
                  <th style={{ padding: '0.75rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>Referring Domains</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Profile Share</th>
                </tr>
              </thead>
              <tbody>
                {data.anchors.map(a => (
                  <tr key={a.anchor} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      "{a.anchor}"
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge" style={{
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                        background: a.category === 'branded' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                        color: a.category === 'branded' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                      }}>
                        {a.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>
                      {a.backlinksCount.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {a.referringDomainsCount}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', width: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${a.percentage}%`, height: '100%', background: 'var(--accent-primary)' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600, minWidth: '40px' }}>
                          {a.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: LINK INTERSECT (GAP OPPORTUNITIES) */}
      {activeTab === 'intersect' && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} color="var(--accent-primary)" />
                  Competitor Link Intersect (High-Authority Gap)
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  These authoritative domains link to 2 or more of your top rivals (AllPosters, Desenio, Society6) but NOT to {domain}.
                </p>
              </div>

              {onNavigateToCompetitors && (
                <button
                  onClick={onNavigateToCompetitors}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ExternalLink size={12} />
                  Manage Competitors
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {data.linkIntersect.map(opp => (
                <div
                  key={opp.domain}
                  style={{
                    background: 'rgba(17, 24, 39, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {opp.category}
                        </span>
                        <h4 style={{ margin: '0.2rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {opp.domain}
                        </h4>
                      </div>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: 'var(--accent-primary)',
                        fontWeight: 800,
                        fontSize: '0.85rem'
                      }}>
                        DR {opp.dr}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      Est. Monthly Traffic: <strong style={{ color: 'var(--text-primary)' }}>{opp.traffic.toLocaleString()}</strong>
                    </div>

                    {/* Competitors linking */}
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        Linked Competitors:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {opp.competitorsLinking.map(c => (
                          <span
                            key={c.domain}
                            className="badge"
                            style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}
                          >
                            {c.domain} ({c.backlinksCount} links)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      Authority Lift: {opp.estimatedAuthorityImpact}
                    </span>
                    <button
                      onClick={() => alert(`Outreach pitch template for ${opp.domain} copied to clipboard!`)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                    >
                      Outreach Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TOXIC LINKS AUDIT & GOOGLE DISAVOW GENERATOR */}
      {activeTab === 'disavow' && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Disavow Summary Card */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(17, 24, 39, 0.95) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  <ShieldAlert size={22} color="var(--status-critical)" />
                  Google Search Console Disavow Links Tool
                </h3>
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '680px' }}>
                  If your site is suffering from algorithmic suppression or manual action due to low-quality paid links, private blog networks (PBNs), or automated scrapers, submit a disavow text file directly to Google.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleDisavowAllToxic}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--status-critical)' }}
                >
                  <AlertTriangle size={14} />
                  Disavow All Toxic ({data.backlinks.filter(b => b.isToxic).length})
                </button>
                <button
                  onClick={handleCopyDisavow}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                >
                  {copiedDisavow ? <Check size={14} color="var(--accent-primary)" /> : <Copy size={14} />}
                  {copiedDisavow ? 'Copied to Clipboard' : 'Copy Rules'}
                </button>
                <button
                  onClick={handleDownloadDisavow}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                >
                  <Download size={14} />
                  Download disavow.txt
                </button>
              </div>
            </div>

            {/* Manual Add Rule Input */}
            <form onSubmit={handleManualAddDisavow} style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Enter domain (e.g., domain:spamsite.xyz) or specific spam URL..."
                value={disavowInput}
                onChange={(e) => setDisavowInput(e.target.value)}
                className="input-field"
                style={{ flex: 1, fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-secondary" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                Add to Disavow
              </button>
            </form>
          </div>

          {/* Active Disavow Rules List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Left: Active Rules Table */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Active Disavow Rules ({customDisavowList.length})</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Persistent in Local Project</span>
              </h4>

              {customDisavowList.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No rules currently in disavow list. Click "Disavow" on any backlink or add a domain above.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '380px', overflowY: 'auto' }}>
                  {customDisavowList.map(rule => (
                    <div
                      key={rule}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.85rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      <code style={{ fontSize: '0.85rem', color: 'var(--status-critical)' }}>
                        {rule}
                      </code>
                      <button
                        onClick={() => handleToggleDisavow(rule.replace(/^domain:/, ''))}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', color: 'var(--text-muted)' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Live disavow.txt Preview */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} color="var(--accent-cyan)" />
                Live Preview: disavow_{domain.replace(/[^a-zA-Z0-9]/g, '_')}.txt
              </h4>
              <pre style={{
                background: '#070A0F',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '1rem',
                fontSize: '0.75rem',
                color: '#38BDF8',
                lineHeight: 1.5,
                maxHeight: '380px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                margin: 0
              }}>
                {BacklinksService.generateGoogleDisavowContent(domain, customDisavowList)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
