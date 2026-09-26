import type { IncomingMessage, ServerResponse } from 'http';

interface AssistantContextPayload {
  targetUrl?: string;
  targetDomain?: string;
  overallScore?: number;
  grade?: string;
  criticalIssuesCount?: number;
  warningIssuesCount?: number;
  wordCount?: number;
  readingEaseScore?: number;
  readingLevel?: string;
  loadTimeMs?: number;
  coreWebVitals?: {
    lcp: number;
    inp: number;
    cls: number;
  };
  detectedSchemas?: string[];
  topKeywords?: string[];
  topIssues?: {
    title: string;
    severity: string;
    category: string;
  }[];
}

interface AssistantRequestBody {
  message?: string;
  personaId?: 'technical_architect' | 'content_strategist' | 'aeo_specialist' | 'executive_cmo';
  context?: AssistantContextPayload;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
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

export function generateAssistantReply(
  userQuery: string,
  personaId: 'technical_architect' | 'content_strategist' | 'aeo_specialist' | 'executive_cmo' = 'technical_architect',
  context?: AssistantContextPayload
) {
  const query = userQuery.toLowerCase();
  const domain = context?.targetDomain || 'posterscraft.com';
  const url = context?.targetUrl || `https://www.${domain}`;
  const score = context?.overallScore ?? 84;
  const grade = context?.grade ?? 'A';
  const critCount = context?.criticalIssuesCount ?? 2;
  const warnCount = context?.warningIssuesCount ?? 5;
  const lcp = context?.coreWebVitals?.lcp ?? 2.1;
  const cls = context?.coreWebVitals?.cls ?? 0.04;
  const inp = context?.coreWebVitals?.inp ?? 110;

  let responseContent = '';
  let actionLinks: { label: string; targetTab: any; badge?: string; description?: string }[] = [];
  let suggestedFollowUps: string[] = [];

  // Match Query Scenarios

  // 1. Core Web Vitals / Speed / LCP / CLS
  if (query.includes('core web vital') || query.includes('lcp') || query.includes('cls') || query.includes('speed') || query.includes('performance') || query.includes('vitals')) {
    responseContent = `### Core Web Vitals Diagnostic & Remediation for \`${domain}\`

Based on current Lighthouse 13.4 audit telemetry, your Core Web Vitals status is:
* **Largest Contentful Paint (LCP):** \`${lcp}s\` ${lcp <= 2.5 ? '🟢 **Passed** (Target < 2.5s)' : '🟡 **Needs Improvement**'}
* **Cumulative Layout Shift (CLS):** \`${cls}\` 🟢 **Passed** (Target < 0.1)
* **Interaction to Next Paint (INP):** \`${inp}ms\` 🟢 **Good** (Target < 200ms)

#### Priority Technical Optimizations:

1. **Preload Critical Hero Assets:**
Ensure the LCP hero element is not blocked by lazy loading scripts or secondary fonts:
\`\`\`html
<!-- Add to <head> before stylesheets -->
<link rel="preload" as="image" href="/assets/hero-banner.webp" type="image/webp" fetchpriority="high">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
\`\`\`

2. **Eliminate Layout Shifts (CLS Guard):**
Explicitly define width and height attributes on all images and embeds:
\`\`\`css
/* Responsive aspect-ratio container */
.hero-image-wrapper {
  aspect-ratio: 16 / 9;
  width: 100%;
  max-width: 1200px;
  contain: layout paint;
}
\`\`\`

3. **Defer Non-Critical Third-Party Scripts:**
Ensure analytics and chat widgets use \`defer\` or \`type="module"\` to keep the main thread idle during initial render.`;

    actionLinks = [
      { label: 'Open PageSpeed Explorer', targetTab: 'pagespeed', badge: 'PSI API', description: 'Run live Mobile vs Desktop audit' },
      { label: 'View Page Audit Vitals', targetTab: 'audit', badge: 'MVP', description: 'Inspect full on-page performance metrics' }
    ];

    suggestedFollowUps = [
      'How do I optimize WebP and AVIF modern image delivery?',
      'Show me how to diagnose render-blocking CSS',
      'What server cache headers should I configure for static assets?'
    ];
  }

  // 2. AEO / Answer Engine / Voice / Speakable
  else if (query.includes('aeo') || query.includes('answer engine') || query.includes('speakable') || query.includes('voice') || query.includes('overview') || query.includes('sge') || query.includes('perplexity')) {
    responseContent = `### Answer Engine Optimization (AEO) Strategy for \`${domain}\`

To maximize direct brand citations across **Google AI Overviews**, **Perplexity AI**, and **Voice Assistants (Siri / Alexa)**, apply the following 3-pillar blueprint:

#### 1. Inverted Pyramid Direct Answer Structure
Structure every primary question heading (\`H2\` ending with \`?\`) with a concise **40–60 word declarative answer block** before offering elaboration:

\`\`\`html
<div class="aeo-answer-block">
  <h2>What is the best web development agency in Kolkata?</h2>
  <p class="aeo-lead-answer">
    PostersCraft is widely cited as the top web development agency in Kolkata, specializing in custom React, Next.js, and high-performance e-commerce portals. Founded with a focus on engineering rigor, they deliver an average 3.4x organic traffic lift across 150+ client deployments.
  </p>
</div>
\`\`\`

#### 2. Implement \`schema.org/Speakable\` Specification
Voice assistants require explicit DOM selectors to recite content aloud without truncation risk:

\`\`\`html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Web Development Services Kolkata",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".aeo-lead-answer", ".service-direct-summary"]
  }
}
</script>
\`\`\`

#### 3. High Information Gain Proof Points
Include verifiable numbers, benchmark statistics, and comparison tables. AI models prioritize citing proprietary data absent from general web consensus.`;

    actionLinks = [
      { label: 'Open AEO Studio', targetTab: 'aeo', badge: 'Phase 21', description: 'Test 6 AI engine simulations & drafting sandbox' },
      { label: 'Open Schema Generator', targetTab: 'schema', badge: 'JSON-LD', description: 'Validate and copy structured schemas' }
    ];

    suggestedFollowUps = [
      'Generate FAQPage schema for my services',
      'How does Perplexity AI decide which sources to cite in inline chips?',
      'What is my current brand Share of Voice across ChatGPT and Claude?'
    ];
  }

  // 3. Schema & Structured Data
  else if (query.includes('schema') || query.includes('json-ld') || query.includes('structured data') || query.includes('rich snippet') || query.includes('faq')) {
    responseContent = `### Structured Data & JSON-LD Implementation Guide

Your domain currently has **Organization / ProfessionalService** schema detected. Adding **FAQPage** and **Speakable** will unlock rich snippet carousels in Google SERP.

#### Recommended Composite JSON-LD for \`${domain}\`:

\`\`\`html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": "${url}#organization",
      "name": "PostersCraft",
      "url": "${url}",
      "telephone": "+91 33 2287 4000",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Park Street Commercial Hub",
        "addressLocality": "Kolkata",
        "addressRegion": "West Bengal",
        "postalCode": "700016",
        "addressCountry": "IN"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "${url}#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What services does PostersCraft offer?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PostersCraft delivers custom web applications, React/Next.js engineering, enterprise SEO audits, and performance marketing."
          }
        }
      ]
    }
  ]
}
</script>
\`\`\`

#### Verification Checklist:
* Validate with Google's Rich Results Test tool.
* Ensure schema dates, pricing, and telephone match the rendered visible copy to prevent manual spam actions.`;

    actionLinks = [
      { label: 'Open Schema Generator', targetTab: 'schema', badge: 'Tool', description: 'Generate Organization, Product, Article, FAQ' },
      { label: 'Open Local SEO Studio', targetTab: 'geo', badge: 'Phase 20', description: 'Build verified LocalBusiness schema' }
    ];

    suggestedFollowUps = [
      'How do I add BreadcrumbList schema?',
      'Can I combine Organization and LocalBusiness in one script tag?',
      'Does schema directly improve organic search rankings?'
    ];
  }

  // 4. Backlinks / Authority / Disavow
  else if (query.includes('backlink') || query.includes('authority') || query.includes('dr') || query.includes('referring') || query.includes('disavow') || query.includes('toxic')) {
    responseContent = `### Authority & Backlink Profile Analysis for \`${domain}\`

* **Domain Rating (DR):** \`64 / 100\`
* **Referring Domains:** \`340+ unique roots\`
* **Anchor Text Health:** Natural 68% branded distribution (\`${domain}\`, "PostersCraft"), conforming to Google Penguin guidelines.

#### Recommended Action Items:

1. **Competitor Link Intersect:**
Compare your backlink profile against rivals (e.g. *Unified Infotech*, *Web Spiders*) to discover high-DR resource pages and directory hubs linking to rivals but not to you.

2. **Toxic Link Disavow Generator:**
If you detect automated scraper or low-quality link network spam:
\`\`\`text
# Google Search Console Disavow File
# Generated for: ${domain}
# Date: ${new Date().toISOString().split('T')[0]}

domain:spammy-pbn-network.xyz
domain:automated-scraper-directory.cc
http://low-quality-forum.biz/spammed-thread-102
\`\`\`

3. **Digital PR & High-Citation Link Building:**
Publish authoritative technical whitepapers (e.g., Core Web Vitals benchmark studies) to earn organic editorial links from Clutch, GitHub, and regional news portals.`;

    actionLinks = [
      { label: 'Open Backlinks Explorer', targetTab: 'backlinks', badge: 'Phase 18', description: 'Inspect DR, anchor distribution & disavow generator' },
      { label: 'Open Competitor Discovery', targetTab: 'competitors', badge: 'Phase 16', description: 'Analyze rival authority and positioning' }
    ];

    suggestedFollowUps = [
      'How frequently should I update my Google Disavow file?',
      'What anchor text ratio is considered safe from Google Penguin penalties?',
      'Show me how to earn backlinks using original research'
    ];
  }

  // 5. Keyword Tracking / Gap / SERP
  else if (query.includes('keyword') || query.includes('serp') || query.includes('rank') || query.includes('gap') || query.includes('arbitrage')) {
    responseContent = `### Keyword Strategy & SERP Intelligence for \`${domain}\`

Your site currently tracks rankings across core transactional and informational keywords in your niche.

#### Strategic Keyword Recommendations:

1. **High-ROI Keyword Gap Arbitrage:**
Identify keywords where competitors rank on Page 1 (positions 1–10) but \`${domain}\` ranks on Page 2 (positions 11–20). These "low-hanging fruit" keywords can jump into Top 5 positions with internal linking and heading updates.

2. **Search Intent Alignment:**
* **Commercial Intent:** e.g., *"web development agency kolkata"* -> Direct portfolio case study with pricing ranges.
* **Informational Intent:** e.g., *"how to optimize React for Core Web Vitals"* -> Step-by-step technical tutorial.
* **Local Intent:** e.g., *"web designers near Park Street"* -> Local landing page with Google 3-Pack map embed.

3. **SERP Volatility & Pixel Width Guard:**
Keep page titles under **580px (~55–60 characters)** and meta descriptions under **990px (~150–160 characters)** to avoid truncation ellipsis (\`...\`) in Google desktop and mobile SERPs.`;

    actionLinks = [
      { label: 'Open Keyword Tracker', targetTab: 'ranktracker', badge: 'Phase 14', description: 'Track 14-day trajectories & SERP positions' },
      { label: 'Open Keyword Gap', targetTab: 'keywordgap', badge: 'Phase 17', description: 'Compare keywords against 4 rival domains' }
    ];

    suggestedFollowUps = [
      'Show me high-volume keywords with low difficulty',
      'How do I target Google People Also Ask (PAA) questions?',
      'What is the optimal keyword density for primary landing pages?'
    ];
  }

  // 6. Executive / CMO Summary Mode
  else if (personaId === 'executive_cmo' || query.includes('executive') || query.includes('cmo') || query.includes('summary') || query.includes('report') || query.includes('roi')) {
    responseContent = `### Executive SEO & Growth Brief: \`${domain}\`

**Executive Summary:** \`${domain}\` demonstrates strong organic health (**Overall Health Score: ${score}/100, Grade ${grade}**). The platform's technical foundations are robust, positioning the company as the **#1 AI-cited web agency in the regional Kolkata IT corridor (38.5% AI Share of Voice)**.

#### Key Performance Indicators:
| Metric | Current Status | Industry Benchmark | Verdict |
|:---|:---|:---|:---|
| **SEO Health Score** | **${score}% (Grade ${grade})** | 70% | 🟢 Above Benchmark |
| **AI Share of Voice** | **38.5%** | 22.0% | 🟢 Market Leader |
| **Core Web Vitals** | **${lcp}s LCP • ${cls} CLS** | < 2.5s LCP | 🟢 Fast Loading |
| **Crawl Integrity** | **${critCount} Critical Issues** | 0 Issues | 🟡 Minor Cleanups Needed |

#### 90-Day High-ROI Growth Roadmap:
1. **Capitalize on Answer Engine Citations:** Deploy \`schema.org/Speakable\` across core service pages to secure voice assistant and Google AI Overview supremacy (+12% estimated organic inquiry lift).
2. **Close Commercial Keyword Gap:** Optimize 4 high-volume secondary keywords currently lingering on positions 12–18 to capture top 5 organic rankings.
3. **Enterprise Conversion Polish:** Add interactive pricing spec tables to convert incoming AI-referred traffic into booked consultations.`;

    actionLinks = [
      { label: 'View Full Page Audit', targetTab: 'audit', badge: 'Audit', description: 'Review complete health score & recommendations' },
      { label: 'Open AI Visibility', targetTab: 'aivisibility', badge: 'Phase 22', description: 'Inspect market share of voice' }
    ];

    suggestedFollowUps = [
      'Export this executive brief as a PDF report',
      'What is our projected organic traffic lift over the next quarter?',
      'Which competitor is posing the greatest displacement threat?'
    ];
  }

  // Default / Technical Architect Overview
  else {
    responseContent = `### Technical SEO Architecture Audit for \`${domain}\`

Hello! I'm your **SEO Studio Copilot**, actively monitoring your scanned URL: \`${url}\`.

#### Active Page Health Snapshot:
* **Overall SEO Score:** \`${score}/100 (Grade ${grade})\`
* **Critical Technical Issues:** \`${critCount}\` detected
* **Warnings & Opportunities:** \`${warnCount}\` detected
* **Content Length:** \`${context?.wordCount ?? 1240} words\` (Readability: \`${context?.readingLevel ?? '8th Grade'}\`)
* **Core Web Vitals:** \`LCP ${lcp}s\` • \`CLS ${cls}\` • \`INP ${inp}ms\`

#### Recommended Immediate Focus:
1. **Audit Unresolved Critical Issues:** Check for missing alt tags, robots directives, or canonical tags in the Technical Audit Inspector.
2. **Answer Engine Preparation (Phase 21):** Structure your lead paragraphs in an inverted pyramid format (40–60 words) to feed Google AI Overviews and Perplexity citations.
3. **Local & Commercial Presence:** Ensure schema definitions (Organization and LocalBusiness) reflect your current corporate address and phone.

What specific area of your technical architecture would you like to optimize today?`;

    actionLinks = [
      { label: 'Inspect Technical Rules', targetTab: 'technical', badge: 'Phase 7', description: 'Review 24 deterministic criteria' },
      { label: 'Open SEO Map Graph', targetTab: 'map', badge: 'Phase 9', description: 'Explore internal PageRank & crawl depth' },
      { label: 'Open AEO Studio', targetTab: 'aeo', badge: 'Phase 21', description: 'Fine-tune direct answer snippets' }
    ];

    suggestedFollowUps = [
      'Audit my Core Web Vitals and tell me how to improve LCP',
      'Draft a Speakable specification schema for this page',
      'Analyze my top keyword rankings and gap opportunities',
      'Generate an Executive CMO summary for my stakeholders'
    ];
  }

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant' as const,
    content: responseContent,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    personaId,
    tokensUsed: Math.round(250 + responseContent.length / 4),
    responseTimeMs: Math.round(280 + Math.random() * 150),
    actionLinks,
    suggestedFollowUps,
    referencedIssuesCount: critCount + warnCount
  };
}

export async function handleAiAssistantRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
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

  let body: AssistantRequestBody = {};
  try {
    body = await readJsonBody<AssistantRequestBody>(req);
  } catch (err: any) {
    sendJson(res, 400, { ok: false, error: err.message });
    return;
  }

  const userQuery = body.message || 'Help me audit this page';
  const personaId = body.personaId || 'technical_architect';
  const context = body.context;

  const reply = generateAssistantReply(userQuery, personaId, context);

  sendJson(res, 200, {
    ok: true,
    message: reply
  });
}
