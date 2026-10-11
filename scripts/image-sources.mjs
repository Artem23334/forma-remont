#!/usr/bin/env node
/** Generuje IMAGE_SOURCES.md z manifestu zdjęć i stanu plików lokalnych. */
import { writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { images, LOCAL_WIDTHS, localPath } from '../src/config/images.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exists = (p) => stat(p).then(() => true, () => false);

const rows = [];
let localCount = 0;
for (const [key, m] of Object.entries(images)) {
  const widths = LOCAL_WIDTHS.filter((w) => w <= (m.maxWidth || 2400));
  const files = widths.map((w) => localPath(key, w));
  const local = (await Promise.all(files.map((f) => exists(path.join(root, 'public', f))))).every(Boolean);
  if (local) localCount++;
  rows.push(
    `| \`${key}\` | ${m.section} | ${m.author} | [unsplash.com](${m.page}) | \`photo-${m.id}\` | ${local ? '✅ lokalnie' : '⏳ CDN (do pobrania)'} |`,
  );
}

const md = `# Źródła zdjęć — Forma Remont

Wszystkie zdjęcia pochodzą z serwisu **Unsplash** i są udostępnione na zasadach
**[Unsplash License](https://unsplash.com/license)**:

- można ich używać bezpłatnie, także komercyjnie, bez pytania o zgodę;
- przypisanie autora nie jest wymagane, ale jest mile widziane (strona zawiera listę autorów w stopce, sekcja „Źródła zdjęć”);
- nie wolno sprzedawać zdjęć bez istotnych zmian ani tworzyć z nich konkurencyjnego serwisu ze zdjęciami;
- licencja nie obejmuje praw osób trzecich widocznych na zdjęciach (znaki towarowe, wzory, wizerunek) — na tych zdjęciach nie ma rozpoznawalnych osób ani eksponowanych marek.

Żadne zdjęcie nie pochodzi z płatnej kolekcji **Unsplash+**. Każda pozycja została sprawdzona
na swojej stronie w serwisie Unsplash (autor, identyfikator, licencja) w dniu 2026-10-11.

> **Ważne:** to zdjęcia **poglądowe / inspiracyjne**. Nie przedstawiają realizacji Forma Remont
> (firma jest fikcyjna) i strona wyraźnie to komunikuje w galerii i w stopce.

Stan plików lokalnych: **${localCount}/${rows.length}** zdjęć w \`public/assets/images/\`.
${localCount < rows.length ? 'Brakujące pobierzesz poleceniem `npm run images` (WebP, szerokości ' + LOCAL_WIDTHS.join(', ') + ' px). Do tego czasu strona ładuje je z CDN Unsplash.\n' : ''}
| Klucz | Miejsce na stronie | Autor | Strona zdjęcia | ID | Status |
|---|---|---|---|---|---|
${rows.join('\n')}

Plik generowany automatycznie: \`npm run sources\` (na podstawie \`src/config/images.mjs\`).
`;

await writeFile(path.join(root, 'IMAGE_SOURCES.md'), md);
console.log(`IMAGE_SOURCES.md: ${rows.length} zdjęć, lokalnie ${localCount}`);
