/**
 * Server-Side URL Sanitization & SSRF (Server-Side Request Forgery) Guard
 */

export interface SsrCheckResult {
  safe: boolean;
  sanitizedUrl: string;
  reason?: string;
}

/**
 * Sanitizes input URLs, automatically correcting common user typos
 * such as "https:///domain.com", "http:///domain.com", duplicate slashes, and leading/trailing whitespace.
 */
export function sanitizeUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let trimmed = rawUrl.trim();

  // Fix common typo: multiple slashes after scheme (e.g. "https:///domain.com" -> "https://domain.com")
  trimmed = trimmed.replace(/^(https?):\/+/i, '$1://');

  // If no scheme, default to https://
  if (!/^https?:\/\//i.test(trimmed)) {
    // If user entered "//domain.com"
    if (trimmed.startsWith('//')) {
      trimmed = `https:${trimmed}`;
    } else {
      trimmed = `https://${trimmed}`;
    }
  }

  return trimmed;
}

/**
 * Validates whether a URL is safe to fetch from the server.
 * Prevents SSRF attacks against localhost, loopback addresses, internal private networks,
 * and cloud metadata services.
 */
export function isSafeToFetch(rawUrl: string): SsrCheckResult {
  const sanitized = sanitizeUrl(rawUrl);

  let parsed: URL;
  try {
    parsed = new URL(sanitized);
  } catch (err: any) {
    return {
      safe: false,
      sanitizedUrl: sanitized,
      reason: `Invalid URL format: ${err.message}`
    };
  }

  // 1. Only allow HTTP and HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      safe: false,
      sanitizedUrl: sanitized,
      reason: `Blocked protocol: "${parsed.protocol}". Only HTTP and HTTPS are permitted.`
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Reject empty or single-character hostnames
  if (!hostname || hostname.length < 2) {
    return {
      safe: false,
      sanitizedUrl: sanitized,
      reason: 'Empty or invalid hostname.'
    };
  }

  // 3. Block loopback and localhost names
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === '0.0.0.0' ||
    hostname === '[::]' ||
    hostname === '[::1]' ||
    hostname === '::1'
  ) {
    return {
      safe: false,
      sanitizedUrl: sanitized,
      reason: `Access to internal host "${hostname}" is forbidden for security (SSRF prevention).`
    };
  }

  // 4. Block IPv4 private ranges, loopback (127.x.x.x), and cloud metadata (169.254.169.254)
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipMatch = hostname.match(ipv4Regex);

  if (ipMatch) {
    const octet1 = parseInt(ipMatch[1], 10);
    const octet2 = parseInt(ipMatch[2], 10);
    const octet3 = parseInt(ipMatch[3], 10);
    const octet4 = parseInt(ipMatch[4], 10);

    // Validate octet range
    if ([octet1, octet2, octet3, octet4].some(o => o < 0 || o > 255)) {
      return {
        safe: false,
        sanitizedUrl: sanitized,
        reason: 'Invalid IPv4 address octet.'
      };
    }

    // 127.0.0.0/8 (Loopback)
    if (octet1 === 127) {
      return {
        safe: false,
        sanitizedUrl: sanitized,
        reason: 'Access to loopback address (127.0.0.0/8) is forbidden.'
      };
    }

    // 0.0.0.0/8 (Current network)
    if (octet1 === 0) {
      return {
        safe: false,
        sanitizedUrl: sanitized,
        reason: 'Access to 0.0.0.0/8 is forbidden.'
      };
    }

    // 10.0.0.0/8 (Private network)
    if (octet1 === 10) {
      return {
        safe: false,
        sanitizedUrl: sanitized,
        reason: 'Access to private network (10.0.0.0/8) is forbidden.'
      };
    }

    // 172.16.0.0/12 (Private network)
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) {
      return {
        safe: false,
        sanitizedUrl: sanitized,
        reason: 'Access to private network (172.16.0.0/12) is forbidden.'
      };
    }

    // 192.168.0.0/16 (Private network)
    if (octet1 === 192 && octet2 === 168) {
      return {
        safe: false,
        sanitizedUrl: sanitized,
        reason: 'Access to local network (192.168.0.0/16) is forbidden.'
      };
    }

    // 169.254.0.0/16 (Link-Local / Cloud Metadata e.g. AWS/GCP 169.254.169.254)
    if (octet1 === 169 && octet2 === 254) {
      return {
        safe: false,
        sanitizedUrl: sanitized,
        reason: 'Access to cloud metadata service (169.254.0.0/16) is strictly forbidden.'
      };
    }
  }

  // 5. Block IPv6 private and loopback formats
  if (
    hostname.startsWith('[fc') ||
    hostname.startsWith('[fd') ||
    hostname.startsWith('[fe80') ||
    hostname.startsWith('[::1]')
  ) {
    return {
      safe: false,
      sanitizedUrl: sanitized,
      reason: 'Access to IPv6 private/link-local address is forbidden.'
    };
  }

  return {
    safe: true,
    sanitizedUrl: sanitized
  };
}
