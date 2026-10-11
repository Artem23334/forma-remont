import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import handler, { _internal } from '../api/estimate.js';
import { deliverEstimate, resolveChannels } from '../lib/delivery.mjs';

const ENV_KEYS = ['FORM_DELIVERY', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'FORM_WEBHOOK_URL', 'FORM_WEBHOOK_SECRET', 'RESEND_API_KEY', 'FORM_EMAIL_TO', 'FORM_EMAIL_FROM'];
let savedEnv;
let savedFetch;

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  ENV_KEYS.forEach((k) => delete process.env[k]);
  savedFetch = globalThis.fetch;
  _internal.hits.clear();
});
afterEach(() => {
  ENV_KEYS.forEach((k) => (savedEnv[k] === undefined ? delete process.env[k] : (process.env[k] = savedEnv[k])));
  globalThis.fetch = savedFetch;
});

const body = {
  name: 'Jan Nowak',
  phone: '600 100 200',
  workType: 'kuchnia',
  description: 'Remont kuchni z nową zabudową i oświetleniem.',
  consent: true,
  startedAt: Date.now() - 60_000,
};

function call({ method = 'POST', json = body, raw, headers = {} } = {}) {
  const payload = raw ?? (json === undefined ? '' : JSON.stringify(json));
  const req = Readable.from([Buffer.from(payload)]);
  req.method = method;
  req.headers = { 'content-type': 'application/json', 'x-forwarded-for': `10.0.0.${Math.floor(Math.random() * 250)}`, ...headers };
  req.socket = { remoteAddress: '127.0.0.1' };
  return new Promise((resolve) => {
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
      end(data) { resolve({ status: this.statusCode, headers: this.headers, body: data ? JSON.parse(data) : null }); },
    };
    handler(req, res);
  });
}

test('rejects non-POST methods', async () => {
  const r = await call({ method: 'GET' });
  assert.equal(r.status, 405);
});

test('rejects invalid JSON', async () => {
  const r = await call({ raw: '{nope' });
  assert.equal(r.status, 400);
});

test('returns field errors for invalid data (server-side validation)', async () => {
  const r = await call({ json: { ...body, phone: '', consent: false } });
  assert.equal(r.status, 422);
  assert.ok(r.body.errors.phone);
  assert.ok(r.body.errors.consent);
});

test('blocks honeypot and too-fast submissions', async () => {
  assert.equal((await call({ json: { ...body, website: 'http://spam' } })).status, 422);
  assert.equal((await call({ json: { ...body, startedAt: Date.now() } })).status, 422);
});

test('NEVER reports success when delivery is not configured', async () => {
  const r = await call();
  assert.equal(r.status, 503);
  assert.equal(r.body.ok, false);
  assert.equal(r.body.code, 'delivery_not_configured');
});

test('reports failure when the configured channel fails', async () => {
  process.env.FORM_DELIVERY = 'webhook';
  process.env.FORM_WEBHOOK_URL = 'https://hooks.example.test/x';
  globalThis.fetch = async () => new Response('boom', { status: 500 });
  const r = await call();
  assert.equal(r.status, 502);
  assert.equal(r.body.ok, false);
});

test('reports success only after the channel accepts the message (telegram)', async () => {
  process.env.FORM_DELIVERY = 'telegram';
  process.env.TELEGRAM_BOT_TOKEN = 'test-token';
  process.env.TELEGRAM_CHAT_ID = '42';
  let sent;
  globalThis.fetch = async (url, init) => {
    sent = { url, body: JSON.parse(init.body) };
    return new Response('{"ok":true}', { status: 200 });
  };
  const r = await call();
  assert.equal(r.status, 200);
  assert.equal(r.body.ok, true);
  assert.match(sent.url, /api\.telegram\.org\/bottest-token\/sendMessage/);
  assert.equal(sent.body.chat_id, '42');
  assert.match(sent.body.text, /Jan Nowak/);
  assert.match(sent.body.text, /Remont kuchni/);
});

test('webhook sends secret header; email channel formats a Resend request', async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => { calls.push({ url, init }); return new Response('{}', { status: 200 }); };
  const env = {
    FORM_DELIVERY: 'webhook,email',
    FORM_WEBHOOK_URL: 'https://hooks.example.test/x',
    FORM_WEBHOOK_SECRET: 's3cret',
    RESEND_API_KEY: 'k',
    FORM_EMAIL_TO: 'a@example.com',
    FORM_EMAIL_FROM: 'Forma <no-reply@example.com>',
  };
  const out = await deliverEstimate({ ...body, email: 'jan@example.com', area: '', startDate: '' }, {}, env);
  assert.deepEqual(out.delivered, ['webhook', 'email']);
  const hook = calls.find((c) => c.url.includes('hooks'));
  assert.equal(hook.init.headers['x-webhook-secret'], 's3cret');
  const mail = calls.find((c) => c.url.includes('resend'));
  assert.equal(JSON.parse(mail.init.body).reply_to, 'jan@example.com');
});

test('reports misconfigured channels', () => {
  const { ready, problems } = resolveChannels({ FORM_DELIVERY: 'telegram,fax' });
  assert.deepEqual(ready, []);
  assert.equal(problems.length, 2);
});

test('rate limits repeated submissions from one IP', async () => {
  const headers = { 'x-forwarded-for': '203.0.113.9' };
  let last;
  for (let i = 0; i < 6; i++) last = await call({ headers });
  assert.equal(last.status, 429);
});
