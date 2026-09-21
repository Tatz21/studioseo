import React, { useState } from 'react';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  ShieldCheck, 
  Copy, 
  Check
} from 'lucide-react';
import { SeoMapNode } from '../../map/types';

interface NodeInspectorDrawerProps {
  node: SeoMapNode | null;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
  onNavigateToExtractor?: (url: string) => void;
  onNavigateToTechnical?: (url: string) => void;
}

export const NodeInspectorDrawer: React.FC<NodeInspectorDrawerProps> = ({
  node,
  onClose,
  onSelectNode,
  onNavigateToExtractor,
  onNavigateToTechnical,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inlinks' | 'outlinks'>('overview');
  const [copied, setCopied] = useState(false);

  if (!node) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(node.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <span className="badge badge-emerald">HTTP {statusCode} OK</span>;
    }
    if (statusCode >= 300 && statusCode < 400) {
      return <span className="badge badge-amber">HTTP {statusCode} Redirect</span>;
    }
    return <span className="badge badge-rose">HTTP {statusCode} Error</span>;
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'var(--accent-primary)';
      case 'B': return '#06B6D4';
      case 'C': return '#F59E0B';
      case 'D': return '#F97316';
      default: return '#EF4444';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '460px',
      maxWidth: '92vw',
      background: 'rgba(11, 15, 23, 0.95)',
      backdropFilter: 'blur(20px)',
      borderLeft: '1px solid var(--border-subtle)',
      boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.6)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInRight 0.25s ease-out'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
        background: 'rgba(18, 24, 38, 0.5)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            {getStatusBadge(node.statusCode)}
            <span className="badge badge-cyan">Depth {node.depth}{node.isRoot ? ' (Root)' : ''}</span>
            {node.isOrphan && (
              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                Orphan Page
              </span>
            )}
            {node.indexable ? (
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Indexable</span>
            ) : (
              <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>Noindex</span>
            )}
          </div>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: 700, 
            color: 'var(--text-primary)', 
            margin: 0, 
            lineHeight: 1.4 
          }}>
            {node.title}
          </h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            marginTop: '0.35rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            <span style={{ 
              fontFamily: 'var(--font-mono)', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              maxWidth: '300px'
            }}>
              {node.url}
            </span>
            <button
              onClick={handleCopyUrl}
              title="Copy URL"
              style={{
                background: 'none',
                border: 'none',
                color: copied ? 'var(--accent-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{ padding: '0.4rem', borderRadius: '8px', color: 'var(--text-secondary)' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(15, 23, 42, 0.4)',
        padding: '0 1rem'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'overview' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'overview' ? 600 : 400,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('inlinks')}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'inlinks' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'inlinks' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'inlinks' ? 600 : 400,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <ArrowDownLeft size={14} />
          <span>Inlinks ({node.inlinksCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('outlinks')}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'outlinks' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'outlinks' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'outlinks' ? 600 : 400,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <ArrowUpRight size={14} />
          <span>Outlinks ({node.outlinksCount})</span>
        </button>
      </div>

      {/* Drawer Body */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {activeTab === 'overview' && (
          <>
            {/* Health Score & Grade Card */}
            <div style={{
              background: 'rgba(18, 24, 38, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  SEO Page Score
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ 
                    fontSize: '2rem', 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 800, 
                    color: getGradeColor(node.grade) 
                  }}>
                    {node.score}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ 100</span>
                </div>
              </div>

              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                border: `2px solid ${getGradeColor(node.grade)}`,
                background: `${getGradeColor(node.grade)}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.4rem',
                color: getGradeColor(node.grade)
              }}>
                {node.grade}
              </div>
            </div>

            {/* Warning Flags */}
            {node.isOrphan && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                gap: '0.75rem'
              }}>
                <AlertTriangle size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#FCA5A5' }}>
                    Orphan Page Detected
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    This page has 0 internal inlinks pointing to it. Search engine spiders will not discover it naturally during routine crawls unless listed in XML sitemaps.
                  </div>
                </div>
              </div>
            )}

            {node.depth >= 4 && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                gap: '0.75rem'
              }}>
                <ShieldAlert size={20} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#FCD34D' }}>
                    Deep Crawl Depth (Tier {node.depth})
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    It takes 4 or more clicks from the homepage to reach this page. Search engines assign less crawl budget and ranking authority to deeply buried pages.
                  </div>
                </div>
              </div>
            )}

            {node.statusCode >= 400 && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                gap: '0.75rem'
              }}>
                <ShieldAlert size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#FCA5A5' }}>
                    Dead / Broken Link (HTTP {node.statusCode})
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    Internal links are targeting a non-existent URL. Fix the broken hyperlinks or implement a 301 permanent redirect to a relevant page.
                  </div>
                </div>
              </div>
            )}

            {/* Architecture Details */}
            <div style={{
              background: 'rgba(18, 24, 38, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '1.25rem'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Architecture & Link Equity
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Inbound Internal Links</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
                    {node.inlinksCount}
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Outbound Internal Links</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#06B6D4', marginTop: '0.2rem' }}>
                    {node.outlinksCount}
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Crawl Tier / Depth</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {node.depth === 0 ? '0 (Root)' : `Level ${node.depth}`}
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Index Status</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: node.indexable ? '#10B981' : '#EF4444', marginTop: '0.35rem' }}>
                    {node.indexable ? 'Indexable' : 'Noindex'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {onNavigateToExtractor && (
                <button
                  onClick={() => onNavigateToExtractor(node.url)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.825rem' }}
                >
                  <Layers size={16} />
                  <span>Inspect in Data Extractor</span>
                </button>
              )}
              {onNavigateToTechnical && (
                <button
                  onClick={() => onNavigateToTechnical(node.url)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.825rem' }}
                >
                  <ShieldCheck size={16} />
                  <span>Run Technical SEO Audit</span>
                </button>
              )}
            </div>
          </>
        )}

        {activeTab === 'inlinks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              Internal pages linking directly to this page ({node.inlinks.length}):
            </div>
            {node.inlinks.length === 0 ? (
              <div style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
              }}>
                No incoming internal links detected.
              </div>
            ) : (
              node.inlinks.map((inlink, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(18, 24, 38, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {inlink.sourceTitle || 'Page'}
                    </span>
                    <button
                      onClick={() => onSelectNode(inlink.sourceId)}
                      className="btn btn-ghost"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: 'auto', color: 'var(--accent-primary)' }}
                    >
                      Focus Node →
                    </button>
                  </div>
                  <div style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {inlink.sourceUrl}
                  </div>
                  <div style={{ 
                    fontSize: '0.725rem', 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    padding: '0.35rem 0.5rem', 
                    borderRadius: '4px',
                    color: 'var(--text-secondary)' 
                  }}>
                    Anchor Text: <strong style={{ color: 'var(--text-primary)' }}>"{inlink.anchorText}"</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'outlinks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              Pages linked from this document ({node.outlinks.length}):
            </div>
            {node.outlinks.length === 0 ? (
              <div style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
              }}>
                No outgoing links found on this page.
              </div>
            ) : (
              node.outlinks.map((outlink, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(18, 24, 38, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {outlink.targetTitle || 'Target Page'}
                    </span>
                    <button
                      onClick={() => onSelectNode(outlink.targetId)}
                      className="btn btn-ghost"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: 'auto', color: 'var(--accent-primary)' }}
                    >
                      Focus Node →
                    </button>
                  </div>
                  <div style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {outlink.targetUrl}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                    <span style={{ 
                      fontSize: '0.725rem', 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      padding: '0.25rem 0.4rem', 
                      borderRadius: '4px',
                      color: 'var(--text-secondary)' 
                    }}>
                      Anchor: <strong style={{ color: 'var(--text-primary)' }}>"{outlink.anchorText}"</strong>
                    </span>
                    {getStatusBadge(outlink.statusCode)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
