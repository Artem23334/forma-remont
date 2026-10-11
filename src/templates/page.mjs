import { siteConfig, navigation } from '../config/site.config.mjs';
import { WORK_TYPES, START_OPTIONS, LIMITS } from '../../lib/validation.mjs';
import { hero, services, gallery, principles, processSteps, faq } from './content.mjs';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const pad = (n) => String(n).padStart(2, '0');

const ICONS = {
  process:
    '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 32h28M10 32V18M20 32V10M30 32V22"/><circle cx="10" cy="15" r="3"/><circle cx="20" cy="7" r="3"/><circle cx="30" cy="19" r="3"/></svg>',
  detail:
    '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="7" y="7" width="26" height="26"/><path d="M7 20h26M20 7v26"/><path d="M27 27l9 9"/></svg>',
  talk:
    '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 9h22v15H15l-6 5v-5H6z"/><path d="M28 15h6v13h-3v4l-5-4h-9"/></svg>',
  fit:
    '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 32V8h24"/><path d="M14 32V14h18v18z"/><path d="M8 20h6M20 8v6"/></svg>',
  arrow:
    '<svg viewBox="0 0 24 12" aria-hidden="true" class="ico-arrow"><path d="M0 6h22M17 1l5 5-5 5"/></svg>',
};

function placeholder(label) {
  return `<span class="placeholder" title="Pole do uzupełnienia w src/config/site.config.mjs">${esc(label)} — do uzupełnienia</span>`;
}

function contactItems(c) {
  const items = [];
  items.push({
    term: 'Telefon',
    value: c.phone
      ? `<a href="tel:${esc(c.phone.replace(/[^\d+]/g, ''))}">${esc(c.phone)}</a>`
      : placeholder('Numer telefonu'),
  });
  items.push({
    term: 'E-mail',
    value: c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : placeholder('Adres e-mail'),
  });
  items.push({
    term: 'Adres',
    value: c.address
      ? c.mapUrl
        ? `<a href="${esc(c.mapUrl)}" target="_blank" rel="noopener">${esc(c.address)}</a>`
        : esc(c.address)
      : placeholder('Adres firmy'),
  });
  items.push({
    term: 'Godziny pracy',
    value: Array.isArray(c.openingHours) && c.openingHours.length
      ? c.openingHours.map((h) => `<span class="hours"><span>${esc(h.days)}</span><span>${esc(h.hours)}</span></span>`).join('')
      : placeholder('Godziny otwarcia'),
  });
  items.push({ term: 'Obszar działania', value: esc(c.serviceArea) });
  return items;
}

