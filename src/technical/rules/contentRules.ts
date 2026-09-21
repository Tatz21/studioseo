/**
 * Phase 7: Content Depth, Readability & Internal Links Technical Rules
 */

import { TechnicalIssue } from '../types';
import { ExtractedPageData } from '../../extractor/types';

export function evaluateContentRules(data: ExtractedPageData): TechnicalIssue[] {
  const issues: TechnicalIssue[] = [];
  const content = data.content;
  const links = data.links;

  // 1. Thin Content Check (< 300 words)
  const isThin = content.wordCount < 300;
  issues.push({
    id: 'issue_content_thin',
    ruleCode: 'TECH_CONTENT_THIN_CHECK',
    title: !isThin ? 'Substantial Content Depth' : 'Thin Content Detected (< 300 Words)',
    category: 'content',
    severity: !isThin ? 'passed' : 'warning',
    description: !isThin
      ? `Page contains ${content.wordCount} words of readable body text.`
      : `Page contains only ${content.wordCount} words, which may be classified as thin content.`,
    scoreDeduction: !isThin ? 0 : 12,
    evidence: {
      measuredValue: `${content.wordCount} words`,
      expectedThreshold: '>= 300 words',
      diffSummary: !isThin ? 'Sufficient depth' : `${content.wordCount} words`
    },
    searchEngineImpact: !isThin
      ? 'Provides sufficient topical depth for search engine natural language processing.'
      : 'Pages with thin content struggle to rank and risk being flagged under Google Helpful Content guidelines.',
    recommendation: !isThin
      ? 'Continue adding original insights, case studies, and structured FAQs.'
      : 'Expand the page content with detailed explanations, practical examples, and answers to common user queries.'
  });

  // 2. Readability Score
  const isReadable = content.readingEaseScore >= 50;
  issues.push({
    id: 'issue_readability',
    ruleCode: 'TECH_READABILITY_STANDARD',
    title: isReadable ? 'Flesch Readability Meets Standards' : 'Complex Content Readability',
    category: 'content',
    severity: isReadable ? 'passed' : 'info',
    description: `Flesch Reading Ease score is ${content.readingEaseScore}/100 (${content.readingLevel}).`,
    scoreDeduction: isReadable ? 0 : 3,
    evidence: {
      measuredValue: `${content.readingEaseScore}/100`,
      expectedThreshold: '>= 50/100',
      diffSummary: isReadable ? 'Standard' : 'Complex'
    },
    searchEngineImpact: 'Clear, concise prose increases dwell time and reduces bounce rates.',
    recommendation: isReadable
      ? 'Maintain accessible sentence length.'
      : 'Break long compound sentences into shorter phrases and simplify technical jargon.'
  });

  // 3. Generic Anchor Text Check
  const hasGenericAnchors = links.genericAnchorCount > 0;
  issues.push({
    id: 'issue_generic_anchors',
    ruleCode: 'TECH_LINKS_GENERIC_ANCHOR',
    title: !hasGenericAnchors 
      ? 'Descriptive Link Anchor Text' 
      : `Generic Anchor Text Detected (${links.genericAnchorCount})`,
    category: 'crawlability',
    severity: !hasGenericAnchors ? 'passed' : 'warning',
    description: !hasGenericAnchors
      ? 'All links utilize descriptive anchor text explaining the destination.'
      : `Found ${links.genericAnchorCount} link(s) using generic anchors like "click here", "read more", or "website".`,
    scoreDeduction: !hasGenericAnchors ? 0 : Math.min(8, links.genericAnchorCount * 2),
    evidence: {
      measuredValue: `${links.genericAnchorCount} generic anchors`,
      expectedThreshold: '0 generic anchors',
      diffSummary: !hasGenericAnchors ? 'All descriptive' : `${links.genericAnchorCount} generic`
    },
    offendingSnippets: links.links
      .filter(l => l.isGenericAnchor)
      .slice(0, 3)
      .map(l => `<a href="${l.url}">${l.anchorText}</a>`),
    searchEngineImpact: !hasGenericAnchors
      ? 'Transfers clear contextual topical relevance to linked target URLs.'
      : 'Generic anchors pass zero contextual signal to destination pages, diluting internal link equity.',
    recommendation: 'Replace generic phrases with keyword-rich descriptions of the destination page.'
  });

  return issues;
}
