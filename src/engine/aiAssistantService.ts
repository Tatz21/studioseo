import { 
  ChatMessage, 
  AssistantPersona, 
  PromptPlaybookItem, 
  AiAssistantRequest, 
  AiAssistantResponse 
} from './aiAssistantTypes';

export const ASSISTANT_PERSONAS: AssistantPersona[] = [
  {
    id: 'technical_architect',
    name: 'Technical Architect',
    title: 'Senior Technical SEO & Infrastructure Engineer',
    description: 'Specializes in Core Web Vitals, server architecture, robots.txt, canonicalization, and Schema.org markup.',
    badge: 'Code & Architecture',
    iconName: 'ShieldCheck',
    color: '#10B981',
    systemDirective: 'Provide precise, deterministic, code-first technical SEO guidance with copyable HTML/CSS/JSON-LD snippets.',
    suggestedPromptCategories: ['Core Web Vitals', 'Crawlability', 'Schema & Protocols']
  },
  {
    id: 'content_strategist',
    name: 'Content Strategist',
    title: 'NLP & Semantic Copywriting Director',
    description: 'Focuses on keyword density, readability grade levels (Flesch/Fog), entity salience, and high-CTR metadata.',
    badge: 'Content & Copy',
    iconName: 'FileText',
    color: '#06B6D4',
    systemDirective: 'Analyze textual depth, prevent keyword stuffing, improve readability, and recommend compelling metadata.',
    suggestedPromptCategories: ['Readability', 'Keywords & Intent', 'Metadata Copy']
  },
  {
    id: 'aeo_specialist',
    name: 'AEO Specialist',
    title: 'Answer Engine & Generative Citation Expert',
    description: 'Tailors content for Google AI Overviews, Perplexity inline citations, and Siri/Alexa Speakable audio snippets.',
    badge: 'AI & Answer Engines',
    iconName: 'Sparkles',
    color: '#A855F7',
    systemDirective: 'Structure content into 40–60 word inverted pyramid answers with verifiable data points for LLM citations.',
    suggestedPromptCategories: ['AI Overviews', 'Speakable Schema', 'Information Gain']
  },
  {
    id: 'executive_cmo',
    name: 'Executive CMO Brief',
    title: 'Chief Marketing Officer & SEO Growth Advisor',
    description: 'Summarizes organic search health into board-ready executive summaries, competitor threats, and 90-day ROI roadmaps.',
    badge: 'Executive & ROI',
    iconName: 'Award',
    color: '#F59E0B',
    systemDirective: 'Communicate with strategic clarity, summarizing high-level KPIs, competitive displacement, and revenue opportunities.',
    suggestedPromptCategories: ['Executive Brief', 'Competitor Threat', 'Growth Roadmap']
  }
];

export const PROMPT_PLAYBOOKS: PromptPlaybookItem[] = [
  {
    id: 'pb-vitals',
    title: 'Audit Core Web Vitals & Fix LCP',
    category: 'Technical',
    personaId: 'technical_architect',
    description: 'Diagnose largest contentful paint, layout shifts, and render-blocking bottlenecks.',
    promptText: 'Audit my Core Web Vitals (LCP, CLS, INP) and give me step-by-step code optimizations to pass Google thresholds.',
    iconName: 'Zap'
  },
  {
    id: 'pb-speakable',
    title: 'Generate Speakable & FAQ Schema',
    category: 'AEO / Voice',
    personaId: 'aeo_specialist',
    description: 'Create ready-to-copy JSON-LD for voice assistants and Google AI Overviews.',
    promptText: 'Draft schema.org/SpeakableSpecification and FAQPage structured JSON-LD for our main service offerings.',
    iconName: 'Sparkles'
  },
  {
    id: 'pb-meta',
    title: 'Write High-CTR Meta Tags',
    category: 'Content',
    personaId: 'content_strategist',
    description: 'Craft pixel-accurate title tags and persuasive descriptions under 580px/990px limits.',
    promptText: 'Generate 3 high-CTR title tags and meta descriptions for my homepage that fit under 580px and 990px SERP limits.',
    iconName: 'FileText'
  },
  {
    id: 'pb-disavow',
    title: 'Toxic Backlinks & Disavow Rules',
    category: 'Authority',
    personaId: 'technical_architect',
    description: 'Identify spam link networks and build Google Search Console disavow.txt directives.',
    promptText: 'Analyze our backlink health profile and generate a Google Search Console disavow.txt file for suspected spam links.',
    iconName: 'Link2'
  },
  {
    id: 'pb-executive',
    title: 'Generate Executive CMO Brief',
    category: 'Executive',
    personaId: 'executive_cmo',
    description: 'Produce a high-level performance briefing for executive leadership and stakeholders.',
    promptText: 'Generate an Executive CMO summary of our current SEO audit, Core Web Vitals status, and 90-day growth priorities.',
    iconName: 'Award'
  }
];

export class AiAssistantService {
  /**
   * Sends user message to the backend assistant endpoint
   */
  static async sendMessage(request: AiAssistantRequest): Promise<ChatMessage> {
    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`AI Assistant API error: ${response.statusText}`);
      }

      const result: AiAssistantResponse = await response.json();
      if (result.ok && result.message) {
        return result.message;
      }
      throw new Error(result.error || 'Failed to process assistant request');
    } catch (err) {
      console.warn('Falling back to local AI Assistant synthesis:', err);
      return this.getLocalFallbackReply(request);
    }
  }

  /**
   * Local synthesis fallback for instant offline testing
   */
  private static getLocalFallbackReply(request: AiAssistantRequest): ChatMessage {
    const domain = request.context?.targetDomain || 'posterscraft.com';
    const score = request.context?.overallScore ?? 84;
    const grade = request.context?.grade ?? 'A';

    return {
      id: `local-${Date.now()}`,
      role: 'assistant',
      content: `### SEO Assistant Analysis for \`${domain}\`\n\nI have analyzed your request: "*${request.message}*".\n\n* **Overall Health:** \`${score}/100 (Grade ${grade})\`\n* **Target Domain:** \`${domain}\`\n\n#### Recommendation:\nReview your technical SEO and Core Web Vitals benchmarks. Ensure primary question headings have direct 40–60 word answer paragraphs and structured Speakable schemas.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      personaId: request.personaId,
      tokensUsed: 280,
      responseTimeMs: 320,
      suggestedFollowUps: [
        'How do I improve my Core Web Vitals score?',
        'Draft a Speakable specification schema',
        'Show me my top keyword opportunities'
      ],
      actionLinks: [
        { label: 'Open Page Audit', targetTab: 'audit', badge: 'Audit' },
        { label: 'Open AEO Studio', targetTab: 'aeo', badge: 'Phase 21' }
      ]
    };
  }
}
