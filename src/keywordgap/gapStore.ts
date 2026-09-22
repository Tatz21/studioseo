import { KeywordGapItem, GapSummaryMetrics, VennSegmentDistribution, KeywordGapResponse } from './types';
import { KeywordStore } from '../keywords/keywordStore';
import { CompetitorStore } from '../competitors/competitorStore';

export class KeywordGapStore {
  /**
   * Retrieves list of competitor domains available for comparison
   */
  public static getAvailableCompetitors(): { domain: string; name: string; dr: number }[] {
    const comps = CompetitorStore.getCompetitors();
    if (comps && comps.length > 0) {
      return comps.map(c => ({
        domain: c.domain,
        name: c.name,
        dr: c.domainRating
      }));
    }
    return [
      { domain: 'allposters.com', name: 'AllPosters', dr: 78 },
      { domain: 'posterstore.com', name: 'Poster Store', dr: 68 },
      { domain: 'desenio.com', name: 'Desenio', dr: 74 },
      { domain: 'etsy.com', name: 'Etsy Marketplace', dr: 92 },
      { domain: 'society6.com', name: 'Society6', dr: 76 },
      { domain: 'art.com', name: 'Art.com', dr: 72 }
    ];
  }

  /**
   * Checks if a keyword is already tracked in Phase 14 Keyword Tracker
   */
  public static isKeywordTracked(keyword: string): boolean {
    const tracked = KeywordStore.getKeywords();
    return tracked.some(k => k.keyword.toLowerCase().trim() === keyword.toLowerCase().trim());
  }

  /**
   * Directly adds a gap keyword to the Phase 14 Keyword Tracker
   */
  public static trackGapKeyword(item: KeywordGapItem, targetDomain: string = 'posterscraft.com'): boolean {
    if (this.isKeywordTracked(item.keyword)) {
      return false;
    }

    const cleanDomain = targetDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');

    KeywordStore.addKeyword({
      keyword: item.keyword,
      searchVolume: item.searchVolume,
      cpc: item.cpc,
      difficulty: item.difficulty,
      currentRank: item.targetRank || 25,
      intent: item.intent,
      tags: ['Keyword Gap', item.gapStatus.toUpperCase()],
      targetUrl: `https://${cleanDomain}/collections/${encodeURIComponent(item.keyword.toLowerCase().replace(/\s+/g, '-'))}`,
      device: 'desktop'
    });

    return true;
  }

  /**
   * Generates Venn diagram set distributions based on gap items
   */
  public static computeVennDistribution(
    items: KeywordGapItem[],
    metrics: GapSummaryMetrics,
    targetDomain: string,
    competitors: string[]
  ): VennSegmentDistribution[] {
    const total = items.length || 1;

    return [
      {
        id: 'missing',
        label: 'Missing (Competitors Only)',
        count: metrics.missingCount,
        percentage: Math.round((metrics.missingCount / total) * 100),
        color: '#EF4444',
        gapStatus: 'missing',
        description: `Keywords where ${competitors.slice(0, 2).join(', ')} rank in top 20, but ${targetDomain} does not rank.`
      },
      {
        id: 'weak',
        label: 'Weak Positions',
        count: metrics.weakCount,
        percentage: Math.round((metrics.weakCount / total) * 100),
        color: '#F59E0B',
        gapStatus: 'weak',
        description: `Keywords where ${targetDomain} ranks lower than selected competitors (opportunity to expand content).`
      },
      {
        id: 'shared',
        label: 'Shared / Overlapping',
        count: metrics.sharedCount,
        percentage: Math.round((metrics.sharedCount / total) * 100),
        color: '#06B6D4',
        gapStatus: 'shared',
        description: `Keywords where both ${targetDomain} and competitors rank simultaneously in top 20.`
      },
      {
        id: 'strong',
        label: 'Strong / Dominating',
        count: metrics.strongCount,
        percentage: Math.round((metrics.strongCount / total) * 100),
        color: '#10B981',
        gapStatus: 'strong',
        description: `Keywords where ${targetDomain} outranks all selected competitors.`
      }
    ];
  }

  /**
   * Exports keyword gap rows to CSV
   */
  public static exportToCsv(
    items: KeywordGapItem[],
    targetDomain: string,
    competitors: string[]
  ): void {
    const headers = [
      'Keyword',
      'Search Volume',
      'Difficulty (KD %)',
      'CPC (USD)',
      'Search Intent',
      `Rank: ${targetDomain}`,
      ...competitors.map(c => `Rank: ${c}`),
      'Gap Status',
      'Opportunity Score (0-100)',
      'Recommended Action'
    ];

    const rows = items.map(item => [
      `"${item.keyword}"`,
      item.searchVolume,
      item.difficulty,
      `$${item.cpc.toFixed(2)}`,
      item.intent,
      item.targetRank !== null ? item.targetRank : '—',
      ...competitors.map(c => item.competitorRanks[c] !== null && item.competitorRanks[c] !== undefined ? item.competitorRanks[c] : '—'),
      item.gapStatus.toUpperCase(),
      item.opportunityScore,
      `"${item.recommendedAction.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `keyword_gap_${targetDomain}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Exports keyword gap items to JSON
   */
  public static exportToJson(
    response: KeywordGapResponse,
    targetDomain: string
  ): void {
    const jsonContent = JSON.stringify(response, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `keyword_gap_${targetDomain}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
