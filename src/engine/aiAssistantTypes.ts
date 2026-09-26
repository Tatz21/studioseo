import { NavigationTab } from '../components/Header';

export type AssistantPersonaId = 
  | 'technical_architect' 
  | 'content_strategist' 
  | 'aeo_specialist' 
  | 'executive_cmo';

export interface AssistantPersona {
  id: AssistantPersonaId;
  name: string;
  title: string;
  description: string;
  badge: string;
  iconName: string;
  color: string;
  systemDirective: string;
  suggestedPromptCategories: string[];
}

export interface ActionLink {
  label: string;
  targetTab: NavigationTab;
  badge?: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  personaId?: AssistantPersonaId;
  tokensUsed?: number;
  responseTimeMs?: number;
  actionLinks?: ActionLink[];
  suggestedFollowUps?: string[];
  referencedIssuesCount?: number;
}

export interface PromptPlaybookItem {
  id: string;
  title: string;
  category: 'Technical' | 'Content' | 'AEO / Voice' | 'Authority' | 'Executive';
  personaId: AssistantPersonaId;
  description: string;
  promptText: string;
  iconName: string;
}

export interface AssistantAuditContext {
  targetUrl: string;
  targetDomain: string;
  overallScore: number;
  grade: string;
  criticalIssuesCount: number;
  warningIssuesCount: number;
  passedChecksCount: number;
  wordCount: number;
  readingEaseScore: number;
  readingLevel: string;
  pageSizeKb: number;
  loadTimeMs: number;
  coreWebVitals: {
    lcp: number;
    inp: number;
    cls: number;
  };
  detectedSchemas: string[];
  topKeywords: string[];
  topIssues: {
    title: string;
    severity: 'critical' | 'warning' | 'info';
    category: string;
  }[];
}

export interface AiAssistantRequest {
  message: string;
  personaId: AssistantPersonaId;
  context?: AssistantAuditContext;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export interface AiAssistantResponse {
  ok: boolean;
  message: ChatMessage;
  error?: string;
}
