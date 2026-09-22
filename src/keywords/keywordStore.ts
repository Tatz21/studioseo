import { TrackedKeyword, KeywordStatsSummary, SearchIntent, KeywordDevice } from './types';

const KEYWORDS_STORAGE_KEY = 'seo_tracked_keywords_v1';

function generateHistory(currentRank: number, days: number = 14): { date: string; rank: number }[] {
  const history = [];
  const now = Date.now();
  let r = currentRank;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    // Slight jitter to simulate real rank movement
    if (i > 0) {
      r = Math.max(1, Math.min(100, Math.round(currentRank + Math.sin(i * 0.7) * 2)));
    } else {
      r = currentRank;
    }
    history.push({
      date: d.toISOString().split('T')[0],
      rank: r
    });
  }
  return history;
}

const DEFAULT_KEYWORDS: TrackedKeyword[] = [
  {
    id: 'kw_1',
    keyword: 'vintage movie posters',
    searchVolume: 18500,
    cpc: 1.45,
    difficulty: 38,
    currentRank: 3,
    previousRank: 4,
    bestRank: 2,
    initialRank: 8,
    intent: 'Transactional',
    tags: ['Product', 'High Priority'],
    serpFeatures: ['Featured Snippet', 'Images', 'People Also Ask'],
    targetUrl: 'https://posterscraft.com/category/vintage-movie',
    device: 'desktop',
    lastUpdated: new Date().toISOString(),
    history: generateHistory(3)
  },
  {
    id: 'kw_2',
    keyword: 'minimalist canvas wall art',
    searchVolume: 14200,
    cpc: 2.10,
    difficulty: 45,
    currentRank: 5,
    previousRank: 6,
    bestRank: 4,
    initialRank: 12,
    intent: 'Commercial',
    tags: ['Product'],
    serpFeatures: ['Images', 'People Also Ask', 'SiteLinks'],
    targetUrl: 'https://posterscraft.com/collections/minimalist',
    device: 'desktop',
    lastUpdated: new Date().toISOString(),
    history: generateHistory(5)
  },
  {
    id: 'kw_3',
    keyword: 'aesthetic room decor posters',
    searchVolume: 22000,
    cpc: 0.95,
    difficulty: 32,
    currentRank: 2,
    previousRank: 2,
    bestRank: 1,
    initialRank: 6,
    intent: 'Commercial',
    tags: ['Product', 'High Priority'],
    serpFeatures: ['Featured Snippet', 'Images'],
    targetUrl: 'https://posterscraft.com/decor',
    device: 'desktop',
    lastUpdated: new Date().toISOString(),
    history: generateHistory(2)
  },
  {
    id: 'kw_4',
    keyword: 'how to frame canvas prints',
    searchVolume: 8900,
    cpc: 0.70,
    difficulty: 24,
    currentRank: 1,
    previousRank: 3,
    bestRank: 1,
    initialRank: 9,
    intent: 'Informational',
    tags: ['Blog', 'Guides'],
    serpFeatures: ['Featured Snippet', 'Video', 'People Also Ask'],
    targetUrl: 'https://posterscraft.com/blog/how-to-frame',
    device: 'desktop',
    lastUpdated: new Date().toISOString(),
    history: generateHistory(1)
  },
  {
    id: 'kw_5',
    keyword: 'buy posterscraft online',
    searchVolume: 4200,
    cpc: 0.40,
    difficulty: 12,
    currentRank: 1,
    previousRank: 1,
    bestRank: 1,
    initialRank: 1,
    intent: 'Navigational',
    tags: ['Brand'],
    serpFeatures: ['SiteLinks', 'Knowledge Panel'],
    targetUrl: 'https://posterscraft.com/',
    device: 'desktop',
    lastUpdated: new Date().toISOString(),
    history: generateHistory(1)
  },
  {
    id: 'kw_6',
    keyword: 'enterprise seo crawler engine',
    searchVolume: 9400,
    cpc: 4.80,
    difficulty: 58,
    currentRank: 4,
    previousRank: 6,
    bestRank: 3,
    initialRank: 14,
    intent: 'Commercial',
    tags: ['Software', 'High Priority'],
    serpFeatures: ['People Also Ask', 'SiteLinks'],
    targetUrl: 'https://techflow.io/features/seo-crawler',
    device: 'desktop',
    lastUpdated: new Date().toISOString(),
    history: generateHistory(4)
  },
  {
    id: 'kw_7',
    keyword: 'core web vitals audit api',
    searchVolume: 6700,
    cpc: 3.90,
    difficulty: 49,
    currentRank: 6,
    previousRank: 5,
    bestRank: 4,
    initialRank: 10,
    intent: 'Informational',
    tags: ['Software', 'API'],
    serpFeatures: ['Featured Snippet', 'People Also Ask'],
    targetUrl: 'https://techflow.io/docs/api',
    device: 'desktop',
    lastUpdated: new Date().toISOString(),
    history: generateHistory(6)
  },
  {
    id: 'kw_8',
    keyword: 'real time serp tracker tool',
    searchVolume: 12400,
    cpc: 5.20,
    difficulty: 62,
    currentRank: 8,
    previousRank: 11,
    bestRank: 7,
    initialRank: 18,
    intent: 'Commercial',
    tags: ['Software'],
    serpFeatures: ['SiteLinks'],
    targetUrl: 'https://techflow.io/features/serp-tracker',
    device: 'desktop',
    lastUpdated: new Date().toISOString(),
    history: generateHistory(8)
  },
  {
    id: 'kw_9',
    keyword: 'indexnow instant indexing protocol',
    searchVolume: 5100,
    cpc: 2.80,
    difficulty: 35,
    currentRank: 2,
    previousRank: 3,
    bestRank: 2,
    initialRank: 7,
    intent: 'Informational',
    tags: ['Software', 'High Priority'],
    serpFeatures: ['Featured Snippet', 'People Also Ask'],
    targetUrl: 'https://techflow.io/features/indexnow',
    device: 'desktop',
    lastUpdated: new Date().toISOString(),
    history: generateHistory(2)
  },
  {
    id: 'kw_10',
    keyword: 'custom anime poster prints',
    searchVolume: 16800,
    cpc: 1.20,
    difficulty: 42,
    currentRank: 7,
    previousRank: 9,
    bestRank: 6,
    initialRank: 15,
    intent: 'Transactional',
    tags: ['Product'],
    serpFeatures: ['Images', 'People Also Ask'],
    targetUrl: 'https://posterscraft.com/category/anime',
    device: 'desktop',
    lastUpdated: new Date().toISOString(),
    history: generateHistory(7)
  }
];

