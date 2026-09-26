export type LlmModelId = 
  | 'chatgpt' 
  | 'gemini' 
  | 'claude' 
  | 'perplexity' 
  | 'copilot' 
  | 'meta_llama';

export interface LlmModelMetric {
  id: LlmModelId;
  name: string;
  developer: string;
  version: string;
  shareOfVoice: number; // 0 - 100%
  mentionRate: number; // 0 - 100%
  averageRank: number; // e.g. 1.4 (when mentioned)
  sentimentScore: number; // 0 - 100%
  status: 'dominant' | 'strong' | 'moderate' | 'weak';
  sampleRecommendationQuote: string;
  preferredSources: string[];
}

export interface ModelPromptVerdict {
  modelId: LlmModelId;
  modelName: string;
  mentioned: boolean;
  rank?: number;
  sentiment: 'positive' | 'neutral' | 'negative' | 'not_mentioned';
  extractedQuote: string;
  hasCitingUrl: boolean;
  confidenceScore: number; // 0 - 100%
}

export interface PromptBenchmarkItem {
  id: string;
  prompt: string;
  category: 'Commercial Intent' | 'Vendor Recommendation' | 'Technical Comparison' | 'Local Discovery';
  importance: 'high' | 'medium' | 'critical';
  targetBrandMentioned: boolean;
  bestRank: number | null;
  overallSentiment: 'positive' | 'neutral' | 'mixed' | 'absent';
  modelVerdicts: Record<LlmModelId, ModelPromptVerdict>;
  competingBrandsMentioned: string[];
  recommendedPlay: string;
}

export interface CompetitorAiSoV {
  domain: string;
  brandName: string;
  isTargetBrand: boolean;
  shareOfVoice: number; // 0 - 100%
  mentionCount: number;
  topWinningModels: string[];
  citationDominanceSources: string[];
  headToHeadWins: number;
  headToHeadLosses: number;
}

export interface BrandAttributeAssociation {
  attribute: string;
  category: 'strength' | 'specialization' | 'market_position' | 'neutral';
  frequency: number;
  sentimentWeight: number; // -1.0 to +1.0
  sampleSnippet: string;
}

export interface HallucinationAlert {
  id: string;
  modelId: LlmModelId;
  modelName: string;
  issueType: 'Outdated Info' | 'Factual Inaccuracy' | 'Misattributed Service' | 'Incorrect Pricing';
  severity: 'critical' | 'warning' | 'info';
  hallucinatedClaim: string;
  actualFact: string;
  remediationAction: string;
}

export interface AiCrawlerBotStatus {
  botName: string;
  owner: string;
  userAgent: string;
  purpose: 'Search & Retrieval' | 'Model Training' | 'Hybrid';
  currentStatus: 'allowed' | 'blocked' | 'restricted';
  impactOnAiVisibility: 'high' | 'critical' | 'medium';
  recommendedDirective: string;
}

export interface AiVisibilityAnalysis {
  targetUrl: string;
  targetDomain: string;
  analyzedAt: string;
  aiVisibilityIndex: number; // 0 - 100
  shareOfVoicePercentage: number; // 0 - 100%
  overallSentimentScore: number; // 0 - 100%
  averageRecommendationRank: number;
  totalPromptsTested: number;
  brandMentionedPromptsCount: number;

  models: LlmModelMetric[];
  prompts: PromptBenchmarkItem[];
  competitors: CompetitorAiSoV[];
  attributes: BrandAttributeAssociation[];
  hallucinations: HallucinationAlert[];
  crawlerBots: AiCrawlerBotStatus[];
  
  generatedRobotsPolicy: {
    maxVisibilitySnippet: string;
    privacyBalancedSnippet: string;
  };

  actionRoadmap: {
    id: string;
    priority: 'critical' | 'high' | 'medium';
    targetModels: string[];
    title: string;
    description: string;
    estimatedSoVLift: string;
  }[];
}
