import { 
  CompetitorDomain, 
  UserDomainMetrics, 
  HeadToHeadComparison, 
  DisplacementOpportunity,
  CompetitorType 
} from './types';

const STORAGE_KEY_COMPETITORS = 'seo_studio_competitors_v1';

export class CompetitorStore {
  private static userMetrics: UserDomainMetrics = {
    domain: 'posterscraft.com',
    name: 'PostersCraft Studio',
    domainRating: 48,
    trackedKeywordsCount: 11,
    organicTrafficMonthly: 18500,
    backlinksEstimate: 4820,
    referringDomains: 340
  };

  private static defaultCompetitors: CompetitorDomain[] = [
    {
      id: 'comp-allposters',
      domain: 'allposters.com',
      name: 'AllPosters',
      type: 'direct',
      domainRating: 78,
      commonKeywordsCount: 9,
      totalKeywordsCount: 42500,
      organicTrafficMonthly: 380000,
      overlapScore: 82,
      serpCompetitionLevel: 'High',
      backlinksEstimate: 245000,
      referringDomains: 9200,
      quadrant: 'Leaders',
      topOverlapKeywords: [
        { keyword: 'vintage movie posters', userRank: 3, competitorRank: 4, searchVolume: 18100, diff: -1, serpFeatures: ['Featured Snippet', 'PAA', 'Sitelinks'] },
        { keyword: 'custom framed posters', userRank: 5, competitorRank: 3, searchVolume: 9900, diff: +2, serpFeatures: ['Review Stars', 'PAA'] },
        { keyword: 'buy retro posters online', userRank: 4, competitorRank: 5, searchVolume: 6700, diff: -1, serpFeatures: ['PAA'] },
        { keyword: 'classic cinema wall art', userRank: 2, competitorRank: 3, searchVolume: 4200, diff: -1, serpFeatures: ['Featured Snippet'] },
        { keyword: 'canvas art online', userRank: 8, competitorRank: 6, searchVolume: 22400, diff: +2, serpFeatures: ['Videos', 'PAA'] }
      ],
      topWinningKeywords: [
        { keyword: 'giant movie posters 27x40', competitorRank: 1, searchVolume: 12500, url: 'https://allposters.com/large-formats', cpc: 2.45 },
        { keyword: 'vintage travel advertising prints', competitorRank: 2, searchVolume: 8900, url: 'https://allposters.com/travel-art', cpc: 1.85 },
        { keyword: 'licensed concert posters', competitorRank: 1, searchVolume: 14200, url: 'https://allposters.com/music', cpc: 3.10 }
      ]
    },
    {
      id: 'comp-posterstore',
      domain: 'posterstore.com',
      name: 'Poster Store',
      type: 'direct',
      domainRating: 68,
      commonKeywordsCount: 8,
      totalKeywordsCount: 28400,
      organicTrafficMonthly: 195000,
      overlapScore: 73,
      serpCompetitionLevel: 'High',
      backlinksEstimate: 88000,
      referringDomains: 3400,
      quadrant: 'Established',
      topOverlapKeywords: [
        { keyword: 'minimalist art prints', userRank: 4, competitorRank: 5, searchVolume: 14200, diff: -1, serpFeatures: ['PAA', 'Images'] },
        { keyword: 'botanical prints framed', userRank: 6, competitorRank: 2, searchVolume: 11000, diff: +4, serpFeatures: ['Review Stars', 'PAA'] },
        { keyword: 'gallery wall set prints', userRank: 7, competitorRank: 3, searchVolume: 16500, diff: +4, serpFeatures: ['PAA', 'Videos'] },
        { keyword: 'scandinavian poster design', userRank: 3, competitorRank: 4, searchVolume: 7800, diff: -1, serpFeatures: ['Featured Snippet'] }
      ],
      topWinningKeywords: [
        { keyword: 'scandi gallery wall combinations', competitorRank: 1, searchVolume: 9200, url: 'https://posterstore.com/gallery-walls', cpc: 1.65 },
        { keyword: 'nordic nature photography posters', competitorRank: 2, searchVolume: 6400, url: 'https://posterstore.com/nature', cpc: 1.40 }
      ]
    },
    {
      id: 'comp-desenio',
      domain: 'desenio.com',
      name: 'Desenio',
      type: 'direct',
      domainRating: 71,
      commonKeywordsCount: 7,
      totalKeywordsCount: 36200,
      organicTrafficMonthly: 285000,
      overlapScore: 64,
      serpCompetitionLevel: 'Medium',
      backlinksEstimate: 142000,
      referringDomains: 5100,
      quadrant: 'Leaders',
      topOverlapKeywords: [
        { keyword: 'minimalist art prints', userRank: 4, competitorRank: 6, searchVolume: 14200, diff: -2, serpFeatures: ['PAA'] },
        { keyword: 'botanical prints framed', userRank: 6, competitorRank: 4, searchVolume: 11000, diff: +2, serpFeatures: ['PAA', 'Review Stars'] },
        { keyword: 'modern abstract wall art', userRank: 8, competitorRank: 5, searchVolume: 19800, diff: +3, serpFeatures: ['PAA'] }
      ],
      topWinningKeywords: [
        { keyword: 'trendy poster frames online', competitorRank: 2, searchVolume: 14500, url: 'https://desenio.com/frames', cpc: 2.10 },
        { keyword: 'kitchen wall prints and posters', competitorRank: 1, searchVolume: 8800, url: 'https://desenio.com/kitchen', cpc: 1.75 }
      ]
    },
    {
      id: 'comp-society6',
      domain: 'society6.com',
      name: 'Society6',
      type: 'marketplace',
      domainRating: 82,
      commonKeywordsCount: 6,
      totalKeywordsCount: 85000,
      organicTrafficMonthly: 620000,
      overlapScore: 55,
      serpCompetitionLevel: 'Medium',
      backlinksEstimate: 490000,
      referringDomains: 16500,
      quadrant: 'Specialists',
      topOverlapKeywords: [
        { keyword: 'canvas art online', userRank: 8, competitorRank: 7, searchVolume: 22400, diff: +1, serpFeatures: ['Videos'] },
        { keyword: 'indie artist art prints', userRank: 2, competitorRank: 1, searchVolume: 5900, diff: +1, serpFeatures: ['PAA'] }
      ],
      topWinningKeywords: [
        { keyword: 'artist designed tapestry prints', competitorRank: 1, searchVolume: 18400, url: 'https://society6.com/tapestries', cpc: 1.95 },
        { keyword: 'giclee prints from artists', competitorRank: 2, searchVolume: 7600, url: 'https://society6.com/art-prints', cpc: 2.20 }
      ]
    },
    {
      id: 'comp-etsy',
      domain: 'etsy.com',
      name: 'Etsy Marketplace',
      type: 'marketplace',
      domainRating: 92,
      commonKeywordsCount: 10,
      totalKeywordsCount: 350000,
      organicTrafficMonthly: 4200000,
      overlapScore: 91,
      serpCompetitionLevel: 'High',
      backlinksEstimate: 3200000,
      referringDomains: 88000,
      quadrant: 'Leaders',
      topOverlapKeywords: [
        { keyword: 'vintage movie posters', userRank: 3, competitorRank: 1, searchVolume: 18100, diff: +2, serpFeatures: ['Featured Snippet', 'PAA'] },
        { keyword: 'custom framed posters', userRank: 5, competitorRank: 2, searchVolume: 9900, diff: +3, serpFeatures: ['Review Stars'] },
        { keyword: 'minimalist art prints', userRank: 4, competitorRank: 1, searchVolume: 14200, diff: +3, serpFeatures: ['PAA'] }
      ],
      topWinningKeywords: [
        { keyword: 'handmade custom posters', competitorRank: 1, searchVolume: 24000, url: 'https://etsy.com/c/posters', cpc: 2.80 }
      ]
    },
    {
      id: 'comp-artcom',
      domain: 'art.com',
      name: 'Art.com',
      type: 'direct',
      domainRating: 84,
      commonKeywordsCount: 5,
      totalKeywordsCount: 65000,
      organicTrafficMonthly: 450000,
      overlapScore: 45,
      serpCompetitionLevel: 'Medium',
      backlinksEstimate: 310000,
      referringDomains: 11000,
      quadrant: 'Leaders',
      topOverlapKeywords: [
        { keyword: 'canvas art online', userRank: 8, competitorRank: 4, searchVolume: 22400, diff: +4, serpFeatures: ['Videos'] }
      ],
      topWinningKeywords: [
        { keyword: 'museum master art reproductions', competitorRank: 1, searchVolume: 15600, url: 'https://art.com/museum', cpc: 3.40 }
      ]
    }
  ];

