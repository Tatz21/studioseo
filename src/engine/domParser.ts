import { HeadingItem, ImageItem, LinkItem, MetaData, SchemaItem } from './types';

/**
 * Extracts comprehensive SEO metadata, DOM hierarchy, links, images, and text from HTML string.
 */
export function parseHtmlDocument(html: string, baseUrl: string = 'https://example.com'): {
  doc: Document;
  metadata: MetaData;
  headings: HeadingItem[];
  links: LinkItem[];
  images: ImageItem[];
  schemas: SchemaItem[];
  bodyText: string;
  pageSizeKb: number;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const pageSizeKb = Math.round((new Blob([html]).size / 1024) * 10) / 10;

  // Helper to extract meta attributes safely
  const getMeta = (nameOrProp: string, attr: 'name' | 'property' = 'name'): string => {
    const el = doc.querySelector(`meta[${attr}="${nameOrProp}"]`) || 
               doc.querySelector(`meta[${attr}="${nameOrProp.toLowerCase()}"]`) ||
               doc.querySelector(`meta[${attr}="${nameOrProp.toUpperCase()}"]`);
    return el ? el.getAttribute('content')?.trim() || '' : '';
  };

  const titleEl = doc.querySelector('title');
  const title = titleEl ? titleEl.textContent?.trim() || '' : '';

  const canonicalEl = doc.querySelector('link[rel="canonical"]');
  const canonicalUrl = canonicalEl ? canonicalEl.getAttribute('href')?.trim() || '' : '';

  const faviconEl = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
  const favicon = faviconEl ? faviconEl.getAttribute('href')?.trim() || '' : '';

  const charsetEl = doc.querySelector('meta[charset]');
  const charset = charsetEl ? charsetEl.getAttribute('charset')?.trim() || 'UTF-8' : (getMeta('Content-Type') || 'UTF-8');

  const metadata: MetaData = {
    title,
    titleLength: title.length,
    description: getMeta('description'),
    descriptionLength: getMeta('description').length,
    canonicalUrl,
    robots: getMeta('robots'),
    viewport: getMeta('viewport'),
    charset,
    favicon,
    author: getMeta('author'),
    keywords: getMeta('keywords'),
    ogTitle: getMeta('og:title', 'property') || title,
    ogDescription: getMeta('og:description', 'property') || getMeta('description'),
    ogImage: getMeta('og:image', 'property'),
    ogType: getMeta('og:type', 'property') || 'website',
    ogUrl: getMeta('og:url', 'property') || canonicalUrl || baseUrl,
    ogSiteName: getMeta('og:site_name', 'property'),
    twitterCard: getMeta('twitter:card') || 'summary_large_image',
    twitterTitle: getMeta('twitter:title') || getMeta('og:title', 'property') || title,
    twitterDescription: getMeta('twitter:description') || getMeta('og:description', 'property') || getMeta('description'),
    twitterImage: getMeta('twitter:image') || getMeta('og:image', 'property'),
    twitterSite: getMeta('twitter:site')
  };

  // 1. Extract Headings (H1 - H6 in order of appearance)
  const headings: HeadingItem[] = [];
  const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headingElements.forEach(el => {
    const level = parseInt(el.tagName.substring(1), 10);
    const text = el.textContent?.trim() || '';
    if (text) {
      headings.push({ level, text });
    }
  });

  // 2. Extract Links
  const links: LinkItem[] = [];
  const anchorElements = doc.querySelectorAll('a[href]');
  anchorElements.forEach(el => {
    const rawHref = el.getAttribute('href')?.trim() || '';
    if (!rawHref || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
      return;
    }

    let isInternal = true;
    try {
      if (rawHref.startsWith('http://') || rawHref.startsWith('https://')) {
        const linkHost = new URL(rawHref).hostname;
        const baseHost = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`).hostname;
        isInternal = linkHost === baseHost;
      } else {
        isInternal = true;
      }
    } catch {
      isInternal = !rawHref.startsWith('http');
    }

    const rel = el.getAttribute('rel') || '';
    const isNofollow = rel.toLowerCase().includes('nofollow');
    const anchorText = el.textContent?.trim() || (el.querySelector('img') ? '[Image Link]' : '');

    links.push({
      url: rawHref,
      anchorText,
      isInternal,
      isNofollow,
      hasAnchorText: anchorText.length > 0
    });
  });

  // 3. Extract Images
  const images: ImageItem[] = [];
  const imgElements = doc.querySelectorAll('img');
  imgElements.forEach(el => {
    const src = el.getAttribute('src')?.trim() || el.getAttribute('data-src')?.trim() || '';
    const alt = el.getAttribute('alt');
    const hasAlt = alt !== null && alt !== undefined;
    const isMissingAlt = !hasAlt || alt.trim().length === 0;
    const isLazyLoaded = el.getAttribute('loading') === 'lazy' || el.hasAttribute('data-src');
    
    let format = 'unknown';
    if (src) {
      const match = src.match(/\.(png|jpe?g|webp|avif|svg|gif)(\?.*)?$/i);
      if (match) format = match[1].toLowerCase();
    }

    images.push({
      src: src || 'empty_src',
      alt: alt?.trim() || '',
      hasAlt,
      isMissingAlt,
      isLazyLoaded,
      format
    });
  });

  // 4. Extract Structured Data (JSON-LD)
  const schemas: SchemaItem[] = [];
  const scriptSchemas = doc.querySelectorAll('script[type="application/ld+json"]');
  scriptSchemas.forEach(script => {
    const rawJson = script.textContent?.trim() || '';
    if (rawJson) {
      try {
        const parsed = JSON.parse(rawJson);
        const type = parsed['@type'] || (Array.isArray(parsed) ? 'Array' : 'Unknown');
        schemas.push({
          type: String(type),
          rawJson,
          isValid: true
        });
      } catch (e: any) {
        schemas.push({
          type: 'Invalid JSON-LD',
          rawJson,
          isValid: false,
          errors: [e.message || 'Syntax error in JSON-LD script tag']
        });
      }
    }
  });

  // 5. Clean Body Text for Word Count & Keyword Matrix
  // Clone doc to remove script, style, noscript, svg, nav, footer from keyword calculation
  const clonedDoc = doc.cloneNode(true) as Document;
  clonedDoc.querySelectorAll('script, style, noscript, svg, head').forEach(el => el.remove());
  const bodyText = (clonedDoc.body?.textContent || '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    doc,
    metadata,
    headings,
    links,
    images,
    schemas,
    bodyText,
    pageSizeKb
  };
}
