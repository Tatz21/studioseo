/**
 * Phase 6: Images, Media Attributes & Web Vitals Extractor
 */

import { ExtractedImageItem, ImagesExtractionReport } from './types';

export class ImagesExtractor {
  public static extract(doc: Document, currentUrl: string): ImagesExtractionReport {
    const imgElements = doc.querySelectorAll('img');
    const images: ExtractedImageItem[] = [];

    let missingAltCount = 0;
    let emptyAltCount = 0;
    let missingDimensionsCount = 0;
    let modernFormatCount = 0;
    let lazyLoadedCount = 0;

    imgElements.forEach((el, index) => {
      const rawSrc = el.getAttribute('src')?.trim() || '';
      let absoluteSrc = rawSrc;

      if (rawSrc && currentUrl) {
        try {
          absoluteSrc = new URL(rawSrc, currentUrl).toString();
        } catch {
          // keep as is
        }
      }

      const hasAlt = el.hasAttribute('alt');
      const altText = el.getAttribute('alt')?.trim() || '';
      const isAltEmpty = hasAlt && altText.length === 0;

      if (!hasAlt) missingAltCount++;
      else if (isAltEmpty) emptyAltCount++;

      // Detect format
      const lowerSrc = absoluteSrc.toLowerCase();
      let format: ExtractedImageItem['format'] = 'unknown';

      if (lowerSrc.includes('.webp') || lowerSrc.includes('format=webp')) format = 'webp';
      else if (lowerSrc.includes('.avif') || lowerSrc.includes('format=avif')) format = 'avif';
      else if (lowerSrc.includes('.svg')) format = 'svg';
      else if (lowerSrc.includes('.png')) format = 'png';
      else if (lowerSrc.includes('.jpg') || lowerSrc.includes('.jpeg')) format = 'jpg';
      else if (lowerSrc.includes('.gif')) format = 'gif';

      const isModern = format === 'webp' || format === 'avif' || format === 'svg';
      if (isModern) modernFormatCount++;

      // Dimension attributes for Cumulative Layout Shift (CLS)
      const widthAttr = el.getAttribute('width');
      const heightAttr = el.getAttribute('height');
      const width = widthAttr ? parseInt(widthAttr, 10) : undefined;
      const height = heightAttr ? parseInt(heightAttr, 10) : undefined;
      const hasDimensions = !isNaN(width || NaN) && !isNaN(height || NaN);

      if (!hasDimensions) missingDimensionsCount++;

      // Lazy loading
      const isLazy = el.getAttribute('loading')?.toLowerCase() === 'lazy';
      if (isLazy) lazyLoadedCount++;

      images.push({
        id: `img_${index + 1}`,
        src: absoluteSrc,
        altText,
        hasAlt,
        isAltEmpty,
        format,
        isModernFormat: isModern,
        width: isNaN(width || NaN) ? undefined : width,
        height: isNaN(height || NaN) ? undefined : height,
        hasDimensions,
        isLazy
      });
    });

    return {
      totalImages: images.length,
      missingAltCount,
      emptyAltCount,
      missingDimensionsCount,
      modernFormatCount,
      lazyLoadedCount,
      images
    };
  }
}
