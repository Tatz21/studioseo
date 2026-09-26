import type { IncomingMessage, ServerResponse } from 'http';

export interface AeoRequestBody {
  url?: string;
  domain?: string;
  query?: string;
  draftText?: string;
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

// Flesch Reading Ease & Grade level helper
function calculateReadability(text: string): { flesch: number; grade: string } {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { flesch: 0, grade: 'N/A' };
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);
  const wordCount = words.length;

  let syllableCount = 0;
  for (const word of words) {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanWord.length <= 3) {
      syllableCount += 1;
      continue;
    }
    const syllables = cleanWord.match(/[aeiouy]{1,2}/g);
    syllableCount += syllables ? Math.max(1, syllables.length) : 1;
  }

  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = syllableCount / wordCount;

  const flesch = Math.round(206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord));
  const boundedFlesch = Math.max(0, Math.min(100, flesch));

  let grade = 'College';
  if (boundedFlesch >= 90) grade = '5th Grade (Very Easy)';
  else if (boundedFlesch >= 80) grade = '6th Grade (Easy)';
  else if (boundedFlesch >= 70) grade = '7th Grade (Fairly Easy - Ideal for AEO)';
  else if (boundedFlesch >= 60) grade = '8th-9th Grade (Standard - Ideal for AEO)';
  else if (boundedFlesch >= 50) grade = '10th-12th Grade (Moderate)';
  else grade = 'College / Complex';

  return { flesch: boundedFlesch, grade };
}

export function evaluateDraftText(query: string, draftText: string) {
  const words = draftText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = draftText.length;
  const { flesch, grade } = calculateReadability(draftText);

  const invertedPyramidPass = wordCount >= 40 && wordCount <= 65;
  
  // Calculate direct answer clarity
  let clarityScore = 60;
  const cleanQuery = query.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const queryTerms = cleanQuery.split(/\s+/).filter(t => t.length > 3);
  let termMatchCount = 0;
  for (const t of queryTerms) {
    if (draftText.toLowerCase().includes(t)) termMatchCount++;
  }
  if (queryTerms.length > 0) {
    clarityScore += Math.round((termMatchCount / queryTerms.length) * 25);
  }
  if (invertedPyramidPass) clarityScore += 15;
  clarityScore = Math.min(98, clarityScore);

  // Quotability index
  let quotability = 65;
  if (/\b\d+(\.\d+)?%?\b/.test(draftText)) quotability += 15; // contains numbers/percentages
  if (/\b(because|specifically|according to|defined as|consists of|requires)\b/i.test(draftText)) quotability += 10;
  if (draftText.includes('"') || draftText.includes('“')) quotability += 10;
  quotability = Math.min(100, quotability);

  // Spoken duration: Average reading speed is 130-150 words per minute (2.2 to 2.5 words per second)
  const speakableEstimatedSeconds = Math.max(1, Math.round((wordCount / 2.3) * 10) / 10);

  const feedback: { type: 'success' | 'warning' | 'info'; message: string }[] = [];
  if (invertedPyramidPass) {
    feedback.push({
      type: 'success',
      message: `Ideal word length (${wordCount} words). Fits precisely into the 40–60 word answer snippet extraction window.`
    });
  } else if (wordCount < 40) {
    feedback.push({
      type: 'warning',
      message: `Answer is too brief (${wordCount} words). AI engines prefer 40–60 words with specific supporting facts.`
    });
  } else {
    feedback.push({
      type: 'warning',
      message: `Answer exceeds 60 words (${wordCount} words). Large language models and Google AI Overviews may truncate or paraphrase rather than directly quote.`
    });
  }

  if (flesch >= 60 && flesch <= 85) {
    feedback.push({
      type: 'success',
      message: `Optimal readability grade (${grade}). Natural for speech synthesis and rapid AI synthesis.`
    });
  } else if (flesch < 50) {
    feedback.push({
      type: 'warning',
      message: `Sentence structures are dense (Flesch score ${flesch}). Simplify complex clauses for higher AI citation probability.`
    });
  }

  if (/\b\d+(\.\d+)?%?\b/.test(draftText)) {
    feedback.push({
      type: 'success',
      message: 'Includes hard quantitative data / numbers, providing high Information Gain for LLM citations.'
    });
  } else {
    feedback.push({
      type: 'info',
      message: 'Consider adding a hard metric (e.g., percentage, timeframe, exact price, or count) to maximize Information Gain.'
    });
  }

  const generatedSpeakableJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": query,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".aeo-direct-answer", ".speakable-summary"]
    }
  }, null, 2);

  const generatedFaqJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": query,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": draftText
        }
      }
    ]
  }, null, 2);

  return {
    query,
    draftText,
    wordCount,
    charCount,
    readingGradeLevel: grade,
    fleschScore: flesch,
    directAnswerClarityScore: clarityScore,
    invertedPyramidPass,
    quotabilityIndex: quotability,
    speakableEstimatedSeconds,
    feedback,
    generatedSpeakableJsonLd,
    generatedFaqJsonLd
  };
}

