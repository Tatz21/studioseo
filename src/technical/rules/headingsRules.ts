/**
 * Phase 7: Headings Hierarchy & Semantic Structure Technical Rules
 */

import { TechnicalIssue } from '../types';
import { ExtractedPageData } from '../../extractor/types';

export function evaluateHeadingsRules(data: ExtractedPageData): TechnicalIssue[] {
  const issues: TechnicalIssue[] = [];
  const headings = data.headings;

  // 1. H1 Exists
  const hasH1 = headings.h1Count > 0;
  issues.push({
    id: 'issue_h1_exists',
    ruleCode: 'TECH_H1_EXISTS',
    title: hasH1 ? 'Primary <h1> Heading Found' : 'Missing <h1> Heading Tag',
    category: 'content',
    severity: hasH1 ? 'passed' : 'critical',
    description: hasH1
      ? `Found ${headings.h1Count} <h1> tag(s) on the page.`
      : 'Document contains no <h1> tag, depriving search engines of primary topic definition.',
    scoreDeduction: hasH1 ? 0 : 20,
    evidence: {
      measuredValue: `${headings.h1Count} H1 tags`,
      expectedThreshold: '1 H1 tag',
      diffSummary: hasH1 ? 'Found' : 'Missing H1'
    },
    searchEngineImpact: hasH1
      ? 'Directly reinforces primary page intent for keyword ranking models.'
      : 'Search engines struggle to discern the core theme of the document.',
    recommendation: 'Add a single descriptive <h1> heading at the top of the main content area.',
    codeFixTemplate: `<h1>Primary Keyword Page Heading</h1>`
  });

  // 2. Exactly Single H1
  if (hasH1) {
    const isSingleH1 = headings.h1Count === 1;
    issues.push({
      id: 'issue_h1_single',
      ruleCode: 'TECH_H1_SINGLE',
      title: isSingleH1 ? 'Single <h1> Tag Best Practice' : `Multiple <h1> Tags Found (${headings.h1Count})`,
      category: 'content',
      severity: isSingleH1 ? 'passed' : 'warning',
      description: isSingleH1
        ? 'Exactly one <h1> tag is present, establishing clear semantic hierarchy.'
        : `Found ${headings.h1Count} <h1> tags. Multiple H1s can dilute topic focus.`,
      scoreDeduction: isSingleH1 ? 0 : 5,
      evidence: {
        measuredValue: headings.h1Count,
        expectedThreshold: '1 H1 tag',
        diffSummary: isSingleH1 ? 'Single H1' : `${headings.h1Count} H1 tags`
      },
      searchEngineImpact: isSingleH1 
        ? 'Maximizes semantic clarity and topic weighting.' 
        : 'May fragment page relevance across multiple competing subjects.',
      recommendation: isSingleH1
        ? 'Maintain single H1 hierarchy.'
        : 'Convert secondary <h1> headings into <h2> subheadings.'
    });
  }

  // 3. No Skipped Heading Levels (Hierarchy)
  const hasSkipped = headings.hasSkippedLevels;
  issues.push({
    id: 'issue_headings_skipped',
    ruleCode: 'TECH_HEADINGS_NO_SKIPPED',
    title: !hasSkipped ? 'Sequential Heading Levels Maintained' : 'Skipped Heading Levels Detected',
    category: 'content',
    severity: !hasSkipped ? 'passed' : 'warning',
    description: !hasSkipped
      ? 'Heading levels progress sequentially without skipping (e.g. H1 -> H2 -> H3).'
      : `Heading structure skips hierarchical tiers: ${headings.skippedLevelIssues[0] || 'Hierarchy jump detected'}.`,
    scoreDeduction: !hasSkipped ? 0 : 5,
    evidence: {
      measuredValue: hasSkipped ? 'Skipped levels found' : 'Sequential progression',
      expectedThreshold: 'Sequential H1 -> H2 -> H3',
      diffSummary: hasSkipped ? `${headings.skippedLevelIssues.length} issues` : 'Clean structure'
    },
    offendingSnippets: headings.skippedLevelIssues,
    searchEngineImpact: !hasSkipped
      ? 'Aids document structure parsing and assistive technologies (screen readers).'
      : 'Degrades semantic accessibility and outline comprehension by crawlers.',
    recommendation: 'Restructure subheadings so each tier is nested under its parent heading level.'
  });

  // 4. No Empty Heading Tags
  const hasEmptyHeadings = headings.emptyHeadingsCount > 0;
  issues.push({
    id: 'issue_headings_empty',
    ruleCode: 'TECH_HEADINGS_NO_EMPTY',
    title: !hasEmptyHeadings ? 'No Empty Heading Tags' : `Empty Heading Tags Detected (${headings.emptyHeadingsCount})`,
    category: 'content',
    severity: !hasEmptyHeadings ? 'passed' : 'warning',
    description: !hasEmptyHeadings
      ? 'All heading tags contain meaningful text content.'
      : `Found ${headings.emptyHeadingsCount} heading tag(s) without text content.`,
    scoreDeduction: !hasEmptyHeadings ? 0 : 4,
    evidence: {
      measuredValue: headings.emptyHeadingsCount,
      expectedThreshold: '0 empty headings',
      diffSummary: !hasEmptyHeadings ? '0 empty' : `${headings.emptyHeadingsCount} empty`
    },
    searchEngineImpact: 'Empty heading tags confuse crawler outline parsers and waste DOM nodes.',
    recommendation: 'Remove empty heading tags or populate them with descriptive titles.'
  });

  return issues;
}
