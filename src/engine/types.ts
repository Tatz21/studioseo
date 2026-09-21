export type IssueSeverity = 'critical' | 'warning' | 'passed' | 'info';

export type IssueCategory = 'technical' | 'content' | 'social' | 'performance' | 'links';

export interface SeoIssue {
  id: string;
  title: string;
  category: IssueCategory;
  severity: IssueSeverity;
  description: string;
  impact: string;
  recommendation: string;
  snippet?: string;
  value?: string | number;
  expected?: string | number;
}

export interface MetaData {
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonicalUrl: string;
  robots: string;
  viewport: string;
  charset: string;
  favicon: string;
  author?: string;
  keywords?: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  ogUrl: string;
  ogSiteName: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterSite: string;
}

export interface HeadingItem {
  level: number;
  text: string;
  hasKeyword?: boolean;
}

export interface LinkItem {
  url: string;
  anchorText: string;
  isInternal: boolean;
  isNofollow: boolean;
  isBroken?: boolean;
  hasAnchorText: boolean;
}

export interface ImageItem {
  src: string;
  alt: string;
  hasAlt: boolean;
  isMissingAlt: boolean;
  width?: number;
  height?: number;
  isLazyLoaded?: boolean;
  format?: string;
}

export interface KeywordMetric {
  term: string;
  count: number;
  density: number; // percentage e.g. 2.4%
  inTitle: boolean;
  inH1: boolean;
  inH2: boolean;
  inMetaDesc: boolean;
  isWarning?: boolean;
}

export interface SchemaItem {
  type: string;
  rawJson: string;
  isValid: boolean;
  errors?: string[];
}

export interface CategoryScores {
  overall: number; // 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  technical: number;
  content: number;
  social: number;
  performance: number;
}

export interface AuditReport {
  targetUrl: string;
  timestamp: string;
  loadTimeMs: number;
  pageSizeKb: number;
  wordCount: number;
  readingEaseScore: number; // 0-100 (Flesch-Kincaid)
  readingLevel: string;
  textToHtmlRatio: number;
  scores: CategoryScores;
  metadata: MetaData;
  issues: SeoIssue[];
  headings: HeadingItem[];
  links: LinkItem[];
  images: ImageItem[];
  keywords: {
    unigrams: KeywordMetric[];
    bigrams: KeywordMetric[];
    trigrams: KeywordMetric[];
  };
  schemas: SchemaItem[];
  rawHtml?: string;
}

export interface PresetSite {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
  html: string;
}
