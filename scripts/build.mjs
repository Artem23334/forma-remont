#!/usr/bin/env node
/**
 * Build bez zależności: generuje statyczną stronę do katalogu dist/.
 *  - zdjęcia: jeśli w public/assets/images/ są pliki lokalne (npm run images) — używa ich,
 *    w przeciwnym razie używa CDN Unsplash (i wypisuje ostrzeżenie),
 *  - robots.txt / sitemap.xml zależnie od trybu demo.
 */
import { readFile, writeFile, mkdir, rm, cp, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteConfig } from '../src/config/site.config.mjs';
import { images, LOCAL_WIDTHS, remoteUrl, localPath } from '../src/config/images.mjs';
import { renderPage } from '../src/templates/page.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const pub = path.join(root, 'public');
const strict = process.argv.includes('--require-local-images');

const exists = (p) => stat(p).then(() => true, () => false);

async function resolveImages() {
  const modes = {};
  for (const [key, meta] of Object.entries(images)) {
    const widths = LOCAL_WIDTHS.filter((w) => w <= (meta.maxWidth || 2400));
    const checks = await Promise.all(widths.map((w) => exists(path.join(pub, localPath(key, w)))));
    modes[key] = { local: checks.every(Boolean), widths };
  }
  return modes;
}

function makeImageHelpers(modes) {
  const urlFor = (key, w) => (modes[key].local ? localPath(key, w) : remoteUrl(images[key].id, w));
  const srcset = (key) => modes[key].widths.map((w) => `${urlFor(key, w)} ${w}w`).join(', ');

  const img = (key, { sizes = '100vw', eager = false, cls = '', alt } = {}) => {
    const meta = images[key];
    if (!meta) throw new Error(`Unknown image key: ${key}`);
    const mid = modes[key].widths[Math.min(1, modes[key].widths.length - 1)];
    const style = `--fp:${meta.focus || '50% 50%'}${meta.focusMobile ? `;--fpm:${meta.focusMobile}` : ''}`;
    const attrs = [
      `src="${urlFor(key, mid)}"`,
      `srcset="${srcset(key)}"`,
      `sizes="${sizes}"`,
      `alt="${(alt ?? meta.alt).replace(/"/g, '&quot;')}"`,
      `class="media-img${cls ? ` ${cls}` : ''}"`,
      `style="${style}"`,
      eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"',
      'decoding="async"',
      `data-image-key="${key}"`,
    ];
    return `<img ${attrs.join(' ')}>`;
  };
  img.preconnect = Object.values(modes).some((m) => !m.local);
  img.heroPreload = `<link rel="preload" as="image" imagesrcset="${srcset('hero')}" imagesizes="100vw" fetchpriority="high">`;

  const imgUrl = (key, w, { absolute = false } = {}) => {
    const widths = modes[key].widths;
    const width = widths.reduce((best, x) => (Math.abs(x - w) < Math.abs(best - w) ? x : best), widths[0]);
    const u = urlFor(key, width);
    return absolute && u.startsWith('/') ? `${siteConfig.siteUrl}${u}` : u;
  };
  return { img, imgUrl };
}

function robotsTxt() {
  if (siteConfig.demoMode) {
    return `# Strona demonstracyjna fikcyjnej firmy — wyłączona z indeksowania.\n# Po wdrożeniu dla prawdziwego klienta ustaw demoMode: false w src/config/site.config.mjs.\nUser-agent: *\nDisallow: /\n`;
  }
  return `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteConfig.siteUrl}/sitemap.xml\n`;
}

function sitemapXml() {
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteConfig.siteUrl}/</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`;
}

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#171614"/><text x="32" y="45" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="40" fill="#F4F0E8">F</text><rect x="18" y="52" width="28" height="1.5" fill="#C5A36A"/></svg>`;

async function main() {
  const t0 = Date.now();
  await rm(dist, { recursive: true, force: true });
  await mkdir(path.join(dist, 'assets/css'), { recursive: true });
  await mkdir(path.join(dist, 'assets/js'), { recursive: true });

  // public/ → dist/ (w tym zdjęcia lokalne, jeśli istnieją)
  if (await exists(pub)) await cp(pub, dist, { recursive: true, filter: (src) => !src.endsWith('.gitkeep') });

  const css = await readFile(path.join(root, 'src/styles/main.css'), 'utf8');
  const js = await readFile(path.join(root, 'src/scripts/main.js'), 'utf8');
  const validation = await readFile(path.join(root, 'lib/validation.mjs'), 'utf8');
  const assetVersion = createHash('sha256').update(css + js + validation).digest('hex').slice(0, 10);

  await writeFile(path.join(dist, 'assets/css/main.css'), css);
  await writeFile(path.join(dist, 'assets/js/main.js'), js.replace("'./validation.mjs'", `'./validation.mjs?v=${assetVersion}'`));
  await writeFile(path.join(dist, 'assets/js/validation.mjs'), validation);

  const modes = await resolveImages();
  const { img, imgUrl } = makeImageHelpers(modes);
  // Polska typografia: jednoliterowe spójniki/przyimki nie zostają na końcu wiersza (twarda spacja).
  const html = renderPage({ img, imgUrl, credits: images, assetVersion }).replace(/>([^<]+)</g, (m, text) =>
    `>${text.replace(/(^|[\s(„])([aiouwzAIOUWZ]) /g, '$1$2\u00a0').replace(/(^|[\s(„])([aiouwzAIOUWZ]) /g, '$1$2\u00a0')}<`,
  );
  await writeFile(path.join(dist, 'index.html'), html);

  await writeFile(path.join(dist, 'robots.txt'), robotsTxt());
  await writeFile(path.join(dist, 'sitemap.xml'), sitemapXml());
  await writeFile(path.join(dist, 'favicon.svg'), FAVICON);
  await writeFile(
    path.join(dist, '404.html'),
    `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Nie znaleziono strony — ${siteConfig.brand.name}</title><link rel="stylesheet" href="/assets/css/main.css?v=${assetVersion}"></head><body><main class="section"><div class="container"><p class="eyebrow">404</p><h1 class="section-title">Nie znaleziono strony</h1><p class="section-lead">Strona, której szukasz, nie istnieje lub została przeniesiona.</p><p style="margin-top:32px"><a class="btn btn--gold" href="/">Wróć na stronę główną</a></p></div></main></body></html>`,
  );

  const local = Object.entries(modes).filter(([, m]) => m.local).map(([k]) => k);
  const remote = Object.entries(modes).filter(([, m]) => !m.local).map(([k]) => k);
  console.log(`✓ Zbudowano dist/ w ${Date.now() - t0} ms (tryb demo: ${siteConfig.demoMode ? 'tak — noindex' : 'nie'})`);
  console.log(`  Zdjęcia lokalne: ${local.length}/${Object.keys(images).length}`);
  if (remote.length) {
    console.warn(`  ⚠ ${remote.length} zdjęć ładowanych z CDN Unsplash (brak plików lokalnych): ${remote.join(', ')}`);
    console.warn('    Uruchom „npm run images”, aby pobrać je do public/assets/images/.');
    if (strict) {
      console.error('✗ --require-local-images: brakuje plików lokalnych.');
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