  /**
   * Retrieves all tracked competitors
   */
  static getCompetitors(): CompetitorDomain[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COMPETITORS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return this.defaultCompetitors;
  }

  /**
   * Persists competitors list
   */
  static saveCompetitors(competitors: CompetitorDomain[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_COMPETITORS, JSON.stringify(competitors));
    } catch {
      // Ignore
    }
  }

  /**
   * Returns user's primary domain metrics
   */
  static getUserMetrics(): UserDomainMetrics {
    return this.userMetrics;
  }

  /**
   * Adds a new custom competitor domain
   */
  static addCompetitor(data: {
    domain: string;
    name: string;
    type: CompetitorType;
  }): CompetitorDomain[] {
    const cleanDomain = data.domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '').trim();
    const existing = this.getCompetitors();
    
    if (existing.some(c => c.domain === cleanDomain)) {
      return existing;
    }

    const hash = Math.abs(cleanDomain.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0));
    const dr = 45 + (hash % 45);
    const traffic = 25000 + (hash * 450) % 250000;
    const keywordsCount = 4000 + (hash * 120) % 35000;
    const commonCount = 3 + (hash % 6);
    const overlap = Math.min(85, Math.round((commonCount / 11) * 100));

    const newComp: CompetitorDomain = {
      id: `comp-${Date.now()}`,
      domain: cleanDomain,
      name: data.name.trim() || cleanDomain,
      type: data.type,
      domainRating: dr,
      commonKeywordsCount: commonCount,
      totalKeywordsCount: keywordsCount,
      organicTrafficMonthly: traffic,
      overlapScore: overlap,
      serpCompetitionLevel: overlap > 70 ? 'High' : overlap > 40 ? 'Medium' : 'Low',
      backlinksEstimate: Math.round(traffic * 0.4),
      referringDomains: Math.round(traffic * 0.015),
      isManuallyAdded: true,
      quadrant: traffic > 200000 ? 'Leaders' : keywordsCount > 20000 ? 'Specialists' : 'Emerging',
      topOverlapKeywords: [
        { keyword: 'vintage movie posters', userRank: 3, competitorRank: 6, searchVolume: 18100, diff: -3, serpFeatures: ['PAA'] },
        { keyword: 'minimalist art prints', userRank: 4, competitorRank: 7, searchVolume: 14200, diff: -3, serpFeatures: ['PAA'] },
        { keyword: 'custom framed posters', userRank: 5, competitorRank: 4, searchVolume: 9900, diff: +1, serpFeatures: ['Review Stars'] }
      ],
      topWinningKeywords: [
        { keyword: `${cleanDomain} best sellers`, competitorRank: 1, searchVolume: 4200, url: `https://${cleanDomain}/collection`, cpc: 1.5 }
      ]
    };

    const updated = [newComp, ...existing];
    this.saveCompetitors(updated);
    return updated;
  }

  /**
   * Deletes a competitor by ID
   */
  static deleteCompetitor(id: string): CompetitorDomain[] {
    const current = this.getCompetitors();
    const updated = current.filter(c => c.id !== id);
    this.saveCompetitors(updated);
    return updated;
  }

  /**
   * Updates competitor classification type
   */
  static updateCompetitorType(id: string, newType: CompetitorType): CompetitorDomain[] {
    const current = this.getCompetitors();
    const updated = current.map(c => c.id === id ? { ...c, type: newType } : c);
    this.saveCompetitors(updated);
    return updated;
  }

  /**
   * Generates a Head-to-Head Comparison between User Domain and Competitor
   */
  static getHeadToHeadComparison(competitorId: string): HeadToHeadComparison | null {
    const competitors = this.getCompetitors();
    const competitor = competitors.find(c => c.id === competitorId) || competitors[0];
    if (!competitor) return null;

    let userAdvantage = 0;
    let compAdvantage = 0;

    competitor.topOverlapKeywords.forEach(kw => {
      if (kw.userRank < kw.competitorRank) {
        userAdvantage++;
      } else if (kw.competitorRank < kw.userRank) {
        compAdvantage++;
      }
    });

    return {
      user: this.userMetrics,
      competitor,
      userRankAdvantageCount: userAdvantage,
      competitorRankAdvantageCount: compAdvantage,
      sharedKeywordsCount: competitor.topOverlapKeywords.length,
      trafficGap: competitor.organicTrafficMonthly - this.userMetrics.organicTrafficMonthly,
      domainRatingGap: competitor.domainRating - this.userMetrics.domainRating
    };
  }

  /**
   * Identifies SERP Displacement Targets (vulnerable competitor rankings)
   */
  static getDisplacementOpportunities(): DisplacementOpportunity[] {
    return [
      {
        id: 'disp-1',
        keyword: 'custom framed posters',
        searchVolume: 9900,
        cpc: 2.15,
        competitorDomain: 'allposters.com',
        competitorRank: 3,
        userRank: 5,
        vulnerabilityReason: 'Competitor page has thin textual content (under 450 words) and lacks structured Product review schema.',
        opportunityScore: 88,
        actionPlan: [
          'Add detailed framing material section highlighting archival matting and kiln-dried wood.',
          'Inject Product and AggregateRating JSON-LD schema with 4.9 star rating.',
          'Optimize H1 tag and internal breadcrumb anchor text to match query exact phrase.'
        ]
      },
      {
        id: 'disp-2',
        keyword: 'botanical prints framed',
        searchVolume: 11000,
        cpc: 1.85,
        competitorDomain: 'posterstore.com',
        competitorRank: 2,
        userRank: 6,
        vulnerabilityReason: 'Competitor page Core Web Vitals LCP exceeds 3.2s on mobile due to unoptimized JPEG hero carousels.',
        opportunityScore: 82,
        actionPlan: [
          'Serve next-gen WebP/AVIF images with explicit width and height attributes to achieve sub-1.2s LCP.',
          'Add a 4-step Gallery Wall Styling Guide to capture People Also Ask search real estate.',
          'Acquire 2 high-authority editorial links from home decor and interior design blogs.'
        ]
      },
      {
        id: 'disp-3',
        keyword: 'canvas art online',
        searchVolume: 22400,
        cpc: 2.90,
        competitorDomain: 'society6.com',
        competitorRank: 7,
        userRank: 8,
        vulnerabilityReason: 'Competitor URL has high bounce rate and lacks video demonstrations of canvas tensioning and hanging hardware.',
        opportunityScore: 76,
        actionPlan: [
          'Embed 90-second studio video with VideoObject schema and exact chapter timestamps.',
          'Highlight free expedited shipping and ready-to-hang mounting bracket included in box.',
          'Add comparison table: Giclée Canvas vs Standard Paper Print.'
        ]
      },
      {
        id: 'disp-4',
        keyword: 'modern abstract wall art',
        searchVolume: 19800,
        cpc: 2.40,
        competitorDomain: 'desenio.com',
        competitorRank: 5,
        userRank: 8,
        vulnerabilityReason: 'Competitor title tag is truncated at 640px and meta description is generic auto-generated boilerplate.',
        opportunityScore: 74,
        actionPlan: [
          'Craft pixel-optimized title tag within 560px boundary with high-CTR buyer intent triggers.',
          'Include customer rating rich snippet and verified artist signatures on art detail pages.',
          'Internal link from top 5 vintage poster collection pages to pass PageRank equity.'
        ]
      }
    ];
  }
}
