import { Website, CrawlConfig } from './types';

const STORAGE_KEY = 'seo_studio_websites_registry';

export const DEFAULT_CRAWL_CONFIG: CrawlConfig = {
  crawlDepthLimit: 3,
  maxPagesLimit: 500,
  respectRobotsTxt: true,
  userAgent: 'SEOStudioBot',
  rateLimitPerSecond: 3,
  includeSubdomains: false,
  excludePatterns: ['/admin/*', '/checkout/*', '/cart/*', '*.pdf'],
  checkImages: true,
  checkCanonical: true,
  checkStructuredData: true
};

const INITIAL_WEBSITES: Website[] = [
  {
    id: 'w1000000-0000-0000-0000-000000000001',
    orgId: 'e1000000-0000-0000-0000-000000000001',
    domain: 'timelinerskolkata.com',
    name: 'The Timeliners Kolkata',
    canonicalUrl: 'https://timelinerskolkata.com',
    crawlConfig: {
      ...DEFAULT_CRAWL_CONFIG,
      crawlDepthLimit: 3,
      maxPagesLimit: 500,
      userAgent: 'Googlebot'
    },
    status: 'active',
    healthScore: 94,
    grade: 'A',
    totalPagesCrawled: 45,
    lastAuditedAt: '2026-09-20T12:00:00.000Z',
    createdAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'w1000000-0000-0000-0000-000000000002',
    orgId: 'e1000000-0000-0000-0000-000000000002',
    domain: 'apexrank.ai',
    name: 'ApexRank AI Platform',
    canonicalUrl: 'https://apexrank.ai',
    crawlConfig: {
      ...DEFAULT_CRAWL_CONFIG,
      crawlDepthLimit: 2,
      maxPagesLimit: 250,
      userAgent: 'SEOStudioBot'
    },
    status: 'active',
    healthScore: 91,
    grade: 'A',
    totalPagesCrawled: 28,
    lastAuditedAt: '2026-09-18T14:30:00.000Z',
    createdAt: '2026-02-15T14:00:00.000Z'
  }
];

export class WebsiteStore {
  private websites: Website[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.websites = JSON.parse(raw);
      } else {
        this.websites = [...INITIAL_WEBSITES];
        this.saveToStorage();
      }
    } catch {
      this.websites = [...INITIAL_WEBSITES];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.websites));
    } catch (e) {
      console.warn('Could not save websites to localStorage', e);
    }
  }

  public getWebsites(): Website[] {
    return [...this.websites];
  }

  public getWebsiteById(id: string): Website | undefined {
    return this.websites.find(w => w.id === id);
  }

  public addWebsite(params: {
    domain: string;
    name: string;
    canonicalUrl: string;
    orgId?: string;
    crawlConfig?: Partial<CrawlConfig>;
  }): Website {
    const newWebsite: Website = {
      id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orgId: params.orgId || 'e1000000-0000-0000-0000-000000000001',
      domain: params.domain.toLowerCase(),
      name: params.name.trim() || params.domain,
      canonicalUrl: params.canonicalUrl,
      crawlConfig: {
        ...DEFAULT_CRAWL_CONFIG,
        ...(params.crawlConfig || {})
      },
      status: 'active',
      totalPagesCrawled: 0,
      createdAt: new Date().toISOString()
    };

    this.websites.unshift(newWebsite);
    this.saveToStorage();
    return newWebsite;
  }

  public updateWebsite(id: string, updates: Partial<Website>): Website {
    const idx = this.websites.findIndex(w => w.id === id);
    if (idx === -1) {
      throw new Error(`Website with id ${id} not found.`);
    }

    this.websites[idx] = {
      ...this.websites[idx],
      ...updates,
      crawlConfig: {
        ...this.websites[idx].crawlConfig,
        ...(updates.crawlConfig || {})
      }
    };

    this.saveToStorage();
    return this.websites[idx];
  }

  public deleteWebsite(id: string): void {
    this.websites = this.websites.filter(w => w.id !== id);
    this.saveToStorage();
  }
}

export const websiteStore = new WebsiteStore();
