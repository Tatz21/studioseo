import { SeoMapNode, SeoMapLink, SeoMapStats, LinkType } from './types';

interface RawPageInput {
  url: string;
  title: string;
  statusCode: number;
  score: number;
  indexable?: boolean;
  linksTo: Array<{
    targetUrl: string;
    anchorText: string;
    linkType?: LinkType;
  }>;
}

function computeGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 97) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function getPath(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname || '/';
  } catch {
    return url;
  }
}

/**
 * Builds the complete graph topology, computing shortest crawl depths from root via BFS,
 * resolving bidirectional inlinks/outlinks, identifying orphan pages, and setting visual node radii.
 */
export function buildSeoMapGraph(rawPages: RawPageInput[], rootUrl: string): {
  nodes: SeoMapNode[];
  links: SeoMapLink[];
  stats: SeoMapStats;
} {
  const nodeMap = new Map<string, SeoMapNode>();
  const pageMap = new Map<string, RawPageInput>();
  
  for (const page of rawPages) {
    pageMap.set(page.url, page);
  }

  // 1. Initial Pass: Register all nodes
  for (const page of rawPages) {
    const isRoot = page.url === rootUrl;
    nodeMap.set(page.url, {
      id: page.url,
      url: page.url,
      path: getPath(page.url),
      title: page.title,
      depth: isRoot ? 0 : 999, // default unreached
      statusCode: page.statusCode,
      indexable: page.indexable ?? (page.statusCode === 200),
      score: page.score,
      grade: computeGrade(page.score),
      inlinksCount: 0,
      outlinksCount: 0,
      inlinks: [],
      outlinks: [],
      isOrphan: false,
      isRoot,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: isRoot ? 24 : 14,
    });
  }

  // 2. Link Resolution Pass & Inlink / Outlink counts
  const links: SeoMapLink[] = [];
  let linkCounter = 0;

  for (const page of rawPages) {
    const sourceNode = nodeMap.get(page.url);
    if (!sourceNode) continue;

    for (const outLink of page.linksTo) {
      let targetNode = nodeMap.get(outLink.targetUrl);
      
      // If target not in graph, create a stub node for it (e.g., 404 or external)
      if (!targetNode) {
        targetNode = {
          id: outLink.targetUrl,
          url: outLink.targetUrl,
          path: getPath(outLink.targetUrl),
          title: outLink.anchorText || 'External / Uncrawled Page',
          depth: 999,
          statusCode: 404,
          indexable: false,
          score: 40,
          grade: 'F',
          inlinksCount: 0,
          outlinksCount: 0,
          inlinks: [],
          outlinks: [],
          isOrphan: false,
          isRoot: false,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          radius: 12,
        };
        nodeMap.set(outLink.targetUrl, targetNode);
      }

      linkCounter++;
      const isRedirect = targetNode.statusCode >= 300 && targetNode.statusCode < 400;
      const isBroken = targetNode.statusCode >= 400;
      const linkType: LinkType = outLink.linkType || 'content';

      const mapLink: SeoMapLink = {
        id: `link-${linkCounter}`,
        source: sourceNode.id,
        target: targetNode.id,
        linkType,
        isInternal: true,
        isBroken,
        isRedirect,
      };
      links.push(mapLink);

      // Add to source outlinks
      sourceNode.outlinks.push({
        targetId: targetNode.id,
        targetUrl: targetNode.url,
        targetTitle: targetNode.title,
        anchorText: outLink.anchorText,
        statusCode: targetNode.statusCode,
        linkType,
      });

      // Add to target inlinks
      targetNode.inlinks.push({
        sourceId: sourceNode.id,
        sourceUrl: sourceNode.url,
        sourceTitle: sourceNode.title,
        anchorText: outLink.anchorText,
        linkType,
      });
    }
  }

  // 3. BFS Shortest-Path Depth Calculation from Root
  const rootNode = nodeMap.get(rootUrl);
  if (rootNode) {
    rootNode.depth = 0;
    const queue: Array<{ id: string; depth: number }> = [{ id: rootNode.id, depth: 0 }];
    const visited = new Set<string>([rootNode.id]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentNode = nodeMap.get(current.id);
      if (!currentNode) continue;

      for (const outlink of currentNode.outlinks) {
        if (!visited.has(outlink.targetId)) {
          visited.add(outlink.targetId);
          const nextNode = nodeMap.get(outlink.targetId);
          if (nextNode) {
            nextNode.depth = current.depth + 1;
            queue.push({ id: nextNode.id, depth: nextNode.depth });
          }
        }
      }
    }
  }

  // 4. Update Node Metrics (Inlinks, Outlinks, Orphan status, Node Radius)
  const nodes = Array.from(nodeMap.values());
  for (const node of nodes) {
    node.inlinksCount = node.inlinks.length;
    node.outlinksCount = node.outlinks.length;

    // Orphan detection: If not root and has 0 internal inlinks, or depth still 999
    if (!node.isRoot && node.inlinksCount === 0) {
      node.isOrphan = true;
      node.depth = node.depth === 999 ? 1 : node.depth; // default visual tier for orphans
    } else if (!node.isRoot && node.depth === 999) {
      // Disconnected sub-cluster
      node.isOrphan = true;
      node.depth = 2;
    }

    // Dynamic radius scaled by inlink equity (PageRank proxy): base 12px up to 26px
    if (node.isRoot) {
      node.radius = 26;
    } else {
      node.radius = Math.min(24, Math.max(12, 12 + Math.floor(node.inlinksCount * 1.8)));
    }
  }

  // 5. Compute Aggregate Graph Statistics
  const reachableNodes = nodes.filter(n => !n.isOrphan);
  const maxDepth = reachableNodes.reduce((max, n) => Math.max(max, n.depth), 0);
  const sumDepth = reachableNodes.reduce((sum, n) => sum + n.depth, 0);
  const avgDepth = reachableNodes.length > 0 ? Number((sumDepth / reachableNodes.length).toFixed(1)) : 0;
  const orphanCount = nodes.filter(n => n.isOrphan).length;
  const brokenLinksCount = links.filter(l => l.isBroken).length;
  const redirectCount = links.filter(l => l.isRedirect).length;

  const stats: SeoMapStats = {
    totalPages: nodes.length,
    totalLinks: links.length,
    maxDepth,
    avgDepth,
    orphanCount,
    brokenLinksCount,
    redirectCount,
  };

  return { nodes, links, stats };
}

