import { SeoDataExtractor } from '../extractor/index';
import { TechnicalEngine } from '../technical/technicalEngine';
import { 
  PageAuditResult, 
  CoreWebVitals, 
  AssetWeights, 
  PageRecommendation, 
  AuditCheckItem,
  MetricStatus,
  WebVitalMetric
} from './types';

function computeGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 97) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function evaluateMetric(value: number, goodMax: number, poorMin: number): MetricStatus {
  if (value <= goodMax) return 'good';
  if (value >= poorMin) return 'poor';
  return 'needs-work';
}

export class PageAuditEngine {
  /**
   * Executes a comprehensive Page Audit including on-page DOM analysis,
   * technical rules verification, Core Web Vitals simulation, and prioritized recommendations.
   */
  public static auditPage(rawHtml: string, targetUrl: string): PageAuditResult {
    // 1. Extract AST data using Phase 6 Extractor
    const extractedData = SeoDataExtractor.extract(rawHtml, targetUrl);

    // 2. Evaluate deterministic rules using Phase 7 Technical Engine
    const technicalReport = TechnicalEngine.audit(extractedData);

    // 3. Compute Simulated & Measured Core Web Vitals & PageSpeed
    const htmlSizeKb = Math.max(1, Math.round(rawHtml.length / 1024));
    const imageCount = extractedData.images.totalImages;
    const scriptCount = (rawHtml.match(/<script/gi) || []).length;
    const stylesheetCount = (rawHtml.match(/<link[^>]+rel=["']stylesheet["']/gi) || []).length;

    // Detect CLS risk: images missing explicit width or height
    const undimensionedImages = extractedData.images.images.filter(img => !img.hasDimensions);
    const clsScore = undimensionedImages.length > 0 
      ? Number((0.04 + undimensionedImages.length * 0.05).toFixed(3)) 
      : 0.02;

    // LCP estimation based on payload and unoptimized media
    const baseLcpMs = 1200 + htmlSizeKb * 15 + imageCount * 140 + scriptCount * 80;
    const lcpMs = Math.min(6500, Math.max(800, baseLcpMs));

    // INP estimation based on script execution
    const inpMs = Math.min(750, Math.max(50, 60 + scriptCount * 22));

    // FCP & TTFB
    const ttfbMs = 180 + Math.min(400, htmlSizeKb * 4);
    const fcpMs = ttfbMs + 650 + stylesheetCount * 120;
    const speedIndexMs = fcpMs + 800 + scriptCount * 60;

    // Metric structures with standard Google CWV thresholds
    const lcpMetric: WebVitalMetric = {
      name: 'Largest Contentful Paint',
      acronym: 'LCP',
      value: lcpMs,
      unit: 's',
      formatted: `${(lcpMs / 1000).toFixed(2)}s`,
      status: evaluateMetric(lcpMs, 2500, 4000),
      thresholds: { good: 2500, poor: 4000 },
      description: 'Measures perceived loading speed by reporting when the main content has likely loaded.',
    };

    const inpMetric: WebVitalMetric = {
      name: 'Interaction to Next Paint',
      acronym: 'INP',
      value: inpMs,
      unit: 'ms',
      formatted: `${inpMs}ms`,
      status: evaluateMetric(inpMs, 200, 500),
      thresholds: { good: 200, poor: 500 },
      description: 'Assesses overall page responsiveness to user interactions like clicks, taps, and keyboard inputs.',
    };

    const clsMetric: WebVitalMetric = {
      name: 'Cumulative Layout Shift',
      acronym: 'CLS',
      value: clsScore,
      unit: '',
      formatted: `${clsScore.toFixed(3)}`,
      status: evaluateMetric(clsScore, 0.1, 0.25),
      thresholds: { good: 0.1, poor: 0.25 },
      description: 'Quantifies visual stability by measuring unexpected layout shifts during the page lifecycle.',
    };

    const fcpMetric: WebVitalMetric = {
      name: 'First Contentful Paint',
      acronym: 'FCP',
      value: fcpMs,
      unit: 's',
      formatted: `${(fcpMs / 1000).toFixed(2)}s`,
      status: evaluateMetric(fcpMs, 1800, 3000),
      thresholds: { good: 1800, poor: 3000 },
      description: 'Marks the time when the browser renders the first bit of content from the DOM.',
    };

    const ttfbMetric: WebVitalMetric = {
      name: 'Time to First Byte',
      acronym: 'TTFB',
      value: ttfbMs,
      unit: 'ms',
      formatted: `${ttfbMs}ms`,
      status: evaluateMetric(ttfbMs, 800, 1800),
      thresholds: { good: 800, poor: 1800 },
      description: 'Measures the time it takes for the browser to receive the first byte of response data from the server.',
    };

    const speedIndexMetric: WebVitalMetric = {
      name: 'Speed Index',
      acronym: 'SI',
      value: speedIndexMs,
      unit: 's',
      formatted: `${(speedIndexMs / 1000).toFixed(2)}s`,
      status: evaluateMetric(speedIndexMs, 3400, 5800),
      thresholds: { good: 3400, poor: 5800 },
      description: 'Shows how quickly the contents of a page are visibly populated during viewport rendering.',
    };

    const webVitals: CoreWebVitals = {
      lcp: lcpMetric,
      inp: inpMetric,
      cls: clsMetric,
      fcp: fcpMetric,
      ttfb: ttfbMetric,
      speedIndex: speedIndexMetric,
    };

    // Calculate PageSpeed Score (0-100) using weighted CWV scores
    let speedScore = 100;
    if (lcpMetric.status === 'poor') speedScore -= 28;
    else if (lcpMetric.status === 'needs-work') speedScore -= 14;

    if (inpMetric.status === 'poor') speedScore -= 25;
    else if (inpMetric.status === 'needs-work') speedScore -= 12;

    if (clsMetric.status === 'poor') speedScore -= 25;
    else if (clsMetric.status === 'needs-work') speedScore -= 12;

    if (fcpMetric.status === 'poor') speedScore -= 12;
    else if (fcpMetric.status === 'needs-work') speedScore -= 6;

    if (ttfbMetric.status === 'poor') speedScore -= 10;
    else if (ttfbMetric.status === 'needs-work') speedScore -= 5;

    const pageSpeedScore = Math.max(25, speedScore);

    // 4. Asset Weights Breakdown
    const cssKb = Math.max(12, stylesheetCount * 28);
    const jsKb = Math.max(45, scriptCount * 65);
    const imageKb = Math.max(30, imageCount * 85);
    const fontKb = 48; // standard font payload
    const totalKb = htmlSizeKb + cssKb + jsKb + imageKb + fontKb;
    const requestsCount = 1 + stylesheetCount + scriptCount + imageCount + 2;

    const assetWeights: AssetWeights = {
      totalKb,
      htmlKb: htmlSizeKb,
      cssKb,
      jsKb,
      imageKb,
      fontKb,
      requestsCount,
    };

    // 5. Generate Prioritized Recommendations Action Plan
    const recommendations: PageRecommendation[] = [];

    // Check: Undimensioned Images (CLS blocker)
    if (undimensionedImages.length > 0) {
      recommendations.push({
        id: 'rec-cls-dimensions',
        title: `Set explicit width and height on ${undimensionedImages.length} image elements`,
        category: 'Performance',
        priority: 'high',
        estimatedImpact: '+12 PageSpeed & Stabilizes CLS',
        effort: 'low',
        explanation: 'Images without width and height cause Cumulative Layout Shift (CLS) as the browser reflows content when images finish loading.',
        actionSteps: [
          'Add explicit width and height attributes to all <img> tags in your markup.',
          'Alternatively, define an aspect-ratio in CSS: img { aspect-ratio: 16 / 9; width: 100%; height: auto; }',
          'Ensure responsive images retain reserved space before decoding.'
        ],
        codeSnippet: {
          language: 'html',
          before: `<img src="${undimensionedImages[0]?.src || '/hero.jpg'}" alt="Hero Banner">`,
          after: `<img src="${undimensionedImages[0]?.src || '/hero.jpg'}" width="1200" height="675" style="width: 100%; height: auto;" alt="Hero Banner">`,
        },
      });
    }

    // Check: Modern Image Formats (LCP booster)
    const legacyImages = extractedData.images.images.filter(img => !img.format.includes('webp') && !img.format.includes('avif') && !img.format.includes('svg'));
    if (legacyImages.length > 0) {
      recommendations.push({
        id: 'rec-modern-images',
        title: `Convert ${legacyImages.length} images to modern WebP or AVIF formats`,
        category: 'Performance',
        priority: 'medium',
        estimatedImpact: 'Saves ~40% Image Bytes & Lowers LCP',
        effort: 'medium',
        explanation: 'Next-gen formats like WebP and AVIF provide superior compression compared to PNG and JPEG without perceptual quality loss.',
        actionSteps: [
          'Use <picture> tags with WebP/AVIF sources and fallbacks.',
          'Integrate an automated build-time image optimizer (e.g. sharp, vite-imagetools) or CDN transform.',
          'Serve responsive image sizes for mobile viewports using srcset.'
        ],
        codeSnippet: {
          language: 'html',
          before: `<img src="hero.png" alt="Hero">`,
          after: `<picture>\n  <source srcset="hero.avif" type="image/avif">\n  <source srcset="hero.webp" type="image/webp">\n  <img src="hero.png" alt="Hero" loading="lazy" width="800" height="450">\n</picture>`,
        },
      });
    }

    // Check: Missing or Incomplete Schema.org JSON-LD
    if (extractedData.schema.jsonLdCount === 0) {
      recommendations.push({
        id: 'rec-schema-jsonld',
        title: 'Implement structured Schema.org JSON-LD markup',
        category: 'Schema',
        priority: 'high',
        estimatedImpact: '+18% CTR in Google SERP Rich Results',
        effort: 'low',
        explanation: 'Structured data enables rich snippet enhancements (stars, site breadcrumbs, sitelinks search box) in Google search results.',
        actionSteps: [
          'Generate JSON-LD markup suited to your page type (Organization, WebSite, Article, Product, or LocalBusiness).',
          'Embed the script inside the <head> block.',
          'Validate using Google Rich Results Test tool.'
        ],
        codeSnippet: {
          language: 'html',
          after: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "${extractedData.metadata.title || 'TechFlow'}",\n  "url": "${targetUrl}"\n}\n</script>`,
        },
      });
    }

    // Check: Heading Hierarchy & Missing Single H1
    if (extractedData.headings.h1Count !== 1) {
      recommendations.push({
        id: 'rec-headings-h1',
        title: extractedData.headings.h1Count === 0 
          ? 'Add a single, descriptive <h1> main heading' 
          : `Consolidate multiple H1 tags (${extractedData.headings.h1Count} found) into one primary topic`,
        category: 'Content',
        priority: 'critical',
        estimatedImpact: '+15 SEO Score & Clarifies Page Topic',
        effort: 'low',
        explanation: 'Every indexable page should have exactly one <h1> tag representing the primary topic of the document to optimize semantic clarity for search engines.',
        actionSteps: [
          'Locate the primary headline of your page and tag it as <h1>.',
          'Convert secondary section headlines into <h2> tags.',
          'Ensure the target keyword is included naturally in the H1.'
        ],
        codeSnippet: {
          language: 'html',
          before: extractedData.headings.h1Count === 0 
            ? `<div class="title">${extractedData.metadata.title || 'Page Title'}</div>` 
            : `<h1>First Title</h1>\n<h1>Second Title</h1>`,
          after: `<h1>${extractedData.metadata.title || 'Main Page Topic Headline'}</h1>`,
        },
      });
    }

    // Check: Thin Content (< 300 words)
    if (extractedData.content.wordCount < 300) {
      recommendations.push({
        id: 'rec-thin-content',
        title: `Expand body copy depth (Current: ${extractedData.content.wordCount} words; Target: 400+ words)`,
        category: 'Content',
        priority: 'medium',
        estimatedImpact: '+8 SEO Score & Reduces Thin Content Penalties',
        effort: 'medium',
        explanation: 'Search engines evaluate pages for comprehensive coverage of search intent. Pages with under 300 words struggle to rank against thorough competitors.',
        actionSteps: [
          'Add an FAQ section addressing user queries.',
          'Expand on feature benefits, technical specifications, or use cases.',
          'Ensure headings structure your narrative logically.'
        ],
      });
    }

    // Check: Missing Alt Text on Images
    const missingAltImages = extractedData.images.images.filter(img => !img.hasAlt);
    if (missingAltImages.length > 0) {
      recommendations.push({
        id: 'rec-img-alt',
        title: `Add descriptive alt text to ${missingAltImages.length} images for accessibility & image search`,
        category: 'Technical',
        priority: 'quick-win',
        estimatedImpact: '+6 SEO Score & WCAG 2.1 AA Compliance',
        effort: 'low',
        explanation: 'Alt text allows visually impaired users with screen readers and search bot image spiders to comprehend image contents.',
        actionSteps: [
          'Provide concise descriptions for functional and editorial images.',
          'For purely decorative background icons, use alt="" or aria-hidden="true".'
        ],
        codeSnippet: {
          language: 'html',
          before: `<img src="${missingAltImages[0]?.src || '/sample.png'}">`,
          after: `<img src="${missingAltImages[0]?.src || '/sample.png'}" alt="Descriptive label of visual content">`,
        },
      });
    }

    // Check: Open Graph & Social Cards
    if (!extractedData.metadata.openGraph.title || !extractedData.metadata.openGraph.image) {
      recommendations.push({
        id: 'rec-social-og',
        title: 'Complete Open Graph metadata for rich social previews',
        category: 'Mobile',
        priority: 'quick-win',
        estimatedImpact: '+35% Click-Through Rate on Social Shares',
        effort: 'low',
        explanation: 'When links are shared on Slack, Twitter, LinkedIn, and Facebook, missing OG tags cause plain text snippets instead of rich media cards.',
        actionSteps: [
          'Add <meta property="og:title"> and <meta property="og:description">.',
          'Provide a high-res (1200x630px) <meta property="og:image"> tag.',
          'Add <meta name="twitter:card" content="summary_large_image">.'
        ],
        codeSnippet: {
          language: 'html',
          after: `<meta property="og:title" content="${extractedData.metadata.title}">\n<meta property="og:description" content="${extractedData.metadata.description}">\n<meta property="og:image" content="${targetUrl}/og-image.jpg">\n<meta name="twitter:card" content="summary_large_image">`,
        },
      });
    }

    // 6. Assemble All Checks Matrix
    const checks: AuditCheckItem[] = technicalReport.issues.map(issue => ({
      id: issue.id,
      name: issue.title,
      category: issue.category,
      status: issue.severity === 'critical' ? 'critical' : issue.severity === 'warning' ? 'warning' : 'passed',
      measuredValue: issue.evidence?.measuredValue !== undefined ? String(issue.evidence.measuredValue) : 'Evaluated',
      criteria: issue.evidence?.expectedThreshold ? String(issue.evidence.expectedThreshold) : 'Standard',
      explanation: issue.description,
    }));

    const checksSummary = {
      passed: technicalReport.passedCount,
      warnings: technicalReport.warningCount,
      critical: technicalReport.criticalCount,
      total: technicalReport.totalRulesEvaluated,
    };

    // Overall Score combined with PageSpeed (70% Technical SEO + 30% PageSpeed)
    const combinedScore = Math.round(technicalReport.overallScore * 0.7 + pageSpeedScore * 0.3);

    return {
      targetUrl,
      title: extractedData.metadata.title || targetUrl,
      scannedAt: new Date().toLocaleTimeString(),
      overallScore: combinedScore,
      grade: computeGrade(combinedScore),
      pageSpeedScore,
      webVitals,
      assetWeights,
      checksSummary,
      checks,
      recommendations,
    };
  }
}
