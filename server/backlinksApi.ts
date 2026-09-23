import type { IncomingMessage, ServerResponse } from 'http';

interface BacklinkRequestBody {
  domain?: string;
  filter?: 'all' | 'active' | 'dofollow' | 'nofollow' | 'toxic' | 'lost' | 'new' | 'disavowed';
  minDr?: number;
  linkType?: string;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  disavowList?: string[];
}

function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
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

function sendJson(res: ServerResponse, statusCode: number, data: any): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

/**
 * Builds realistic curated backlink dataset for PostersCraft
 */
function getPostersCraftData(disavowList: string[] = []) {
  const isDomainDisavowed = (dom: string) => 
    disavowList.some(d => d.toLowerCase() === dom.toLowerCase() || d.toLowerCase() === `domain:${dom.toLowerCase()}`);

  const rawBacklinks = [
    {
      id: 'bl-01',
      sourceUrl: 'https://interiorarchitects.design/top-vintage-wall-art-studios-2026',
      sourceTitle: 'Top 10 Vintage Wall Art Studios & Printmakers of 2026',
      sourceDr: 76,
      sourceUr: 52,
      sourceTraffic: 48500,
      targetUrl: 'https://posterscraft.com/collections/vintage-movie-posters',
      anchorText: 'PostersCraft vintage collection',
      contextSnippet: 'For authentic lithograph reproductions, the PostersCraft vintage collection offers museum-grade giclée prints on heavy archival cotton rag.',
      linkType: 'dofollow' as const,
      firstSeen: '2025-11-12T09:15:00Z',
      lastSeen: '2026-09-20T14:30:00Z',
      status: 'active' as const,
      spamScore: 2,
      isToxic: false,
      ipAddress: '104.21.54.89'
    },
    {
      id: 'bl-02',
      sourceUrl: 'https://cinemaphile.org/restoration-of-classic-noir-film-posters',
      sourceTitle: 'Archiving and Preserving 1940s Noir Graphic Design',
      sourceDr: 68,
      sourceUr: 44,
      sourceTraffic: 22100,
      targetUrl: 'https://posterscraft.com/blog/guide-to-film-noir-posters',
      anchorText: 'meticulously restored film noir prints',
      contextSnippet: 'Collectors seeking high fidelity reproductions should review these meticulously restored film noir prints with original typographic accents.',
      linkType: 'dofollow' as const,
      firstSeen: '2026-01-08T11:20:00Z',
      lastSeen: '2026-09-21T08:12:00Z',
      status: 'active' as const,
      spamScore: 1,
      isToxic: false,
      ipAddress: '172.67.198.34'
    },
    {
      id: 'bl-03',
      sourceUrl: 'https://dwell.com/article/minimalist-living-room-retro-posters-guide',
      sourceTitle: 'How to Style Mid-Century Living Spaces with Retro Cinema Art',
      sourceDr: 88,
      sourceUr: 64,
      sourceTraffic: 1450000,
      targetUrl: 'https://posterscraft.com',
      anchorText: 'posterscraft.com',
      contextSnippet: 'To balance warm wood tones, interior stylist Elena Vance sources bespoke framed artwork directly from posterscraft.com for private residential projects.',
      linkType: 'nofollow' as const,
      firstSeen: '2026-03-14T16:45:00Z',
      lastSeen: '2026-09-22T19:00:00Z',
      status: 'active' as const,
      spamScore: 0,
      isToxic: false,
      ipAddress: '151.101.65.140'
    },
    {
      id: 'bl-04',
      sourceUrl: 'https://reddit.com/r/MoviePosterPorn/comments/vintage_sci_fi_prints',
      sourceTitle: 'Where can I find high-res Metropolis (1927) French release posters?',
      sourceDr: 94,
      sourceUr: 71,
      sourceTraffic: 82000000,
      targetUrl: 'https://posterscraft.com/posters/metropolis-1927-rare-edition',
      anchorText: 'PostersCraft',
      contextSnippet: 'Check out PostersCraft, they have the high resolution Heinz Schulz-Neudamm Metropolis scan without the blurry digital artifacting.',
      linkType: 'ugc' as const,
      firstSeen: '2026-04-02T22:11:00Z',
      lastSeen: '2026-09-18T10:45:00Z',
      status: 'active' as const,
      spamScore: 4,
      isToxic: false,
      ipAddress: '151.101.1.140'
    },
    {
      id: 'bl-05',
      sourceUrl: 'https://artandobject.com/market-watch/record-demand-vintage-travel-lithographs',
      sourceTitle: 'Record Market Demand for Vintage Travel & Railway Lithographs',
      sourceDr: 71,
      sourceUr: 49,
      sourceTraffic: 84000,
      targetUrl: 'https://posterscraft.com/collections/vintage-travel-prints',
      anchorText: 'vintage travel posters',
      contextSnippet: 'With original Swiss railway posters commanding five figures at Sotheby’s, authentic reproduction studios specializing in vintage travel posters have seen surging interest.',
      linkType: 'dofollow' as const,
      firstSeen: '2025-10-05T08:00:00Z',
      lastSeen: '2026-09-19T13:25:00Z',
      status: 'active' as const,
      spamScore: 3,
      isToxic: false,
      ipAddress: '104.26.12.77'
    },
    {
      id: 'bl-06',
      sourceUrl: 'https://creativebloq.com/features/inspirational-typographic-posters',
      sourceTitle: '25 Inspiring Typographic Posters Every Graphic Designer Must See',
      sourceDr: 86,
      sourceUr: 59,
      sourceTraffic: 920000,
      targetUrl: 'https://posterscraft.com/collections/bauhaus-typography',
      anchorText: 'Bauhaus typography collection',
      contextSnippet: 'Explore the definitive Bauhaus typography collection illustrating Jan Tschichold’s groundbreaking elementary layout principles.',
      linkType: 'dofollow' as const,
      firstSeen: '2026-02-18T14:10:00Z',
      lastSeen: '2026-09-22T06:40:00Z',
      status: 'active' as const,
      spamScore: 1,
      isToxic: false,
      ipAddress: '199.232.41.133'
    },
    {
      id: 'bl-07',
      sourceUrl: 'https://medium.com/@designspotlight/best-places-to-buy-indie-wall-art-online',
      sourceTitle: 'Curators Guide: Where to Buy High-Quality Art Prints for Your Home',
      sourceDr: 92,
      sourceUr: 48,
      sourceTraffic: 45000000,
      targetUrl: 'https://posterscraft.com',
      anchorText: 'https://posterscraft.com',
      contextSnippet: 'For timeless cinema and modern minimalist designs, bookmark https://posterscraft.com for seasonal curated drops.',
      linkType: 'nofollow' as const,
      firstSeen: '2026-05-19T07:33:00Z',
      lastSeen: '2026-09-21T18:15:00Z',
      status: 'active' as const,
      spamScore: 3,
      isToxic: false,
      ipAddress: '162.159.153.4'
    },
    {
      id: 'bl-08',
      sourceUrl: 'https://vogue-living.au/spaces/melbourne-loft-retro-hollywood-aesthetic',
      sourceTitle: 'Inside a Dramatic Fitzroy Warehouse Loft Filled with Hollywood Relics',
      sourceDr: 81,
      sourceUr: 56,
      sourceTraffic: 310000,
      targetUrl: 'https://posterscraft.com/posters/casablanca-original-french',
      anchorText: 'Casablanca 1942 French release print',
      contextSnippet: 'The master bedroom features an oversized Casablanca 1942 French release print custom mounted in walnut framing.',
      linkType: 'dofollow' as const,
      firstSeen: '2026-06-01T12:00:00Z',
      lastSeen: '2026-09-20T21:40:00Z',
      status: 'active' as const,
      spamScore: 2,
      isToxic: false,
      ipAddress: '13.236.19.102'
    },
    {
      id: 'bl-09',
      sourceUrl: 'https://free-seo-backlink-farm-99.xyz/links/posters-craft-profile',
      sourceTitle: 'Instant Free Directory Links & Traffic Submitter 2026',
      sourceDr: 12,
      sourceUr: 8,
      sourceTraffic: 20,
      targetUrl: 'https://posterscraft.com',
      anchorText: 'cheap vintage posters online discount buy',
      contextSnippet: 'Affiliate casino free links: cheap vintage posters online discount buy click here for promo codes.',
      linkType: 'dofollow' as const,
      firstSeen: '2026-08-11T03:14:00Z',
      lastSeen: '2026-09-22T02:00:00Z',
      status: 'active' as const,
      spamScore: 84,
      isToxic: true,
      ipAddress: '185.220.101.5'
    },
    {
      id: 'bl-10',
      sourceUrl: 'https://scraper-bot-aggregator-network.biz/directory/posters',
      sourceTitle: 'Auto Scraped RSS Feeds & Link Rings Directory',
      sourceDr: 9,
      sourceUr: 6,
      sourceTraffic: 5,
      targetUrl: 'https://posterscraft.com/blog/vintage-framing-guide',
      anchorText: 'posterscraft framing tips',
      contextSnippet: 'Automated syndicated post from mirror: posterscraft framing tips full copy scraper archive.',
      linkType: 'dofollow' as const,
      firstSeen: '2026-07-28T04:22:00Z',
      lastSeen: '2026-09-21T01:10:00Z',
      status: 'active' as const,
      spamScore: 91,
      isToxic: true,
      ipAddress: '194.26.29.112'
    },
    {
      id: 'bl-11',
      sourceUrl: 'https://pbn-casino-crypto-matrix.top/portal/art',
      sourceTitle: 'Gambling Bets and Art Collections Index',
      sourceDr: 14,
      sourceUr: 11,
      sourceTraffic: 12,
      targetUrl: 'https://posterscraft.com',
      anchorText: 'online poster store',
      contextSnippet: 'Slot bonuses casino poker online poster store roulette jackpot cryptocurrency.',
      linkType: 'dofollow' as const,
      firstSeen: '2026-08-30T10:11:00Z',
      lastSeen: '2026-09-22T05:00:00Z',
      status: 'active' as const,
      spamScore: 78,
      isToxic: true,
      ipAddress: '45.154.255.88'
    },
    {
      id: 'bl-12',
      sourceUrl: 'https://vintagepostercollector.com/dealers/archive-2025',
      sourceTitle: 'Global Directory of Verified Vintage Printmakers & Dealers',
      sourceDr: 64,
      sourceUr: 39,
      sourceTraffic: 18400,
      targetUrl: 'https://posterscraft.com',
      anchorText: 'PostersCraft Studio',
      contextSnippet: 'Premier North American atelier: PostersCraft Studio for custom sizes and museum linen backing.',
      linkType: 'dofollow' as const,
      firstSeen: '2025-08-14T10:00:00Z',
      lastSeen: '2026-08-10T12:00:00Z',
      status: 'lost' as const,
      lostReason: 'Page 404 — Dealer directory restructured into membership database',
      spamScore: 4,
      isToxic: false,
      ipAddress: '172.67.211.90'
    },
    {
      id: 'bl-13',
      sourceUrl: 'https://harpersbazaar.com/culture/art-books/g4891/vintage-travel-posters-summer',
      sourceTitle: 'The Most Glamorous Vintage French Riviera Posters to Buy Now',
      sourceDr: 89,
      sourceUr: 62,
      sourceTraffic: 3200000,
      targetUrl: 'https://posterscraft.com/collections/french-riviera-prints',
      anchorText: 'French Riviera retro travel art',
      contextSnippet: 'Evoke the Golden Age of Cannes with French Riviera retro travel art rendered on 310gsm Hahnemühle paper.',
      linkType: 'sponsored' as const,
      firstSeen: '2026-07-15T15:20:00Z',
      lastSeen: '2026-09-22T14:10:00Z',
      status: 'new' as const,
      spamScore: 1,
      isToxic: false,
      ipAddress: '151.101.2.132'
    },
    {
      id: 'bl-14',
      sourceUrl: 'https://designmilk.com/modern-home-decor-vintage-film-art',
      sourceTitle: 'Fresh Finds: Curating High-Contrast Graphic Posters for Studio Living',
      sourceDr: 82,
      sourceUr: 55,
      sourceTraffic: 580000,
      targetUrl: 'https://posterscraft.com/collections/sci-fi-classics',
      anchorText: 'PostersCraft sci-fi edition',
      contextSnippet: 'We are particularly fond of the PostersCraft sci-fi edition featuring clean typography and retro futurist color palettes.',
      linkType: 'dofollow' as const,
      firstSeen: '2026-09-02T11:00:00Z',
      lastSeen: '2026-09-22T17:45:00Z',
      status: 'new' as const,
      spamScore: 2,
      isToxic: false,
      ipAddress: '104.21.32.14'
    }
  ];

  // Process disavow states
  const backlinks = rawBacklinks.map(bl => {
    const domainMatch = bl.sourceUrl.replace(/^https?:\/\//, '').split('/')[0];
    const isDisavowed = isDomainDisavowed(domainMatch) || disavowList.includes(bl.sourceUrl);
    return {
      ...bl,
      isDisavowed
    };
  });

  const referringDomains = [
    {
      domain: 'interiorarchitects.design',
      dr: 76,
      backlinkCount: 14,
      dofollowCount: 14,
      dofollowPercent: 100,
      traffic: 48500,
      category: 'Design & Architecture',
      countryCode: 'US',
      firstSeen: '2025-11-12',
      spamScore: 2,
      isToxic: false,
      isDisavowed: isDomainDisavowed('interiorarchitects.design'),
      status: 'active' as const
    },
    {
      domain: 'cinemaphile.org',
      dr: 68,
      backlinkCount: 8,
      dofollowCount: 8,
      dofollowPercent: 100,
      traffic: 22100,
      category: 'Film & Media',
      countryCode: 'US',
      firstSeen: '2026-01-08',
      spamScore: 1,
      isToxic: false,
      isDisavowed: isDomainDisavowed('cinemaphile.org'),
      status: 'active' as const
    },
    {
      domain: 'dwell.com',
      dr: 88,
      backlinkCount: 3,
      dofollowCount: 0,
      dofollowPercent: 0,
      traffic: 1450000,
      category: 'Home & Decor',
      countryCode: 'US',
      firstSeen: '2026-03-14',
      spamScore: 0,
      isToxic: false,
      isDisavowed: isDomainDisavowed('dwell.com'),
      status: 'active' as const
    },
    {
      domain: 'reddit.com',
      dr: 94,
      backlinkCount: 42,
      dofollowCount: 0,
      dofollowPercent: 0,
      traffic: 82000000,
      category: 'Community & Discussion',
      countryCode: 'US',
      firstSeen: '2025-06-10',
      spamScore: 4,
      isToxic: false,
      isDisavowed: isDomainDisavowed('reddit.com'),
      status: 'active' as const
    },
    {
      domain: 'artandobject.com',
      dr: 71,
      backlinkCount: 6,
      dofollowCount: 6,
      dofollowPercent: 100,
      traffic: 84000,
      category: 'Art & Auctions',
      countryCode: 'US',
      firstSeen: '2025-10-05',
      spamScore: 3,
      isToxic: false,
      isDisavowed: isDomainDisavowed('artandobject.com'),
      status: 'active' as const
    },
    {
      domain: 'creativebloq.com',
      dr: 86,
      backlinkCount: 5,
      dofollowCount: 5,
      dofollowPercent: 100,
      traffic: 920000,
      category: 'Graphic Design',
      countryCode: 'GB',
      firstSeen: '2026-02-18',
      spamScore: 1,
      isToxic: false,
      isDisavowed: isDomainDisavowed('creativebloq.com'),
      status: 'active' as const
    },
    {
      domain: 'medium.com',
      dr: 92,
      backlinkCount: 19,
      dofollowCount: 0,
      dofollowPercent: 0,
      traffic: 45000000,
      category: 'Publishing & Blogs',
      countryCode: 'US',
      firstSeen: '2025-09-14',
      spamScore: 3,
      isToxic: false,
      isDisavowed: isDomainDisavowed('medium.com'),
      status: 'active' as const
    },
    {
      domain: 'vogue-living.au',
      dr: 81,
      backlinkCount: 2,
      dofollowCount: 2,
      dofollowPercent: 100,
      traffic: 310000,
      category: 'Lifestyle & Luxury',
      countryCode: 'AU',
      firstSeen: '2026-06-01',
      spamScore: 2,
      isToxic: false,
      isDisavowed: isDomainDisavowed('vogue-living.au'),
      status: 'active' as const
    },
    {
      domain: 'designmilk.com',
      dr: 82,
      backlinkCount: 4,
      dofollowCount: 4,
      dofollowPercent: 100,
      traffic: 580000,
      category: 'Modern Design',
      countryCode: 'US',
      firstSeen: '2026-09-02',
      spamScore: 2,
      isToxic: false,
      isDisavowed: isDomainDisavowed('designmilk.com'),
      status: 'new' as const
    },
    {
      domain: 'harpersbazaar.com',
      dr: 89,
      backlinkCount: 2,
      dofollowCount: 0,
      dofollowPercent: 0,
      traffic: 3200000,
      category: 'Fashion & Culture',
      countryCode: 'US',
      firstSeen: '2026-07-15',
      spamScore: 1,
      isToxic: false,
      isDisavowed: isDomainDisavowed('harpersbazaar.com'),
      status: 'new' as const
    },
    {
      domain: 'free-seo-backlink-farm-99.xyz',
      dr: 12,
      backlinkCount: 8,
      dofollowCount: 8,
      dofollowPercent: 100,
      traffic: 20,
      category: 'Spam Directory',
      countryCode: 'RU',
      firstSeen: '2026-08-11',
      spamScore: 84,
      isToxic: true,
      isDisavowed: isDomainDisavowed('free-seo-backlink-farm-99.xyz'),
      status: 'active' as const
    },
    {
      domain: 'scraper-bot-aggregator-network.biz',
      dr: 9,
      backlinkCount: 4,
      dofollowCount: 4,
      dofollowPercent: 100,
      traffic: 5,
      category: 'Scraper Network',
      countryCode: 'SC',
      firstSeen: '2026-07-28',
      spamScore: 91,
      isToxic: true,
      isDisavowed: isDomainDisavowed('scraper-bot-aggregator-network.biz'),
      status: 'active' as const
    },
    {
      domain: 'pbn-casino-crypto-matrix.top',
      dr: 14,
      backlinkCount: 2,
      dofollowCount: 2,
      dofollowPercent: 100,
      traffic: 12,
      category: 'PBN / Gambling',
      countryCode: 'PA',
      firstSeen: '2026-08-30',
      spamScore: 78,
      isToxic: true,
      isDisavowed: isDomainDisavowed('pbn-casino-crypto-matrix.top'),
      status: 'active' as const
    }
  ];

  const anchors = [
    {
      anchor: 'PostersCraft',
      category: 'branded' as const,
      backlinksCount: 1192,
      referringDomainsCount: 131,
      percentage: 42.0,
      isOverOptimized: false
    },
    {
      anchor: 'posterscraft.com',
      category: 'naked' as const,
      backlinksCount: 312,
      referringDomainsCount: 45,
      percentage: 11.0,
      isOverOptimized: false
    },
    {
      anchor: 'vintage movie posters',
      category: 'exact' as const,
      backlinksCount: 454,
      referringDomainsCount: 52,
      percentage: 16.0,
      isOverOptimized: false // < 20% safe zone
    },
    {
      anchor: 'curated vintage movie prints',
      category: 'phrase' as const,
      backlinksCount: 398,
      referringDomainsCount: 41,
      percentage: 14.0,
      isOverOptimized: false
    },
    {
      anchor: 'Bauhaus typography collection',
      category: 'phrase' as const,
      backlinksCount: 255,
      referringDomainsCount: 28,
      percentage: 9.0,
      isOverOptimized: false
    },
    {
      anchor: 'visit website',
      category: 'generic' as const,
      backlinksCount: 142,
      referringDomainsCount: 15,
      percentage: 5.0,
      isOverOptimized: false
    },
    {
      anchor: 'online poster store',
      category: 'exact' as const,
      backlinksCount: 87,
      referringDomainsCount: 8,
      percentage: 3.0,
      isOverOptimized: false
    }
  ];

  const velocity = [
    { month: 'Oct 2025', newLinks: 120, lostLinks: 15, netGrowth: 105, referringDomains: 210 },
    { month: 'Nov 2025', newLinks: 165, lostLinks: 22, netGrowth: 143, referringDomains: 228 },
    { month: 'Dec 2025', newLinks: 190, lostLinks: 28, netGrowth: 162, referringDomains: 242 },
    { month: 'Jan 2026', newLinks: 210, lostLinks: 35, netGrowth: 175, referringDomains: 255 },
    { month: 'Feb 2026', newLinks: 245, lostLinks: 29, netGrowth: 216, referringDomains: 268 },
    { month: 'Mar 2026', newLinks: 280, lostLinks: 41, netGrowth: 239, referringDomains: 282 },
    { month: 'Apr 2026', newLinks: 230, lostLinks: 38, netGrowth: 192, referringDomains: 291 },
    { month: 'May 2026', newLinks: 260, lostLinks: 44, netGrowth: 216, referringDomains: 298 },
    { month: 'Jun 2026', newLinks: 310, lostLinks: 50, netGrowth: 260, referringDomains: 304 },
    { month: 'Jul 2026', newLinks: 275, lostLinks: 36, netGrowth: 239, referringDomains: 308 },
    { month: 'Aug 2026', newLinks: 290, lostLinks: 42, netGrowth: 248, referringDomains: 310 },
    { month: 'Sep 2026', newLinks: 325, lostLinks: 39, netGrowth: 286, referringDomains: 312 },
  ];

  const linkIntersect = [
    {
      domain: 'architecturaldigest.com',
      dr: 91,
      traffic: 4500000,
      category: 'Architecture & Living',
      competitorsLinking: [
        { domain: 'desenio.com', backlinksCount: 18 },
        { domain: 'posterstore.com', backlinksCount: 7 },
        { domain: 'allposters.com', backlinksCount: 24 }
      ],
      outreachPriority: 'high' as const,
      estimatedAuthorityImpact: '+2.8 DR Points'
    },
    {
      domain: 'thespruce.com',
      dr: 87,
      traffic: 8900000,
      category: 'Home Decor & DIY',
      competitorsLinking: [
        { domain: 'allposters.com', backlinksCount: 31 },
        { domain: 'society6.com', backlinksCount: 42 }
      ],
      outreachPriority: 'high' as const,
      estimatedAuthorityImpact: '+2.1 DR Points'
    },
    {
      domain: 'apartmenttherapy.com',
      dr: 85,
      traffic: 2800000,
      category: 'Small Spaces & Decor',
      competitorsLinking: [
        { domain: 'desenio.com', backlinksCount: 14 },
        { domain: 'society6.com', backlinksCount: 19 },
        { domain: 'posterstore.com', backlinksCount: 11 }
      ],
      outreachPriority: 'high' as const,
      estimatedAuthorityImpact: '+1.9 DR Points'
    },
    {
      domain: 'sightunseen.com',
      dr: 74,
      traffic: 120000,
      category: 'Modern Design Magazine',
      competitorsLinking: [
        { domain: 'desenio.com', backlinksCount: 6 },
        { domain: 'allposters.com', backlinksCount: 3 }
      ],
      outreachPriority: 'medium' as const,
      estimatedAuthorityImpact: '+1.2 DR Points'
    },
    {
      domain: 'popsci.com',
      dr: 89,
      traffic: 3400000,
      category: 'Science & Retro Futurism',
      competitorsLinking: [
        { domain: 'society6.com', backlinksCount: 12 },
        { domain: 'allposters.com', backlinksCount: 8 }
      ],
      outreachPriority: 'medium' as const,
      estimatedAuthorityImpact: '+1.5 DR Points'
    }
  ];

  const activeBacklinks = backlinks.filter(b => b.status === 'active').length;
  const lostBacklinks = backlinks.filter(b => b.status === 'lost').length;
  const newBacklinks = backlinks.filter(b => b.status === 'new').length;
  const toxicCount = backlinks.filter(b => b.isToxic && !b.isDisavowed).length;
  const disavowedCount = backlinks.filter(b => b.isDisavowed).length;

  const overview = {
    domain: 'posterscraft.com',
    dr: 48,
    ur: 36,
    totalBacklinks: 2840,
    activeBacklinks: 2520,
    lostBacklinks: 240,
    newBacklinks: 80,
    referringDomains: 312,
    referringIps: 284,
    referringSubnets: 210,
    dofollowRatio: 74,
    nofollowRatio: 21,
    ugcRatio: 4,
    sponsoredRatio: 1,
    toxicityScore: 6,
    toxicityRisk: 'low' as const,
    toxicBacklinksCount: 14,
    disavowedCount: disavowedCount,
    growthRatePercent: 8.4
  };

  return {
    overview,
    backlinks,
    referringDomains,
    anchors,
    velocity,
    linkIntersect,
    disavowList
  };
}

/**
 * Generates synthetic backlink profile for any arbitrary or scanned domain
 */
function generateSyntheticBacklinks(domain: string, disavowList: string[] = []) {
  const cleanDomain = domain.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
  
  if (cleanDomain === 'posterscraft.com') {
    return getPostersCraftData(disavowList);
  }

  // Derive deterministic hash from domain name for reproducible metrics
  let hash = 0;
  for (let i = 0; i < cleanDomain.length; i++) {
    hash = (hash << 5) - hash + cleanDomain.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const dr = 20 + (positiveHash % 55); // 20 - 75
  const ur = Math.max(12, dr - 10 + (positiveHash % 8));
  const referringDomainsCount = 45 + (positiveHash % 420);
  const totalBacklinksCount = referringDomainsCount * (3 + (positiveHash % 12));
  const dofollowRatio = 65 + (positiveHash % 25);
  const nofollowRatio = Math.max(5, 100 - dofollowRatio - 5);
  const ugcRatio = 3;
  const sponsoredRatio = 2;
  const toxicityScore = 3 + (positiveHash % 18);
  const toxicityRisk = toxicityScore > 20 ? 'medium' : 'low';

  const brandName = cleanDomain.split('.')[0];
  const capitalizedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1);

  const sampleBacklinks = [
    {
      id: `bl-${cleanDomain}-1`,
      sourceUrl: `https://techindustryinsights.com/reviews/${brandName}-analysis`,
      sourceTitle: `${capitalizedBrand} Full Platform Review and Capabilities`,
      sourceDr: Math.min(85, dr + 18),
      sourceUr: 42,
      sourceTraffic: 32000,
      targetUrl: `https://${cleanDomain}`,
      anchorText: capitalizedBrand,
      contextSnippet: `According to recent market benchmarks, ${capitalizedBrand} demonstrates superior crawl agility compared to legacy suites.`,
      linkType: 'dofollow' as const,
      firstSeen: '2026-02-10T10:00:00Z',
      lastSeen: '2026-09-22T08:00:00Z',
      status: 'active' as const,
      spamScore: 2,
      isToxic: false,
      isDisavowed: disavowList.includes('techindustryinsights.com')
    },
    {
      id: `bl-${cleanDomain}-2`,
      sourceUrl: `https://digitalmarketerradar.io/top-tools-2026`,
      sourceTitle: 'Essential Digital Marketing Stacks for Enterprise Growth',
      sourceDr: Math.min(90, dr + 24),
      sourceUr: 58,
      sourceTraffic: 89000,
      targetUrl: `https://${cleanDomain}/features`,
      anchorText: `visit ${cleanDomain}`,
      contextSnippet: `For immediate testing and verification pipelines, visit ${cleanDomain} to inspect live indexation health.`,
      linkType: 'dofollow' as const,
      firstSeen: '2026-03-15T14:30:00Z',
      lastSeen: '2026-09-21T16:00:00Z',
      status: 'active' as const,
      spamScore: 1,
      isToxic: false,
      isDisavowed: disavowList.includes('digitalmarketerradar.io')
    },
    {
      id: `bl-${cleanDomain}-3`,
      sourceUrl: `https://spammy-free-backlink-bot.xyz/domain/${cleanDomain}`,
      sourceTitle: 'Instant Free Ping & Backlink Generator',
      sourceDr: 8,
      sourceUr: 4,
      sourceTraffic: 10,
      targetUrl: `https://${cleanDomain}`,
      anchorText: `${cleanDomain} free download click`,
      contextSnippet: `Free automated index listing: ${cleanDomain} free download click here for premium promo rank.`,
      linkType: 'dofollow' as const,
      firstSeen: '2026-08-14T03:00:00Z',
      lastSeen: '2026-09-22T04:12:00Z',
      status: 'active' as const,
      spamScore: 89,
      isToxic: true,
      isDisavowed: disavowList.includes('spammy-free-backlink-bot.xyz')
    },
    {
      id: `bl-${cleanDomain}-4`,
      sourceUrl: `https://industrydigest.net/roundup/september`,
      sourceTitle: 'Industry Digest: September Innovation Spotlight',
      sourceDr: Math.min(80, dr + 12),
      sourceUr: 46,
      sourceTraffic: 41000,
      targetUrl: `https://${cleanDomain}`,
      anchorText: `${capitalizedBrand} official site`,
      contextSnippet: `Read the verified case study on ${capitalizedBrand} official site for architectural benchmarks.`,
      linkType: 'dofollow' as const,
      firstSeen: '2026-09-01T12:00:00Z',
      lastSeen: '2026-09-22T11:00:00Z',
      status: 'new' as const,
      spamScore: 3,
      isToxic: false,
      isDisavowed: disavowList.includes('industrydigest.net')
    }
  ];

  const sampleReferringDomains = [
    {
      domain: 'techindustryinsights.com',
      dr: Math.min(85, dr + 18),
      backlinkCount: 6,
      dofollowCount: 6,
      dofollowPercent: 100,
      traffic: 32000,
      category: 'Technology & SaaS',
      countryCode: 'US',
      firstSeen: '2026-02-10',
      spamScore: 2,
      isToxic: false,
      isDisavowed: disavowList.includes('techindustryinsights.com'),
      status: 'active' as const
    },
    {
      domain: 'digitalmarketerradar.io',
      dr: Math.min(90, dr + 24),
      backlinkCount: 4,
      dofollowCount: 4,
      dofollowPercent: 100,
      traffic: 89000,
      category: 'Marketing & SEO',
      countryCode: 'GB',
      firstSeen: '2026-03-15',
      spamScore: 1,
      isToxic: false,
      isDisavowed: disavowList.includes('digitalmarketerradar.io'),
      status: 'active' as const
    },
    {
      domain: 'industrydigest.net',
      dr: Math.min(80, dr + 12),
      backlinkCount: 3,
      dofollowCount: 3,
      dofollowPercent: 100,
      traffic: 41000,
      category: 'Business & News',
      countryCode: 'US',
      firstSeen: '2026-09-01',
      spamScore: 3,
      isToxic: false,
      isDisavowed: disavowList.includes('industrydigest.net'),
      status: 'new' as const
    },
    {
      domain: 'spammy-free-backlink-bot.xyz',
      dr: 8,
      backlinkCount: 12,
      dofollowCount: 12,
      dofollowPercent: 100,
      traffic: 10,
      category: 'Automated Spam Farm',
      countryCode: 'RU',
      firstSeen: '2026-08-14',
      spamScore: 89,
      isToxic: true,
      isDisavowed: disavowList.includes('spammy-free-backlink-bot.xyz'),
      status: 'active' as const
    }
  ];

  const sampleAnchors = [
    {
      anchor: capitalizedBrand,
      category: 'branded' as const,
      backlinksCount: Math.round(totalBacklinksCount * 0.44),
      referringDomainsCount: Math.round(referringDomainsCount * 0.40),
      percentage: 44.0,
      isOverOptimized: false
    },
    {
      anchor: cleanDomain,
      category: 'naked' as const,
      backlinksCount: Math.round(totalBacklinksCount * 0.22),
      referringDomainsCount: Math.round(referringDomainsCount * 0.25),
      percentage: 22.0,
      isOverOptimized: false
    },
    {
      anchor: `${capitalizedBrand} services`,
      category: 'phrase' as const,
      backlinksCount: Math.round(totalBacklinksCount * 0.18),
      referringDomainsCount: Math.round(referringDomainsCount * 0.20),
      percentage: 18.0,
      isOverOptimized: false
    },
    {
      anchor: 'visit official site',
      category: 'generic' as const,
      backlinksCount: Math.round(totalBacklinksCount * 0.10),
      referringDomainsCount: Math.round(referringDomainsCount * 0.10),
      percentage: 10.0,
      isOverOptimized: false
    },
    {
      anchor: 'best online platform',
      category: 'exact' as const,
      backlinksCount: Math.round(totalBacklinksCount * 0.06),
      referringDomainsCount: Math.round(referringDomainsCount * 0.05),
      percentage: 6.0,
      isOverOptimized: false
    }
  ];

  const sampleVelocity = [
    { month: 'Apr 2026', newLinks: 24, lostLinks: 5, netGrowth: 19, referringDomains: Math.max(10, referringDomainsCount - 35) },
    { month: 'May 2026', newLinks: 31, lostLinks: 6, netGrowth: 25, referringDomains: Math.max(15, referringDomainsCount - 26) },
    { month: 'Jun 2026', newLinks: 42, lostLinks: 8, netGrowth: 34, referringDomains: Math.max(20, referringDomainsCount - 18) },
    { month: 'Jul 2026', newLinks: 38, lostLinks: 7, netGrowth: 31, referringDomains: Math.max(25, referringDomainsCount - 12) },
    { month: 'Aug 2026', newLinks: 45, lostLinks: 9, netGrowth: 36, referringDomains: Math.max(30, referringDomainsCount - 5) },
    { month: 'Sep 2026', newLinks: 52, lostLinks: 6, netGrowth: 46, referringDomains: referringDomainsCount },
  ];

  const sampleIntersect = [
    {
      domain: 'searchengineland.com',
      dr: 90,
      traffic: 3100000,
      category: 'Search & SEO Media',
      competitorsLinking: [
        { domain: 'competitor1.com', backlinksCount: 22 },
        { domain: 'competitor2.com', backlinksCount: 14 }
      ],
      outreachPriority: 'high' as const,
      estimatedAuthorityImpact: '+3.2 DR Points'
    },
    {
      domain: 'hubspot.com',
      dr: 93,
      traffic: 18500000,
      category: 'Inbound Marketing Hub',
      competitorsLinking: [
        { domain: 'competitor1.com', backlinksCount: 35 },
        { domain: 'competitor2.com', backlinksCount: 29 }
      ],
      outreachPriority: 'high' as const,
      estimatedAuthorityImpact: '+3.8 DR Points'
    }
  ];

  const overview = {
    domain: cleanDomain,
    dr,
    ur,
    totalBacklinks: totalBacklinksCount,
    activeBacklinks: Math.round(totalBacklinksCount * 0.90),
    lostBacklinks: Math.round(totalBacklinksCount * 0.07),
    newBacklinks: Math.round(totalBacklinksCount * 0.03),
    referringDomains: referringDomainsCount,
    referringIps: Math.round(referringDomainsCount * 0.92),
    referringSubnets: Math.round(referringDomainsCount * 0.75),
    dofollowRatio,
    nofollowRatio,
    ugcRatio,
    sponsoredRatio,
    toxicityScore,
    toxicityRisk: toxicityRisk as any,
    toxicBacklinksCount: Math.round(totalBacklinksCount * (toxicityScore / 100)),
    disavowedCount: disavowList.length,
    growthRatePercent: 7.2
  };

  return {
    overview,
    backlinks: sampleBacklinks,
    referringDomains: sampleReferringDomains,
    anchors: sampleAnchors,
    velocity: sampleVelocity,
    linkIntersect: sampleIntersect,
    disavowList
  };
}

/**
 * Handles POST /api/backlinks requests
 */
export async function handleBacklinksRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
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

  let body: BacklinkRequestBody;
  try {
    body = await readJsonBody<BacklinkRequestBody>(req);
  } catch (err: any) {
    sendJson(res, 400, { ok: false, error: err.message });
    return;
  }

  const domain = (body.domain || 'posterscraft.com').toLowerCase().trim();
  const disavowList = body.disavowList || [];

  const rawData = generateSyntheticBacklinks(domain, disavowList);

  // Apply filters if provided
  let filteredBacklinks = [...rawData.backlinks];

  if (body.filter === 'active') {
    filteredBacklinks = filteredBacklinks.filter(b => b.status === 'active');
  } else if (body.filter === 'dofollow') {
    filteredBacklinks = filteredBacklinks.filter(b => b.linkType === 'dofollow');
  } else if (body.filter === 'nofollow') {
    filteredBacklinks = filteredBacklinks.filter(b => b.linkType === 'nofollow');
  } else if (body.filter === 'toxic') {
    filteredBacklinks = filteredBacklinks.filter(b => b.isToxic);
  } else if (body.filter === 'lost') {
    filteredBacklinks = filteredBacklinks.filter(b => b.status === 'lost');
  } else if (body.filter === 'new') {
    filteredBacklinks = filteredBacklinks.filter(b => b.status === 'new');
  } else if (body.filter === 'disavowed') {
    filteredBacklinks = filteredBacklinks.filter(b => b.isDisavowed);
  }

  if (body.linkType && body.linkType !== 'all') {
    filteredBacklinks = filteredBacklinks.filter(b => b.linkType === body.linkType);
  }

  if (body.minDr !== undefined && body.minDr > 0) {
    filteredBacklinks = filteredBacklinks.filter(b => b.sourceDr >= (body.minDr || 0));
  }

  if (body.search) {
    const q = body.search.toLowerCase().trim();
    filteredBacklinks = filteredBacklinks.filter(b =>
      b.sourceUrl.toLowerCase().includes(q) ||
      b.sourceTitle.toLowerCase().includes(q) ||
      b.anchorText.toLowerCase().includes(q) ||
      b.targetUrl.toLowerCase().includes(q)
    );
  }

  // Apply sorting
  if (body.sortBy) {
    const dir = body.sortDir === 'asc' ? 1 : -1;
    filteredBacklinks.sort((a, b) => {
      if (body.sortBy === 'dr') return (a.sourceDr - b.sourceDr) * dir;
      if (body.sortBy === 'ur') return (a.sourceUr - b.sourceUr) * dir;
      if (body.sortBy === 'traffic') return (a.sourceTraffic - b.sourceTraffic) * dir;
      if (body.sortBy === 'spamScore') return (a.spamScore - b.spamScore) * dir;
      if (body.sortBy === 'firstSeen') return (new Date(a.firstSeen).getTime() - new Date(b.firstSeen).getTime()) * dir;
      return 0;
    });
  }

  sendJson(res, 200, {
    ok: true,
    data: {
      ...rawData,
      backlinks: filteredBacklinks
    }
  });
}