/**
 * Generates an enterprise-grade seed site map topology for `https://techflow.io`.
 * Contains 20 interconnected pages spanning Depths 0 to 4, with 1 redirect, 1 broken link,
 * and 1 orphan landing page.
 */
export function getEnterpriseSeedGraph(): {
  nodes: SeoMapNode[];
  links: SeoMapLink[];
  stats: SeoMapStats;
} {
  const rootUrl = 'https://techflow.io';

  const seedPages: RawPageInput[] = [
    // --- DEPTH 0 (Root Homepage) ---
    {
      url: 'https://techflow.io',
      title: 'TechFlow - Next-Gen Autonomous Cloud & API Platform',
      statusCode: 200,
      score: 95,
      linksTo: [
        { targetUrl: 'https://techflow.io/features', anchorText: 'Features', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/solutions', anchorText: 'Solutions', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/pricing', anchorText: 'Pricing', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/blog', anchorText: 'Blog', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/docs', anchorText: 'Documentation', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/about', anchorText: 'About Us', linkType: 'footer' },
        { targetUrl: 'https://techflow.io/contact', anchorText: 'Contact Sales', linkType: 'navigation' },
      ],
    },

    // --- DEPTH 1 (Primary Navigation) ---
    {
      url: 'https://techflow.io/features',
      title: 'Platform Features & Architectural Capabilities | TechFlow',
      statusCode: 200,
      score: 91,
      linksTo: [
        { targetUrl: 'https://techflow.io', anchorText: 'Home', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/features/seo-crawler', anchorText: 'Autonomous SEO Crawler', linkType: 'content' },
        { targetUrl: 'https://techflow.io/features/serp-tracker', anchorText: 'Real-time SERP Tracker', linkType: 'content' },
        { targetUrl: 'https://techflow.io/pricing', anchorText: 'Explore Pricing Plans', linkType: 'content' },
      ],
    },
    {
      url: 'https://techflow.io/solutions',
      title: 'Enterprise Architecture & Cloud Solutions | TechFlow',
      statusCode: 200,
      score: 88,
      linksTo: [
        { targetUrl: 'https://techflow.io', anchorText: 'Home', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/solutions/enterprise', anchorText: 'Enterprise Scale Suite', linkType: 'content' },
        { targetUrl: 'https://techflow.io/case-studies/fintech-scale', anchorText: 'Fintech Case Study', linkType: 'content' },
        { targetUrl: 'https://techflow.io/contact', anchorText: 'Talk to an Architect', linkType: 'content' },
      ],
    },
    {
      url: 'https://techflow.io/pricing',
      title: 'Transparent Pricing & Resource Tiers | TechFlow',
      statusCode: 200,
      score: 96,
      linksTo: [
        { targetUrl: 'https://techflow.io', anchorText: 'Home', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/pricing/calculator', anchorText: 'Interactive Usage Calculator', linkType: 'content' },
        { targetUrl: 'https://techflow.io/docs/quickstart', anchorText: 'Start Free Trial', linkType: 'content' },
      ],
    },
    {
      url: 'https://techflow.io/blog',
      title: 'TechFlow Engineering & Search Architecture Blog',
      statusCode: 200,
      score: 84,
      linksTo: [
        { targetUrl: 'https://techflow.io', anchorText: 'Home', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/blog/technical-seo-guide', anchorText: 'Complete Technical SEO Guide 2026', linkType: 'content' },
        { targetUrl: 'https://techflow.io/blog/core-web-vitals', anchorText: 'Optimizing INP & CLS Layout Shifts', linkType: 'content' },
        { targetUrl: 'https://techflow.io/blog/legacy-post', anchorText: 'Legacy Post (Deprecated)', linkType: 'content' }, // BROKEN LINK TARGET!
      ],
    },
    {
      url: 'https://techflow.io/docs',
      title: 'Developer Documentation & API Guides | TechFlow',
      statusCode: 200,
      score: 92,
      linksTo: [
        { targetUrl: 'https://techflow.io', anchorText: 'Home', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/docs/quickstart', anchorText: 'Quickstart Guide', linkType: 'content' },
        { targetUrl: 'https://techflow.io/docs/api-reference', anchorText: 'REST & GraphQL API Reference', linkType: 'content' },
      ],
    },
    {
      url: 'https://techflow.io/about',
      title: 'About Our Team, Mission & Search Philosophy | TechFlow',
      statusCode: 200,
      score: 89,
      linksTo: [
        { targetUrl: 'https://techflow.io', anchorText: 'Home', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/contact', anchorText: 'Get in Touch', linkType: 'content' },
      ],
    },
    {
      url: 'https://techflow.io/contact',
      title: 'Contact Enterprise Sales & Engineering | TechFlow',
      statusCode: 200,
      score: 90,
      linksTo: [
        { targetUrl: 'https://techflow.io', anchorText: 'Home', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/solutions/enterprise', anchorText: 'Enterprise Features', linkType: 'content' },
      ],
    },

    // --- DEPTH 2 (Sub-sections & Categories) ---
    {
      url: 'https://techflow.io/features/seo-crawler',
      title: 'Autonomous Multi-Threaded SEO Web Crawler | TechFlow',
      statusCode: 200,
      score: 94,
      linksTo: [
        { targetUrl: 'https://techflow.io/features', anchorText: 'Back to Features', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/features/seo-crawler/architecture', anchorText: 'Crawl Pipeline Architecture', linkType: 'content' },
        { targetUrl: 'https://techflow.io/docs/api-reference', anchorText: 'Crawler Webhook APIs', linkType: 'content' },
      ],
    },
    {
      url: 'https://techflow.io/features/serp-tracker',
      title: 'Hourly SERP Tracking & Competitor Radar | TechFlow',
      statusCode: 200,
      score: 86,
      linksTo: [
        { targetUrl: 'https://techflow.io/features', anchorText: 'Features', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/pricing', anchorText: 'View SERP Tracking Quotas', linkType: 'content' },
      ],
    },
    {
      url: 'https://techflow.io/solutions/enterprise',
      title: 'High-Throughput Enterprise Architecture | TechFlow',
      statusCode: 200,
      score: 85,
      linksTo: [
        { targetUrl: 'https://techflow.io/solutions', anchorText: 'Solutions', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/case-studies/fintech-scale', anchorText: 'Fintech Case Study', linkType: 'content' },
        { targetUrl: 'https://techflow.io/contact', anchorText: 'Request Demo', linkType: 'content' },
      ],
    },
    {
      url: 'https://techflow.io/pricing/calculator',
      title: 'Real-Time Infrastructure Cost Calculator | TechFlow',
      statusCode: 200,
      score: 79,
      linksTo: [
        { targetUrl: 'https://techflow.io/pricing', anchorText: 'Pricing Tiers', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/contact', anchorText: 'Custom Enterprise Quote', linkType: 'content' },
      ],
    },
    {
      url: 'https://techflow.io/blog/technical-seo-guide',
      title: 'The Definitive Technical SEO Audit Checklist (2026 Edition)',
      statusCode: 200,
      score: 95,
      linksTo: [
        { targetUrl: 'https://techflow.io/blog', anchorText: 'Blog Index', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/features/seo-crawler', anchorText: 'Automate Audits with TechFlow', linkType: 'content' },
        { targetUrl: 'https://techflow.io/blog/core-web-vitals', anchorText: 'Read about Core Web Vitals', linkType: 'content' },
      ],
    },
    {
      url: 'https://techflow.io/blog/core-web-vitals',
      title: 'Understanding INP, LCP, and CLS Performance Signals',
      statusCode: 200,
      score: 89,
      linksTo: [
        { targetUrl: 'https://techflow.io/blog', anchorText: 'Blog Index', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/blog/technical-seo-guide', anchorText: 'Technical SEO Guide', linkType: 'content' },
      ],
    },
    {
      url: 'https://techflow.io/docs/quickstart',
      title: 'Developer Quickstart & Authentication Keys | TechFlow Docs',
      statusCode: 200,
      score: 93,
      linksTo: [
        { targetUrl: 'https://techflow.io/docs', anchorText: 'Documentation', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/docs/api-reference', anchorText: 'Endpoints Reference', linkType: 'content' },
      ],
    },
    {
      url: 'https://techflow.io/docs/api-reference',
      title: 'Public REST & Streaming WebSocket API Reference | TechFlow',
      statusCode: 200,
      score: 82,
      linksTo: [
        { targetUrl: 'https://techflow.io/docs', anchorText: 'Docs', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/docs/api-reference/crawler-endpoints', anchorText: 'Crawler Endpoints Spec', linkType: 'content' },
      ],
    },

    // --- DEPTH 2 SPECIAL NODES (301 Redirect & 404 Broken) ---
    {
      url: 'https://techflow.io/old-pricing',
      title: 'Old Pricing - 301 Permanent Redirect',
      statusCode: 301,
      score: 72,
      linksTo: [
        { targetUrl: 'https://techflow.io/pricing', anchorText: 'Moved to /pricing', linkType: 'redirect' },
      ],
    },
    {
      url: 'https://techflow.io/blog/legacy-post',
      title: '404 Page Not Found - Legacy Post',
      statusCode: 404,
      score: 42,
      linksTo: [],
    },

    // --- DEPTH 3 (Deep Content) ---
    {
      url: 'https://techflow.io/features/seo-crawler/architecture',
      title: 'Under the Hood: Distributed Queue & DOM AST Extraction Engine',
      statusCode: 200,
      score: 90,
      linksTo: [
        { targetUrl: 'https://techflow.io/features/seo-crawler', anchorText: 'Crawler Overview', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/docs/api-reference', anchorText: 'API Docs', linkType: 'content' },
      ],
    },
    {
      url: 'https://techflow.io/docs/api-reference/crawler-endpoints',
      title: 'Crawler Trigger & Webhook Endpoints Specification',
      statusCode: 200,
      score: 77,
      linksTo: [
        { targetUrl: 'https://techflow.io/docs/api-reference', anchorText: 'API Overview', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/docs/api-reference/crawler-endpoints/spec-v1', anchorText: 'Download OpenAPI v1 Spec', linkType: 'content' },
      ],
    },
    {
      url: 'https://techflow.io/case-studies/fintech-scale',
      title: 'How FinGlobal Scaled from 10k to 5M Indexed URLs with TechFlow',
      statusCode: 200,
      score: 88,
      linksTo: [
        { targetUrl: 'https://techflow.io/solutions/enterprise', anchorText: 'Enterprise Platform', linkType: 'navigation' },
        { targetUrl: 'https://techflow.io/contact', anchorText: 'Get Started', linkType: 'content' },
      ],
    },

    // --- DEPTH 4 (Deep Nested Tier) ---
    {
      url: 'https://techflow.io/docs/api-reference/crawler-endpoints/spec-v1',
      title: 'OpenAPI Spec v1 JSON Specification Sheet',
      statusCode: 200,
      score: 68,
      linksTo: [
        { targetUrl: 'https://techflow.io/docs/api-reference/crawler-endpoints', anchorText: 'Crawler Endpoints', linkType: 'navigation' },
      ],
    },

    // --- ORPHAN PAGE (Discovered via Sitemap, 0 Inlinks) ---
    {
      url: 'https://techflow.io/landing/black-friday-2025',
      title: 'Exclusive Black Friday 2025 Lifetime Enterprise Access',
      statusCode: 200,
      score: 63,
      linksTo: [
        { targetUrl: 'https://techflow.io/pricing', anchorText: 'Upgrade Now', linkType: 'content' },
      ],
    },
  ];

  return buildSeoMapGraph(seedPages, rootUrl);
}
