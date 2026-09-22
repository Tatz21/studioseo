import { 
  SerpAnalysisResponse, 
  SerpVolatilityData, 
  SerpOpportunityItem, 
  SerpQuery 
} from './types';

const STORAGE_KEY_RECENT_SERP = 'seo_studio_serp_recent_queries';

export class SerpStore {
  /**
   * Google Algorithm Volatility Radar / Weather Sensor Data
   */
  static getVolatilityData(): SerpVolatilityData {
    return {
      overallScore: 7.4,
      status: 'high',
      date: 'March 22, 2026',
      history14Days: [
        { date: 'Mar 09', score: 4.2 },
        { date: 'Mar 10', score: 4.5 },
        { date: 'Mar 11', score: 3.9 },
        { date: 'Mar 12', score: 5.1 },
        { date: 'Mar 13', score: 5.8 },
        { date: 'Mar 14', score: 6.2 },
        { date: 'Mar 15', score: 8.6 },
        { date: 'Mar 16', score: 9.1 },
        { date: 'Mar 17', score: 8.9 },
        { date: 'Mar 18', score: 7.8 },
        { date: 'Mar 19', score: 7.2 },
        { date: 'Mar 20', score: 6.9 },
        { date: 'Mar 21', score: 7.1 },
        { date: 'Mar 22', score: 7.4 }
      ],
      categories: [
        { category: 'Arts & Entertainment', volatility: 8.2, delta: +0.4, status: 'storm' },
        { category: 'Retail & E-commerce', volatility: 7.8, delta: +0.2, status: 'high' },
        { category: 'Computers & Electronics', volatility: 7.1, delta: -0.3, status: 'high' },
        { category: 'Home & Garden / Decor', volatility: 7.5, delta: +0.5, status: 'high' },
        { category: 'Finance & Law', volatility: 5.4, delta: -0.2, status: 'normal' },
        { category: 'Health & Medical', volatility: 4.8, delta: -0.1, status: 'normal' }
      ],
      recentUpdates: [
        {
          id: 'update-core-mar-2026',
          date: 'March 14, 2026',
          name: 'Google March 2026 Core Algorithm Update',
          severity: 'critical',
          impactDescription: 'Broad core ranking update refining deep topical authority, user satisfaction signals, and reduction of automated unoriginal content across retail and review publishers.',
          confirmedByGoogle: true,
          categoriesImpacted: ['Retail', 'Arts & Entertainment', 'Affiliate Reviews']
        },
        {
          id: 'update-helpful-content-feb',
          date: 'February 22, 2026',
          name: 'Helpful Content & First-Hand Experience Refresh',
          severity: 'high',
          impactDescription: 'Strengthened emphasis on author credentials, original photography, and verifiable physical craftsmanship evidence for specialty craft & merchandise creators.',
          confirmedByGoogle: true,
          categoriesImpacted: ['E-commerce', 'Home Decor', 'Lifestyle']
        },
        {
          id: 'update-spam-jan-2026',
          date: 'January 18, 2026',
          name: 'Google Scaled Content & Spam Update',
          severity: 'medium',
          impactDescription: 'Aggressive de-indexing and algorithmic suppression of thin AI-generated directory pages and programmatic keyword stuffing networks.',
          confirmedByGoogle: true,
          categoriesImpacted: ['Directories', 'Aggregators']
        }
      ]
    };
  }

