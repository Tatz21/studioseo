import { SerpAnalysisResponse, SerpQuery } from './types';
import { SerpStore } from './serpStore';

export class SerpApi {
  /**
   * Fetches SERP analysis from the server API endpoint `/api/serp`
   * with automatic fallback to seed simulation if running offline or in preview
   */
  static async fetchSerpAnalysis(query: SerpQuery): Promise<SerpAnalysisResponse> {
    try {
      const response = await fetch('/api/serp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keyword: query.keyword,
          engine: query.engine,
          country: query.country,
          device: query.device,
          language: query.language
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.ok && json.data) {
          SerpStore.saveRecentQuery(query.keyword);
          return json.data as SerpAnalysisResponse;
        }
      }
    } catch (err) {
      console.warn('SerpApi: Server API fetch failed, using fallback engine data:', err);
    }

    // High fidelity fallback
    SerpStore.saveRecentQuery(query.keyword);
    return SerpStore.getSeedSerpData(query);
  }
}
