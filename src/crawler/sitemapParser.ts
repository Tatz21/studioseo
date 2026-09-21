/**
 * Phase 5: XML Sitemap & Sitemap Index Discovery Engine
 */

import { SitemapEntry } from './types';
import { normalizeUrl } from './urlFilter';

export interface SitemapParseResult {
  isSitemapIndex: boolean;
  entries: SitemapEntry[];
  nestedSitemaps: string[];
  totalUrls: number;
}

export class SitemapParser {
  /**
   * Parse raw XML sitemap or sitemap index string
   */
  public static parse(xmlContent: string, baseUrl?: string): SitemapParseResult {
    const result: SitemapParseResult = {
      isSitemapIndex: false,
      entries: [],
      nestedSitemaps: [],
      totalUrls: 0
    };

    if (!xmlContent || !xmlContent.trim()) {
      return result;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

      // Check for parse error
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        // Fall back to robust regex extraction if XML parsing fails on custom entities
        return this.parseViaRegex(xmlContent, baseUrl);
      }

      // Check if this is a Sitemap Index (<sitemapindex>)
      const sitemapIndex = xmlDoc.getElementsByTagName('sitemapindex');
      if (sitemapIndex.length > 0) {
        result.isSitemapIndex = true;
        const sitemapNodes = xmlDoc.getElementsByTagName('sitemap');
        for (let i = 0; i < sitemapNodes.length; i++) {
          const loc = sitemapNodes[i].getElementsByTagName('loc')[0]?.textContent?.trim();
          if (loc) {
            const normalized = normalizeUrl(loc, baseUrl);
            if (normalized && !result.nestedSitemaps.includes(normalized)) {
              result.nestedSitemaps.push(normalized);
            }
          }
        }
        return result;
      }

      // Parse standard URL set (<urlset>)
      const urlNodes = xmlDoc.getElementsByTagName('url');
      for (let i = 0; i < urlNodes.length; i++) {
        const node = urlNodes[i];
        const loc = node.getElementsByTagName('loc')[0]?.textContent?.trim();
        if (!loc) continue;

        const normalized = normalizeUrl(loc, baseUrl);
        if (!normalized) continue;

        const lastmod = node.getElementsByTagName('lastmod')[0]?.textContent?.trim();
        const changefreq = node.getElementsByTagName('changefreq')[0]?.textContent?.trim() as SitemapEntry['changeFrequency'];
        const priorityRaw = node.getElementsByTagName('priority')[0]?.textContent?.trim();
        const priority = priorityRaw ? parseFloat(priorityRaw) : undefined;

        result.entries.push({
          url: normalized,
          lastModified: lastmod,
          changeFrequency: changefreq,
          priority: isNaN(priority || 0) ? 0.5 : priority
        });
      }

      result.totalUrls = result.entries.length;
      return result;
    } catch {
      return this.parseViaRegex(xmlContent, baseUrl);
    }
  }

  /**
   * Regex-based fallback parser for broken or lenient XML
   */
  private static parseViaRegex(content: string, baseUrl?: string): SitemapParseResult {
    const result: SitemapParseResult = {
      isSitemapIndex: false,
      entries: [],
      nestedSitemaps: [],
      totalUrls: 0
    };

    if (/<sitemapindex/i.test(content)) {
      result.isSitemapIndex = true;
      const sitemapRegex = /<sitemap>[\s\S]*?<loc>\s*([^<\s]+)\s*<\/loc>[\s\S]*?<\/sitemap>/gi;
      let match: RegExpExecArray | null;
      while ((match = sitemapRegex.exec(content)) !== null) {
        const rawLoc = match[1];
        const normalized = normalizeUrl(rawLoc, baseUrl);
        if (normalized && !result.nestedSitemaps.includes(normalized)) {
          result.nestedSitemaps.push(normalized);
        }
      }
      return result;
    }

    // Match <url> blocks
    const urlRegex = /<url>([\s\S]*?)<\/url>/gi;
    let urlMatch: RegExpExecArray | null;

    while ((urlMatch = urlRegex.exec(content)) !== null) {
      const block = urlMatch[1];
      const locMatch = /<loc>\s*([^<\s]+)\s*<\/loc>/i.exec(block);
      if (!locMatch) continue;

      const normalized = normalizeUrl(locMatch[1], baseUrl);
      if (!normalized) continue;

      const lastmodMatch = /<lastmod>\s*([^<\s]+)\s*<\/lastmod>/i.exec(block);
      const priorityMatch = /<priority>\s*([0-9.]+)\s*<\/priority>/i.exec(block);

      result.entries.push({
        url: normalized,
        lastModified: lastmodMatch ? lastmodMatch[1] : undefined,
        priority: priorityMatch ? parseFloat(priorityMatch[1]) : 0.5
      });
    }

    result.totalUrls = result.entries.length;
    return result;
  }
}
