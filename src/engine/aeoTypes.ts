export type AnswerEngineId = 
  | 'google_ai_overview' 
  | 'perplexity' 
  | 'chatgpt_search' 
  | 'copilot' 
  | 'voice_search' 
  | 'featured_snippet';

export interface AnswerEngineScore {
  id: AnswerEngineId;
  name: string;
  category: 'AI Generative' | 'Hybrid Search' | 'Voice' | 'Featured SERP';
  score: number; // 0 - 100
  citationProbability: number; // 0 - 100%
  status: 'optimal' | 'moderate' | 'needs_work';
  badge: string;
  iconName: string;
  description: string;
  primaryStrengths: string[];
  keyVulnerabilities: string[];
}

export interface InvertedPyramidAnalysis {
  hasDirectAnswer: boolean;
  leadParagraphWords: number;
  optimalRange: [number, number]; // [40, 60] words
  concisenessScore: number; // 0 - 100
  detectedSnippet: string;
  status: 'passed' | 'warning' | 'critical';
  recommendation: string;
}

export interface QuestionHeadingAudit {
  id: string;
  headingText: string;
  level: 'h2' | 'h3' | 'h4';
  isQuestionFormat: boolean;
  questionType: 'what' | 'how' | 'why' | 'cost' | 'best' | 'comparison' | 'general';
  hasImmediateAnswerUnderneath: boolean;
  directAnswerWordCount: number;
  informationGainRating: 'high' | 'medium' | 'low';
}

export interface InformationGainSignal {
  id: string;
  label: string;
  foundCount: number;
  status: 'passed' | 'warning' | 'missing';
  description: string;
  examples: string[];
}

export interface AeoSchemaAuditItem {
  type: 'FAQPage' | 'HowTo' | 'Speakable' | 'QAPage' | 'ClaimReview' | 'Article';
  detected: boolean;
  isValid: boolean;
  itemsCount: number;
  importance: 'critical' | 'high' | 'medium';
  impactExplanation: string;
  jsonLdSnippet?: string;
}

export interface AeoQueryOpportunity {
  id: string;
  query: string;
  intent: 'Informational' | 'How-To' | 'Commercial' | 'Comparative';
  searchVolume: number;
  aiOverviewTriggerRate: number; // 0 - 100%
  brandCited: boolean;
  brandCitationPosition?: number;
  dominatingSource: string;
  difficultyScore: number; // 0 - 100
  recommendedFormat: 'Direct Paragraph (40-60w)' | 'Step-by-Step List' | 'Comparison Table' | 'Definition Block';
  estimatedTrafficPotential: string;
}

export interface SimulatedSourceCard {
  domain: string;
  siteName: string;
  pageTitle: string;
  url: string;
  faviconUrl?: string;
  isTargetDomain: boolean;
  citationIndex?: number;
  snippetQuote: string;
}

export interface SimulatedEngineResponse {
  engineId: AnswerEngineId;
  engineName: string;
  query: string;
  synthesizedAnswer: string;
  markdownAnswer: string;
  targetDomainCited: boolean;
  citationIndex?: number;
  sourceCards: SimulatedSourceCard[];
  followUpQueries: string[];
  spokenText?: string;
  spokenDurationSeconds?: number;
  readingGradeLevel?: string;
}

export interface AeoAnalysis {
  targetUrl: string;
  targetDomain: string;
  analyzedAt: string;
  overallAeoScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  citationLikelihoodScore: number; // 0 - 100%
  informationGainScore: number; // 0 - 100%
  schemaCompletenessScore: number; // 0 - 100%
  voiceReadinessScore: number; // 0 - 100%
  
  engineScores: AnswerEngineScore[];
  invertedPyramid: InvertedPyramidAnalysis;
  questionHeadings: QuestionHeadingAudit[];
  informationGainSignals: InformationGainSignal[];
  schemaAudit: AeoSchemaAuditItem[];
  queryOpportunities: AeoQueryOpportunity[];
  simulatedResponses: Record<AnswerEngineId, SimulatedEngineResponse>;
  
  actionableRecommendations: {
    id: string;
    priority: 'critical' | 'high' | 'medium';
    category: 'Structure' | 'Schema' | 'Information Gain' | 'Voice / Audio';
    title: string;
    description: string;
    remedySnippet?: string;
  }[];
}

export interface AeoDraftingAnalysis {
  query: string;
  draftText: string;
  wordCount: number;
  charCount: number;
  readingGradeLevel: string;
  fleschScore: number;
  directAnswerClarityScore: number;
  invertedPyramidPass: boolean;
  quotabilityIndex: number; // 0 - 100
  speakableEstimatedSeconds: number;
  feedback: {
    type: 'success' | 'warning' | 'info';
    message: string;
  }[];
  generatedSpeakableJsonLd: string;
  generatedFaqJsonLd: string;
}
