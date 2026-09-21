/**
 * Phase 8: SEO Scoring Engine - Data Contracts & Types
 */

export type LetterGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface GradeDetails {
  grade: LetterGrade;
  minScore: number;
  label: string;
  color: string;
  badgeBg: string;
  description: string;
}

export interface CategoryWeights {
  indexability: number; // e.g. 0.30 (30%)
  content: number;      // e.g. 0.25 (25%)
  performance: number;  // e.g. 0.20 (20%)
  accessibility: number;// e.g. 0.15 (15%)
  structured_data: number; // e.g. 0.10 (10%)
}

export interface SnapshotKeyIssue {
  ruleCode: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface AuditSnapshot {
  id: string;
  websiteId?: string;
  url: string;
  domain: string;
  timestamp: string;
  scoringVersion: string;
  overallScore: number;
  letterGrade: LetterGrade;
  gradeLabel: string;
  categoryScores: {
    indexability: number;
    content: number;
    performance: number;
    accessibility: number;
    structured_data: number;
  };
  totalIssues: {
    passed: number;
    warning: number;
    critical: number;
  };
  keyIssues: SnapshotKeyIssue[];
  notes?: string;
}

export interface SnapshotComparison {
  olderSnapshot: AuditSnapshot;
  newerSnapshot: AuditSnapshot;
  scoreDelta: number;
  gradeChanged: boolean;
  oldGrade: LetterGrade;
  newGrade: LetterGrade;
  categoryDeltas: {
    indexability: number;
    content: number;
    performance: number;
    accessibility: number;
    structured_data: number;
  };
  resolvedIssues: string[];
  newRegressions: string[];
  summary: string;
}
