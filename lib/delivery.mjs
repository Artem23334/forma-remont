/**
 * Dostarczanie zgłoszeń z formularza. Działa WYŁĄCZNIE po stronie serwera.
 *
 * Kanał wybierasz zmienną FORM_DELIVERY (można podać kilka, oddzielając przecinkiem):
 *   telegram — TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 *   webhook  — FORM_WEBHOOK_URL, opcjonalnie FORM_WEBHOOK_SECRET (nagłówek X-Webhook-Secret)
 *   email    — przez API Resend: RESEND_API_KEY, FORM_EMAIL_TO, FORM_EMAIL_FROM
 *
 * Zgłoszenie uznajemy za dostarczone tylko wtedy, gdy co najmniej jeden kanał
 * odpowiedział statusem 2xx. Brak konfiguracji = brak sukcesu.
 */
import { WORK_TYPES, START_OPTIONS, labelFor } from './validation.mjs';

const TIMEOUT_MS = 10_000;

export class DeliveryNotConfiguredError extends Error {
  constructor(detail) {
    super('Form delivery is not configured');
    this.code = 'delivery_not_configured';
    this.detail = detail;
  }
}

function formatMessage(d, meta = {}) {
  const lines = [
    'Nowe zapytanie o wycenę — Forma Remont',
    '',
    `Imię i nazwisko: ${d.name}`,
    `Telefon: ${d.phone}`,
    `E-mail: ${d.email || '—'}`,
    `Rodzaj prac: ${labelFor(WORK_TYPES, d.workType)}`,
    `Metraż: ${d.area ? `${d.area} m²` : '—'}`,
    `Planowany start: ${d.startDate ? labelFor(START_OPTIONS, d.startDate) : '—'}`,
    '',
    'Opis projektu:',
    d.description,
    '',
    `Zgoda na kontakt: tak`,
    `Wysłano: ${meta.receivedAt || new Date().toISOString()}`,
  ];
  return lines.join('\n');
}

async function postJson(url, body, headers = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${text.slice(0, 200)}`);
    }
    return res;
  } finally {
    clearTimeout(timer);
  }
}

const channels = {
  telegram: {
    required: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
    async send(env, data, meta) {
      await postJson(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: env.TELEGRAM_CHAT_ID,
        text: formatMessage(data, meta),
        disable_web_page_preview: true,
      });
    },
  },
  webhook: {
    required: ['FORM_WEBHOOK_URL'],
    async send(env, data, meta) {
      const headers = env.FORM_WEBHOOK_SECRET ? { 'x-webhook-secret': env.FORM_WEBHOOK_SECRET } : {};
      await postJson(env.FORM_WEBHOOK_URL, { type: 'estimate_request', data, meta }, headers);
    },
  },
  email: {
    required: ['RESEND_API_KEY', 'FORM_EMAIL_TO', 'FORM_EMAIL_FROM'],
    async send(env, data, meta) {
      await postJson(
        'https://api.resend.com/emails',
        {
          from: env.FORM_EMAIL_FROM,
          to: env.FORM_EMAIL_TO.split(',').map((s) => s.trim()),
          subject: `Zapytanie o wycenę: ${labelFor(WORK_TYPES, data.workType)} — ${data.name}`,
          text: formatMessage(data, meta),
          ...(data.email ? { reply_to: data.email } : {}),
        },
        { authorization: `Bearer ${env.RESEND_API_KEY}` },
      );
    },
  },
};

/** Zwraca listę poprawnie skonfigurowanych kanałów oraz problemy konfiguracyjne. */
export function resolveChannels(env = process.env) {
  const requested = (env.FORM_DELIVERY || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const ready = [];
  const problems = [];
  for (const name of requested) {
    const ch = channels[name];
    if (!ch) {
      problems.push(`Nieznany kanał „${name}”`);
      continue;
    }
    const missing = ch.required.filter((k) => !env[k]);
    if (missing.length) problems.push(`${name}: brak ${missing.join(', ')}`);
    else ready.push(name);
  }
  if (!requested.length) problems.push('FORM_DELIVERY nie jest ustawione');
  return { ready, problems };
}

/**
 * Wysyła zgłoszenie. Rzuca DeliveryNotConfiguredError, gdy nie ma żadnego kanału,
 * lub Error, gdy wszystkie skonfigurowane kanały zawiodły.
 */
export async function deliverEstimate(data, meta = {}, env = process.env, impl = channels) {
  const { ready, problems } = resolveChannels(env);
  if (!ready.length) throw new DeliveryNotConfiguredError(problems);

  const results = await Promise.allSettled(ready.map((name) => impl[name].send(env, data, meta)));
  const delivered = ready.filter((_, i) => results[i].status === 'fulfilled');
  const failed = ready
    .map((name, i) => (results[i].status === 'rejected' ? `${name}: ${results[i].reason?.message}` : null))
    .filter(Boolean);

  if (!delivered.length) {
    const err = new Error(`All delivery channels failed: ${failed.join('; ')}`);
    err.code = 'delivery_failed';
    throw err;
  }
  return { delivered, failed };
}

export const _internal = { formatMessage, channels };
