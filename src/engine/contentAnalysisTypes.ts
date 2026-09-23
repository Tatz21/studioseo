export type EntityType = 'concept' | 'organization' | 'product' | 'location' | 'person';
export type TermStatus = 'missing' | 'optimal' | 'overused';

export interface ReadabilityMetrics {
  fleschReadingEase: number; // 0-100 (Higher = easier)
  fleschKincaidGrade: number; // School grade level (e.g. 8.2)
  gunningFogIndex: number; // 6-17+ complexity index
  smogIndex: number; // Years of education needed
  colemanLiauIndex: number; // Character-based grade level
  automatedReadabilityIndex: number; // ARI score
  averageSentenceLength: number; // Words per sentence
  complexWordsPercentage: number; // % of words with 3+ syllables
  readingLevel: string; // e.g., "Standard (8th-9th grade)"
  estimatedReadingTimeMinutes: number; // Based on 225 WPM
}

export interface SemanticEntity {
  name: string;
  type: EntityType;
  salience: number; // 0.0 - 1.0 importance
  occurrences: number;
  inHeadings: boolean;
  recommendation: string;
}

export interface TfIdfTerm {
  term: string;
  tfIdfScore: number;
  currentCount: number;
  recommendedMin: number;
  recommendedMax: number;
  density: number; // Percentage
  status: TermStatus; // 'missing' | 'optimal' | 'overused'
  suggestedAction: string;
}

export interface HeadingAuditNode {
  level: number;
  text: string;
  charCount: number;
  wordCount: number;
  containsFocusKeyword: boolean;
  hasSubheadings: boolean;
  isTooLong: boolean; // > 70 chars
  isTooShort: boolean; // < 10 chars
}

export interface ScannabilityMetrics {
  totalParagraphs: number;
  avgParagraphWords: number;
  wallOfTextCount: number; // Paragraphs > 100 words without breaks
  bulletListsCount: number;
  numberedListsCount: number;
  boldPhrasesCount: number;
  imagesCount: number;
  textToHtmlRatio: number;
  scannabilityGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface ContentActionItem {
  id: string;
  category: 'keyword' | 'readability' | 'structure' | 'scannability';
  severity: 'critical' | 'warning' | 'opportunity' | 'passed';
  title: string;
  description: string;
  impactScore: number; // Points to gain
  recommendation: string;
}

export interface ContentAnalysisReport {
  targetUrl?: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  overallScore: number; // 0-100 composite content health score
  wordCount: number;
  recommendedWordCount: { min: number; max: number };
  characterCount: number;
  sentenceCount: number;
  readability: ReadabilityMetrics;
  entities: SemanticEntity[];
  tfIdfTerms: TfIdfTerm[];
  headings: HeadingAuditNode[];
  scannability: ScannabilityMetrics;
  actions: ContentActionItem[];
  timestamp: string;
}

export interface ContentAnalysisRequest {
  url?: string;
  html?: string;
  text?: string;
  focusKeyword: string;
  secondaryKeywords?: string[];
}
