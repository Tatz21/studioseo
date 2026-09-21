/**
 * Phase 8: Weighted & Versioned SEO Scoring Engine
 */

import { 
  AuditSnapshot, 
  CategoryWeights, 
  GradeDetails, 
  LetterGrade 
} from './types';
import { TechnicalAuditReport } from '../technical/types';

export const SCORING_VERSION = 'v2.1.0-standard';

export const DEFAULT_WEIGHTS: CategoryWeights = {
  indexability: 0.30,      // 30%
  content: 0.25,           // 25%
  performance: 0.20,       // 20%
  accessibility: 0.15,     // 15%
  structured_data: 0.10    // 10%
};

export const GRADE_SCALE: Record<LetterGrade, GradeDetails> = {
  'A+': {
    grade: 'A+',
    minScore: 95,
    label: 'Exceptional SEO Health',
    color: '#10B981', // emerald
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    description: 'Outstanding technical compliance, comprehensive content depth, and perfect schema markup.'
  },
  'A': {
    grade: 'A',
    minScore: 90,
    label: 'Strong Optimization',
    color: '#06B6D4', // cyan
    badgeBg: 'rgba(6, 182, 212, 0.15)',
    description: 'High-performing page meeting all major Google Core Web Vitals and technical requirements.'
  },
  'B': {
    grade: 'B',
    minScore: 80,
    label: 'Good Optimization',
    color: '#3B82F6', // blue
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    description: 'Solid foundation with minor optimization opportunities in media or heading hierarchy.'
  },
  'C': {
    grade: 'C',
    minScore: 70,
    label: 'Needs Improvement',
    color: '#F59E0B', // amber
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    description: 'Noticeable technical or content deficiencies that suppress search visibility.'
  },
  'D': {
    grade: 'D',
    minScore: 55,
    label: 'Poor Optimization',
    color: '#F97316', // orange
    badgeBg: 'rgba(249, 115, 22, 0.15)',
    description: 'Significant technical barriers, missing metadata, or absent structured data.'
  },
  'F': {
    grade: 'F',
    minScore: 0,
    label: 'Critical Failure',
    color: '#F43F5E', // rose
    badgeBg: 'rgba(244, 63, 94, 0.15)',
    description: 'Severe indexability blockers (e.g. noindex, broken HTTP status, or missing titles).'
  }
};

export class ScoringEngine {
  /**
   * Resolves letter grade and details from a numerical score
   */
  public static getGradeDetails(score: number): GradeDetails {
    if (score >= 95) return GRADE_SCALE['A+'];
    if (score >= 90) return GRADE_SCALE['A'];
    if (score >= 80) return GRADE_SCALE['B'];
    if (score >= 70) return GRADE_SCALE['C'];
    if (score >= 55) return GRADE_SCALE['D'];
    return GRADE_SCALE['F'];
  }

  /**
   * Computes calibrated, weighted overall score from category health subscores
   */
  public static computeWeightedScore(
    categoryScores: {
      indexability: number;
      content: number;
      performance: number;
      accessibility: number;
      structured_data: number;
    },
    weights: CategoryWeights = DEFAULT_WEIGHTS
  ): number {
    const rawScore = 
      (categoryScores.indexability * weights.indexability) +
      (categoryScores.content * weights.content) +
      (categoryScores.performance * weights.performance) +
      (categoryScores.accessibility * weights.accessibility) +
      (categoryScores.structured_data * weights.structured_data);

    return Math.max(0, Math.min(100, Math.round(rawScore)));
  }

  /**
   * Transforms a TechnicalAuditReport into an immutable AuditSnapshot
   */
  public static createSnapshot(
    report: TechnicalAuditReport, 
    websiteId?: string,
    customWeights: CategoryWeights = DEFAULT_WEIGHTS
  ): AuditSnapshot {
    const categoryScores = {
      indexability: report.categoryHealth.indexability?.score ?? 100,
      content: report.categoryHealth.content?.score ?? 100,
      performance: report.categoryHealth.performance?.score ?? 100,
      accessibility: report.categoryHealth.accessibility?.score ?? 100,
      structured_data: report.categoryHealth.structured_data?.score ?? 100
    };

    const weightedScore = this.computeWeightedScore(categoryScores, customWeights);
    const gradeDetails = this.getGradeDetails(weightedScore);

    const keyIssues = report.issues
      .filter(i => i.severity === 'critical' || i.severity === 'warning')
      .map(i => ({
        ruleCode: i.ruleCode,
        title: i.title,
        severity: i.severity as 'critical' | 'warning'
      }));

    return {
      id: `snap_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      websiteId,
      url: report.url,
      domain: report.domain,
      timestamp: new Date().toISOString(),
      scoringVersion: SCORING_VERSION,
      overallScore: weightedScore,
      letterGrade: gradeDetails.grade,
      gradeLabel: gradeDetails.label,
      categoryScores,
      totalIssues: {
        passed: report.passedCount,
        warning: report.warningCount,
        critical: report.criticalCount
      },
      keyIssues
    };
  }
}
