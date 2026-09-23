import type { IncomingMessage, ServerResponse } from 'http';

interface SerpRequestBody {
  keyword: string;
  engine?: 'google' | 'bing' | 'yahoo' | 'duckduckgo';
  country?: 'US' | 'UK' | 'CA' | 'AU' | 'DE' | 'FR' | 'IN' | 'Global';
  device?: 'desktop' | 'mobile';
  language?: string;
}

/**
 * Calculates realistic CTR based on organic rank and device
 */
function getOrganicCtr(rank: number, device: 'desktop' | 'mobile'): number {
  if (device === 'mobile') {
    const mobileCtrCurve = [24.8, 14.2, 10.1, 7.8, 5.9, 4.4, 3.6, 2.9, 2.4, 2.0];
    return rank <= 10 ? mobileCtrCurve[rank - 1] : Math.max(0.5, +(2.0 * Math.pow(0.85, rank - 10)).toFixed(2));
  }
  const desktopCtrCurve = [27.6, 15.4, 11.0, 8.2, 6.1, 4.8, 3.9, 3.2, 2.7, 2.3];
  return rank <= 10 ? desktopCtrCurve[rank - 1] : Math.max(0.6, +(2.3 * Math.pow(0.85, rank - 10)).toFixed(2));
}

/**
 * Builds realistic organic rankings and SERP features for a given query
 */
