import { HeadingItem, KeywordMetric, MetaData } from './types';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while',
  'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll',
  'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

export function analyzeKeywords(
  bodyText: string,
  metadata: MetaData,
  headings: HeadingItem[]
): {
  unigrams: KeywordMetric[];
  bigrams: KeywordMetric[];
  trigrams: KeywordMetric[];
} {
  const cleanTokens = (bodyText.toLowerCase().match(/[a-z0-9'-]+/g) || [])
    .map(t => t.replace(/^['-]+|['-]+$/g, ''))
    .filter(t => t.length > 2);

  const totalTokens = cleanTokens.length;
  if (totalTokens === 0) {
    return { unigrams: [], bigrams: [], trigrams: [] };
  }

  const titleLower = metadata.title.toLowerCase();
  const descLower = metadata.description.toLowerCase();
  const h1Text = headings.filter(h => h.level === 1).map(h => h.text.toLowerCase()).join(' ');
  const h2Text = headings.filter(h => h.level === 2).map(h => h.text.toLowerCase()).join(' ');

  // 1. Unigrams (Single words without stopwords)
  const unigramCounts: Record<string, number> = {};
  cleanTokens.forEach(word => {
    if (!STOP_WORDS.has(word) && !/^\d+$/.test(word)) {
      unigramCounts[word] = (unigramCounts[word] || 0) + 1;
    }
  });

  const unigrams: KeywordMetric[] = Object.entries(unigramCounts)
    .filter(([_, count]) => count >= 2)
    .map(([term, count]) => {
      const density = Math.round((count / totalTokens) * 1000) / 10;
      return {
        term,
        count,
        density,
        inTitle: titleLower.includes(term),
        inH1: h1Text.includes(term),
        inH2: h2Text.includes(term),
        inMetaDesc: descLower.includes(term),
        isWarning: density > 4.0 // Over-optimization risk
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // 2. Bigrams (2-word phrases)
  const bigramCounts: Record<string, number> = {};
  for (let i = 0; i < cleanTokens.length - 1; i++) {
    const w1 = cleanTokens[i];
    const w2 = cleanTokens[i + 1];
    if (!STOP_WORDS.has(w1) || !STOP_WORDS.has(w2)) {
      const phrase = `${w1} ${w2}`;
      bigramCounts[phrase] = (bigramCounts[phrase] || 0) + 1;
    }
  }

  const bigrams: KeywordMetric[] = Object.entries(bigramCounts)
    .filter(([_, count]) => count >= 2)
    .map(([term, count]) => {
      const density = Math.round((count / (totalTokens - 1)) * 1000) / 10;
      return {
        term,
        count,
        density,
        inTitle: titleLower.includes(term),
        inH1: h1Text.includes(term),
        inH2: h2Text.includes(term),
        inMetaDesc: descLower.includes(term),
        isWarning: density > 3.0
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  // 3. Trigrams (3-word phrases)
  const trigramCounts: Record<string, number> = {};
  for (let i = 0; i < cleanTokens.length - 2; i++) {
    const w1 = cleanTokens[i];
    const w2 = cleanTokens[i + 1];
    const w3 = cleanTokens[i + 2];
    if (!STOP_WORDS.has(w1) && !STOP_WORDS.has(w3)) {
      const phrase = `${w1} ${w2} ${w3}`;
      trigramCounts[phrase] = (trigramCounts[phrase] || 0) + 1;
    }
  }

  const trigrams: KeywordMetric[] = Object.entries(trigramCounts)
    .filter(([_, count]) => count >= 2)
    .map(([term, count]) => {
      const density = Math.round((count / (totalTokens - 2)) * 1000) / 10;
      return {
        term,
        count,
        density,
        inTitle: titleLower.includes(term),
        inH1: h1Text.includes(term),
        inH2: h2Text.includes(term),
        inMetaDesc: descLower.includes(term),
        isWarning: density > 2.5
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { unigrams, bigrams, trigrams };
}
