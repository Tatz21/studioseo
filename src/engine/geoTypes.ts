export type LocalSeoPillarStatus = 'good' | 'warning' | 'critical';

export interface LocalSeoPillarScore {
  name: string;
  score: number;
  maxScore: number;
  status: LocalSeoPillarStatus;
  summary: string;
}

export interface BusinessLocalProfile {
  name: string;
  category: string;
  businessType: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  latitude: number;
  longitude: number;
  hours: string;
  priceRange: string;
  areasServed: string[];
}

export interface GeoGridPin {
  id: string;
  row: number;
  col: number;
  label: string;
  lat: number;
  lng: number;
  distanceKm: number;
  rank: number; // 1 to 20+
  inLocalPack: boolean;
  topCompetitor: string;
}

export interface GeoGridData {
  keyword: string;
  gridSize: '3x3' | '5x5';
  radiusKm: number;
  centerLat: number;
  centerLng: number;
  centerAddress: string;
  averageGridRank: number;
  shareOfLocalVoice: number; // 0 - 100%
  top3PinsCount: number;
  totalPins: number;
  pins: GeoGridPin[];
}

export interface LocalPackItem {
  position: number;
  name: string;
  isTargetBusiness: boolean;
  rating: number;
  reviewCount: number;
  category: string;
  address: string;
  hours: string;
  phone: string;
  website: string;
  attributes: string[];
  distanceKm: number;
}

export interface LocalPackFactor {
  factor: string;
  importance: 'High' | 'Very High' | 'Medium';
  targetScore: number; // 0 - 100
  topCompetitorScore: number; // 0 - 100
  assessment: string;
}

export interface LocalPackSimulation {
  keyword: string;
  city: string;
  targetRank: number | null;
  items: LocalPackItem[];
  rankFactors: LocalPackFactor[];
}

export type CitationStatus = 'consistent' | 'mismatch' | 'missing';

export interface CitationDirectory {
  id: string;
  name: string;
  authority: number;
  category: string;
  url: string;
  listedName: string;
  listedAddress: string;
  listedPhone: string;
  status: CitationStatus;
  discrepancyType?: 'phone' | 'address' | 'name' | 'missing';
  discrepancyNote?: string;
  fixAction: string;
}

export interface LocalSchemaConfig {
  type: string;
  name: string;
  legalName: string;
  telephone: string;
  email: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
  latitude: number;
  longitude: number;
  priceRange: string;
  openingHours: string[];
  areasServed: string[];
  sameAs: string[];
}

export interface LocalSchemaValidationResult {
  config: LocalSchemaConfig;
  jsonLd: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendedFields: string[];
}

export interface GeoKeywordItem {
  id: string;
  keyword: string;
  city: string;
  intent: 'Near Me' | 'City Direct' | 'Neighborhood' | 'Service Direct';
  monthlyVolume: number;
  difficulty: number;
  localPack: boolean;
  currentRank: number;
  previousRank: number;
  serpFeatures: string[];
}

export interface LocalAuditCheckItem {
  id: string;
  category: 'NAP Consistency' | 'Google Business Profile' | 'Schema & Tech' | 'Citations' | 'Local Content';
  title: string;
  status: 'pass' | 'warning' | 'fail';
  impact: 'high' | 'medium' | 'low';
  description: string;
  remediation: string;
}

export interface GeoLocalSeoAnalysis {
  targetUrl: string;
  targetDomain: string;
  analyzedAt: string;
  overallScore: number;
  scoreGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  profile: BusinessLocalProfile;
  pillars: {
    napConsistency: LocalSeoPillarScore;
    gbpOptimization: LocalSeoPillarScore;
    schemaGeocoding: LocalSeoPillarScore;
    citationsHealth: LocalSeoPillarScore;
    onPageGeoSignals: LocalSeoPillarScore;
  };
  geoGrid: GeoGridData;
  availableGridKeywords: string[];
  localPack: LocalPackSimulation;
  citations: CitationDirectory[];
  schemaValidation: LocalSchemaValidationResult;
  geoKeywords: GeoKeywordItem[];
  auditChecks: LocalAuditCheckItem[];
}
