export type LinkType = 'navigation' | 'content' | 'footer' | 'redirect';

export interface InlinkReference {
  sourceId: string;
  sourceUrl: string;
  sourceTitle: string;
  anchorText: string;
  linkType: LinkType;
}

export interface OutlinkReference {
  targetId: string;
  targetUrl: string;
  targetTitle: string;
  anchorText: string;
  statusCode: number;
  linkType: LinkType;
}

export interface SeoMapNode {
  id: string;
  url: string;
  path: string;
  title: string;
  depth: number; // 0 = root, 1 = direct child, etc.
  statusCode: number; // 200, 301, 404, etc.
  indexable: boolean;
  score: number; // 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  inlinksCount: number;
  outlinksCount: number;
  inlinks: InlinkReference[];
  outlinks: OutlinkReference[];
  isOrphan: boolean; // true if inlinksCount === 0 and depth > 0
  isRoot: boolean; // true if depth === 0
  
  // Physics & Canvas coordinates
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isPinned?: boolean;
}

export interface SeoMapLink {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  linkType: LinkType;
  isInternal: boolean;
  isBroken: boolean; // target status 4xx/5xx
  isRedirect: boolean; // target status 3xx
}

export type DepthFilter = 'all' | 0 | 1 | 2 | 3 | 'deep'; // 'deep' is 4+
export type StatusFilter = 'all' | '200' | '3xx' | '4xx' | 'orphan' | 'low-score';
export type LayoutMode = 'force' | 'radial';

export interface SeoMapFilterState {
  searchQuery: string;
  depth: DepthFilter;
  status: StatusFilter;
  layoutMode: LayoutMode;
}

export interface SeoMapStats {
  totalPages: number;
  totalLinks: number;
  maxDepth: number;
  avgDepth: number;
  orphanCount: number;
  brokenLinksCount: number;
  redirectCount: number;
}
