import type { IncomingMessage, ServerResponse } from 'http';

interface CompetitorRequestBody {
  domain: string;
  category?: string;
  limit?: number;
}

/**
 * Reads JSON payload from an incoming Node.js HTTP request stream
 */
function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 512 * 1024) {
        reject(new Error('Request payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({} as T);
        return;
      }
      try {
        resolve(JSON.parse(body) as T);
      } catch (err: any) {
        reject(new Error(`Malformed JSON body: ${err.message}`));
      }
    });
    req.on('error', (err) => reject(err));
  });
}

/**
 * Sends a JSON response with proper CORS headers
 */
function sendJson(res: ServerResponse, statusCode: number, data: any): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

/**
 * Handles POST /api/competitors requests
 */
export async function handleCompetitorRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method Not Allowed. Use POST.' });
    return;
  }

  let body: CompetitorRequestBody;
  try {
    body = await readJsonBody<CompetitorRequestBody>(req);
  } catch (err: any) {
    sendJson(res, 400, { ok: false, error: err.message });
    return;
  }

  const targetDomain = (body.domain || 'posterscraft.com').toLowerCase().trim();

  // Synthetic competitor analysis response
  const responseData = {
    targetDomain,
    timestamp: new Date().toISOString(),
    totalCompetitorsFound: 6,
    marketShareLeaders: [
      { domain: 'etsy.com', share: 45.2, traffic: 4200000, dr: 92 },
      { domain: 'society6.com', share: 18.4, traffic: 620000, dr: 82 },
      { domain: 'allposters.com', share: 14.8, traffic: 380000, dr: 78 },
      { domain: 'desenio.com', share: 9.6, traffic: 285000, dr: 71 },
      { domain: 'posterstore.com', share: 7.2, traffic: 195000, dr: 68 },
      { domain: 'posterscraft.com', share: 4.8, traffic: 18500, dr: 48, isUser: true }
    ]
  };

  sendJson(res, 200, {
    ok: true,
    data: responseData
  });
}
