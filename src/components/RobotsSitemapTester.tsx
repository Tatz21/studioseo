import React, { useState } from 'react';
import { Bot, FileCode, CheckCircle2, AlertCircle, Play } from 'lucide-react';

export const RobotsSitemapTester: React.FC = () => {
  const [robotsText, setRobotsText] = useState(`User-agent: Googlebot
Disallow: /admin/
Disallow: /private/
Disallow: /cart/
Allow: /public/
Allow: /blog/

User-agent: *
Disallow: /api/
Disallow: /checkout/

Sitemap: https://yourwebsite.com/sitemap.xml`);

  const [testUrl, setTestUrl] = useState('/admin/dashboard');
  const [testAgent, setTestAgent] = useState('Googlebot');
  const [testResult, setTestResult] = useState<{ allowed: boolean; matchedRule: string } | null>(null);

  const handleTestRobots = () => {
    const lines = robotsText.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    let currentUserAgent = '*';
    let isApplicable = false;
    let result = { allowed: true, matchedRule: 'Default: Allowed (no explicit block)' };

    for (const line of lines) {
      if (line.toLowerCase().startsWith('user-agent:')) {
        currentUserAgent = line.split(':')[1].trim();
        isApplicable = currentUserAgent === '*' || currentUserAgent.toLowerCase() === testAgent.toLowerCase();
      } else if (isApplicable) {
        if (line.toLowerCase().startsWith('disallow:')) {
          const path = line.split(':')[1].trim();
          if (path && testUrl.startsWith(path)) {
            result = { allowed: false, matchedRule: `Disallow: ${path} (Agent: ${currentUserAgent})` };
            break;
          }
        } else if (line.toLowerCase().startsWith('allow:')) {
          const path = line.split(':')[1].trim();
          if (path && testUrl.startsWith(path)) {
            result = { allowed: true, matchedRule: `Allow: ${path} (Agent: ${currentUserAgent})` };
            break;
          }
        }
      }
    }

    setTestResult(result);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 460px) 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Robots.txt Editor & Test Workbench */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <Bot size={20} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.15rem' }}>Robots.txt Directive Tester</h3>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.35rem' }}>
            Robots.txt File Content
          </label>
          <textarea
            value={robotsText}
            onChange={e => setRobotsText(e.target.value)}
            className="textarea font-mono"
            style={{ fontSize: '0.8125rem', minHeight: '220px' }}
          />
        </div>

        {/* Test Inputs */}
        <div className="grid-2">
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>User-Agent</label>
            <input type="text" value={testAgent} onChange={e => setTestAgent(e.target.value)} className="input-text font-mono" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Target Path / URL</label>
            <input type="text" value={testUrl} onChange={e => setTestUrl(e.target.value)} className="input-text font-mono" />
          </div>
        </div>

        <button onClick={handleTestRobots} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          <Play size={16} />
          <span>Test Crawler Access</span>
        </button>

        {testResult && (
          <div style={{
            background: testResult.allowed ? 'var(--status-success-bg)' : 'var(--status-critical-bg)',
            border: `1px solid ${testResult.allowed ? 'var(--status-success)' : 'var(--status-critical)'}`,
            borderRadius: '8px',
            padding: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            {testResult.allowed ? <CheckCircle2 size={20} color="var(--status-success)" /> : <AlertCircle size={20} color="var(--status-critical)" />}
            <div>
              <strong style={{ color: testResult.allowed ? 'var(--status-success)' : 'var(--status-critical)', fontSize: '0.9rem' }}>
                {testResult.allowed ? 'CRAWL ALLOWED' : 'CRAWL BLOCKED (DISALLOWED)'}
              </strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Rule: {testResult.matchedRule}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* XML Sitemap Helper & Best Practices */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <FileCode size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.15rem' }}>XML Sitemap Architecture & Verification</h3>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          An XML sitemap lists a website's important pages, making sure Google and other search engines can crawl them efficiently.
        </p>

        <div style={{
          background: 'var(--bg-canvas)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '1rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--accent-cyan)',
          overflowX: 'auto'
        }}>
          {`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://timelinerskolkata.com/</loc>
    <lastmod>2026-09-21</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://timelinerskolkata.com/wedding-photography</loc>
    <lastmod>2026-09-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`}
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Sitemap Best Practices:
          </span>
          <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <li>Keep sitemaps under 50,000 URLs and 50MB uncompressed size.</li>
            <li>Only include canonical URLs that return 200 HTTP status codes (exclude redirects and 404s).</li>
            <li>Ensure the sitemap URL is referenced at the bottom of your <code className="font-mono">robots.txt</code>.</li>
            <li>Submit your verified sitemap in Google Search Console for automated indexing.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
