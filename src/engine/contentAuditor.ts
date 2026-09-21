import { HeadingItem, ImageItem, LinkItem, SeoIssue } from './types';

export function calculateFleschReadingEase(text: string): { score: number; level: string; wordCount: number } {
  const words = text.match(/[a-zA-Z0-9']+/g) || [];
  const wordCount = words.length;
  if (wordCount === 0) {
    return { score: 0, level: 'No text', wordCount: 0 };
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  // Approximate syllable count
  let totalSyllables = 0;
  words.forEach(word => {
    const w = word.toLowerCase();
    if (w.length <= 3) {
      totalSyllables += 1;
      return;
    }
    const cleanWord = w.replace(/(?:[^laeiouy]|ed|es|e)$/, '').replace(/^y/, '');
    const matches = cleanWord.match(/[aeiouy]{1,2}/g);
    totalSyllables += matches ? Math.max(1, matches.length) : 1;
  });

  // Flesch Reading Ease Formula: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = totalSyllables / wordCount;
  const rawScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  let level = 'Standard';
  if (score >= 90) level = 'Very Easy (5th grade)';
  else if (score >= 80) level = 'Easy (6th grade)';
  else if (score >= 70) level = 'Fairly Easy (7th grade)';
  else if (score >= 60) level = 'Standard (8th-9th grade)';
  else if (score >= 50) level = 'Fairly Difficult (10th-12th grade)';
  else if (score >= 30) level = 'Difficult (College)';
  else level = 'Very Difficult (Graduate)';

  return { score, level, wordCount };
}

export function runContentAudit(
  headings: HeadingItem[],
  images: ImageItem[],
  links: LinkItem[],
  bodyText: string,
  rawHtmlLength: number
): { issues: SeoIssue[]; wordCount: number; readingScore: number; readingLevel: string; textToHtmlRatio: number } {
  const issues: SeoIssue[] = [];
  const { score: readingScore, level: readingLevel, wordCount } = calculateFleschReadingEase(bodyText);

  const textBytes = new Blob([bodyText]).size;
  const textToHtmlRatio = rawHtmlLength > 0 ? Math.round((textBytes / rawHtmlLength) * 1000) / 10 : 0;

  // 1. Heading H1 Check
  const h1List = headings.filter(h => h.level === 1);
  if (h1List.length === 0) {
    issues.push({
      id: 'content-h1-missing',
      title: 'Missing Main Heading (<h1>)',
      category: 'content',
      severity: 'critical',
      description: 'The page has no <h1> tag defined.',
      impact: 'The <h1> tag communicates the primary topic of the page to crawlers. Missing it weakens topical relevance.',
      recommendation: 'Add a single, descriptive <h1> heading at the top of the main content area.',
      snippet: '<h1>Main Topic of the Page</h1>',
      expected: 'Exactly 1 <h1> tag',
      value: 0
    });
  } else if (h1List.length > 1) {
    issues.push({
      id: 'content-h1-multiple',
      title: `Multiple <h1> Headings Found (${h1List.length})`,
      category: 'content',
      severity: 'warning',
      description: `The page contains ${h1List.length} distinct <h1> tags.`,
      impact: 'While HTML5 permits multiple H1s, best practice for SEO is a single primary H1 to establish a clear content hierarchy.',
      recommendation: 'Reserve <h1> for the primary title and convert secondary headings to <h2> or <h3>.',
      value: h1List.map(h => `"${h.text}"`).join(', ')
    });
  } else {
    issues.push({
      id: 'content-h1-passed',
      title: 'Single Unique <h1> Heading Found',
      category: 'content',
      severity: 'passed',
      description: `Valid main heading: "${h1List[0].text}".`,
      impact: 'Provides clean semantic hierarchy for search engines and screen readers.',
      recommendation: 'Ensure target keywords are naturally integrated into the H1.',
      value: `"${h1List[0].text}"`
    });
  }

  // 2. Heading Hierarchy Checks (e.g. skipping H1 -> H3)
  let hasSkippedLevels = false;
  for (let i = 0; i < headings.length - 1; i++) {
    const current = headings[i].level;
    const next = headings[i + 1].level;
    if (next > current + 1) {
      hasSkippedLevels = true;
      break;
    }
  }

  if (hasSkippedLevels) {
    issues.push({
      id: 'content-heading-jump',
      title: 'Skipped Heading Levels in Document Structure',
      category: 'content',
      severity: 'warning',
      description: 'Headings skip hierarchy levels (e.g., jumping from <h1> directly to <h3> without an intermediate <h2>).',
      impact: 'Disrupts semantic outline readability for assistive technologies and web crawlers.',
      recommendation: 'Ensure heading levels step down progressively (h1 -> h2 -> h3).'
    });
  } else if (headings.length > 0) {
    issues.push({
      id: 'content-heading-passed',
      title: 'Logical Heading Structure',
      category: 'content',
      severity: 'passed',
      description: `Detected ${headings.length} heading tags with sequential hierarchy.`,
      impact: 'Maintains clear structural readability and topical clustering.',
      recommendation: 'Use subheadings to group relevant keyword clusters.'
    });
  }

  // 3. Word Count & Thin Content Evaluation
  if (wordCount < 200) {
    issues.push({
      id: 'content-wordcount-thin',
      title: 'Thin Content Detected (< 200 words)',
      category: 'content',
      severity: 'critical',
      description: `The page body contains only ${wordCount} words of text.`,
      impact: 'Search engines de-prioritize thin pages as low-value or low-intent.',
      recommendation: 'Expand content with in-depth answers, detailed descriptions, FAQs, and topical coverage.',
      expected: 'At least 500+ words',
      value: `${wordCount} words`
    });
  } else if (wordCount < 500) {
    issues.push({
      id: 'content-wordcount-short',
      title: 'Moderate Content Length',
      category: 'content',
      severity: 'warning',
      description: `Word count is ${wordCount} words.`,
      impact: 'Competitive search queries typically require higher depth and contextual coverage.',
      recommendation: 'Consider expanding core sections with examples, case studies, or detailed explanations.',
      expected: '600+ words for competitive rankings',
      value: `${wordCount} words`
    });
  } else {
    issues.push({
      id: 'content-wordcount-passed',
      title: 'Sufficient Content Length',
      category: 'content',
      severity: 'passed',
      description: `Page contains rich content with ${wordCount} words.`,
      impact: 'Provides ample semantic signals for search crawlers to understand topical authority.',
      recommendation: 'Keep content fresh and updated regularly.',
      value: `${wordCount} words`
    });
  }

  // 4. Image Alt Attribute Coverage
  const missingAltImages = images.filter(img => img.isMissingAlt);
  if (images.length > 0 && missingAltImages.length > 0) {
    issues.push({
      id: 'content-images-alt-missing',
      title: `Images Missing Alt Attributes (${missingAltImages.length}/${images.length})`,
      category: 'content',
      severity: missingAltImages.length === images.length ? 'critical' : 'warning',
      description: `${missingAltImages.length} out of ${images.length} images lack descriptive "alt" attributes.`,
      impact: 'Hurts accessibility for visually impaired users and prevents images from indexing in Google Image Search.',
      recommendation: 'Add concise, descriptive alt text explaining the content of each image.',
      snippet: '<img src="portrait.jpg" alt="Award-winning wedding photography in Kolkata" />',
      value: `${missingAltImages.length} missing alt`
    });
  } else if (images.length > 0) {
    issues.push({
      id: 'content-images-alt-passed',
      title: 'All Images Have Alt Attributes',
      category: 'content',
      severity: 'passed',
      description: `All ${images.length} images include alt text tags.`,
      impact: 'Improves accessibility and image search discovery.',
      recommendation: 'Ensure alt text remains descriptive rather than keyword-stuffed.'
    });
  }

  // 5. Link Anchor Texts
  const missingAnchorLinks = links.filter(l => !l.hasAnchorText);
  if (missingAnchorLinks.length > 0) {
    issues.push({
      id: 'content-links-noanchor',
      title: `Links with Missing Anchor Text (${missingAnchorLinks.length})`,
      category: 'links',
      severity: 'warning',
      description: `${missingAnchorLinks.length} hyperlink(s) contain empty or blank anchor text.`,
      impact: 'Search engines rely on anchor text to determine the target page subject matter.',
      recommendation: 'Add descriptive anchor text or aria-labels to all clickable links.',
      value: `${missingAnchorLinks.length} links without text`
    });
  } else if (links.length > 0) {
    issues.push({
      id: 'content-links-passed',
      title: `Descriptive Link Anchors (${links.length} Links)`,
      category: 'links',
      severity: 'passed',
      description: 'All links contain readable anchor text or image representations.',
      impact: 'Passes link equity and contextual relevance through internal and external linking.',
      recommendation: 'Use natural keywords in anchor text instead of generic "click here".'
    });
  }

  return {
    issues,
    wordCount,
    readingScore,
    readingLevel,
    textToHtmlRatio
  };
}
