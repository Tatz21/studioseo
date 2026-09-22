import type { IncomingMessage, ServerResponse } from 'http';
import { isSafeToFetch, sanitizeUrl } from './ssrfGuard';
import { handleSerpRequest } from './serpApi';
import { handleCompetitorRequest } from './competitorApi';

export interface FetchRequestBody {
  url: string;
  timeoutMs?: number;
}

export interface FetchResponseBody {
  ok: boolean;
  url: string;
  finalUrl?: string;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  html?: string;
  responseTimeMs?: number;
  contentLength?: number;
  error?: string;
}

/**
 * Reads JSON payload from an incoming Node.js HTTP request stream
 */
function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // Safety limit: 1MB max payload
      if (body.length > 1024 * 1024) {
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
 * Sends a JSON response with proper CORS and content-type headers
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
 * Server-side handler for external URL fetching.
 * Executes server-to-server HTTP request, bypassing all browser CORS restrictions.
 */
export async function handleFetchRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
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

  let body: FetchRequestBody;
  try {
    body = await readJsonBody<FetchRequestBody>(req);
  } catch (err: any) {
    sendJson(res, 400, { ok: false, error: err.message });
    return;
  }

  if (!body.url) {
    sendJson(res, 400, { ok: false, error: 'Missing required parameter "url".' });
    return;
  }

  // 1. Sanitize & SSRF Check
  const ssrfCheck = isSafeToFetch(body.url);
  if (!ssrfCheck.safe) {
    sendJson(res, 403, {
      ok: false,
      url: ssrfCheck.sanitizedUrl,
      error: `SSRF Security Block: ${ssrfCheck.reason}`
    });
    return;
  }

  const targetUrl = ssrfCheck.sanitizedUrl;
  const timeoutMs = body.timeoutMs || 12000;

  // 2. Perform Server-to-Server Fetch
  const startTime = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const upstream = await fetch(targetUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html; SEOStudioPro/2.4)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    clearTimeout(timer);
    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;

    const html = await upstream.text();

    // Extract headers
    const headersRecord: Record<string, string> = {};
    upstream.headers.forEach((val, key) => {
      headersRecord[key.toLowerCase()] = val;
    });

    sendJson(res, 200, {
      ok: true,
      url: targetUrl,
      finalUrl: upstream.url,
      status: upstream.status,
      statusText: upstream.statusText,
      headers: headersRecord,
      html,
      responseTimeMs,
      contentLength: html.length
    });
  } catch (err: any) {
    clearTimeout(timer);
    const responseTimeMs = Date.now() - startTime;

    const isAbort = err.name === 'AbortError';
    sendJson(res, 200, {
      ok: false,
      url: targetUrl,
      responseTimeMs,
      error: isAbort
        ? `Request timed out after ${timeoutMs}ms while contacting ${targetUrl}`
        : `Upstream fetch failed: ${err.message}`
    });
  }
}

/**
 * Server-side audit endpoint: fetches the target website server-side
 * and returns initial page payload.
 */
export async function handleAuditRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  return handleFetchRequest(req, res);
}

/**
 * Vite Plugin that registers server-side crawler API routes
 */
export function crawlerApiPlugin() {
  return {
    name: 'crawler-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url ? req.url.split('?')[0] : '';

        if (url === '/api/fetch') {
          await handleFetchRequest(req, res);
          return;
        }

        if (url === '/api/audit') {
          await handleAuditRequest(req, res);
          return;
        }

        if (url === '/api/serp') {
          await handleSerpRequest(req, res);
          return;
        }

        if (url === '/api/competitors') {
          await handleCompetitorRequest(req, res);
          return;
        }

        next();
      });
    },
    configurePreviewServer(server: any) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url ? req.url.split('?')[0] : '';

        if (url === '/api/fetch') {
          await handleFetchRequest(req, res);
          return;
        }

        if (url === '/api/audit') {
          await handleAuditRequest(req, res);
          return;
        }

        if (url === '/api/serp') {
          await handleSerpRequest(req, res);
          return;
        }

        if (url === '/api/competitors') {
          await handleCompetitorRequest(req, res);
          return;
        }

        next();
      });
    }
  };
}
