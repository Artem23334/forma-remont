#!/usr/bin/env node
/**
 * Kontrola zbudowanej strony (dist/):
 *  - każdy link #kotwica prowadzi do istniejącego id,
 *  - każde lokalne zdjęcie/asset, do którego odwołuje się HTML, istnieje,
 *  - zdjęcia są unikalne (bez powtórzeń w manifeście),
 *  - brak sekretów w plikach wysyłanych do przeglądarki,
 *  - konfiguracja noindex zgodna z trybem demo.
 * Zwraca kod 1 przy błędach. Ostrzeżenia nie przerywają.
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteConfig } from '../src/config/site.config.mjs';
import { images } from '../src/config/images.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const errors = [];
const warnings = [];
const exists = (p) => stat(p).then(() => true, () => false);

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    out.push(...(e.isDirectory() ? await walk(p) : [p]));
  }
  return out;
}

if (!(await exists(path.join(dist, 'index.html')))) {
  console.error('✗ Brak dist/index.html — uruchom najpierw npm run build');
  process.exit(1);
}
const html = await readFile(path.join(dist, 'index.html'), 'utf8');

// 1. Kotwice
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const anchors = [...new Set([...html.matchAll(/href="#([^"]*)"/g)].map((m) => m[1]))];
for (const a of anchors) if (!ids.has(a)) errors.push(`Kotwica #${a} nie ma odpowiadającego elementu`);
const ariaRefs = [...html.matchAll(/aria-(?:controls|labelledby|describedby)="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
for (const r of new Set(ariaRefs)) if (!ids.has(r)) errors.push(`Atrybut ARIA wskazuje nieistniejące id „${r}”`);

// 2. Zasoby lokalne
const refs = new Set();
for (const m of html.matchAll(/(?:src|href)="(\/[^"?#]*)/g)) refs.add(m[1]);
for (const m of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g))
  for (const part of m[1].split(',')) {
    const u = part.trim().split(/\s+/)[0];
    if (u.startsWith('/')) refs.add(u.split('?')[0]);
  }
for (const r of refs) {
  if (r === '/') continue;
  if (!(await exists(path.join(dist, r)))) errors.push(`Brak pliku: ${r}`);
}
const localImgs = [...refs].filter((r) => r.startsWith('/assets/images/'));
const remoteImgs = new Set([...html.matchAll(/https:\/\/images\.unsplash\.com\/photo-([\w-]+)/g)].map((m) => m[1]));

// 3. Unikalność zdjęć
const idList = Object.values(images).map((i) => i.id);
const dupes = idList.filter((id, i) => idList.indexOf(id) !== i);
if (dupes.length) errors.push(`Powtórzone zdjęcia w manifeście: ${dupes.join(', ')}`);
for (const key of Object.keys(images)) {
  if (!html.includes(`data-image-key="${key}"`) && !html.includes(images[key].id) && !html.includes(`/assets/images/${key}-`))
    warnings.push(`Zdjęcie „${key}” jest w manifeście, ale nie jest użyte na stronie`);
}

// 4. Sekrety
const SECRET_PATTERNS = [/TELEGRAM_BOT_TOKEN\s*[:=]\s*['"]?\d/, /\bbot\d{6,}:[A-Za-z0-9_-]{20,}/, /re_[A-Za-z0-9]{20,}/, /RESEND_API_KEY\s*[:=]\s*['"]?\w/, /sk-[A-Za-z0-9]{20,}/];
for (const f of await walk(dist)) {
  if (!/\.(html|js|mjs|css|json|txt|xml)$/.test(f)) continue;
  const text = await readFile(f, 'utf8');
  for (const re of SECRET_PATTERNS) if (re.test(text)) errors.push(`Możliwy sekret w ${path.relative(root, f)} (${re})`);
  if (/process\.env/.test(text)) errors.push(`Odwołanie do process.env w pliku klienckim ${path.relative(root, f)}`);
}

// 5. Indeksowanie
const robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
if (siteConfig.demoMode) {
  if (!html.includes('name="robots" content="noindex')) errors.push('Tryb demo: brak meta robots noindex');
  if (!/Disallow: \/\s*$/m.test(robots)) errors.push('Tryb demo: robots.txt nie blokuje indeksowania');
}

// 6. Podstawowe metadane
for (const [label, re] of [['<title>', /<title>[^<]+<\/title>/], ['meta description', /name="description"/], ['og:image', /property="og:image"/], ['lang="pl"', /<html lang="pl">/]])
  if (!re.test(html)) errors.push(`Brak: ${label}`);

// Raport
console.log('Kontrola dist/');
console.log(`  Kotwice: ${anchors.length} sprawdzonych`);
console.log(`  Zdjęcia lokalne w HTML: ${localImgs.length} plików · zdalne (CDN Unsplash): ${remoteImgs.size} zdjęć`);
if (remoteImgs.size) warnings.push(`${remoteImgs.size} zdjęć nie jest jeszcze pobranych lokalnie — uruchom npm run images`);
warnings.forEach((w) => console.warn(`  ⚠ ${w}`));
errors.forEach((e) => console.error(`  ✗ ${e}`));
if (errors.length) process.exit(1);
console.log('  ✓ Brak błędów');
