/**
 * Phase 6: Headings Hierarchy & Structural Extractor
 */

import { HeadingNode, HeadingsHierarchyReport } from './types';

export class HeadingsExtractor {
  /**
   * Extracts and validates the complete headings tree in document order
   */
  public static extract(doc: Document): HeadingsHierarchyReport {
    const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const nodes: HeadingNode[] = [];

    let h1Count = 0;
    let h2Count = 0;
    let h3Count = 0;
    let h4Count = 0;
    let h5Count = 0;
    let h6Count = 0;
    let emptyHeadingsCount = 0;

    headingElements.forEach((el, index) => {
      const tagName = el.tagName.toLowerCase();
      const level = parseInt(tagName.charAt(1), 10) as HeadingNode['level'];
      const text = el.textContent?.trim() || '';
      const isEmpty = text.length === 0;

      if (level === 1) h1Count++;
      else if (level === 2) h2Count++;
      else if (level === 3) h3Count++;
      else if (level === 4) h4Count++;
      else if (level === 5) h5Count++;
      else if (level === 6) h6Count++;

      if (isEmpty) emptyHeadingsCount++;

      nodes.push({
        id: `heading_${index + 1}_${level}`,
        level,
        text,
        characterLength: text.length,
        isEmpty,
        domIndex: index
      });
    });

    // Validate hierarchy consistency (checking for skipped levels)
    const skippedLevelIssues: string[] = [];
    let previousLevel = 0;

    for (let i = 0; i < nodes.length; i++) {
      const currentLevel = nodes[i].level;

      // Check if jumping more than 1 level deeper (e.g. H1 -> H3, or H2 -> H4)
      if (previousLevel > 0 && currentLevel > previousLevel + 1) {
        skippedLevelIssues.push(
          `Skipped heading level: <h${previousLevel}> jumped directly to <h${currentLevel}> without an intervening <h${previousLevel + 1}> ("${nodes[i].text.slice(0, 40)}...")`
        );
      }

      previousLevel = currentLevel;
    }

    if (h1Count === 0) {
      skippedLevelIssues.unshift('Missing <h1> heading tag: Every page must have exactly one primary <h1>.');
    } else if (h1Count > 1) {
      skippedLevelIssues.unshift(`Multiple <h1> tags detected (${h1Count} found): Search engines prefer a single cohesive page topic.`);
    }

    return {
      nodes,
      h1Count,
      h2Count,
      h3Count,
      h4Count,
      h5Count,
      h6Count,
      totalHeadings: nodes.length,
      hasSingleH1: h1Count === 1,
      hasSkippedLevels: skippedLevelIssues.length > 0,
      skippedLevelIssues,
      emptyHeadingsCount
    };
  }
}
