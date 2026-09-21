/**
 * Phase 5: Autonomous Crawler Engine & Orchestrator
 */

import { 
  CrawlLimits, 
  CrawlPageResult, 
  CrawlStats, 
  CrawlStatus, 
  CrawlerEventMap 
} from './types';
import { CrawlQueue } from './crawlQueue';
import { HttpFetcher } from './fetcher';
import { RobotsParser } from './robotsParser';
import { SitemapParser } from './sitemapParser';
import { isSafeUrl, isInternalDomain, matchesExcludePattern } from './urlFilter';
import { databaseStore } from '../db/databaseStore';

export class CrawlerEngine {
  private status: CrawlStatus = 'idle';
  private queue: CrawlQueue;
  private fetcher: HttpFetcher;
  private robotsParser: RobotsParser;
  private limits: CrawlLimits;
  private seedUrl: string = '';
  private baseDomain: string = '';
  private activeJobId: string = '';

  private results: CrawlPageResult[] = [];
  private stats: CrawlStats;
  private listeners: Partial<{ [K in keyof CrawlerEventMap]: CrawlerEventMap[K][] }> = {};

  private isPauseRequested = false;
  private isAbortRequested = false;
  private timerStartTime = 0;
  private timerInterval: any = null;

  constructor(limits: CrawlLimits) {
    this.limits = limits;
    this.queue = new CrawlQueue(limits);
    this.fetcher = new HttpFetcher(limits);
    this.robotsParser = new RobotsParser();
    this.stats = this.initStats();
  }

  private initStats(): CrawlStats {
    return {
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
    };
  }

