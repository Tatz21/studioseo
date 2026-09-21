/**
 * Phase 6: Unified SEO Data Extraction Pipeline
 */

import { ExtractedPageData } from './types';
import { MetadataExtractor } from './metadataExtractor';
import { HeadingsExtractor } from './headingsExtractor';
import { CanonicalExtractor } from './canonicalExtractor';
import { LinksExtractor } from './linksExtractor';
import { ImagesExtractor } from './imagesExtractor';
import { SchemaExtractor } from './schemaExtractor';
import { ContentStatsExtractor } from './contentStatsExtractor';

export * from './types';
export { MetadataExtractor } from './metadataExtractor';
export { HeadingsExtractor } from './headingsExtractor';
export { CanonicalExtractor } from './canonicalExtractor';
export { LinksExtractor } from './linksExtractor';
export { ImagesExtractor } from './imagesExtractor';
export { SchemaExtractor } from './schemaExtractor';
export { ContentStatsExtractor } from './contentStatsExtractor';

export class SeoDataExtractor {
  /**
   * Main entry point to extract complete SEO artifacts from an HTML document string
   */
  public static extract(
    rawHtml: string, 
    targetUrl: string, 
    statusCode: number = 200, 
    loadTimeMs: number = 180
  ): ExtractedPageData {
    let domain = '';
    try {
      domain = new URL(targetUrl).hostname;
    } catch {
      domain = targetUrl;
    }

    // Parse HTML string to DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml || '<!DOCTYPE html><html><head></head><body></body></html>', 'text/html');

    // Run specialized extractors
    const metadata = MetadataExtractor.extract(doc, targetUrl);
    const headings = HeadingsExtractor.extract(doc);
    const canonical = CanonicalExtractor.extract(doc, targetUrl);
    const links = LinksExtractor.extract(doc, targetUrl);
    const images = ImagesExtractor.extract(doc, targetUrl);
    const schema = SchemaExtractor.extract(doc);
    const content = ContentStatsExtractor.extract(doc, rawHtml);

    const pageSizeKb = Math.round((new Blob([rawHtml]).size / 1024) * 10) / 10;

    return {
      id: `extract_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      url: targetUrl,
      domain,
      extractedAt: new Date().toISOString(),
      statusCode,
      loadTimeMs,
      pageSizeKb,
      metadata,
      headings,
      canonical,
      links,
      images,
      schema,
      content
    };
  }
}
