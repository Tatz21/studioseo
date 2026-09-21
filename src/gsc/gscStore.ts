import { GscPropertyData, GscDateRange, GscSitemapItem } from './types';

const SITEMAP_STORAGE_KEY = 'seo_gsc_sitemaps_v1';

export class GscStore {
  public static getAvailableProperties(): string[] {
    return [
      'sc-domain:techflow.io',
      'https://techflow.io',
      'https://example.com'
    ];
  }

  public static getPropertyData(property: string = 'sc-domain:techflow.io', dateRange: GscDateRange = '28d'): GscPropertyData {
    // Dynamic multiplier based on date range
    const mult = dateRange === '7d' ? 0.25 : dateRange === '3m' ? 3.1 : 1.0;

    const baseClicks = Math.round(78450 * mult);
    const baseImpressions = Math.round(1420000 * mult);
    const ctr = 5.5;
    const position = 11.2;

    // Generate time series points
    const daysCount = dateRange === '7d' ? 7 : dateRange === '28d' ? 28 : 90;
    const timeSeries = [];
    const now = Date.now();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dailyClicks = Math.round((baseClicks / daysCount) * (0.8 + Math.sin(i * 0.5) * 0.35));
      const dailyImpressions = Math.round((baseImpressions / daysCount) * (0.85 + Math.cos(i * 0.4) * 0.3));

      timeSeries.push({
        date: dateStr,
        clicks: dailyClicks,
        impressions: dailyImpressions,
        ctr: Number(((dailyClicks / dailyImpressions) * 100).toFixed(2)),
        position: Number((10.5 + Math.sin(i * 0.2) * 1.5).toFixed(1)),
      });
    }

    const queries = [
      { query: 'enterprise seo crawler', clicks: Math.round(14200 * mult), impressions: Math.round(184000 * mult), ctr: 7.7, position: 2.8, trend: 'up' as const, change: 1.4 },
      { query: 'real time serp tracker', clicks: Math.round(11850 * mult), impressions: Math.round(162000 * mult), ctr: 7.3, position: 3.4, trend: 'up' as const, change: 0.8 },
      { query: 'core web vitals audit api', clicks: Math.round(9420 * mult), impressions: Math.round(145000 * mult), ctr: 6.5, position: 4.1, trend: 'up' as const, change: 2.1 },
      { query: 'internal link equity graph', clicks: Math.round(7800 * mult), impressions: Math.round(128000 * mult), ctr: 6.1, position: 5.2, trend: 'stable' as const, change: 0.1 },
      { query: 'technical seo checklist 2026', clicks: Math.round(6940 * mult), impressions: Math.round(110000 * mult), ctr: 6.3, position: 4.8, trend: 'down' as const, change: -0.9 },
      { query: 'automated schema json ld generator', clicks: Math.round(5820 * mult), impressions: Math.round(98000 * mult), ctr: 5.9, position: 6.5, trend: 'up' as const, change: 1.2 },
      { query: 'orphan page detection', clicks: Math.round(4910 * mult), impressions: Math.round(89000 * mult), ctr: 5.5, position: 7.1, trend: 'stable' as const, change: 0.0 },
      { query: 'website crawl budget optimizer', clicks: Math.round(4120 * mult), impressions: Math.round(76000 * mult), ctr: 5.4, position: 8.3, trend: 'up' as const, change: 0.7 },
      { query: 'cls layout shift remediation', clicks: Math.round(3650 * mult), impressions: Math.round(68000 * mult), ctr: 5.3, position: 9.0, trend: 'down' as const, change: -1.1 },
      { query: 'googlebot smartphone crawl emulator', clicks: Math.round(2950 * mult), impressions: Math.round(54000 * mult), ctr: 5.4, position: 9.8, trend: 'up' as const, change: 0.5 },
    ];

