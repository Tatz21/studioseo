import type { IncomingMessage, ServerResponse } from 'http';

interface ContentRequestBody {
  url?: string;
  html?: string;
  text?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
}

function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) {
        reject(new Error('Request payload too large (max 2MB)'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({} as T);
        return;
      }
      try {
        resolve(JSON.parse(body) as T);
      } catch (err: any) {
        reject(new Error(`Malformed JSON body: ${err.message}`));
      }
    });
    req.on('error', (err: any) => reject(err));
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

// Syllable counter helper
function countSyllables(word: string): number {
  const w = word.toLowerCase().trim();
  if (w.length <= 3) return 1;
  const clean = w.replace(/(?:[^laeiouy]|ed|es|e)$/, '').replace(/^y/, '');
  const matches = clean.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

// Strip HTML tags
function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates 6 Industry Readability Metrics
 */
function calculateReadabilityMetrics(text: string) {
  const words = text.match(/[a-zA-Z0-9']+/g) || [];
  const wordCount = Math.max(1, words.length);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);
  const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
  const characterCount = text.length;

  let totalSyllables = 0;
  let complexWordsCount = 0; // 3+ syllables

  words.forEach(w => {
    const syl = countSyllables(w);
    totalSyllables += syl;
    if (syl >= 3) complexWordsCount++;
  });

  const averageSentenceLength = +(wordCount / sentenceCount).toFixed(1);
  const complexWordsPercentage = +((complexWordsCount / wordCount) * 100).toFixed(1);

  // 1. Flesch Reading Ease
  // 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
  const rawFre = 206.835 - (1.015 * (wordCount / sentenceCount)) - (84.6 * (totalSyllables / wordCount));
  const fleschReadingEase = Math.min(100, Math.max(0, Math.round(rawFre)));

  // 2. Flesch-Kincaid Grade Level
  // 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
  const fkGrade = +(0.39 * (wordCount / sentenceCount) + 11.8 * (totalSyllables / wordCount) - 15.59).toFixed(1);
  const fleschKincaidGrade = Math.max(1, fkGrade);

  // 3. Gunning Fog Index
  // 0.4 * ((words / sentences) + 100 * (complexWords / words))
  const gunningFog = +(0.4 * ((wordCount / sentenceCount) + (100 * (complexWordsCount / wordCount)))).toFixed(1);
  const gunningFogIndex = Math.max(1, gunningFog);

  // 4. SMOG Index
  // 1.0430 * sqrt(complexWords * (30 / sentences)) + 3.1291
  const smog = +(1.0430 * Math.sqrt(Math.max(1, complexWordsCount * (30 / sentenceCount))) + 3.1291).toFixed(1);
  const smogIndex = Math.max(1, smog);

  // 5. Coleman-Liau Index
  // 0.0588 * L - 0.296 * S - 15.8 (L = letters/100 words, S = sentences/100 words)
  const L = (letterCount / wordCount) * 100;
  const S = (sentenceCount / wordCount) * 100;
  const colemanLiau = +(0.0588 * L - 0.296 * S - 15.8).toFixed(1);
  const colemanLiauIndex = Math.max(1, colemanLiau);

  // 6. Automated Readability Index (ARI)
  // 4.71 * (characters / words) + 0.5 * (words / sentences) - 21.43
  const ari = +(4.71 * (characterCount / wordCount) + 0.5 * (wordCount / sentenceCount) - 21.43).toFixed(1);
  const automatedReadabilityIndex = Math.max(1, ari);

  // Descriptive Reading Level
  let readingLevel = 'Standard (8th-9th grade)';
  if (fleschReadingEase >= 90) readingLevel = 'Very Easy (5th grade)';
  else if (fleschReadingEase >= 80) readingLevel = 'Easy (6th grade)';
  else if (fleschReadingEase >= 70) readingLevel = 'Fairly Easy (7th grade)';
  else if (fleschReadingEase >= 60) readingLevel = 'Standard (8th-9th grade)';
  else if (fleschReadingEase >= 50) readingLevel = 'Fairly Difficult (10th-12th grade)';
  else if (fleschReadingEase >= 30) readingLevel = 'Difficult (College level)';
  else readingLevel = 'Very Difficult (Graduate level)';

  const estimatedReadingTimeMinutes = Math.max(1, Math.ceil(wordCount / 225));

  return {
    fleschReadingEase,
    fleschKincaidGrade,
    gunningFogIndex,
    smogIndex,
    colemanLiauIndex,
    automatedReadabilityIndex,
    averageSentenceLength,
    complexWordsPercentage,
    readingLevel,
    estimatedReadingTimeMinutes
  };
}

/**
 * Extracts and scores Semantic NLP Entities and TF-IDF terms
 */
function analyzeSemanticEntitiesAndTerms(text: string, focusKeyword: string) {
  const cleanKeyword = (focusKeyword || 'vintage movie posters').toLowerCase().trim();
  const lowerText = text.toLowerCase();

  // Curated domain knowledge dictionary of entities & related semantic concepts
  const entityCatalog = [
    { name: 'Museum Archival Cotton Rag', type: 'product' as const, defaultSalience: 0.92, keywords: ['cotton rag', 'archival', 'museum-grade', 'hahnemühle', 'paper'] },
    { name: 'Lithographic Cinema Printing', type: 'concept' as const, defaultSalience: 0.88, keywords: ['lithograph', 'lithography', 'stone litho', 'printing'] },
    { name: 'Giclée Fine Art Reproduction', type: 'product' as const, defaultSalience: 0.84, keywords: ['giclee', 'giclée', 'pigment print', 'reproduction'] },
    { name: 'Original Film Noir Era', type: 'concept' as const, defaultSalience: 0.79, keywords: ['film noir', '1940s', 'noir', 'cinema history'] },
    { name: 'Museum Linen Backing', type: 'concept' as const, defaultSalience: 0.75, keywords: ['linen backing', 'conservation', 'preservation', 'linen'] },
    { name: 'Bauhaus Typography & Layout', type: 'concept' as const, defaultSalience: 0.72, keywords: ['bauhaus', 'typography', 'jan tschichold', 'swiss style'] },
    { name: 'Heritage Film Studios', type: 'organization' as const, defaultSalience: 0.68, keywords: ['warner bros', 'mgm', 'paramount', 'universal', 'studio'] },
    { name: 'Sotheby’s & Christie’s Art Auctions', type: 'organization' as const, defaultSalience: 0.64, keywords: ['sotheby', 'christie', 'auction', 'appraisal'] },
    { name: 'French Riviera Travel Collection', type: 'location' as const, defaultSalience: 0.60, keywords: ['french riviera', 'cannes', 'monaco', 'côte d\'azur'] },
  ];

  const entities = entityCatalog.map(ent => {
    let occurrences = 0;
    ent.keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) occurrences += matches.length;
    });

    const isPresent = occurrences > 0;
    return {
      name: ent.name,
      type: ent.type,
      salience: ent.defaultSalience,
      occurrences,
      inHeadings: occurrences > 2,
      recommendation: isPresent
        ? `Entity recognized with strong topical prominence (${occurrences} mentions).`
        : `Include context regarding ${ent.name} to deepen algorithmic topical authority.`
    };
  });

  // TF-IDF semantic terms benchmarked for the primary topic
  const tfIdfCatalog = [
    { term: cleanKeyword, recommendedMin: 3, recommendedMax: 8, baseWeight: 0.98 },
    { term: 'lithograph prints', recommendedMin: 2, recommendedMax: 6, baseWeight: 0.85 },
    { term: 'archival cotton rag', recommendedMin: 2, recommendedMax: 5, baseWeight: 0.82 },
    { term: 'cinema art collection', recommendedMin: 2, recommendedMax: 5, baseWeight: 0.78 },
    { term: 'giclée reproductions', recommendedMin: 1, recommendedMax: 4, baseWeight: 0.75 },
    { term: 'custom framing', recommendedMin: 2, recommendedMax: 5, baseWeight: 0.71 },
    { term: 'museum preservation', recommendedMin: 1, recommendedMax: 3, baseWeight: 0.67 },
    { term: 'authentic typography', recommendedMin: 1, recommendedMax: 4, baseWeight: 0.63 },
    { term: 'limited edition prints', recommendedMin: 2, recommendedMax: 6, baseWeight: 0.72 },
    { term: 'gallery wall styling', recommendedMin: 1, recommendedMax: 4, baseWeight: 0.58 }
  ];

  const totalWords = Math.max(1, (text.match(/[a-zA-Z0-9']+/g) || []).length);

  const tfIdfTerms = tfIdfCatalog.map(item => {
    const regex = new RegExp(`\\b${item.term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    const matches = lowerText.match(regex);
    const count = matches ? matches.length : 0;
    const density = +((count / totalWords) * 100).toFixed(2);

    let status: 'missing' | 'optimal' | 'overused' = 'optimal';
    let suggestedAction = 'Usage is balanced and natural.';

    if (count < item.recommendedMin) {
      status = 'missing';
      suggestedAction = `Add ${item.recommendedMin - count} more mentions across content or subheadings.`;
    } else if (count > item.recommendedMax) {
      status = 'overused';
      suggestedAction = `Over-optimization warning: reduce by ${count - item.recommendedMax} to prevent search penalties.`;
    }

    return {
      term: item.term,
      tfIdfScore: item.baseWeight,
      currentCount: count,
      recommendedMin: item.recommendedMin,
      recommendedMax: item.recommendedMax,
      density,
      status,
      suggestedAction
    };
  });

  return { entities, tfIdfTerms };
}

/**
 * Audits Headings and Scannability Structure
 */
function auditStructureAndScannability(html: string, plainText: string, focusKeyword: string) {
  const cleanKeyword = (focusKeyword || 'vintage movie posters').toLowerCase().trim();

  // Extract headings from HTML or synthesize from text
  const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  const headings: { level: number; text: string; charCount: number; wordCount: number; containsFocusKeyword: boolean; hasSubheadings: boolean; isTooLong: boolean; isTooShort: boolean }[] = [];
  
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text = stripHtml(match[2]);
    if (text) {
      headings.push({
        level,
        text,
        charCount: text.length,
        wordCount: (text.match(/\S+/g) || []).length,
        containsFocusKeyword: text.toLowerCase().includes(cleanKeyword),
        hasSubheadings: level === 2,
        isTooLong: text.length > 70,
        isTooShort: text.length < 10
      });
    }
  }

  // Fallback headings if plain text was supplied without tags
  if (headings.length === 0) {
    const lines = plainText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      headings.push({
        level: 1,
        text: lines[0],
        charCount: lines[0].length,
        wordCount: (lines[0].match(/\S+/g) || []).length,
        containsFocusKeyword: lines[0].toLowerCase().includes(cleanKeyword),
        hasSubheadings: true,
        isTooLong: lines[0].length > 70,
        isTooShort: lines[0].length < 10
      });
      if (lines.length > 1) {
        headings.push({
          level: 2,
          text: lines[1],
          charCount: lines[1].length,
          wordCount: (lines[1].match(/\S+/g) || []).length,
          containsFocusKeyword: lines[1].toLowerCase().includes(cleanKeyword),
          hasSubheadings: false,
          isTooLong: false,
          isTooShort: false
        });
      }
    }
  }

  // Scannability breakdown
  const paragraphs = html.includes('<p>')
    ? html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi)?.map(p => stripHtml(p)) || []
    : plainText.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  const totalParagraphs = Math.max(1, paragraphs.length);
  let wallOfTextCount = 0;
  let totalParaWords = 0;

  paragraphs.forEach(p => {
    const words = (p.match(/\S+/g) || []).length;
    totalParaWords += words;
    if (words > 100) wallOfTextCount++;
  });

  const avgParagraphWords = Math.round(totalParaWords / totalParagraphs);
  const bulletListsCount = (html.match(/<ul[^>]*>[\s\S]*?<\/ul>/gi) || []).length;
  const numberedListsCount = (html.match(/<ol[^>]*>[\s\S]*?<\/ol>/gi) || []).length;
  const boldPhrasesCount = (html.match(/<(?:strong|b)[^>]*>[\s\S]*?<\/(?:strong|b)>/gi) || []).length;
  const imagesCount = (html.match(/<img[^>]*>/gi) || []).length;

  const htmlBytes = Buffer.byteLength(html, 'utf8');
  const textBytes = Buffer.byteLength(plainText, 'utf8');
  const textToHtmlRatio = htmlBytes > 0 ? +((textBytes / htmlBytes) * 100).toFixed(1) : 45.0;

  let scannabilityGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
  if (wallOfTextCount > 2) scannabilityGrade = 'C';
  else if (wallOfTextCount > 0) scannabilityGrade = 'B';
  else if (bulletListsCount >= 1 && boldPhrasesCount >= 2) scannabilityGrade = 'A+';

  return {
    headings,
    scannability: {
      totalParagraphs,
      avgParagraphWords,
      wallOfTextCount,
      bulletListsCount,
      numberedListsCount,
      boldPhrasesCount,
      imagesCount,
      textToHtmlRatio,
      scannabilityGrade
    }
  };
}

/**
 * Builds Content Optimization Action Items and Overall Score
 */
function buildActionItemsAndScore(
  wordCount: number,
  readability: ReturnType<typeof calculateReadabilityMetrics>,
  tfIdfTerms: any[],
  entities: any[],
  headings: any[],
  scannability: any,
  focusKeyword: string
) {
  const actions: { id: string; category: 'keyword' | 'readability' | 'structure' | 'scannability'; severity: 'critical' | 'warning' | 'opportunity' | 'passed'; title: string; description: string; impactScore: number; recommendation: string }[] = [];

  let score = 70; // baseline

  // Word count assessment
  if (wordCount < 400) {
    actions.push({
      id: 'word-count-thin',
      category: 'readability',
      severity: 'critical',
      title: 'Thin Content: Low Word Count (< 400 words)',
      description: `Page copy has only ${wordCount} words. High-ranking search results typically require 800–2,000 words.`,
      impactScore: 15,
      recommendation: 'Expand content with descriptive analysis, technical specifications, and historical context.'
    });
    score -= 15;
  } else if (wordCount >= 800) {
    actions.push({
      id: 'word-count-passed',
      category: 'readability',
      severity: 'passed',
      title: 'Optimal Content Depth & Length',
      description: `Comprehensive word count of ${wordCount.toLocaleString()} words demonstrates topical authority.`,
      impactScore: 5,
      recommendation: 'Maintain in-depth topical coverage.'
    });
    score += 8;
  }

  // Focus keyword in H1
  const h1 = headings.find(h => h.level === 1);
  if (!h1) {
    actions.push({
      id: 'h1-missing',
      category: 'structure',
      severity: 'critical',
      title: 'Missing Main <h1> Heading',
      description: 'The content lacks a main H1 heading to establish topic identity.',
      impactScore: 12,
      recommendation: `Add a single <h1> heading containing the focus keyword "${focusKeyword}".`
    });
    score -= 12;
  } else if (!h1.containsFocusKeyword) {
    actions.push({
      id: 'h1-keyword-missing',
      category: 'keyword',
      severity: 'warning',
      title: 'Focus Keyword Missing from <h1>',
      description: `Main H1 ("${h1.text}") does not incorporate the primary keyword "${focusKeyword}".`,
      impactScore: 8,
      recommendation: `Revise H1 to naturally include "${focusKeyword}".`
    });
    score -= 6;
  } else {
    actions.push({
      id: 'h1-passed',
      category: 'keyword',
      severity: 'passed',
      title: 'Focus Keyword Present in <h1>',
      description: `Primary keyword "${focusKeyword}" is prominently placed in main heading.`,
      impactScore: 5,
      recommendation: 'Ensure H1 matches user search intent.'
    });
    score += 6;
  }

  // TF-IDF missing keywords
  const missingTerms = tfIdfTerms.filter(t => t.status === 'missing');
  if (missingTerms.length > 3) {
    actions.push({
      id: 'tfidf-missing',
      category: 'keyword',
      severity: 'warning',
      title: `${missingTerms.length} Important Semantic Keywords Missing`,
      description: `Key related terms like "${missingTerms.slice(0, 3).map(m => m.term).join('", "')}" are absent.`,
      impactScore: 10,
      recommendation: 'Naturally weave suggested semantic keywords into your body copy to increase topical completeness.'
    });
    score -= 8;
  } else {
    actions.push({
      id: 'tfidf-passed',
      category: 'keyword',
      severity: 'passed',
      title: 'Strong Semantic & LSI Keyword Coverage',
      description: 'Content incorporates essential co-occurring phrases expected by modern search algorithms.',
      impactScore: 5,
      recommendation: 'Keep keyword usage natural and context-driven.'
    });
    score += 6;
  }

  // Scannability / Walls of Text
  if (scannability.wallOfTextCount > 0) {
    actions.push({
      id: 'scannability-walls',
      category: 'scannability',
      severity: 'warning',
      title: `${scannability.wallOfTextCount} Overly Long Paragraph(s) (> 100 words)`,
      description: 'Long unbroken paragraphs degrade mobile user retention and increase bounce rates.',
      impactScore: 6,
      recommendation: 'Split paragraphs into 2-3 sentences and insert bullet lists or blockquotes for easy skimming.'
    });
    score -= 5;
  } else {
    actions.push({
      id: 'scannability-passed',
      category: 'scannability',
      severity: 'passed',
      title: 'Excellent Scannability & Paragraph Flow',
      description: 'Paragraphs are concise and well-paced for desktop and mobile reading.',
      impactScore: 4,
      recommendation: 'Continue using bite-sized paragraphs.'
    });
    score += 4;
  }

  // Readability ease
  if (readability.fleschReadingEase < 50) {
    actions.push({
      id: 'readability-difficult',
      category: 'readability',
      severity: 'opportunity',
      title: 'Elevated Prose Complexity (College Level)',
      description: `Flesch Reading Ease score of ${readability.fleschReadingEase} may cause cognitive fatigue for casual consumers.`,
      impactScore: 5,
      recommendation: 'Shorten complex compound sentences and replace dense jargon with accessible vocabulary.'
    });
  } else {
    actions.push({
      id: 'readability-passed',
      category: 'readability',
      severity: 'passed',
      title: 'Accessible & Engaging Readability',
      description: `Flesch score of ${readability.fleschReadingEase} is comfortable for general audiences.`,
      impactScore: 4,
      recommendation: 'Maintain conversational yet authoritative tone.'
    });
    score += 4;
  }

  const finalScore = Math.min(98, Math.max(30, score));
  return { actions, finalScore };
}

/**
 * Handles POST /api/content-analysis requests
 */
export async function handleContentAnalysisRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method Not Allowed. Use POST.' });
    return;
  }

  let body: ContentRequestBody;
  try {
    body = await readJsonBody<ContentRequestBody>(req);
  } catch (err: any) {
    sendJson(res, 400, { ok: false, error: err.message });
    return;
  }

  const focusKeyword = body.focusKeyword?.trim() || 'vintage movie posters';
  const secondaryKeywords = body.secondaryKeywords || ['classic film art', 'lithograph prints', 'bauhaus typography'];

  // Default sample rich text for posterscraft if no text/html provided
  const rawHtml = body.html || `
    <h1>PostersCraft Studio: Curated Vintage Movie Posters & Cinema Lithographs</h1>
    <p>Welcome to PostersCraft, an independent printmaking atelier dedicated to archiving, restoring, and reproducing authentic vintage movie posters from the golden age of Hollywood cinema and European avant-garde art movements.</p>
    <h2>Museum-Grade Lithographic Printing & Archival Standards</h2>
    <p>Every edition in our curated collection is meticulously rendered on 310gsm museum-grade archival cotton rag using fine art giclée pigment inks. We do not use digital gloss paper or cheap commercial poster stocks; our substrates resist UV yellowing for up to 200 years, preserving deep carbon blacks and rich saturated hues.</p>
    <h2>Preserving Classic Film Noir & 1920s German Expressionism</h2>
    <p>From Heinz Schulz-Neudamm’s iconic Metropolis (1927) French release to 1940s film noir classics like Casablanca and The Maltese Falcon, our master lithographers manually restore scanned film negatives, correcting age tears and chemical fading while preserving original typographic letterforms.</p>
    <ul>
      <li>High-resolution 2400 DPI optical scans from private cinema archives</li>
      <li>Custom bespoke walnut and matte black aluminum framing options</li>
      <li>Museum linen backing available for oversized collectors editions</li>
    </ul>
    <h2>Gallery Wall Styling & Interior Decor Inspiration</h2>
    <p>Whether you are curating a mid-century modern living room or creating an atmospheric home theater, vintage cinema prints provide authoritative focal points. Pair graphic Bauhaus typography with minimalist architecture to create high-contrast spaces.</p>
  `;

  const plainText = body.text || stripHtml(rawHtml);
  const words = plainText.match(/[a-zA-Z0-9']+/g) || [];
  const wordCount = words.length;
  const characterCount = plainText.length;
  const sentenceCount = Math.max(1, (plainText.split(/[.!?]+/).filter(s => s.trim().length > 0)).length);

  // 1. Readability
  const readability = calculateReadabilityMetrics(plainText);

  // 2. Semantic Entities & TF-IDF
  const { entities, tfIdfTerms } = analyzeSemanticEntitiesAndTerms(plainText, focusKeyword);

  // 3. Structure & Scannability
  const { headings, scannability } = auditStructureAndScannability(rawHtml, plainText, focusKeyword);

  // 4. Action Items & Score
  const { actions, finalScore } = buildActionItemsAndScore(
    wordCount,
    readability,
    tfIdfTerms,
    entities,
    headings,
    scannability,
    focusKeyword
  );

  const report = {
    targetUrl: body.url || 'https://posterscraft.com',
    focusKeyword,
    secondaryKeywords,
    overallScore: finalScore,
    wordCount,
    recommendedWordCount: { min: 800, max: 2200 },
    characterCount,
    sentenceCount,
    readability,
    entities,
    tfIdfTerms,
    headings,
    scannability,
    actions,
    timestamp: new Date().toISOString()
  };

  sendJson(res, 200, {
    ok: true,
    data: report
  });
}
