/**
 * Phase 7: Social Graph & Card Technical Rules
 */

import { TechnicalIssue } from '../types';
import { ExtractedPageData } from '../../extractor/types';

export function evaluateSocialRules(data: ExtractedPageData): TechnicalIssue[] {
  const issues: TechnicalIssue[] = [];
  const og = data.metadata.openGraph;
  const twitter = data.metadata.twitter;

  // 1. Open Graph Complete
  const hasOgTitle = !!og.title;
  const hasOgImage = !!og.image;
  const hasOgDesc = !!og.description;
  const isOgComplete = hasOgTitle && hasOgImage && hasOgDesc;

  issues.push({
    id: 'issue_opengraph_complete',
    ruleCode: 'TECH_OPENGRAPH_COMPLETE',
    title: isOgComplete ? 'Open Graph Metadata Complete' : 'Open Graph Metadata Incomplete',
    category: 'social',
    severity: isOgComplete ? 'passed' : 'info',
    description: isOgComplete
      ? 'Page contains title, description, and preview image for social shares.'
      : `Missing Open Graph tags: ${[!hasOgTitle && 'og:title', !hasOgDesc && 'og:description', !hasOgImage && 'og:image'].filter(Boolean).join(', ')}.`,
    scoreDeduction: isOgComplete ? 0 : 3,
    evidence: {
      measuredValue: `title: ${hasOgTitle}, desc: ${hasOgDesc}, image: ${hasOgImage}`,
      expectedThreshold: 'All primary og: tags declared',
      diffSummary: isOgComplete ? 'Complete' : 'Partially declared'
    },
    searchEngineImpact: 'Rich social previews increase click-throughs and viral discovery across LinkedIn, Facebook, and messaging apps.',
    recommendation: 'Add og:title, og:description, and og:image tags to the <head>.',
    codeFixTemplate: `<meta property="og:title" content="${data.metadata.title}">\n<meta property="og:description" content="${data.metadata.description}">\n<meta property="og:image" content="https://${data.domain}/og-image.jpg">`
  });

  // 2. Twitter Card Complete
  const hasTwitterCard = !!twitter.card;
  const isTwitterComplete = hasTwitterCard && (!!twitter.title || hasOgTitle);

  issues.push({
    id: 'issue_twitter_card',
    ruleCode: 'TECH_TWITTER_CARD_COMPLETE',
    title: isTwitterComplete ? 'Twitter Card Metadata Declared' : 'Missing Twitter Card Tags',
    category: 'social',
    severity: isTwitterComplete ? 'passed' : 'info',
    description: isTwitterComplete
      ? `Twitter Card type: "${twitter.card || 'summary_large_image'}"`
      : 'No <meta name="twitter:card"> tag declared.',
    scoreDeduction: isTwitterComplete ? 0 : 2,
    evidence: {
      measuredValue: twitter.card || 'None',
      expectedThreshold: 'summary_large_image or summary',
      diffSummary: isTwitterComplete ? 'Declared' : 'Missing'
    },
    searchEngineImpact: 'Generates full-width image preview cards on Twitter/X feeds.',
    recommendation: 'Specify <meta name="twitter:card" content="summary_large_image"> in the head.',
    codeFixTemplate: `<meta name="twitter:card" content="summary_large_image">`
  });

  return issues;
}
