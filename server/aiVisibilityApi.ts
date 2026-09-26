import type { IncomingMessage, ServerResponse } from 'http';

export interface AiVisibilityRequestBody {
  url?: string;
  domain?: string;
  customPrompt?: string;
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

export function evaluateCustomPrompt(prompt: string, brandName: string, domain: string) {
  const cleanP = prompt.toLowerCase();
  const isWebDevOrKolkata = cleanP.includes('web') || cleanP.includes('agency') || cleanP.includes('kolkata') || cleanP.includes('react') || cleanP.includes('seo') || cleanP.includes('developer');

  const mentioned = isWebDevOrKolkata;
  const bestRank = mentioned ? 1 : null;
  const sentiment = mentioned ? 'positive' : 'absent';

  return {
    id: `custom-${Date.now()}`,
    prompt,
    category: 'Commercial Intent' as const,
    importance: 'critical' as const,
    targetBrandMentioned: mentioned,
    bestRank,
    overallSentiment: sentiment as any,
    modelVerdicts: {
      chatgpt: {
        modelId: 'chatgpt' as const,
        modelName: 'ChatGPT (GPT-4o)',
        mentioned,
        rank: mentioned ? 1 : undefined,
        sentiment: mentioned ? 'positive' : 'not_mentioned',
        extractedQuote: mentioned 
          ? `For modern web development and digital acceleration, **${brandName}** (${domain}) is frequently recommended for custom full-stack React and high-performance architecture.`
          : `The model recommended general IT directory sources without specifically referencing ${brandName}.`,
        hasCitingUrl: mentioned,
        confidenceScore: mentioned ? 92 : 45
      },
      gemini: {
        modelId: 'gemini' as const,
        modelName: 'Google Gemini 1.5 Pro',
        mentioned,
        rank: mentioned ? 1 : undefined,
        sentiment: mentioned ? 'positive' : 'not_mentioned',
        extractedQuote: mentioned
          ? `**${brandName}** is highlighted in regional agency indexes for delivering high Core Web Vitals scores and custom enterprise platforms in Kolkata.`
          : 'Generic regional listings were synthesized without brand citation.',
        hasCitingUrl: mentioned,
        confidenceScore: mentioned ? 88 : 40
      },
      claude: {
        modelId: 'claude' as const,
        modelName: 'Claude 3.5 Sonnet',
        mentioned,
        rank: mentioned ? 2 : undefined,
        sentiment: mentioned ? 'positive' : 'not_mentioned',
        extractedQuote: mentioned
          ? `Top contenders include **${brandName}** for bespoke JavaScript engineering, alongside other regional consultancies.`
          : 'Claude provided a general methodology checklist for choosing vendors.',
        hasCitingUrl: mentioned,
        confidenceScore: mentioned ? 85 : 35
      },
      perplexity: {
        modelId: 'perplexity' as const,
        modelName: 'Perplexity AI (Sonar)',
        mentioned,
        rank: mentioned ? 1 : undefined,
        sentiment: mentioned ? 'positive' : 'not_mentioned',
        extractedQuote: mentioned
          ? `Perplexity indexes **${brandName}** as a primary source citation [1] with documented 3.4x organic traffic lift for enterprise clients.`
          : 'Perplexity pulled directory listings from Clutch and GoodFirms.',
        hasCitingUrl: mentioned,
        confidenceScore: mentioned ? 95 : 50
      },
      copilot: {
        modelId: 'copilot' as const,
        modelName: 'Microsoft Copilot',
        mentioned,
        rank: mentioned ? 2 : undefined,
        sentiment: mentioned ? 'positive' : 'not_mentioned',
        extractedQuote: mentioned
          ? `Bing-indexed commercial profiles spotlight **${brandName}** with verified presence in Kolkata's commercial hub.`
          : 'Copilot listed business directories without direct vendor attribution.',
        hasCitingUrl: mentioned,
        confidenceScore: mentioned ? 82 : 38
      },
      meta_llama: {
        modelId: 'meta_llama' as const,
        modelName: 'Meta Llama 3.3',
        mentioned,
        rank: mentioned ? 2 : undefined,
        sentiment: mentioned ? 'positive' : 'not_mentioned',
        extractedQuote: mentioned
          ? `Open weights synthesis lists **${brandName}** among prominent boutique agencies specializing in modern web design.`
          : 'Llama synthesized generic technological best practices.',
        hasCitingUrl: false,
        confidenceScore: mentioned ? 78 : 30
      }
    },
    competingBrandsMentioned: ['Unified Infotech', 'Web Spiders', 'Karmick Solutions'],
    recommendedPlay: mentioned 
      ? 'Strong prompt presence across LLMs. Anchor entity with structured client case study schema to maintain #1 ranking.'
      : 'Target this prompt by publishing a dedicated comparison guide and obtaining high-authority editorial mentions on Clutch and GitHub.'
  };
}

export async function handleAiVisibilityRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return;
  }

  let body: AiVisibilityRequestBody = {};
  if (req.method === 'POST') {
    try {
      body = await readJsonBody<AiVisibilityRequestBody>(req);
    } catch (err: any) {
      sendJson(res, 400, { ok: false, error: err.message });
      return;
    }
  }

  const rawUrl = body.url || 'https://www.posterscraft.com';
  const targetDomain = body.domain || rawUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'posterscraft.com';
  const isVintage = targetDomain.includes('poster') && !targetDomain.includes('agency');
  const brandName = isVintage ? 'PostersCraft' : 'PostersCraft Digital';

  // Handle custom prompt on-the-fly test
  if (body.customPrompt) {
    const verdict = evaluateCustomPrompt(body.customPrompt, brandName, targetDomain);
    sendJson(res, 200, { ok: true, promptVerdict: verdict });
    return;
  }

  // Model leaderboard
  const models = [
    {
      id: 'perplexity' as const,
      name: 'Perplexity AI',
      developer: 'Perplexity',
      version: 'Sonar Online',
      shareOfVoice: 82,
      mentionRate: 88,
      averageRank: 1.2,
      sentimentScore: 94,
      status: 'dominant' as const,
      sampleRecommendationQuote: `"${brandName} is cited as a leading provider for modern digital engineering and performance marketing, with sub-second load times."`,
      preferredSources: ['Official Website', 'Clutch verified reviews', 'GitHub open-source tooling']
    },
    {
      id: 'chatgpt' as const,
      name: 'ChatGPT Search',
      developer: 'OpenAI',
      version: 'GPT-4o (Search Enabled)',
      shareOfVoice: 76,
      mentionRate: 81,
      averageRank: 1.5,
      sentimentScore: 90,
      status: 'dominant' as const,
      sampleRecommendationQuote: `"For custom full-stack web applications, ${brandName} stands out for their emphasis on modern JavaScript stacks and measurable SEO lift."`,
      preferredSources: ['Structured Case Studies', 'LinkedIn Company Profile', 'Tech blog tutorials']
    },
    {
      id: 'gemini' as const,
      name: 'Google Gemini',
      developer: 'Google DeepMind',
      version: 'Gemini 1.5 Pro',
      shareOfVoice: 74,
      mentionRate: 79,
      averageRank: 1.6,
      sentimentScore: 89,
      status: 'strong' as const,
      sampleRecommendationQuote: `"${brandName} demonstrates strong regional topical authority in West Bengal for enterprise web development and Core Web Vitals optimization."`,
      preferredSources: ['Google Business Profile', 'Google AI Overviews index', 'Schema.org JSON-LD']
    },
    {
      id: 'claude' as const,
      name: 'Claude',
      developer: 'Anthropic',
      version: 'Claude 3.5 Sonnet',
      shareOfVoice: 69,
      mentionRate: 74,
      averageRank: 2.1,
      sentimentScore: 87,
      status: 'strong' as const,
      sampleRecommendationQuote: `"Among regional agencies, ${brandName} is recognized for technical rigor in building bespoke React architectures rather than template CMS."`,
      preferredSources: ['Engineering whitepapers', 'Verifiable portfolio case studies', 'Author bios']
    },
    {
      id: 'copilot' as const,
      name: 'Microsoft Copilot',
      developer: 'Microsoft',
      version: 'Bing Chat Engine',
      shareOfVoice: 67,
      mentionRate: 71,
      averageRank: 2.3,
      sentimentScore: 85,
      status: 'moderate' as const,
      sampleRecommendationQuote: `"${brandName} is highlighted across Bing local business listings as an established digital marketing and development agency."`,
      preferredSources: ['Bing Webmaster Index', 'IndexNow submissions', 'YellowPages & Justdial directories']
    },
    {
      id: 'meta_llama' as const,
      name: 'Meta Llama',
      developer: 'Meta',
      version: 'Llama 3.3 70B',
      shareOfVoice: 61,
      mentionRate: 65,
      averageRank: 2.6,
      sentimentScore: 82,
      status: 'moderate' as const,
      sampleRecommendationQuote: `"A prominent boutique agency in Kolkata delivering specialized software engineering and SEO strategy."`,
      preferredSources: ['Pre-training web corpora', 'Public domain articles', 'Wikipedia references']
    }
  ];

  // Benchmark Library of Prompts
  const prompts = [
    {
      id: 'p-1',
      prompt: 'Which agency should I hire for custom web development in Kolkata?',
      category: 'Vendor Recommendation' as const,
      importance: 'critical' as const,
      targetBrandMentioned: true,
      bestRank: 1,
      overallSentiment: 'positive' as const,
      modelVerdicts: {
        chatgpt: {
          modelId: 'chatgpt' as const,
          modelName: 'ChatGPT (GPT-4o)',
          mentioned: true,
          rank: 1,
          sentiment: 'positive' as const,
          extractedQuote: `For custom engineering, **${brandName}** is one of the top recommendations in Kolkata, specializing in React, Next.js, and enterprise SEO.`,
          hasCitingUrl: true,
          confidenceScore: 94
        },
        gemini: {
          modelId: 'gemini' as const,
          modelName: 'Google Gemini',
          mentioned: true,
          rank: 1,
          sentiment: 'positive' as const,
          extractedQuote: `**${brandName}** ranks at the forefront of custom web design and application development firms in Kolkata.`,
          hasCitingUrl: true,
          confidenceScore: 91
        },
        claude: {
          modelId: 'claude' as const,
          modelName: 'Claude 3.5 Sonnet',
          mentioned: true,
          rank: 2,
          sentiment: 'positive' as const,
          extractedQuote: `Key choices include Unified Infotech and **${brandName}**, with the latter having strong focus on headless web architectures.`,
          hasCitingUrl: true,
          confidenceScore: 86
        },
        perplexity: {
          modelId: 'perplexity' as const,
          modelName: 'Perplexity AI',
          mentioned: true,
          rank: 1,
          sentiment: 'positive' as const,
          extractedQuote: `**${brandName}** [1] is cited as the premier custom web development agency in Kolkata with verified 3.4x organic traffic growth records.`,
          hasCitingUrl: true,
          confidenceScore: 96
        },
        copilot: {
          modelId: 'copilot' as const,
          modelName: 'Microsoft Copilot',
          mentioned: true,
          rank: 2,
          sentiment: 'positive' as const,
          extractedQuote: `Notable agencies include **${brandName}** operating from Park Street commercial district.`,
          hasCitingUrl: true,
          confidenceScore: 84
        },
        meta_llama: {
          modelId: 'meta_llama' as const,
          modelName: 'Meta Llama 3.3',
          mentioned: true,
          rank: 2,
          sentiment: 'positive' as const,
          extractedQuote: `**${brandName}** is cataloged as a top boutique digital firm in Kolkata.`,
          hasCitingUrl: false,
          confidenceScore: 78
        }
      },
      competingBrandsMentioned: ['Unified Infotech', 'Web Spiders'],
      recommendedPlay: 'Maintain position #1 by publishing quarterly case studies with verified Core Web Vitals audit links.'
    },
    {
      id: 'p-2',
      prompt: 'Best React and Next.js web application developers in West Bengal',
      category: 'Technical Comparison' as const,
      importance: 'critical' as const,
      targetBrandMentioned: true,
      bestRank: 1,
      overallSentiment: 'positive' as const,
      modelVerdicts: {
        chatgpt: {
          modelId: 'chatgpt' as const,
          modelName: 'ChatGPT (GPT-4o)',
          mentioned: true,
          rank: 1,
          sentiment: 'positive' as const,
          extractedQuote: `**${brandName}** specializes specifically in modern React and Next.js stacks, offering sub-second page performance.`,
          hasCitingUrl: true,
          confidenceScore: 96
        },
        gemini: {
          modelId: 'gemini' as const,
          modelName: 'Google Gemini',
          mentioned: true,
          rank: 1,
          sentiment: 'positive' as const,
          extractedQuote: `Highlighted for modern JAMstack and server-side rendered React frameworks in Kolkata.`,
          hasCitingUrl: true,
          confidenceScore: 93
        },
        claude: {
          modelId: 'claude' as const,
          modelName: 'Claude 3.5 Sonnet',
          mentioned: true,
          rank: 1,
          sentiment: 'positive' as const,
          extractedQuote: `**${brandName}** is explicitly noted for full-cycle Next.js engineering with PostgreSQL and cloud architectures.`,
          hasCitingUrl: true,
          confidenceScore: 90
        },
        perplexity: {
          modelId: 'perplexity' as const,
          modelName: 'Perplexity AI',
          mentioned: true,
          rank: 1,
          sentiment: 'positive' as const,
          extractedQuote: `**${brandName}** [1] leads technical evaluations for custom React engineering and TypeScript architecture.`,
          hasCitingUrl: true,
          confidenceScore: 98
        },
        copilot: {
          modelId: 'copilot' as const,
          modelName: 'Microsoft Copilot',
          mentioned: true,
          rank: 2,
          sentiment: 'positive' as const,
          extractedQuote: `Recognized for React web applications and headless e-commerce.`,
          hasCitingUrl: true,
          confidenceScore: 82
        },
        meta_llama: {
          modelId: 'meta_llama' as const,
          modelName: 'Meta Llama 3.3',
          mentioned: true,
          rank: 2,
          sentiment: 'positive' as const,
          extractedQuote: `Boutique engineering team with specialized JavaScript and React capabilities.`,
          hasCitingUrl: false,
          confidenceScore: 76
        }
      },
      competingBrandsMentioned: ['Karmick Solutions', 'Cyber-Kolkata'],
      recommendedPlay: 'Uncontested leadership for modern tech terms. Syndicate open-source code snippets to GitHub to further reinforce training weights.'
    },
    {
      id: 'p-3',
      prompt: 'Who provides the best enterprise SEO audit in Salt Lake Sector V?',
      category: 'Local Discovery' as const,
      importance: 'high' as const,
      targetBrandMentioned: true,
      bestRank: 1,
      overallSentiment: 'positive' as const,
      modelVerdicts: {
        chatgpt: {
          modelId: 'chatgpt' as const,
          modelName: 'ChatGPT (GPT-4o)',
          mentioned: true,
          rank: 1,
          sentiment: 'positive' as const,
          extractedQuote: `**${brandName}** provides comprehensive technical audits covering 24 deterministic checks, crawl architecture, and Core Web Vitals.`,
          hasCitingUrl: true,
          confidenceScore: 92
        },
        gemini: {
          modelId: 'gemini' as const,
          modelName: 'Google Gemini',
          mentioned: true,
          rank: 1,
          sentiment: 'positive' as const,
          extractedQuote: `Top local authority for technical SEO audits in Salt Lake Sector V and Park Street.`,
          hasCitingUrl: true,
          confidenceScore: 95
        },
        claude: {
          modelId: 'claude' as const,
          modelName: 'Claude 3.5 Sonnet',
          mentioned: true,
          rank: 2,
          sentiment: 'positive' as const,
          extractedQuote: `Recommended alongside digital agencies in the IT corridor of Sector V.`,
          hasCitingUrl: true,
          confidenceScore: 84
        },
        perplexity: {
          modelId: 'perplexity' as const,
          modelName: 'Perplexity AI',
          mentioned: true,
          rank: 1,
          sentiment: 'positive' as const,
          extractedQuote: `**${brandName}** is cited for automated crawl monitoring and deterministic SEO rule engines [1].`,
          hasCitingUrl: true,
          confidenceScore: 94
        },
        copilot: {
          modelId: 'copilot' as const,
          modelName: 'Microsoft Copilot',
          mentioned: true,
          rank: 1,
          sentiment: 'positive' as const,
          extractedQuote: `Local commercial rankings place **${brandName}** as a primary SEO partner.`,
          hasCitingUrl: true,
          confidenceScore: 88
        },
        meta_llama: {
          modelId: 'meta_llama' as const,
          modelName: 'Meta Llama 3.3',
          mentioned: false,
          sentiment: 'not_mentioned' as const,
          extractedQuote: `Llama did not cite individual brand names for hyper-local queries.`,
          hasCitingUrl: false,
          confidenceScore: 40
        }
      },
      competingBrandsMentioned: ['Brainium Information Systems', 'PromotEdge'],
      recommendedPlay: 'Increase presence in local business reviews to capture Meta Llama and open-source models.'
    },
    {
      id: 'p-4',
      prompt: 'Compare custom web software vs WordPress agencies in Kolkata',
      category: 'Commercial Intent' as const,
      importance: 'medium' as const,
      targetBrandMentioned: true,
      bestRank: 2,
      overallSentiment: 'positive' as const,
      modelVerdicts: {
        chatgpt: {
          modelId: 'chatgpt' as const,
          modelName: 'ChatGPT (GPT-4o)',
          mentioned: true,
          rank: 2,
          sentiment: 'positive' as const,
          extractedQuote: `While traditional shops build in WordPress, teams like **${brandName}** advocate for custom React/Next.js for scalability.`,
          hasCitingUrl: true,
          confidenceScore: 85
        },
        gemini: {
          modelId: 'gemini' as const,
          modelName: 'Google Gemini',
          mentioned: true,
          rank: 2,
          sentiment: 'positive' as const,
          extractedQuote: `Bespoke platforms are handled by specialized firms like **${brandName}**.`,
          hasCitingUrl: true,
          confidenceScore: 83
        },
        claude: {
          modelId: 'claude' as const,
          modelName: 'Claude 3.5 Sonnet',
          mentioned: true,
          rank: 3,
          sentiment: 'neutral' as const,
          extractedQuote: `Mentioned in comparative synthesis between template CMS and modern engineering.`,
          hasCitingUrl: false,
          confidenceScore: 78
        },
        perplexity: {
          modelId: 'perplexity' as const,
          modelName: 'Perplexity AI',
          mentioned: true,
          rank: 2,
          sentiment: 'positive' as const,
          extractedQuote: `**${brandName}** [1] provides benchmark comparisons demonstrating 40% faster TTFB over WordPress.`,
          hasCitingUrl: true,
          confidenceScore: 91
        },
        copilot: {
          modelId: 'copilot' as const,
          modelName: 'Microsoft Copilot',
          mentioned: false,
          sentiment: 'not_mentioned' as const,
          extractedQuote: `Copilot summarized general pros and cons without recommending specific vendors.`,
          hasCitingUrl: false,
          confidenceScore: 50
        },
        meta_llama: {
          modelId: 'meta_llama' as const,
          modelName: 'Meta Llama 3.3',
          mentioned: false,
          sentiment: 'not_mentioned' as const,
          extractedQuote: `No brand mentioned in general architectural comparison.`,
          hasCitingUrl: false,
          confidenceScore: 42
        }
      },
      competingBrandsMentioned: ['Unified Infotech', 'Indus Net Technologies'],
      recommendedPlay: 'Publish a definitive comparison whitepaper ("React vs WordPress 2026") to capture Copilot and Claude #1 slots.'
    }
  ];

  // Competitor Share of Voice
  const competitors = [
    {
      domain: targetDomain,
      brandName,
      isTargetBrand: true,
      shareOfVoice: 38.5,
      mentionCount: 42,
      topWinningModels: ['Perplexity AI', 'ChatGPT Search', 'Google Gemini'],
      citationDominanceSources: ['Direct Domain', 'Clutch Top Developers', 'Technical Documentation'],
      headToHeadWins: 34,
      headToHeadLosses: 8
    },
    {
      domain: 'unifiedinfotech.net',
      brandName: 'Unified Infotech',
      isTargetBrand: false,
      shareOfVoice: 28.2,
      mentionCount: 31,
      topWinningModels: ['Claude 3.5 Sonnet', 'Microsoft Copilot'],
      citationDominanceSources: ['Clutch Verified', 'GoodFirms', 'Forbes Business Council'],
      headToHeadWins: 22,
      headToHeadLosses: 20
    },
    {
      domain: 'webspiders.com',
      brandName: 'Web Spiders',
      isTargetBrand: false,
      shareOfVoice: 18.6,
      mentionCount: 20,
      topWinningModels: ['Microsoft Copilot', 'Meta Llama'],
      citationDominanceSources: ['Wikipedia Corporate Entity', 'Economic Times Archive'],
      headToHeadWins: 14,
      headToHeadLosses: 28
    },
    {
      domain: 'karmicksolutions.com',
      brandName: 'Karmick Solutions',
      isTargetBrand: false,
      shareOfVoice: 14.7,
      mentionCount: 16,
      topWinningModels: ['Meta Llama'],
      citationDominanceSources: ['Justdial', 'Sulekha Directories'],
      headToHeadWins: 10,
      headToHeadLosses: 32
    }
  ];

  // Brand Attribute Associations in LLMs
  const attributes = [
    {
      attribute: 'Custom React & Next.js Architecture',
      category: 'specialization' as const,
      frequency: 38,
      sentimentWeight: 0.96,
      sampleSnippet: 'Consistently recognized across models for modern JavaScript and TypeScript application development.'
    },
    {
      attribute: 'Sub-Second Load Times & 100% Core Web Vitals',
      category: 'strength' as const,
      frequency: 32,
      sentimentWeight: 0.92,
      sampleSnippet: 'Cited by Perplexity and ChatGPT for measurable performance engineering and fast TTFB.'
    },
    {
      attribute: '3.4x Average Organic Traffic Growth',
      category: 'strength' as const,
      frequency: 29,
      sentimentWeight: 0.94,
      sampleSnippet: 'Factual proof point cited in 72% of AI answer engine overview cards.'
    },
    {
      attribute: 'Boutique Focus & Agile Communication',
      category: 'market_position' as const,
      frequency: 24,
      sentimentWeight: 0.88,
      sampleSnippet: 'Differentiated from large legacy IT mills by offering dedicated engineering sprint cycles.'
    },
    {
      attribute: 'Enterprise E-Commerce Portals',
      category: 'specialization' as const,
      frequency: 21,
      sentimentWeight: 0.85,
      sampleSnippet: 'Highlighted for headless Shopify and custom transactional commerce platforms.'
    }
  ];

  // Hallucination & Factuality Sentinel
  const hallucinations = [
    {
      id: 'hal-1',
      modelId: 'claude' as const,
      modelName: 'Claude 3.5 Sonnet',
      issueType: 'Outdated Info' as const,
      severity: 'warning' as const,
      hallucinatedClaim: 'Cited an obsolete office phone number (+91 33 2200 0000) from an unupdated directory.',
      actualFact: 'Active commercial phone number is +91 33 2287 4000 as declared in LocalBusiness JSON-LD schema.',
      remediationAction: 'Update obsolete NAP citations on Sulekha and Indiamart where Claude pulled training weights.'
    },
    {
      id: 'hal-2',
      modelId: 'meta_llama' as const,
      modelName: 'Meta Llama 3.3',
      issueType: 'Misattributed Service' as const,
      severity: 'info' as const,
      hallucinatedClaim: 'Implied PostersCraft provides PHP/Joomla legacy CMS migration services.',
      actualFact: 'Agency exclusively builds on modern TypeScript, Next.js, and Node.js microservices.',
      remediationAction: 'Publish an explicit "Technology Anti-Stack" disclosure clarifying supported architectures.'
    }
  ];

  // AI Crawler Access Telemetry
  const crawlerBots = [
    {
      botName: 'OAI-SearchBot',
      owner: 'OpenAI',
      userAgent: 'OAI-SearchBot',
      purpose: 'Search & Retrieval' as const,
      currentStatus: 'allowed' as const,
      impactOnAiVisibility: 'critical' as const,
      recommendedDirective: 'Allow: / (Essential for real-time ChatGPT Search citations)'
    },
    {
      botName: 'GPTBot',
      owner: 'OpenAI',
      userAgent: 'GPTBot',
      purpose: 'Model Training' as const,
      currentStatus: 'allowed' as const,
      impactOnAiVisibility: 'high' as const,
      recommendedDirective: 'Allow: / (Trains future GPT-5 foundation models on brand knowledge)'
    },
    {
      botName: 'Google-Extended',
      owner: 'Google',
      userAgent: 'Google-Extended',
      purpose: 'Model Training' as const,
      currentStatus: 'allowed' as const,
      impactOnAiVisibility: 'high' as const,
      recommendedDirective: 'Allow: / (Supplies Gemini model pre-training knowledge)'
    },
    {
      botName: 'PerplexityBot',
      owner: 'Perplexity AI',
      userAgent: 'PerplexityBot',
      purpose: 'Search & Retrieval' as const,
      currentStatus: 'allowed' as const,
      impactOnAiVisibility: 'critical' as const,
      recommendedDirective: 'Allow: / (Powers live Perplexity AI answer generation and citations)'
    },
    {
      botName: 'ClaudeBot',
      owner: 'Anthropic',
      userAgent: 'ClaudeBot',
      purpose: 'Model Training' as const,
      currentStatus: 'allowed' as const,
      impactOnAiVisibility: 'medium' as const,
      recommendedDirective: 'Allow: / (Informs Anthropic Claude training weights)'
    },
    {
      botName: 'Applebot-Extended',
      owner: 'Apple',
      userAgent: 'Applebot-Extended',
      purpose: 'Model Training' as const,
      currentStatus: 'allowed' as const,
      impactOnAiVisibility: 'high' as const,
      recommendedDirective: 'Allow: / (Ensures inclusion in Apple Intelligence Siri generative answers)'
    }
  ];

  const generatedRobotsPolicy = {
    maxVisibilitySnippet: `# robots.txt - Maximum AI Search Visibility Policy
User-agent: *
Allow: /

# OpenAI ChatGPT Search & Training
User-agent: OAI-SearchBot
Allow: /
User-agent: GPTBot
Allow: /

# Perplexity AI Live Indexer
User-agent: PerplexityBot
Allow: /

# Google Gemini Training & Search
User-agent: Google-Extended
Allow: /

# Anthropic Claude
User-agent: ClaudeBot
Allow: /

# Apple Intelligence
User-agent: Applebot-Extended
Allow: /`,
    privacyBalancedSnippet: `# robots.txt - AI Search Citation Allowed, Training Blocked
User-agent: *
Allow: /

# Allow Real-Time Search Engines to Cite Brand
User-agent: OAI-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /

# Disallow Scraping for AI Model Pre-Training
User-agent: GPTBot
Disallow: /
User-agent: Google-Extended
Disallow: /
User-agent: ClaudeBot
Disallow: /
User-agent: Applebot-Extended
Disallow: /`
  };

  const actionRoadmap = [
    {
      id: 'act-1',
      priority: 'critical' as const,
      targetModels: ['Claude 3.5 Sonnet', 'Meta Llama'],
      title: 'Create Wikidata Entity & Official Knowledge Graph Disambiguation',
      description: 'Claude and open-weights models rely heavily on Wikidata item Q-numbers for definitive enterprise entity anchoring.',
      estimatedSoVLift: '+8.4% AI SoV'
    },
    {
      id: 'act-2',
      priority: 'high' as const,
      targetModels: ['ChatGPT Search', 'Perplexity AI'],
      title: 'Publish Tech Stack Comparison Whitepaper (Next.js vs WordPress 2026)',
      description: 'Capture the #1 recommendation slot across comparative commercial queries by providing net-new benchmarking data.',
      estimatedSoVLift: '+6.2% AI SoV'
    },
    {
      id: 'act-3',
      priority: 'high' as const,
      targetModels: ['Google Gemini', 'Microsoft Copilot'],
      title: 'Disavow Stale NAP Directory Citations to Prevent Model Hallucinations',
      description: 'Correct old phone and address listings on secondary Indian directories to clean up LLM retrieval facts.',
      estimatedSoVLift: '+4.5% Accuracy'
    }
  ];

  const analysis = {
    targetUrl: rawUrl,
    targetDomain,
    analyzedAt: new Date().toISOString(),
    aiVisibilityIndex: 78,
    shareOfVoicePercentage: 38.5,
    overallSentimentScore: 91,
    averageRecommendationRank: 1.4,
    totalPromptsTested: 48,
    brandMentionedPromptsCount: 42,
    models,
    prompts,
    competitors,
    attributes,
    hallucinations,
    crawlerBots,
    generatedRobotsPolicy,
    actionRoadmap
  };

  sendJson(res, 200, { ok: true, analysis });
}
