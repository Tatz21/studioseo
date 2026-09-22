import { BingPropertyData, BingDateRange, BingSitemapItem, IndexNowSubmission, BingCrawlIssue } from './types';

const INDEXNOW_STORAGE_KEY = 'seo_bing_indexnow_submissions_v1';
const BING_SITEMAP_STORAGE_KEY = 'seo_bing_sitemaps_v1';

export class BingStore {
  public static getAvailableProperties(): string[] {
    return [
      'techflow.io',
      'example.com',
      'timeliners.in'
    ];
  }

  public static getPropertyData(property: string = 'techflow.io', dateRange: BingDateRange = '28d'): BingPropertyData {
    const mult = dateRange === '7d' ? 0.25 : dateRange === '3m' ? 3.1 : 1.0;

    const baseClicks = Math.round(21480 * mult);
    const baseImpressions = Math.round(485000 * mult);
    const ctr = 4.4;
    const position = 8.6;
    const pagesCrawled = Math.round(3420 * mult);
    const crawlErrors = Math.round(48 * mult);
    const crawlSuccessRate = 98.6;

    // Time series points
    const daysCount = dateRange === '7d' ? 7 : dateRange === '28d' ? 28 : 90;
    const timeSeries = [];
    const now = Date.now();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dailyClicks = Math.round((baseClicks / daysCount) * (0.8 + Math.sin(i * 0.45) * 0.3));
      const dailyImpressions = Math.round((baseImpressions / daysCount) * (0.85 + Math.cos(i * 0.35) * 0.25));

      timeSeries.push({
        date: dateStr,
        clicks: dailyClicks,
        impressions: dailyImpressions,
        ctr: Number(((dailyClicks / dailyImpressions) * 100).toFixed(2)),
        position: Number((8.2 + Math.sin(i * 0.3) * 0.9).toFixed(1)),
      });
    }

    const queries = [
      { query: 'enterprise seo platform', clicks: Math.round(4250 * mult), impressions: Math.round(76000 * mult), ctr: 5.6, position: 2.3, trend: 'up' as const, change: 0.8 },
      { query: 'copilot search optimization', clicks: Math.round(3820 * mult), impressions: Math.round(68000 * mult), ctr: 5.6, position: 1.9, trend: 'up' as const, change: 1.4 },
      { query: 'indexnow instant indexing tool', clicks: Math.round(3150 * mult), impressions: Math.round(59000 * mult), ctr: 5.3, position: 2.1, trend: 'up' as const, change: 1.2 },
      { query: 'bing webmaster api connector', clicks: Math.round(2640 * mult), impressions: Math.round(49000 * mult), ctr: 5.4, position: 3.4, trend: 'stable' as const, change: 0.0 },
      { query: 'website crawl budget audit', clicks: Math.round(2180 * mult), impressions: Math.round(42000 * mult), ctr: 5.2, position: 4.8, trend: 'down' as const, change: -0.6 },
      { query: 'technical seo audit 2026', clicks: Math.round(1890 * mult), impressions: Math.round(38000 * mult), ctr: 5.0, position: 5.2, trend: 'up' as const, change: 0.5 },
      { query: 'schema org generator react', clicks: Math.round(1450 * mult), impressions: Math.round(31000 * mult), ctr: 4.7, position: 6.8, trend: 'stable' as const, change: 0.2 },
      { query: 'internal link structure analyzer', clicks: Math.round(1240 * mult), impressions: Math.round(27000 * mult), ctr: 4.6, position: 7.4, trend: 'down' as const, change: -0.8 },
    ];

    const pages = [
      { url: `https://${property}/`, path: '/', clicks: Math.round(8400 * mult), impressions: Math.round(165000 * mult), ctr: 5.1, position: 2.4 },
      { url: `https://${property}/features/seo-crawler`, path: '/features/seo-crawler', clicks: Math.round(5200 * mult), impressions: Math.round(98000 * mult), ctr: 5.3, position: 3.1 },
      { url: `https://${property}/features/indexnow`, path: '/features/indexnow', clicks: Math.round(3900 * mult), impressions: Math.round(72000 * mult), ctr: 5.4, position: 2.8 },
      { url: `https://${property}/pricing`, path: '/pricing', clicks: Math.round(2400 * mult), impressions: Math.round(54000 * mult), ctr: 4.4, position: 4.5 },
      { url: `https://${property}/docs`, path: '/docs', clicks: Math.round(1580 * mult), impressions: Math.round(38000 * mult), ctr: 4.2, position: 6.1 },
    ];

