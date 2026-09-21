/**
 * Phase 7: Technical SEO Engine - Data Contracts & Standardized Rule Catalog
 */

export type TechnicalSeverity = 'critical' | 'warning' | 'info' | 'passed';

export type TechnicalCategory = 
  | 'indexability'
  | 'crawlability'
  | 'metadata'
  | 'content'
  | 'accessibility'
  | 'performance'
  | 'structured_data'
  | 'social';

export type TechnicalRuleCode = 
  // Indexability & Crawlability
  | 'TECH_HTTP_STATUS_200'
  | 'TECH_HTTPS_PROTOCOL'
  | 'TECH_ROBOTS_INDEXABLE'
  | 'TECH_CANONICAL_EXISTS'
  | 'TECH_CANONICAL_VALID'
  | 'TECH_CANONICAL_CROSS_DOMAIN'
  // Metadata
  | 'TECH_TITLE_EXISTS'
  | 'TECH_TITLE_LENGTH'
  | 'TECH_TITLE_SERP_WIDTH'
  | 'TECH_DESCRIPTION_EXISTS'
  | 'TECH_DESCRIPTION_LENGTH'
  | 'TECH_VIEWPORT_MOBILE'
  | 'TECH_FAVICON_EXISTS'
  // Headings
  | 'TECH_H1_EXISTS'
  | 'TECH_H1_SINGLE'
  | 'TECH_HEADINGS_NO_SKIPPED'
  | 'TECH_HEADINGS_NO_EMPTY'
  // Media & Web Vitals
  | 'TECH_IMAGE_ALT_PRESENT'
  | 'TECH_IMAGE_CLS_DIMENSIONS'
  | 'TECH_IMAGE_MODERN_FORMAT'
  // Structured Data
  | 'TECH_SCHEMA_JSONLD_VALID'
  | 'TECH_SCHEMA_TYPE_DECLARED'
  // Social Cards
  | 'TECH_OPENGRAPH_COMPLETE'
  | 'TECH_TWITTER_CARD_COMPLETE'
  // Content & Links
  | 'TECH_CONTENT_THIN_CHECK'
  | 'TECH_READABILITY_STANDARD'
  | 'TECH_LINKS_GENERIC_ANCHOR';

export interface RuleEvidence {
  measuredValue: string | number | boolean;
  expectedThreshold: string;
  diffSummary?: string;
}

export interface TechnicalIssue {
  id: string;
  ruleCode: TechnicalRuleCode;
  title: string;
  category: TechnicalCategory;
  severity: TechnicalSeverity;
  description: string;
  scoreDeduction: number; // 0 if passed
  evidence: RuleEvidence;
  offendingSnippets?: string[];
  searchEngineImpact: string;
  recommendation: string;
  codeFixTemplate?: string;
}

export interface CategoryHealth {
  category: TechnicalCategory;
  label: string;
  score: number; // 0 - 100
  totalChecks: number;
  passedCount: number;
  warningCount: number;
  criticalCount: number;
}

export interface TechnicalAuditReport {
  id: string;
  url: string;
  domain: string;
  overallScore: number; // 0 - 100
  passedCount: number;
  warningCount: number;
  criticalCount: number;
  infoCount: number;
  totalRulesEvaluated: number;
  issues: TechnicalIssue[];
  categoryHealth: Record<TechnicalCategory, CategoryHealth>;
  auditedAt: string;
}
