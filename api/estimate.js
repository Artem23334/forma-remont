/**
 * POST /api/estimate — przyjmuje zapytanie o wycenę.
 * Funkcja serverless Vercel (Node.js). Sekrety czyta wyłącznie z process.env.
 *
 * Odpowiedzi:
 *   200 { ok: true }                         — zgłoszenie DOSTARCZONE do skonfigurowanego kanału
 *   400 { ok:false, code:'bad_request' }     — niepoprawny JSON / typ treści
 *   405 { ok:false, code:'method_not_allowed' }
 *   413 { ok:false, code:'payload_too_large' }
 *   422 { ok:false, code:'validation_error', errors }
 *   429 { ok:false, code:'rate_limited' }
 *   502 { ok:false, code:'delivery_failed' } — kanał skonfigurowany, ale wysyłka się nie powiodła
 *   503 { ok:false, code:'delivery_not_configured' }
 */
import { validateEstimate } from '../lib/validation.mjs';
import { deliverEstimate } from '../lib/delivery.mjs';

const MAX_BODY_BYTES = 16 * 1024;
const MIN_FILL_MS = 2500; // szybciej niż 2,5 s wypełniają formularz tylko boty
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

// Prosty limiter w pamięci instancji. Na Vercel instancje są efemeryczne —
// to ochrona podstawowa; na produkcji rozważ Vercel KV / Upstash.
const hits = new Map();

function rateLimited(ip, now = Date.now()) {
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > RATE_MAX;
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    // Vercel parsuje JSON automatycznie
    if (typeof req.body === 'string') return JSON.parse(req.body);
    if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString('utf8'));
    return req.body;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const e = new Error('too large');
      e.code = 'payload_too_large';
      throw e;
    }
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    return send(res, 405, { ok: false, code: 'method_not_allowed' });
  }

  const type = String(req.headers['content-type'] || '');
  if (!type.includes('application/json')) {
    return send(res, 400, { ok: false, code: 'bad_request', message: 'Oczekiwano danych JSON.' });
  }
  const declared = Number(req.headers['content-length'] || 0);
  if (declared > MAX_BODY_BYTES) return send(res, 413, { ok: false, code: 'payload_too_large' });

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    if (err.code === 'payload_too_large') return send(res, 413, { ok: false, code: 'payload_too_large' });
    return send(res, 400, { ok: false, code: 'bad_request', message: 'Niepoprawny format danych.' });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return send(res, 400, { ok: false, code: 'bad_request', message: 'Niepoprawny format danych.' });
  }

  // Ochrona antyspamowa: ukryte pole + minimalny czas wypełniania
  const startedAt = Number(body.startedAt);
  if (body.website || (Number.isFinite(startedAt) && Date.now() - startedAt < MIN_FILL_MS)) {
    return send(res, 422, { ok: false, code: 'spam_suspected', message: 'Nie udało się zweryfikować zgłoszenia. Spróbuj ponownie.' });
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) {
    return send(res, 429, { ok: false, code: 'rate_limited', message: 'Zbyt wiele zgłoszeń. Spróbuj ponownie za kilka minut.' });
  }

  const { ok, data, errors } = validateEstimate(body);
  if (!ok) return send(res, 422, { ok: false, code: 'validation_error', errors });

  try {
    const result = await deliverEstimate(data, { receivedAt: new Date().toISOString() });
    if (result.failed.length) console.warn('[estimate] partial delivery failure:', result.failed.join('; '));
    return send(res, 200, { ok: true });
  } catch (err) {
    if (err.code === 'delivery_not_configured') {
      console.error('[estimate] delivery not configured:', err.detail?.join('; '));
      return send(res, 503, {
        ok: false,
        code: 'delivery_not_configured',
        message: 'Formularz nie jest jeszcze podłączony do skrzynki odbiorczej. Zgłoszenie NIE zostało wysłane.',
      });
    }
    console.error('[estimate] delivery failed:', err.message);
    return send(res, 502, {
      ok: false,
      code: 'delivery_failed',
      message: 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę.',
    });
  }
}

export const _internal = { hits };