  public on<K extends keyof CrawlerEventMap>(event: K, handler: CrawlerEventMap[K]): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(handler);
  }

  private emit<K extends keyof CrawlerEventMap>(event: K, ...args: Parameters<CrawlerEventMap[K]>): void {
    const handlers = this.listeners[event];
    if (handlers) {
      for (const handler of handlers) {
        (handler as any)(...args);
      }
    }
  }

  /**
   * Starts an autonomous crawl job from a seed URL
   */
  public async startCrawl(seedUrl: string, websiteId?: string): Promise<void> {
    if (this.status === 'crawling') {
      return;
    }

    // SSRF Pre-flight check
    const safety = isSafeUrl(seedUrl);
    if (!safety.safe) {
      this.status = 'failed';
      this.emit('error', safety.reason || 'Restricted target domain or IP address.');
      this.emit('status_change', 'failed');
      return;
    }

    this.seedUrl = seedUrl;
    this.baseDomain = new URL(seedUrl).hostname;
    this.isPauseRequested = false;
    this.isAbortRequested = false;
    this.results = [];
    this.queue.clear();
    this.stats = this.initStats();
    this.setStatus('initializing');

    this.timerStartTime = Date.now();
    this.startElapsedTimer();

    // Create a new crawl job record in the Phase 3 database
    this.activeJobId = `job_${Date.now()}`;
    if (websiteId) {
      try {
        const jobs = databaseStore.getTableRows('crawl_jobs');
        jobs.unshift({
          id: this.activeJobId,
          website_id: websiteId,
          status: 'running',
          max_depth: this.limits.maxDepth,
          max_pages: this.limits.maxPages,
          pages_crawled: 0,
          created_at: new Date().toISOString()
        });
      } catch {
        // Continue even if local DB store has variation
      }
    }

    try {
      // 1. Fetch & Parse robots.txt
      await this.initRobotsTxt(seedUrl);

      // 2. Discover & Parse XML Sitemaps
      await this.initSitemaps(seedUrl);

      // 3. Enqueue Seed URL
      this.queue.enqueue(seedUrl, 0, 'seed', undefined, 1.0);
      this.updateStats();

      // 4. Begin Crawl Loop
      this.setStatus('crawling');
      await this.runCrawlLoop();

      if (this.isAbortRequested) {
        this.setStatus('aborted');
      } else {
        this.setStatus('completed');
        this.emit('completed', this.stats);
      }
    } catch (err: any) {
      this.setStatus('failed');
      this.emit('error', err.message || 'Crawl job encountered an unrecoverable failure');
    } finally {
      this.stopElapsedTimer();
      // Update database job record
      this.syncDbJobComplete();
    }
  }

  /**
   * Main asynchronous crawler loop with BFS queue processing & delay
   */
  private async runCrawlLoop(): Promise<void> {
    while (!this.queue.isEmpty() && !this.isAbortRequested) {
      // Check for pause
      while (this.isPauseRequested && !this.isAbortRequested) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      if (this.isAbortRequested) break;

      // Dequeue next item
      const item = this.queue.dequeue();
      if (!item) break;

      // Check Exclude Patterns
      if (matchesExcludePattern(item.url, this.limits.excludePatterns)) {
        this.emit('page_skipped', item.url, 'Matches exclusion pattern');
        continue;
      }

      // Check Robots.txt if enabled
      if (this.limits.respectRobotsTxt) {
        const robotsCheck = this.robotsParser.isAllowed(item.url, this.limits.userAgent);
        if (!robotsCheck.isAllowed) {
          this.stats.pagesBlockedByRobots++;
          this.emit('page_skipped', item.url, `Blocked by robots.txt (${robotsCheck.matchedRule})`);
          this.updateStats();
          continue;
        }
      }

      // Fetch the page
      const pageResult = await this.fetchPage(item.url, item.depth);
      this.results.push(pageResult);
      this.stats.pagesCrawled++;
      this.stats.totalBytesDownloaded += pageResult.contentLengthBytes;
      
      // Update response time average
      const currentAvg = this.stats.averageResponseTimeMs;
      this.stats.averageResponseTimeMs = Math.round(
        (currentAvg * (this.stats.pagesCrawled - 1) + pageResult.responseTimeMs) / this.stats.pagesCrawled
      );

      if (pageResult.statusCode >= 400) {
        this.stats.pagesFailed++;
      }

      this.emit('page_crawled', pageResult);

      // Record to Phase 3 database `pages` table
      this.savePageToDatabase(pageResult);

      // If page is OK and depth < maxDepth, discover and enqueue internal links
      if (pageResult.statusCode === 200 && item.depth < this.limits.maxDepth) {
        for (const discoveredUrl of pageResult.discoveredLinks) {
          // Verify scope: internal domain
          if (isInternalDomain(discoveredUrl, this.baseDomain, this.limits.crawlSubdomains)) {
            const added = this.queue.enqueue(
              discoveredUrl, 
              item.depth + 1, 
              'link_discovery', 
              item.url, 
              Math.max(0.1, 1.0 - (item.depth + 1) * 0.25)
            );
            if (added) {
              this.stats.pagesDiscovered++;
              this.emit('page_discovered', discoveredUrl, item.depth + 1);
            }
          }
        }
      }

      this.updateStats();

      // Check Max Pages ceiling
      if (this.stats.pagesCrawled >= this.limits.maxPages) {
        break;
      }

      // Rate limiting: sleep for crawlDelayMs
      if (this.limits.crawlDelayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, this.limits.crawlDelayMs));
      }
    }
  }

  private async fetchPage(url: string, depth: number): Promise<CrawlPageResult> {
    return this.fetcher.fetchPage(url, depth);
  }

  private async initRobotsTxt(seedUrl: string): Promise<void> {
    try {
      const parsed = new URL(seedUrl);
      const robotsUrl = `${parsed.origin}/robots.txt`;
      const res = await this.fetcher.fetchPage(robotsUrl, 0);
      if (res.statusCode === 200 && res.html) {
        this.robotsParser.parse(res.html);
      } else {
        // Fallback standard rules
        this.robotsParser.parse(`
User-agent: *
Disallow: /admin/
Disallow: /private/
Disallow: /api/
Sitemap: ${parsed.origin}/sitemap.xml
`);
      }
    } catch {
      // Non-fatal
    }
  }

  private async initSitemaps(seedUrl: string): Promise<void> {
    const sitemaps = this.robotsParser.getSitemaps();
    const parsed = new URL(seedUrl);

    if (sitemaps.length === 0) {
      sitemaps.push(`${parsed.origin}/sitemap.xml`);
    }

    for (const sitemapUrl of sitemaps.slice(0, 2)) {
      try {
        const res = await this.fetcher.fetchPage(sitemapUrl, 0);
        if (res.statusCode === 200 && res.html) {
          const parsedSitemap = SitemapParser.parse(res.html, parsed.origin);
          for (const entry of parsedSitemap.entries.slice(0, 15)) {
            if (isInternalDomain(entry.url, this.baseDomain, this.limits.crawlSubdomains)) {
              this.queue.enqueue(entry.url, 1, 'sitemap', sitemapUrl, entry.priority || 0.8);
              this.stats.pagesDiscovered++;
            }
          }
        }
      } catch {
        // Non-fatal
      }
    }
  }

  private savePageToDatabase(page: CrawlPageResult): void {
    try {
      const pages = databaseStore.getTableRows('pages');
      pages.unshift({
        id: page.id,
        website_id: this.baseDomain,
        url: page.url,
        depth: page.depth,
        status_code: page.statusCode,
        load_time_ms: page.responseTimeMs,
        title: page.html ? (/<title>(.*?)<\/title>/i.exec(page.html)?.[1] || '') : '',
        meta_description: '',
        h1: page.html ? (/<h1.*?>(.*?)<\/h1>/i.exec(page.html)?.[1] || '') : '',
        word_count: page.html ? page.html.split(/\s+/).length : 0,
        is_indexable: page.isIndexable,
        created_at: page.timestamp
      });
    } catch {
      // Non-fatal
    }
  }

  private syncDbJobComplete(): void {
    try {
      const jobs = databaseStore.getTableRows('crawl_jobs');
      const job = jobs.find((j: Record<string, any>) => j.id === this.activeJobId);
      if (job) {
        job.status = this.status;
        job.pages_crawled = this.stats.pagesCrawled;
        job.duration_seconds = this.stats.elapsedTimeSeconds;
      }
    } catch {
      // Non-fatal
    }
  }

  public getSeedUrl(): string {
    return this.seedUrl;
  }

  private setStatus(newStatus: CrawlStatus): void {
    this.status = newStatus;
    this.stats.status = newStatus;
    this.emit('status_change', newStatus);
    this.emit('progress', { ...this.stats });
  }

  private updateStats(): void {
    this.stats.pagesQueued = this.queue.size();
    if (this.stats.elapsedTimeSeconds > 0) {
      this.stats.currentCrawlRate = parseFloat(
        (this.stats.pagesCrawled / this.stats.elapsedTimeSeconds).toFixed(1)
      );
    }
    this.emit('progress', { ...this.stats });
  }

  private startElapsedTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.status === 'crawling') {
        this.stats.elapsedTimeSeconds = Math.round((Date.now() - this.timerStartTime) / 1000);
        this.updateStats();
      }
    }, 1000);
  }

  private stopElapsedTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Public Controls
  public pause(): void {
    if (this.status === 'crawling') {
      this.isPauseRequested = true;
      this.setStatus('paused');
    }
  }

  public resume(): void {
    if (this.status === 'paused') {
      this.isPauseRequested = false;
      this.setStatus('crawling');
    }
  }

  public abort(): void {
    this.isAbortRequested = true;
    this.setStatus('aborted');
  }

  public getStatus(): CrawlStatus {
    return this.status;
  }

  public getStats(): CrawlStats {
    return { ...this.stats };
  }

  public getResults(): CrawlPageResult[] {
    return [...this.results];
  }

  public getRobotsDirectives() {
    return {
      raw: this.robotsParser.getRawContent(),
      sitemaps: this.robotsParser.getSitemaps()
    };
  }
}
