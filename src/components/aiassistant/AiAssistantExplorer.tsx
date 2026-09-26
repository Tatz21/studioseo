import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  FileText,
  Award,
  Send,
  Trash2,
  Download,
  Copy,
  Check,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import {
  ChatMessage,
  AssistantPersonaId,
  AssistantAuditContext
} from '../../engine/aiAssistantTypes';
import {
  ASSISTANT_PERSONAS,
  PROMPT_PLAYBOOKS,
  AiAssistantService
} from '../../engine/aiAssistantService';
import { NavigationTab } from '../Header';

interface AiAssistantExplorerProps {
  targetUrl?: string;
  auditReport?: any;
  onNavigateToTab?: (tab: NavigationTab) => void;
}

export const AiAssistantExplorer: React.FC<AiAssistantExplorerProps> = ({
  targetUrl = 'https://www.posterscraft.com',
  auditReport,
  onNavigateToTab
}) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<AssistantPersonaId>('technical_architect');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  // Chat message history
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'initial-welcome',
        role: 'assistant',
        content: `### Welcome to SEO Studio AI Copilot!

I'm your intelligent technical optimization assistant, actively grounded in the live audit context of **${targetUrl}**.

* **Overall SEO Health Score:** \`${auditReport?.scores?.overall ?? 84}/100 (Grade A)\`
* **Core Web Vitals:** \`LCP 2.1s\` • \`CLS 0.04\` • \`INP 110ms\`
* **Active Persona:** **Technical Architect** (Infrastructure, Schemas & Crawlability)

Choose a **Prompt Playbook** on the left, or type any specific question about your technical SEO, Core Web Vitals, or AEO rankings below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        personaId: 'technical_architect',
        actionLinks: [
          { label: 'View Page Audit', targetTab: 'audit', badge: 'Audit' },
          { label: 'Open AEO Studio', targetTab: 'aeo', badge: 'Phase 21' },
          { label: 'Inspect AI Visibility', targetTab: 'aivisibility', badge: 'Phase 22' }
        ],
        suggestedFollowUps: [
          'Audit my Core Web Vitals and tell me how to fix LCP',
          'Generate schema.org/Speakable and FAQPage JSON-LD',
          'What is my current brand Share of Voice across ChatGPT and Claude?',
          'Generate an Executive CMO brief for my stakeholders'
        ]
      }
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Build Context Object from props
  const buildAuditContext = (): AssistantAuditContext => {
    const domain = targetUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'posterscraft.com';
    return {
      targetUrl,
      targetDomain: domain,
      overallScore: auditReport?.scores?.overall ?? 84,
      grade: auditReport?.scores?.grade ?? 'A',
      criticalIssuesCount: auditReport?.issues?.filter((i: any) => i.severity === 'critical')?.length ?? 2,
      warningIssuesCount: auditReport?.issues?.filter((i: any) => i.severity === 'warning')?.length ?? 5,
      passedChecksCount: 18,
      wordCount: auditReport?.wordCount ?? 1250,
      readingEaseScore: auditReport?.readingEaseScore ?? 68,
      readingLevel: auditReport?.readingLevel ?? '8th-9th Grade',
      pageSizeKb: auditReport?.pageSizeKb ?? 380,
      loadTimeMs: auditReport?.loadTimeMs ?? 420,
      coreWebVitals: {
        lcp: 2.1,
        inp: 110,
        cls: 0.04
      },
      detectedSchemas: ['Organization', 'ProfessionalService'],
      topKeywords: ['web development', 'digital marketing', 'kolkata agency'],
      topIssues: [
        { title: 'Missing schema.org/Speakable specification', severity: 'critical', category: 'Schema' },
        { title: 'Hero banner missing high fetchpriority preload', severity: 'warning', category: 'Performance' }
      ]
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      personaId: selectedPersonaId
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      const response = await AiAssistantService.sendMessage({
        message: messageContent,
        personaId: selectedPersonaId,
        context: buildAuditContext(),
        conversationHistory: history
      });

      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error('Failed to get AI assistant reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyCode = (codeText: string, key: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm('Clear conversation history?')) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: `Conversation cleared. Active project context preserved for **${targetUrl}**. How can I help you optimize your SEO?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          personaId: selectedPersonaId
        }
      ]);
    }
  };

  const handleExportTranscript = () => {
    const markdown = messages.map(m => {
      const sender = m.role === 'user' ? '👤 User' : `🤖 SEO Copilot (${m.personaId || 'Architect'})`;
      return `### ${sender} [${m.timestamp}]\n\n${m.content}\n\n---\n`;
    }).join('\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-assistant-transcript-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentPersona = ASSISTANT_PERSONAS.find(p => p.id === selectedPersonaId) || ASSISTANT_PERSONAS[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: '1.25rem', width: '100%', maxWidth: '1440px', margin: '0 auto', minHeight: 'calc(100vh - 220px)' }}>
      
      {/* LEFT COLUMN: PERSONAS, CONTEXT & PLAYBOOKS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Active Project Context Pill */}
        <div className="card" style={{ padding: '1rem', background: 'rgba(17, 24, 39, 0.75)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Connected Site Context
            </span>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-primary)', fontSize: '0.65rem' }}>
              Score: {auditReport?.scores?.overall ?? 84}%
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {targetUrl}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            <span>LCP: <strong>2.1s</strong></span>
            <span>•</span>
            <span>CLS: <strong>0.04</strong></span>
            <span>•</span>
            <span style={{ color: 'var(--status-critical)' }}>2 Issues</span>
          </div>
        </div>

        {/* Persona Selector */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Copilot Persona Mode
            </h4>
            <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>
              {currentPersona.badge}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ASSISTANT_PERSONAS.map((persona) => {
              const isSelected = selectedPersonaId === persona.id;
              return (
                <div
                  key={persona.id}
                  onClick={() => setSelectedPersonaId(persona.id)}
                  style={{
                    padding: '0.65rem 0.8rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? `1px solid ${persona.color}` : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: persona.color
                  }}>
                    {persona.id === 'technical_architect' && <ShieldCheck size={16} />}
                    {persona.id === 'content_strategist' && <FileText size={16} />}
                    {persona.id === 'aeo_specialist' && <Sparkles size={16} />}
                    {persona.id === 'executive_cmo' && <Award size={16} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {persona.name}
                    </div>
                    <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {persona.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prompt Playbooks */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Prompt Playbooks
          </h4>
          <p style={{ margin: 0, fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            1-click diagnostic prompts grounded in active site telemetry.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.25rem' }}>
            {PROMPT_PLAYBOOKS.map((pb) => (
              <button
                key={pb.id}
                onClick={() => {
                  setSelectedPersonaId(pb.personaId);
                  handleSendMessage(pb.promptText);
                }}
                style={{
                  padding: '0.55rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '6px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                  <span style={{ color: 'var(--accent-primary)' }}>•</span>
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {pb.title}
                  </span>
                </div>
                <ChevronRight size={12} color="var(--text-muted)" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: MAIN CHAT WORKSPACE */}
      <div className="card" style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        background: 'rgba(11, 15, 23, 0.85)'
      }}>
        {/* Chat Header Toolbar */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(17, 24, 39, 0.75)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Bot size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  SEO Studio Copilot
                </span>
                <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-primary)' }}>
                  Phase 23 Live
                </span>
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                Active Persona: <strong style={{ color: currentPersona.color }}>{currentPersona.name}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={handleExportTranscript}
              className="btn btn-secondary"
              style={{ fontSize: '0.725rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              title="Download Conversation Markdown"
            >
              <Download size={13} />
              Export
            </button>
            <button
              onClick={handleClearChat}
              className="btn btn-secondary"
              style={{ fontSize: '0.725rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              title="Clear Thread"
            >
              <Trash2 size={13} />
              Clear
            </button>
          </div>
        </div>

        {/* Message Thread Scroll Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          maxHeight: '620px'
        }}>
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  gap: '0.4rem',
                  maxWidth: '100%'
                }}
              >
                {/* Meta info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>{isUser ? 'You' : `SEO Copilot • ${msg.personaId ? ASSISTANT_PERSONAS.find(p => p.id === msg.personaId)?.name : 'Architect'}`}</span>
                  <span>{msg.timestamp}</span>
                  {msg.responseTimeMs && <span>({msg.responseTimeMs}ms)</span>}
                </div>

                {/* Message Bubble Card */}
                <div
                  style={{
                    maxWidth: isUser ? '80%' : '94%',
                    background: isUser ? 'rgba(16, 185, 129, 0.15)' : 'rgba(17, 24, 39, 0.9)',
                    border: isUser ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '1rem 1.25rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    lineHeight: 1.55,
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {/* Content with basic Markdown formatting */}
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>

                  {/* Copy code button helper if content contains code block */}
                  {msg.content.includes('```') && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          const codeMatch = msg.content.match(/```(?:html|css|json|text)?\n([\s\S]*?)```/);
                          if (codeMatch && codeMatch[1]) {
                            handleCopyCode(codeMatch[1].trim(), msg.id);
                          } else {
                            handleCopyCode(msg.content, msg.id);
                          }
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          padding: '0.2rem 0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        {copiedCodeKey === msg.id ? <Check size={11} color="var(--status-success)" /> : <Copy size={11} />}
                        {copiedCodeKey === msg.id ? 'Code Copied' : 'Copy Code Snippet'}
                      </button>
                    </div>
                  )}

                  {/* Action Link Buttons */}
                  {msg.actionLinks && msg.actionLinks.length > 0 && (
                    <div style={{
                      marginTop: '0.85rem',
                      paddingTop: '0.65rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.4rem'
                    }}>
                      {msg.actionLinks.map((link, idx) => (
                        <button
                          key={idx}
                          onClick={() => onNavigateToTab?.(link.targetTab)}
                          className="btn btn-secondary"
                          style={{
                            fontSize: '0.725rem',
                            padding: '0.25rem 0.6rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: 'rgba(255, 255, 255, 0.04)',
                            borderColor: 'rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{link.label}</span>
                          {link.badge && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>({link.badge})</span>
                          )}
                          <ArrowRight size={11} color="var(--accent-primary)" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggested Follow-Ups */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                    {msg.suggestedFollowUps.map((fu, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(fu)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '14px',
                          padding: '0.2rem 0.6rem',
                          fontSize: '0.7rem',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <span>💡 {fu}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing radar loader */}
          {isSending && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.775rem' }}>
              <Sparkles size={14} className="pulse" color="var(--accent-primary)" />
              <span>Analyzing audit AST and synthesizing recommendations...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Composer */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(17, 24, 39, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          {/* Context Issue Quick Prompts */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', alignSelf: 'center', whiteSpace: 'nowrap' }}>
              Detected Issues:
            </span>
            <button
              onClick={() => handleSendMessage('How do I fix the missing Speakable schema?')}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '0.15rem 0.5rem',
                fontSize: '0.675rem',
                color: 'var(--status-critical)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              • Fix Missing Speakable Schema
            </button>
            <button
              onClick={() => handleSendMessage('Give me code to preload hero assets for LCP')}
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '0.15rem 0.5rem',
                fontSize: '0.675rem',
                color: 'var(--status-warning)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              • Preload Hero LCP
            </button>
            <button
              onClick={() => handleSendMessage('What are our top 3 competitor displacement gaps?')}
              style={{
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '12px',
                padding: '0.15rem 0.5rem',
                fontSize: '0.675rem',
                color: '#06B6D4',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              • Competitor Gap Analysis
            </button>
          </div>

          {/* Form Textarea and Send button */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              className="input-field"
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${currentPersona.name} anything about ${targetUrl}... (Press Enter to send, Shift+Enter for newline)`}
              style={{
                flex: 1,
                fontSize: '0.85rem',
                lineHeight: 1.45,
                resize: 'none',
                background: 'rgba(11, 15, 23, 0.9)'
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isSending}
              className="btn btn-primary"
              style={{
                height: '42px',
                padding: '0 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.825rem'
              }}
            >
              <Send size={14} />
              <span>Send</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