export function generateSerpResults(
  keyword: string,
  engine: 'google' | 'bing' | 'yahoo' | 'duckduckgo' = 'google',
  country: 'US' | 'UK' | 'CA' | 'AU' | 'DE' | 'FR' | 'IN' | 'Global' = 'US',
  device: 'desktop' | 'mobile' = 'desktop',
  language: string = 'en'
) {
  const cleanKeyword = keyword.trim().toLowerCase();
  
  // Seed search volumes & CPC based on query characteristics
  const baseVolume = 1200 + Math.abs(hashCode(cleanKeyword) % 18000);
  const roundedVolume = Math.round(baseVolume / 100) * 100;
  const cpc = +(1.2 + (Math.abs(hashCode(cleanKeyword)) % 450) / 100).toFixed(2);
  const difficulty = 20 + (Math.abs(hashCode(cleanKeyword)) % 65);

  // Capitalize query words
  const titleCaseQuery = keyword
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  // Synthetic organic competitors tailored to ecommerce/art/posters/general
  const competitors = [
    {
      domain: 'etsy.com',
      name: 'Etsy',
      title: `${titleCaseQuery} - Unique & Handmade Selection`,
      path: `/market/${cleanKeyword.replace(/\s+/g, '_')}`,
      snippet: `Find unique and custom handmade pieces directly from creators. Discover thousands of curated ${cleanKeyword} options with free worldwide shipping available on select orders.`,
      da: 92,
      badges: ['sitelinks', 'schema', 'stars'] as ('sitelinks' | 'video' | 'schema' | 'faq' | 'stars' | 'author' | 'https')[],
      rating: { value: 4.8, count: 14250 },
      sitelinks: [
        { title: 'Best Sellers', url: `https://etsy.com/c/art-and-collectibles?q=${encodeURIComponent(keyword)}` },
        { title: 'Customer Reviews', url: `https://etsy.com/reviews` },
        { title: 'Handmade Framed', url: `https://etsy.com/framed-prints` },
        { title: 'Discounts & Deals', url: `https://etsy.com/sales` }
      ]
    },
    {
      domain: 'amazon.com',
      name: 'Amazon',
      title: `Amazon.com: ${titleCaseQuery}`,
      path: `/s?k=${encodeURIComponent(cleanKeyword)}`,
      snippet: `Online shopping for ${titleCaseQuery} from a great selection at Home & Kitchen Store. Fast Prime shipping, verified customer ratings, and flexible returns.`,
      da: 96,
      badges: ['stars', 'schema', 'https'] as ('sitelinks' | 'video' | 'schema' | 'faq' | 'stars' | 'author' | 'https')[],
      rating: { value: 4.6, count: 28900 }
    },
    {
      domain: 'posterscraft.com',
      name: 'PostersCraft Studio',
      title: `${titleCaseQuery} | Premium Gallery Prints & Frames`,
      path: `/collections/${cleanKeyword.replace(/\s+/g, '-')}`,
      snippet: `Explore handcrafted museum-grade ${cleanKeyword}. Archival quality pigment inks on heavy 250gsm matte paper. Custom solid wood framing and ready to hang.`,
      da: 48,
      badges: ['schema', 'faq', 'https', 'stars'] as ('sitelinks' | 'video' | 'schema' | 'faq' | 'stars' | 'author' | 'https')[],
      rating: { value: 4.9, count: 420 },
      isUserDomain: true
    },
    {
      domain: 'allposters.com',
      name: 'AllPosters',
      title: `${titleCaseQuery} Prints, Framed Wall Art & Decor`,
      path: `/-sp/${cleanKeyword.replace(/\s+/g, '-')}-posters.htm`,
      snippet: `Shop from over 1,000,000 prints, canvas and custom framed posters. 100% satisfaction guarantee with easy 30-day returns.`,
      da: 78,
      badges: ['schema', 'https'] as ('sitelinks' | 'video' | 'schema' | 'faq' | 'stars' | 'author' | 'https')[]
    },
    {
      domain: 'posterstore.com',
      name: 'Poster Store',
      title: `Affordable ${titleCaseQuery} & Scandinavian Wall Art`,
      path: `/posters/${cleanKeyword.replace(/\s+/g, '-')}`,
      snippet: `Scandinavian design posters inspired by modern trends. Beautiful gallery walls, high quality matte paper, fast 2-4 day delivery.`,
      da: 68,
      badges: ['schema', 'https'] as ('sitelinks' | 'video' | 'schema' | 'faq' | 'stars' | 'author' | 'https')[]
    },
    {
      domain: 'pinterest.com',
      name: 'Pinterest',
      title: `Best 500+ ${titleCaseQuery} Ideas in 2026`,
      path: `/ideas/${cleanKeyword.replace(/\s+/g, '-')}`,
      snippet: `Discover top ideas and inspiration for ${cleanKeyword}. Find styling guides, interior room mockups, and color palette inspiration.`,
      da: 94,
      badges: ['video', 'https'] as ('sitelinks' | 'video' | 'schema' | 'faq' | 'stars' | 'author' | 'https')[]
    },
    {
      domain: 'reddit.com',
      name: 'Reddit',
      title: `Where do you buy high quality ${cleanKeyword}? : r/InteriorDesign`,
      path: `/r/InteriorDesign/comments/best_${cleanKeyword.replace(/\s+/g, '_')}`,
      snippet: `Discussion and honest recommendations from community members on authentic print shops, paper thickness, framing options, and print longevity.`,
      da: 91,
      badges: ['author', 'https'] as ('sitelinks' | 'video' | 'schema' | 'faq' | 'stars' | 'author' | 'https')[]
    },
    {
      domain: 'society6.com',
      name: 'Society6',
      title: `${titleCaseQuery} by Independent Artists | Society6`,
      path: `/collection/${cleanKeyword.replace(/\s+/g, '-')}`,
      snippet: `Support independent digital and traditional artists. Every purchase pays an artist. Museum-quality giclée art prints with vibrant color reproduction.`,
      da: 82,
      badges: ['schema', 'https', 'stars'] as ('sitelinks' | 'video' | 'schema' | 'faq' | 'stars' | 'author' | 'https')[],
      rating: { value: 4.5, count: 1840 }
    },
    {
      domain: 'desenio.com',
      name: 'Desenio',
      title: `Trendy ${titleCaseQuery} & Picture Frames Online`,
      path: `/art-prints/${cleanKeyword.replace(/\s+/g, '-')}`,
      snippet: `Create a trendy gallery wall with stylish art prints. Browse popular categories, botanical, vintage, and abstract designs.`,
      da: 71,
      badges: ['schema', 'https'] as ('sitelinks' | 'video' | 'schema' | 'faq' | 'stars' | 'author' | 'https')[]
    },
    {
      domain: 'nytimes.com',
      name: 'The New York Times Wirecutter',
      title: `The Best Online Framing & Print Services for 2026`,
      path: `/reviews/best-online-framing-services/`,
      snippet: `After testing 12 custom print and framing services with various art styles, here are the top services for color accuracy, paper quality, and value.`,
      da: 95,
      badges: ['author', 'https'] as ('sitelinks' | 'video' | 'schema' | 'faq' | 'stars' | 'author' | 'https')[]
    }
  ];

  // User domain rank placement based on query hash (stable realistic rank between 3 and 12)
  const userDomainPlacement = 3 + (Math.abs(hashCode(cleanKeyword)) % 6);
  
  // Re-order so user domain lands at calculated rank
  const organicResults = competitors.map((item, index) => {
    const rank = index + 1;
    const isUser = item.isUserDomain === true || rank === userDomainPlacement;
    const itemDomain = isUser ? 'posterscraft.com' : item.domain;
    const itemTitle = isUser 
      ? `${titleCaseQuery} | Premium Museum Quality Prints — PostersCraft`
      : item.title;
    const itemUrl = `https://${itemDomain}${isUser ? `/collections/${cleanKeyword.replace(/\s+/g, '-')}` : item.path}`;
    const displayUrl = `${itemDomain} › ${cleanKeyword.replace(/\s+/g, '-').slice(0, 20)}`;
    const ctr = getOrganicCtr(rank, device);
    const traffic = Math.round((roundedVolume * ctr) / 100);

    return {
      rank,
      title: itemTitle,
      url: itemUrl,
      domain: itemDomain,
      displayUrl,
      breadcrumbs: [item.name, cleanKeyword],
      snippet: isUser
        ? `Museum-grade ${cleanKeyword} printed on 250gsm archival acid-free paper. UV-resistant pigment inks, solid wood framing, and expedited carbon-neutral delivery.`
        : item.snippet,
      datePublished: '2026-03-15',
      favicon: `https://www.google.com/s2/favicons?domain=${itemDomain}&sz=32`,
      badges: item.badges,
      sitelinks: rank === 1 ? item.sitelinks : undefined,
      rating: item.rating,
      estimatedCtr: ctr,
      estimatedTraffic: traffic,
      domainAuthorityScore: item.da,
      isUserDomain: isUser
    };
  });

  // Featured Snippet
  const featuredSnippet = {
    type: 'paragraph' as const,
    title: `What defines high quality ${cleanKeyword}?`,
    content: `High-grade ${cleanKeyword} are distinguished by archival pigment inks (giclée printing) on heavy 230–300 gsm acid-free cotton rag or alpha-cellulose paper. Unlike mass commercial offset prints, archival art prints resist UV fading for 80+ years and reproduce deep dynamic contrast ratios.`,
    sourceTitle: `A Guide to Art Print Types and Paper Quality`,
    sourceUrl: `https://etsy.com/blog/art-prints-guide`,
    sourceDomain: `etsy.com`,
    ownedByUser: false
  };

  // People Also Ask (PAA)
  const peopleAlsoAsk = [
    {
      question: `What is the best paper weight for ${cleanKeyword}?`,
      answerSnippet: `A weight of 200 to 250 gsm (grams per square meter) is ideal for everyday wall art posters, while fine art giclée prints typically use 280 to 310 gsm fine art paper to prevent warping and ensure structural rigidity.`,
      sourceTitle: `Paper Weights Explained - PostersCraft Knowledge Base`,
      sourceUrl: `https://posterscraft.com/guides/paper-weight`,
      sourceDomain: `posterscraft.com`
    },
    {
      question: `What size frames fit standard ${cleanKeyword}?`,
      answerSnippet: `The most common standard frame sizes are 12x18 inches (30x45cm), 18x24 inches (45x60cm), 24x36 inches (60x90cm), and international A-series formats (A4, A3, A2, A1).`,
      sourceTitle: `Standard Frame Sizes & Print Dimensions`,
      sourceUrl: `https://allposters.com/frame-sizes`,
      sourceDomain: `allposters.com`
    },
    {
      question: `How do I protect ${cleanKeyword} from fading in sunlight?`,
      answerSnippet: `Use framing with UV-protective acrylic or museum glass that blocks 99% of UV rays, display away from direct south-facing windows, and ensure prints use archival pigment-based inks rather than dye-based inks.`,
      sourceTitle: `Preserving Wall Art: Sunlight & Moisture Protection`,
      sourceUrl: `https://nytimes.com/wirecutter/art-preservation`,
      sourceDomain: `nytimes.com`
    },
    {
      question: `Can you hang ${cleanKeyword} without damaging the wall?`,
      answerSnippet: `Yes. Use adhesive picture-hanging strips (such as Command strips rated for frame weights), washi tape for unmounted lightweight prints, or magnetic wooden poster hanger rails with single hanging nails.`,
      sourceTitle: `How to Hang Art Without Damaging Walls`,
      sourceUrl: `https://pinterest.com/pin/hanging-guides`,
      sourceDomain: `pinterest.com`
    }
  ];

  // Knowledge Panel
  const knowledgePanel = cleanKeyword.includes('poster') || cleanKeyword.includes('art') ? {
    title: titleCaseQuery,
    subtitle: 'Visual Art & Wall Decor Category',
    description: `${titleCaseQuery} encompasses printed artistic or photographic representations created for visual aesthetic appreciation, cultural commemoration, or interior architectural decoration.`,
    attributes: [
      { label: 'Standard Mediums', value: 'Archival Giclée, Silk Screen, Lithograph' },
      { label: 'Typical Substrates', value: 'Matte Rag Paper, Canvas, Metal' },
      { label: 'Standard Sizes', value: 'A3, A2, A1, 18x24", 24x36"' },
      { label: 'Popular Eras', value: 'Mid-Century Modern, Art Deco, Bauhaus, Retro' }
    ],
    wikiUrl: `https://en.wikipedia.org/wiki/Poster`
  } : undefined;

  // Video items
  const videos = [
    {
      title: `How to Choose & Frame ${titleCaseQuery} Like a Pro`,
      source: 'YouTube',
      duration: '8:42',
      channel: 'Studio Interior Design',
      uploadedDate: '3 weeks ago',
      url: 'https://youtube.com/watch?v=sample1'
    },
    {
      title: `Print Quality Comparison: Giclée vs Poster Paper`,
      source: 'YouTube',
      duration: '12:15',
      channel: 'Printmaking Masterclass',
      uploadedDate: '2 months ago',
      url: 'https://youtube.com/watch?v=sample2'
    }
  ];

  // Related Searches
  const relatedSearches = [
    `${keyword} framed`,
    `${keyword} for living room`,
    `best place to buy ${keyword}`,
    `affordable ${keyword} online`,
    `${keyword} aesthetic vintage`,
    `large format ${keyword}`,
    `${keyword} sizes guide`,
    `minimalist ${keyword} collection`
  ];

  const userResult = organicResults.find(r => r.isUserDomain);

  return {
    query: {
      keyword,
      engine,
      country,
      device,
      language
    },
    searchVolume: roundedVolume,
    cpc,
    difficulty,
    totalOrganicResults: 2450000 + (Math.abs(hashCode(cleanKeyword)) % 5000000),
    searchTimeSeconds: +(0.28 + (Math.abs(hashCode(cleanKeyword)) % 15) / 100).toFixed(2),
    timestamp: new Date().toISOString(),
    featuredSnippet,
    peopleAlsoAsk,
    knowledgePanel,
    videos,
    relatedSearches,
    organicResults,
    userRanking: userResult ? {
      rank: userResult.rank,
      url: userResult.url,
      trafficShare: userResult.estimatedTraffic
    } : undefined
  };
}

/**
 * Simple deterministic hash for stable simulated metrics
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
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

/**
 * Handles POST /api/serp requests
 */
export async function handleSerpRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
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

  let body: SerpRequestBody;
  try {
    body = await readJsonBody<SerpRequestBody>(req);
  } catch (err: any) {
    sendJson(res, 400, { ok: false, error: err.message });
    return;
  }

  if (!body.keyword || !body.keyword.trim()) {
    sendJson(res, 400, { ok: false, error: 'Missing required parameter "keyword".' });
    return;
  }

  try {
    const result = generateSerpResults(
      body.keyword,
      body.engine || 'google',
      body.country || 'US',
      body.device || 'desktop',
      body.language || 'en'
    );

    sendJson(res, 200, {
      ok: true,
      data: result
    });
  } catch (err: any) {
    sendJson(res, 500, {
      ok: false,
      error: `Failed to process SERP query: ${err.message}`
    });
  }
}
