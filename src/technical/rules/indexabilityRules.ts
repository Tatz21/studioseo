/**
 * Phase 7: Indexability & Protocol Technical Rules
 */

import { TechnicalIssue } from '../types';
import { ExtractedPageData } from '../../extractor/types';

export function evaluateIndexabilityRules(data: ExtractedPageData): TechnicalIssue[] {
  const issues: TechnicalIssue[] = [];

  // 1. HTTP Status 200
  const is200 = data.statusCode === 200;
  issues.push({
    id: 'issue_http_status',
    ruleCode: 'TECH_HTTP_STATUS_200',
    title: is200 ? 'HTTP 200 OK Status Code' : `Non-200 HTTP Response (${data.statusCode})`,
    category: 'indexability',
    severity: is200 ? 'passed' : data.statusCode >= 400 ? 'critical' : 'warning',
    description: is200 
      ? 'The web server returned a successful HTTP 200 OK status code.' 
      : `The server returned an HTTP ${data.statusCode} response code.`,
    scoreDeduction: is200 ? 0 : data.statusCode >= 400 ? 25 : 10,
    evidence: {
      measuredValue: data.statusCode,
      expectedThreshold: '200 OK',
      diffSummary: is200 ? 'Matches expected 200 OK' : `Unexpected HTTP code ${data.statusCode}`
    },
    searchEngineImpact: is200 
      ? 'Allows search bots to fetch, parse, and index page contents without obstacle.' 
      : 'Pages returning 4xx or 5xx codes cannot be indexed and will be dropped from Google Search.',
    recommendation: is200 
      ? 'Maintain reliable server hosting and monitor uptime.' 
      : 'Resolve server routing errors or set up 301 redirects to active equivalent resources.'
  });

  // 2. HTTPS Protocol
  const isHttps = data.url.startsWith('https://');
  issues.push({
    id: 'issue_https_protocol',
    ruleCode: 'TECH_HTTPS_PROTOCOL',
    title: isHttps ? 'HTTPS Secure Connection Enforced' : 'Insecure HTTP Connection Detected',
    category: 'indexability',
    severity: isHttps ? 'passed' : 'critical',
    description: isHttps
      ? 'The page is securely encrypted and delivered over HTTPS with SSL/TLS.'
      : 'The page is served over unencrypted HTTP, triggering browser security warnings.',
    scoreDeduction: isHttps ? 0 : 20,
    evidence: {
      measuredValue: isHttps ? 'https://' : 'http://',
      expectedThreshold: 'https://',
      diffSummary: isHttps ? 'Secure protocol enforced' : 'Missing SSL encryption'
    },
    searchEngineImpact: isHttps 
      ? 'Complies with Google Core ranking signal favoring secure connections.' 
      : 'Google imposes ranking demotions and Chrome displays "Not Secure" warning banners to visitors.',
    recommendation: isHttps 
      ? 'Ensure SSL certificate renews automatically before expiration.' 
      : 'Install an SSL certificate and configure server-side 301 redirect from HTTP to HTTPS.',
    codeFixTemplate: `<VirtualHost *:80>\n  ServerName ${data.domain}\n  Redirect permanent / https://${data.domain}/\n</VirtualHost>`
  });

  // 3. Meta Robots Indexable
  const isNoindex = data.metadata.robots.noindex;
  issues.push({
    id: 'issue_robots_indexable',
    ruleCode: 'TECH_ROBOTS_INDEXABLE',
    title: isNoindex ? 'Meta Robots "noindex" Directive Present' : 'Page Indexable by Search Engines',
    category: 'indexability',
    severity: isNoindex ? 'critical' : 'passed',
    description: isNoindex
      ? 'A meta robots tag with "noindex" was found, explicitly forbidding search engines from indexing this page.'
      : 'No blocking meta robots directives found; page is fully indexable.',
    scoreDeduction: isNoindex ? 30 : 0,
    evidence: {
      measuredValue: data.metadata.robots.rawContent || 'index, follow',
      expectedThreshold: 'index, follow',
      diffSummary: isNoindex ? 'Blocked by noindex' : 'Open for indexing'
    },
    searchEngineImpact: isNoindex 
      ? 'Search engines will completely purge this page from search results.' 
      : 'Page eligible for search engine indexing and ranking.',
    recommendation: isNoindex 
      ? 'Remove the "noindex" directive from <meta name="robots"> if you wish this page to rank.' 
      : 'No action needed. Keep monitoring deployment environments to prevent staging noindex leaks.',
    codeFixTemplate: isNoindex ? `<meta name="robots" content="index, follow">` : undefined
  });

  // 4. Canonical Tag Exists
  const hasCanonical = data.canonical.hasCanonical;
  issues.push({
    id: 'issue_canonical_exists',
    ruleCode: 'TECH_CANONICAL_EXISTS',
    title: hasCanonical ? 'Canonical Tag Declared' : 'Missing Canonical Link Element',
    category: 'indexability',
    severity: hasCanonical ? 'passed' : 'warning',
    description: hasCanonical
      ? `Canonical tag specifies the master URL: ${data.canonical.canonicalUrl}`
      : 'No <link rel="canonical"> tag declared. Search engines will guess the canonical version.',
    scoreDeduction: hasCanonical ? 0 : 8,
    evidence: {
      measuredValue: data.canonical.canonicalUrl || 'None',
      expectedThreshold: 'Declared <link rel="canonical">',
      diffSummary: hasCanonical ? 'Declared' : 'Missing'
    },
    searchEngineImpact: hasCanonical 
      ? 'Prevents duplicate content dilution across URL variations (e.g. query strings, tracking parameters).' 
      : 'Exposes website to duplicate content penalties if URLs are accessible with parameters.',
    recommendation: hasCanonical 
      ? 'Keep canonical URL synchronized with the preferred URL structure.' 
      : `Add a canonical tag in the <head> pointing to ${data.url}.`,
    codeFixTemplate: `<link rel="canonical" href="${data.url}" />`
  });

  // 5. Canonical Valid & Absolute
  if (hasCanonical) {
    const isAbsolute = data.canonical.isAbsolute;
    issues.push({
      id: 'issue_canonical_valid',
      ruleCode: 'TECH_CANONICAL_VALID',
      title: isAbsolute ? 'Canonical URL is Absolute' : 'Relative Canonical URL Warning',
      category: 'indexability',
      severity: isAbsolute ? 'passed' : 'warning',
      description: isAbsolute
        ? 'Canonical URL uses full protocol and domain, preventing crawl ambiguity.'
        : 'Canonical URL uses relative path. Search engines recommend absolute URLs.',
      scoreDeduction: isAbsolute ? 0 : 5,
      evidence: {
        measuredValue: data.canonical.canonicalUrl || '',
        expectedThreshold: 'Absolute URL (starts with https://)',
        diffSummary: isAbsolute ? 'Absolute' : 'Relative'
      },
      searchEngineImpact: 'Ambiguous canonicals may cause search engines to misinterpret preferred page targets.',
      recommendation: 'Update canonical href to full absolute URL including protocol and domain.'
    });
  }

  return issues;
}