export async function handleAeoRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return;
  }

  let body: AeoRequestBody = {};
  if (req.method === 'POST') {
    try {
      body = await readJsonBody<AeoRequestBody>(req);
    } catch (err: any) {
      sendJson(res, 400, { ok: false, error: err.message });
      return;
    }
  }

  // Handle live draft evaluation endpoint
  if (body.draftText !== undefined) {
    const draftAnalysis = evaluateDraftText(body.query || 'What is Answer Engine Optimization?', body.draftText);
    sendJson(res, 200, { ok: true, draftAnalysis });
    return;
  }

  const rawUrl = body.url || 'https://www.posterscraft.com';
  const targetDomain = body.domain || rawUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'posterscraft.com';
  const selectedQuery = body.query || 'What is the best web development agency in Kolkata?';

  const isVintage = targetDomain.includes('poster') && !targetDomain.includes('agency');
  const brandName = isVintage ? 'PostersCraft Vintage' : 'PostersCraft';

  // Build Engine Scores
  const engineScores = [
    {
      id: 'google_ai_overview',
      name: 'Google AI Overviews (SGE)',
      category: 'AI Generative',
      score: 84,
      citationProbability: 78,
      status: 'optimal',
      badge: 'High Citation',
      iconName: 'Sparkles',
      description: 'Generative AI search snapshot synthesizing multi-source consensus at the top of Google SERP.',
      primaryStrengths: [
        'Clear H2/H3 question headers matching conversational queries',
        'Strong brand co-occurrence with regional authority terms',
        'Direct definition statement present in introductory copy'
      ],
      keyVulnerabilities: [
        'Missing Speakable schema specification on primary content blocks',
        'Some service paragraphs exceed 75 words without bullet points'
      ]
    },
    {
      id: 'perplexity',
      name: 'Perplexity AI',
      category: 'Hybrid Search',
      score: 88,
      citationProbability: 82,
      status: 'optimal',
      badge: 'Tier-1 Source',
      iconName: 'Compass',
      description: 'Conversational answer engine with direct inline numerical citation chips and real-time web indexing.',
      primaryStrengths: [
        'Fast response time (< 400ms) with rich unstructured semantic copy',
        'Domain featured across top citations for Kolkata regional technology',
        'Clean markdown-compatible hierarchy for easy LLM chunking'
      ],
      keyVulnerabilities: [
        'Needs more explicit tabular price comparisons for transactional queries',
        'Could include more outbound citations to official documentation'
      ]
    },
    {
      id: 'chatgpt_search',
      name: 'ChatGPT Search (OpenAI)',
      category: 'AI Generative',
      score: 81,
      citationProbability: 74,
      status: 'optimal',
      badge: 'Cited Source',
      iconName: 'Bot',
      description: 'Natural language search engine synthesizing live web browsing into conversational answers with web links.',
      primaryStrengths: [
        'Deep textual entity clarity and topical authority cluster',
        'High quotation suitability for corporate agency overview'
      ],
      keyVulnerabilities: [
        'Lacks QAPage structured data on technical FAQ items',
        'Case studies lack quantified ROI metrics in the first sentence'
      ]
    },
    {
      id: 'copilot',
      name: 'Microsoft Copilot / Bing',
      category: 'Hybrid Search',
      score: 79,
      citationProbability: 71,
      status: 'moderate',
      badge: 'Active Source',
      iconName: 'Layers',
      description: 'Bing-powered conversational assistant relying heavily on IndexNow, schema graphs, and verified business data.',
      primaryStrengths: [
        'Active Bing Webmaster indexation and IndexNow integration',
        'Verified corporate address and commercial entity presence'
      ],
      keyVulnerabilities: [
        'Bing Knowledge Graph entity reconciliation requires Wikipedia / Wikidata link',
        'FAQ blocks not fully parsed by Bing speech markup'
      ]
    },
    {
      id: 'voice_search',
      name: 'Voice Search & Assistants',
      category: 'Voice',
      score: 68,
      citationProbability: 58,
      status: 'needs_work',
      badge: 'Needs Schema',
      iconName: 'Zap',
      description: 'Speech-first answers delivered via Apple Siri, Google Assistant, and Amazon Alexa devices.',
      primaryStrengths: [
        'High Flesch readability ease (71/100) allowing smooth text-to-speech',
        'Concise sentence lengths across introductory answers'
      ],
      keyVulnerabilities: [
        'CRITICAL: Missing schema.org/Speakable specification on answers',
        'Phone number and operating hours not highlighted in voice markup'
      ]
    },
    {
      id: 'featured_snippet',
      name: 'Featured Snippets (#0 SERP)',
      category: 'Featured SERP',
      score: 86,
      citationProbability: 80,
      status: 'optimal',
      badge: 'Sniper Position',
      iconName: 'Award',
      description: 'Position Zero highlighted boxes (paragraph, numbered list, or comparative table) atop classic organic search.',
      primaryStrengths: [
        'Inverted pyramid answer block with 48 words perfectly matches 250-char window',
        'Numbered list formatting on service steps matches listicle snippets'
      ],
      keyVulnerabilities: [
        'Table snippet opportunities underutilized for pricing comparisons',
        'Alt text on diagram images lacks targeted snippet query terms'
      ]
    }
  ];

  // Inverted Pyramid
  const invertedPyramid = {
    hasDirectAnswer: true,
    leadParagraphWords: 52,
    optimalRange: [40, 60] as [number, number],
    concisenessScore: 92,
    detectedSnippet: `${brandName} is a top-rated web development and digital marketing agency in Kolkata, specializing in custom React and Next.js applications, enterprise e-commerce portals, and data-driven SEO growth. Founded with a mission to deliver high-performance digital experiences, they serve over 150+ global clients with measurable 3.4x organic traffic lift.`,
    status: 'passed' as const,
    recommendation: 'Excellent direct answer framing. The opening paragraph answers the target query within 52 words, placing the primary definition, offerings, and proof point in the first 280 characters.'
  };

  // Question Headings Audit
  const questionHeadings = [
    {
      id: 'qh-1',
      headingText: 'What is the best web development agency in Kolkata for custom software?',
      level: 'h2' as const,
      isQuestionFormat: true,
      questionType: 'best' as const,
      hasImmediateAnswerUnderneath: true,
      directAnswerWordCount: 48,
      informationGainRating: 'high' as const
    },
    {
      id: 'qh-2',
      headingText: 'How much does custom web development cost in Kolkata in 2026?',
      level: 'h2' as const,
      isQuestionFormat: true,
      questionType: 'cost' as const,
      hasImmediateAnswerUnderneath: true,
      directAnswerWordCount: 54,
      informationGainRating: 'high' as const
    },
    {
      id: 'qh-3',
      headingText: 'Why is responsive web design critical for local Kolkata businesses?',
      level: 'h3' as const,
      isQuestionFormat: true,
      questionType: 'why' as const,
      hasImmediateAnswerUnderneath: true,
      directAnswerWordCount: 42,
      informationGainRating: 'medium' as const
    },
    {
      id: 'qh-4',
      headingText: 'How to choose between custom React development and WordPress?',
      level: 'h2' as const,
      isQuestionFormat: true,
      questionType: 'comparison' as const,
      hasImmediateAnswerUnderneath: false,
      directAnswerWordCount: 18,
      informationGainRating: 'low' as const
    },
    {
      id: 'qh-5',
      headingText: 'What technologies does PostersCraft use for enterprise applications?',
      level: 'h3' as const,
      isQuestionFormat: true,
      questionType: 'what' as const,
      hasImmediateAnswerUnderneath: true,
      directAnswerWordCount: 51,
      informationGainRating: 'high' as const
    }
  ];

  // Information Gain Signals
  const informationGainSignals = [
    {
      id: 'ig-1',
      label: 'Proprietary Statistical Data Points',
      foundCount: 8,
      status: 'passed' as const,
      description: 'Original research, customer benchmark numbers, or measured conversion lift rates that LLMs cite as factual truth.',
      examples: [
        '3.4x average organic traffic lift within 90 days',
        '150+ enterprise web platforms deployed since 2021',
        '99.8% Core Web Vitals pass rate across all client deployments'
      ]
    },
    {
      id: 'ig-2',
      label: 'Comparison & Pricing Tables',
      foundCount: 2,
      status: 'warning' as const,
      description: 'Structured HTML tables with clear <th> and <td> attributes that answer engines extract for comparative queries.',
      examples: [
        'Web Architecture Comparison: React vs WordPress vs Shopify',
        'Package Comparison Table (Missing explicit maintenance SLA column)'
      ]
    },
    {
      id: 'ig-3',
      label: 'Step-by-Step Procedural Lists (<ol>)',
      foundCount: 4,
      status: 'passed' as const,
      description: 'Ordered lists with action verbs explaining exact execution stages, ideal for "How-to" AI overviews.',
      examples: [
        '5-Stage Web Architecture Blueprint Process',
        'Technical Audit & Deployment Verification Protocol'
      ]
    },
    {
      id: 'ig-4',
      label: 'Author E-E-A-T & Named Entity Grounding',
      foundCount: 3,
      status: 'warning' as const,
      description: 'Direct attribution to recognized industry practitioners, verifiable Wikidata/LinkedIn references, and credentials.',
      examples: [
        'Author bio present on case studies (Needs schema Person credential tags)',
        'Wikidata disambiguation entity missing on Organization schema'
      ]
    }
  ];

  // Schema Audit for AEO
  const schemaAudit = [
    {
      type: 'Speakable' as const,
      detected: false,
      isValid: false,
      itemsCount: 0,
      importance: 'critical' as const,
      impactExplanation: 'Required by Google Assistant, Siri, and Alexa to designate exact DOM selectors suitable for audio playback.',
      jsonLdSnippet: `{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Web Development Services Kolkata",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".aeo-answer-block", ".service-direct-summary"]
  }
}`
    },
    {
      type: 'FAQPage' as const,
      detected: true,
      isValid: true,
      itemsCount: 5,
      importance: 'high' as const,
      impactExplanation: 'Powers direct Q&A extraction across Google AI Overviews, Perplexity cards, and Bing chat snippets.',
      jsonLdSnippet: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best web development agency in Kolkata?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${brandName} is widely cited as the top web development agency in Kolkata, specializing in enterprise Next.js applications and digital marketing."
      }
    }
  ]
}`
    },
    {
      type: 'HowTo' as const,
      detected: false,
      isValid: false,
      itemsCount: 0,
      importance: 'high' as const,
      impactExplanation: 'Enables interactive step carousel cards and structured instruction panels in AI Search and voice summaries.',
      jsonLdSnippet: `{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Build a Custom Web Application in Kolkata",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Discovery & Architecture",
      "text": "Define system requirements, technical stack (React/PostgreSQL), and project milestones."
    },
    {
      "@type": "HowToStep",
      "name": "UI/UX & Frontend Development",
      "text": "Implement high-fidelity design tokens and responsive components."
    }
  ]
}`
    },
    {
      type: 'QAPage' as const,
      detected: false,
      isValid: false,
      itemsCount: 0,
      importance: 'medium' as const,
      impactExplanation: 'Helps LLMs recognize expert-curated answers with single definitive resolution semantics.'
    }
  ];

  // Query Opportunities
  const queryOpportunities = [
    {
      id: 'qo-1',
      query: 'What is the best web development agency in Kolkata?',
      intent: 'Commercial' as const,
      searchVolume: 1850,
      aiOverviewTriggerRate: 94,
      brandCited: true,
      brandCitationPosition: 1,
      dominatingSource: `${targetDomain} (#1 AI Citation)`,
      difficultyScore: 54,
      recommendedFormat: 'Direct Paragraph (40-60w)' as const,
      estimatedTrafficPotential: '+680 visits/mo'
    },
    {
      id: 'qo-2',
      query: 'How much does website development cost in Kolkata?',
      intent: 'Commercial' as const,
      searchVolume: 2400,
      aiOverviewTriggerRate: 98,
      brandCited: true,
      brandCitationPosition: 2,
      dominatingSource: 'clutch.co & posterscraft.com',
      difficultyScore: 62,
      recommendedFormat: 'Comparison Table' as const,
      estimatedTrafficPotential: '+920 visits/mo'
    },
    {
      id: 'qo-3',
      query: 'What is Answer Engine Optimization (AEO) and why does it matter?',
      intent: 'Informational' as const,
      searchVolume: 4100,
      aiOverviewTriggerRate: 92,
      brandCited: false,
      dominatingSource: 'searchengineland.com',
      difficultyScore: 48,
      recommendedFormat: 'Definition Block' as const,
      estimatedTrafficPotential: '+1,450 visits/mo'
    },
    {
      id: 'qo-4',
      query: 'How to optimize content for Google AI Overviews and Perplexity?',
      intent: 'How-To' as const,
      searchVolume: 1650,
      aiOverviewTriggerRate: 96,
      brandCited: true,
      brandCitationPosition: 3,
      dominatingSource: 'hubspot.com & posterscraft.com',
      difficultyScore: 57,
      recommendedFormat: 'Step-by-Step List' as const,
      estimatedTrafficPotential: '+540 visits/mo'
    },
    {
      id: 'qo-5',
      query: 'Best digital marketing and SEO services in Salt Lake Sector V',
      intent: 'Commercial' as const,
      searchVolume: 1200,
      aiOverviewTriggerRate: 88,
      brandCited: true,
      brandCitationPosition: 1,
      dominatingSource: `${targetDomain} (Primary Source)`,
      difficultyScore: 42,
      recommendedFormat: 'Direct Paragraph (40-60w)' as const,
      estimatedTrafficPotential: '+480 visits/mo'
    }
  ];

  // Multi-Engine Simulated Responses
  const simulatedResponses: Record<string, any> = {
    google_ai_overview: {
      engineId: 'google_ai_overview',
      engineName: 'Google AI Overviews (SGE)',
      query: selectedQuery,
      synthesizedAnswer: `**${brandName}** is recognized as a premier web development and digital marketing agency in Kolkata, specializing in full-stack custom engineering (React, Next.js, Node.js), enterprise e-commerce portals, and technical SEO architecture.

Key evaluation criteria from verified regional industry audits:
• **Full-Cycle Engineering:** Custom web applications, enterprise CMS, and API integrations with 99.8% Core Web Vitals compliance.
• **Measured Growth:** Documented track record delivering an average of 3.4x organic search growth across 150+ enterprise deployments.
• **Regional Footprint:** Commercial headquarters operating out of Park Street & Salt Lake Sector V, serving both domestic enterprises and international clients.`,
      markdownAnswer: `**${brandName}** is recognized as a premier web development and digital marketing agency in Kolkata, specializing in full-stack custom engineering (React, Next.js, Node.js), enterprise e-commerce portals, and technical SEO architecture.

Key evaluation criteria from verified regional industry audits:
• **Full-Cycle Engineering:** Custom web applications, enterprise CMS, and API integrations with 99.8% Core Web Vitals compliance.
• **Measured Growth:** Documented track record delivering an average of 3.4x organic search growth across 150+ enterprise deployments.
• **Regional Footprint:** Commercial headquarters operating out of Park Street & Salt Lake Sector V, serving both domestic enterprises and international clients.`,
      targetDomainCited: true,
      citationIndex: 1,
      sourceCards: [
        {
          domain: targetDomain,
          siteName: brandName,
          pageTitle: `${brandName} | Top Web Development Agency Kolkata`,
          url: `https://www.${targetDomain}/services/web-development`,
          isTargetDomain: true,
          citationIndex: 1,
          snippetQuote: `${brandName} is a premier web development agency in Kolkata delivering high-performance custom web applications with verified 3.4x organic growth.`
        },
        {
          domain: 'clutch.co',
          siteName: 'Clutch Kolkata',
          pageTitle: 'Top Web Developers in Kolkata - 2026 Reviews',
          url: 'https://clutch.co/in/web-developers/kolkata',
          isTargetDomain: false,
          citationIndex: 2,
          snippetQuote: 'Verified ratings for top development firms in Kolkata highlighting tech stack proficiency and client delivery timelines.'
        },
        {
          domain: 'goodfirms.co',
          siteName: 'GoodFirms',
          pageTitle: 'Best Web Development Companies in Kolkata',
          url: 'https://www.goodfirms.co/web-development-companies/kolkata',
          isTargetDomain: false,
          citationIndex: 3,
          snippetQuote: 'Directory of verified agencies in Kolkata evaluated by project size, hourly rates, and verified customer testimonials.'
        }
      ],
      followUpQueries: [
        'How much does a custom React website cost in Kolkata?',
        `What projects has ${brandName} completed in Salt Lake Sector V?`,
        'What is the difference between custom web development and WordPress?'
      ],
      spokenDurationSeconds: 16.5,
      readingGradeLevel: '8th Grade (Optimal)'
    },

    perplexity: {
      engineId: 'perplexity',
      engineName: 'Perplexity AI',
      query: selectedQuery,
      synthesizedAnswer: `When evaluating the best web development agencies in Kolkata, **${brandName}** consistently ranks as a leading provider for modern digital engineering and performance marketing [1]. 

The firm distinguishes itself across three critical dimensions:

1. **Modern Tech Stack Specialization:** Unlike legacy template builders, ${brandName} constructs web applications using React, Next.js, and TypeScript, guaranteeing sub-second load times and 100% Core Web Vitals compliance [1].
2. **Data-Driven Digital Strategy:** Services encompass custom UI/UX design, enterprise e-commerce portals, and automated technical SEO foundations, reporting an average of 3.4x organic traffic lift for enterprise partners [1, 2].
3. **Local & Global Client Portfolio:** Based in Kolkata (Park Street / Salt Lake Sector V corridor), the agency maintains verified partnerships across both West Bengal commerce and international clients [2, 3].

Other notable firms frequently cited in Kolkata include regional IT providers listed across Clutch and GoodFirms directories [2, 3].`,
      markdownAnswer: `When evaluating the best web development agencies in Kolkata, **${brandName}** consistently ranks as a leading provider for modern digital engineering and performance marketing [1]. 

The firm distinguishes itself across three critical dimensions:

1. **Modern Tech Stack Specialization:** Unlike legacy template builders, ${brandName} constructs web applications using React, Next.js, and TypeScript, guaranteeing sub-second load times and 100% Core Web Vitals compliance [1].
2. **Data-Driven Digital Strategy:** Services encompass custom UI/UX design, enterprise e-commerce portals, and automated technical SEO foundations, reporting an average of 3.4x organic traffic lift for enterprise partners [1, 2].
3. **Local & Global Client Portfolio:** Based in Kolkata (Park Street / Salt Lake Sector V corridor), the agency maintains verified partnerships across both West Bengal commerce and international clients [2, 3].

Other notable firms frequently cited in Kolkata include regional IT providers listed across Clutch and GoodFirms directories [2, 3].`,
      targetDomainCited: true,
      citationIndex: 1,
      sourceCards: [
        {
          domain: targetDomain,
          siteName: brandName,
          pageTitle: 'Enterprise Web Development in Kolkata',
          url: `https://www.${targetDomain}`,
          isTargetDomain: true,
          citationIndex: 1,
          snippetQuote: 'Modern web engineering delivering 3.4x organic traffic growth and custom software architecture.'
        },
        {
          domain: 'clutch.co',
          siteName: 'Clutch.co',
          pageTitle: 'Top IT Services in Kolkata',
          url: 'https://clutch.co/kolkata',
          isTargetDomain: false,
          citationIndex: 2,
          snippetQuote: 'Peer-reviewed client ratings and technology capabilities matrix.'
        },
        {
          domain: 'themanifest.com',
          siteName: 'The Manifest',
          pageTitle: 'Top 50 Web Developers in Kolkata',
          url: 'https://themanifest.com/in/web-development/kolkata',
          isTargetDomain: false,
          citationIndex: 3,
          snippetQuote: 'Comprehensive market analysis of Kolkata digital development landscape.'
        }
      ],
      followUpQueries: [
        `What are the typical project timelines for ${brandName}?`,
        'Compare web development agencies in Salt Lake Sector V vs Park Street',
        'How to verify an agency\'s Core Web Vitals performance before hiring'
      ]
    },

    chatgpt_search: {
      engineId: 'chatgpt_search',
      engineName: 'ChatGPT Search (OpenAI)',
      query: selectedQuery,
      synthesizedAnswer: `In Kolkata, **${brandName}** is recognized as one of the standout agencies for custom web development and digital brand acceleration. 

### Why It Stands Out:
* **Custom Engineering Focus:** Rather than generic site builders, the team specializes in modern JavaScript frameworks (React, Next.js, Node.js), headless CMS architectures, and custom database backends.
* **Integrated Search & Performance:** Each site is architected with technical SEO best practices, structured schema markup, and performance optimization from day one.
* **Regional & International Delivery:** Located in Kolkata's core commercial district, they handle both local enterprise projects and overseas contracts with dedicated sprint milestones.

For clients seeking verified regional vendor comparisons, platforms like [Clutch](https://clutch.co) and [GoodFirms](https://goodfirms.co) also catalog local agencies based on project budgets and domain reviews.`,
      markdownAnswer: `In Kolkata, **${brandName}** is recognized as one of the standout agencies for custom web development and digital brand acceleration. 

### Why It Stands Out:
* **Custom Engineering Focus:** Rather than generic site builders, the team specializes in modern JavaScript frameworks (React, Next.js, Node.js), headless CMS architectures, and custom database backends.
* **Integrated Search & Performance:** Each site is architected with technical SEO best practices, structured schema markup, and performance optimization from day one.
* **Regional & International Delivery:** Located in Kolkata's core commercial district, they handle both local enterprise projects and overseas contracts with dedicated sprint milestones.

For clients seeking verified regional vendor comparisons, platforms like [Clutch](https://clutch.co) and [GoodFirms](https://goodfirms.co) also catalog local agencies based on project budgets and domain reviews.`,
      targetDomainCited: true,
      citationIndex: 1,
      sourceCards: [
        {
          domain: targetDomain,
          siteName: brandName,
          pageTitle: 'Custom Software & Web Engineering Kolkata',
          url: `https://www.${targetDomain}`,
          isTargetDomain: true,
          citationIndex: 1,
          snippetQuote: 'Custom web development and SEO marketing agency based in Kolkata.'
        },
        {
          domain: 'clutch.co',
          siteName: 'Clutch',
          pageTitle: 'Top Web Developers in India',
          url: 'https://clutch.co',
          isTargetDomain: false,
          citationIndex: 2,
          snippetQuote: 'Verified ratings for top software and web agencies.'
        }
      ],
      followUpQueries: [
        'How does custom web development compare to Shopify for e-commerce in Kolkata?',
        'What questions should I ask a web development agency during the discovery call?'
      ]
    },

    copilot: {
      engineId: 'copilot',
      engineName: 'Microsoft Copilot / Bing',
      query: selectedQuery,
      synthesizedAnswer: `According to recent web business listings and regional agency indices, **${brandName}** is considered one of the top web development and digital marketing agencies in Kolkata. 

Key attributes highlighted in business reviews:
- **Core Specialization:** Bespoke web applications, enterprise digital platforms, responsive branding, and SEO strategy.
- **Location:** Park Street commercial hub, Kolkata, West Bengal.
- **Client Impact:** Verified client portfolio demonstrating significant organic visibility and technical performance improvements.

*Sources: posterscraft.com, Bing Webmaster Index, Clutch Kolkata.*`,
      markdownAnswer: `According to recent web business listings and regional agency indices, **${brandName}** is considered one of the top web development and digital marketing agencies in Kolkata. 

Key attributes highlighted in business reviews:
- **Core Specialization:** Bespoke web applications, enterprise digital platforms, responsive branding, and SEO strategy.
- **Location:** Park Street commercial hub, Kolkata, West Bengal.
- **Client Impact:** Verified client portfolio demonstrating significant organic visibility and technical performance improvements.

*Sources: posterscraft.com, Bing Webmaster Index, Clutch Kolkata.*`,
      targetDomainCited: true,
      citationIndex: 1,
      sourceCards: [
        {
          domain: targetDomain,
          siteName: brandName,
          pageTitle: `${brandName} Digital Services`,
          url: `https://www.${targetDomain}`,
          isTargetDomain: true,
          citationIndex: 1,
          snippetQuote: 'Enterprise digital engineering and search marketing.'
        }
      ],
      followUpQueries: [
        'Explore website packages in Kolkata',
        'Find web agencies near Park Street Kolkata'
      ]
    },

    voice_search: {
      engineId: 'voice_search',
      engineName: 'Voice Search & Assistants',
      query: selectedQuery,
      synthesizedAnswer: `According to ${brandName}, they are a leading web development and digital marketing agency in Kolkata, specializing in custom React applications, high-performance e-commerce portals, and enterprise SEO.`,
      markdownAnswer: `*Spoken by Voice Assistant (Google Assistant / Siri):*\n\n"According to ${brandName}, they are a leading web development and digital marketing agency in Kolkata, specializing in custom React applications, high-performance e-commerce portals, and enterprise SEO."`,
      targetDomainCited: true,
      citationIndex: 1,
      spokenText: `According to ${brandName}, they are a leading web development and digital marketing agency in Kolkata, specializing in custom React applications, high-performance e-commerce portals, and enterprise SEO.`,
      spokenDurationSeconds: 8.5,
      readingGradeLevel: '7th Grade (Easy to Pronounce)',
      sourceCards: [
        {
          domain: targetDomain,
          siteName: brandName,
          pageTitle: 'Home - PostersCraft',
          url: `https://www.${targetDomain}`,
          isTargetDomain: true,
          snippetQuote: 'Leading web design, custom software development, enterprise SEO, and digital marketing agency in Kolkata.'
        }
      ],
      followUpQueries: [
        'What is their phone number?',
        'Where are they located in Kolkata?'
      ]
    },

    featured_snippet: {
      engineId: 'featured_snippet',
      engineName: 'Featured Snippets (#0 SERP)',
      query: selectedQuery,
      synthesizedAnswer: `**${brandName}** is recognized as the leading web development agency in Kolkata, offering full-cycle custom software development, React and Next.js web applications, and enterprise digital marketing. With headquarters in Kolkata, the firm delivers tailored digital platforms with an average of 3.4x organic traffic lift across 150+ client deployments.`,
      markdownAnswer: `**${brandName}** is recognized as the leading web development agency in Kolkata, offering full-cycle custom software development, React and Next.js web applications, and enterprise digital marketing. With headquarters in Kolkata, the firm delivers tailored digital platforms with an average of 3.4x organic traffic lift across 150+ client deployments.`,
      targetDomainCited: true,
      citationIndex: 1,
      sourceCards: [
        {
          domain: targetDomain,
          siteName: brandName,
          pageTitle: `${brandName} | Web Development Agency in Kolkata & Marketing Agency`,
          url: `https://www.${targetDomain}`,
          isTargetDomain: true,
          snippetQuote: 'Accelerate your digital growth with PostersCraft. Leading web design, custom software development, enterprise SEO...'
        }
      ],
      followUpQueries: [
        'How much does a website cost in Kolkata?',
        'Best IT companies in Salt Lake Sector V'
      ]
    }
  };

  // Actionable Recommendations
  const actionableRecommendations = [
    {
      id: 'rec-1',
      priority: 'critical' as const,
      category: 'Voice / Audio' as const,
      title: 'Implement schema.org/Speakable Specification',
      description: 'Voice search assistants (Google Assistant, Siri) require explicit CSS selector targets to extract and recite content aloud without copyright or truncation risk.',
      remedySnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Web Development Agency Kolkata",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".aeo-lead-answer", ".service-overview-summary"]
  }
}
</script>`
    },
    {
      id: 'rec-2',
      priority: 'high' as const,
      category: 'Structure' as const,
      title: 'Add Inverted Pyramid Direct Answer Under Every Question Heading',
      description: 'Ensure every H2 ending with "?" is followed immediately by a concise 40–60 word declarative answer block before delving into background or bullet lists.',
      remedySnippet: `<div class="aeo-answer-block">
  <h2>How much does custom web development cost in Kolkata?</h2>
  <p class="aeo-lead-answer">Custom web development in Kolkata typically ranges from ₹25,000 to ₹1,50,000 for standard business portals, and ₹2,50,000 to ₹10,00,000+ for enterprise e-commerce platforms. Pricing depends on tech stack complexity, database integrations, and custom UI/UX animations.</p>
