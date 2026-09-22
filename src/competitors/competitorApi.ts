import { CompetitorDomain } from './types';
import { CompetitorStore } from './competitorStore';

export class CompetitorApi {
  /**
   * Fetches competitor data from /api/competitors with fallback to local store
   */
  static async fetchCompetitors(domain: string = 'posterscraft.com'): Promise<CompetitorDomain[]> {
    try {
      const response = await fetch('/api/competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ domain })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.ok) {
          // Return cached or store competitors
          return CompetitorStore.getCompetitors();
        }
      }
    } catch (err) {
      console.warn('CompetitorApi fetch failed, using fallback store:', err);
    }

    return CompetitorStore.getCompetitors();
  }
}
