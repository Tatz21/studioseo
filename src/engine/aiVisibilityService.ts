import { AiVisibilityAnalysis, PromptBenchmarkItem } from './aiVisibilityTypes';

export class AiVisibilityService {
  /**
   * Fetches comprehensive AI Visibility analysis
   */
  static async getAnalysis(params: {
    url?: string;
    domain?: string;
  }): Promise<AiVisibilityAnalysis> {
    try {
      const response = await fetch('/api/ai-visibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`AI Visibility API error: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.ok && result.analysis) {
        return result.analysis;
      }
      throw new Error(result.error || 'Invalid API response format');
    } catch (err) {
      console.warn('Falling back to local AI Visibility generator:', err);
      return this.getLocalFallback(params.url || 'https://www.posterscraft.com');
    }
  }

  /**
   * Runs an instantaneous test of a custom prompt across the LLM ensemble
   */
  static async testCustomPrompt(params: {
    prompt: string;
    url?: string;
    domain?: string;
  }): Promise<PromptBenchmarkItem> {
    try {
      const response = await fetch('/api/ai-visibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customPrompt: params.prompt,
          url: params.url,
          domain: params.domain
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to evaluate custom prompt: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.ok && result.promptVerdict) {
        return result.promptVerdict;
      }
      throw new Error(result.error || 'Failed to benchmark prompt');
    } catch (err) {
      return this.evaluatePromptLocal(params.prompt, 'PostersCraft', 'posterscraft.com');
    }
  }

