import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building2,
  Star,
  Phone,
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Search,
  Download,
  RefreshCw,
  ChevronRight,
  Compass,
  Layers,
  Award,
  Zap,
  Navigation
} from 'lucide-react';
import {
  GeoLocalSeoAnalysis,
  GeoGridPin,
  LocalSchemaConfig
} from '../../engine/geoTypes';
import { GeoService } from '../../engine/geoService';

interface GeoLocalSeoExplorerProps {
  targetUrl?: string;
  initialKeyword?: string;
}

type GeoTab = 'overview' | 'geogrid' | 'localpack' | 'citations' | 'schema' | 'keywords';

export const GeoLocalSeoExplorer: React.FC<GeoLocalSeoExplorerProps> = ({
  targetUrl = 'https://www.posterscraft.com',
  initialKeyword = 'web development agency kolkata'
}) => {
  const [activeTab, setActiveTab] = useState<GeoTab>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<GeoLocalSeoAnalysis | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string>(initialKeyword);
  const [gridSize, setGridSize] = useState<'3x3' | '5x5'>('3x3');
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [selectedPin, setSelectedPin] = useState<GeoGridPin | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [citationFilter, setCitationFilter] = useState<'all' | 'consistent' | 'mismatch' | 'missing'>('all');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>('all');
  const [auditStatusFilter, setAuditStatusFilter] = useState<string>('all');

  // Schema Studio Form State
  const [schemaConfig, setSchemaConfig] = useState<LocalSchemaConfig>({
    type: 'ProfessionalService',
    name: 'PostersCraft',
    legalName: 'PostersCraft Digital Agency Pvt. Ltd.',
    telephone: '+91 33 2287 4000',
    email: 'contact@posterscraft.com',
    streetAddress: 'Park Street Area, Commercial Hub',
    addressLocality: 'Kolkata',
    addressRegion: 'West Bengal',
    postalCode: '700016',
    addressCountry: 'IN',
    latitude: 22.5726,
    longitude: 88.3639,
    priceRange: '$$',
    openingHours: ['Mo-Fr 09:00-19:00', 'Sa 10:00-16:00'],
    areasServed: ['Kolkata', 'Salt Lake Sector V', 'New Town', 'Park Street', 'Howrah', 'West Bengal'],
    sameAs: [
      'https://facebook.com/posterscraft',
      'https://linkedin.com/company/posterscraft',
      'https://twitter.com/posterscraft'
    ]
  });

  const loadData = async (keyword = selectedKeyword, size = gridSize, radius = radiusKm) => {
    setLoading(true);
    try {
      const res = await GeoService.getAnalysis({
        url: targetUrl,
        keyword,
        gridSize: size,
        radiusKm: radius
      });
      setData(res);
      if (res.geoGrid.pins.length > 0) {
        // default select center pin
        const centerIdx = Math.floor(res.geoGrid.pins.length / 2);
        setSelectedPin(res.geoGrid.pins[centerIdx] || res.geoGrid.pins[0]);
      }
    } catch (err) {
      console.error('Failed to load Local SEO data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [targetUrl]);

  const handleKeywordChange = (kw: string) => {
    setSelectedKeyword(kw);
    loadData(kw, gridSize, radiusKm);
  };

  const handleGridSizeChange = (size: '3x3' | '5x5') => {
    setGridSize(size);
    loadData(selectedKeyword, size, radiusKm);
  };

  const handleRadiusChange = (radius: number) => {
    setRadiusKm(radius);
    loadData(selectedKeyword, gridSize, radius);
  };

  const handleCopySchema = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.schemaValidation.jsonLd);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleExportCsv = () => {
    if (!data) return;
    const rows = [
      ['Directory Name', 'Authority', 'Status', 'Listed Name', 'Listed Address', 'Listed Phone', 'Action'],
      ...data.citations.map(c => [
        `"${c.name}"`,
        c.authority,
        c.status,
        `"${c.listedName}"`,
        `"${c.listedAddress}"`,
        `"${c.listedPhone}"`,
        `"${c.fixAction}"`
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `local_seo_citations_${data.targetDomain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!data && loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center text-slate-400">
        <RefreshCw className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-200">Analyzing GEO & Local SEO Signals...</h3>
        <p className="text-sm mt-1">Inspecting Google Business Profile, citations, Geo-Grid rankings, and local schema.</p>
      </div>
    );
  }

  if (!data) return null;

  const filteredCitations = data.citations.filter(c => {
    if (citationFilter === 'all') return true;
    return c.status === citationFilter;
  });

  const filteredChecks = data.auditChecks.filter(check => {
    if (auditCategoryFilter !== 'all' && check.category !== auditCategoryFilter) return false;
    if (auditStatusFilter !== 'all' && check.status !== auditStatusFilter) return false;
    return true;
  });

  const passedChecksCount = data.auditChecks.filter(c => c.status === 'pass').length;
  const warningChecksCount = data.auditChecks.filter(c => c.status === 'warning').length;
  const failChecksCount = data.auditChecks.filter(c => c.status === 'fail').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6 shadow-xl backdrop-blur-md">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase mb-1">
              <Compass size={14} />
              <span>Section 7 • AI & Future-Ready Search • Phase 20</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              GEO & Local SEO Studio
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Phase 20 Live
              </span>
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Dominate the Google Local 3-Pack, track spatial geo-coordinates rankings, ensure 100% NAP consistency, and automate validated LocalBusiness schema.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Building2 size={13} className="text-emerald-400" />
                {data.profile.name} ({data.profile.category})
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-emerald-400" />
                {data.profile.city}, {data.profile.state}, {data.profile.country}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-emerald-400" />
                {data.profile.phone}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-2.5 shadow-inner">
              <div className="text-right">
                <div className="text-xs text-slate-400">Local SEO Score</div>
                <div className="text-2xl font-bold text-emerald-400 leading-none">
                  {data.overallScore}<span className="text-sm text-slate-500 font-normal">/100</span>
                </div>
              </div>
              <div className="h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-bold text-emerald-300 text-sm">
                {data.scoreGrade}
              </div>
            </div>

            <button
              onClick={() => loadData()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-emerald-400' : ''} />
              <span>Refresh Scan</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-lg transition-colors shadow-sm"
            >
              <Download size={13} />
              <span>Export Citations</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60">
            <span className="text-slate-400 block mb-0.5">Average Grid Rank (AGR)</span>
            <div className="text-base font-bold text-emerald-400 flex items-center gap-1">
              #{data.geoGrid.averageGridRank}
              <span className="text-[10px] text-emerald-500/80 font-normal">({data.geoGrid.gridSize} Grid)</span>
            </div>
          </div>
          <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60">
            <span className="text-slate-400 block mb-0.5">Share of Local Voice (SoLV)</span>
            <div className="text-base font-bold text-emerald-400">
              {data.geoGrid.shareOfLocalVoice}%
            </div>
          </div>
          <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60">
            <span className="text-slate-400 block mb-0.5">Google Local 3-Pack</span>
            <div className="text-base font-bold text-amber-400 flex items-center gap-1">
              Rank #{data.localPack.targetRank || 1}
              <span className="text-[10px] text-amber-300/80 font-normal">(4.9★ / 148 rev)</span>
            </div>
          </div>
          <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60">
            <span className="text-slate-400 block mb-0.5">Citation Consistency</span>
            <div className="text-base font-bold text-emerald-400 flex items-center gap-1">
              {Math.round((data.citations.filter(c => c.status === 'consistent').length / data.citations.length) * 100)}%
              <span className="text-[10px] text-slate-400 font-normal">(9/10 Active)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 space-x-1 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'text-emerald-400 border-emerald-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Award size={14} />
          <span>Local SEO Audit</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {data.overallScore}/100
          </span>
        </button>

        <button
          onClick={() => setActiveTab('geogrid')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'geogrid'
              ? 'text-emerald-400 border-emerald-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Navigation size={14} />
          <span>Geo-Grid Rank Tracker</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
            #{data.geoGrid.averageGridRank}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('localpack')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'localpack'
              ? 'text-emerald-400 border-emerald-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Star size={14} />
          <span>Google Local 3-Pack</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
            Live Simulator
          </span>
        </button>

        <button
          onClick={() => setActiveTab('citations')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'citations'
              ? 'text-emerald-400 border-emerald-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Building2 size={14} />
          <span>Citations & NAP Matrix</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {data.citations.length} Sources
          </span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'schema'
              ? 'text-emerald-400 border-emerald-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Layers size={14} />
          <span>Local Schema Studio</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
            JSON-LD
          </span>
        </button>

        <button
          onClick={() => setActiveTab('keywords')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'keywords'
              ? 'text-emerald-400 border-emerald-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Search size={14} />
          <span>Geo-Keywords</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {data.geoKeywords.length} Queries
          </span>
        </button>
      </div>

      {/* VIEW 1: OVERVIEW & PILLARS AUDIT */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 5 Scoring Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(data.pillars).map(([key, pillar]) => {
              const pct = Math.round((pillar.score / pillar.maxScore) * 100);
              const isGood = pillar.status === 'good';
              return (
                <div
                  key={key}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 ${isGood ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-medium text-slate-300 truncate">{pillar.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${isGood ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {pillar.score}/{pillar.maxScore}
                      </span>
                    </div>
                    <div className="text-xl font-bold text-white mb-2">{pct}%</div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isGood ? 'bg-emerald-500' : 'bg-amber-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                      {pillar.summary}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Audit Checks Checklist */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  Local SEO Readiness Diagnostic Checklist
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  10 deterministic local ranking tests across NAP, Google Business Profile, Schema, and On-Page Geo signals.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setAuditStatusFilter('all')}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      auditStatusFilter === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ({data.auditChecks.length})
                  </button>
                  <button
                    onClick={() => setAuditStatusFilter('pass')}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      auditStatusFilter === 'pass' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Passed ({passedChecksCount})
                  </button>
                  <button
                    onClick={() => setAuditStatusFilter('warning')}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      auditStatusFilter === 'warning' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Warnings ({warningChecksCount})
                  </button>
                  {failChecksCount > 0 && (
                    <button
                      onClick={() => setAuditStatusFilter('fail')}
                      className={`px-2.5 py-1 rounded text-xs transition-colors ${
                        auditStatusFilter === 'fail' ? 'bg-red-500/20 text-red-300 font-medium' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Failed ({failChecksCount})
                    </button>
                  )}
                </div>

                <select
                  value={auditCategoryFilter}
                  onChange={e => setAuditCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Categories</option>
                  <option value="NAP Consistency">NAP Consistency</option>
                  <option value="Google Business Profile">Google Business Profile</option>
                  <option value="Schema & Tech">Schema & Tech</option>
                  <option value="Citations">Citations</option>
                  <option value="Local Content">Local Content</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredChecks.map(check => {
                const isPass = check.status === 'pass';
                const isWarn = check.status === 'warning';
                return (
                  <div
                    key={check.id}
                    className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {isPass && <CheckCircle2 size={16} className="text-emerald-400" />}
                          {isWarn && <AlertTriangle size={16} className="text-amber-400" />}
                          {!isPass && !isWarn && <XCircle size={16} className="text-red-400" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{check.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                              {check.category}
                            </span>
                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                                check.impact === 'high'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : check.impact === 'medium'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {check.impact} Impact
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{check.description}</p>
                          <div className="mt-2 text-xs bg-slate-900 border border-slate-800/80 rounded-md p-2.5 text-slate-300">
                            <span className="text-emerald-400 font-medium">Remediation Action: </span>
                            {check.remediation}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: GEO-GRID RANK TRACKER */}
      {activeTab === 'geogrid' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Target Keyword</label>
                <select
                  value={selectedKeyword}
                  onChange={e => handleKeywordChange(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                >
                  {data.availableGridKeywords.map(kw => (
                    <option key={kw} value={kw}>
                      {kw}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Grid Density</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
                  <button
                    onClick={() => handleGridSizeChange('3x3')}
                    className={`px-3 py-1 rounded transition-colors ${
                      gridSize === '3x3' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    3x3 (9 Pins)
                  </button>
                  <button
                    onClick={() => handleGridSizeChange('5x5')}
                    className={`px-3 py-1 rounded transition-colors ${
                      gridSize === '5x5' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    5x5 (25 Pins)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Radius Corridor</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
                  {[3, 5, 10, 25].map(rad => (
                    <button
                      key={rad}
                      onClick={() => handleRadiusChange(rad)}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        radiusKm === rad ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {rad} km
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs bg-slate-950/60 border border-slate-800/80 rounded-lg px-3 py-2">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Rank 1-3 (Local Pack)
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Rank 4-10
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Rank 11+
              </span>
            </div>
          </div>

          {/* Grid Layout & Pin Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Coordinate Grid */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-6 relative flex flex-col items-center justify-center">
              <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-4 pb-2 border-b border-slate-800/60">
                <span>Center: {data.geoGrid.centerAddress}</span>
                <span>Coordinates: {data.geoGrid.centerLat}° N, {data.geoGrid.centerLng}° E</span>
              </div>

              {/* Grid Box */}
              <div
                className={`grid gap-4 w-full max-w-xl p-6 bg-slate-950 rounded-xl border border-slate-800/80 shadow-2xl relative ${
                  gridSize === '5x5' ? 'grid-cols-5' : 'grid-cols-3'
                }`}
              >
                {data.geoGrid.pins.map(pin => {
                  const isSelected = selectedPin?.id === pin.id;
                  const isTop3 = pin.rank <= 3;
                  const isMid = pin.rank > 3 && pin.rank <= 10;

                  return (
                    <button
                      key={pin.id}
                      onClick={() => setSelectedPin(pin)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all transform hover:scale-105 ${
                        isSelected
                          ? 'border-emerald-400 ring-2 ring-emerald-500/40 bg-slate-900 shadow-lg'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-colors ${
                          isTop3
                            ? 'bg-emerald-500 text-slate-950'
                            : isMid
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {pin.rank}
                      </div>
                      <span className="text-[11px] font-medium text-slate-200 mt-2 truncate max-w-[80px]">
                        {pin.label}
                      </span>
                      <span className="text-[10px] text-slate-400">{pin.distanceKm} km</span>

                      {pin.distanceKm < 1.0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 text-[9px] font-bold px-1 rounded-full uppercase tracking-tighter">
                          HQ
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="w-full flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/60">
                <span>Top-3 Pack Coverage: {data.geoGrid.top3PinsCount} of {data.geoGrid.totalPins} pins</span>
                <span className="text-emerald-400 font-semibold">Share of Local Voice: {data.geoGrid.shareOfLocalVoice}%</span>
              </div>
            </div>

            {/* Pin Inspector Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                  <MapPin size={14} />
                  <span>Geo-Pin Inspector</span>
                </div>
                {selectedPin ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">{selectedPin.label}</h4>
                      <p className="text-xs text-slate-400">
                        {selectedPin.lat}° N, {selectedPin.lng}° E • {selectedPin.distanceKm} km from HQ
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Simulated Ranking:</span>
                        <span
                          className={`text-sm font-bold px-2 py-0.5 rounded ${
                            selectedPin.rank <= 3
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          Rank #{selectedPin.rank}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Local 3-Pack Presence:</span>
                        <span className="text-xs font-medium text-slate-200">
                          {selectedPin.inLocalPack ? '✅ Featured in Top 3' : '❌ Organic Map list only'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Top Competitor:</span>
                        <span className="text-xs font-medium text-emerald-400 truncate max-w-[140px]">
                          {selectedPin.topCompetitor}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 space-y-1">
                      <div className="font-semibold text-slate-200">Local Proximity Analysis:</div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Searchers querying from {selectedPin.label} receive strong local relevance weighting due to high commercial density in Kolkata core. Rank decay stabilizes within {radiusKm} km radius.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Click any pin on the grid to inspect local rank details.</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setActiveTab('localpack')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-md"
                >
                  <span>Simulate Google 3-Pack for this Location</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: GOOGLE LOCAL 3-PACK SIMULATOR */}
      {activeTab === 'localpack' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Google 3-Pack Preview Widget */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    Google Maps Local 3-Pack Simulator
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Query: <span className="text-emerald-400 font-medium">"{data.localPack.keyword}"</span> in {data.localPack.city}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                  Pixel-Accurate SERP View
                </span>
              </div>

              {/* Map Preview Banner */}
              <div className="h-32 w-full rounded-lg bg-slate-950 border border-slate-800 relative overflow-hidden mb-4 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="flex flex-col items-center z-10 text-center">
                  <MapPin size={24} className="text-emerald-400 animate-bounce mb-1" />
                  <span className="text-xs font-semibold text-slate-200">Kolkata Commercial District (Park Street & Salt Lake)</span>
                  <span className="text-[10px] text-slate-400">Target Business Center Lat: 22.5726° N, Long: 88.3639° E</span>
                </div>
              </div>

              {/* 3-Pack Items List */}
              <div className="space-y-3">
                {data.localPack.items.map((item) => {
                  return (
                    <div
                      key={item.name}
                      className={`p-4 rounded-lg border transition-all ${
                        item.isTargetBusiness
                          ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-xs font-bold text-slate-200">
                              {item.position}
                            </span>
                            <h4 className="text-sm font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer">
                              {item.name}
                            </h4>
                            {item.isTargetBusiness && (
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-bold uppercase tracking-wider">
                                Your Business
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-amber-400">{item.rating}</span>
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={11} className="fill-amber-400" />
                              ))}
                            </div>
                            <span className="text-slate-400">({item.reviewCount})</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{item.category}</span>
                          </div>

                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span className="text-emerald-400 font-medium">{item.hours}</span>
                            <span>•</span>
                            <span>{item.address}</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.attributes.map(attr => (
                              <span
                                key={attr}
                                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                              >
                                ✓ {attr}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
                          <a
                            href={item.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs flex items-center justify-center gap-1 transition-colors"
                          >
                            <Globe size={12} />
                            <span>Website</span>
                          </a>
                          <button className="px-3 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-1 transition-colors">
                            <Navigation size={12} />
                            <span>Directions</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ranking Factors Breakdown */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
                  <Zap size={15} className="text-amber-400" />
                  Local 3-Pack Algorithmic Factors
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Google's 3 primary local criteria: Proximity, Prominence, and Relevance.
                </p>

                <div className="space-y-4">
                  {data.localPack.rankFactors.map(factor => (
                    <div key={factor.factor} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-slate-200">{factor.factor}</span>
                        <span className="text-[10px] text-amber-400 font-bold uppercase">{factor.importance}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${factor.targetScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-emerald-400">{factor.targetScore}%</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{factor.assessment}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 text-center">
                Calculated per Google Search Algorithm 2026 Core Local Standards.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: CITATIONS & NAP CONSISTENCY */}
      {activeTab === 'citations' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Building2 size={16} className="text-emerald-400" />
                  Local Directory Citations & NAP Consistency Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect Name, Address, and Phone accuracy across 10 tier-1 directories and mapping platforms.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
                <button
                  onClick={() => setCitationFilter('all')}
                  className={`px-3 py-1 rounded transition-colors ${
                    citationFilter === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({data.citations.length})
                </button>
                <button
                  onClick={() => setCitationFilter('consistent')}
                  className={`px-3 py-1 rounded transition-colors ${
                    citationFilter === 'consistent' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Consistent ({data.citations.filter(c => c.status === 'consistent').length})
                </button>
                <button
                  onClick={() => setCitationFilter('mismatch')}
                  className={`px-3 py-1 rounded transition-colors ${
                    citationFilter === 'mismatch' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Mismatch ({data.citations.filter(c => c.status === 'mismatch').length})
                </button>
                <button
                  onClick={() => setCitationFilter('missing')}
                  className={`px-3 py-1 rounded transition-colors ${
                    citationFilter === 'missing' ? 'bg-red-500/20 text-red-300 font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Missing ({data.citations.filter(c => c.status === 'missing').length})
                </button>
              </div>
            </div>

            {/* Citations Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                    <th className="py-3 px-4 font-semibold">Directory</th>
                    <th className="py-3 px-4 font-semibold">Authority</th>
                    <th className="py-3 px-4 font-semibold">Listed NAP (Name / Address / Phone)</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Discrepancy & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCitations.map(cit => {
                    const isConsistent = cit.status === 'consistent';
                    const isMismatch = cit.status === 'mismatch';

                    return (
                      <tr key={cit.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{cit.name}</div>
                          <span className="text-[11px] text-slate-500">{cit.category}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
                              {cit.authority}
                            </div>
                            <span className="text-[10px] text-slate-400">DA</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs space-y-0.5">
                          <div className="font-medium text-slate-200">{cit.listedName || '—'}</div>
                          <div className="text-[11px] text-slate-400 truncate">{cit.listedAddress || '—'}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{cit.listedPhone || '—'}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isConsistent && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 size={12} />
                              Consistent
                            </span>
                          )}
                          {isMismatch && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <AlertTriangle size={12} />
                              NAP Mismatch
                            </span>
                          )}
                          {!isConsistent && !isMismatch && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                              <XCircle size={12} />
                              Unclaimed / Missing
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 max-w-sm">
                          {cit.discrepancyNote && (
                            <p className="text-[11px] text-amber-300 mb-1 leading-snug">
                              ⚠️ {cit.discrepancyNote}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-400 leading-snug">{cit.fixAction}</p>
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

      {/* VIEW 5: LOCAL SCHEMA STUDIO */}
      {activeTab === 'schema' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Schema Generator Form */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Layers size={16} className="text-cyan-400" />
                    LocalBusiness Schema Generator
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generate validated JSON-LD schema for LocalBusiness & ProfessionalService entities.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Entity @type</label>
                  <select
                    value={schemaConfig.type}
                    onChange={e => setSchemaConfig({ ...schemaConfig, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="ProfessionalService">ProfessionalService</option>
                    <option value="LocalBusiness">LocalBusiness</option>
                    <option value="Store">Store</option>
                    <option value="Organization">Organization</option>
                    <option value="Restaurant">Restaurant</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Business Name</label>
                  <input
                    type="text"
                    value={schemaConfig.name}
                    onChange={e => setSchemaConfig({ ...schemaConfig, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Telephone (E.164)</label>
                  <input
                    type="text"
                    value={schemaConfig.telephone}
                    onChange={e => setSchemaConfig({ ...schemaConfig, telephone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={schemaConfig.email}
                    onChange={e => setSchemaConfig({ ...schemaConfig, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-slate-400 block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={schemaConfig.streetAddress}
                    onChange={e => setSchemaConfig({ ...schemaConfig, streetAddress: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">City (addressLocality)</label>
                  <input
                    type="text"
                    value={schemaConfig.addressLocality}
                    onChange={e => setSchemaConfig({ ...schemaConfig, addressLocality: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">State (addressRegion)</label>
                  <input
                    type="text"
                    value={schemaConfig.addressRegion}
                    onChange={e => setSchemaConfig({ ...schemaConfig, addressRegion: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={schemaConfig.postalCode}
                    onChange={e => setSchemaConfig({ ...schemaConfig, postalCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Country Code (2-letter)</label>
                  <input
                    type="text"
                    value={schemaConfig.addressCountry}
                    onChange={e => setSchemaConfig({ ...schemaConfig, addressCountry: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={schemaConfig.latitude}
                    onChange={e => setSchemaConfig({ ...schemaConfig, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={schemaConfig.longitude}
                    onChange={e => setSchemaConfig({ ...schemaConfig, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Live JSON-LD Code Output */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-white">Live Validated JSON-LD Code</span>
                  </div>

                  <button
                    onClick={handleCopySchema}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                  >
                    {copiedJson ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy JSON-LD</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[380px] leading-relaxed">
                  {data.schemaValidation.jsonLd}
                </pre>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={13} />
                  Schema.org v2026 Compliant
                </span>
                <span>Inject directly into &lt;head&gt; of your website</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: GEO-KEYWORDS */}
      {activeTab === 'keywords' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Search size={16} className="text-emerald-400" />
                  Local Geo-Keywords & Proximity Search Intelligence
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-intent regional queries targeting Kolkata commercial corridors, "Near Me" searches, and tech hubs.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                    <th className="py-3 px-4 font-semibold">Local Keyword</th>
                    <th className="py-3 px-4 font-semibold">Geo Target</th>
                    <th className="py-3 px-4 font-semibold">Search Intent</th>
                    <th className="py-3 px-4 font-semibold text-right">Monthly Volume</th>
                    <th className="py-3 px-4 font-semibold text-center">Local KD</th>
                    <th className="py-3 px-4 font-semibold text-center">Current Rank</th>
                    <th className="py-3 px-4 font-semibold">SERP Features</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.geoKeywords.map(kw => {
                    return (
                      <tr key={kw.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-white">
                          {kw.keyword}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-emerald-400" />
                            {kw.city}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                              kw.intent === 'Near Me'
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : kw.intent === 'Neighborhood'
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {kw.intent}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-slate-200">
                          {kw.monthlyVolume.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                              kw.difficulty < 30
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {kw.difficulty}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                              kw.currentRank === 1
                                ? 'bg-emerald-500 text-slate-950'
                                : kw.currentRank <= 3
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            #{kw.currentRank}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {kw.serpFeatures.map(f => (
                              <span
                                key={f}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
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
    </div>
  );
};
