/**
 * Phase 5: Live Crawler Diagnostic Console & Real-time Monitor
 */

import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Globe, 
  Layers, 
  Clock, 
  Gauge, 
  FileText, 
  ShieldAlert, 
  Bot, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { CrawlerEngine } from '../../crawler/crawlerEngine';
import { CrawlLimits, CrawlPageResult, CrawlStats, CrawlStatus } from '../../crawler/types';
import { websiteStore } from '../../sites/websiteStore';
import { isSafeUrl } from '../../crawler/urlFilter';

interface CrawlerLiveMonitorProps {
  initialUrl?: string;
  onAuditPage: (url: string) => void;
}

export const CrawlerLiveMonitor: React.FC<CrawlerLiveMonitorProps> = ({
  initialUrl,
  onAuditPage
}) => {
  const websites = websiteStore.getWebsites();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>(websites[0]?.id || '');
  const [targetUrl, setTargetUrl] = useState<string>(
    initialUrl || (websites[0] ? websites[0].canonicalUrl : 'https://docs.stripe.com')
  );

  // Crawl configuration
  const [maxDepth, setMaxDepth] = useState<number>(2);
  const [maxPages, setMaxPages] = useState<number>(30);
  const [crawlDelayMs, setCrawlDelayMs] = useState<number>(150);
  const [respectRobots, setRespectRobots] = useState<boolean>(true);
  const [crawlSubdomains, setCrawlSubdomains] = useState<boolean>(false);
  const [userAgent] = useState<string>('SEOStudio-Spider/1.0 (+https://seostudio.internal/bot)');

  // Engine state
  const [engineStatus, setEngineStatus] = useState<CrawlStatus>('idle');
  const [stats, setStats] = useState<CrawlStats>({
    pagesCrawled: 0,
    pagesQueued: 0,
    pagesDiscovered: 0,
    pagesFailed: 0,
    pagesBlockedByRobots: 0,
    averageResponseTimeMs: 0,
    totalBytesDownloaded: 0,
    elapsedTimeSeconds: 0,
    currentCrawlRate: 0,
    status: 'idle'
  });

  const [results, setResults] = useState<CrawlPageResult[]>([]);
  const [sitemaps, setSitemaps] = useState<string[]>([]);
  const [ssrfError, setSsrfError] = useState<string | null>(null);

  // Table filtering
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | '2xx' | '3xx' | '4xx_5xx'>('all');

  const engineRef = useRef<CrawlerEngine | null>(null);

  // Handle website selection change
  const handleWebsiteChange = (siteId: string) => {
    setSelectedWebsiteId(siteId);
    const site = websites.find(w => w.id === siteId);
    if (site) {
      setTargetUrl(site.canonicalUrl);
      setMaxDepth(site.crawlConfig.crawlDepthLimit);
      setMaxPages(Math.min(site.crawlConfig.maxPagesLimit, 50));
      setRespectRobots(site.crawlConfig.respectRobotsTxt);
      setCrawlSubdomains(site.crawlConfig.includeSubdomains);
    }
  };

  const startCrawl = async () => {
    setSsrfError(null);

    // SSRF pre-check
    const safeCheck = isSafeUrl(targetUrl);
    if (!safeCheck.safe) {
      setSsrfError(safeCheck.reason || 'Restricted target address.');
      return;
    }

    const limits: CrawlLimits = {
      maxDepth,
      maxPages,
      crawlDelayMs,
      maxConcurrency: 3,
      timeoutMs: 8000,
      respectRobotsTxt: respectRobots,
      crawlSubdomains,
      excludePatterns: ['/cdn-cgi/', '/wp-admin/'],
      userAgent
    };

    const engine = new CrawlerEngine(limits);
    engineRef.current = engine;

    engine.on('status_change', (newStatus) => {
      setEngineStatus(newStatus);
    });

    engine.on('progress', (updatedStats) => {
      setStats({ ...updatedStats });
    });

    engine.on('page_crawled', (page) => {
      setResults((prev) => [page, ...prev]);
    });

    engine.on('error', (err) => {
      setSsrfError(err);
    });

    setResults([]);
    await engine.startCrawl(targetUrl, selectedWebsiteId);
    setSitemaps(engine.getRobotsDirectives().sitemaps);
  };

  const handlePause = () => {
    engineRef.current?.pause();
  };

  const handleResume = () => {
    engineRef.current?.resume();
  };

  const handleAbort = () => {
    engineRef.current?.abort();
  };

  // Filtered results
  const filteredResults = results.filter((page) => {
    const matchesSearch = page.url.toLowerCase().includes(searchFilter.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === '2xx') return page.statusCode >= 200 && page.statusCode < 300;
    if (statusFilter === '3xx') return page.statusCode >= 300 && page.statusCode < 400;
    if (statusFilter === '4xx_5xx') return page.statusCode >= 400;
    return true;
  });

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header Panel */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wide uppercase">
                Phase 5 Architecture
              </span>
              <span className="text-xs text-slate-400">Breadth-First Search (BFS) Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Bot className="w-6 h-6 text-emerald-400" />
              Autonomous Crawler Console
            </h1>
            <p className="text-slate-400 text-sm">
              Production-grade web spider with robots.txt parsing, XML sitemap extraction, SSRF security guards, and queue scheduling.
            </p>
          </div>

          {/* Action Button Controls */}
          <div className="flex items-center gap-3">
            {engineStatus === 'crawling' ? (
              <>
                <button
                  onClick={handlePause}
                  className="px-4 py-2.5 rounded-xl font-medium text-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-2 transition-all"
                >
                  <Pause className="w-4 h-4" /> Pause
                </button>
                <button
                  onClick={handleAbort}
                  className="px-4 py-2.5 rounded-xl font-medium text-sm bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-2 transition-all"
                >
                  <Square className="w-4 h-4" /> Abort Crawl
                </button>
              </>
            ) : engineStatus === 'paused' ? (
              <>
                <button
                  onClick={handleResume}
                  className="px-4 py-2.5 rounded-xl font-medium text-sm bg-emerald-500 text-slate-950 font-semibold flex items-center gap-2 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Play className="w-4 h-4 fill-slate-950" /> Resume Crawl
                </button>
                <button
                  onClick={handleAbort}
                  className="px-4 py-2.5 rounded-xl font-medium text-sm bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-2 transition-all"
                >
                  <Square className="w-4 h-4" /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={startCrawl}
                disabled={engineStatus === 'initializing'}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-500 text-slate-950 flex items-center gap-2 hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50"
              >
                {engineStatus === 'initializing' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Initializing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950" /> Launch Crawl Job
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* SSRF Error Alert */}
        {ssrfError && (
          <div className="mt-4 p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-center gap-3 text-rose-300 text-sm">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div className="flex-1">
              <span className="font-semibold text-white">Security Block: </span>
              {ssrfError}
            </div>
          </div>
        )}

        {/* Crawl Target & Controls Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" /> Active Website Project
            </label>
            <select
              value={selectedWebsiteId}
              onChange={(e) => handleWebsiteChange(e.target.value)}
              disabled={engineStatus === 'crawling'}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            >
              {websites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.domain})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Target Seed URL</label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              disabled={engineStatus === 'crawling'}
              placeholder="https://example.com"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 font-mono"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Max Depth</label>
            <select
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              disabled={engineStatus === 'crawling'}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value={1}>1 (Seed only)</option>
              <option value={2}>2 (Seed + 1 hop)</option>
              <option value={3}>3 (Recommended)</option>
              <option value={5}>5 (Deep crawl)</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Max Pages</label>
            <select
              value={maxPages}
              onChange={(e) => setMaxPages(Number(e.target.value))}
              disabled={engineStatus === 'crawling'}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value={15}>15 pages</option>
              <option value={30}>30 pages</option>
              <option value={50}>50 pages</option>
              <option value={100}>100 pages</option>
            </select>
          </div>
        </div>

        {/* Advanced Options Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 pt-3 border-t border-slate-800/40">
          <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-200">
            <input
              type="checkbox"
              checked={respectRobots}
              onChange={(e) => setRespectRobots(e.target.checked)}
              disabled={engineStatus === 'crawling'}
              className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
            />
            <span>Respect robots.txt</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-200">
            <input
              type="checkbox"
              checked={crawlSubdomains}
              onChange={(e) => setCrawlSubdomains(e.target.checked)}
              disabled={engineStatus === 'crawling'}
              className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
            />
            <span>Crawl Subdomains</span>
          </label>
          <div className="flex items-center gap-2">
            <span>Rate Delay:</span>
            <select
              value={crawlDelayMs}
              onChange={(e) => setCrawlDelayMs(Number(e.target.value))}
              disabled={engineStatus === 'crawling'}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-white"
            >
              <option value={50}>50ms (Turbo)</option>
              <option value={150}>150ms (Balanced)</option>
              <option value={500}>500ms (Polite)</option>
              <option value={1000}>1000ms (Slow)</option>
            </select>
          </div>
          <div className="ml-auto font-mono text-[11px] text-slate-500 truncate max-w-xs">
            UA: {userAgent.split(' ')[0]}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Pages Crawled</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white flex items-baseline gap-1.5">
            {stats.pagesCrawled}
            <span className="text-xs text-slate-500 font-normal">/ {maxPages}</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400/80">
            {stats.pagesDiscovered} discovered in graph
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">In Queue</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">
            {stats.pagesQueued}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            BFS priority queue
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Throughput</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.currentCrawlRate}
            <span className="text-xs text-slate-500 ml-1">pg/s</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400/80">
            Speed index
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Avg Latency</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {stats.averageResponseTimeMs}
            <span className="text-xs text-slate-500 ml-1">ms</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            TTFB + download
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Robots Guard</span>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {stats.pagesBlockedByRobots}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Blocked paths
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Elapsed Time</span>
            <RotateCcw className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatSeconds(stats.elapsedTimeSeconds)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 capitalize">
            Status: <span className="font-semibold text-emerald-400">{engineStatus}</span>
          </div>
        </div>
      </div>

      {/* Discovered Sitemaps Banner if available */}
      {sitemaps.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-sm font-semibold text-white">XML Sitemaps Discovered</div>
              <div className="text-xs text-slate-400">
                Extracted from robots.txt: {sitemaps.join(', ')}
              </div>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            {sitemaps.length} Found
          </span>
        </div>
      )}

      {/* Crawled Results Table & Stream */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Table Top Controls */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Crawl Stream</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {filteredResults.length} pages
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Filter chips */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('2xx')}
                className={`px-3 py-1 rounded-lg transition-all ${statusFilter === '2xx' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                2xx OK
              </button>
              <button
                onClick={() => setStatusFilter('3xx')}
                className={`px-3 py-1 rounded-lg transition-all ${statusFilter === '3xx' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                3xx Redirect
              </button>
              <button
                onClick={() => setStatusFilter('4xx_5xx')}
                className={`px-3 py-1 rounded-lg transition-all ${statusFilter === '4xx_5xx' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                4xx/5xx
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search crawled URL..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 w-48"
              />
            </div>
          </div>
        </div>

        {/* Stream Table */}
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
          {filteredResults.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Bot className="w-10 h-10 mx-auto opacity-30 text-emerald-400" />
              <div className="text-sm">
                {results.length === 0 
                  ? 'No pages crawled yet. Configure boundaries above and click "Launch Crawl Job".' 
                  : 'No crawled pages match your filter criteria.'}
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Depth</th>
                  <th className="py-3 px-4 font-semibold">Target URL</th>
                  <th className="py-3 px-4 font-semibold">Latency</th>
                  <th className="py-3 px-4 font-semibold">Outlinks</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredResults.map((item) => {
                  const is2xx = item.statusCode >= 200 && item.statusCode < 300;
                  const is3xx = item.statusCode >= 300 && item.statusCode < 400;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            is2xx
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : is3xx
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {item.statusCode} {item.statusText}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-slate-400 px-2 py-0.5 bg-slate-800/80 rounded border border-slate-700/50">
                          d:{item.depth}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-md truncate font-sans text-slate-200">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate">{item.url}</span>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 hover:text-emerald-400 flex-shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        {item.redirectChain.length > 0 && (
                          <div className="text-[11px] text-amber-400/80 font-mono flex items-center gap-1 mt-0.5">
                            <ArrowRight className="w-3 h-3" /> Redirects to: {item.redirectChain[0]}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                        {item.responseTimeMs}ms
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-cyan-400 font-semibold">
                        {item.discoveredLinks.length}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => onAuditPage(item.url)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-sans font-medium transition-all inline-flex items-center gap-1"
                        >
                          Audit <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