    const pages = [
      { url: 'https://techflow.io/', path: '/', clicks: Math.round(28400 * mult), impressions: Math.round(420000 * mult), ctr: 6.8, position: 3.1 },
      { url: 'https://techflow.io/features/seo-crawler', path: '/features/seo-crawler', clicks: Math.round(18900 * mult), impressions: Math.round(280000 * mult), ctr: 6.7, position: 3.8 },
      { url: 'https://techflow.io/pricing', path: '/pricing', clicks: Math.round(12400 * mult), impressions: Math.round(195000 * mult), ctr: 6.3, position: 4.5 },
      { url: 'https://techflow.io/blog/technical-seo-guide', path: '/blog/technical-seo-guide', clicks: Math.round(8900 * mult), impressions: Math.round(155000 * mult), ctr: 5.7, position: 5.9 },
      { url: 'https://techflow.io/docs/quickstart', path: '/docs/quickstart', clicks: Math.round(6200 * mult), impressions: Math.round(112000 * mult), ctr: 5.5, position: 7.2 },
    ];

    const devices = [
      { device: 'Desktop' as const, clicks: Math.round(baseClicks * 0.54), impressions: Math.round(baseImpressions * 0.52), ctr: 5.7, share: 54 },
      { device: 'Mobile' as const, clicks: Math.round(baseClicks * 0.42), impressions: Math.round(baseImpressions * 0.44), ctr: 5.2, share: 42 },
      { device: 'Tablet' as const, clicks: Math.round(baseClicks * 0.04), impressions: Math.round(baseImpressions * 0.04), ctr: 5.5, share: 4 },
    ];

    const countries = [
      { countryCode: 'US', countryName: 'United States', clicks: Math.round(baseClicks * 0.45), impressions: Math.round(baseImpressions * 0.44), share: 45 },
      { countryCode: 'GB', countryName: 'United Kingdom', clicks: Math.round(baseClicks * 0.16), impressions: Math.round(baseImpressions * 0.15), share: 16 },
      { countryCode: 'DE', countryName: 'Germany', clicks: Math.round(baseClicks * 0.12), impressions: Math.round(baseImpressions * 0.13), share: 12 },
      { countryCode: 'IN', countryName: 'India', clicks: Math.round(baseClicks * 0.10), impressions: Math.round(baseImpressions * 0.11), share: 10 },
      { countryCode: 'CA', countryName: 'Canada', clicks: Math.round(baseClicks * 0.08), impressions: Math.round(baseImpressions * 0.08), share: 8 },
    ];

    const sitemaps = this.getSitemaps();

    return {
      property,
      dateRange,
      totals: {
        clicks: baseClicks,
        impressions: baseImpressions,
        ctr,
        position,
        previousPeriod: {
          clicks: Math.round(baseClicks * 0.88),
          impressions: Math.round(baseImpressions * 0.91),
          ctr: 5.3,
          position: 12.1,
        },
      },
      timeSeries,
      queries,
      pages,
      devices,
      countries,
      sitemaps,
    };
  }

  public static getSitemaps(): GscSitemapItem[] {
    try {
      const raw = localStorage.getItem(SITEMAP_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }

    const defaultSitemaps: GscSitemapItem[] = [
      {
        path: '/sitemap_index.xml',
        type: 'sitemap_index',
        lastSubmitted: '2026-09-18T10:30:00Z',
        lastDownloaded: '2026-09-21T06:15:00Z',
        status: 'success',
        discoveredUrls: 48,
        indexedUrls: 47,
        errorsCount: 0,
      },
      {
        path: '/sitemap-posts.xml',
        type: 'sitemap',
        lastSubmitted: '2026-09-19T14:20:00Z',
        lastDownloaded: '2026-09-21T06:16:00Z',
        status: 'success',
        discoveredUrls: 24,
        indexedUrls: 23,
        errorsCount: 0,
      },
      {
        path: '/sitemap-docs.xml',
        type: 'sitemap',
        lastSubmitted: '2026-09-19T14:21:00Z',
        lastDownloaded: '2026-09-21T06:17:00Z',
        status: 'success',
        discoveredUrls: 18,
        indexedUrls: 18,
        errorsCount: 0,
      },
    ];

    this.saveSitemaps(defaultSitemaps);
    return defaultSitemaps;
  }

  public static addSitemap(item: GscSitemapItem): GscSitemapItem[] {
    const current = this.getSitemaps();
    const updated = [item, ...current.filter(s => s.path !== item.path)];
    this.saveSitemaps(updated);
    return updated;
  }

  private static saveSitemaps(items: GscSitemapItem[]): void {
    try {
      localStorage.setItem(SITEMAP_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }
}