export class KeywordStore {
  public static getKeywords(): TrackedKeyword[] {
    try {
      const raw = localStorage.getItem(KEYWORDS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }

    this.saveKeywords(DEFAULT_KEYWORDS);
    return DEFAULT_KEYWORDS;
  }

  public static addKeyword(data: {
    keyword: string;
    searchVolume: number;
    cpc: number;
    difficulty: number;
    currentRank: number;
    intent: SearchIntent;
    tags: string[];
    targetUrl: string;
    device: KeywordDevice;
  }): TrackedKeyword[] {
    const current = this.getKeywords();
    const newId = `kw_${Date.now()}`;
    const newKeyword: TrackedKeyword = {
      id: newId,
      keyword: data.keyword.trim(),
      searchVolume: data.searchVolume || 1000,
      cpc: data.cpc || 1.0,
      difficulty: data.difficulty || 30,
      currentRank: data.currentRank || 10,
      previousRank: data.currentRank || 10,
      bestRank: data.currentRank || 10,
      initialRank: data.currentRank || 10,
      intent: data.intent || 'Commercial',
      tags: data.tags.length > 0 ? data.tags : ['General'],
      serpFeatures: ['People Also Ask'],
      targetUrl: data.targetUrl.trim() || 'https://posterscraft.com',
      device: data.device || 'desktop',
      lastUpdated: new Date().toISOString(),
      history: generateHistory(data.currentRank || 10)
    };

    const updated = [newKeyword, ...current];
    this.saveKeywords(updated);
    return updated;
  }

  public static deleteKeyword(id: string): TrackedKeyword[] {
    const current = this.getKeywords();
    const updated = current.filter(k => k.id !== id);
    this.saveKeywords(updated);
    return updated;
  }

  public static getStatsSummary(keywords: TrackedKeyword[]): KeywordStatsSummary {
    if (keywords.length === 0) {
      return {
        totalKeywords: 0,
        inTop3: 0,
        inTop10: 0,
        inTop100: 0,
        improvedCount: 0,
        declinedCount: 0,
        stableCount: 0,
        avgPosition: 0,
        volatilityScore: 0
      };
    }

    let inTop3 = 0;
    let inTop10 = 0;
    let inTop100 = 0;
    let improvedCount = 0;
    let declinedCount = 0;
    let stableCount = 0;
    let rankSum = 0;

    keywords.forEach(k => {
      if (k.currentRank <= 3) inTop3++;
      if (k.currentRank <= 10) inTop10++;
      if (k.currentRank <= 100) inTop100++;

      if (k.currentRank < k.previousRank) improvedCount++;
      else if (k.currentRank > k.previousRank) declinedCount++;
      else stableCount++;

      rankSum += k.currentRank;
    });

    const avgPosition = Number((rankSum / keywords.length).toFixed(1));
    const volatilityScore = Number(
      Math.min(10, Math.max(1, (improvedCount + declinedCount) / keywords.length * 5)).toFixed(1)
    );

    return {
      totalKeywords: keywords.length,
      inTop3,
      inTop10,
      inTop100,
      improvedCount,
      declinedCount,
      stableCount,
      avgPosition,
      volatilityScore
    };
  }

  public static getAvailableTags(keywords: TrackedKeyword[]): string[] {
    const tagSet = new Set<string>();
    keywords.forEach(k => k.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  }

  private static saveKeywords(keywords: TrackedKeyword[]): void {
    try {
      localStorage.setItem(KEYWORDS_STORAGE_KEY, JSON.stringify(keywords));
    } catch {
      // ignore
    }
  }
}
