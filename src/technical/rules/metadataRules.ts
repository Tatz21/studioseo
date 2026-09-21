/**
 * Phase 7: Metadata, Title & Description Technical Rules
 */

import { TechnicalIssue } from '../types';
import { ExtractedPageData } from '../../extractor/types';

export function evaluateMetadataRules(data: ExtractedPageData): TechnicalIssue[] {
  const issues: TechnicalIssue[] = [];
  const meta = data.metadata;

  // 1. Title Exists
  const hasTitle = meta.title.length > 0;
  issues.push({
    id: 'issue_title_exists',
    ruleCode: 'TECH_TITLE_EXISTS',
    title: hasTitle ? 'Title Tag Present' : 'Missing <title> Tag',
    category: 'metadata',
    severity: hasTitle ? 'passed' : 'critical',
    description: hasTitle
      ? `Found title tag: "${meta.title}"`
      : 'Page is missing a <title> element in the <head>.',
    scoreDeduction: hasTitle ? 0 : 25,
    evidence: {
      measuredValue: hasTitle ? meta.title : 'Missing',
      expectedThreshold: 'Present non-empty <title> element',
      diffSummary: hasTitle ? 'Found' : 'Missing'
    },
    searchEngineImpact: hasTitle 
      ? 'Provides primary heading snippet in Google search results and browser tabs.' 
      : 'Severe ranking suppression; search engines will synthesize arbitrary page titles.',
    recommendation: hasTitle 
      ? 'Maintain concise branding and primary keyword in title tag.' 
      : 'Add a descriptive <title> tag between 30 and 60 characters.',
    codeFixTemplate: `<title>Primary Keyword - Brand Name</title>`
  });

  // 2. Title Length (30 - 60 chars)
  if (hasTitle) {
    const isOptimalLength = meta.titleLength >= 30 && meta.titleLength <= 60;
    const isTooShort = meta.titleLength < 30;
    const isTooLong = meta.titleLength > 60;

    issues.push({
      id: 'issue_title_length',
      ruleCode: 'TECH_TITLE_LENGTH',
      title: isOptimalLength 
        ? 'Optimal Title Tag Length' 
        : isTooShort ? 'Title Tag Too Short' : 'Title Tag Too Long (Truncation Risk)',
      category: 'metadata',
      severity: isOptimalLength ? 'passed' : 'warning',
      description: isOptimalLength
        ? `Title length is ${meta.titleLength} characters (optimal range: 30–60).`
        : isTooShort
        ? `Title is only ${meta.titleLength} characters. You are underutilizing valuable ranking space.`
        : `Title is ${meta.titleLength} characters, which exceeds the recommended 60-character ceiling.`,
      scoreDeduction: isOptimalLength ? 0 : 6,
      evidence: {
        measuredValue: `${meta.titleLength} characters`,
        expectedThreshold: '30 to 60 characters',
        diffSummary: isOptimalLength ? 'Optimal' : `${meta.titleLength} chars`
      },
      searchEngineImpact: isOptimalLength
        ? 'Displays cleanly without truncation in desktop and mobile SERPs.'
        : isTooLong
        ? 'Google will truncate the title with an ellipsis (...) or rewrite it entirely.'
        : 'Missed opportunities to include secondary target keywords or location signals.',
      recommendation: isOptimalLength
        ? 'No adjustments needed.'
        : isTooLong
        ? 'Condense title to under 60 characters by removing filler words.'
        : 'Expand title with relevant modifiers, secondary keywords, or brand positioning.'
    });
  }

  // 3. Meta Description Exists
  const hasDescription = meta.description.length > 0;
  issues.push({
    id: 'issue_desc_exists',
    ruleCode: 'TECH_DESCRIPTION_EXISTS',
    title: hasDescription ? 'Meta Description Declared' : 'Missing Meta Description',
    category: 'metadata',
    severity: hasDescription ? 'passed' : 'warning',
    description: hasDescription
      ? `Meta description: "${meta.description.slice(0, 80)}..."`
      : 'No <meta name="description"> tag found in document head.',
    scoreDeduction: hasDescription ? 0 : 10,
    evidence: {
      measuredValue: hasDescription ? `${meta.descriptionLength} chars` : 'Missing',
      expectedThreshold: 'Non-empty <meta name="description">',
      diffSummary: hasDescription ? 'Declared' : 'Missing'
    },
    searchEngineImpact: hasDescription
      ? 'Provides compelling summary snippet in search results, increasing Click-Through Rate (CTR).'
      : 'Google will auto-generate a snippet from random body paragraphs, often yielding disjointed text.',
    recommendation: hasDescription
      ? 'Review click-through rates periodically in Google Search Console.'
      : 'Add a compelling meta description between 120 and 160 characters with a clear call to action.',
    codeFixTemplate: `<meta name="description" content="Discover professional services with expert guidance. Get in touch today for a tailored quote.">`
  });

  // 4. Meta Description Length (120 - 160 chars)
  if (hasDescription) {
    const isOptimal = meta.descriptionLength >= 120 && meta.descriptionLength <= 160;
    issues.push({
      id: 'issue_desc_length',
      ruleCode: 'TECH_DESCRIPTION_LENGTH',
      title: isOptimal ? 'Optimal Meta Description Length' : 'Meta Description Length Suboptimal',
      category: 'metadata',
      severity: isOptimal ? 'passed' : 'info',
      description: `Meta description is ${meta.descriptionLength} characters (recommended: 120–160 chars).`,
      scoreDeduction: isOptimal ? 0 : 3,
      evidence: {
        measuredValue: `${meta.descriptionLength} characters`,
        expectedThreshold: '120 to 160 characters',
        diffSummary: isOptimal ? 'Optimal' : `${meta.descriptionLength} chars`
      },
      searchEngineImpact: 'Descriptions under 120 characters underutilize snippet space; descriptions over 160 get truncated.',
      recommendation: 'Target 145–155 characters for optimal desktop and mobile rendering.'
    });
  }

  // 5. Viewport Mobile Tag
  const hasViewport = !!meta.viewport;
  issues.push({
    id: 'issue_viewport_mobile',
    ruleCode: 'TECH_VIEWPORT_MOBILE',
    title: hasViewport ? 'Mobile Viewport Configured' : 'Missing Mobile Viewport Tag',
    category: 'metadata',
    severity: hasViewport ? 'passed' : 'critical',
    description: hasViewport
      ? `Viewport tag configured: "${meta.viewport}"`
      : 'Missing <meta name="viewport"> tag required for mobile-first indexing.',
    scoreDeduction: hasViewport ? 0 : 15,
    evidence: {
      measuredValue: meta.viewport || 'Missing',
      expectedThreshold: 'width=device-width, initial-scale=1.0',
      diffSummary: hasViewport ? 'Configured' : 'Missing'
    },
    searchEngineImpact: hasViewport 
      ? 'Ensures mobile usability compliance for Google Mobile-First Indexing.' 
      : 'Failure of mobile friendliness test, resulting in substantial mobile ranking drops.',
    recommendation: 'Ensure standard responsive viewport meta tag is included in <head>.',
    codeFixTemplate: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
  });

  return issues;
}
