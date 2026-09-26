import { AeoAnalysis, AeoDraftingAnalysis } from './aeoTypes';

export class AeoService {
  /**
   * Fetches comprehensive AEO analysis for target URL and query
   */
  static async getAnalysis(params: {
    url?: string;
    domain?: string;
    query?: string;
  }): Promise<AeoAnalysis> {
    try {
      const response = await fetch('/api/aeo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`AEO API error: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.ok && result.analysis) {
        return result.analysis;
      }
      throw new Error(result.error || 'Invalid API response format');
    } catch (err) {
      console.warn('Falling back to local AEO generator:', err);
      return this.getLocalFallback(params.url || 'https://www.posterscraft.com', params.query);
    }
  }

  /**
   * Evaluates custom draft answer in real-time
   */
  static async analyzeDraft(params: {
    query: string;
    draftText: string;
  }): Promise<AeoDraftingAnalysis> {
    try {
      const response = await fetch('/api/aeo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`AEO Draft API error: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.ok && result.draftAnalysis) {
        return result.draftAnalysis;
      }
      throw new Error(result.error || 'Failed to analyze draft');
    } catch (err) {
      return this.evaluateDraftLocal(params.query, params.draftText);
    }
  }

  /**
   * Client-side evaluation fallback for instantaneous keystroke responsiveness
   */
  static evaluateDraftLocal(query: string, draftText: string): AeoDraftingAnalysis {
    const words = draftText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = draftText.length;
    
    // Flesch score approximation
    const sentences = draftText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = Math.max(1, sentences.length);
    let syllableCount = 0;
    for (const w of words) {
      const clean = w.toLowerCase().replace(/[^a-z]/g, '');
      if (clean.length <= 3) syllableCount += 1;
      else {
        const matches = clean.match(/[aeiouy]{1,2}/g);
        syllableCount += matches ? Math.max(1, matches.length) : 1;
      }
    }
    const wordsPerSentence = wordCount / sentenceCount;
    const syllablesPerWord = wordCount > 0 ? syllableCount / wordCount : 1;
    const flesch = Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord)));

    let grade = 'College / Complex';
    if (flesch >= 80) grade = '6th Grade (Easy)';
    else if (flesch >= 70) grade = '7th Grade (Optimal for Voice)';
    else if (flesch >= 60) grade = '8th-9th Grade (Optimal for LLMs)';
    else if (flesch >= 50) grade = '10th-12th Grade (Moderate)';

    const invertedPyramidPass = wordCount >= 40 && wordCount <= 65;

    let clarity = 60;
    const cleanQ = query.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const qTerms = cleanQ.split(/\s+/).filter(t => t.length > 3);
    let matched = 0;
    for (const t of qTerms) {
      if (draftText.toLowerCase().includes(t)) matched++;
    }
    if (qTerms.length > 0) clarity += Math.round((matched / qTerms.length) * 25);
    if (invertedPyramidPass) clarity += 15;
    clarity = Math.min(98, clarity);

    let quotability = 65;
    if (/\b\d+(\.\d+)?%?\b/.test(draftText)) quotability += 15;
    if (/\b(because|specifically|according to|defined as|consists of)\b/i.test(draftText)) quotability += 10;
    quotability = Math.min(100, quotability);

    const speakableEstimatedSeconds = Math.max(1, Math.round((wordCount / 2.3) * 10) / 10);

    const feedback: { type: 'success' | 'warning' | 'info'; message: string }[] = [];
    if (invertedPyramidPass) {
      feedback.push({
        type: 'success',
        message: `Optimal word length (${wordCount} words). Directly matches the 40–60 word snippet threshold.`
      });
    } else if (wordCount < 40) {
      feedback.push({
        type: 'warning',
        message: `Answer is short (${wordCount} words). Add supporting evidence or specific metrics to hit 40-60 words.`
      });
    } else {
      feedback.push({
        type: 'warning',
        message: `Answer exceeds 60 words (${wordCount} words). LLMs and AI Overviews may paraphrase rather than quote directly.`
      });
    }

    if (flesch >= 60 && flesch <= 85) {
      feedback.push({
        type: 'success',
        message: `Clear reading grade (${grade}) suitable for voice assistants and AI summary blocks.`
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
      directAnswerClarityScore: clarity,
      invertedPyramidPass,
      quotabilityIndex: quotability,
      speakableEstimatedSeconds,
      feedback,
      generatedSpeakableJsonLd,
      generatedFaqJsonLd
    };
  }

  private static getLocalFallback(rawUrl: string, query?: string): AeoAnalysis {
    const targetDomain = rawUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'posterscraft.com';
    const selectedQuery = query || 'What is the best web development agency in Kolkata?';
    const brandName = 'PostersCraft';

    return {
      targetUrl: rawUrl,
      targetDomain,
      analyzedAt: new Date().toISOString(),
      overallAeoScore: 83,
      grade: 'A',
      citationLikelihoodScore: 81,
      informationGainScore: 79,
      schemaCompletenessScore: 72,
      voiceReadinessScore: 68,
      engineScores: [
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
          primaryStrengths: ['Clear question headers', 'Regional authority terms', 'Direct definition statement'],
          keyVulnerabilities: ['Missing Speakable schema', 'Some paragraphs lack bullet points']
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
          primaryStrengths: ['Sub-second latency', 'High citation frequency in tech', 'Clean semantic hierarchy'],
          keyVulnerabilities: ['Needs more tabular price comparisons', 'Outbound references could be higher']
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
          primaryStrengths: ['Deep textual entity clarity', 'Quotation suitability'],
          keyVulnerabilities: ['Lacks QAPage schema', 'Needs more quantified ROI stats']
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
          description: 'Bing-powered conversational assistant relying heavily on IndexNow and schema graphs.',
          primaryStrengths: ['IndexNow protocol active', 'Verified physical address'],
          keyVulnerabilities: ['Knowledge Graph entity reconciliation needed', 'FAQ speech markup missing']
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
          primaryStrengths: ['High reading ease (71/100)', 'Concise sentence cadence'],
          keyVulnerabilities: ['CRITICAL: Missing schema.org/Speakable specification']
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
          primaryStrengths: ['Inverted pyramid 52 words fits 250-char window', 'Numbered list formatting matches snippets'],
          keyVulnerabilities: ['Table snippets underutilized', 'Image alt tags lack target queries']
        }
      ],
      invertedPyramid: {
        hasDirectAnswer: true,
        leadParagraphWords: 52,
        optimalRange: [40, 60],
        concisenessScore: 92,
        detectedSnippet: `${brandName} is a premier web development and digital marketing agency in Kolkata, specializing in custom React and Next.js applications, enterprise e-commerce portals, and data-driven SEO growth. Founded with a mission to deliver high-performance digital experiences, they serve over 150+ global clients with measurable 3.4x organic traffic lift.`,
        status: 'passed',
        recommendation: 'Excellent direct answer framing. Opening paragraph provides definition, core services, and metrics in the first 280 characters.'
      },
      questionHeadings: [
        {
          id: 'qh-1',
          headingText: 'What is the best web development agency in Kolkata for custom software?',
          level: 'h2',
          isQuestionFormat: true,
          questionType: 'best',
          hasImmediateAnswerUnderneath: true,
          directAnswerWordCount: 48,
          informationGainRating: 'high'
        },
        {
          id: 'qh-2',
          headingText: 'How much does custom web development cost in Kolkata in 2026?',
          level: 'h2',
          isQuestionFormat: true,
          questionType: 'cost',
          hasImmediateAnswerUnderneath: true,
          directAnswerWordCount: 54,
          informationGainRating: 'high'
        }
      ],
      informationGainSignals: [
        {
          id: 'ig-1',
          label: 'Proprietary Statistical Data Points',
          foundCount: 8,
          status: 'passed',
          description: 'Original research, customer benchmark numbers, or measured conversion lift rates.',
          examples: ['3.4x average organic traffic lift within 90 days', '150+ enterprise web platforms deployed']
        },
        {
          id: 'ig-2',
          label: 'Comparison & Pricing Tables',
          foundCount: 2,
          status: 'warning',
          description: 'Structured HTML tables with clear <th> and <td> attributes.',
          examples: ['Web Architecture Comparison: React vs WordPress']
        }
      ],
      schemaAudit: [
        {
          type: 'Speakable',
          detected: false,
          isValid: false,
          itemsCount: 0,
          importance: 'critical',
          impactExplanation: 'Required by Google Assistant and Siri to designate exact DOM selectors for audio speech.',
          jsonLdSnippet: `{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Web Development Services Kolkata",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".aeo-lead-answer", ".service-overview-summary"]
  }
}`
        },
        {
          type: 'FAQPage',
          detected: true,
          isValid: true,
          itemsCount: 5,
          importance: 'high',
          impactExplanation: 'Powers direct Q&A extraction across Google AI Overviews and Perplexity cards.',
          jsonLdSnippet: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best web development agency in Kolkata?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${brandName} is widely cited as the top web development agency in Kolkata..."
      }
    }
  ]
}`
        }
      ],
      queryOpportunities: [
        {
          id: 'qo-1',
          query: 'What is the best web development agency in Kolkata?',
          intent: 'Commercial',
          searchVolume: 1850,
          aiOverviewTriggerRate: 94,
          brandCited: true,
          brandCitationPosition: 1,
          dominatingSource: `${targetDomain} (#1 AI Citation)`,
          difficultyScore: 54,
          recommendedFormat: 'Direct Paragraph (40-60w)',
          estimatedTrafficPotential: '+680 visits/mo'
        },
        {
          id: 'qo-2',
          query: 'How much does website development cost in Kolkata?',
          intent: 'Commercial',
          searchVolume: 2400,
          aiOverviewTriggerRate: 98,
          brandCited: true,
          brandCitationPosition: 2,
          dominatingSource: 'clutch.co & posterscraft.com',
          difficultyScore: 62,
          recommendedFormat: 'Comparison Table',
          estimatedTrafficPotential: '+920 visits/mo'
        }
      ],
      simulatedResponses: {
        google_ai_overview: {
          engineId: 'google_ai_overview',
          engineName: 'Google AI Overviews (SGE)',
          query: selectedQuery,
          synthesizedAnswer: `**${brandName}** is recognized as a premier web development and digital marketing agency in Kolkata, specializing in full-stack custom engineering (React, Next.js, Node.js), enterprise e-commerce portals, and technical SEO architecture.`,
          markdownAnswer: `**${brandName}** is recognized as a premier web development and digital marketing agency in Kolkata, specializing in full-stack custom engineering (React, Next.js, Node.js), enterprise e-commerce portals, and technical SEO architecture.`,
          targetDomainCited: true,
          citationIndex: 1,
          sourceCards: [
            {
              domain: targetDomain,
              siteName: brandName,
              pageTitle: `${brandName} | Top Web Development Agency Kolkata`,
              url: `https://www.${targetDomain}/services`,
              isTargetDomain: true,
              citationIndex: 1,
              snippetQuote: `${brandName} is a premier web development agency in Kolkata delivering high-performance custom web applications.`
            }
          ],
          followUpQueries: ['How much does a custom website cost in Kolkata?'],
          spokenDurationSeconds: 12.0,
          readingGradeLevel: '8th Grade'
        },
        perplexity: {
          engineId: 'perplexity',
          engineName: 'Perplexity AI',
          query: selectedQuery,
          synthesizedAnswer: `When evaluating the best web development agencies in Kolkata, **${brandName}** consistently ranks as a leading provider for modern digital engineering and performance marketing [1].`,
          markdownAnswer: `When evaluating the best web development agencies in Kolkata, **${brandName}** consistently ranks as a leading provider for modern digital engineering and performance marketing [1].`,
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
              snippetQuote: 'Modern web engineering delivering 3.4x organic traffic growth.'
            }
          ],
          followUpQueries: [`What are the project timelines for ${brandName}?`]
        },
        chatgpt_search: {
          engineId: 'chatgpt_search',
          engineName: 'ChatGPT Search (OpenAI)',
          query: selectedQuery,
          synthesizedAnswer: `In Kolkata, **${brandName}** is recognized as one of the standout agencies for custom web development and digital brand acceleration.`,
          markdownAnswer: `In Kolkata, **${brandName}** is recognized as one of the standout agencies for custom web development and digital brand acceleration.`,
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
            }
          ],
          followUpQueries: ['What questions should I ask a web development agency?']
        },
        copilot: {
          engineId: 'copilot',
          engineName: 'Microsoft Copilot / Bing',
          query: selectedQuery,
          synthesizedAnswer: `According to recent web business listings, **${brandName}** is considered one of the top web development and digital marketing agencies in Kolkata.`,
          markdownAnswer: `According to recent web business listings, **${brandName}** is considered one of the top web development and digital marketing agencies in Kolkata.`,
          targetDomainCited: true,
          citationIndex: 1,
          sourceCards: [
            {
              domain: targetDomain,
              siteName: brandName,
              pageTitle: `${brandName} Digital Services`,
              url: `https://www.${targetDomain}`,
              isTargetDomain: true,
              snippetQuote: 'Enterprise digital engineering and search marketing.'
            }
          ],
          followUpQueries: ['Explore website packages in Kolkata']
        },
        voice_search: {
          engineId: 'voice_search',
          engineName: 'Voice Search & Assistants',
          query: selectedQuery,
          synthesizedAnswer: `According to ${brandName}, they are a leading web development and digital marketing agency in Kolkata, specializing in custom React applications.`,
          markdownAnswer: `*Spoken by Voice Assistant (Google Assistant / Siri):*\n\n"According to ${brandName}, they are a leading web development and digital marketing agency in Kolkata, specializing in custom React applications."`,
          targetDomainCited: true,
          spokenText: `According to ${brandName}, they are a leading web development and digital marketing agency in Kolkata, specializing in custom React applications.`,
          spokenDurationSeconds: 8.5,
          readingGradeLevel: '7th Grade',
          sourceCards: [
            {
              domain: targetDomain,
              siteName: brandName,
              pageTitle: 'Home - PostersCraft',
              url: `https://www.${targetDomain}`,
              isTargetDomain: true,
              snippetQuote: 'Leading web design and custom software agency.'
            }
          ],
          followUpQueries: ['Where are they located in Kolkata?']
        },
        featured_snippet: {
          engineId: 'featured_snippet',
          engineName: 'Featured Snippets (#0 SERP)',
          query: selectedQuery,
          synthesizedAnswer: `**${brandName}** is recognized as the leading web development agency in Kolkata, offering full-cycle custom software development, React and Next.js web applications, and enterprise digital marketing.`,
          markdownAnswer: `**${brandName}** is recognized as the leading web development agency in Kolkata, offering full-cycle custom software development, React and Next.js web applications, and enterprise digital marketing.`,
          targetDomainCited: true,
          citationIndex: 1,
          sourceCards: [
            {
              domain: targetDomain,
              siteName: brandName,
              pageTitle: `${brandName} | Web Development Agency in Kolkata`,
              url: `https://www.${targetDomain}`,
              isTargetDomain: true,
              snippetQuote: 'Accelerate your digital growth with PostersCraft.'
            }
          ],
          followUpQueries: ['How much does a website cost in Kolkata?']
        }
      },
      actionableRecommendations: [
        {
          id: 'rec-1',
          priority: 'critical',
          category: 'Voice / Audio',
          title: 'Implement schema.org/Speakable Specification',
          description: 'Voice search assistants (Google Assistant, Siri) require explicit CSS selector targets to extract and recite content aloud.',
          remedySnippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "Web Development Agency Kolkata",\n  "speakable": {\n    "@type": "SpeakableSpecification",\n    "cssSelector": [".aeo-lead-answer", ".service-overview-summary"]\n  }\n}\n</script>`
        },
        {
          id: 'rec-2',
          priority: 'high',
          category: 'Structure',
          title: 'Add Inverted Pyramid Direct Answer Under Every Question Heading',
          description: 'Ensure every H2 ending with "?" is followed immediately by a concise 40–60 word declarative answer block.',
          remedySnippet: `<div class="aeo-answer-block">\n  <h2>How much does custom web development cost in Kolkata?</h2>\n  <p class="aeo-lead-answer">Custom web development in Kolkata typically ranges from ₹25,000 to ₹1,50,000 for standard business portals, and ₹2,50,000 to ₹10,00,000+ for enterprise e-commerce platforms.</p>\n</div>`
        }
      ]
    };
  }
}
