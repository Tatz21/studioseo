import { KeywordGapResponse } from './types';

export async function fetchKeywordGapData(
  targetDomain: string,
  competitorDomains: string[]
): Promise<KeywordGapResponse> {
  try {
    const response = await fetch('/api/keyword-gap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        targetDomain,
        competitorDomains
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }

    const data: KeywordGapResponse = await response.json();
    return data;
  } catch (err: any) {
    console.warn('Network fetch to /api/keyword-gap failed, falling back to local dataset:', err);
    throw err;
  }
}
