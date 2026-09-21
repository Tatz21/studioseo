/**
 * Phase 5: Crawler Foundation - Data Contracts & Types
 */

export type CrawlStatus = 
  | 'idle'
  | 'initializing'
  | 'crawling'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'aborted';

export interface CrawlItem {
  id: string;
  url: string;
  depth: number;
  referrer?: string;
  source: 'seed' | 'sitemap' | 'link_discovery';
  priority: number; // 0.0 to 1.0
  addedAt: number;
  retryCount: number;
}

export interface CrawlPageResult {
  id: string;
  url: string;
  depth: number;
  statusCode: number;
  statusText: string;
  contentType: string;
  responseTimeMs: number; // TTFB + download
  contentLengthBytes: number;
  html?: string;
  discoveredLinks: string[];
  redirectChain: string[];
  isInternal: boolean;
  isIndexable: boolean;
  error?: string;
  timestamp: string;
}

export interface RobotsDirective {
  userAgent: string;
  disallowedPaths: string[];
  allowedPaths: string[];
  crawlDelaySeconds?: number;
  sitemaps: string[];
}

export interface RobotsCheckResult {
  isAllowed: boolean;
  matchedRule?: string;
  crawlDelaySeconds?: number;
  sitemapsFound: string[];
}

export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface CrawlLimits {
  maxDepth: number;
  maxPages: number;
  crawlDelayMs: number;
  maxConcurrency: number;
  timeoutMs: number;
  respectRobotsTxt: boolean;
  crawlSubdomains: boolean;
  excludePatterns: string[];
  userAgent: string;
}

export interface CrawlStats {
  pagesCrawled: number;
  pagesQueued: number;
  pagesDiscovered: number;
  pagesFailed: number;
  pagesBlockedByRobots: number;
  averageResponseTimeMs: number;
  totalBytesDownloaded: number;
  elapsedTimeSeconds: number;
  currentCrawlRate: number; // pages per sec
  status: CrawlStatus;
}

export interface CrawlerEventMap {
  'status_change': (status: CrawlStatus) => void;
  'page_crawled': (page: CrawlPageResult) => void;
  'page_discovered': (url: string, depth: number) => void;
  'page_skipped': (url: string, reason: string) => void;
  'progress': (stats: CrawlStats) => void;
  'error': (error: string) => void;
  'completed': (stats: CrawlStats) => void;
}
