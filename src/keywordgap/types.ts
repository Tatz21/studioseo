export type GapStatus = 'all' | 'missing' | 'weak' | 'strong' | 'shared';

export interface KeywordGapItem {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  intent: 'Commercial' | 'Transactional' | 'Informational' | 'Navigational';
  targetRank: number | null;
  competitorRanks: Record<string, number | null>;
  gapStatus: 'missing' | 'weak' | 'strong' | 'shared';
  opportunityScore: number;
  recommendedAction: string;
}

export interface GapSummaryMetrics {
  totalCompared: number;
  missingCount: number;
  weakCount: number;
  strongCount: number;
  sharedCount: number;
  estimatedTrafficPotential: number;
}

export interface ArbitrageOpportunity {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  intent: 'Commercial' | 'Transactional' | 'Informational' | 'Navigational';
  bestCompetitorRank?: number;
  bestCompetitorDomain?: string;
  opportunityScore: number;
  recommendedAction: string;
}

export interface KeywordGapResponse {
  success: boolean;
  targetDomain: string;
  competitorDomains: string[];
  totalCompared: number;
  metrics: GapSummaryMetrics;
  items: KeywordGapItem[];
  arbitrageOpportunities: ArbitrageOpportunity[];
  timestamp: string;
}

export interface VennSegmentDistribution {
  id: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  gapStatus: GapStatus;
  description: string;
}
