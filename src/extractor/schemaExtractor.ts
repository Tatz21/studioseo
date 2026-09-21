/**
 * Phase 6: Structured Data & Schema.org Extractor
 */

import { ExtractedSchemaItem, SchemaExtractionReport } from './types';

export class SchemaExtractor {
  public static extract(doc: Document): SchemaExtractionReport {
    const schemas: ExtractedSchemaItem[] = [];
    const detectedTypesSet = new Set<string>();
    const validationErrors: string[] = [];

    // 1. Extract JSON-LD (<script type="application/ld+json">)
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json" i]');
    let jsonLdCount = 0;

    jsonLdScripts.forEach((el, index) => {
      jsonLdCount++;
      const rawContent = el.textContent?.trim() || '';
      const warnings: string[] = [];
      let schemaType = 'Unknown';
      let parsedData: any = null;
      let isValidJson = false;
      let error: string | undefined;

      try {
        parsedData = JSON.parse(rawContent);
        isValidJson = true;

        // Check @context
        if (!parsedData['@context'] || !String(parsedData['@context']).includes('schema.org')) {
          warnings.push('Schema @context should standardly reference "https://schema.org".');
        }

        // Handle @graph array
        if (Array.isArray(parsedData['@graph'])) {
          const types = parsedData['@graph'].map((item: any) => item['@type']).filter(Boolean);
          schemaType = `@graph [${types.join(', ')}]`;
          types.forEach((t: string) => detectedTypesSet.add(t));
        } else if (parsedData['@type']) {
          schemaType = Array.isArray(parsedData['@type']) 
            ? parsedData['@type'].join(', ') 
            : String(parsedData['@type']);
          if (Array.isArray(parsedData['@type'])) {
            parsedData['@type'].forEach((t: string) => detectedTypesSet.add(t));
          } else {
            detectedTypesSet.add(parsedData['@type']);
          }
        } else {
          warnings.push('JSON-LD object is missing the required "@type" declaration.');
        }
      } catch (err: any) {
        isValidJson = false;
        error = `Invalid JSON-LD Syntax: ${err.message}`;
        validationErrors.push(`JSON-LD block #${index + 1} has syntax errors: ${err.message}`);
      }

      schemas.push({
        id: `schema_jsonld_${index + 1}`,
        type: 'json-ld',
        schemaType,
        rawContent,
        parsedData,
        isValidJson,
        error,
        warnings
      });
    });

    // 2. Extract Microdata (itemscope / itemtype)
    const microdataElements = doc.querySelectorAll('[itemscope][itemtype]');
    let microdataCount = 0;

    microdataElements.forEach((el, index) => {
      microdataCount++;
      const rawType = el.getAttribute('itemtype')?.trim() || '';
      const simpleType = rawType.split('/').pop() || rawType;
      if (simpleType) detectedTypesSet.add(simpleType);

      schemas.push({
        id: `schema_microdata_${index + 1}`,
        type: 'microdata',
        schemaType: simpleType || 'Microdata',
        rawContent: el.outerHTML.slice(0, 300) + '...',
        isValidJson: true,
        warnings: ['Microdata detected. Google recommends migrating to JSON-LD for rich snippets.']
      });
    });

    return {
      hasStructuredData: schemas.length > 0,
      jsonLdCount,
      microdataCount,
      detectedTypes: Array.from(detectedTypesSet),
      schemas,
      validationErrors
    };
  }
}