  /**
   * Actionable SERP Feature Opportunity Matrix
   */
  static getOpportunityMatrix(): SerpOpportunityItem[] {
    return [
      {
        id: 'opp-1',
        keyword: 'vintage movie posters',
        searchVolume: 18100,
        feature: 'Featured Snippet',
        currentOwner: 'etsy.com',
        userRank: 4,
        opportunityType: 'Capture Snippet',
        difficulty: 'Low',
        potentialTrafficGain: '+2,400 monthly visits',
        actionableSteps: [
          'Add a concise 42-word definition paragraph under an <h2> tag formatted as: "What is an authentic vintage movie poster?".',
          'Include a structured comparison table outlining 1950s-1980s lithograph dimensions vs modern re-strikes.',
          'Inject Question/Answer Schema (FAQPage JSON-LD) directly referencing print preservation and authentication.'
        ]
      },
      {
        id: 'opp-2',
        keyword: 'minimalist art prints',
        searchVolume: 14200,
        feature: 'People Also Ask',
        currentOwner: 'Various (Competitors)',
        userRank: 6,
        opportunityType: 'Add FAQ Schema',
        difficulty: 'Low',
        potentialTrafficGain: '+1,150 monthly visits',
        actionableSteps: [
          'Answer "What paper finish is best for minimalist art prints?" with a direct 35-word summary recommending matte archival 250gsm.',
          'Answer "How do you frame minimalist prints without glare?" citing anti-reflective UV acrylic sheets.',
          'Ensure FAQ questions are wrapped in standard Schema.org FAQPage microdata.'
        ]
      },
      {
        id: 'opp-3',
        keyword: 'custom framed posters',
        searchVolume: 9900,
        feature: 'Review Stars',
        currentOwner: 'amazon.com',
        userRank: 5,
        opportunityType: 'Review Markup',
        difficulty: 'Low',
        potentialTrafficGain: '+850 monthly visits',
        actionableSteps: [
          'Embed Product Schema with aggregateRating (ratingValue: 4.9, reviewCount: 420).',
          'Ensure individual reviewer names and review dates are declared in the JSON-LD tree.',
          'Verify priceValidUntil and inStock availability flags in Google Rich Results Test.'
        ]
      },
      {
        id: 'opp-4',
        keyword: 'canvas art online',
        searchVolume: 22400,
        feature: 'Video Carousel',
        currentOwner: 'YouTube Creators',
        userRank: 8,
        opportunityType: 'Video Indexing',
        difficulty: 'Medium',
        potentialTrafficGain: '+1,800 monthly visits',
        actionableSteps: [
          'Publish and embed a 3-minute studio walkthrough showing canvas tensioning, kiln-dried pine stretcher bars, and giclée printing.',
          'Add VideoObject Schema markup with uploadDate, transcript, thumbnail, and duration.',
          'Include exact chapter timestamps in the YouTube description corresponding to "Canvas Stretcher Bars" and "Hanging Hardware".'
        ]
      },
      {
        id: 'opp-5',
        keyword: 'buy retro posters online',
        searchVolume: 6700,
        feature: 'Sitelinks',
        currentOwner: 'allposters.com',
        userRank: 7,
        opportunityType: 'Table Optimization',
        difficulty: 'Medium',
        potentialTrafficGain: '+620 monthly visits',
        actionableSteps: [
          'Add high-contrast category sub-links in the page header with clean anchor text: "1970s Retro", "Sci-Fi Vintage", "Mid-Century Travel".',
          'Verify internal breadcrumb hierarchy is annotated with BreadcrumbList JSON-LD.',
          'Ensure primary category landing pages have clear 301 redirects and self-referencing canonical tags.'
        ]
      }
    ];
  }

