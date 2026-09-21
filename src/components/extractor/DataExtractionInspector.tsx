/**
 * Phase 6: SEO Data Extraction Inspector & Visualizer UI
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Heading1, 
  Link2, 
  Image as ImageIcon, 
  Code2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  Check, 
  Search, 
  Share2, 
  Globe, 
  Layers, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { ExtractedPageData } from '../../extractor/types';
import { SeoDataExtractor } from '../../extractor/index';

interface DataExtractionInspectorProps {
  initialHtml: string;
  initialUrl: string;
}

type InspectorTab = 'overview' | 'headings' | 'links' | 'images' | 'schema' | 'raw';

export const DataExtractionInspector: React.FC<DataExtractionInspectorProps> = ({
  initialHtml,
  initialUrl
}) => {
  const [data] = useState<ExtractedPageData>(() => {
    return SeoDataExtractor.extract(initialHtml, initialUrl, 200, 195);
  });

  const [activeTab, setActiveTab] = useState<InspectorTab>('overview');
  const [copied, setCopied] = useState(false);

  // Link table filter
  const [linkFilter, setLinkFilter] = useState<'all' | 'internal' | 'external' | 'nofollow' | 'generic'>('all');
  const [linkSearch, setLinkSearch] = useState('');

  // Image filter
  const [imageFilter, setImageFilter] = useState<'all' | 'missing_alt' | 'missing_dims' | 'modern'>('all');

  const copyRawJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLinks = data.links.links.filter(link => {
    const matchesSearch = link.url.toLowerCase().includes(linkSearch.toLowerCase()) || 
                          link.anchorText.toLowerCase().includes(linkSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (linkFilter === 'internal') return link.isInternal;
    if (linkFilter === 'external') return !link.isInternal;
    if (linkFilter === 'nofollow') return link.isNofollow;
    if (linkFilter === 'generic') return link.isGenericAnchor;
    return true;
  });

  const filteredImages = data.images.images.filter(img => {
    if (imageFilter === 'missing_alt') return !img.hasAlt || img.isAltEmpty;
    if (imageFilter === 'missing_dims') return !img.hasDimensions;
    if (imageFilter === 'modern') return img.isModernFormat;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header Info Panel */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wide uppercase">
                Phase 6 Engine
              </span>
              <span className="text-xs text-slate-400">AST DOM & Semantic Extraction</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-emerald-400" />
              SEO Data Extraction Inspector
            </h1>
            <p className="text-slate-400 text-sm">
              Deep extraction breakdown of page metadata, headings hierarchy, canonical directives, link networks, images, and Schema.org structured data.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              {data.domain}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
              HTTP {data.statusCode} OK
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              {data.pageSizeKb} KB
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              {data.loadTimeMs}ms
            </span>
            <button
              onClick={copyRawJson}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-sans flex items-center gap-1.5 transition-all"
              title="Copy Extracted JSON"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              {copied ? 'Copied' : 'JSON'}
            </button>
          </div>
        </div>

        {/* Quick KPI Overview Tiles */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              Title Tag
              {data.metadata.titleLength >= 30 && data.metadata.titleLength <= 60 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>
            <div className="text-lg font-bold text-white mt-0.5">{data.metadata.titleLength} chars</div>
            <div className="text-[10px] text-slate-500 font-mono">~{data.metadata.titlePixelWidth}px SERP width</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              Meta Description
              {data.metadata.descriptionLength >= 120 && data.metadata.descriptionLength <= 160 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>
            <div className="text-lg font-bold text-white mt-0.5">{data.metadata.descriptionLength} chars</div>
            <div className="text-[10px] text-slate-500 font-mono">
              {data.metadata.description ? 'Declared' : 'Missing'}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              Headings Hierarchy
              {data.headings.hasSingleH1 && !data.headings.hasSkippedLevels ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>
            <div className="text-lg font-bold text-white mt-0.5">{data.headings.totalHeadings} total</div>
            <div className="text-[10px] text-slate-500 font-mono">{data.headings.h1Count} H1 found</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              Links Extracted
              <Link2 className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-lg font-bold text-white mt-0.5">{data.links.totalLinks} links</div>
            <div className="text-[10px] text-slate-500 font-mono">
              {data.links.internalCount} int / {data.links.externalCount} ext
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              Image Alt Coverage
              {data.images.missingAltCount === 0 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              )}
            </div>
            <div className="text-lg font-bold text-white mt-0.5">{data.images.totalImages} images</div>
            <div className="text-[10px] text-slate-500 font-mono">
              {data.images.missingAltCount} missing alt
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              Structured Data
              {data.schema.hasStructuredData ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
              )}
            </div>
            <div className="text-lg font-bold text-white mt-0.5">{data.schema.detectedTypes.length} types</div>
            <div className="text-[10px] text-slate-500 font-mono">
              {data.schema.jsonLdCount} JSON-LD blocks
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Overview & Metadata
          </button>
          <button
            onClick={() => setActiveTab('headings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'headings'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Heading1 className="w-3.5 h-3.5" /> Headings Hierarchy ({data.headings.totalHeadings})
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'links'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" /> Links & Anchors ({data.links.totalLinks})
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'images'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Images & Alt ({data.images.totalImages})
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'schema'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Schema.org JSON-LD ({data.schema.detectedTypes.length})
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'raw'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Raw AST JSON
          </button>
        </div>
      </div>

      {/* Tab 1: Overview & Metadata */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Metadata Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Title & Description Directives
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <div className="text-slate-400 mb-1 flex items-center justify-between">
                  <span>Page Title</span>
                  <span className="font-mono text-slate-300">{data.metadata.titleLength} chars</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white">
                  {data.metadata.title || <span className="text-slate-600 italic">No title tag detected</span>}
                </div>
              </div>

              <div>
                <div className="text-slate-400 mb-1 flex items-center justify-between">
                  <span>Meta Description</span>
                  <span className="font-mono text-slate-300">{data.metadata.descriptionLength} chars</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 leading-relaxed">
                  {data.metadata.description || <span className="text-slate-600 italic">No description tag detected</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Meta Robots</span>
                  <span className="text-emerald-400 font-semibold font-mono">
                    {data.metadata.robots.noindex ? 'noindex' : 'index'}, {data.metadata.robots.nofollow ? 'nofollow' : 'follow'}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Canonical Tag</span>
                  <span className="text-white font-mono truncate block" title={data.canonical.canonicalUrl}>
                    {data.canonical.hasCanonical ? 'Declared' : 'Missing'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Graph Cards (Open Graph & Twitter) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-cyan-400" /> Social Graph Cards (OG & Twitter)
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400">Open Graph (og:)</span>
                  <span className="text-[10px] font-mono text-slate-500">type: {data.metadata.openGraph.type || 'website'}</span>
                </div>
                <div className="text-white font-semibold">{data.metadata.openGraph.title || data.metadata.title}</div>
                <div className="text-slate-400 text-[11px] line-clamp-2">{data.metadata.openGraph.description || data.metadata.description}</div>
                {data.metadata.openGraph.image && (
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    Image: {data.metadata.openGraph.image}
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400">Twitter Card</span>
                  <span className="text-[10px] font-mono text-slate-500">card: {data.metadata.twitter.card || 'summary_large_image'}</span>
                </div>
                <div className="text-white font-semibold">{data.metadata.twitter.title || data.metadata.title}</div>
                <div className="text-slate-400 text-[11px] line-clamp-2">{data.metadata.twitter.description || data.metadata.description}</div>
              </div>

              {/* Content Metrics */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Content Readability</div>
                  <div className="text-slate-400 text-[11px]">{data.content.readingLevel}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-400">{data.content.readingEaseScore}/100</div>
                  <div className="text-[10px] text-slate-500 font-mono">{data.content.wordCount} words</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Headings Hierarchy */}
      {activeTab === 'headings' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Heading1 className="w-4 h-4 text-emerald-400" /> Headings Tree & Hierarchy Validation
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates H1..H6 heading sequence, detects skipped levels, and flags empty heading tags.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">H1: {data.headings.h1Count}</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">H2: {data.headings.h2Count}</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">H3: {data.headings.h3Count}</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">H4: {data.headings.h4Count}</span>
            </div>
          </div>

          {/* Skipped level alerts */}
          {data.headings.skippedLevelIssues.length > 0 && (
            <div className="p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-1.5 text-xs text-amber-300">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Heading Structural Warnings:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                {data.headings.skippedLevelIssues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Heading Nodes List */}
          <div className="space-y-2 pt-2">
            {data.headings.nodes.map((node) => {
              const indentLevel = node.level - 1;
              const badgeColors: Record<number, string> = {
                1: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold',
                2: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
                3: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                4: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                5: 'bg-slate-800 text-slate-300 border-slate-700',
                6: 'bg-slate-800 text-slate-300 border-slate-700'
              };

              return (
                <div
                  key={node.id}
                  style={{ marginLeft: `${indentLevel * 24}px` }}
                  className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`px-2 py-0.5 rounded border text-[11px] font-mono ${badgeColors[node.level]}`}>
                      H{node.level}
                    </span>
                    <span className={`truncate font-medium ${node.isEmpty ? 'text-rose-400 italic' : 'text-slate-200'}`}>
                      {node.isEmpty ? '(Empty Heading Tag)' : node.text}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 flex-shrink-0">
                    {node.characterLength} chars
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Links & Anchors */}
      {activeTab === 'links' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-emerald-400" /> Links & Anchors Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Internal/external distribution, rel=nofollow flags, and anchor text quality.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setLinkFilter('all')}
                  className={`px-3 py-1 rounded-lg ${linkFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  All ({data.links.totalLinks})
                </button>
                <button
                  onClick={() => setLinkFilter('internal')}
                  className={`px-3 py-1 rounded-lg ${linkFilter === 'internal' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
                >
                  Internal ({data.links.internalCount})
                </button>
                <button
                  onClick={() => setLinkFilter('external')}
                  className={`px-3 py-1 rounded-lg ${linkFilter === 'external' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
                >
                  External ({data.links.externalCount})
                </button>
                <button
                  onClick={() => setLinkFilter('generic')}
                  className={`px-3 py-1 rounded-lg ${linkFilter === 'generic' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
                >
                  Generic Anchors ({data.links.genericAnchorCount})
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search link or anchor..."
                  value={linkSearch}
                  onChange={(e) => setLinkSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 w-44"
                />
              </div>
            </div>
          </div>

          {/* Links Table */}
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Scope</th>
                  <th className="py-2.5 px-3 font-semibold">Anchor Text</th>
                  <th className="py-2.5 px-3 font-semibold">Destination URL</th>
                  <th className="py-2.5 px-3 font-semibold">Rel Attributes</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        link.isInternal 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}>
                        {link.isInternal ? 'INTERNAL' : 'EXTERNAL'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate font-sans">
                      <span className={`${link.isGenericAnchor ? 'text-amber-400 font-semibold' : 'text-slate-200'}`}>
                        {link.anchorText}
                      </span>
                      {link.isGenericAnchor && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                          Generic Anchor
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 max-w-md truncate text-slate-400">
                      <a href={link.url} target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1 truncate">
                        <span className="truncate">{link.url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                      {link.relAttributes.length > 0 ? (
                        <span className="text-cyan-400 text-[11px]">{link.relAttributes.join(', ')}</span>
                      ) : (
                        <span className="text-slate-600 font-sans italic">None</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-right text-slate-500">
                      {link.target || '_self'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Images & Alt */}
      {activeTab === 'images' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" /> Images & Alt Attribute Accessibility
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit image alt text for accessibility and search ranking, next-gen WebP/AVIF formats, and dimensions for CLS prevention.
              </p>
            </div>

            {/* Filter chips */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setImageFilter('all')}
                className={`px-3 py-1 rounded-lg ${imageFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All ({data.images.totalImages})
              </button>
              <button
                onClick={() => setImageFilter('missing_alt')}
                className={`px-3 py-1 rounded-lg ${imageFilter === 'missing_alt' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                Missing Alt ({data.images.missingAltCount})
              </button>
              <button
                onClick={() => setImageFilter('missing_dims')}
                className={`px-3 py-1 rounded-lg ${imageFilter === 'missing_dims' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                Missing Dims ({data.images.missingDimensionsCount})
              </button>
              <button
                onClick={() => setImageFilter('modern')}
                className={`px-3 py-1 rounded-lg ${imageFilter === 'modern' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                Modern Formats ({data.images.modernFormatCount})
              </button>
            </div>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredImages.map((img) => (
              <div key={img.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    img.isModernFormat ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {img.format}
                  </span>
                  <span className={`text-[10px] font-bold ${
                    img.hasAlt && !img.isAltEmpty ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {img.hasAlt && !img.isAltEmpty ? 'Alt Verified' : 'Missing Alt'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-mono">Alt Text:</div>
                  <div className="p-2 bg-slate-900 border border-slate-800/80 rounded-lg text-slate-200 line-clamp-2">
                    {img.altText || <span className="text-rose-400 italic">No alternative text provided</span>}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-mono">Source URL:</div>
                  <div className="font-mono text-[11px] text-slate-400 truncate">
                    <a href={img.src} target="_blank" rel="noreferrer" className="hover:text-emerald-400 truncate">
                      {img.src}
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Dims: {img.hasDimensions ? `${img.width}×${img.height}` : 'Missing (CLS Risk)'}</span>
                  <span>Lazy: {img.isLazy ? 'Yes' : 'No'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Schema.org Structured Data */}
      {activeTab === 'schema' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-purple-400" /> Schema.org Structured Data & Rich Results
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Parsed JSON-LD scripts and Microdata for Google Rich Snippet qualification.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {data.schema.detectedTypes.map((type, idx) => (
              <span key={idx} className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-xs font-semibold">
                @{type}
              </span>
            ))}
          </div>

          {/* Schemas List */}
          <div className="space-y-4 pt-2">
            {data.schema.schemas.map((schema) => (
              <div key={schema.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    {schema.schemaType}
                  </span>
                  <span className="font-mono text-slate-400 uppercase text-[10px]">{schema.type}</span>
                </div>

                <pre className="p-3 bg-slate-900/90 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto max-h-64 overflow-y-auto">
                  {schema.isValidJson && schema.parsedData 
                    ? JSON.stringify(schema.parsedData, null, 2) 
                    : schema.rawContent}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Raw AST JSON */}
      {activeTab === 'raw' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" /> Complete Extracted AST Payload
            </h2>
            <button
              onClick={copyRawJson}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
          </div>
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono text-xs overflow-x-auto max-h-[600px] overflow-y-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
