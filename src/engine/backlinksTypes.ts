export type LinkType = 'dofollow' | 'nofollow' | 'ugc' | 'sponsored';
export type LinkStatus = 'active' | 'lost' | 'new';
export type AnchorCategory = 'branded' | 'exact' | 'phrase' | 'naked' | 'generic';
export type ToxicityLevel = 'low' | 'medium' | 'high';

export interface BacklinkItem {
  id: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceDr: number; // 0-100 Domain Rating of referring source
  sourceUr: number; // 0-100 URL Rating of referring page
  sourceTraffic: number; // Estimated monthly organic traffic
  targetUrl: string;
  anchorText: string;
  contextSnippet: string; // Surrounding text snippet with anchor highlighted
  linkType: LinkType;
  firstSeen: string; // ISO timestamp
  lastSeen: string; // ISO timestamp
  status: LinkStatus;
  spamScore: number; // 0-100% spam/toxicity index
  isToxic: boolean; // Flagged as toxic/hazardous (spamScore >= 60)
  isDisavowed: boolean;
  lostReason?: string; // Reason if status === 'lost' (e.g., "Page 404", "Link Removed", "Redirected 301")
  ipAddress?: string;
}

export interface ReferringDomain {
  domain: string;
  dr: number;
  backlinkCount: number;
  dofollowCount: number;
  dofollowPercent: number;
  traffic: number;
  category: string;
  countryCode: string; // e.g., 'US', 'GB', 'DE', 'IN'
  firstSeen: string;
  spamScore: number;
  isToxic: boolean;
  isDisavowed: boolean;
  status: 'active' | 'lost' | 'new';
}

export interface AnchorDistribution {
  anchor: string;
  category: AnchorCategory;
  backlinksCount: number;
  referringDomainsCount: number;
  percentage: number;
  isOverOptimized: boolean; // Warns if exact match exceeds Penguin thresholds (> 20%)
}

export interface LinkVelocityPoint {
  month: string; // e.g. "Oct 2025", "Nov 2025"
  newLinks: number;
  lostLinks: number;
  netGrowth: number;
  referringDomains: number;
}

export interface CompetitorLinkIntersect {
  domain: string;
  dr: number;
  traffic: number;
  category: string;
  competitorsLinking: {
    domain: string;
    backlinksCount: number;
  }[];
  outreachPriority: 'high' | 'medium' | 'low';
  estimatedAuthorityImpact: string;
}

export interface BacklinkProfileOverview {
  domain: string;
  dr: number; // Domain Rating (0-100)
  ur: number; // URL Rating (0-100)
  totalBacklinks: number;
  activeBacklinks: number;
  lostBacklinks: number;
  newBacklinks: number;
  referringDomains: number;
  referringIps: number;
  referringSubnets: number;
  dofollowRatio: number; // e.g. 74%
  nofollowRatio: number; // e.g. 22%
  ugcRatio: number; // e.g. 3%
  sponsoredRatio: number; // e.g. 1%
  toxicityScore: number; // 0-100% aggregate
  toxicityRisk: ToxicityLevel;
  toxicBacklinksCount: number;
  disavowedCount: number;
  growthRatePercent: number; // Month-over-month growth
}

export interface BacklinksData {
  overview: BacklinkProfileOverview;
  backlinks: BacklinkItem[];
  referringDomains: ReferringDomain[];
  anchors: AnchorDistribution[];
  velocity: LinkVelocityPoint[];
  linkIntersect: CompetitorLinkIntersect[];
  disavowList: string[]; // List of disavowed domains/URLs
}

export interface BacklinksFilterParams {
  domain: string;
  search?: string;
  filter?: 'all' | 'active' | 'dofollow' | 'nofollow' | 'toxic' | 'lost' | 'new' | 'disavowed';
  minDr?: number;
  linkType?: 'all' | LinkType;
  sortBy?: 'dr' | 'ur' | 'traffic' | 'firstSeen' | 'spamScore';
  sortDir?: 'asc' | 'desc';
  disavowedDomains?: string[];
}
