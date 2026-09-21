/**
 * Phase 7: Images, Accessibility & Web Vitals Technical Rules
 */

import { TechnicalIssue } from '../types';
import { ExtractedPageData } from '../../extractor/types';

export function evaluateMediaRules(data: ExtractedPageData): TechnicalIssue[] {
  const issues: TechnicalIssue[] = [];
  const images = data.images;

  // If page has no images, record passed
  if (images.totalImages === 0) {
    issues.push({
      id: 'issue_image_alt',
      ruleCode: 'TECH_IMAGE_ALT_PRESENT',
      title: 'Image Alt Attributes Verified',
      category: 'accessibility',
      severity: 'passed',
      description: 'No images present on this page requiring alt attributes.',
      scoreDeduction: 0,
      evidence: { measuredValue: 0, expectedThreshold: '0 missing alt tags', diffSummary: 'No images' },
      searchEngineImpact: 'Neutral',
      recommendation: 'Ensure any future images include descriptive alt attributes.'
    });
    return issues;
  }

  // 1. Image Alt Present
  const missingAltTotal = images.missingAltCount + images.emptyAltCount;
  const isAltComplete = missingAltTotal === 0;

  issues.push({
    id: 'issue_image_alt',
    ruleCode: 'TECH_IMAGE_ALT_PRESENT',
    title: isAltComplete ? 'All Images Have Alt Attributes' : `Images Missing Alt Attributes (${missingAltTotal})`,
    category: 'accessibility',
    severity: isAltComplete ? 'passed' : 'warning',
    description: isAltComplete
      ? `All ${images.totalImages} images include descriptive alternative text.`
      : `${missingAltTotal} out of ${images.totalImages} images are missing alternative text.`,
    scoreDeduction: isAltComplete ? 0 : Math.min(15, missingAltTotal * 3),
    evidence: {
      measuredValue: `${missingAltTotal} missing`,
      expectedThreshold: '0 missing alt tags',
      diffSummary: isAltComplete ? '100% alt coverage' : `${missingAltTotal} missing`
    },
    offendingSnippets: images.images
      .filter(img => !img.hasAlt || img.isAltEmpty)
      .slice(0, 3)
      .map(img => `<img src="${img.src}" alt="">`),
    searchEngineImpact: isAltComplete
      ? 'Enables search engine indexing for Google Images and satisfies WCAG 2.1 AA accessibility guidelines.'
      : 'Images cannot be indexed in image search, reducing potential organic visual traffic.',
    recommendation: isAltComplete
      ? 'Maintain concise, keyword-rich alt descriptions on all new visuals.'
      : 'Add descriptive alt text to all informational images (or alt="" for purely decorative icons).',
    codeFixTemplate: `<img src="photo.webp" alt="Detailed description of visual subject" width="800" height="600">`
  });

  // 2. Image Dimensions (CLS Cumulative Layout Shift)
  const missingDims = images.missingDimensionsCount;
  const isDimsComplete = missingDims === 0;

  issues.push({
    id: 'issue_image_cls',
    ruleCode: 'TECH_IMAGE_CLS_DIMENSIONS',
    title: isDimsComplete ? 'Image Width & Height Declared' : `Images Missing Explicit Dimensions (${missingDims})`,
    category: 'performance',
    severity: isDimsComplete ? 'passed' : 'warning',
    description: isDimsComplete
      ? 'All images have explicit width and height attributes, preventing layout shifts.'
      : `${missingDims} image(s) lack explicit width/height attributes, creating Cumulative Layout Shift (CLS) risk.`,
    scoreDeduction: isDimsComplete ? 0 : Math.min(10, missingDims * 2),
    evidence: {
      measuredValue: `${missingDims} un-dimensioned images`,
      expectedThreshold: '0 un-dimensioned images',
      diffSummary: isDimsComplete ? 'All dimensioned' : `${missingDims} without dimensions`
    },
    offendingSnippets: images.images
      .filter(img => !img.hasDimensions)
      .slice(0, 3)
      .map(img => `<img src="${img.src}">`),
    searchEngineImpact: isDimsComplete
      ? 'Supports optimal Core Web Vitals (CLS < 0.1) score.'
      : 'Causes content jarring as images load, reducing Google Page Experience ranking score.',
    recommendation: 'Add explicit width and height HTML attributes to all <img> tags so the browser can reserve layout aspect ratio.'
  });

  // 3. Modern Next-Gen Formats
  const modernRatio = Math.round((images.modernFormatCount / images.totalImages) * 100);
  const isModern = modernRatio >= 60;

  issues.push({
    id: 'issue_image_modern',
    ruleCode: 'TECH_IMAGE_MODERN_FORMAT',
    title: isModern ? 'Next-Gen Image Formats Adopted' : 'Legacy Image Formats Detected',
    category: 'performance',
    severity: isModern ? 'passed' : 'info',
    description: `${images.modernFormatCount} of ${images.totalImages} images (${modernRatio}%) use modern WebP, AVIF, or SVG formats.`,
    scoreDeduction: isModern ? 0 : 2,
    evidence: {
      measuredValue: `${modernRatio}% modern format`,
      expectedThreshold: '>= 60% WebP/AVIF',
      diffSummary: isModern ? 'Compliant' : `${100 - modernRatio}% legacy formats`
    },
    searchEngineImpact: 'Modern formats reduce payload sizes by 25–35%, significantly improving Largest Contentful Paint (LCP).',
    recommendation: 'Convert legacy JPEG and PNG assets to WebP or AVIF.'
  });

  return issues;
}
