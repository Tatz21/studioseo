/**
 * Phase 6: Metadata & Social Graph Extractor
 */

import { ExtractedMetadata, MetaRobotsDirectives, OpenGraphData, TwitterCardData } from './types';

export class MetadataExtractor {
  /**
   * Extracts metadata, meta robots, open graph, and twitter card tags from DOM document
   */
  public static extract(doc: Document, baseUrl: string): ExtractedMetadata {
    // 1. Title tag
    const titleEl = doc.querySelector('title');
    const title = titleEl?.textContent?.trim() || '';
    const titleLength = title.length;
    // Approximating Google SERP desktop pixel width: ~8.2px per char on average for standard fonts
    const titlePixelWidth = Math.round(titleLength * 8.2);

    // 2. Meta description
    const descEl = doc.querySelector('meta[name="description" i]') || 
                   doc.querySelector('meta[property="description" i]');
    const description = descEl?.getAttribute('content')?.trim() || '';
    const descriptionLength = description.length;

    // 3. Meta robots directives
    const robotsEl = doc.querySelector('meta[name="robots" i]') || 
                     doc.querySelector('meta[name="googlebot" i]');
    const rawRobots = robotsEl?.getAttribute('content')?.toLowerCase() || '';
    const robots: MetaRobotsDirectives = {
      noindex: rawRobots.includes('noindex'),
      nofollow: rawRobots.includes('nofollow'),
      noarchive: rawRobots.includes('noarchive'),
      nosnippet: rawRobots.includes('nosnippet'),
      noimageindex: rawRobots.includes('noimageindex'),
      rawContent: rawRobots || undefined
    };

    if (rawRobots.includes('max-snippet:')) {
      const match = rawRobots.match(/max-snippet:(\d+)/);
      if (match) robots.maxSnippet = parseInt(match[1], 10);
    }
    if (rawRobots.includes('max-image-preview:')) {
      const match = rawRobots.match(/max-image-preview:(none|standard|large)/);
      if (match) robots.maxImagePreview = match[1] as any;
    }

    // 4. Open Graph
    const openGraph: OpenGraphData = {
      title: doc.querySelector('meta[property="og:title" i]')?.getAttribute('content')?.trim() || undefined,
      description: doc.querySelector('meta[property="og:description" i]')?.getAttribute('content')?.trim() || undefined,
      image: doc.querySelector('meta[property="og:image" i]')?.getAttribute('content')?.trim() || undefined,
      url: doc.querySelector('meta[property="og:url" i]')?.getAttribute('content')?.trim() || undefined,
      type: doc.querySelector('meta[property="og:type" i]')?.getAttribute('content')?.trim() || undefined,
      siteName: doc.querySelector('meta[property="og:site_name" i]')?.getAttribute('content')?.trim() || undefined
    };

    // 5. Twitter Card
    const twitter: TwitterCardData = {
      card: doc.querySelector('meta[name="twitter:card" i]')?.getAttribute('content')?.trim() || undefined,
      title: doc.querySelector('meta[name="twitter:title" i]')?.getAttribute('content')?.trim() || undefined,
      description: doc.querySelector('meta[name="twitter:description" i]')?.getAttribute('content')?.trim() || undefined,
      image: doc.querySelector('meta[name="twitter:image" i]')?.getAttribute('content')?.trim() || undefined,
      site: doc.querySelector('meta[name="twitter:site" i]')?.getAttribute('content')?.trim() || undefined,
      creator: doc.querySelector('meta[name="twitter:creator" i]')?.getAttribute('content')?.trim() || undefined
    };

    // 6. Charset & Viewport & Language
    const charsetEl = doc.querySelector('meta[charset]') || doc.querySelector('meta[http-equiv="Content-Type" i]');
    const charset = charsetEl?.getAttribute('charset') || 
                    (charsetEl?.getAttribute('content')?.includes('charset=') 
                      ? charsetEl.getAttribute('content')!.split('charset=')[1].trim() 
                      : 'UTF-8');

    const language = doc.documentElement.getAttribute('lang') || 
                     doc.querySelector('meta[http-equiv="content-language" i]')?.getAttribute('content') || 
                     undefined;

    const viewport = doc.querySelector('meta[name="viewport" i]')?.getAttribute('content')?.trim() || undefined;

    // 7. Favicon
    const faviconEl = doc.querySelector('link[rel~="icon" i]') || doc.querySelector('link[rel="shortcut icon" i]');
    let faviconUrl = faviconEl?.getAttribute('href') || undefined;
    if (faviconUrl && baseUrl) {
      try {
        faviconUrl = new URL(faviconUrl, baseUrl).toString();
      } catch {
        // keep as is
      }
    }

    return {
      title,
      titleLength,
      titlePixelWidth,
      description,
      descriptionLength,
      robots,
      openGraph,
      twitter,
      charset,
      language,
      viewport,
      hasFavicon: !!faviconEl,
      faviconUrl
    };
  }
}