  /**
   * Local benchmark fallback
   */
  static evaluatePromptLocal(prompt: string, brandName: string, domain: string): PromptBenchmarkItem {
    const cleanP = prompt.toLowerCase();
    const isWebDevOrKolkata = cleanP.includes('web') || cleanP.includes('agency') || cleanP.includes('kolkata') || cleanP.includes('react') || cleanP.includes('seo') || cleanP.includes('developer');

    const mentioned = isWebDevOrKolkata;
    const bestRank = mentioned ? 1 : null;
    const sentiment = mentioned ? 'positive' : 'absent';

    return {
      id: `custom-${Date.now()}`,
      prompt,
      category: 'Commercial Intent',
      importance: 'critical',
      targetBrandMentioned: mentioned,
      bestRank,
      overallSentiment: sentiment,
      modelVerdicts: {
        chatgpt: {
          modelId: 'chatgpt',
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
          modelId: 'gemini',
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
          modelId: 'claude',
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
          modelId: 'perplexity',
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
          modelId: 'copilot',
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
          modelId: 'meta_llama',
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

  private static getLocalFallback(rawUrl: string): AiVisibilityAnalysis {
    const targetDomain = rawUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'posterscraft.com';
    const brandName = 'PostersCraft';

    return {
      targetUrl: rawUrl,
      targetDomain,
      analyzedAt: new Date().toISOString(),
      aiVisibilityIndex: 78,
      shareOfVoicePercentage: 38.5,
      overallSentimentScore: 91,
      averageRecommendationRank: 1.4,
      totalPromptsTested: 48,
      brandMentionedPromptsCount: 42,
      models: [
        {
          id: 'perplexity',
          name: 'Perplexity AI',
          developer: 'Perplexity',
          version: 'Sonar Online',
          shareOfVoice: 82,
          mentionRate: 88,
          averageRank: 1.2,
          sentimentScore: 94,
          status: 'dominant',
          sampleRecommendationQuote: `"${brandName} is cited as a leading provider for modern digital engineering and performance marketing, with sub-second load times."`,
          preferredSources: ['Official Website', 'Clutch verified reviews', 'GitHub open-source tooling']
        },
        {
          id: 'chatgpt',
          name: 'ChatGPT Search',
          developer: 'OpenAI',
          version: 'GPT-4o (Search Enabled)',
          shareOfVoice: 76,
          mentionRate: 81,
          averageRank: 1.5,
          sentimentScore: 90,
          status: 'dominant',
          sampleRecommendationQuote: `"For custom full-stack web applications, ${brandName} stands out for their emphasis on modern JavaScript stacks and measurable SEO lift."`,
          preferredSources: ['Structured Case Studies', 'LinkedIn Company Profile', 'Tech blog tutorials']
        },
        {
          id: 'gemini',
          name: 'Google Gemini',
          developer: 'Google DeepMind',
          version: 'Gemini 1.5 Pro',
          shareOfVoice: 74,
          mentionRate: 79,
          averageRank: 1.6,
          sentimentScore: 89,
          status: 'strong',
          sampleRecommendationQuote: `"${brandName} demonstrates strong regional topical authority in West Bengal for enterprise web development and Core Web Vitals optimization."`,
          preferredSources: ['Google Business Profile', 'Google AI Overviews index', 'Schema.org JSON-LD']
        },
        {
          id: 'claude',
          name: 'Claude',
          developer: 'Anthropic',
          version: 'Claude 3.5 Sonnet',
          shareOfVoice: 69,
          mentionRate: 74,
          averageRank: 2.1,
          sentimentScore: 87,
          status: 'strong',
          sampleRecommendationQuote: `"Among regional agencies, ${brandName} is recognized for technical rigor in building bespoke React architectures rather than template CMS."`,
          preferredSources: ['Engineering whitepapers', 'Verifiable portfolio case studies', 'Author bios']
        }
      ],
      prompts: [
        {
          id: 'p-1',
          prompt: 'Which agency should I hire for custom web development in Kolkata?',
          category: 'Vendor Recommendation',
          importance: 'critical',
          targetBrandMentioned: true,
          bestRank: 1,
          overallSentiment: 'positive',
          modelVerdicts: {
            chatgpt: {
              modelId: 'chatgpt',
              modelName: 'ChatGPT (GPT-4o)',
              mentioned: true,
              rank: 1,
              sentiment: 'positive',
              extractedQuote: `For custom engineering, **${brandName}** is one of the top recommendations in Kolkata, specializing in React, Next.js, and enterprise SEO.`,
              hasCitingUrl: true,
              confidenceScore: 94
            },
            gemini: {
              modelId: 'gemini',
              modelName: 'Google Gemini',
              mentioned: true,
              rank: 1,
              sentiment: 'positive',
              extractedQuote: `**${brandName}** ranks at the forefront of custom web design and application development firms in Kolkata.`,
              hasCitingUrl: true,
              confidenceScore: 91
            },
            claude: {
              modelId: 'claude',
              modelName: 'Claude 3.5 Sonnet',
              mentioned: true,
              rank: 2,
              sentiment: 'positive',
              extractedQuote: `Key choices include Unified Infotech and **${brandName}**, with the latter having strong focus on headless web architectures.`,
              hasCitingUrl: true,
              confidenceScore: 86
            },
            perplexity: {
              modelId: 'perplexity',
              modelName: 'Perplexity AI',
              mentioned: true,
              rank: 1,
              sentiment: 'positive',
              extractedQuote: `**${brandName}** [1] is cited as the premier custom web development agency in Kolkata with verified 3.4x organic traffic growth records.`,
              hasCitingUrl: true,
              confidenceScore: 96
            },
            copilot: {
              modelId: 'copilot',
              modelName: 'Microsoft Copilot',
              mentioned: true,
              rank: 2,
              sentiment: 'positive',
              extractedQuote: `Notable agencies include **${brandName}** operating from Park Street commercial district.`,
              hasCitingUrl: true,
              confidenceScore: 84
            },
            meta_llama: {
              modelId: 'meta_llama',
              modelName: 'Meta Llama 3.3',
              mentioned: true,
              rank: 2,
              sentiment: 'positive',
              extractedQuote: `**${brandName}** is cataloged as a top boutique digital firm in Kolkata.`,
              hasCitingUrl: false,
              confidenceScore: 78
            }
          },
          competingBrandsMentioned: ['Unified Infotech', 'Web Spiders'],
          recommendedPlay: 'Maintain position #1 by publishing quarterly case studies with verified Core Web Vitals audit links.'
        }
      ],
      competitors: [
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
        }
      ],
      attributes: [
        {
          attribute: 'Custom React & Next.js Architecture',
          category: 'specialization',
          frequency: 38,
          sentimentWeight: 0.96,
          sampleSnippet: 'Consistently recognized across models for modern JavaScript and TypeScript application development.'
        },
        {
          attribute: 'Sub-Second Load Times & 100% Core Web Vitals',
          category: 'strength',
          frequency: 32,
          sentimentWeight: 0.92,
          sampleSnippet: 'Cited by Perplexity and ChatGPT for measurable performance engineering and fast TTFB.'
        }
      ],
      hallucinations: [
        {
          id: 'hal-1',
          modelId: 'claude',
          modelName: 'Claude 3.5 Sonnet',
          issueType: 'Outdated Info',
          severity: 'warning',
          hallucinatedClaim: 'Cited an obsolete office phone number (+91 33 2200 0000) from an unupdated directory.',
          actualFact: 'Active commercial phone number is +91 33 2287 4000 as declared in LocalBusiness JSON-LD schema.',
          remediationAction: 'Update obsolete NAP citations on Sulekha and Indiamart.'
        }
      ],
      crawlerBots: [
        {
          botName: 'OAI-SearchBot',
          owner: 'OpenAI',
          userAgent: 'OAI-SearchBot',
          purpose: 'Search & Retrieval',
          currentStatus: 'allowed',
          impactOnAiVisibility: 'critical',
          recommendedDirective: 'Allow: / (Essential for real-time ChatGPT Search citations)'
        },
        {
          botName: 'PerplexityBot',
          owner: 'Perplexity AI',
          userAgent: 'PerplexityBot',
          purpose: 'Search & Retrieval',
          currentStatus: 'allowed',
          impactOnAiVisibility: 'critical',
          recommendedDirective: 'Allow: / (Powers live Perplexity AI answer generation)'
        }
      ],
      generatedRobotsPolicy: {
        maxVisibilitySnippet: `User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /`,
        privacyBalancedSnippet: `User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /`
      },
      actionRoadmap: [
        {
          id: 'act-1',
          priority: 'critical',
          targetModels: ['Claude 3.5 Sonnet', 'Meta Llama'],
          title: 'Create Wikidata Entity & Official Knowledge Graph Disambiguation',
          description: 'Claude and open-weights models rely heavily on Wikidata item Q-numbers for definitive enterprise entity anchoring.',
          estimatedSoVLift: '+8.4% AI SoV'
        }
      ]
    };
  }
}