  /**
   * Pre-computed realistic seed data for primary project keywords
   */
  static getSeedSerpData(query: SerpQuery): SerpAnalysisResponse {
    const clean = query.keyword.toLowerCase().trim();
    const isEtsySnippet = clean.includes('vintage') || clean.includes('poster');

    return {
      query,
      searchVolume: clean.includes('movie') ? 18100 : clean.includes('minimalist') ? 14200 : 9900,
      cpc: 2.15,
      difficulty: 42,
      totalOrganicResults: 3840000,
      searchTimeSeconds: 0.31,
      timestamp: new Date().toISOString(),
      featuredSnippet: {
        type: 'paragraph',
        title: `What defines authentic ${query.keyword}?`,
        content: `Authentic ${query.keyword} are distinguished by archival pigment inks (giclée printing) on heavy 230–300 gsm acid-free cotton rag or alpha-cellulose paper. Unlike mass commercial offset prints, archival art prints resist UV fading for 80+ years and reproduce deep dynamic contrast ratios.`,
        sourceTitle: `A Complete Guide to Print Quality & Paper Weight`,
        sourceUrl: `https://${isEtsySnippet ? 'etsy.com' : 'nytimes.com'}/art-guide`,
        sourceDomain: isEtsySnippet ? 'etsy.com' : 'nytimes.com',
        ownedByUser: false
      },
      peopleAlsoAsk: [
        {
          question: `What paper weight is best for ${query.keyword}?`,
          answerSnippet: `A weight between 200 and 250 gsm (grams per square meter) is ideal for everyday wall art posters, while fine art giclée prints typically use 280 to 310 gsm fine art paper to prevent warping and ensure structural rigidity.`,
          sourceTitle: `Paper Weights Explained - PostersCraft Knowledge Base`,
          sourceUrl: `https://posterscraft.com/guides/paper-weight`,
          sourceDomain: `posterscraft.com`
        },
        {
          question: `How do you frame ${query.keyword} without glare?`,
          answerSnippet: `Use non-glare museum-grade acrylic glass or anti-reflective UV-filtering glass. These coatings diffuse harsh room reflections while allowing 98% light transmission without color distortion.`,
          sourceTitle: `Art Framing & Non-Glare Glazing Guide`,
          sourceUrl: `https://posterscraft.com/framing/anti-reflective-glass`,
          sourceDomain: `posterscraft.com`
        },
        {
          question: `What are the most popular sizes for ${query.keyword}?`,
          answerSnippet: `The most common standard frame sizes are 12x18 inches (30x45cm), 18x24 inches (45x60cm), 24x36 inches (60x90cm), and international A-series formats (A4, A3, A2, A1).`,
          sourceTitle: `Standard Frame Sizes & Print Dimensions`,
          sourceUrl: `https://allposters.com/frame-sizes`,
          sourceDomain: `allposters.com`
        },
        {
          question: `How do I prevent prints from warping in humid rooms?`,
          answerSnippet: `Mount the print to an acid-free foam backing board using linen tape hinging, and ensure the back of the frame is sealed with archival backing paper to block ambient moisture and environmental dust.`,
          sourceTitle: `Preserving Wall Art: Sunlight & Moisture Protection`,
          sourceUrl: `https://nytimes.com/wirecutter/art-preservation`,
          sourceDomain: `nytimes.com`
        }
      ],
      knowledgePanel: {
        title: query.keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        subtitle: 'Art, Home Decor & Visual Print Category',
        description: `${query.keyword} represents printed artistic or cultural works designed for aesthetic appreciation, interior styling, and wall decoration.`,
        attributes: [
          { label: 'Standard Mediums', value: 'Archival Giclée, Screenprint, Lithograph' },
          { label: 'Substrates', value: 'Acid-Free Matte Paper, Canvas' },
          { label: 'Standard Sizes', value: '18x24", 24x36", A2, A1' },
          { label: 'Popular Styles', value: 'Bauhaus, Mid-Century Modern, Vintage Retro' }
        ],
        wikiUrl: 'https://en.wikipedia.org/wiki/Poster'
      },
      videos: [
        {
          title: `How to Choose & Frame ${query.keyword} Like a Designer`,
          source: 'YouTube',
          duration: '8:42',
          channel: 'Studio Interior Design',
          uploadedDate: '3 weeks ago',
          url: 'https://youtube.com'
        },
        {
          title: `Print Quality Comparison: Giclée vs Standard Poster Paper`,
          source: 'YouTube',
          duration: '12:15',
          channel: 'Printmaking Masterclass',
          uploadedDate: '2 months ago',
          url: 'https://youtube.com'
        }
      ],
      relatedSearches: [
        `${query.keyword} framed`,
        `${query.keyword} for living room`,
        `best place to buy ${query.keyword}`,
        `affordable ${query.keyword} online`,
        `large format ${query.keyword}`,
        `${query.keyword} sizes guide`
      ],
      organicResults: [
        {
          rank: 1,
          title: `${query.keyword} - Curated Handmade & Vintage Marketplace`,
          url: `https://etsy.com/market/${clean.replace(/\s+/g, '_')}`,
          domain: 'etsy.com',
          displayUrl: 'etsy.com › market › art',
          breadcrumbs: ['Etsy', 'Art & Wall Decor'],
          snippet: `Find unique handcrafted pieces directly from creators. Discover thousands of curated ${clean} options with free worldwide shipping available on select orders.`,
          datePublished: '2026-03-12',
          favicon: 'https://www.google.com/s2/favicons?domain=etsy.com&sz=32',
          badges: ['sitelinks', 'schema', 'stars', 'https'],
          rating: { value: 4.8, count: 14250 },
          sitelinks: [
            { title: 'Best Sellers', url: 'https://etsy.com' },
            { title: 'Customer Reviews', url: 'https://etsy.com' },
            { title: 'Handmade Framed', url: 'https://etsy.com' },
            { title: 'On Sale', url: 'https://etsy.com' }
          ],
          estimatedCtr: 27.6,
          estimatedTraffic: Math.round((18100 * 27.6) / 100),
          domainAuthorityScore: 92,
          isUserDomain: false
        },
        {
          rank: 2,
          title: `Amazon.com: ${query.keyword}`,
          url: `https://amazon.com/s?k=${encodeURIComponent(clean)}`,
          domain: 'amazon.com',
          displayUrl: 'amazon.com › Home & Kitchen',
          breadcrumbs: ['Amazon', 'Wall Art'],
          snippet: `Online shopping for ${query.keyword} from a great selection at Home & Kitchen Store. Fast Prime shipping, verified customer ratings, and flexible returns.`,
          datePublished: '2026-03-10',
          favicon: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32',
          badges: ['stars', 'schema', 'https'],
          rating: { value: 4.6, count: 28900 },
          estimatedCtr: 15.4,
          estimatedTraffic: Math.round((18100 * 15.4) / 100),
          domainAuthorityScore: 96,
          isUserDomain: false
        },
        {
          rank: 3,
          title: `${query.keyword} | Premium Gallery Prints & Frames — PostersCraft`,
          url: `https://posterscraft.com/collections/${clean.replace(/\s+/g, '-')}`,
          domain: 'posterscraft.com',
          displayUrl: `posterscraft.com › collections › ${clean.replace(/\s+/g, '-').slice(0, 15)}`,
          breadcrumbs: ['PostersCraft', 'Collections'],
          snippet: `Museum-grade ${clean} printed on 250gsm archival acid-free paper. UV-resistant pigment inks, solid wood framing, and expedited carbon-neutral delivery.`,
          datePublished: '2026-03-18',
          favicon: 'https://www.google.com/s2/favicons?domain=posterscraft.com&sz=32',
          badges: ['schema', 'faq', 'stars', 'https'],
          rating: { value: 4.9, count: 420 },
          estimatedCtr: 11.0,
          estimatedTraffic: Math.round((18100 * 11.0) / 100),
          domainAuthorityScore: 48,
          isUserDomain: true
        },
        {
          rank: 4,
          title: `${query.keyword} Prints, Framed Wall Art & Decor`,
          url: `https://allposters.com/-sp/${clean.replace(/\s+/g, '-')}-posters.htm`,
          domain: 'allposters.com',
          displayUrl: 'allposters.com › art-prints',
          breadcrumbs: ['AllPosters', 'Decor'],
          snippet: `Shop from over 1,000,000 prints, canvas and custom framed posters. 100% satisfaction guarantee with easy 30-day returns.`,
          datePublished: '2026-02-28',
          favicon: 'https://www.google.com/s2/favicons?domain=allposters.com&sz=32',
          badges: ['schema', 'https'],
          estimatedCtr: 8.2,
          estimatedTraffic: Math.round((18100 * 8.2) / 100),
          domainAuthorityScore: 78,
          isUserDomain: false
        },
        {
          rank: 5,
          title: `Affordable ${query.keyword} & Scandinavian Wall Art`,
          url: `https://posterstore.com/posters/${clean.replace(/\s+/g, '-')}`,
          domain: 'posterstore.com',
          displayUrl: 'posterstore.com › posters',
          breadcrumbs: ['Poster Store', 'Posters'],
          snippet: `Scandinavian design posters inspired by modern trends. Beautiful gallery walls, high quality matte paper, fast 2-4 day delivery.`,
          datePublished: '2026-03-01',
          favicon: 'https://www.google.com/s2/favicons?domain=posterstore.com&sz=32',
          badges: ['schema', 'https'],
          estimatedCtr: 6.1,
          estimatedTraffic: Math.round((18100 * 6.1) / 100),
          domainAuthorityScore: 68,
          isUserDomain: false
        },
        {
          rank: 6,
          title: `Best 500+ ${query.keyword} Ideas in 2026`,
          url: `https://pinterest.com/ideas/${clean.replace(/\s+/g, '-')}`,
          domain: 'pinterest.com',
          displayUrl: 'pinterest.com › ideas',
          breadcrumbs: ['Pinterest', 'Home Decor'],
          snippet: `Discover top ideas and inspiration for ${clean}. Find styling guides, interior room mockups, and color palette inspiration.`,
          datePublished: '2026-03-14',
          favicon: 'https://www.google.com/s2/favicons?domain=pinterest.com&sz=32',
          badges: ['video', 'https'],
          estimatedCtr: 4.8,
          estimatedTraffic: Math.round((18100 * 4.8) / 100),
          domainAuthorityScore: 94,
          isUserDomain: false
        },
        {
          rank: 7,
          title: `Where do you buy high quality ${clean}? : r/InteriorDesign`,
          url: `https://reddit.com/r/InteriorDesign/comments/best_${clean.replace(/\s+/g, '_')}`,
          domain: 'reddit.com',
          displayUrl: 'reddit.com › r › InteriorDesign',
          breadcrumbs: ['Reddit', 'r/InteriorDesign'],
          snippet: `Discussion and honest recommendations from community members on authentic print shops, paper thickness, framing options, and print longevity.`,
          datePublished: '2026-03-05',
          favicon: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=32',
          badges: ['author', 'https'],
          estimatedCtr: 3.9,
          estimatedTraffic: Math.round((18100 * 3.9) / 100),
          domainAuthorityScore: 91,
          isUserDomain: false
        },
        {
          rank: 8,
          title: `${query.keyword} by Independent Artists | Society6`,
          url: `https://society6.com/collection/${clean.replace(/\s+/g, '-')}`,
          domain: 'society6.com',
          displayUrl: 'society6.com › collection',
          breadcrumbs: ['Society6', 'Prints'],
          snippet: `Support independent digital and traditional artists. Every purchase pays an artist. Museum-quality giclée art prints with vibrant color reproduction.`,
          datePublished: '2026-02-20',
          favicon: 'https://www.google.com/s2/favicons?domain=society6.com&sz=32',
          badges: ['schema', 'stars', 'https'],
          rating: { value: 4.5, count: 1840 },
          estimatedCtr: 3.2,
          estimatedTraffic: Math.round((18100 * 3.2) / 100),
          domainAuthorityScore: 82,
          isUserDomain: false
        },
        {
          rank: 9,
          title: `Trendy ${query.keyword} & Picture Frames Online`,
          url: `https://desenio.com/art-prints/${clean.replace(/\s+/g, '-')}`,
          domain: 'desenio.com',
          displayUrl: 'desenio.com › art-prints',
          breadcrumbs: ['Desenio', 'Art Prints'],
          snippet: `Create a trendy gallery wall with stylish art prints. Browse popular categories, botanical, vintage, and abstract designs.`,
          datePublished: '2026-03-02',
          favicon: 'https://www.google.com/s2/favicons?domain=desenio.com&sz=32',
          badges: ['schema', 'https'],
          estimatedCtr: 2.7,
          estimatedTraffic: Math.round((18100 * 2.7) / 100),
          domainAuthorityScore: 71,
          isUserDomain: false
        },
        {
          rank: 10,
          title: `The Best Online Framing & Print Services for 2026`,
          url: `https://nytimes.com/reviews/best-online-framing-services/`,
          domain: 'nytimes.com',
          displayUrl: 'nytimes.com › wirecutter › reviews',
          breadcrumbs: ['NYTimes', 'Wirecutter'],
          snippet: `After testing 12 custom print and framing services with various art styles, here are the top services for color accuracy, paper quality, and value.`,
          datePublished: '2026-03-08',
          favicon: 'https://www.google.com/s2/favicons?domain=nytimes.com&sz=32',
          badges: ['author', 'https'],
          estimatedCtr: 2.3,
          estimatedTraffic: Math.round((18100 * 2.3) / 100),
          domainAuthorityScore: 95,
          isUserDomain: false
        }
      ],
      userRanking: {
        rank: 3,
        url: `https://posterscraft.com/collections/${clean.replace(/\s+/g, '-')}`,
        trafficShare: Math.round((18100 * 11.0) / 100)
      }
    };
  }

  /**
   * Retrieves recent search history from local storage
   */
  static getRecentQueries(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_RECENT_SERP);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return [
      'vintage movie posters',
      'minimalist art prints',
      'custom framed posters',
      'canvas art online',
      'buy retro posters online'
    ];
  }

  /**
   * Stores a query in local storage history
   */
  static saveRecentQuery(query: string): void {
    if (!query || !query.trim()) return;
    try {
      const recents = this.getRecentQueries();
      const updated = [query.trim(), ...recents.filter(q => q.toLowerCase() !== query.trim().toLowerCase())].slice(0, 8);
      localStorage.setItem(STORAGE_KEY_RECENT_SERP, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }
}
