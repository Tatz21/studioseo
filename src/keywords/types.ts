export type SearchIntent = 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';

export type KeywordDevice = 'desktop' | 'mobile';

export type SerpFeature = 
  | 'Featured Snippet' 
  | 'People Also Ask' 
  | 'Local Pack' 
  | 'Video' 
  | 'SiteLinks' 
  | 'Images' 
  | 'Knowledge Panel';

export interface KeywordRankHistoryPoint {
  date: string;
  rank: number;
}

export interface TrackedKeyword {
  id: string;
  keyword: string;
  searchVolume: number;
  cpc: number;
  difficulty: number; // 0 - 100
  currentRank: number;
  previousRank: number;
  bestRank: number;
  initialRank: number;
  intent: SearchIntent;
  tags: string[];
  serpFeatures: SerpFeature[];
  targetUrl: string;
  device: KeywordDevice;
  lastUpdated: string;
  history: KeywordRankHistoryPoint[];
}

export interface KeywordStatsSummary {
  totalKeywords: number;
  inTop3: number;
  inTop10: number;
  inTop100: number;
  improvedCount: number;
  declinedCount: number;
  stableCount: number;
  avgPosition: number;
  volatilityScore: number; // 0.0 - 10.0
}

export interface KeywordFilterOptions {
  device: KeywordDevice | 'all';
  tag: string;
  intent: SearchIntent | 'all';
  search: string;
}
