export type CompetitorType = 'direct' | 'marketplace' | 'publisher' | 'indirect';

export interface CompetitorKeywordOverlap {
  keyword: string;
  userRank: number;
  competitorRank: number;
  searchVolume: number;
  diff: number; // userRank - competitorRank (negative means user ranks better)
  serpFeatures: string[];
}

export interface CompetitorWinningKeyword {
  keyword: string;
  competitorRank: number;
  searchVolume: number;
  url: string;
  cpc: number;
}

export interface CompetitorDomain {
  id: string;
  domain: string;
  name: string;
  type: CompetitorType;
  domainRating: number; // 0 - 100
  commonKeywordsCount: number;
  totalKeywordsCount: number;
  organicTrafficMonthly: number;
  overlapScore: number; // percentage 0 - 100%
  serpCompetitionLevel: 'High' | 'Medium' | 'Low';
  backlinksEstimate: number;
  referringDomains: number;
  isManuallyAdded?: boolean;
  topOverlapKeywords: CompetitorKeywordOverlap[];
  topWinningKeywords: CompetitorWinningKeyword[];
  // 2D Positioning Map Coordinates
  quadrant: 'Leaders' | 'Established' | 'Specialists' | 'Emerging';
}

export interface UserDomainMetrics {
  domain: string;
  name: string;
  domainRating: number;
  trackedKeywordsCount: number;
  organicTrafficMonthly: number;
  backlinksEstimate: number;
  referringDomains: number;
}

export interface HeadToHeadComparison {
  user: UserDomainMetrics;
  competitor: CompetitorDomain;
  userRankAdvantageCount: number;
  competitorRankAdvantageCount: number;
  sharedKeywordsCount: number;
  trafficGap: number;
  domainRatingGap: number;
}

export interface DisplacementOpportunity {
  id: string;
  keyword: string;
  searchVolume: number;
  cpc: number;
  competitorDomain: string;
  competitorRank: number;
  userRank: number; // e.g. 8 or unranked
  vulnerabilityReason: string;
  opportunityScore: number; // 1 - 100
  actionPlan: string[];
}
