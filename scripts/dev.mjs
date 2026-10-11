#!/usr/bin/env node
/**
 * Lokalny serwer bez zależności: serwuje dist/ i obsługuje POST /api/estimate
 * tym samym handlerem, który działa na Vercel. Czyta .env.local (jeśli istnieje).
 *   node scripts/dev.mjs [--port 3000] [--no-build]
 */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const args = process.argv.slice(2);
const port = Number(args[args.indexOf('--port') + 1]) || Number(process.env.PORT) || 3000;

// .env.local → process.env (bez nadpisywania istniejących zmiennych)
const envFile = path.join(root, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

if (!args.includes('--no-build')) {
  const r = spawnSync(process.execPath, [path.join(root, 'scripts/build.mjs')], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status);
}

const { default: estimate } = await import('../api/estimate.js');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/estimate') return estimate(req, res);

  let file = path.normalize(path.join(dist, decodeURIComponent(url.pathname)));
  if (!file.startsWith(dist)) { res.writeHead(403); return res.end(); }
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'x-robots-tag': 'noindex, nofollow' });
    res.end(body);
  } catch {
    const body = await readFile(path.join(dist, '404.html')).catch(() => 'Not found');
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(body);
  }
});

server.listen(port, () => {
  console.log(`\n  Forma Remont → http://localhost:${port}`);
  console.log(`  Dostarczanie formularza: ${process.env.FORM_DELIVERY ? process.env.FORM_DELIVERY : 'NIESKONFIGUROWANE (formularz zwróci błąd 503)'}\n`);
});
