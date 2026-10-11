/**
 * Centralna konfiguracja firmy i strony.
 *
 * Forma Remont to FIKCYJNA firma — strona demonstracyjna.
 * Pola ustawione na `null` są celowo puste: nie wymyślamy danych kontaktowych.
 * Przed wdrożeniem dla prawdziwego klienta uzupełnij je i ustaw `demoMode: false`.
 */
export const siteConfig = {
  /** true = strona nie jest indeksowana (noindex, robots.txt Disallow, nagłówek X-Robots-Tag). */
  demoMode: true,

  brand: {
    name: 'Forma Remont',
    shortName: 'Forma',
    tagline: 'Remonty i wykończenia mieszkań w Warszawie',
    city: 'Warszawa',
  },

  /** Docelowy adres produkcyjny (bez końcowego ukośnika). Używany w metadanych, OG i sitemap. */
  siteUrl: process.env.SITE_URL || 'https://forma-remont.example.com',

  seo: {
    title: 'Forma Remont — remonty i wykończenia mieszkań w Warszawie',
    description:
      'Kompleksowe remonty i wykończenia mieszkań w Warszawie. Przemyślany proces, dbałość o detale i rozwiązania dopasowane do Twoich potrzeb. Strona demonstracyjna.',
    locale: 'pl_PL',
    ogImageKey: 'hero',
  },

  /**
   * Dane kontaktowe — DO UZUPEŁNIENIA. Wartość `null` wyświetla się jako wyraźny placeholder,
   * a link (tel:, mailto:, mapa) nie jest renderowany.
   */
  contact: {
    phone: null, // np. '+48 600 000 000'
    email: null, // np. 'kontakt@twojadomena.pl'
    address: null, // np. 'ul. Przykładowa 1, 00-000 Warszawa'
    openingHours: null, // np. [{ days: 'Pon–Pt', hours: '8:00–18:00' }]
    mapUrl: null, // np. link do Google Maps / OpenStreetMap
    serviceArea: 'Warszawa i okolice', // obszar działania (informacja ogólna, nie zweryfikowana)
  },

  social: [
    // { label: 'Instagram', url: 'https://instagram.com/...' },
    // { label: 'Facebook', url: 'https://facebook.com/...' },
  ],

  legal: {
    companyName: null, // pełna nazwa firmy / NIP do polityki prywatności
    privacyPolicyUrl: null, // link do polityki prywatności (wymagany przed uruchomieniem formularza)
  },
};

export const navigation = [
  { label: 'Usługi', href: '#uslugi' },
  { label: 'Realizacje', href: '#realizacje' },
  { label: 'O nas', href: '#o-nas' },
  { label: 'Proces', href: '#proces' },
  { label: 'Kontakt', href: '#kontakt' },
];

/** Opcje pola „Rodzaj prac” — współdzielone z walidacją po stronie serwera. */
export { WORK_TYPES } from '../../lib/validation.mjs';