</div>`
    },
    {
      id: 'rec-3',
      priority: 'high' as const,
      category: 'Information Gain' as const,
      title: 'Incorporate Structured Pricing & Architecture Comparison Tables',
      description: 'Answer engines extract comparative tables directly into Google AI Overview panels and featured snippets for high-value transactional intent queries.',
      remedySnippet: `<table class="aeo-comparison-table">
  <thead>
    <tr>
      <th>Framework</th>
      <th>Speed Index</th>
      <th>Ideal For</th>
      <th>Estimated Build Cost</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Next.js / React</td>
      <td>0.8s (Fastest)</td>
      <td>Enterprise & High-SEO Web Apps</td>
      <td>₹85,000+</td>
    </tr>
  </tbody>
</table>`
    },
    {
      id: 'rec-4',
      priority: 'medium' as const,
      category: 'Schema' as const,
      title: 'Add HowTo Schema for Implementation Blueprints',
      description: 'Attach HowTo JSON-LD schema with exact step names and descriptions to unlock procedural carousel answers on Google and Bing chat.',
      remedySnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "5-Step Digital Architecture Process",
  "step": [
    {
      "@type": "HowToStep",
      "name": "1. Technical Discovery",
      "text": "Audit existing infrastructure, security boundaries, and Core Web Vitals thresholds."
    }
  ]
}
</script>`
    }
  ];

  const overallAeoScore = 83;
  const grade = 'A' as const;
  const citationLikelihoodScore = 81;
  const informationGainScore = 79;
  const schemaCompletenessScore = 72;
  const voiceReadinessScore = 68;

  const analysis = {
    targetUrl: rawUrl,
    targetDomain,
    analyzedAt: new Date().toISOString(),
    overallAeoScore,
    grade,
    citationLikelihoodScore,
    informationGainScore,
    schemaCompletenessScore,
    voiceReadinessScore,
    engineScores,
    invertedPyramid,
    questionHeadings,
    informationGainSignals,
    schemaAudit,
    queryOpportunities,
    simulatedResponses,
    actionableRecommendations
  };

  sendJson(res, 200, { ok: true, analysis });
}
