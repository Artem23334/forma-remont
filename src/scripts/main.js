import { validateEstimate, LIMITS } from './validation.mjs';

document.documentElement.classList.add('js');

/* ---------- Header: przezroczysty nad hero, pełny po przewinięciu ---------- */
const header = document.querySelector('[data-header]');
const onScroll = () => header?.classList.toggle('is-solid', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Menu mobilne ---------- */
const toggle = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-mobile-menu]');
const toggleLabel = document.querySelector('[data-menu-label]');
let lastFocus = null;

function setMenu(open) {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', String(open));
  toggleLabel.textContent = open ? 'Zamknij menu' : 'Otwórz menu';
  menu.hidden = !open;
  document.body.classList.toggle('menu-locked', open);
  header.classList.toggle('menu-open', open);
  header.classList.toggle('is-solid', open || window.scrollY > 40);
  // Treść strony pod menu nie powinna być dostępna dla czytników ekranu
  document.getElementById('main').inert = open;
  document.querySelector('.footer').inert = open;
  if (open) {
    lastFocus = document.activeElement;
    menu.querySelector('a')?.focus();
  } else if (lastFocus) {
    lastFocus.focus({ preventScroll: true });
  }
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
menu?.addEventListener('click', (e) => {
  if (e.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') setMenu(false);
  // pułapka fokusu w otwartym menu
  if (e.key === 'Tab' && toggle?.getAttribute('aria-expanded') === 'true') {
    const items = [toggle, ...menu.querySelectorAll('a')];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => m.matches && setMenu(false));

/* ---------- Aktywna sekcja w nawigacji ---------- */
const navLinks = [...document.querySelectorAll('.nav .nav__link')];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window && sections.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          const active = a.getAttribute('href') === `#${entry.target.id}`;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => spy.observe(s));
}

/* ---------- Animacje wejścia (subtelne) ---------- */
const revealTargets = document.querySelectorAll(
  '.section-head, .service, .gallery__item, .principle, .step, .about__media, .process__media, .form, .faq__list, .contact__card',
);
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  revealTargets.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
}

/* ---------- FAQ — akordeon ---------- */
document.querySelectorAll('[data-accordion] .faq__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    document.getElementById(btn.getAttribute('aria-controls')).hidden = open;
  });
});

/* ---------- Galeria — lightbox ---------- */
const lightbox = document.querySelector('[data-lightbox]');
const galleryData = JSON.parse(document.getElementById('gallery-data')?.textContent || '[]');
let lbIndex = 0;
let lbOpener = null;

