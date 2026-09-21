/**
 * Phase 5: URL Filtering, Normalization & SSRF Defense Guard
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254',
  'metadata.google.internal',
  'instance-data'
]);

/**
 * Validates if an IP address string belongs to private, reserved, or loopback space
 */
export function isPrivateIp(ip: string): boolean {
  // IPv4 private ranges
  // 10.0.0.0/8
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return true;
  // 127.0.0.0/8
  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return true;
  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  const match172 = ip.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (match172) {
    const secondOctet = parseInt(match172[1], 10);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }
  // 192.168.0.0/16
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(ip)) return true;
  // 169.254.0.0/16 (Link local / cloud metadata)
  if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(ip)) return true;
  // 0.0.0.0/8
  if (/^0\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return true;

  return false;
}

/**
 * SSRF Guard checking if a URL target is safe to fetch
 */
export function isSafeUrl(rawUrl: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(rawUrl);

    // Only allow http and https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: `Disallowed protocol: ${parsed.protocol}. Only http/https supported.` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check blocklisted hostnames
    if (BLOCKED_HOSTNAMES.has(hostname)) {
      return { safe: false, reason: `SSRF Block: Hostname '${hostname}' is a restricted local/metadata address.` };
    }

    // Check IP patterns
    if (isPrivateIp(hostname)) {
      return { safe: false, reason: `SSRF Block: Target resolves to private/internal IP range (${hostname}).` };
    }

    // Check for internal suffixes (.local, .internal, .lan, .corp)
    if (hostname.endsWith('.local') || hostname.endsWith('.internal') || hostname.endsWith('.lan') || hostname.endsWith('.corp')) {
      return { safe: false, reason: `SSRF Block: Internal network domain suffix (.${hostname.split('.').pop()}) detected.` };
    }

    return { safe: true };
  } catch {
    return { safe: false, reason: 'Invalid or unparseable URL structure' };
  }
}

/**
 * Normalizes URL:
 * - Strips fragment/hash (#anchor)
 * - Removes common tracking query parameters (utm_*, gclid, fbclid, etc.)
 * - Lowercases domain name
 * - Preserves pathname & query parameters
 */
export function normalizeUrl(rawUrl: string, baseUrl?: string): string | null {
  try {
    const parsed = baseUrl ? new URL(rawUrl, baseUrl) : new URL(rawUrl);

    // Filter non-http protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    // Remove hash/fragment
    parsed.hash = '';

    // Strip common tracking params that inflate crawl queues with duplicate pages
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', 'mc_cid', 'mc_eid', '_ga'
    ];
    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }

    // Standardize pathname: collapse multiple slashes
    let cleanPath = parsed.pathname.replace(/\/{2,}/g, '/');
    if (!cleanPath) cleanPath = '/';
    parsed.pathname = cleanPath;

    // Return normalized string
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Checks if a given target URL is considered internal to the base domain
 */
export function isInternalDomain(targetUrl: string, baseDomain: string, allowSubdomains = false): boolean {
  try {
    const targetHost = new URL(targetUrl).hostname.toLowerCase();
    const baseHost = new URL(baseDomain.startsWith('http') ? baseDomain : `https://${baseDomain}`).hostname.toLowerCase();

    if (targetHost === baseHost) {
      return true;
    }

    if (allowSubdomains) {
      // e.g. blog.example.com vs example.com
      const cleanBase = baseHost.replace(/^www\./, '');
      const cleanTarget = targetHost.replace(/^www\./, '');
      return cleanTarget.endsWith(`.${cleanBase}`) || cleanTarget === cleanBase;
    }

    // Check www vs non-www
    const stripWww = (h: string) => h.replace(/^www\./, '');
    return stripWww(targetHost) === stripWww(baseHost);
  } catch {
    return false;
  }
}

/**
 * Checks whether a URL matches any custom exclude pattern (regex or substring)
 */
export function matchesExcludePattern(url: string, patterns: string[]): boolean {
  if (!patterns || patterns.length === 0) return false;

  for (const pattern of patterns) {
    if (!pattern.trim()) continue;
    try {
      // Check if pattern is a regex
      if (pattern.startsWith('/') && pattern.endsWith('/')) {
        const regex = new RegExp(pattern.slice(1, -1), 'i');
        if (regex.test(url)) return true;
      } else {
        // Plain wildcard or substring
        const wildcardRegex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
        if (wildcardRegex.test(url)) return true;
      }
    } catch {
      // Fallback to substring matching
      if (url.includes(pattern)) return true;
    }
  }

  return false;
}
