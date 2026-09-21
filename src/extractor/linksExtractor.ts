/**
 * Phase 6: Links, Anchors & Rel Attributes Extractor
 */

import { ExtractedLinkItem, LinksExtractionReport } from './types';

const GENERIC_ANCHOR_PATTERNS = new Set([
  'click here',
  'click here to read more',
  'here',
  'read more',
  'learn more',
  'more',
  'link',
  'this link',
  'website',
  'visit website',
  'find out more',
  'view details',
  'continue'
]);

export class LinksExtractor {
  public static extract(doc: Document, currentUrl: string): LinksExtractionReport {
    const anchorElements = doc.querySelectorAll('a[href]');
    const links: ExtractedLinkItem[] = [];

    let internalCount = 0;
    let externalCount = 0;
    let nofollowCount = 0;
    let sponsoredCount = 0;
    let ugcCount = 0;
    let genericAnchorCount = 0;
    let emptyAnchorCount = 0;

    let baseOrigin = '';
    try {
      baseOrigin = new URL(currentUrl).origin;
    } catch {
      baseOrigin = '';
    }

    anchorElements.forEach((el, index) => {
      const rawHref = el.getAttribute('href')?.trim() || '';
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
        return;
      }

      let absoluteUrl = rawHref;
      let isInternal = false;

      try {
        const parsed = new URL(rawHref, currentUrl);
        absoluteUrl = parsed.toString();
        isInternal = parsed.origin === baseOrigin;
      } catch {
        // Assume internal if relative
        isInternal = !rawHref.startsWith('http://') && !rawHref.startsWith('https://');
      }

      const relRaw = el.getAttribute('rel')?.toLowerCase() || '';
      const relAttributes = relRaw.split(/\s+/).filter(Boolean);
      const isNofollow = relAttributes.includes('nofollow');
      const isSponsored = relAttributes.includes('sponsored');
      const isUgc = relAttributes.includes('ugc');
      const target = el.getAttribute('target') || undefined;

      const rawText = el.textContent?.trim() || '';
      const imgInAnchor = el.querySelector('img');
      const anchorText = rawText || (imgInAnchor ? `[Image: ${imgInAnchor.getAttribute('alt') || 'No Alt'}]` : '');

      const isGeneric = GENERIC_ANCHOR_PATTERNS.has(rawText.toLowerCase());
      const isEmpty = !anchorText;

      if (isInternal) internalCount++;
      else externalCount++;

      if (isNofollow) nofollowCount++;
      if (isSponsored) sponsoredCount++;
      if (isUgc) ugcCount++;
      if (isGeneric) genericAnchorCount++;
      if (isEmpty) emptyAnchorCount++;

      links.push({
        id: `link_${index + 1}`,
        url: absoluteUrl,
        anchorText: anchorText || '(Empty Anchor)',
        isInternal,
        isNofollow,
        isSponsored,
        isUgc,
        target,
        relAttributes,
        isGenericAnchor: isGeneric
      });
    });

    return {
      totalLinks: links.length,
      internalCount,
      externalCount,
      nofollowCount,
      sponsoredCount,
      ugcCount,
      genericAnchorCount,
      emptyAnchorCount,
      links
    };
  }
}
