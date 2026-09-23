import type { IncomingMessage, ServerResponse } from 'http';

interface KeywordGapRequestBody {
  targetDomain: string;
  competitorDomains?: string[];
}

/**
 * Reads JSON payload from an incoming Node.js HTTP request stream
 */
function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
      if (body.length > 512 * 1024) {
        reject(new Error('Request payload too large'));
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

/**
 * Sends a JSON response with proper CORS headers
 */
function sendJson(res: ServerResponse, statusCode: number, data: any): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

// Comprehensive Master Keyword Universe for Gap Comparisons
interface MasterGapEntry {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  intent: 'Commercial' | 'Transactional' | 'Informational' | 'Navigational';
  ranks: Record<string, number | null>; // domain -> rank (null = not in top 100)
}

const MASTER_KEYWORD_POOL: MasterGapEntry[] = [
  // 1. Shared / Core Ranking Keywords
  {
    keyword: 'vintage movie posters',
    searchVolume: 18500,
    difficulty: 38,
    cpc: 1.45,
    intent: 'Transactional',
    ranks: {
      'posterscraft.com': 3,
      'allposters.com': 4,
      'posterstore.com': 8,
      'desenio.com': 12,
      'etsy.com': 5
    }
  },
  {
    keyword: 'minimalist canvas wall art',
    searchVolume: 14200,
    difficulty: 45,
    cpc: 2.10,
    intent: 'Commercial',
    ranks: {
      'posterscraft.com': 5,
      'allposters.com': 7,
      'posterstore.com': 2,
      'desenio.com': 4,
      'etsy.com': 1
    }
  },
  {
    keyword: 'custom framed posters online',
    searchVolume: 9900,
    difficulty: 42,
    cpc: 1.85,
    intent: 'Transactional',
    ranks: {
      'posterscraft.com': 4,
      'allposters.com': 3,
      'posterstore.com': 6,
      'desenio.com': 9,
      'etsy.com': 2
    }
  },
  {
    keyword: 'classic cinema wall art',
    searchVolume: 4200,
    difficulty: 32,
    cpc: 1.20,
    intent: 'Transactional',
    ranks: {
      'posterscraft.com': 2,
      'allposters.com': 3,
      'posterstore.com': 7,
      'desenio.com': null,
      'etsy.com': 6
    }
  },
  {
    keyword: 'aesthetic room decor posters',
    searchVolume: 27500,
    difficulty: 48,
    cpc: 1.35,
    intent: 'Commercial',
    ranks: {
      'posterscraft.com': 7,
      'allposters.com': 9,
      'posterstore.com': 3,
      'desenio.com': 2,
      'etsy.com': 1
    }
  },

  // 2. Missing Keywords (Competitors rank high, PostersCraft unranked or >50)
  {
    keyword: 'large format botanical wall art',
    searchVolume: 16800,
    difficulty: 34,
    cpc: 1.95,
    intent: 'Commercial',
    ranks: {
      'posterscraft.com': null,
      'allposters.com': 4,
      'posterstore.com': 3,
      'desenio.com': 1,
      'etsy.com': 5
    }
  },
  {
    keyword: 'retro sci-fi movie prints',
    searchVolume: 12400,
    difficulty: 29,
    cpc: 1.60,
    intent: 'Transactional',
    ranks: {
      'posterscraft.com': null,
      'allposters.com': 2,
      'posterstore.com': 6,
      'desenio.com': 14,
      'etsy.com': 3
    }
  },
  {
    keyword: 'scandinavian gallery wall sets',
    searchVolume: 22100,
    difficulty: 44,
    cpc: 2.30,
    intent: 'Commercial',
    ranks: {
      'posterscraft.com': null,
      'allposters.com': 8,
      'posterstore.com': 1,
      'desenio.com': 2,
      'etsy.com': 4
    }
  },
  {
    keyword: 'museum quality giclee art prints',
    searchVolume: 8900,
    difficulty: 39,
    cpc: 2.75,
    intent: 'Transactional',
    ranks: {
      'posterscraft.com': null,
      'allposters.com': 3,
      'posterstore.com': 5,
      'desenio.com': 11,
      'etsy.com': 2
    }
  },
  {
    keyword: 'japanese woodblock ukiyo-e posters',
    searchVolume: 15300,
    difficulty: 36,
    cpc: 1.40,
    intent: 'Informational',
    ranks: {
      'posterscraft.com': null,
      'allposters.com': 1,
      'posterstore.com': 9,
      'desenio.com': 6,
      'etsy.com': 3
    }
  },
  {
    keyword: 'mid century modern abstract prints',
    searchVolume: 19400,
    difficulty: 41,
    cpc: 2.15,
    intent: 'Commercial',
    ranks: {
      'posterscraft.com': null,
      'allposters.com': 5,
      'posterstore.com': 2,
      'desenio.com': 3,
      'etsy.com': 4
    }
  },
  {
    keyword: 'architectural blueprint posters vintage',
    searchVolume: 7400,
    difficulty: 27,
    cpc: 1.50,
    intent: 'Transactional',
    ranks: {
      'posterscraft.com': null,
      'allposters.com': 2,
      'posterstore.com': 8,
      'desenio.com': null,
      'etsy.com': 4
    }
  },
  {
    keyword: 'black and white photography prints framed',
    searchVolume: 24800,
    difficulty: 49,
    cpc: 2.40,
    intent: 'Commercial',
    ranks: {
      'posterscraft.com': null,
      'allposters.com': 6,
      'posterstore.com': 4,
      'desenio.com': 1,
      'etsy.com': 5
    }
  },

  // 3. Weak Keywords (PostersCraft ranks, but significantly behind rivals)
  {
    keyword: 'canvas art online buy',
    searchVolume: 22400,
    difficulty: 52,
    cpc: 2.25,
    intent: 'Transactional',
    ranks: {
      'posterscraft.com': 18,
      'allposters.com': 4,
      'posterstore.com': 6,
      'desenio.com': 5,
      'etsy.com': 2
    }
  },
  {
    keyword: 'art deco travel posters',
    searchVolume: 11200,
    difficulty: 35,
    cpc: 1.70,
    intent: 'Commercial',
    ranks: {
      'posterscraft.com': 14,
      'allposters.com': 2,
      'posterstore.com': 5,
      'desenio.com': 8,
      'etsy.com': 3
    }
  },
  {
    keyword: 'framed vintage concert posters',
    searchVolume: 8700,
    difficulty: 33,
    cpc: 1.85,
    intent: 'Transactional',
    ranks: {
      'posterscraft.com': 16,
      'allposters.com': 1,
      'posterstore.com': 9,
      'desenio.com': null,
      'etsy.com': 3
    }
  },
  {
    keyword: 'kitchen typography prints framed',
    searchVolume: 6500,
    difficulty: 28,
    cpc: 1.15,
    intent: 'Commercial',
    ranks: {
      'posterscraft.com': 21,
      'allposters.com': 8,
      'posterstore.com': 2,
      'desenio.com': 3,
      'etsy.com': 4
    }
  },
  {
    keyword: 'nursery wall art animal prints',
    searchVolume: 17600,
    difficulty: 37,
    cpc: 1.65,
    intent: 'Commercial',
    ranks: {
      'posterscraft.com': 25,
      'allposters.com': 6,
      'posterstore.com': 3,
      'desenio.com': 2,
      'etsy.com': 1
    }
  },

  // 4. Strong Keywords (PostersCraft outranks rivals or dominates)
  {
    keyword: 'bengali cinema vintage posters',
    searchVolume: 3800,
    difficulty: 22,
    cpc: 0.95,
    intent: 'Transactional',
    ranks: {
      'posterscraft.com': 1,
      'allposters.com': 9,
      'posterstore.com': null,
      'desenio.com': null,
      'etsy.com': 5
    }
  },
  {
    keyword: 'original retro movie posters kolkata',
    searchVolume: 2900,
    difficulty: 19,
    cpc: 1.10,
    intent: 'Transactional',
    ranks: {
      'posterscraft.com': 1,
      'allposters.com': 12,
      'posterstore.com': null,
      'desenio.com': null,
      'etsy.com': 7
    }
  },
  {
    keyword: 'custom hand pulled screen print posters',
    searchVolume: 5100,
    difficulty: 26,
    cpc: 1.90,
    intent: 'Transactional',
    ranks: {
      'posterscraft.com': 2,
      'allposters.com': 8,
      'posterstore.com': null,
      'desenio.com': null,
      'etsy.com': 4
    }
  },
  {
    keyword: 'high resolution cult movie poster reproductions',
    searchVolume: 3400,
    difficulty: 24,
    cpc: 1.30,
    intent: 'Transactional',
    ranks: {
      'posterscraft.com': 1,
      'allposters.com': 4,
      'posterstore.com': 11,
      'desenio.com': null,
      'etsy.com': 6
    }
  },

  // 5. Arbitrage Quick Wins (High Volume, Low KD, Competitor weak #6-#15)
  {
    keyword: 'vintage national park travel prints',
    searchVolume: 13900,
    difficulty: 28,
    cpc: 1.45,
    intent: 'Commercial',
    ranks: {
      'posterscraft.com': null,
      'allposters.com': 7,
      'posterstore.com': 9,
      'desenio.com': 12,
      'etsy.com': 4
    }
  },
  {
    keyword: 'bauhaus exhibition poster 1923 reprint',
    searchVolume: 11800,
    difficulty: 25,
    cpc: 1.25,
    intent: 'Commercial',
    ranks: {
      'posterscraft.com': null,
      'allposters.com': 6,
      'posterstore.com': 8,
      'desenio.com': 5,
      'etsy.com': 3
    }
  },
  {
    keyword: 'astronomy solar system vintage charts',
    searchVolume: 9200,
    difficulty: 23,
    cpc: 1.15,
    intent: 'Informational',
    ranks: {
      'posterscraft.com': null,
      'allposters.com': 5,
      'posterstore.com': 10,
      'desenio.com': null,
      'etsy.com': 4
    }
  }
];

/**
 * Handles POST /api/keyword-gap requests
 */
export async function handleKeywordGapRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method Not Allowed. Use POST.' });
    return;
  }

  try {
    const body = await readJsonBody<KeywordGapRequestBody>(req);
    const rawTarget = body.targetDomain || 'posterscraft.com';
    const targetDomain = rawTarget.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').trim();
    
    // Default competitors to evaluate
    const rawCompetitors = body.competitorDomains && body.competitorDomains.length > 0 
      ? body.competitorDomains 
      : ['allposters.com', 'posterstore.com', 'desenio.com', 'etsy.com'];
      
    const competitorDomains = rawCompetitors.map(d => 
      d.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').trim()
    );

    // Process and classify each keyword in the universe
    const items = MASTER_KEYWORD_POOL.map((entry) => {
      // Resolve target domain rank
      const targetRank = entry.ranks[targetDomain] !== undefined ? entry.ranks[targetDomain] : null;

      // Resolve competitor ranks for the requested subset
      const competitorRanks: Record<string, number | null> = {};
      let bestCompetitorRank: number | null = null;

      competitorDomains.forEach(comp => {
        const r = entry.ranks[comp] !== undefined ? entry.ranks[comp] : null;
        competitorRanks[comp] = r;
        if (r !== null) {
          if (bestCompetitorRank === null || r < bestCompetitorRank) {
            bestCompetitorRank = r;
          }
        }
      });

      // Classify Gap Status
      let gapStatus: 'missing' | 'weak' | 'strong' | 'shared' = 'shared';

      if (targetRank === null) {
        if (bestCompetitorRank !== null && bestCompetitorRank <= 20) {
          gapStatus = 'missing';
        } else {
          gapStatus = 'missing';
        }
      } else {
        if (bestCompetitorRank === null) {
          gapStatus = 'strong';
        } else if (targetRank < bestCompetitorRank) {
          gapStatus = 'strong';
        } else if (targetRank > bestCompetitorRank + 2) {
          gapStatus = 'weak';
        } else {
          gapStatus = 'shared';
        }
      }

      // Calculate Opportunity Score (0 - 100)
      // High volume + Low difficulty + Weak competitor rank = High opportunity
      const volScore = Math.min(40, (entry.searchVolume / 25000) * 40);
      const diffScore = Math.max(0, 35 - (entry.difficulty * 0.35));
      const compVulnerability = bestCompetitorRank ? Math.min(25, (bestCompetitorRank / 20) * 25) : 10;
      const opportunityScore = Math.round(Math.min(100, Math.max(10, volScore + diffScore + compVulnerability)));

      // Recommended Action Playbook
      let recommendedAction = 'Maintain keyword density and internal links';
      if (gapStatus === 'missing') {
        recommendedAction = entry.difficulty < 35 
          ? 'Create dedicated high-intent product landing page'
          : 'Publish long-tail buyer guide with schema markup';
      } else if (gapStatus === 'weak') {
        recommendedAction = 'Add targeted H2 sections, FAQ schema, and 3+ internal links';
      } else if (gapStatus === 'strong') {
        recommendedAction = 'Protect position with fresh content updates & featured snippet optimization';
      }

      return {
        keyword: entry.keyword,
        searchVolume: entry.searchVolume,
        difficulty: entry.difficulty,
        cpc: entry.cpc,
        intent: entry.intent,
        targetRank,
        competitorRanks,
        gapStatus,
        opportunityScore,
        recommendedAction
      };
    });

    // Compute Summary Metrics
    const missingCount = items.filter(i => i.gapStatus === 'missing').length;
    const weakCount = items.filter(i => i.gapStatus === 'weak').length;
    const strongCount = items.filter(i => i.gapStatus === 'strong').length;
    const sharedCount = items.filter(i => i.gapStatus === 'shared').length;

    // Potential traffic gain = 30% of missing volume + 15% of weak volume
    const missingVol = items.filter(i => i.gapStatus === 'missing').reduce((acc, i) => acc + i.searchVolume, 0);
    const weakVol = items.filter(i => i.gapStatus === 'weak').reduce((acc, i) => acc + i.searchVolume, 0);
    const estimatedTrafficPotential = Math.round((missingVol * 0.28) + (weakVol * 0.14));

    // Arbitrage Quick Wins: Missing or Weak with KD <= 40
    const arbitrageOpportunities = items
      .filter(i => (i.gapStatus === 'missing' || i.gapStatus === 'weak') && i.difficulty <= 42)
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, 6);

    sendJson(res, 200, {
      success: true,
      targetDomain,
      competitorDomains,
      totalCompared: items.length,
      metrics: {
        missingCount,
        weakCount,
        strongCount,
        sharedCount,
        estimatedTrafficPotential
      },
      items,
      arbitrageOpportunities,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    sendJson(res, 500, {
      error: 'Failed to compute keyword gap matrix',
      details: err.message
    });
  }
}
