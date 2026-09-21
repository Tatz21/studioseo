/**
 * Phase 6: Content Statistics, Word Count & Reading Ease Engine
 */

import { ExtractedContentMetrics } from './types';

export class ContentStatsExtractor {
  public static extract(doc: Document, rawHtml: string): ExtractedContentMetrics {
    // Clone body to strip non-content elements without mutating DOM
    const bodyClone = doc.body ? doc.body.cloneNode(true) as HTMLElement : null;

    if (bodyClone) {
      const elementsToRemove = bodyClone.querySelectorAll('script, style, noscript, svg, nav, footer');
      elementsToRemove.forEach(el => el.remove());
    }

    const text = bodyClone ? (bodyClone.textContent || '') : '';
    const cleanText = text.replace(/\s+/g, ' ').trim();

    // Words
    const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;
    const characterCount = cleanText.length;

    // Sentences
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = Math.max(1, sentences.length);

    // Paragraphs
    const paragraphEls = doc.querySelectorAll('p');
    const paragraphCount = paragraphEls.length;

    // HTML to Text Ratio
    const htmlLength = rawHtml.length || 1;
    const textLength = cleanText.length;
    const htmlToTextRatio = Math.round((textLength / htmlLength) * 1000) / 10; // e.g. 14.5%

    // Flesch Reading Ease calculation
    const totalSyllables = words.reduce((acc, word) => acc + this.countSyllables(word), 0);
    const wordsPerSentence = wordCount / sentenceCount;
    const syllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 1;

    let readingEaseScore = Math.round(
      206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord)
    );
    readingEaseScore = Math.max(0, Math.min(100, readingEaseScore));

    let readingLevel = 'Standard (High School)';
    if (readingEaseScore >= 90) readingLevel = 'Very Easy (5th Grade)';
    else if (readingEaseScore >= 80) readingLevel = 'Easy (6th Grade)';
    else if (readingEaseScore >= 70) readingLevel = 'Fairly Easy (7th Grade)';
    else if (readingEaseScore >= 60) readingLevel = 'Standard (8th-9th Grade)';
    else if (readingEaseScore >= 50) readingLevel = 'Fairly Difficult (High School)';
    else if (readingEaseScore >= 30) readingLevel = 'Difficult (College)';
    else readingLevel = 'Very Confusing (Graduate Level)';

    return {
      wordCount,
      characterCount,
      sentenceCount,
      paragraphCount,
      htmlToTextRatio,
      readingEaseScore,
      readingLevel
    };
  }

  private static countSyllables(word: string): number {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!clean) return 0;
    if (clean.length <= 3) return 1;

    // Count vowel groups
    const matches = clean.match(/[aeiouy]{1,2}/g);
    let count = matches ? matches.length : 1;

    // Subtract trailing silent 'e'
    if (clean.endsWith('e') && !clean.endsWith('le')) {
      count--;
    }

    return Math.max(1, count);
  }
}
