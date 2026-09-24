import type { IncomingMessage, ServerResponse } from 'http';

interface GeoRequestBody {
  url?: string;
  domain?: string;
  keyword?: string;
  gridSize?: '3x3' | '5x5';
  radiusKm?: number;
}

function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) {
        reject(new Error('Request payload too large (max 2MB)'));
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

export async function handleGeoRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return;
  }

  let body: GeoRequestBody = {};
  if (req.method === 'POST') {
    try {
      body = await readJsonBody<GeoRequestBody>(req);
    } catch (err: any) {
      sendJson(res, 400, { ok: false, error: err.message });
      return;
    }
  }

  const rawUrl = body.url || 'https://www.posterscraft.com';
  const targetDomain = body.domain || rawUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'posterscraft.com';
  const selectedKeyword = body.keyword || 'web development agency kolkata';
  const selectedGridSize = body.gridSize || '3x3';
  const selectedRadius = body.radiusKm || 5;

  // Center Coordinates: PostersCraft Kolkata HQ (Sector V / Park Street corridor)
  const centerLat = 22.5726;
  const centerLng = 88.3639;

  // Generate Geo-Grid Pins (3x3 or 5x5)
  const count = selectedGridSize === '5x5' ? 5 : 3;
  const pins: any[] = [];
  const step = (selectedRadius * 2) / (count - 1);
  const kmPerDegLat = 111.0;
  const kmPerDegLng = 111.0 * Math.cos((centerLat * Math.PI) / 180);

  const neighborhoods = [
    ['Howrah Station', 'Shyambazar', 'Salt Lake Sector I', 'New Town Action Area 1', 'Rajarhat'],
    ['BBD Bagh', 'College Street', 'Sealdah', 'Salt Lake Sector V', 'Sector V Tech Hub'],
    ['Maidan', 'Park Street HQ', 'Ballygunge', 'Science City', 'EM Bypass'],
    ['Alipore', 'Kalighat', 'Gariahat', 'Kasba', 'Ruby Hospital'],
    ['Behala', 'Tollygunge', 'Jadavpur', 'Garia', 'Narendrapur']
  ];

  let rankSum = 0;
  let top3Count = 0;

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      const offsetXKm = -selectedRadius + c * step;
      const offsetYKm = selectedRadius - r * step;
      const distFromCenter = Math.sqrt(offsetXKm * offsetXKm + offsetYKm * offsetYKm);
      const lat = centerLat + offsetYKm / kmPerDegLat;
      const lng = centerLng + offsetXKm / kmPerDegLng;

      // Base ranking logic: distance decay + keyword variation
      let pinRank = 1;
      if (distFromCenter < 1.5) {
        pinRank = 1;
      } else if (distFromCenter < 3.0) {
        pinRank = 2;
      } else if (distFromCenter < 5.0) {
        pinRank = Math.min(6, Math.floor(2 + distFromCenter * 0.8));
      } else if (distFromCenter < 10.0) {
        pinRank = Math.min(12, Math.floor(4 + distFromCenter * 0.9));
      } else {
        pinRank = Math.min(18, Math.floor(7 + distFromCenter * 1.1));
      }

      // Keyword sensitivity adjustment
      if (selectedKeyword.includes('near me')) {
        pinRank = Math.max(1, pinRank - 1);
      } else if (selectedKeyword.includes('salt lake')) {
        // Boost eastern pins
        if (c >= Math.floor(count / 2)) {
          pinRank = Math.max(1, pinRank - 2);
        } else {
          pinRank += 2;
        }
      }

      if (pinRank <= 3) top3Count++;
      rankSum += pinRank;

      const nRow = Math.min(r, neighborhoods.length - 1);
      const nCol = Math.min(c, neighborhoods[0].length - 1);
      const label = neighborhoods[nRow][nCol];

      pins.push({
        id: `pin-${r}-${c}`,
        row: r,
        col: c,
        label,
        lat: Number(lat.toFixed(5)),
        lng: Number(lng.toFixed(5)),
        distanceKm: Number(distFromCenter.toFixed(1)),
        rank: pinRank,
        inLocalPack: pinRank <= 3,
        topCompetitor: pinRank === 1 ? 'PostersCraft (You)' : (pinRank === 2 ? 'Bengal Tech Pioneers' : 'Kolkata Digital Studio')
      });
    }
  }

  const totalPins = count * count;
  const avgGridRank = Number((rankSum / totalPins).toFixed(1));
  const shareOfLocalVoice = Number(((top3Count / totalPins) * 100).toFixed(0));

  // Available Keywords for Grid
  const availableGridKeywords = [
    'web development agency kolkata',
    'digital marketing agency near me',
    'seo company salt lake kolkata',
    'custom web design agency park street',
    'best software development company kolkata'
  ];

  // Local Pack Simulation
  const localPack = {
    keyword: selectedKeyword,
    city: 'Kolkata, West Bengal',
    targetRank: 1,
    items: [
      {
        position: 1,
        name: 'PostersCraft — Web Development & Digital Marketing Agency',
        isTargetBusiness: true,
        rating: 4.9,
        reviewCount: 148,
        category: 'Web design agency · Digital marketing',
        address: 'Park Street Area / Salt Lake Sector V, Kolkata, WB 700016',
        hours: 'Open ⋅ Closes 7:00 PM',
        phone: '+91 33 2287 4000',
        website: 'https://www.posterscraft.com',
        attributes: ['On-site services', 'Online appointments', '24/7 Support for Clients'],
        distanceKm: 0.2
      },
      {
        position: 2,
        name: 'Bengal Tech Pioneers Pvt Ltd',
        isTargetBusiness: false,
        rating: 4.7,
        reviewCount: 94,
        category: 'Software company · Website design',
        address: 'Sector V, Salt Lake, Kolkata, WB 700091',
        hours: 'Open ⋅ Closes 6:30 PM',
        phone: '+91 33 4001 2300',
        website: 'https://bengaltechpioneers.example.com',
        attributes: ['On-site services', 'Online estimates'],
        distanceKm: 3.4
      },
      {
        position: 3,
        name: 'Kolkata Digital Studio & Marketing Hub',
        isTargetBusiness: false,
        rating: 4.6,
        reviewCount: 78,
        category: 'Marketing agency · Advertising',
        address: 'Camac Street, Elgin, Kolkata, WB 700017',
        hours: 'Open ⋅ Closes 8:00 PM',
        phone: '+91 33 2282 8900',
        website: 'https://kolkatadigitalstudio.example.com',
        attributes: ['Online appointments'],
        distanceKm: 1.8
      }
    ],
    rankFactors: [
      {
        factor: 'Geographic Proximity to Searcher',
        importance: 'Very High',
        targetScore: 96,
        topCompetitorScore: 84,
        assessment: 'Within 0.5km of central commercial core; verified physical location in Park Street corridor gives decisive proximity weight.'
      },
      {
        factor: 'Google Review Volume & Velocity',
        importance: 'Very High',
        targetScore: 92,
        topCompetitorScore: 78,
        assessment: '148 reviews (4.9★) with steady monthly velocity of 6-8 new verified reviews outpaces #2 competitor (94 reviews, 4.7★).'
      },
      {
        factor: 'Google Business Profile Completeness',
        importance: 'High',
        targetScore: 95,
        topCompetitorScore: 88,
        assessment: '100% complete profile: high-res interior/team photos, services catalog, regular weekly Google updates, and appointment links.'
      },
      {
        factor: 'NAP Consistency Across High-DA Citations',
        importance: 'High',
        targetScore: 88,
        topCompetitorScore: 90,
        assessment: '9 out of 10 primary tier-1 directories matched perfectly. Minor phone variation on Justdial requires synchronization.'
      },
      {
        factor: 'On-Page Local Signals & LocalBusiness Schema',
        importance: 'Medium',
        targetScore: 94,
        topCompetitorScore: 72,
        assessment: 'Validated ProfessionalService Schema.org JSON-LD with geo coordinates, city keywords in Title and H1, and embedded Google Map.'
      }
    ]
  };

  // Local Citations Matrix
  const citations = [
    {
      id: 'cit-1',
      name: 'Google Business Profile',
      authority: 100,
      category: 'Primary Search Engine',
      url: 'https://business.google.com',
      listedName: 'PostersCraft',
      listedAddress: 'Park Street Area, Kolkata, West Bengal 700016, India',
      listedPhone: '+91 33 2287 4000',
      status: 'consistent',
      fixAction: 'Fully synchronized and verified.'
    },
    {
      id: 'cit-2',
      name: 'Bing Places for Business',
      authority: 94,
      category: 'Search Engine Directory',
      url: 'https://bingplaces.com',
      listedName: 'PostersCraft',
      listedAddress: 'Park Street Area, Kolkata, West Bengal 700016, India',
      listedPhone: '+91 33 2287 4000',
      status: 'consistent',
      fixAction: 'Synchronized via Microsoft Account.'
    },
    {
      id: 'cit-3',
      name: 'Apple Business Connect (Apple Maps)',
      authority: 96,
      category: 'Mobile & Mapping Ecosystem',
      url: 'https://businessconnect.apple.com',
      listedName: 'PostersCraft',
      listedAddress: 'Park Street Area, Kolkata, West Bengal 700016, India',
      listedPhone: '+91 33 2287 4000',
      status: 'consistent',
      fixAction: 'Place card claimed with custom action button.'
    },
    {
      id: 'cit-4',
      name: 'Facebook Local Business Page',
      authority: 96,
      category: 'Social Media & Local Discovery',
      url: 'https://facebook.com/posterscraft',
      listedName: 'PostersCraft',
      listedAddress: 'Park Street Area, Kolkata, WB 700016, India',
      listedPhone: '+91 33 2287 4000',
      status: 'consistent',
      fixAction: 'Check-ins enabled and address geocoded.'
    },
    {
      id: 'cit-5',
      name: 'Justdial Kolkata',
      authority: 84,
      category: 'Local City Directory',
      url: 'https://justdial.com/Kolkata/posterscraft',
      listedName: 'PostersCraft Digital Agency',
      listedAddress: 'Park Street, Kolkata 700016',
      listedPhone: '033-22874000',
      status: 'mismatch',
      discrepancyType: 'phone',
      discrepancyNote: 'Phone formatted as local landline without international +91 prefix; business name appended with "Digital Agency".',
      fixAction: 'Update listing name to "PostersCraft" and standardize phone number to +91 33 2287 4000.'
    },
    {
      id: 'cit-6',
      name: 'YellowPages India',
      authority: 78,
      category: 'National Business Directory',
      url: 'https://yellowpages.in/kolkata/posterscraft',
      listedName: 'PostersCraft',
      listedAddress: 'Park Street Area, Kolkata, West Bengal 700016',
      listedPhone: '+91 33 2287 4000',
      status: 'consistent',
      fixAction: 'Verified listing active.'
    },
    {
      id: 'cit-7',
      name: 'IndiaMART Business Directory',
      authority: 85,
      category: 'B2B Marketplace & Citations',
      url: 'https://indiamart.com/posterscraft',
      listedName: 'PostersCraft Web Solutions',
      listedAddress: 'Park Street Area, Suite 4B, Kolkata 700016',
      listedPhone: '+91 33 2287 4000',
      status: 'mismatch',
      discrepancyType: 'address',
      discrepancyNote: 'Address includes "Suite 4B" which is absent on website and Google Business Profile.',
      fixAction: 'Remove "Suite 4B" to match canonical website address or add suite number to website schema.'
    },
    {
      id: 'cit-8',
      name: 'Trustpilot Business Profile',
      authority: 91,
      category: 'Consumer Trust & Reviews',
      url: 'https://trustpilot.com/review/posterscraft.com',
      listedName: 'PostersCraft',
      listedAddress: 'Kolkata, West Bengal, India',
      listedPhone: '+91 33 2287 4000',
      status: 'consistent',
      fixAction: 'Verified company profile with 4.8 star badge.'
    },
    {
      id: 'cit-9',
      name: 'Yelp India / International',
      authority: 93,
      category: 'Review & Local Directory',
      url: 'https://yelp.com/biz/posterscraft-kolkata',
      listedName: 'PostersCraft',
      listedAddress: 'Park Street Area, Kolkata, WB 700016',
      listedPhone: '+91 33 2287 4000',
      status: 'consistent',
      fixAction: 'Claimed business listing.'
    },
    {
      id: 'cit-10',
      name: 'Foursquare / Swarm City Guide',
      authority: 90,
      category: 'Location Data Aggregator',
      url: 'https://foursquare.com/v/posterscraft/648b291a',
      listedName: 'PostersCraft',
      listedAddress: 'Park Street, Kolkata, WB',
      listedPhone: '',
      status: 'missing',
      discrepancyType: 'missing',
      discrepancyNote: 'Phone number missing entirely from Foursquare venue database.',
      fixAction: 'Claim venue and populate verified contact phone +91 33 2287 4000 and website link.'
    }
  ];

  // Local Schema Data
  const schemaConfig = {
    type: 'ProfessionalService',
    name: 'PostersCraft',
    legalName: 'PostersCraft Digital Agency Pvt. Ltd.',
    telephone: '+91 33 2287 4000',
    email: 'contact@posterscraft.com',
    streetAddress: 'Park Street Area, Commercial Hub',
    addressLocality: 'Kolkata',
    addressRegion: 'West Bengal',
    postalCode: '700016',
    addressCountry: 'IN',
    latitude: 22.5726,
    longitude: 88.3639,
    priceRange: '$$',
    openingHours: [
      'Mo-Fr 09:00-19:00',
      'Sa 10:00-16:00'
    ],
    areasServed: [
      'Kolkata',
      'Salt Lake Sector V',
      'New Town',
      'Park Street',
      'Howrah',
      'West Bengal'
    ],
    sameAs: [
      'https://facebook.com/posterscraft',
      'https://linkedin.com/company/posterscraft',
      'https://twitter.com/posterscraft'
    ]
  };

  const generatedJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': schemaConfig.type,
    '@id': 'https://www.posterscraft.com/#organization',
    name: schemaConfig.name,
    legalName: schemaConfig.legalName,
    url: 'https://www.posterscraft.com',
    logo: 'https://www.posterscraft.com/logo.png',
    image: 'https://www.posterscraft.com/og-banner.jpg',
    telephone: schemaConfig.telephone,
    email: schemaConfig.email,
    priceRange: schemaConfig.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: schemaConfig.streetAddress,
      addressLocality: schemaConfig.addressLocality,
      addressRegion: schemaConfig.addressRegion,
      postalCode: schemaConfig.postalCode,
      addressCountry: schemaConfig.addressCountry
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: schemaConfig.latitude,
      longitude: schemaConfig.longitude
    },
    hasMap: 'https://maps.google.com/?q=22.5726,88.3639',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '19:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '16:00'
      }
    ],
    areaServed: schemaConfig.areasServed.map(area => ({
      '@type': 'City',
      name: area
    })),
    sameAs: schemaConfig.sameAs
  }, null, 2);

  // Geo Keywords Matrix
  const geoKeywords = [
    {
      id: 'gk-1',
      keyword: 'web development agency kolkata',
      city: 'Kolkata',
      intent: 'City Direct',
      monthlyVolume: 2400,
      difficulty: 38,
      localPack: true,
      currentRank: 1,
      previousRank: 2,
      serpFeatures: ['Local 3-Pack', 'Reviews', 'Sitelinks']
    },
    {
      id: 'gk-2',
      keyword: 'digital marketing company near me',
      city: 'Kolkata (User Location)',
      intent: 'Near Me',
      monthlyVolume: 4200,
      difficulty: 46,
      localPack: true,
      currentRank: 1,
      previousRank: 1,
      serpFeatures: ['Local 3-Pack', 'People Also Ask']
    },
    {
      id: 'gk-3',
      keyword: 'seo company salt lake kolkata',
      city: 'Salt Lake Sector V',
      intent: 'Neighborhood',
      monthlyVolume: 1350,
      difficulty: 29,
      localPack: true,
      currentRank: 2,
      previousRank: 3,
      serpFeatures: ['Local 3-Pack', 'Image Carousel']
    },
    {
      id: 'gk-4',
      keyword: 'custom software agency park street',
      city: 'Park Street',
      intent: 'Neighborhood',
      monthlyVolume: 890,
      difficulty: 24,
      localPack: true,
      currentRank: 1,
      previousRank: 1,
      serpFeatures: ['Local 3-Pack', 'Map Pin']
    },
    {
      id: 'gk-5',
      keyword: 'ecommerce website development kolkata',
      city: 'Kolkata',
      intent: 'Service Direct',
      monthlyVolume: 1800,
      difficulty: 41,
      localPack: true,
      currentRank: 3,
      previousRank: 4,
      serpFeatures: ['Local 3-Pack', 'Product Schema']
    },
    {
      id: 'gk-6',
      keyword: 'best web design agency new town',
      city: 'New Town Rajarhat',
      intent: 'Neighborhood',
      monthlyVolume: 720,
      difficulty: 22,
      localPack: true,
      currentRank: 4,
      previousRank: 5,
      serpFeatures: ['Organic Results', 'Images']
    },
    {
      id: 'gk-7',
      keyword: 'corporate branding agency kolkata',
      city: 'Kolkata',
      intent: 'City Direct',
      monthlyVolume: 950,
      difficulty: 31,
      localPack: false,
      currentRank: 2,
      previousRank: 2,
      serpFeatures: ['Featured Snippet', 'Video']
    },
    {
      id: 'gk-8',
      keyword: 'b2b digital marketing agency west bengal',
      city: 'West Bengal',
      intent: 'City Direct',
      monthlyVolume: 610,
      difficulty: 27,
      localPack: false,
      currentRank: 3,
      previousRank: 3,
      serpFeatures: ['Sitelinks']
    }
  ];

  // Local SEO Audit Checks
  const auditChecks = [
    {
      id: 'lac-1',
      category: 'NAP Consistency',
      title: 'Exact Business Name Consistency',
      status: 'warning',
      impact: 'high',
      description: 'Business name is "PostersCraft" on website, but appears as "PostersCraft Digital Agency" on Justdial.',
      remediation: 'Align business name to "PostersCraft" across Justdial and IndiaMART listings to prevent authority fragmentation.'
    },
    {
      id: 'lac-2',
      category: 'NAP Consistency',
      title: 'Telephone Number Standardization',
      status: 'warning',
      impact: 'high',
      description: 'Telephone number lacks international dialing prefix (+91) on 2 directory citations.',
      remediation: 'Format all phone citations as +91 33 2287 4000 using standard E.164 telecommunications format.'
    },
    {
      id: 'lac-3',
      category: 'Google Business Profile',
      title: 'Google Review Volume & Rating',
      status: 'pass',
      impact: 'high',
      description: 'Profile has 148 verified Google reviews with an average rating of 4.9★, ranking in the top 5% of Kolkata digital agencies.',
      remediation: 'Maintain weekly review response rate above 90% to sustain prominence algorithms.'
    },
    {
      id: 'lac-4',
      category: 'Google Business Profile',
      title: 'Weekly Google Business Updates',
      status: 'pass',
      impact: 'medium',
      description: 'Profile has published 4 posts in the last 30 days including service announcements and client case study highlights.',
      remediation: 'Continue publishing at least once per week with strong Call-To-Action buttons.'
    },
    {
      id: 'lac-5',
      category: 'Schema & Tech',
      title: 'LocalBusiness / ProfessionalService JSON-LD',
      status: 'pass',
      impact: 'high',
      description: 'Valid schema markup detected with complete address, geo-coordinates (22.5726, 88.3639), and opening hours.',
      remediation: 'Add "areaServed" with specific municipal wards and districts to expand local graph coverage.'
    },
    {
      id: 'lac-6',
      category: 'Schema & Tech',
      title: 'Interactive Google Map Embed',
      status: 'pass',
      impact: 'medium',
      description: 'Google Maps iframe embedded on Contact page with responsive container and lazy loading attribute.',
      remediation: 'Ensure iframe includes aria-label="PostersCraft Kolkata Office Location" for accessibility.'
    },
    {
      id: 'lac-7',
      category: 'Citations',
      title: 'Tier-1 Directory Authority Coverage',
      status: 'pass',
      impact: 'high',
      description: 'Business is listed on Google, Bing, Apple Maps, Yelp, and Facebook with an average domain authority of 95.',
      remediation: 'Claim unclaimed Foursquare venue profile to feed automotive GPS and location intelligence aggregators.'
    },
    {
      id: 'lac-8',
      category: 'Local Content',
      title: 'City & Region in Primary Title & H1',
      status: 'pass',
      impact: 'high',
      description: 'Page title contains "Web Development Agency in Kolkata" and primary H1 confirms regional focus.',
      remediation: 'Maintain local keyword naturalness without over-optimization or keyword stuffing.'
    },
    {
      id: 'lac-9',
      category: 'Local Content',
      title: 'Dedicated Neighborhood Landing Pages',
      status: 'warning',
      impact: 'medium',
      description: 'Site lacks dedicated landing pages for Salt Lake Sector V and New Town tech hubs.',
      remediation: 'Create localized service landing pages targeting specific business corridors (e.g. /salt-lake-web-development).'
    },
    {
      id: 'lac-10',
      category: 'Local Content',
      title: 'Localized Client Case Studies & Testimonials',
      status: 'pass',
      impact: 'medium',
      description: 'Features client testimonials with recognized Kolkata corporate brands and business logos.',
      remediation: 'Include specific neighborhood references in testimonial copy to reinforce local topical authority.'
    }
  ];

  // Calibrate 5 Pillars Scores
  const pillars = {
    napConsistency: {
      name: 'NAP Consistency',
      score: 21,
      maxScore: 25,
      status: 'warning' as const,
      summary: '84% consistency rate across 10 directories. 2 minor formatting discrepancies detected on Justdial and IndiaMART.'
    },
    gbpOptimization: {
      name: 'GBP & Bing Places',
      score: 24,
      maxScore: 25,
      status: 'good' as const,
      summary: '96% optimization rating. 148 reviews (4.9★), complete categories, active posts, and high-res imagery.'
    },
    schemaGeocoding: {
      name: 'Local Schema & Geocoding',
      score: 19,
      maxScore: 20,
      status: 'good' as const,
      summary: 'Validated ProfessionalService Schema with GeoCoordinates, operating hours, and areaServed entity array.'
    },
    citationsHealth: {
      name: 'Local Citations',
      score: 13,
      maxScore: 15,
      status: 'good' as const,
      summary: '9 active citations across Tier-1 directories with aggregate Domain Authority of 91/100. 1 listing requires claiming.'
    },
    onPageGeoSignals: {
      name: 'On-Page Geo Signals',
      score: 13,
      maxScore: 15,
      status: 'good' as const,
      summary: 'City present in Title, H1, meta description, and contact schema. Neighborhood landing page cluster recommended.'
    }
  };

  const overallScore = pillars.napConsistency.score +
    pillars.gbpOptimization.score +
    pillars.schemaGeocoding.score +
    pillars.citationsHealth.score +
    pillars.onPageGeoSignals.score;

  let scoreGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
  if (overallScore >= 95) scoreGrade = 'A+';
  else if (overallScore >= 85) scoreGrade = 'A';
  else if (overallScore >= 75) scoreGrade = 'B';
  else if (overallScore >= 65) scoreGrade = 'C';
  else if (overallScore >= 50) scoreGrade = 'D';
  else scoreGrade = 'F';

  const analysis = {
    targetUrl: rawUrl,
    targetDomain,
    analyzedAt: new Date().toISOString(),
    overallScore,
    scoreGrade,
    profile: {
      name: 'PostersCraft',
      category: 'Web Development & Digital Marketing Agency',
      businessType: 'ProfessionalService',
      street: 'Park Street Area, Commercial District',
      city: 'Kolkata',
      state: 'West Bengal',
      postalCode: '700016',
      country: 'India',
      phone: '+91 33 2287 4000',
      email: 'contact@posterscraft.com',
      website: rawUrl,
      latitude: centerLat,
      longitude: centerLng,
      hours: 'Mon-Fri 09:00 - 19:00, Sat 10:00 - 16:00',
      priceRange: '$$',
      areasServed: ['Kolkata', 'Salt Lake Sector V', 'New Town', 'Park Street', 'Howrah', 'West Bengal']
    },
    pillars,
    geoGrid: {
      keyword: selectedKeyword,
      gridSize: selectedGridSize,
      radiusKm: selectedRadius,
      centerLat,
      centerLng,
      centerAddress: 'Park Street, Kolkata, West Bengal 700016',
      averageGridRank: avgGridRank,
      shareOfLocalVoice,
      top3PinsCount: top3Count,
      totalPins,
      pins
    },
    availableGridKeywords,
    localPack,
    citations,
    schemaValidation: {
      config: schemaConfig,
      jsonLd: generatedJsonLd,
      isValid: true,
      errors: [],
      warnings: ['Recommend adding specific geo-radius or geo-polygon to areaServed for precise multi-city targeting.'],
      recommendedFields: ['paymentAccepted', 'currenciesAccepted', 'aggregateRating']
    },
    geoKeywords,
    auditChecks
  };

  sendJson(res, 200, {
    ok: true,
    data: analysis
  });
}
