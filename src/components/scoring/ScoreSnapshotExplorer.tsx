/**
 * Phase 8: SEO Score & Historical Snapshot Explorer UI
 */

import React, { useState } from 'react';
import { 
  Award, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  TrendingUp,
  X
} from 'lucide-react';
import { AuditSnapshot, SnapshotComparison } from '../../scoring/types';
import { ScoringEngine, SCORING_VERSION, DEFAULT_WEIGHTS, GRADE_SCALE } from '../../scoring/scoringEngine';
import { snapshotStore } from '../../scoring/snapshotStore';
import { TechnicalEngine } from '../../technical/technicalEngine';
import { SeoDataExtractor } from '../../extractor/index';

interface ScoreSnapshotExplorerProps {
  initialHtml: string;
  initialUrl: string;
}

export const ScoreSnapshotExplorer: React.FC<ScoreSnapshotExplorerProps> = ({
  initialHtml,
  initialUrl
}) => {
  // Generate real-time snapshot of current page state
  const [currentSnapshot, setCurrentSnapshot] = useState<AuditSnapshot>(() => {
    const extracted = SeoDataExtractor.extract(initialHtml, initialUrl, 200, 195);
    const auditReport = TechnicalEngine.audit(extracted);
    return ScoringEngine.createSnapshot(auditReport);
  });

  const [snapshots, setSnapshots] = useState<AuditSnapshot[]>(() => {
    return snapshotStore.getSnapshotsForUrl(initialUrl);
  });

  // Comparison selection
  const [compareOlderId, setCompareOlderId] = useState<string>(snapshots[1]?.id || snapshots[0]?.id || '');
  const [compareNewerId, setCompareNewerId] = useState<string>(snapshots[0]?.id || '');
  const [comparison, setComparison] = useState<SnapshotComparison | null>(() => {
    if (snapshots.length >= 2) {
      return snapshotStore.compareSnapshots(snapshots[1].id, snapshots[0].id);
    }
    return null;
  });

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const gradeDetails = GRADE_SCALE[currentSnapshot.letterGrade];

  // Capture new snapshot
  const handleCaptureSnapshot = () => {
    const extracted = SeoDataExtractor.extract(initialHtml, initialUrl, 200, 195);
    const auditReport = TechnicalEngine.audit(extracted);
    const newSnapshot = ScoringEngine.createSnapshot(auditReport);
    
    snapshotStore.addSnapshot(newSnapshot);
    setCurrentSnapshot(newSnapshot);
    setSnapshots(snapshotStore.getSnapshotsForUrl(initialUrl));
    
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleRunComparison = () => {
    if (compareOlderId && compareNewerId) {
      const result = snapshotStore.compareSnapshots(compareOlderId, compareNewerId);
      setComparison(result);
      setIsCompareModalOpen(true);
    }
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header Info Panel */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wide uppercase">
                Phase 8 Architecture
              </span>
              <span className="text-xs text-slate-400 font-mono">Engine {SCORING_VERSION}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-400" />
              SEO Scoring & Snapshot Intelligence
            </h1>
            <p className="text-slate-400 text-sm">
              Weighted multi-vector scoring calibrated with letter grades and chronological snapshot comparisons.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCaptureSnapshot}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Camera className="w-4 h-4" />
              {savedFeedback ? 'Snapshot Captured!' : 'Capture New Snapshot'}
            </button>
          </div>
        </div>

        {/* Current Score & Grade Hero Card */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Large Score & Grade Display */}
          <div className="lg:col-span-4 flex items-center gap-6 p-5 bg-slate-950/80 border border-slate-800 rounded-2xl">
            {/* Grade Badge */}
            <div 
              className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black text-3xl shadow-xl flex-shrink-0"
              style={{ 
                background: gradeDetails.badgeBg, 
                color: gradeDetails.color,
                border: `2px solid ${gradeDetails.color}40`,
                boxShadow: `0 0 24px ${gradeDetails.color}25`
              }}
            >
              {gradeDetails.grade}
              <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80 mt-0.5">Grade</span>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-white font-mono">{currentSnapshot.overallScore}</span>
                <span className="text-sm text-slate-500 font-mono">/ 100</span>
              </div>
              <div className="text-sm font-bold text-white truncate">{gradeDetails.label}</div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{gradeDetails.description}</p>
            </div>
          </div>

          {/* Category Weights Breakdown */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">Indexability</span>
                <span className="font-mono text-emerald-400 font-semibold">{Math.round(DEFAULT_WEIGHTS.indexability * 100)}%</span>
              </div>
              <div className="text-lg font-bold text-white">{currentSnapshot.categoryScores.indexability}%</div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full" style={{ width: `${currentSnapshot.categoryScores.indexability}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">Content</span>
                <span className="font-mono text-cyan-400 font-semibold">{Math.round(DEFAULT_WEIGHTS.content * 100)}%</span>
              </div>
              <div className="text-lg font-bold text-white">{currentSnapshot.categoryScores.content}%</div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full" style={{ width: `${currentSnapshot.categoryScores.content}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">Media & CLS</span>
                <span className="font-mono text-blue-400 font-semibold">{Math.round(DEFAULT_WEIGHTS.performance * 100)}%</span>
              </div>
              <div className="text-lg font-bold text-white">{currentSnapshot.categoryScores.performance}%</div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full" style={{ width: `${currentSnapshot.categoryScores.performance}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">Accessibility</span>
                <span className="font-mono text-purple-400 font-semibold">{Math.round(DEFAULT_WEIGHTS.accessibility * 100)}%</span>
              </div>
              <div className="text-lg font-bold text-white">{currentSnapshot.categoryScores.accessibility}%</div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-purple-400 h-full" style={{ width: `${currentSnapshot.categoryScores.accessibility}%` }} />
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">Schema</span>
                <span className="font-mono text-amber-400 font-semibold">{Math.round(DEFAULT_WEIGHTS.structured_data * 100)}%</span>
              </div>
              <div className="text-lg font-bold text-white">{currentSnapshot.categoryScores.structured_data}%</div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full" style={{ width: `${currentSnapshot.categoryScores.structured_data}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Snapshots & Comparator Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Chronological Audit Snapshots ({snapshots.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any two historical snapshots to compare score progression and issue resolution.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunComparison}
              disabled={snapshots.length < 2}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Sliders className="w-3.5 h-3.5" /> Compare Selected
            </button>
          </div>
        </div>

        {/* Snapshots Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Older (Base)</th>
                <th className="py-3 px-4 font-semibold">Newer (Target)</th>
                <th className="py-3 px-4 font-semibold">Audit Timestamp</th>
                <th className="py-3 px-4 font-semibold">Score & Grade</th>
                <th className="py-3 px-4 font-semibold">Issue Breakdown</th>
                <th className="py-3 px-4 font-semibold">Engine Version</th>
                <th className="py-3 px-4 font-semibold text-right">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {snapshots.map((snap) => {
                const isOlder = compareOlderId === snap.id;
                const isNewer = compareNewerId === snap.id;
                const grade = GRADE_SCALE[snap.letterGrade];

                return (
                  <tr key={snap.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <input
                        type="radio"
                        name="olderSnapshot"
                        checked={isOlder}
                        onChange={() => setCompareOlderId(snap.id)}
                        className="text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                      />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <input
                        type="radio"
                        name="newerSnapshot"
                        checked={isNewer}
                        onChange={() => setCompareNewerId(snap.id)}
                        className="text-emerald-500 focus:ring-0 bg-slate-900 border-slate-700"
                      />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-sans text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {formatDate(snap.timestamp)}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2 py-0.5 rounded text-[11px] font-bold"
                          style={{ background: grade.badgeBg, color: grade.color }}
                        >
                          {snap.letterGrade}
                        </span>
                        <span className="font-bold text-white">{snap.overallScore}/100</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-sans">
                      <span className="text-emerald-400 font-semibold">{snap.totalIssues.passed} passed</span>
                      {snap.totalIssues.warning > 0 && (
                        <span className="text-amber-400 ml-2 font-semibold">{snap.totalIssues.warning} warn</span>
                      )}
                      {snap.totalIssues.critical > 0 && (
                        <span className="text-rose-400 ml-2 font-semibold">{snap.totalIssues.critical} crit</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                      {snap.scoringVersion}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-right font-sans text-slate-400">
                      {snap.notes || 'Automated audit snapshot'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Drawer / Modal */}
      {isCompareModalOpen && comparison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Snapshot Comparison Analysis</h3>
              </div>
              <button 
                onClick={() => setIsCompareModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Delta Banner */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              comparison.scoreDelta > 0 
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                : comparison.scoreDelta < 0
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <div className="space-y-0.5">
                <div className="font-bold text-sm text-white">
                  {comparison.scoreDelta > 0 ? 'SEO Optimization Improvement' : 'Score Comparison'}
                </div>
                <div className="text-xs">{comparison.summary}</div>
              </div>

              <div className="text-right flex items-center gap-2">
                {comparison.scoreDelta > 0 ? (
                  <span className="flex items-center font-mono font-bold text-xl text-emerald-400">
                    <ArrowUpRight className="w-5 h-5" /> +{comparison.scoreDelta} pts
                  </span>
                ) : comparison.scoreDelta < 0 ? (
                  <span className="flex items-center font-mono font-bold text-xl text-rose-400">
                    <ArrowDownRight className="w-5 h-5" /> {comparison.scoreDelta} pts
                  </span>
                ) : (
                  <span className="font-mono font-bold text-xl text-slate-400">0 pts</span>
                )}
              </div>
            </div>

            {/* Side-by-side Score Stats */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] uppercase text-slate-500 font-sans">Older Baseline</span>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">
                    {comparison.oldGrade}
                  </span>
                  {comparison.olderSnapshot.overallScore}/100
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  {formatDate(comparison.olderSnapshot.timestamp)}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] uppercase text-slate-500 font-sans">Newer Target</span>
                <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-300">
                    {comparison.newGrade}
                  </span>
                  {comparison.newerSnapshot.overallScore}/100
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  {formatDate(comparison.newerSnapshot.timestamp)}
                </div>
              </div>
            </div>

            {/* Resolved Issues & Regressions */}
            <div className="space-y-3 text-xs">
              {comparison.resolvedIssues.length > 0 && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1.5">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Issues Successfully Resolved ({comparison.resolvedIssues.length}):
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 pl-1">
                    {comparison.resolvedIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {comparison.newRegressions.length > 0 && (
                <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-1.5">
                  <div className="font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> New Regressions Flagged ({comparison.newRegressions.length}):
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 pl-1">
                    {comparison.newRegressions.map((reg, idx) => (
                      <li key={idx}>{reg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
