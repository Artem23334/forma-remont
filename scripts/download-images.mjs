#!/usr/bin/env node
/**
 * Pobiera zdjęcia z manifestu (src/config/images.mjs) do public/assets/images/
 * w formacie WebP, w kilku szerokościach. Uruchom:  npm run images
 * Opcja --force pobiera ponownie istniejące pliki.
 */
import { mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { images, LOCAL_WIDTHS, localPath, downloadUrl } from '../src/config/images.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const force = process.argv.includes('--force');
const exists = (p) => stat(p).then((s) => s.size > 0, () => false);

await mkdir(path.join(pub, 'assets/images'), { recursive: true });

const jobs = [];
for (const [key, meta] of Object.entries(images)) {
  for (const w of LOCAL_WIDTHS.filter((x) => x <= (meta.maxWidth || 2400))) {
    jobs.push({ key, w, url: downloadUrl(meta.id, w), file: path.join(pub, localPath(key, w)) });
  }
}

let ok = 0, skipped = 0;
const failed = [];
const queue = [...jobs];
async function worker() {
  while (queue.length) {
    const job = queue.shift();
    if (!force && (await exists(job.file))) { skipped++; continue; }
    try {
      const res = await fetch(job.url, { headers: { 'user-agent': 'forma-remont-image-fetch/1.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const type = res.headers.get('content-type') || '';
      if (!type.startsWith('image/')) throw new Error(`unexpected content-type ${type}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 2000) throw new Error('file too small');
      await writeFile(job.file, buf);
      ok++;
      process.stdout.write(`  ✓ ${path.relative(root, job.file)} (${Math.round(buf.length / 1024)} KB)\n`);
    } catch (err) {
      failed.push(`${job.key}-${job.w}: ${err.message}`);
      process.stdout.write(`  ✗ ${job.key}-${job.w}: ${err.message}\n`);
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));

console.log(`\nPobrano: ${ok}, pominięto (już istnieją): ${skipped}, błędy: ${failed.length}`);
if (failed.length) {
  console.error('Nie wszystkie zdjęcia zostały pobrane. Strona użyje dla nich CDN Unsplash.');
  process.exit(1);
}
console.log('Gotowe. Uruchom „npm run build”, aby strona korzystała z plików lokalnych.');
