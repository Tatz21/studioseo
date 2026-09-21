export type GscDateRange = '7d' | '28d' | '3m';

export interface GscMetricTotals {
  clicks: number;
  impressions: number;
  ctr: number; // percentage, e.g. 5.5
  position: number; // average rank, e.g. 11.2
  previousPeriod?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
}

export interface GscTimeSeriesPoint {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscQueryItem {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  trend: 'up' | 'down' | 'stable';
  change: number; // position change
}

export interface GscPageItem {
  url: string;
  path: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscDeviceBreakdown {
  device: 'Desktop' | 'Mobile' | 'Tablet';
  clicks: number;
  impressions: number;
  ctr: number;
  share: number; // percentage
}

export interface GscCountryItem {
  countryCode: string;
  countryName: string;
  clicks: number;
  impressions: number;
  share: number;
}

export interface GscSitemapItem {
  path: string;
  type: 'sitemap' | 'sitemap_index';
  lastSubmitted: string;
  lastDownloaded: string;
  status: 'success' | 'has_errors' | 'pending';
  discoveredUrls: number;
  indexedUrls: number;
  errorsCount: number;
}

export interface GscUrlInspectionResult {
  inspectedUrl: string;
  coverageState: 'Submitted and indexed' | 'Crawled - currently not indexed' | 'Discovered - currently not indexed' | 'Excluded';
  verdict: 'PASS' | 'NEUTRAL' | 'FAIL';
  lastCrawlTime: string;
  crawledAs: 'Googlebot smartphone' | 'Googlebot desktop';
  crawlAllowed: boolean;
  pageFetch: 'Successful' | 'Soft 404' | 'Blocked by robots.txt';
  indexingAllowed: boolean;
  userCanonical: string;
  googleCanonical: string;
  canonicalMatch: boolean;
  mobileUsability: 'Page is usable on mobile' | 'Page has mobile issues';
  richResults: string[];
}

export interface GscPropertyData {
  property: string;
  dateRange: GscDateRange;
  totals: GscMetricTotals;
  timeSeries: GscTimeSeriesPoint[];
  queries: GscQueryItem[];
  pages: GscPageItem[];
  devices: GscDeviceBreakdown[];
  countries: GscCountryItem[];
  sitemaps: GscSitemapItem[];
}
