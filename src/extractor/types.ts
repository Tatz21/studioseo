/**
 * Phase 6: SEO Data Extraction - Data Contracts & Types
 */

export interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

export interface TwitterCardData {
  card?: string;
  title?: string;
  description?: string;
  image?: string;
  site?: string;
  creator?: string;
}

export interface MetaRobotsDirectives {
  noindex: boolean;
  nofollow: boolean;
  noarchive: boolean;
  nosnippet: boolean;
  noimageindex: boolean;
  maxSnippet?: number;
  maxImagePreview?: 'none' | 'standard' | 'large';
  rawContent?: string;
}

export interface ExtractedMetadata {
  title: string;
  titleLength: number;
  titlePixelWidth: number; // Estimated SERP pixel width
  description: string;
  descriptionLength: number;
  robots: MetaRobotsDirectives;
  openGraph: OpenGraphData;
  twitter: TwitterCardData;
  charset: string;
  language?: string;
  viewport?: string;
  hasFavicon: boolean;
  faviconUrl?: string;
}

export interface HeadingNode {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  characterLength: number;
  isEmpty: boolean;
  domIndex: number;
}

export interface HeadingsHierarchyReport {
  nodes: HeadingNode[];
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h4Count: number;
  h5Count: number;
  h6Count: number;
  totalHeadings: number;
  hasSingleH1: boolean;
  hasSkippedLevels: boolean;
  skippedLevelIssues: string[];
  emptyHeadingsCount: number;
}

export interface HreflangAlternate {
  hreflang: string;
  href: string;
  isXDefault: boolean;
}

export interface ExtractedCanonical {
  canonicalUrl?: string;
  hasCanonical: boolean;
  isSelfReferential: boolean;
  isCrossDomain: boolean;
  isAbsolute: boolean;
  hreflangAlternates: HreflangAlternate[];
  warnings: string[];
}

export interface ExtractedLinkItem {
  id: string;
  url: string;
  anchorText: string;
  isInternal: boolean;
  isNofollow: boolean;
  isSponsored: boolean;
  isUgc: boolean;
  target?: string;
  relAttributes: string[];
  isGenericAnchor: boolean; // e.g. "click here", "read more"
}

export interface LinksExtractionReport {
  totalLinks: number;
  internalCount: number;
  externalCount: number;
  nofollowCount: number;
  sponsoredCount: number;
  ugcCount: number;
  genericAnchorCount: number;
  emptyAnchorCount: number;
  links: ExtractedLinkItem[];
}

export interface ExtractedImageItem {
  id: string;
  src: string;
  altText: string;
  hasAlt: boolean;
  isAltEmpty: boolean;
  format: 'webp' | 'avif' | 'svg' | 'png' | 'jpg' | 'gif' | 'unknown';
  isModernFormat: boolean;
  width?: number;
  height?: number;
  hasDimensions: boolean; // Vital for CLS prevention
  isLazy: boolean;
}

export interface ImagesExtractionReport {
  totalImages: number;
  missingAltCount: number;
  emptyAltCount: number;
  missingDimensionsCount: number;
  modernFormatCount: number;
  lazyLoadedCount: number;
  images: ExtractedImageItem[];
}

export interface ExtractedSchemaItem {
  id: string;
  type: 'json-ld' | 'microdata';
  schemaType: string; // e.g. "LocalBusiness", "Organization", "Article"
  rawContent: string;
  parsedData?: any;
  isValidJson: boolean;
  error?: string;
  warnings: string[];
}

export interface SchemaExtractionReport {
  hasStructuredData: boolean;
  jsonLdCount: number;
  microdataCount: number;
  detectedTypes: string[];
  schemas: ExtractedSchemaItem[];
  validationErrors: string[];
}

export interface ExtractedContentMetrics {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  paragraphCount: number;
  htmlToTextRatio: number; // percentage
  readingEaseScore: number; // 0 to 100
  readingLevel: string;
}

export interface ExtractedPageData {
  id: string;
  url: string;
  domain: string;
  extractedAt: string;
  statusCode: number;
  loadTimeMs: number;
  pageSizeKb: number;
  metadata: ExtractedMetadata;
  headings: HeadingsHierarchyReport;
  canonical: ExtractedCanonical;
  links: LinksExtractionReport;
  images: ImagesExtractionReport;
  schema: SchemaExtractionReport;
  content: ExtractedContentMetrics;
}
