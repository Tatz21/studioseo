/**
 * Phase 7: Technical SEO Engine Orchestrator
 */

import { 
  TechnicalAuditReport, 
  TechnicalCategory, 
  TechnicalIssue, 
  CategoryHealth 
} from './types';
import { ExtractedPageData } from '../extractor/types';
import { evaluateIndexabilityRules } from './rules/indexabilityRules';
import { evaluateMetadataRules } from './rules/metadataRules';
import { evaluateHeadingsRules } from './rules/headingsRules';
import { evaluateMediaRules } from './rules/mediaRules';
import { evaluateSchemaRules } from './rules/schemaRules';
import { evaluateContentRules } from './rules/contentRules';
import { evaluateSocialRules } from './rules/socialRules';
import { databaseStore } from '../db/databaseStore';

export class TechnicalEngine {
  /**
   * Executes all deterministic technical checks against extracted page AST data
   */
  public static audit(data: ExtractedPageData): TechnicalAuditReport {
    const issues: TechnicalIssue[] = [
      ...evaluateIndexabilityRules(data),
      ...evaluateMetadataRules(data),
      ...evaluateHeadingsRules(data),
      ...evaluateMediaRules(data),
      ...evaluateSchemaRules(data),
      ...evaluateContentRules(data),
      ...evaluateSocialRules(data)
    ];

    let totalDeductions = 0;
    let passedCount = 0;
    let warningCount = 0;
    let criticalCount = 0;
    let infoCount = 0;

    // Track category health
    const categoryBuckets: Record<TechnicalCategory, { total: number; passed: number; warning: number; critical: number; deduction: number }> = {
      indexability: { total: 0, passed: 0, warning: 0, critical: 0, deduction: 0 },
      crawlability: { total: 0, passed: 0, warning: 0, critical: 0, deduction: 0 },
      metadata: { total: 0, passed: 0, warning: 0, critical: 0, deduction: 0 },
      content: { total: 0, passed: 0, warning: 0, critical: 0, deduction: 0 },
      accessibility: { total: 0, passed: 0, warning: 0, critical: 0, deduction: 0 },
      performance: { total: 0, passed: 0, warning: 0, critical: 0, deduction: 0 },
      structured_data: { total: 0, passed: 0, warning: 0, critical: 0, deduction: 0 },
      social: { total: 0, passed: 0, warning: 0, critical: 0, deduction: 0 }
    };

    for (const issue of issues) {
      totalDeductions += issue.scoreDeduction;

      if (issue.severity === 'passed') passedCount++;
      else if (issue.severity === 'warning') warningCount++;
      else if (issue.severity === 'critical') criticalCount++;
      else if (issue.severity === 'info') infoCount++;

      const bucket = categoryBuckets[issue.category];
      if (bucket) {
        bucket.total++;
        if (issue.severity === 'passed') bucket.passed++;
        else if (issue.severity === 'warning') bucket.warning++;
        else if (issue.severity === 'critical') bucket.critical++;
        bucket.deduction += issue.scoreDeduction;
      }
    }

    const overallScore = Math.max(0, Math.min(100, Math.round(100 - totalDeductions)));

    const categoryHealth: Record<TechnicalCategory, CategoryHealth> = {
      indexability: {
        category: 'indexability',
        label: 'Indexability & Security',
        score: Math.max(0, 100 - categoryBuckets.indexability.deduction * 2),
        totalChecks: categoryBuckets.indexability.total,
        passedCount: categoryBuckets.indexability.passed,
        warningCount: categoryBuckets.indexability.warning,
        criticalCount: categoryBuckets.indexability.critical
      },
      crawlability: {
        category: 'crawlability',
        label: 'Crawlability & Links',
        score: Math.max(0, 100 - categoryBuckets.crawlability.deduction * 2),
        totalChecks: categoryBuckets.crawlability.total,
        passedCount: categoryBuckets.crawlability.passed,
        warningCount: categoryBuckets.crawlability.warning,
        criticalCount: categoryBuckets.crawlability.critical
      },
      metadata: {
        category: 'metadata',
        label: 'Metadata & Directives',
        score: Math.max(0, 100 - categoryBuckets.metadata.deduction * 2),
        totalChecks: categoryBuckets.metadata.total,
        passedCount: categoryBuckets.metadata.passed,
        warningCount: categoryBuckets.metadata.warning,
        criticalCount: categoryBuckets.metadata.critical
      },
      content: {
        category: 'content',
        label: 'Content & Hierarchy',
        score: Math.max(0, 100 - categoryBuckets.content.deduction * 2),
        totalChecks: categoryBuckets.content.total,
        passedCount: categoryBuckets.content.passed,
        warningCount: categoryBuckets.content.warning,
        criticalCount: categoryBuckets.content.critical
      },
      accessibility: {
        category: 'accessibility',
        label: 'Accessibility & Alt',
        score: Math.max(0, 100 - categoryBuckets.accessibility.deduction * 2),
        totalChecks: categoryBuckets.accessibility.total,
        passedCount: categoryBuckets.accessibility.passed,
        warningCount: categoryBuckets.accessibility.warning,
        criticalCount: categoryBuckets.accessibility.critical
      },
      performance: {
        category: 'performance',
        label: 'Media & Web Vitals',
        score: Math.max(0, 100 - categoryBuckets.performance.deduction * 2),
        totalChecks: categoryBuckets.performance.total,
        passedCount: categoryBuckets.performance.passed,
        warningCount: categoryBuckets.performance.warning,
        criticalCount: categoryBuckets.performance.critical
      },
      structured_data: {
        category: 'structured_data',
        label: 'Structured Data',
        score: Math.max(0, 100 - categoryBuckets.structured_data.deduction * 2),
        totalChecks: categoryBuckets.structured_data.total,
        passedCount: categoryBuckets.structured_data.passed,
        warningCount: categoryBuckets.structured_data.warning,
        criticalCount: categoryBuckets.structured_data.critical
      },
      social: {
        category: 'social',
        label: 'Social Preview',
        score: Math.max(0, 100 - categoryBuckets.social.deduction * 2),
        totalChecks: categoryBuckets.social.total,
        passedCount: categoryBuckets.social.passed,
        warningCount: categoryBuckets.social.warning,
        criticalCount: categoryBuckets.social.critical
      }
    };

    // Synchronize to Phase 3 database
    this.syncIssuesToDatabase(data.url, issues);

    return {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      url: data.url,
      domain: data.domain,
      overallScore,
      passedCount,
      warningCount,
      criticalCount,
      infoCount,
      totalRulesEvaluated: issues.length,
      issues,
      categoryHealth,
      auditedAt: new Date().toISOString()
    };
  }

  private static syncIssuesToDatabase(pageUrl: string, issues: TechnicalIssue[]): void {
    try {
      const dbIssues = databaseStore.getTableRows('seo_issues');
      // Append new non-passed issues to the database table
      for (const issue of issues) {
        if (issue.severity !== 'passed') {
          dbIssues.unshift({
            id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            page_audit_id: pageUrl,
            severity: issue.severity,
            category: issue.category,
            rule_code: issue.ruleCode,
            title: issue.title,
            description: issue.description,
            impact: issue.searchEngineImpact,
            recommendation: issue.recommendation
          });
        }
      }
    } catch {
      // Non-fatal
    }
  }
}
