/**
 * Phase 7: Technical SEO Issues & Evidence Inspector UI
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  Wrench, 
  Sparkles,
  Info
} from 'lucide-react';
import { TechnicalAuditReport, TechnicalCategory } from '../../technical/types';
import { TechnicalEngine } from '../../technical/technicalEngine';
import { SeoDataExtractor } from '../../extractor/index';

interface TechnicalAuditInspectorProps {
  initialHtml: string;
  initialUrl: string;
}

export const TechnicalAuditInspector: React.FC<TechnicalAuditInspectorProps> = ({
  initialHtml,
  initialUrl
}) => {
  const [report] = useState<TechnicalAuditReport>(() => {
    const extracted = SeoDataExtractor.extract(initialHtml, initialUrl, 200, 195);
    return TechnicalEngine.audit(extracted);
  });

  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'passed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TechnicalCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIssueIds, setExpandedIssueIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIssueIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredIssues = report.issues.filter(issue => {
    if (severityFilter !== 'all' && issue.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchCode = issue.ruleCode.toLowerCase().includes(q);
      const matchDesc = issue.description.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchDesc) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header Overview Banner */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wide uppercase">
                Phase 7 Architecture
              </span>
              <span className="text-xs text-slate-400">Deterministic SEO Rules & Evidence</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              Technical SEO Audit Engine
            </h1>
            <p className="text-slate-400 text-sm">
              Standardized rule-driven audit verifying indexability, protocol security, metadata, headings hierarchy, and Core Web Vitals with deterministic proof.
            </p>
          </div>

          {/* Overall Health Score Meter */}
          <div className="flex items-center gap-5 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
            <div className="text-center">
              <div className="text-3xl font-black text-white font-mono flex items-baseline justify-center">
                <span className={report.overallScore >= 90 ? 'text-emerald-400' : report.overallScore >= 70 ? 'text-amber-400' : 'text-rose-400'}>
                  {report.overallScore}
                </span>
                <span className="text-xs text-slate-500 ml-0.5">/100</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                Technical Score
              </div>
            </div>

            <div className="h-10 w-px bg-slate-800" />

            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-base font-bold text-emerald-400">{report.passedCount}</div>
                <div className="text-[10px] text-slate-400">Passed</div>
              </div>
              <div>
                <div className="text-base font-bold text-amber-400">{report.warningCount}</div>
                <div className="text-[10px] text-slate-400">Warnings</div>
              </div>
              <div>
                <div className="text-base font-bold text-rose-400">{report.criticalCount}</div>
                <div className="text-[10px] text-slate-400">Critical</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categorical Health Progress Grid */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {Object.values(report.categoryHealth).map((cat) => (
            <div key={cat.category} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1.5">
              <div className="text-[11px] text-slate-400 truncate font-medium">{cat.label}</div>
              <div className="text-base font-bold text-white flex items-baseline justify-between">
                <span>{cat.score}%</span>
                <span className="text-[10px] font-mono text-slate-500">{cat.passedCount}/{cat.totalChecks}</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${cat.score >= 90 ? 'bg-emerald-400' : cat.score >= 70 ? 'bg-amber-400' : 'bg-rose-400'}`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issues Explorer & Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Severity filter chips */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs flex-wrap">
            <button
              onClick={() => setSeverityFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${severityFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              All ({report.totalRulesEvaluated})
            </button>
            <button
              onClick={() => setSeverityFilter('critical')}
              className={`px-3 py-1.5 rounded-lg transition-all ${severityFilter === 'critical' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              Critical ({report.criticalCount})
            </button>
            <button
              onClick={() => setSeverityFilter('warning')}
              className={`px-3 py-1.5 rounded-lg transition-all ${severityFilter === 'warning' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              Warnings ({report.warningCount})
            </button>
            <button
              onClick={() => setSeverityFilter('passed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${severityFilter === 'passed' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              Passed ({report.passedCount})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Category selector */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">All Categories</option>
              <option value="indexability">Indexability</option>
              <option value="metadata">Metadata</option>
              <option value="content">Content & Headings</option>
              <option value="accessibility">Accessibility & Alt</option>
              <option value="performance">Media & Web Vitals</option>
              <option value="structured_data">Structured Data</option>
              <option value="social">Social</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search rule code or issue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 w-52"
              />
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400/40 mx-auto" />
              <div className="text-sm">No technical issues match the active filter criteria.</div>
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const isExpanded = expandedIssueIds.has(issue.id);
              const isCritical = issue.severity === 'critical';
              const isWarning = issue.severity === 'warning';

              return (
                <div
                  key={issue.id}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isCritical
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : isWarning
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Issue Main Header */}
                  <div 
                    onClick={() => toggleExpand(issue.id)}
                    className="p-4 cursor-pointer flex items-center justify-between gap-4 select-none"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="mt-0.5 flex-shrink-0">
                        {isCritical ? (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white truncate">{issue.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            {issue.ruleCode}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                            {issue.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{issue.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {issue.scoreDeduction > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-bold">
                          -{issue.scoreDeduction} pts
                        </span>
                      )}
                      <button className="text-slate-400 hover:text-white p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Evidence Drawer */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-800/60 mt-1 space-y-4 text-xs animate-fade-in">
                      {/* Evidence Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                          <div className="text-[10px] uppercase text-slate-500 font-mono flex items-center gap-1.5">
                            <Info className="w-3 h-3 text-cyan-400" /> Measured Evidence
                          </div>
                          <div className="font-mono text-white text-xs break-all">
                            {String(issue.evidence.measuredValue)}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Expected: <span className="text-emerald-400 font-mono">{issue.evidence.expectedThreshold}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                          <div className="text-[10px] uppercase text-slate-500 font-mono flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-amber-400" /> Search Engine Impact
                          </div>
                          <div className="text-slate-300 text-xs leading-relaxed">
                            {issue.searchEngineImpact}
                          </div>
                        </div>
                      </div>

                      {/* Offending Snippets if present */}
                      {issue.offendingSnippets && issue.offendingSnippets.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] uppercase text-slate-500 font-mono">Offending Elements / Issues Found:</div>
                          <div className="space-y-1 font-mono text-[11px]">
                            {issue.offendingSnippets.map((snippet, idx) => (
                              <div key={idx} className="p-2 bg-slate-950 border border-slate-800 rounded text-rose-300 break-all">
                                {snippet}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendation & Code Fix */}
                      <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                        <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5" /> Actionable Remediation Plan
                        </div>
                        <p className="text-slate-300 leading-relaxed text-xs">
                          {issue.recommendation}
                        </p>

                        {issue.codeFixTemplate && (
                          <div className="space-y-1 pt-1">
                            <div className="text-[10px] uppercase text-slate-500 font-mono flex items-center gap-1">
                              <Code2 className="w-3 h-3 text-cyan-400" /> Recommended Code Fix:
                            </div>
                            <pre className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-emerald-300 font-mono text-[11px] overflow-x-auto">
                              {issue.codeFixTemplate}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
