import { PageSpeedAuditReport, StrategyComparison } from './types';

const STORAGE_KEY = 'seo_pagespeed_history_v1';

export class PageSpeedStore {
  /**
   * Retrieves all historical PageSpeed reports
   */
  public static getReports(): PageSpeedAuditReport[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    const seed = this.generateSeedHistory();
    this.saveReports(seed);
    return seed;
  }

  /**
   * Saves a new report and returns updated list
   */
  public static saveReport(report: PageSpeedAuditReport): PageSpeedAuditReport[] {
    const current = this.getReports();
    // Keep most recent 25 runs
    const updated = [report, ...current.filter(r => r.id !== report.id)].slice(0, 25);
    this.saveReports(updated);
    return updated;
  }

  /**
   * Compares latest mobile and desktop audit runs for a specific URL
   */
  public static getStrategyComparison(url: string): StrategyComparison {
    const reports = this.getReports();
    const normalizedUrl = url.toLowerCase().replace(/\/$/, '');

    const urlReports = reports.filter(r => r.url.toLowerCase().replace(/\/$/, '') === normalizedUrl);
    const mobile = urlReports.find(r => r.strategy === 'mobile');
    const desktop = urlReports.find(r => r.strategy === 'desktop');

    const scoreDelta = {
      performance: (desktop?.scores.performance || 0) - (mobile?.scores.performance || 0),
      accessibility: (desktop?.scores.accessibility || 0) - (mobile?.scores.accessibility || 0),
      bestPractices: (desktop?.scores.bestPractices || 0) - (mobile?.scores.bestPractices || 0),
      seo: (desktop?.scores.seo || 0) - (mobile?.scores.seo || 0),
    };

    return {
      url,
      mobile,
      desktop,
      scoreDelta,
    };
  }

  private static saveReports(reports: PageSpeedAuditReport[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch {
      // ignore
    }
  }

  private static generateSeedHistory(): PageSpeedAuditReport[] {
    return [
      {
        id: 'ps-seed-desktop-1',
        url: 'https://techflow.io',
        strategy: 'desktop',
        fetchTime: new Date(Date.now() - 3600000).toISOString(),
        lighthouseVersion: '13.4.1',
        scores: {
          performance: 96,
          accessibility: 98,
          bestPractices: 100,
          seo: 100,
        },
        labMetrics: {
          fcp: { name: 'First Contentful Paint', acronym: 'FCP', displayValue: '0.62s', numericValue: 620, score: 0.99, status: 'good' },
          lcp: { name: 'Largest Contentful Paint', acronym: 'LCP', displayValue: '1.14s', numericValue: 1140, score: 0.97, status: 'good' },
          tbt: { name: 'Total Blocking Time', acronym: 'TBT', displayValue: '35ms', numericValue: 35, score: 0.99, status: 'good' },
          cls: { name: 'Cumulative Layout Shift', acronym: 'CLS', displayValue: '0.012', numericValue: 0.012, score: 0.98, status: 'good' },
          speedIndex: { name: 'Speed Index', acronym: 'SI', displayValue: '1.02s', numericValue: 1020, score: 0.96, status: 'good' },
        },
        opportunities: [
          {
            id: 'unused-javascript',
            title: 'Reduce unused JavaScript',
            description: 'Reduce unused JavaScript and defer loading scripts until they are required.',
            displayValue: 'Potential savings of 45 KiB',
            savingsBytes: 46080,
          }
        ],
        diagnostics: [
          {
            id: 'dom-size',
            title: 'Avoid an excessive DOM size',
            description: 'Total DOM elements count.',
            displayValue: '340 elements',
          }
        ],
      },
      {
        id: 'ps-seed-mobile-1',
        url: 'https://techflow.io',
        strategy: 'mobile',
        fetchTime: new Date(Date.now() - 7200000).toISOString(),
        lighthouseVersion: '13.4.1',
        scores: {
          performance: 84,
          accessibility: 96,
          bestPractices: 96,
          seo: 100,
        },
        labMetrics: {
          fcp: { name: 'First Contentful Paint', acronym: 'FCP', displayValue: '1.45s', numericValue: 1450, score: 0.88, status: 'good' },
          lcp: { name: 'Largest Contentful Paint', acronym: 'LCP', displayValue: '2.15s', numericValue: 2150, score: 0.86, status: 'good' },
          tbt: { name: 'Total Blocking Time', acronym: 'TBT', displayValue: '180ms', numericValue: 180, score: 0.82, status: 'good' },
          cls: { name: 'Cumulative Layout Shift', acronym: 'CLS', displayValue: '0.040', numericValue: 0.040, score: 0.95, status: 'good' },
          speedIndex: { name: 'Speed Index', acronym: 'SI', displayValue: '2.05s', numericValue: 2050, score: 0.82, status: 'good' },
        },
        opportunities: [
          {
            id: 'render-blocking-resources',
            title: 'Eliminate render-blocking resources',
            description: 'Resources are blocking the first paint of your page.',
            displayValue: 'Potential savings of 380 ms',
            savingsMs: 380,
          },
          {
            id: 'modern-image-formats',
            title: 'Serve images in next-gen formats',
            description: 'Image formats like WebP and AVIF provide better compression.',
            displayValue: 'Potential savings of 110 KiB',
            savingsBytes: 112640,
          }
        ],
        diagnostics: [
          {
            id: 'mainthread-work-breakdown',
            title: 'Minimize main-thread work',
            description: 'Reduces CPU time spent executing scripts.',
            displayValue: '1.9 s',
          }
        ],
      }
    ];
  }
}
