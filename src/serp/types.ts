export type SerpEngine = 'google' | 'bing' | 'yahoo' | 'duckduckgo';

export type SerpCountry = 'US' | 'UK' | 'CA' | 'AU' | 'DE' | 'FR' | 'IN' | 'Global';

export type SerpDevice = 'desktop' | 'mobile';

export type SerpBadge = 'sitelinks' | 'video' | 'schema' | 'faq' | 'stars' | 'author' | 'https';

export interface SerpSitelink {
  title: string;
  url: string;
  snippet?: string;
}

export interface SerpResultItem {
  rank: number;
  title: string;
  url: string;
  domain: string;
  displayUrl: string;
  breadcrumbs: string[];
  snippet: string;
  datePublished?: string;
  favicon?: string;
  badges: SerpBadge[];
  sitelinks?: SerpSitelink[];
  rating?: {
    value: number;
    count: number;
  };
  estimatedCtr: number; // percentage, e.g. 28.5%
  estimatedTraffic: number; // estimated monthly visits based on search volume * CTR
  domainAuthorityScore: number; // 0 - 100 estimated authority
  isUserDomain: boolean;
}

export interface SerpPaaItem {
  question: string;
  answerSnippet: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceDomain: string;
}

export interface SerpFeaturedSnippet {
  type: 'paragraph' | 'list' | 'table';
  title: string;
  content: string;
  listItems?: string[];
  tableHeaders?: string[];
  tableRows?: string[][];
  sourceTitle: string;
  sourceUrl: string;
  sourceDomain: string;
  ownedByUser: boolean;
}

export interface SerpKnowledgePanel {
  title: string;
  subtitle: string;
  description: string;
  imageUrl?: string;
  attributes: { label: string; value: string }[];
  wikiUrl?: string;
}

export interface SerpVideoItem {
  title: string;
  source: string;
  duration: string;
  channel: string;
  uploadedDate: string;
  thumbnailUrl?: string;
  url: string;
}

export interface SerpQuery {
  keyword: string;
  engine: SerpEngine;
  country: SerpCountry;
  device: SerpDevice;
  language: string;
}

export interface SerpAnalysisResponse {
  query: SerpQuery;
  searchVolume: number;
  cpc: number;
  difficulty: number;
  totalOrganicResults: number;
  searchTimeSeconds: number;
  timestamp: string;
  featuredSnippet?: SerpFeaturedSnippet;
  peopleAlsoAsk: SerpPaaItem[];
  knowledgePanel?: SerpKnowledgePanel;
  videos?: SerpVideoItem[];
  relatedSearches: string[];
  organicResults: SerpResultItem[];
  userRanking?: {
    rank: number;
    url: string;
    trafficShare: number;
  };
}

export interface SerpVolatilityCategory {
  category: string;
  volatility: number; // 0.0 - 10.0
  delta: number; // change from yesterday
  status: 'calm' | 'normal' | 'high' | 'storm';
}

export interface SerpAlgorithmUpdate {
  id: string;
  date: string;
  name: string;
  severity: 'critical' | 'high' | 'medium';
  impactDescription: string;
  confirmedByGoogle: boolean;
  categoriesImpacted: string[];
}

export interface SerpVolatilityData {
  overallScore: number; // 0.0 - 10.0
  status: 'calm' | 'normal' | 'high' | 'storm';
  date: string;
  history14Days: { date: string; score: number }[];
  categories: SerpVolatilityCategory[];
  recentUpdates: SerpAlgorithmUpdate[];
}

export interface SerpOpportunityItem {
  id: string;
  keyword: string;
  searchVolume: number;
  feature: 'Featured Snippet' | 'People Also Ask' | 'Sitelinks' | 'Review Stars' | 'Video Carousel';
  currentOwner: string;
  userRank: number;
  opportunityType: 'Capture Snippet' | 'Add FAQ Schema' | 'Table Optimization' | 'Review Markup' | 'Video Indexing';
  difficulty: 'Low' | 'Medium' | 'High';
  potentialTrafficGain: string;
  actionableSteps: string[];
}
