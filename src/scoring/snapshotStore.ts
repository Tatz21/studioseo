/**
 * Phase 8: Audit Snapshot Store & Diff Comparator
 */

import { AuditSnapshot, SnapshotComparison } from './types';
import { SCORING_VERSION } from './scoringEngine';

const STORAGE_KEY = 'seostudio_audit_snapshots';

export class SnapshotStore {
  private snapshots: AuditSnapshot[] = [];

  constructor() {
    this.loadSnapshots();
  }

  private loadSnapshots(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.snapshots = JSON.parse(raw);
      } else {
        this.seedInitialSnapshots();
      }
    } catch {
      this.seedInitialSnapshots();
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.snapshots));
    } catch {
      // Non-fatal
    }
  }

  /**
   * Seed realistic 30-day historical progression for demonstration
   */
  private seedInitialSnapshots(): void {
    const now = Date.now();
    const dayMs = 86400000;

    this.snapshots = [
      // 30 Days Ago: Initial un-optimized baseline (Score: 68, Grade D)
      {
        id: 'snap_seed_30d',
        websiteId: 'w1000000-0000-0000-0000-000000000001',
        url: 'https://timelinerskolkata.com/',
        domain: 'timelinerskolkata.com',
        timestamp: new Date(now - 30 * dayMs).toISOString(),
        scoringVersion: SCORING_VERSION,
        overallScore: 68,
        letterGrade: 'D',
        gradeLabel: 'Poor Optimization',
        categoryScores: {
          indexability: 85,
          content: 60,
          performance: 65,
          accessibility: 55,
          structured_data: 50
        },
        totalIssues: { passed: 12, warning: 7, critical: 2 },
        keyIssues: [
          { ruleCode: 'TECH_H1_EXISTS', title: 'Missing <h1> Heading Tag', severity: 'critical' },
          { ruleCode: 'TECH_SCHEMA_JSONLD_VALID', title: 'No Structured Data Detected', severity: 'warning' },
          { ruleCode: 'TECH_IMAGE_ALT_PRESENT', title: 'Images Missing Alt Attributes', severity: 'warning' },
          { ruleCode: 'TECH_IMAGE_CLS_DIMENSIONS', title: 'Images Missing Explicit Dimensions', severity: 'warning' }
        ],
        notes: 'Initial site audit before Phase 1 optimization sprint.'
      },
      // 14 Days Ago: Mid-term sprint fixes (Score: 82, Grade B)
      {
        id: 'snap_seed_14d',
        websiteId: 'w1000000-0000-0000-0000-000000000001',
        url: 'https://timelinerskolkata.com/',
        domain: 'timelinerskolkata.com',
        timestamp: new Date(now - 14 * dayMs).toISOString(),
        scoringVersion: SCORING_VERSION,
        overallScore: 82,
        letterGrade: 'B',
        gradeLabel: 'Good Optimization',
        categoryScores: {
          indexability: 95,
          content: 85,
          performance: 75,
          accessibility: 75,
          structured_data: 80
        },
        totalIssues: { passed: 17, warning: 4, critical: 0 },
        keyIssues: [
          { ruleCode: 'TECH_IMAGE_ALT_PRESENT', title: 'Images Missing Alt Attributes', severity: 'warning' },
          { ruleCode: 'TECH_IMAGE_CLS_DIMENSIONS', title: 'Images Missing Explicit Dimensions', severity: 'warning' }
        ],
        notes: 'Added primary H1 tag and injected LocalBusiness JSON-LD markup.'
      },
      // 2 Days Ago: High-performance audit (Score: 94, Grade A)
      {
        id: 'snap_seed_2d',
        websiteId: 'w1000000-0000-0000-0000-000000000001',
        url: 'https://timelinerskolkata.com/',
        domain: 'timelinerskolkata.com',
        timestamp: new Date(now - 2 * dayMs).toISOString(),
        scoringVersion: SCORING_VERSION,
        overallScore: 94,
        letterGrade: 'A',
        gradeLabel: 'Strong Optimization',
        categoryScores: {
          indexability: 100,
          content: 95,
          performance: 90,
          accessibility: 90,
          structured_data: 95
        },
        totalIssues: { passed: 21, warning: 1, critical: 0 },
        keyIssues: [
          { ruleCode: 'TECH_IMAGE_CLS_DIMENSIONS', title: 'Images Missing Explicit Dimensions', severity: 'warning' }
        ],
        notes: 'Alt text added to all gallery visuals. Only minor CLS dimension warnings remaining.'
      }
    ];

    this.persist();
  }

  public getAllSnapshots(): AuditSnapshot[] {
    return [...this.snapshots].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getSnapshotsForUrl(url: string): AuditSnapshot[] {
    const cleanUrl = url.toLowerCase().replace(/\/$/, '');
    return this.getAllSnapshots().filter(s => s.url.toLowerCase().replace(/\/$/, '') === cleanUrl);
  }

  public addSnapshot(snapshot: AuditSnapshot): void {
    this.snapshots.unshift(snapshot);
    this.persist();
  }

  public deleteSnapshot(id: string): void {
    this.snapshots = this.snapshots.filter(s => s.id !== id);
    this.persist();
  }

  /**
   * Compares two chronological snapshots to produce a delta report
   */
  public compareSnapshots(olderId: string, newerId: string): SnapshotComparison | null {
    const older = this.snapshots.find(s => s.id === olderId);
    const newer = this.snapshots.find(s => s.id === newerId);

    if (!older || !newer) return null;

    const scoreDelta = newer.overallScore - older.overallScore;
    const gradeChanged = newer.letterGrade !== older.letterGrade;

    const oldRuleCodes = new Set(older.keyIssues.map(i => i.ruleCode));
    const newRuleCodes = new Set(newer.keyIssues.map(i => i.ruleCode));

    // Issues resolved in newer
    const resolvedIssues: string[] = [];
    for (const issue of older.keyIssues) {
      if (!newRuleCodes.has(issue.ruleCode)) {
        resolvedIssues.push(issue.title);
      }
    }

    // Regressions introduced in newer
    const newRegressions: string[] = [];
    for (const issue of newer.keyIssues) {
      if (!oldRuleCodes.has(issue.ruleCode)) {
        newRegressions.push(issue.title);
      }
    }

    const categoryDeltas = {
      indexability: newer.categoryScores.indexability - older.categoryScores.indexability,
      content: newer.categoryScores.content - older.categoryScores.content,
      performance: newer.categoryScores.performance - older.categoryScores.performance,
      accessibility: newer.categoryScores.accessibility - older.categoryScores.accessibility,
      structured_data: newer.categoryScores.structured_data - older.categoryScores.structured_data
    };

    let summary = '';
    if (scoreDelta > 0) {
      summary = `SEO Health improved by +${scoreDelta} points (${older.letterGrade} → ${newer.letterGrade}), resolving ${resolvedIssues.length} issue(s).`;
    } else if (scoreDelta < 0) {
      summary = `SEO Health dropped by ${scoreDelta} points (${older.letterGrade} → ${newer.letterGrade}) with ${newRegressions.length} new regression(s).`;
    } else {
      summary = `SEO score remained stable at ${newer.overallScore}/100 (${newer.letterGrade}).`;
    }

    return {
      olderSnapshot: older,
      newerSnapshot: newer,
      scoreDelta,
      gradeChanged,
      oldGrade: older.letterGrade,
      newGrade: newer.letterGrade,
      categoryDeltas,
      resolvedIssues,
      newRegressions,
      summary
    };
  }
}

export const snapshotStore = new SnapshotStore();
