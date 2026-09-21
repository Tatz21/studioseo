export interface CrawlConfig {
  crawlDepthLimit: number; // 1 to 5
  maxPagesLimit: number; // 50 to 5000
  respectRobotsTxt: boolean;
  userAgent: 'Googlebot' | 'SEOStudioBot' | 'CustomBot';
  rateLimitPerSecond: number; // 1 to 10
  includeSubdomains: boolean;
  excludePatterns: string[]; // e.g. ['/admin/*', '/checkout/*', '*.pdf']
  checkImages: boolean;
  checkCanonical: boolean;
  checkStructuredData: boolean;
}

export interface Website {
  id: string;
  orgId: string;
  domain: string;
  name: string;
  canonicalUrl: string;
  crawlConfig: CrawlConfig;
  status: 'active' | 'crawling' | 'paused';
  healthScore?: number;
  grade?: string;
  totalPagesCrawled?: number;
  lastAuditedAt?: string;
  createdAt: string;
}

export interface DomainValidationResult {
  isValid: boolean;
  normalizedUrl: string;
  domain: string;
  protocol: 'https' | 'http';
  isSsrfSafe: boolean;
  sslValid: boolean;
  robotsTxtStatus: 'available' | 'missing' | 'blocked';
  sitemapStatus: 'detected' | 'not_found';
  error?: string;
}