    const crawlIssues: BingCrawlIssue[] = [
      {
        id: 'issue_404',
        statusCode: 404,
        issueType: 'Not Found (404)',
        count: 24,
        description: 'Bingbot received 404 HTTP responses when attempting to fetch pages linked from internal markup.',
        severity: 'critical',
        sampleUrls: [
          `https://${property}/old-pricing-v1`,
          `https://${property}/assets/legacy-guide.pdf`,
          `https://${property}/blog/obsolete-2023-tips`
        ]
      },
      {
        id: 'issue_robots',
        statusCode: 403,
        issueType: 'Blocked by Robots.txt',
        count: 15,
        description: 'Disallowed directives in robots.txt prevented Bingbot from indexing resources.',
        severity: 'warning',
        sampleUrls: [
          `https://${property}/admin/dashboard`,
          `https://${property}/api/internal/session`
        ]
      },
      {
        id: 'issue_500',
        statusCode: 500,
        issueType: 'Server Error (500)',
        count: 6,
        description: 'Internal server errors occurred during Bingbot requests, indicating backend bottlenecks.',
        severity: 'critical',
        sampleUrls: [
          `https://${property}/api/v1/export/heavy-report`
        ]
      },
      {
        id: 'issue_schema',
        statusCode: 200,
        issueType: 'Schema Parsing Warning',
        count: 3,
        description: 'JSON-LD schema found on page but missing recommended field "aggregateRating".',
        severity: 'info',
        sampleUrls: [
          `https://${property}/features/seo-crawler`
        ]
      }
    ];

    const sitemaps = this.getSitemaps(property);
    const indexNowSubmissions = this.getIndexNowSubmissions();
    const totalSubmittedUrls = indexNowSubmissions.reduce((acc, s) => acc + s.urlList.length, 0);

    return {
      property,
      dateRange,
      totals: {
        clicks: baseClicks,
        impressions: baseImpressions,
        ctr,
        position,
        pagesCrawled,
        crawlErrors,
        crawlSuccessRate,
        previousPeriod: {
          clicks: Math.round(baseClicks * 0.86),
          impressions: Math.round(baseImpressions * 0.92),
          ctr: 4.1,
          position: 9.7,
          pagesCrawled: Math.round(pagesCrawled * 0.88),
          crawlErrors: Math.round(crawlErrors * 1.2),
        }
      },
      timeSeries,
      queries,
      pages,
      crawlIssues,
      sitemaps,
      indexNowQuota: {
        dailyLimit: 10000,
        remaining: Math.max(0, 10000 - totalSubmittedUrls),
        resetTime: 'Midnight UTC'
      }
    };
  }

  public static getSitemaps(property: string): BingSitemapItem[] {
    try {
      const raw = localStorage.getItem(BING_SITEMAP_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }

    const defaultSitemaps: BingSitemapItem[] = [
      {
        path: `https://${property}/sitemap_index.xml`,
        type: 'sitemap_index',
        submittedDate: '2026-09-17T08:15:00Z',
        lastCrawlDate: '2026-09-21T18:30:00Z',
        status: 'success',
        discoveredUrls: 48,
        indexedUrls: 47,
      },
      {
        path: `https://${property}/sitemap-products.xml`,
        type: 'sitemap',
        submittedDate: '2026-09-18T11:20:00Z',
        lastCrawlDate: '2026-09-21T18:31:00Z',
        status: 'success',
        discoveredUrls: 24,
        indexedUrls: 24,
      }
    ];

    this.saveSitemaps(defaultSitemaps);
    return defaultSitemaps;
  }

  public static addSitemap(item: BingSitemapItem): BingSitemapItem[] {
    const current = this.getSitemaps('techflow.io');
    const updated = [item, ...current.filter(s => s.path !== item.path)];
    this.saveSitemaps(updated);
    return updated;
  }

  private static saveSitemaps(items: BingSitemapItem[]): void {
    try {
      localStorage.setItem(BING_SITEMAP_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }

  public static getIndexNowSubmissions(): IndexNowSubmission[] {
    try {
      const raw = localStorage.getItem(INDEXNOW_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }

    const defaultSubmissions: IndexNowSubmission[] = [
      {
        id: 'in_init_01',
        host: 'techflow.io',
        key: '53f83d769b72489ebfe22c65c86d5f96',
        keyLocation: 'https://techflow.io/53f83d769b72489ebfe22c65c86d5f96.txt',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'success',
        urlList: [
          'https://techflow.io/features/seo-crawler',
          'https://techflow.io/features/indexnow'
        ],
        httpResponseCode: 200,
        message: 'Successfully accepted 2 URL(s) into Bing IndexNow queue.'
      },
      {
        id: 'in_init_02',
        host: 'techflow.io',
        key: '53f83d769b72489ebfe22c65c86d5f96',
        keyLocation: 'https://techflow.io/53f83d769b72489ebfe22c65c86d5f96.txt',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        status: 'success',
        urlList: [
          'https://techflow.io/blog/technical-seo-guide-2026'
        ],
        httpResponseCode: 200,
        message: 'Successfully accepted 1 URL(s) into Bing IndexNow queue.'
      }
    ];

    this.saveIndexNowSubmissions(defaultSubmissions);
    return defaultSubmissions;
  }

  public static addIndexNowSubmission(sub: IndexNowSubmission): IndexNowSubmission[] {
    const current = this.getIndexNowSubmissions();
    const updated = [sub, ...current];
    this.saveIndexNowSubmissions(updated);
    return updated;
  }

  private static saveIndexNowSubmissions(items: IndexNowSubmission[]): void {
    try {
      localStorage.setItem(INDEXNOW_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }
}
