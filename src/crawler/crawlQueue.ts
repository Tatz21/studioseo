/**
 * Phase 5: Crawl Queue & BFS Priority Scheduler
 */

import { CrawlItem, CrawlLimits } from './types';

export class CrawlQueue {
  private queue: CrawlItem[] = [];
  private visitedUrls: Set<string> = new Set();
  private queuedUrls: Set<string> = new Set();
  private limits: CrawlLimits;

  constructor(limits: CrawlLimits) {
    this.limits = limits;
  }

  /**
   * Enqueue a new URL into the crawl queue if boundaries and uniqueness checks pass
   */
  public enqueue(
    url: string, 
    depth: number, 
    source: CrawlItem['source'] = 'link_discovery',
    referrer?: string,
    priority: number = 0.5
  ): boolean {
    // 1. Boundary check: Max Depth limit
    if (depth > this.limits.maxDepth) {
      return false;
    }

    // 2. Uniqueness check: Already visited or currently queued
    if (this.visitedUrls.has(url) || this.queuedUrls.has(url)) {
      return false;
    }

    // 3. Boundary check: Max Pages ceiling
    if (this.visitedUrls.size + this.queue.length >= this.limits.maxPages) {
      return false;
    }

    const item: CrawlItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      url,
      depth,
      referrer,
      source,
      priority,
      addedAt: Date.now(),
      retryCount: 0
    };

    this.queue.push(item);
    this.queuedUrls.add(url);

    // Sort queue: BFS by depth ascending, then priority descending
    this.queue.sort((a, b) => {
      if (a.depth !== b.depth) return a.depth - b.depth;
      return b.priority - a.priority;
    });

    return true;
  }

  /**
   * Pop the highest priority item from the queue
   */
  public dequeue(): CrawlItem | null {
    if (this.queue.length === 0) return null;

    const item = this.queue.shift()!;
    this.queuedUrls.delete(item.url);
    this.visitedUrls.add(item.url);

    return item;
  }

  /**
   * Check if a URL has already been processed or is queued
   */
  public has(url: string): boolean {
    return this.visitedUrls.has(url) || this.queuedUrls.has(url);
  }

  public isVisited(url: string): boolean {
    return this.visitedUrls.has(url);
  }

  public markVisited(url: string): void {
    this.visitedUrls.add(url);
    this.queuedUrls.delete(url);
  }

  public size(): number {
    return this.queue.length;
  }

  public visitedCount(): number {
    return this.visitedUrls.size;
  }

  public isEmpty(): boolean {
    return this.queue.length === 0;
  }

  public updateLimits(limits: Partial<CrawlLimits>): void {
    this.limits = { ...this.limits, ...limits };
  }

  public getLimits(): CrawlLimits {
    return { ...this.limits };
  }

  public clear(): void {
    this.queue = [];
    this.visitedUrls.clear();
    this.queuedUrls.clear();
  }

  public getSnapshot(): { queueSize: number; visitedCount: number; nextItemUrl?: string } {
    return {
      queueSize: this.queue.length,
      visitedCount: this.visitedUrls.size,
      nextItemUrl: this.queue[0]?.url
    };
  }
}
