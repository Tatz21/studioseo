import { MetaData, SchemaItem, SeoIssue } from './types';

export function runTechnicalAudit(metadata: MetaData, schemas: SchemaItem[], targetUrl: string): SeoIssue[] {
  const issues: SeoIssue[] = [];

  // 1. Title Tag Evaluation
  if (!metadata.title) {
    issues.push({
      id: 'tech-title-missing',
      title: 'Missing Page Title (<title>)',
      category: 'technical',
      severity: 'critical',
      description: 'The document does not have a <title> element in the <head>.',
      impact: 'Search engines use the title tag as the primary headline in SERP listings. Missing titles severely hurt ranking and CTR.',
      recommendation: 'Add a concise, keyword-rich <title> tag between 50 and 60 characters.',
      snippet: '<title>Primary Keyword - Brand Name</title>',
      expected: '50 - 60 characters',
      value: 0
    });
  } else if (metadata.titleLength < 30) {
    issues.push({
      id: 'tech-title-short',
      title: 'Title Tag is Too Short',
      category: 'technical',
      severity: 'warning',
      description: `The title tag is only ${metadata.titleLength} characters. It is under-optimized.`,
      impact: 'Short titles miss opportunities to rank for target keywords and provide context.',
      recommendation: 'Expand the title to 50-60 characters including primary keyword and brand value.',
      expected: '50 - 60 characters',
      value: `${metadata.titleLength} chars`
    });
  } else if (metadata.titleLength > 65) {
    issues.push({
      id: 'tech-title-long',
      title: 'Title Tag is Too Long (Risk of Truncation)',
      category: 'technical',
      severity: 'warning',
      description: `The title tag is ${metadata.titleLength} characters, which exceeds Google's typical 600px / ~60 character display limit.`,
      impact: 'Search engines will truncate the title with an ellipsis (...) in SERP results, lowering CTR.',
      recommendation: 'Shorten title to under 60 characters and place primary keywords towards the beginning.',
      expected: '50 - 60 characters',
      value: `${metadata.titleLength} chars`
    });
  } else {
    issues.push({
      id: 'tech-title-passed',
      title: 'Optimal Title Tag Length',
      category: 'technical',
      severity: 'passed',
      description: `Title tag length is ${metadata.titleLength} characters, fitting standard SERP snippet parameters.`,
      impact: 'Displays cleanly without truncation in desktop and mobile search snippets.',
      recommendation: 'Maintain title relevance and monitor click-through rates.',
      value: `"${metadata.title}" (${metadata.titleLength} chars)`
    });
  }

  // 2. Meta Description Evaluation
  if (!metadata.description) {
    issues.push({
      id: 'tech-desc-missing',
      title: 'Missing Meta Description',
      category: 'technical',
      severity: 'critical',
      description: 'No <meta name="description"> tag was found.',
      impact: 'Search engines will auto-generate arbitrary snippet text from page body, reducing control over search CTR.',
      recommendation: 'Add a compelling meta description between 120 and 160 characters containing a strong call to action.',
      snippet: '<meta name="description" content="Discover professional services with exceptional quality..." />',
      expected: '120 - 160 characters',
      value: 'None'
    });
  } else if (metadata.descriptionLength < 70) {
    issues.push({
      id: 'tech-desc-short',
      title: 'Meta Description is Too Short',
      category: 'technical',
      severity: 'warning',
      description: `Meta description is only ${metadata.descriptionLength} characters.`,
      impact: 'Under-utilized snippet real estate on search engine results pages.',
      recommendation: 'Expand description to 120-160 characters summarizing the page and including user value proposition.',
      expected: '120 - 160 characters',
      value: `${metadata.descriptionLength} chars`
    });
  } else if (metadata.descriptionLength > 165) {
    issues.push({
      id: 'tech-desc-long',
      title: 'Meta Description is Too Long',
      category: 'technical',
      severity: 'warning',
      description: `Meta description is ${metadata.descriptionLength} characters, which may be truncated on mobile and desktop SERPs.`,
      impact: 'Important promotional messages or CTAs at the end of the description will be cut off.',
      recommendation: 'Keep descriptions between 120 and 160 characters.',
      expected: '120 - 160 characters',
      value: `${metadata.descriptionLength} chars`
    });
  } else {
    issues.push({
      id: 'tech-desc-passed',
      title: 'Optimal Meta Description Length',
      category: 'technical',
      severity: 'passed',
      description: `Meta description length is ${metadata.descriptionLength} characters.`,
      impact: 'Maximizes search snippet visibility and encourages click-throughs.',
      recommendation: 'Keep message aligned with page content intent.',
      value: `${metadata.descriptionLength} chars`
    });
  }

  // 3. Viewport (Mobile Friendliness)
  if (!metadata.viewport) {
    issues.push({
      id: 'tech-viewport-missing',
      title: 'Missing Mobile Viewport Tag',
      category: 'technical',
      severity: 'critical',
      description: 'The document lacks a <meta name="viewport"> tag.',
      impact: 'Mobile browsers will render the desktop view zoomed out, failing Google Mobile-First Indexing criteria.',
      recommendation: 'Add the standard responsive viewport meta tag.',
      snippet: '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      expected: 'width=device-width, initial-scale=1.0',
      value: 'None'
    });
  } else {
    issues.push({
      id: 'tech-viewport-passed',
      title: 'Mobile Viewport Configured',
      category: 'technical',
      severity: 'passed',
      description: 'Page includes responsive mobile viewport definition.',
      impact: 'Ensures page scales properly on smartphones and tablets.',
      recommendation: 'Verify font sizes and touch targets on small screens.',
      value: metadata.viewport
    });
  }

  // 4. Canonical Tag
  if (!metadata.canonicalUrl) {
    issues.push({
      id: 'tech-canonical-missing',
      title: 'Missing Canonical Link Tag (<link rel="canonical">)',
      category: 'technical',
      severity: 'warning',
      description: 'No canonical URL is specified in the document head.',
      impact: 'Risk of duplicate content penalties across HTTP/HTTPS, www/non-www, or parameterized URLs.',
      recommendation: 'Specify a self-referencing canonical URL.',
      snippet: `<link rel="canonical" href="${targetUrl || 'https://yourdomain.com/current-page'}" />`,
      expected: 'Valid absolute URL',
      value: 'None'
    });
  } else {
    issues.push({
      id: 'tech-canonical-passed',
      title: 'Canonical URL Specified',
      category: 'technical',
      severity: 'passed',
      description: 'Valid canonical tag found.',
      impact: 'Consolidates ranking signals and prevents duplicate content fragmentation.',
      recommendation: 'Ensure canonical URL matches the preferred production domain protocol.',
      value: metadata.canonicalUrl
    });
  }

  // 5. Robots Meta Tag
  if (metadata.robots && (metadata.robots.toLowerCase().includes('noindex') || metadata.robots.toLowerCase().includes('none'))) {
    issues.push({
      id: 'tech-robots-noindex',
      title: 'Page Set to NOINDEX via Robots Meta Tag',
      category: 'technical',
      severity: 'critical',
      description: `Robots tag contains "${metadata.robots}". Search engines are instructed NOT to index this page.`,
      impact: 'The page will be removed from search engine indexes and receive zero organic traffic.',
      recommendation: 'Remove the noindex directive if this page is intended for public search visibility.',
      snippet: '<meta name="robots" content="index, follow" />',
      expected: 'index, follow',
      value: metadata.robots
    });
  } else {
    issues.push({
      id: 'tech-robots-passed',
      title: 'Robots Directives Allow Indexing',
      category: 'technical',
      severity: 'passed',
      description: metadata.robots ? `Robots tag: "${metadata.robots}"` : 'Default index, follow behavior active.',
      impact: 'Allows search crawlers to index and follow page links.',
      recommendation: 'Maintain proper crawl budget allocation across site paths.'
    });
  }

  // 6. Character Encoding & HTTPS
  if (metadata.charset.toLowerCase().includes('utf-8')) {
    issues.push({
      id: 'tech-charset-passed',
      title: 'Character Encoding is UTF-8',
      category: 'technical',
      severity: 'passed',
      description: 'Document declares UTF-8 character encoding.',
      impact: 'Prevents character rendering issues across international alphabets.',
      recommendation: 'Keep charset tag placed near the top of <head>.'
    });
  }

  // 7. OpenGraph / Social Meta Tags
  if (!metadata.ogTitle || !metadata.ogImage) {
    issues.push({
      id: 'social-og-incomplete',
      title: 'Incomplete Open Graph (OG) Meta Tags',
      category: 'social',
      severity: 'warning',
      description: 'Missing essential Open Graph tags (og:title, og:image, or og:description).',
      impact: 'Social shares on Facebook, LinkedIn, WhatsApp, and Slack will look plain without rich cards and thumbnails.',
      recommendation: 'Add og:title, og:description, and high-resolution og:image (1200x630px).',
      snippet: '<meta property="og:image" content="https://example.com/og-banner.jpg" />\n<meta property="og:type" content="website" />',
      value: `og:image: ${metadata.ogImage ? 'Present' : 'Missing'}`
    });
  } else {
    issues.push({
      id: 'social-og-passed',
      title: 'Open Graph Social Tags Configured',
      category: 'social',
      severity: 'passed',
      description: 'Valid og:title and og:image detected for social card rendering.',
      impact: 'Generates rich interactive preview cards on social networks and messaging apps.',
      recommendation: 'Ensure images are compressed and at least 1200x630px.'
    });
  }

  // 8. Structured Data (Schema.org)
  if (schemas.length === 0) {
    issues.push({
      id: 'tech-schema-missing',
      title: 'No Structured Data (Schema.org JSON-LD)',
      category: 'technical',
      severity: 'warning',
      description: 'No JSON-LD structured data detected in the document.',
      impact: 'Misses out on Google Rich Snippets, Knowledge Panels, FAQ accordions, and star rating displays in SERPs.',
      recommendation: 'Add structured JSON-LD schema appropriate for page content (Organization, LocalBusiness, Article, or Product).',
      snippet: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "LocalBusiness",\n  "name": "Your Brand"\n}\n</script>'
    });
  } else {
    const invalidSchemas = schemas.filter(s => !s.isValid);
    if (invalidSchemas.length > 0) {
      issues.push({
        id: 'tech-schema-error',
        title: 'Invalid Schema.org JSON-LD Syntax',
        category: 'technical',
        severity: 'critical',
        description: `Found ${invalidSchemas.length} JSON-LD script(s) with parsing or syntax errors.`,
        impact: 'Search engines will ignore broken structured data tags.',
        recommendation: 'Fix JSON syntax errors such as missing quotes or trailing commas in JSON-LD scripts.'
      });
    } else {
      issues.push({
        id: 'tech-schema-passed',
        title: `Structured Data Found (${schemas.length} Schema Types)`,
        category: 'technical',
        severity: 'passed',
        description: `Valid structured data detected: ${schemas.map(s => s.type).join(', ')}.`,
        impact: 'Qualifies page for rich search results and semantic knowledge graph recognition.',
        recommendation: 'Keep schema properties updated with latest Schema.org vocabulary.'
      });
    }
  }

  return issues;
}
