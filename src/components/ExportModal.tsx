import React from 'react';
import { X, Download, FileText, Code2, Printer } from 'lucide-react';
import { AuditReport } from '../engine/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AuditReport;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  report
}) => {

  if (!isOpen) return null;

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `seo-audit-${new URL(report.targetUrl.startsWith('http') ? report.targetUrl : `https://${report.targetUrl}`).hostname}-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadHtml = () => {
    const htmlReport = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SEO Audit Report - ${report.targetUrl}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0B0F17; color: #F9FAFB; padding: 2rem; max-width: 960px; margin: 0 auto; line-height: 1.6; }
    h1, h2, h3 { color: #10B981; }
    .card { background: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1.25rem; margin-bottom: 1.25rem; }
    .badge { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
    .critical { background: rgba(239,68,68,0.2); color: #EF4444; border: 1px solid #EF4444; }
    .warning { background: rgba(245,158,11,0.2); color: #F59E0B; border: 1px solid #F59E0B; }
    .passed { background: rgba(16,185,129,0.2); color: #10B981; border: 1px solid #10B981; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 0.6rem; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: left; }
    pre { background: #000; padding: 0.75rem; border-radius: 4px; color: #06B6D4; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>SEO Studio Pro - Executive Audit Report</h1>
  <div class="card">
    <h2>Target: ${report.targetUrl}</h2>
    <p>Overall SEO Health Score: <strong>${report.scores.overall}/100 (Grade ${report.scores.grade})</strong></p>
    <p>Technical SEO: ${report.scores.technical}% | Content Quality: ${report.scores.content}% | Social/OG: ${report.scores.social}%</p>
    <p>Word Count: ${report.wordCount} words | Readability: ${report.readingEaseScore} (${report.readingLevel})</p>
    <p>Audit Timestamp: ${new Date(report.timestamp).toLocaleString()}</p>
  </div>

  <h2>Prioritized Issue Remediation Checklist</h2>
  ${report.issues.map(i => `
    <div class="card" style="border-left: 4px solid ${i.severity === 'critical' ? '#EF4444' : i.severity === 'warning' ? '#F59E0B' : '#10B981'}">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; color:#fff;">${i.title}</h3>
        <span class="badge ${i.severity}">${i.severity}</span>
      </div>
      <p style="color:#9CA3AF; margin:0.5rem 0;">${i.description}</p>
      <p><strong>Impact:</strong> ${i.impact}</p>
      <p><strong>Recommendation:</strong> ${i.recommendation}</p>
      ${i.snippet ? `<pre>${i.snippet}</pre>` : ''}
    </div>
  `).join('')}

  <h2>Top Keywords & Frequency</h2>
  <div class="card">
    <table>
      <thead>
        <tr><th>Keyword</th><th>Count</th><th>Density</th><th>In Title</th><th>In H1</th></tr>
      </thead>
      <tbody>
        ${report.keywords.unigrams.slice(0, 10).map(k => `
          <tr>
            <td><strong>${k.term}</strong></td>
            <td>${k.count}</td>
            <td>${k.density}%</td>
            <td>${k.inTitle ? 'Yes' : 'No'}</td>
            <td>${k.inH1 ? 'Yes' : 'No'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlReport], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-report-${new URL(report.targetUrl.startsWith('http') ? report.targetUrl : `https://${report.targetUrl}`).hostname}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '560px',
        width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: '12px',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.25rem' }}>Export Audit Report</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.35rem' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Select your preferred export format for the current audit report for <strong style={{ color: 'var(--text-primary)' }}>{report.targetUrl}</strong>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* HTML Export */}
          <div
            onClick={handleDownloadHtml}
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={22} color="var(--accent-primary)" />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Standalone HTML Report</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Full styled executive report viewable in any browser</p>
              </div>
            </div>
            <Download size={16} color="var(--accent-primary)" />
          </div>

          {/* JSON Export */}
          <div
            onClick={handleDownloadJson}
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Code2 size={22} color="var(--accent-cyan)" />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Raw JSON Data Export</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Structured JSON with all issues, keywords, metadata, and schemas</p>
              </div>
            </div>
            <Download size={16} color="var(--accent-cyan)" />
          </div>

          {/* Print / PDF */}
          <div
            onClick={handlePrint}
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Printer size={22} color="var(--status-warning)" />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Print / Save as PDF</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Open browser print dialog formatted for print / PDF output</p>
              </div>
            </div>
            <Printer size={16} color="var(--status-warning)" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
