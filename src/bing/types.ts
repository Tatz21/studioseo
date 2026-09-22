export type BingDateRange = '7d' | '28d' | '3m';

export interface BingMetricTotals {
  clicks: number;
  impressions: number;
  ctr: number; // percentage, e.g. 4.4
  position: number; // average rank, e.g. 8.6
  pagesCrawled: number;
  crawlErrors: number;
  crawlSuccessRate: number; // percentage, e.g. 98.6
  previousPeriod?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    pagesCrawled: number;
    crawlErrors: number;
  };
}

export interface BingTimeSeriesPoint {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface BingQueryItem {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface BingPageItem {
  url: string;
  path: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface BingCrawlIssue {
  id: string;
  statusCode: number;
  issueType: string;
  count: number;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  sampleUrls: string[];
}

export interface IndexNowSubmission {
  id: string;
  host: string;
  key: string;
  keyLocation?: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  urlList: string[];
  httpResponseCode: number;
  message: string;
}

export interface BingSitemapItem {
  path: string;
  type: 'sitemap' | 'sitemap_index';
  submittedDate: string;
  lastCrawlDate: string;
  status: 'success' | 'warning' | 'error';
  discoveredUrls: number;
  indexedUrls: number;
}

export interface BingPropertyData {
  property: string;
  dateRange: BingDateRange;
  totals: BingMetricTotals;
  timeSeries: BingTimeSeriesPoint[];
  queries: BingQueryItem[];
  pages: BingPageItem[];
  crawlIssues: BingCrawlIssue[];
  sitemaps: BingSitemapItem[];
  indexNowQuota: {
    dailyLimit: number;
    remaining: number;
    resetTime: string;
  };
}
