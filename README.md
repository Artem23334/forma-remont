# Forma Remont — strona demonstracyjna

Strona fikcyjnej firmy remontowej z Warszawy, przygotowana jako projekt portfolio do pokazywania potencjalnym klientom. Ciemna, „architektoniczna” estetyka, prawdziwa fotografia wnętrz, pełna wersja mobilna i formularz wyceny z dostarczaniem po stronie serwera.

> **Forma Remont nie istnieje.** Strona nie podaje zmyślonych danych kontaktowych, opinii, realizacji ani statystyk. Zdjęcia są oznaczone jako poglądowe. W trybie demo strona jest wyłączona z indeksowania.

## Szybki start

Wymagany Node.js 18.17+ (projekt **nie ma zależności npm** — `npm install` nie jest potrzebne).

```bash
npm run images   # pobiera 18 zdjęć z Unsplash do public/assets/images/ (WebP, 4 szerokości)
npm run dev      # buduje i uruchamia http://localhost:3000 (z działającym /api/estimate)
npm run verify   # build + kontrola dist/ + testy jednostkowe/API
```

Pozostałe polecenia:

| Polecenie | Co robi |
|---|---|
| `npm run build` | Buduje statyczną stronę do `dist/` |
| `npm run build:strict` | Jak wyżej, ale kończy się błędem, jeśli brakuje lokalnych zdjęć |
| `npm run check` | Build + kontrola: kotwice, ARIA, pliki, sekrety, noindex, metadane |
| `npm test` | Testy walidacji i API formularza (`node --test`) |
| `npm run sources` | Odświeża `IMAGE_SOURCES.md` |
| `python tests/e2e/layout_check.py` | Opcjonalny test w przeglądarce (Playwright): 6 szerokości, overflow, menu, FAQ, lightbox, formularz |

## Zdjęcia

Manifest: `src/config/images.mjs` (autor, strona źródłowa, punkt ogniskowy na desktop/mobile). Pełna lista i licencja: [`IMAGE_SOURCES.md`](IMAGE_SOURCES.md).

Build sprawdza każde zdjęcie: jeśli pliki lokalne istnieją, używa ich; jeśli nie, używa CDN Unsplash i wypisuje ostrzeżenie. Przed publikacją dla klienta uruchom `npm run images`, a potem `npm run build:strict`.

## Konfiguracja firmy

Wszystkie dane firmy są w `src/config/site.config.mjs`. Pola kontaktowe są celowo `null` — strona pokazuje wtedy wyraźny placeholder „do uzupełnienia” i nie generuje fałszywych linków `tel:`/`mailto:`. Treści sekcji (usługi, proces, FAQ) są w `src/templates/content.mjs`.

## Formularz wyceny

- Walidacja w przeglądarce i na serwerze — ten sam moduł `lib/validation.mjs`.
- Endpoint: `api/estimate.js` (funkcja serverless Vercel; lokalnie obsługuje go `npm run dev`).
- Ochrona: ukryte pole (honeypot), minimalny czas wypełnienia, limit 5 zgłoszeń / 10 min na IP (w pamięci instancji), limit rozmiaru.
- **Komunikat sukcesu pojawia się tylko wtedy, gdy kanał dostarczania zwrócił 2xx.** Bez konfiguracji API zwraca `503 delivery_not_configured`, a strona informuje, że zgłoszenie nie zostało wysłane.

Kanał ustawiasz zmiennymi środowiskowymi (patrz `.env.example`; lokalnie `.env.local`, na Vercel: *Settings → Environment Variables*):

| `FORM_DELIVERY` | Wymagane zmienne |
|---|---|
| `telegram` | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` |
| `webhook` | `FORM_WEBHOOK_URL` (opcjonalnie `FORM_WEBHOOK_SECRET` → nagłówek `X-Webhook-Secret`) |
| `email` | `RESEND_API_KEY`, `FORM_EMAIL_TO`, `FORM_EMAIL_FROM` (Resend, zweryfikowana domena nadawcy) |

Można podać kilka kanałów naraz: `FORM_DELIVERY=telegram,email`. Sekrety nigdy nie trafiają do kodu przeglądarki (sprawdza to `npm run check`).

## Wdrożenie na Vercel

1. Wypchnij repozytorium na GitHub i zaimportuj je w Vercel (framework: *Other* — ustawienia są w `vercel.json`).
2. Ustaw `SITE_URL` i zmienne kanału formularza.
3. Wyślij testowe zgłoszenie i sprawdź, czy dotarło.

### Przed uruchomieniem dla prawdziwego klienta

- `demoMode: false` w `site.config.mjs` **oraz** usuń nagłówek `X-Robots-Tag` z `vercel.json`.
- Uzupełnij dane kontaktowe, nazwę firmy i link do polityki prywatności (wymagany dla zgody RODO w formularzu).
- Zastąp zdjęcia poglądowe prawdziwymi realizacjami i zmień opisy galerii.
- Rozważ samodzielny hosting fontów (Google Fonts z CDN przesyła IP odwiedzających do Google — istotne dla RODO).
- Dla większego ruchu zastąp limiter w pamięci trwałym magazynem (np. Upstash/Vercel KV).

## Struktura

```
forma-remont/
├── api/estimate.js            # funkcja serverless: walidacja + dostarczanie
├── lib/
│   ├── validation.mjs         # wspólna walidacja (przeglądarka + serwer)
│   └── delivery.mjs           # Telegram / webhook / e-mail (Resend)
├── src/
│   ├── config/site.config.mjs # dane firmy, nawigacja, tryb demo
│   ├── config/images.mjs      # manifest zdjęć
│   ├── templates/page.mjs     # szablon HTML
│   ├── templates/content.mjs  # treści PL
│   ├── styles/main.css
│   └── scripts/main.js        # menu, nagłówek, FAQ, lightbox, formularz
├── public/assets/images/      # zdjęcia lokalne (po npm run images)
├── scripts/                   # build, dev, check, images, sources
├── tests/                     # testy node + opcjonalny e2e (Playwright)
├── IMAGE_SOURCES.md
├── vercel.json
└── .env.example
```
