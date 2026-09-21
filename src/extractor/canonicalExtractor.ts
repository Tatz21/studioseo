/**
 * Phase 6: Canonical URL & Hreflang Multi-Regional Extractor
 */

import { ExtractedCanonical, HreflangAlternate } from './types';

export class CanonicalExtractor {
  public static extract(doc: Document, currentUrl: string): ExtractedCanonical {
    const canonicalLinks = doc.querySelectorAll('link[rel="canonical" i]');
    const warnings: string[] = [];
    let canonicalUrl: string | undefined;

    if (canonicalLinks.length === 0) {
      warnings.push('No canonical tag declared. Search engines will infer canonical URL automatically.');
    } else if (canonicalLinks.length > 1) {
      warnings.push(`Multiple canonical tags (${canonicalLinks.length}) detected. Search engines will ignore all conflicting canonicals.`);
    }

    const firstCanonical = canonicalLinks[0];
    const rawHref = firstCanonical?.getAttribute('href')?.trim();

    let isAbsolute = false;
    let isSelfReferential = false;
    let isCrossDomain = false;

    if (rawHref) {
      canonicalUrl = rawHref;

      if (rawHref.startsWith('http://') || rawHref.startsWith('https://')) {
        isAbsolute = true;
      } else {
        warnings.push('Canonical URL is relative instead of absolute. Absolute URLs (including https://) prevent ambiguity.');
        try {
          canonicalUrl = new URL(rawHref, currentUrl).toString();
        } catch {
          // keep as is
        }
      }

      try {
        const parsedCanonical = new URL(canonicalUrl);
        const parsedCurrent = new URL(currentUrl);

        // Check self-referential
        isSelfReferential = parsedCanonical.origin === parsedCurrent.origin && 
                            parsedCanonical.pathname === parsedCurrent.pathname;

        // Check cross-domain
        isCrossDomain = parsedCanonical.hostname.toLowerCase() !== parsedCurrent.hostname.toLowerCase();
        if (isCrossDomain) {
          warnings.push(`Cross-domain canonical detected (${parsedCanonical.hostname} vs ${parsedCurrent.hostname}). Ensure this is intentional syndication.`);
        }

        // Check HTTP vs HTTPS
        if (parsedCanonical.protocol === 'http:' && parsedCurrent.protocol === 'https:') {
          warnings.push('Insecure canonical protocol: points to http:// while page is served over https://.');
        }
      } catch {
        warnings.push('Malformed canonical URL format.');
      }
    }

    // Extract Hreflang alternates
    const hreflangElements = doc.querySelectorAll('link[rel="alternate" i][hreflang]');
    const hreflangAlternates: HreflangAlternate[] = [];

    hreflangElements.forEach(el => {
      const hreflang = el.getAttribute('hreflang')?.trim().toLowerCase() || '';
      const href = el.getAttribute('href')?.trim() || '';
      if (hreflang && href) {
        hreflangAlternates.push({
          hreflang,
          href,
          isXDefault: hreflang === 'x-default'
        });
      }
    });

    return {
      canonicalUrl,
      hasCanonical: !!canonicalUrl,
      isSelfReferential,
      isCrossDomain,
      isAbsolute,
      hreflangAlternates,
      warnings
    };
  }
}
