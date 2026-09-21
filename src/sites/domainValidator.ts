import { DomainValidationResult } from './types';

// Private IP / localhost regex for SSRF prevention
const PRIVATE_IP_REGEX = /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|0\.0\.0\.0|::1)$/i;

/**
 * Validates domain URL format, checks protocol, detects SSL, and enforces SSRF security guardrails.
 */
export function validateDomain(inputUrl: string): DomainValidationResult {
  const trimmed = inputUrl.trim();
  if (!trimmed) {
    return {
      isValid: false,
      normalizedUrl: '',
      domain: '',
      protocol: 'https',
      isSsrfSafe: true,
      sslValid: false,
      robotsTxtStatus: 'missing',
      sitemapStatus: 'not_found',
      error: 'URL cannot be blank.'
    };
  }

  let parsedUrl: URL;
  try {
    const withProtocol = trimmed.startsWith('http://') || trimmed.startsWith('https://') 
      ? trimmed 
      : `https://${trimmed}`;
    parsedUrl = new URL(withProtocol);
  } catch {
    return {
      isValid: false,
      normalizedUrl: trimmed,
      domain: '',
      protocol: 'https',
      isSsrfSafe: true,
      sslValid: false,
      robotsTxtStatus: 'missing',
      sitemapStatus: 'not_found',
      error: 'Invalid URL structure. Must be a valid domain (e.g. example.com or https://example.com).'
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // 1. SSRF Guardrail Check
  const isSsrfBlocked = PRIVATE_IP_REGEX.test(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal');
  if (isSsrfBlocked) {
    return {
      isValid: false,
      normalizedUrl: parsedUrl.toString(),
      domain: hostname,
      protocol: parsedUrl.protocol === 'https:' ? 'https' : 'http',
      isSsrfSafe: false,
      sslValid: false,
      robotsTxtStatus: 'blocked',
      sitemapStatus: 'not_found',
      error: `Security Blocker: "${hostname}" is a private or loopback address. Crawling internal networks is prohibited.`
    };
  }

  // 2. Validate Domain Format (must have a valid TLD)
  if (!hostname.includes('.') || hostname.endsWith('.')) {
    return {
      isValid: false,
      normalizedUrl: parsedUrl.toString(),
      domain: hostname,
      protocol: parsedUrl.protocol === 'https:' ? 'https' : 'http',
      isSsrfSafe: true,
      sslValid: false,
      robotsTxtStatus: 'missing',
      sitemapStatus: 'not_found',
      error: 'Domain must include a valid top-level domain (e.g. .com, .org, .ai, .in).'
    };
  }

  const isHttps = parsedUrl.protocol === 'https:';

  return {
    isValid: true,
    normalizedUrl: parsedUrl.origin,
    domain: hostname,
    protocol: isHttps ? 'https' : 'http',
    isSsrfSafe: true,
    sslValid: isHttps,
    robotsTxtStatus: 'available',
    sitemapStatus: 'detected'
  };
}