export function renderPage({ img, imgUrl, credits, assetVersion }) {
  const { brand, seo, contact, social, legal, demoMode, siteUrl } = siteConfig;
  const ogImage = imgUrl(seo.ogImageKey, 1600, { absolute: true });
  const year = new Date().getFullYear();

  const wordmark = `<span class="wordmark__name">Forma</span><span class="wordmark__rule" aria-hidden="true"></span><span class="wordmark__sub">Remont</span>`;

  const navLinks = navigation
    .map((n) => `<li><a class="nav__link" href="${n.href}">${esc(n.label)}</a></li>`)
    .join('');

  const serviceCards = services
    .map((s, i) => {
      const sizes =
        s.layout === 'feature' || s.layout === 'wide'
          ? '(max-width: 767px) 100vw, 60vw'
          : '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 34vw';
      return `
        <article class="service service--${s.layout}" aria-labelledby="svc-${i}">
          <div class="service__media">${img(s.key, { sizes })}</div>
          <div class="service__body">
            <span class="service__num" aria-hidden="true">${pad(i + 1)}</span>
            <h3 class="service__title" id="svc-${i}">${esc(s.title)}</h3>
            <p class="service__text">${esc(s.text)}</p>
            <a class="link-arrow" href="#wycena" data-work-type="${s.workType}">Zapytaj o wycenę<span class="visually-hidden">: ${esc(s.title)}</span> ${ICONS.arrow}</a>
          </div>
        </article>`;
    })
    .join('');

  const galleryItems = gallery
    .map((g, i) => {
      const sizes = g.shape === 'feature' ? '(max-width: 767px) 100vw, 58vw' : '(max-width: 767px) 100vw, 30vw';
      return `
        <figure class="gallery__item gallery__item--${g.shape}">
          <button type="button" class="gallery__trigger" data-index="${i}" aria-label="Powiększ zdjęcie: ${esc(g.caption)}">
            ${img(g.key, { sizes })}
          </button>
          <figcaption class="gallery__caption">${esc(g.caption)}</figcaption>
        </figure>`;
    })
    .join('');

  const galleryData = gallery.map((g) => ({
    src: imgUrl(g.key, 2400),
    alt: credits[g.key].alt,
    caption: g.caption,
    credit: `Fot. ${credits[g.key].author} / Unsplash`,
  }));

  const principleItems = principles
    .map(
      (p) => `
        <li class="principle">
          <span class="principle__icon">${ICONS[p.icon]}</span>
          <h3 class="principle__title">${esc(p.title)}</h3>
          <p class="principle__text">${esc(p.text)}</p>
        </li>`,
    )
    .join('');

  const steps = processSteps
    .map(
      (s, i) => `
        <li class="step">
          <span class="step__num">${pad(i + 1)}</span>
          <span class="step__dot" aria-hidden="true"></span>
          <h3 class="step__title">${esc(s.title)}</h3>
          <p class="step__text">${esc(s.text)}</p>
        </li>`,
    )
    .join('');

  const faqItems = faq
    .map(
      (f, i) => `
        <div class="faq__item">
          <h3 class="faq__q">
            <button type="button" class="faq__btn" aria-expanded="false" aria-controls="faq-panel-${i}" id="faq-btn-${i}">
              <span>${esc(f.q)}</span><span class="faq__icon" aria-hidden="true"></span>
            </button>
          </h3>
          <div class="faq__panel" id="faq-panel-${i}" role="region" aria-labelledby="faq-btn-${i}" hidden>
            <div class="faq__inner">${f.a.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
          </div>
        </div>`,
    )
    .join('');

  const workOptions = WORK_TYPES.map((t) => `<option value="${t.value}">${esc(t.label)}</option>`).join('');
  const startOptions = START_OPTIONS.map((t) => `<option value="${t.value}">${esc(t.label)}</option>`).join('');

  const contactList = contactItems(contact)
    .map((it) => `<div class="contact__row"><dt>${esc(it.term)}</dt><dd>${it.value}</dd></div>`)
    .join('');

  const socialLinks = social.length
    ? `<ul class="social">${social.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('')}</ul>`
    : `<p class="social">${placeholder('Media społecznościowe')}</p>`;

  const privacyLink = legal.privacyPolicyUrl
    ? `<a href="${esc(legal.privacyPolicyUrl)}" target="_blank" rel="noopener">polityką prywatności</a>`
    : `polityką prywatności <span class="placeholder placeholder--inline">link do uzupełnienia</span>`;

  const creditList = Object.entries(credits)
    .map(([, c]) => `<li><span>${esc(c.section)}</span> — <a href="${esc(c.page)}" target="_blank" rel="noopener">fot. ${esc(c.author)}</a></li>`)
    .join('');

  return `<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(seo.title)}</title>
  <meta name="description" content="${esc(seo.description)}">
  ${demoMode ? '<meta name="robots" content="noindex, nofollow, noimageindex">' : ''}
  <link rel="canonical" href="${esc(siteUrl)}/">
  <meta name="theme-color" content="#171614">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="${esc(seo.locale)}">
  <meta property="og:site_name" content="${esc(brand.name)}">
  <meta property="og:title" content="${esc(seo.title)}">
  <meta property="og:description" content="${esc(seo.description)}">
  <meta property="og:url" content="${esc(siteUrl)}/">
  <meta property="og:image" content="${esc(ogImage)}">
  <meta property="og:image:alt" content="${esc(credits[seo.ogImageKey].alt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(seo.title)}">
  <meta name="twitter:description" content="${esc(seo.description)}">
  <meta name="twitter:image" content="${esc(ogImage)}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600&display=swap">
  ${img.preconnect ? '<link rel="preconnect" href="https://images.unsplash.com">' : ''}
  ${img.heroPreload}
  <link rel="stylesheet" href="/assets/css/main.css?v=${assetVersion}">
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brand.name,
    url: `${siteUrl}/`,
    inLanguage: 'pl-PL',
  })}</script>
</head>
<body>
  <a class="skip-link" href="#main">Przejdź do treści</a>

  <header class="header" data-header>
    <div class="header__inner container">
      <a class="wordmark" href="#top" aria-label="${esc(brand.name)} — strona główna">${wordmark}</a>
      <nav class="nav" aria-label="Główna nawigacja">
        <ul class="nav__list">${navLinks}</ul>
      </nav>
      <a class="btn btn--outline header__cta" href="#wycena">Bezpłatna wycena</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle>
        <span class="visually-hidden" data-menu-label>Otwórz menu</span>
        <span class="menu-toggle__bars" aria-hidden="true"><span></span><span></span></span>
      </button>
    </div>
  </header>

  <div class="mobile-menu" id="mobile-menu" data-mobile-menu hidden>
    <nav aria-label="Menu mobilne">
      <ul class="mobile-menu__list">
        ${navigation.map((n, i) => `<li style="--i:${i}"><a href="${n.href}"><span class="mobile-menu__num">${pad(i + 1)}</span>${esc(n.label)}</a></li>`).join('')}
      </ul>
    </nav>
    <div class="mobile-menu__foot">
      <a class="btn btn--gold btn--block" href="#wycena">Bezpłatna wycena</a>
      <p class="mobile-menu__note">${esc(brand.tagline)}</p>
    </div>
  </div>

  <main id="main">
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="hero__media">${img('hero', { sizes: '100vw', eager: true, cls: 'hero__img' })}</div>
      <div class="hero__shade" aria-hidden="true"></div>
      <div class="hero__content container">
        <p class="eyebrow hero__eyebrow">${esc(hero.label)}</p>
        <h1 class="hero__title" id="hero-title">Tworzymy wnętrza, <em>w&nbsp;których</em> chce się żyć.</h1>
        <p class="hero__text">${esc(hero.text)}</p>
        <div class="hero__actions">
          <a class="btn btn--gold" href="${hero.primary.href}">${esc(hero.primary.label)}</a>
          <a class="btn btn--ghost" href="${hero.secondary.href}">${esc(hero.secondary.label)} ${ICONS.arrow}</a>
        </div>
      </div>
      <div class="hero__meta container">
        <ul>${hero.meta.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
        <span class="hero__credit">Zdjęcie poglądowe</span>
      </div>
    </section>

    <section class="section services" id="uslugi" aria-labelledby="services-title">
      <div class="container">
        <header class="section-head section-head--split">
          <div>
            <p class="eyebrow">Usługi</p>
            <h2 class="section-title" id="services-title">Zakres naszych usług</h2>
          </div>
          <p class="section-lead">Od pojedynczej łazienki po całe mieszkanie. Każdy zakres zaczynamy od rozmowy o tym, jak chcesz mieszkać — dopiero potem przechodzimy do materiałów i harmonogramu.</p>
        </header>
        <div class="services__grid">${serviceCards}
        </div>
      </div>
    </section>

    <section class="section gallery" id="realizacje" aria-labelledby="gallery-title">
      <div class="container">
        <header class="section-head section-head--split">
          <div>
            <p class="eyebrow">Inspiracje</p>
            <h2 class="section-title" id="gallery-title">Przestrzenie, które inspirują</h2>
          </div>
          <p class="section-lead">Wybór wnętrz, które pokazują kierunek, w jakim lubimy pracować: naturalne materiały, ciepłe światło i spokojne proporcje.</p>
        </header>
        <p class="notice" role="note"><strong>Zdjęcia poglądowe.</strong> Prezentowane fotografie pochodzą z serwisu Unsplash i mają charakter inspiracji — nie przedstawiają realizacji Forma Remont.</p>
        <div class="gallery__grid">${galleryItems}
        </div>
      </div>
      <script type="application/json" id="gallery-data">${JSON.stringify(galleryData).replace(/</g, '\\u003c')}</script>
    </section>

    <section class="section about" id="o-nas" aria-labelledby="about-title">
      <div class="container about__grid">
        <div class="about__media">
          ${img('aboutDetail', { sizes: '(max-width: 1023px) 100vw, 42vw' })}
        </div>
        <div class="about__content">
          <p class="eyebrow">O nas</p>
          <h2 class="section-title" id="about-title">Dlaczego warto nam zaufać?</h2>
          <p class="section-lead">Remont to dla wielu osób jedna z większych decyzji. Dlatego stawiamy na jasne zasady współpracy i staranność, którą widać w codziennym użytkowaniu mieszkania.</p>
          <ul class="principles">${principleItems}
          </ul>
        </div>
      </div>
    </section>

    <section class="section process" id="proces" aria-labelledby="process-title">
      <div class="container">
        <div class="process__top">
          <header class="section-head">
            <p class="eyebrow">Proces</p>
            <h2 class="section-title" id="process-title">Jak wygląda współpraca?</h2>
            <p class="section-lead">Cztery etapy, które porządkują remont — od pierwszej rozmowy po odbiór gotowego wnętrza.</p>
          </header>
          <div class="process__media">
            <div class="process__img process__img--a">${img('processSite', { sizes: '(max-width: 767px) 70vw, 30vw' })}</div>
            <div class="process__img process__img--b">${img('processTile', { sizes: '(max-width: 767px) 50vw, 20vw' })}</div>
          </div>
        </div>
        <ol class="steps">${steps}
        </ol>
      </div>
    </section>

    <section class="section estimate" id="wycena" aria-labelledby="estimate-title">
      <div class="estimate__bg" aria-hidden="true">${img('formMood', { sizes: '100vw', alt: '' })}</div>
      <div class="container estimate__grid">
        <div class="estimate__intro">
          <p class="eyebrow">Bezpłatna wycena</p>
          <h2 class="section-title" id="estimate-title">Porozmawiajmy o Twoim remoncie</h2>
          <p class="section-lead">Opisz krótko, co chcesz zmienić. Odezwiemy się, aby omówić szczegóły i umówić oględziny.</p>
          <ol class="estimate__next">
            <li><span>01</span>Wysyłasz krótki opis projektu</li>
            <li><span>02</span>Kontaktujemy się, aby doprecyzować zakres</li>
            <li><span>03</span>Umawiamy oględziny i przygotowujemy wycenę</li>
          </ol>
        </div>

        <form class="form" id="estimate-form" novalidate data-estimate-form>
          <div class="form__grid">
            <div class="field">
              <label for="f-name">Imię i nazwisko <span class="req" aria-hidden="true">*</span></label>
              <input id="f-name" name="name" type="text" autocomplete="name" required minlength="${LIMITS.nameMin}" maxlength="${LIMITS.nameMax}" aria-describedby="f-name-err">
              <p class="field__error" id="f-name-err" aria-live="polite"></p>
            </div>
            <div class="field">
              <label for="f-phone">Numer telefonu <span class="req" aria-hidden="true">*</span></label>
              <input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="24" placeholder="+48" aria-describedby="f-phone-err">
              <p class="field__error" id="f-phone-err" aria-live="polite"></p>
            </div>
            <div class="field">
              <label for="f-email">Adres e-mail <span class="opt">(opcjonalnie)</span></label>
              <input id="f-email" name="email" type="email" autocomplete="email" maxlength="${LIMITS.emailMax}" aria-describedby="f-email-err">
              <p class="field__error" id="f-email-err" aria-live="polite"></p>
            </div>
            <div class="field">
              <label for="f-work">Rodzaj prac <span class="req" aria-hidden="true">*</span></label>
              <div class="select"><select id="f-work" name="workType" required aria-describedby="f-work-err">
                <option value="">Wybierz…</option>${workOptions}
              </select></div>
              <p class="field__error" id="f-work-err" aria-live="polite"></p>
            </div>
            <div class="field">
              <label for="f-area">Przybliżony metraż <span class="opt">(opcjonalnie)</span></label>
              <div class="input-suffix"><input id="f-area" name="area" type="text" inputmode="decimal" maxlength="7" aria-describedby="f-area-err"><span aria-hidden="true">m²</span></div>
              <p class="field__error" id="f-area-err" aria-live="polite"></p>
            </div>
            <div class="field">
              <label for="f-start">Planowany termin rozpoczęcia <span class="opt">(opcjonalnie)</span></label>
              <div class="select"><select id="f-start" name="startDate" aria-describedby="f-start-err">
                <option value="">Wybierz…</option>${startOptions}
              </select></div>
              <p class="field__error" id="f-start-err" aria-live="polite"></p>
            </div>
            <div class="field field--full">
              <label for="f-desc">Opis projektu <span class="req" aria-hidden="true">*</span></label>
              <textarea id="f-desc" name="description" rows="5" required minlength="${LIMITS.descriptionMin}" maxlength="${LIMITS.descriptionMax}" placeholder="Np. remont łazienki ok. 5 m² w bloku, wymiana płytek i instalacji, prysznic zamiast wanny." aria-describedby="f-desc-err f-desc-count"></textarea>
              <div class="field__meta"><p class="field__error" id="f-desc-err" aria-live="polite"></p><span class="field__count" id="f-desc-count">0 / ${LIMITS.descriptionMax}</span></div>
            </div>
            <div class="field field--full field--check">
              <input id="f-consent" name="consent" type="checkbox" required aria-describedby="f-consent-err">
              <label for="f-consent">Wyrażam zgodę na przetwarzanie moich danych osobowych w celu przygotowania wyceny i kontaktu w sprawie zapytania, zgodnie z ${privacyLink}. <span class="req" aria-hidden="true">*</span></label>
              <p class="field__error" id="f-consent-err" aria-live="polite"></p>
            </div>
            <div class="hp" aria-hidden="true">
              <label for="f-website">Pozostaw to pole puste</label>
              <input id="f-website" name="website" type="text" tabindex="-1" autocomplete="off">
            </div>
          </div>
          <div class="form__foot">
            <button class="btn btn--gold form__submit" type="submit" data-submit>
              <span class="form__submit-label">Wyślij zapytanie</span>
              <span class="spinner" aria-hidden="true"></span>
            </button>
            <p class="form__hint"><span class="req" aria-hidden="true">*</span> Pola wymagane</p>
          </div>
          <div class="form__status" role="status" aria-live="polite" tabindex="-1" data-status hidden></div>
        </form>
      </div>
    </section>

    <section class="section faq" id="faq" aria-labelledby="faq-title">
      <div class="container faq__grid">
        <header class="section-head">
          <p class="eyebrow">FAQ</p>
          <h2 class="section-title" id="faq-title">Najczęstsze pytania</h2>
          <p class="section-lead">Nie znalazłeś odpowiedzi? <a href="#wycena" class="text-link">Napisz do nas</a> — chętnie wyjaśnimy szczegóły.</p>
        </header>
        <div class="faq__list" data-accordion>${faqItems}
        </div>
      </div>
    </section>

    <section class="section contact" id="kontakt" aria-labelledby="contact-title">
      <div class="container contact__grid">
        <div>
          <p class="eyebrow">Kontakt</p>
          <h2 class="section-title" id="contact-title">Zacznijmy od rozmowy</h2>
          <p class="section-lead">Najszybciej odpowiemy na zapytanie wysłane przez formularz. Możesz też skorzystać z danych poniżej.</p>
          <a class="btn btn--gold" href="#wycena">Bezpłatna wycena</a>
        </div>
        <div class="contact__card">
          <dl class="contact__list">${contactList}
          </dl>
          <div class="contact__social"><span class="contact__label">Social media</span>${socialLinks}</div>
          ${contact.mapUrl ? `<a class="link-arrow" href="${esc(contact.mapUrl)}" target="_blank" rel="noopener">Zobacz na mapie ${ICONS.arrow}</a>` : `<p class="contact__map">${placeholder('Lokalizacja na mapie')}</p>`}
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <a class="wordmark wordmark--lg" href="#top" aria-label="${esc(brand.name)} — powrót na górę">${wordmark}</a>
        <nav aria-label="Stopka">
          <ul class="footer__nav">${navLinks}<li><a class="nav__link" href="#faq">FAQ</a></li></ul>
        </nav>
      </div>
      ${demoMode ? `<p class="footer__demo"><strong>Projekt demonstracyjny.</strong> Forma Remont to fikcyjna marka stworzona na potrzeby portfolio. Strona nie przedstawia działającej firmy, a dane kontaktowe, opinie i realizacje nie są prezentowane jako zweryfikowane.</p>` : ''}
      <details class="footer__credits" id="zrodla-zdjec">
        <summary>Źródła zdjęć</summary>
        <p>Wszystkie fotografie pochodzą z serwisu <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a> i są wykorzystane na zasadach <a href="https://unsplash.com/license" target="_blank" rel="noopener">Unsplash License</a>. Mają charakter poglądowy.</p>
        <ul>${creditList}</ul>
      </details>
      <div class="footer__bottom">
        <p>© ${year} ${esc(legal.companyName || brand.name)}${demoMode ? ' · projekt demonstracyjny' : ''}</p>
        <p>${legal.privacyPolicyUrl ? `<a href="${esc(legal.privacyPolicyUrl)}">Polityka prywatności</a>` : placeholder('Polityka prywatności')}</p>
      </div>
    </div>
  </footer>

  <dialog class="lightbox" aria-label="Podgląd zdjęcia" data-lightbox>
    <div class="lightbox__frame">
      <img class="lightbox__img" alt="" data-lightbox-img>
      <div class="lightbox__bar">
        <p class="lightbox__caption"><span data-lightbox-caption></span><small data-lightbox-credit></small></p>
        <div class="lightbox__controls">
          <span class="lightbox__count" data-lightbox-count></span>
          <button type="button" class="lightbox__btn" data-lightbox-prev aria-label="Poprzednie zdjęcie"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
          <button type="button" class="lightbox__btn" data-lightbox-next aria-label="Następne zdjęcie"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
          <button type="button" class="lightbox__btn" data-lightbox-close aria-label="Zamknij podgląd"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        </div>
      </div>
    </div>
  </dialog>

  <script type="module" src="/assets/js/main.js?v=${assetVersion}"></script>
</body>
</html>
`;
}
