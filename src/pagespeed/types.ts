export type PageSpeedStrategy = 'mobile' | 'desktop';

export interface LighthouseCategoryScores {
  performance: number; // 0 - 100
  accessibility: number; // 0 - 100
  bestPractices: number; // 0 - 100
  seo: number; // 0 - 100
}

export interface WebVitalLabMetric {
  name: string;
  acronym: string;
  displayValue: string;
  numericValue: number; // in milliseconds or unitless
  score: number; // 0 - 1 (Lighthouse score)
  status: 'good' | 'needs-work' | 'poor';
}

export interface LabMetrics {
  fcp: WebVitalLabMetric; // First Contentful Paint
  lcp: WebVitalLabMetric; // Largest Contentful Paint
  tbt: WebVitalLabMetric; // Total Blocking Time
  cls: WebVitalLabMetric; // Cumulative Layout Shift
  speedIndex: WebVitalLabMetric; // Speed Index
}

export interface OpportunityItem {
  id: string;
  title: string;
  description: string;
  displayValue?: string;
  savingsMs?: number;
  savingsBytes?: number;
}

export interface DiagnosticItem {
  id: string;
  title: string;
  description: string;
  displayValue?: string;
}

export interface PageSpeedAuditReport {
  id: string;
  url: string;
  strategy: PageSpeedStrategy;
  fetchTime: string;
  lighthouseVersion: string;
  scores: LighthouseCategoryScores;
  labMetrics: LabMetrics;
  opportunities: OpportunityItem[];
  diagnostics: DiagnosticItem[];
  isSimulated?: boolean;
}

export interface StrategyComparison {
  url: string;
  mobile?: PageSpeedAuditReport;
  desktop?: PageSpeedAuditReport;
  scoreDelta: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
}
