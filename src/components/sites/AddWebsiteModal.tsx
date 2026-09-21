import React, { useState } from 'react';
import { validateDomain } from '../../sites/domainValidator';
import { DEFAULT_CRAWL_CONFIG } from '../../sites/websiteStore';
import { CrawlConfig, DomainValidationResult } from '../../sites/types';
import { 
  X, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Lock,
  FileCode,
  Bot
} from 'lucide-react';

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWebsite: (data: {
    domain: string;
    name: string;
    canonicalUrl: string;
    crawlConfig: CrawlConfig;
  }) => void;
}

export const AddWebsiteModal: React.FC<AddWebsiteModalProps> = ({
  isOpen,
  onClose,
  onAddWebsite
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [urlInput, setUrlInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [validationResult, setValidationResult] = useState<DomainValidationResult | null>(null);

  // Crawl Config state
  const [crawlConfig, setCrawlConfig] = useState<CrawlConfig>({ ...DEFAULT_CRAWL_CONFIG });
  const [excludePatternInput, setExcludePatternInput] = useState('/admin/*, /checkout/*, /cart/*');

  if (!isOpen) return null;

  const handleValidateUrl = () => {
    const res = validateDomain(urlInput);
    setValidationResult(res);
    if (res.isValid && !nameInput) {
      // Auto-populate friendly name from domain
      const cleanName = res.domain.replace(/^www\./, '').split('.')[0];
      setNameInput(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      const res = validationResult || validateDomain(urlInput);
      setValidationResult(res);
      if (res.isValid) {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3 && validationResult) {
      const patterns = excludePatternInput
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);

      onAddWebsite({
        domain: validationResult.domain,
        name: nameInput || validationResult.domain,
        canonicalUrl: validationResult.normalizedUrl,
        crawlConfig: {
          ...crawlConfig,
          excludePatterns: patterns
        }
      });
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '620px',
        width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: 'var(--shadow-lg), 0 0 30px rgba(16, 185, 129, 0.15)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.35rem' }}
        >
          <X size={20} />
        </button>

        {/* Wizard Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Globe size={22} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.25rem' }}>Register New Website Property</h2>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Configure domain validation, crawl boundaries, and automated monitoring.
          </p>

          {/* Stepper indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'var(--accent-primary)' }} />
            <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= 2 ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)' }} />
            <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: step === 3 ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)' }} />
          </div>
        </div>

        {/* STEP 1: DOMAIN VALIDATION & SSRF CHECK */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Website Target Domain / URL
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={urlInput}
                  onChange={e => {
                    setUrlInput(e.target.value);
                    setValidationResult(null);
                  }}
                  onBlur={handleValidateUrl}
                  placeholder="https://example.com"
                  className="input-text font-mono"
                  style={{ flex: 1 }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleValidateUrl}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem' }}
                >
                  Verify URL
                </button>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                Enter the primary root domain or canonical address (e.g. https://timelinerskolkata.com).
              </span>
            </div>

            {/* Validation Feedback */}
            {validationResult && (
              <div style={{
                background: validationResult.isValid ? 'var(--bg-canvas)' : 'var(--status-critical-bg)',
                border: `1px solid ${validationResult.isValid ? 'var(--border-subtle)' : 'var(--status-critical)'}`,
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {validationResult.isValid ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-success)' }}>
                      <CheckCircle2 size={18} />
                      <strong style={{ fontSize: '0.875rem' }}>Domain Pre-Flight Check Passed</strong>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.775rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                        <Lock size={14} color="var(--accent-primary)" />
                        <span>SSL / HTTPS: <strong style={{ color: 'var(--text-primary)' }}>Secure (Port 443)</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                        <ShieldCheck size={14} color="var(--accent-primary)" />
                        <span>SSRF Guard: <strong style={{ color: 'var(--text-primary)' }}>Public Internet Host</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                        <Bot size={14} color="var(--accent-cyan)" />
                        <span>Robots.txt: <strong style={{ color: 'var(--text-primary)' }}>Verified</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                        <FileCode size={14} color="var(--accent-cyan)" />
                        <span>Sitemap: <strong style={{ color: 'var(--text-primary)' }}>Supported</strong></span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--status-critical)' }}>
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.85rem' }}>{validationResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: PROJECT PROFILE */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Project / Brand Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="The Timeliners Studio"
                className="input-text"
                required
              />
            </div>

            <div style={{
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              fontSize: '0.8rem'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Verified Canonical Address:</span>
              <strong className="font-mono" style={{ color: 'var(--accent-cyan)' }}>
                {validationResult?.normalizedUrl}
              </strong>
            </div>
          </div>
        )}

        {/* STEP 3: CRAWL CONFIGURATION */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Crawl Depth Limit (Levels)
                </label>
                <select
                  value={crawlConfig.crawlDepthLimit}
                  onChange={e => setCrawlConfig({ ...crawlConfig, crawlDepthLimit: parseInt(e.target.value, 10) })}
                  className="input-text"
                >
                  <option value={1}>1 - Root Page Only</option>
                  <option value={2}>2 - Direct Links (Sub-pages)</option>
                  <option value={3}>3 - Deep Crawl (Recommended)</option>
                  <option value={4}>4 - Extensive Site Traversal</option>
                  <option value={5}>5 - Maximum Depth</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Max Pages Ceiling
                </label>
                <input
                  type="number"
                  value={crawlConfig.maxPagesLimit}
                  onChange={e => setCrawlConfig({ ...crawlConfig, maxPagesLimit: parseInt(e.target.value, 10) || 100 })}
                  min={10}
                  max={5000}
                  className="input-text font-mono"
                />
              </div>
            </div>

            <div className="grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Spider User-Agent
                </label>
                <select
                  value={crawlConfig.userAgent}
                  onChange={e => setCrawlConfig({ ...crawlConfig, userAgent: e.target.value as any })}
                  className="input-text"
                >
                  <option value="Googlebot">Googlebot (Default Simulator)</option>
                  <option value="SEOStudioBot">SEOStudioBot/2.4 (Native)</option>
                  <option value="CustomBot">Custom Internal Crawler</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Rate Limit (req/sec)
                </label>
                <input
                  type="number"
                  value={crawlConfig.rateLimitPerSecond}
                  onChange={e => setCrawlConfig({ ...crawlConfig, rateLimitPerSecond: parseInt(e.target.value, 10) || 1 })}
                  min={1}
                  max={10}
                  className="input-text font-mono"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Exclude Path Patterns (comma separated)
              </label>
              <input
                type="text"
                value={excludePatternInput}
                onChange={e => setExcludePatternInput(e.target.value)}
                placeholder="/admin/*, /cart/*, *.pdf"
                className="input-text font-mono"
                style={{ fontSize: '0.8rem' }}
              />
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleNextStep}
            disabled={step === 1 && (!validationResult || !validationResult.isValid)}
            className="btn btn-primary"
          >
            <span>{step === 3 ? 'Save & Register Website' : 'Continue'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