function renderLightbox() {
  const item = galleryData[lbIndex];
  const imgEl = lightbox.querySelector('[data-lightbox-img]');
  imgEl.src = item.src;
  imgEl.alt = item.alt;
  lightbox.querySelector('[data-lightbox-caption]').textContent = item.caption;
  lightbox.querySelector('[data-lightbox-credit]').textContent = `${item.credit} · zdjęcie poglądowe`;
  lightbox.querySelector('[data-lightbox-count]').textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${String(galleryData.length).padStart(2, '0')}`;
}
function openLightbox(i, opener) {
  if (!lightbox || typeof lightbox.showModal !== 'function') return;
  lbIndex = i;
  lbOpener = opener;
  renderLightbox();
  lightbox.showModal();
  document.body.classList.add('menu-locked');
  lightbox.querySelector('[data-lightbox-close]').focus();
}
const step = (d) => { lbIndex = (lbIndex + d + galleryData.length) % galleryData.length; renderLightbox(); };

document.querySelectorAll('.gallery__trigger').forEach((btn) =>
  btn.addEventListener('click', () => openLightbox(Number(btn.dataset.index), btn)),
);
if (lightbox) {
  lightbox.querySelector('[data-lightbox-prev]').addEventListener('click', () => step(-1));
  lightbox.querySelector('[data-lightbox-next]').addEventListener('click', () => step(1));
  lightbox.querySelector('[data-lightbox-close]').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('close', () => {
    document.body.classList.remove('menu-locked');
    lbOpener?.focus({ preventScroll: true });
  });
  // gest przesunięcia na ekranach dotykowych
  let x0 = null;
  lightbox.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    x0 = null;
  });
}

/* ---------- Formularz wyceny ---------- */
const form = document.querySelector('[data-estimate-form]');
const ENDPOINT = '/api/estimate';

if (form) {
  const startedAt = Date.now();
  const statusEl = form.querySelector('[data-status]');
  const submitBtn = form.querySelector('[data-submit]');
  const submitLabel = submitBtn.querySelector('.form__submit-label');
  const desc = form.elements.description;
  const count = document.getElementById('f-desc-count');
  const touched = new Set();

  const fieldIds = { name: 'f-name', phone: 'f-phone', email: 'f-email', workType: 'f-work', area: 'f-area', startDate: 'f-start', description: 'f-desc', consent: 'f-consent' };

  const values = () => ({
    name: form.elements.name.value,
    phone: form.elements.phone.value,
    email: form.elements.email.value,
    workType: form.elements.workType.value,
    area: form.elements.area.value,
    startDate: form.elements.startDate.value,
    description: form.elements.description.value,
    consent: form.elements.consent.checked,
    website: form.elements.website.value,
  });

  function showErrors(errors, only = null) {
    for (const [key, id] of Object.entries(fieldIds)) {
      if (only && !only.has(key)) continue;
      const input = document.getElementById(id);
      const errEl = document.getElementById(`${id}-err`);
      const msg = errors[key] || '';
      errEl.textContent = msg;
      if (msg) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  }

  function setStatus(type, title, text) {
    statusEl.hidden = false;
    statusEl.className = `form__status is-${type}`;
    statusEl.innerHTML = '';
    const strong = document.createElement('strong');
    strong.textContent = title;
    const p = document.createElement('p');
    p.textContent = text;
    statusEl.append(strong, p);
    statusEl.focus({ preventScroll: false });
  }

  // walidacja „na żywo” po opuszczeniu pola
  form.addEventListener('focusout', (e) => {
    const key = Object.keys(fieldIds).find((k) => fieldIds[k] === e.target.id);
    if (!key) return;
    if (e.target.value || touched.has(key)) touched.add(key);
    if (touched.has(key)) showErrors(validateEstimate(values()).errors, new Set([key]));
  });
  form.addEventListener('input', (e) => {
    const key = Object.keys(fieldIds).find((k) => fieldIds[k] === e.target.id);
    if (key && touched.has(key)) showErrors(validateEstimate(values()).errors, new Set([key]));
  });
  form.elements.consent.addEventListener('change', () => {
    touched.add('consent');
    showErrors(validateEstimate(values()).errors, new Set(['consent']));
  });

  const updateCount = () => { count.textContent = `${desc.value.length} / ${LIMITS.descriptionMax}`; };
  desc.addEventListener('input', updateCount);
  updateCount();

  // „Zapytaj o wycenę” przy usługach — wstępnie ustawia rodzaj prac
  document.querySelectorAll('[data-work-type]').forEach((a) =>
    a.addEventListener('click', () => {
      form.elements.workType.value = a.dataset.workType;
      touched.add('workType');
      showErrors(validateEstimate(values()).errors, new Set(['workType']));
    }),
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.classList.contains('is-loading')) return;

    const v = values();
    const { ok, errors } = validateEstimate(v);
    Object.keys(fieldIds).forEach((k) => touched.add(k));
    showErrors(errors);
    if (!ok) {
      statusEl.hidden = true;
      const firstKey = Object.keys(fieldIds).find((k) => errors[k]);
      document.getElementById(fieldIds[firstKey])?.focus();
      return;
    }

    form.classList.add('is-loading');
    submitBtn.disabled = true;
    submitLabel.textContent = 'Wysyłanie…';
    statusEl.hidden = true;

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ ...v, startedAt }),
      });
      let data = null;
      try { data = await res.json(); } catch { /* odpowiedź nie jest JSON-em */ }

      // Sukces pokazujemy WYŁĄCZNIE, gdy serwer potwierdził dostarczenie zgłoszenia.
      if (res.ok && data?.ok === true) {
        form.reset();
        touched.clear();
        showErrors({});
        updateCount();
        setStatus('success', 'Dziękujemy — zapytanie zostało wysłane.', 'Skontaktujemy się z Tobą, aby omówić szczegóły i umówić oględziny.');
      } else if (res.status === 422 && data?.errors) {
        showErrors(data.errors);
        setStatus('error', 'Sprawdź formularz.', 'Niektóre pola wymagają poprawy.');
      } else if (data?.code === 'delivery_not_configured') {
        setStatus('error', 'Formularz nie jest jeszcze aktywny.', 'Ta strona jest wersją demonstracyjną i formularz nie został podłączony do skrzynki odbiorczej. Twoje zgłoszenie nie zostało wysłane.');
      } else {
        setStatus('error', 'Nie udało się wysłać zgłoszenia.', data?.message || 'Wystąpił błąd po stronie serwera. Spróbuj ponownie za chwilę.');
      }
    } catch {
      setStatus('error', 'Brak połączenia.', 'Nie udało się połączyć z serwerem. Sprawdź połączenie z internetem i spróbuj ponownie.');
    } finally {
      form.classList.remove('is-loading');
      submitBtn.disabled = false;
      submitLabel.textContent = 'Wyślij zapytanie';
    }
  });
}
