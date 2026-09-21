export type MetricStatus = 'good' | 'needs-work' | 'poor';
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'quick-win';
export type RecommendationCategory = 'Performance' | 'Technical' | 'Content' | 'Mobile' | 'Schema' | 'Security';
export type EffortLevel = 'low' | 'medium' | 'high';

export interface WebVitalMetric {
  name: string;
  acronym: string;
  value: number;
  unit: string;
  formatted: string;
  status: MetricStatus;
  thresholds: { good: number; poor: number };
  description: string;
}

export interface CoreWebVitals {
  lcp: WebVitalMetric; // Largest Contentful Paint (ms)
  inp: WebVitalMetric; // Interaction to Next Paint (ms)
  cls: WebVitalMetric; // Cumulative Layout Shift (unitless)
  fcp: WebVitalMetric; // First Contentful Paint (ms)
  ttfb: WebVitalMetric; // Time to First Byte (ms)
  speedIndex: WebVitalMetric; // Speed Index (ms)
}

export interface AssetWeights {
  totalKb: number;
  htmlKb: number;
  cssKb: number;
  jsKb: number;
  imageKb: number;
  fontKb: number;
  requestsCount: number;
}

export interface PageRecommendation {
  id: string;
  title: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  estimatedImpact: string;
  effort: EffortLevel;
  explanation: string;
  actionSteps: string[];
  codeSnippet?: {
    language: string;
    before?: string;
    after: string;
  };
}

export interface AuditCheckItem {
  id: string;
  name: string;
  category: string;
  status: 'passed' | 'warning' | 'critical';
  measuredValue: string;
  criteria: string;
  explanation: string;
}

export interface PageAuditResult {
  targetUrl: string;
  title: string;
  scannedAt: string;
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  pageSpeedScore: number;
  webVitals: CoreWebVitals;
  assetWeights: AssetWeights;
  checksSummary: {
    passed: number;
    warnings: number;
    critical: number;
    total: number;
  };
  checks: AuditCheckItem[];
  recommendations: PageRecommendation[];
}
