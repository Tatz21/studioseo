/**
 * Phase 7: Structured Data & Schema.org Technical Rules
 */

import { TechnicalIssue } from '../types';
import { ExtractedPageData } from '../../extractor/types';

export function evaluateSchemaRules(data: ExtractedPageData): TechnicalIssue[] {
  const issues: TechnicalIssue[] = [];
  const schema = data.schema;

  // 1. JSON-LD Validity
  const hasSchema = schema.hasStructuredData;
  const hasErrors = schema.validationErrors.length > 0;

  issues.push({
    id: 'issue_schema_valid',
    ruleCode: 'TECH_SCHEMA_JSONLD_VALID',
    title: !hasSchema 
      ? 'No Structured Data Detected' 
      : hasErrors ? 'Structured Data Syntax Errors Found' : 'Valid Schema.org Structured Data',
    category: 'structured_data',
    severity: !hasSchema ? 'warning' : hasErrors ? 'critical' : 'passed',
    description: !hasSchema
      ? 'No Schema.org JSON-LD or Microdata structured markup found on this page.'
      : hasErrors
      ? `Found syntax errors in structured data markup: ${schema.validationErrors[0]}`
      : `Found ${schema.jsonLdCount} valid JSON-LD structured data block(s).`,
    scoreDeduction: !hasSchema ? 8 : hasErrors ? 15 : 0,
    evidence: {
      measuredValue: hasErrors ? 'Syntax error' : hasSchema ? `${schema.jsonLdCount} valid blocks` : 'None',
      expectedThreshold: 'Valid Schema.org JSON-LD markup',
      diffSummary: hasErrors ? 'Errors detected' : hasSchema ? 'Valid markup' : 'Missing'
    },
    offendingSnippets: schema.validationErrors,
    searchEngineImpact: hasSchema && !hasErrors
      ? 'Qualifies the page for Google Rich Results (rich cards, FAQs, breadcrumbs, review stars).'
      : 'Ineligible for Google Rich Snippets or SERP enhancements.',
    recommendation: hasSchema && !hasErrors
      ? 'Maintain schema synchronization with on-page content.'
      : 'Implement valid JSON-LD schema (e.g. LocalBusiness, Organization, or Article).',
    codeFixTemplate: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "${data.metadata.title || 'Page Title'}"\n}\n</script>`
  });

  // 2. Schema Type Declared
  if (hasSchema && !hasErrors) {
    const typesCount = schema.detectedTypes.length;
    issues.push({
      id: 'issue_schema_type',
      ruleCode: 'TECH_SCHEMA_TYPE_DECLARED',
      title: `Schema Entities Recognized (${schema.detectedTypes.join(', ')})`,
      category: 'structured_data',
      severity: 'passed',
      description: `Recognized ${typesCount} schema entity type(s): ${schema.detectedTypes.join(', ')}.`,
      scoreDeduction: 0,
      evidence: {
        measuredValue: schema.detectedTypes.join(', '),
        expectedThreshold: 'Recognized Schema.org @type',
        diffSummary: 'Recognized'
      },
      searchEngineImpact: 'Explicit entity types allow Google Knowledge Graph to attribute and classify business content.',
      recommendation: 'Expand entity relationships using Schema "sameAs" and "knowsAbout" properties.'
    });
  }

  return issues;
}
