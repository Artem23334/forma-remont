/**
 * Manifest zdjęć. Jedno źródło prawdy dla: strony, skryptu pobierania (npm run images),
 * kontroli (npm run check) i IMAGE_SOURCES.md.
 *
 * Wszystkie zdjęcia pochodzą z Unsplash i są objęte licencją Unsplash License
 * (https://unsplash.com/license). Żadne nie pochodzi z Unsplash+.
 * To zdjęcia poglądowe — NIE są realizacjami Forma Remont.
 *
 * `focus`  — object-position na desktopie, `focusMobile` — na wąskich ekranach.
 */
export const LOCAL_WIDTHS = [640, 1080, 1600, 2400];

export const images = {
  hero: {
    id: '1541194577687-8c63bf9e7ee3',
    alt: 'Ciemny, przytulny salon z narożną sofą i dużym oknem w wieczornym świetle',
    author: 'Christian Lambert',
    page: 'https://unsplash.com/photos/sectional-sofa-near-coffee-table-and-window-hlOpCML8twI',
    section: 'Hero',
    focus: '50% 50%',
    focusMobile: '72% 50%',
    maxWidth: 2400,
  },
  serviceComplete: {
    id: '1564078516393-cf04bd966897',
    alt: 'Wysoki salon z przeszklonymi oknami i narożną sofą o zmierzchu',
    author: 'Roberto Nickson',
    page: 'https://unsplash.com/photos/gray-padded-chaise-couch-beside-window-rEJxpBskj3Q',
    section: 'Usługi — Kompleksowe remonty mieszkań',
    focus: '45% 70%',
  },
  serviceTurnkey: {
    id: '1585128792020-803d29415281',
    alt: 'Minimalistyczne wnętrze z drewnianą komodą i fotelem',
    author: 'Julia (@beazy)',
    page: 'https://unsplash.com/photos/minimalist-living-room-with-wooden-sideboard-aX1TTOuq83M',
    section: 'Usługi — Wykończenia pod klucz',
    focus: '45% 55%',
  },
  serviceBathroom: {
    id: '1754574741164-a41418029cfb',
    alt: 'Łazienka z wolnostojącą wanną, drewnianą wnęką i czarną armaturą',
    author: 'Ela De Pure',
    page: 'https://unsplash.com/photos/elegant-bathroom-with-modern-fixtures-and-decor-xS608no3sTk',
    section: 'Usługi — Remonty łazienek',
    focus: '50% 60%',
  },
  serviceKitchen: {
    id: '1622372738946-62e02505feb3',
    alt: 'Kuchnia z drewnianą zabudową, ciemnymi frontami i hokerem przy wyspie',
    author: 'Kam Idris',
    page: 'https://unsplash.com/photos/modern-kitchen-with-wood-cabinet-teal-stool-hYb7kbu4x7E',
    section: 'Usługi — Remonty kuchni',
    focus: '50% 50%',
  },
  servicePainting: {
    id: '1693985120993-e9b203ce7631',
    alt: 'Malowanie jasnej ściany wałkiem malarskim',
    author: 'Andrew Itaga',
    page: 'https://unsplash.com/photos/a-person-using-a-paint-roller-to-paint-a-wall-rMVjOX8nm2U',
    section: 'Usługi — Malowanie i gładzie',
    focus: '50% 40%',
  },
  serviceFloors: {
    id: '1761053130711-2515ef532bb5',
    alt: 'Drewniana podłoga ułożona w jodełkę',
    author: 'Alex Cooper',
    page: 'https://unsplash.com/photos/wooden-floor-with-herringbone-pattern-Kq8uV6tZM20',
    section: 'Usługi — Podłogi i płytki',
    focus: '50% 50%',
  },
  serviceFinishing: {
    id: '1497219055242-93359eeed651',
    alt: 'Precyzyjna obróbka drewna dłutem',
    author: 'Dominik Scythe',
    page: 'https://unsplash.com/photos/person-using-chisel-while-curving-wood-3cIvvzjE6Lk',
    section: 'Usługi — Prace wykończeniowe',
    focus: '50% 50%',
  },
  galleryFireplace: {
    id: '1698870157085-11632d2ddef8',
    alt: 'Przytulny salon z kominkiem, dużymi oknami w czarnych ramach i ciepłym oświetleniem',
    author: 'Evan Wise',
    page: 'https://unsplash.com/photos/a-living-room-filled-with-furniture-and-a-fire-place-f8tOIicRXKU',
    section: 'Galeria — zdjęcie wiodące',
    focus: '50% 50%',
  },
  galleryKitchen: {
    id: '1600684388091-627109f3cd60',
    alt: 'Nowoczesna kuchnia z matowymi czarnymi frontami i drewnianą podłogą',
    author: 'Sven Brandsma',
    page: 'https://unsplash.com/photos/modern-kitchen-with-black-cabinets-3hEGHI4b4gg',
    section: 'Galeria',
    focus: '50% 50%',
  },
  galleryBathroom: {
    id: '1638799869566-b17fa794c4de',
    alt: 'Łazienka z wanną, szklaną kabiną prysznicową i drewnianą szafką',
    author: 'Lotus Design N Print',
    page: 'https://unsplash.com/photos/a-bathroom-with-a-large-white-bathtub-next-to-a-walk-in-shower-Dk_o7KQyGkI',
    section: 'Galeria',
    focus: '50% 50%',
  },
  galleryGreen: {
    id: '1606744824163-985d376605aa',
    alt: 'Szary fotel z podnóżkiem w pokoju o ciemnozielonych ścianach',
    author: 'Jason Wang',
    page: 'https://unsplash.com/photos/grey-armchair-in-dark-green-room-NxAwryAbtIw',
    section: 'Galeria',
    focus: '40% 55%',
  },
  galleryLamp: {
    id: '1704686448043-466a7178c8e9',
    alt: 'Wieczorne wnętrze oświetlone lampą stojącą',
    author: 'Evan Wise',
    page: 'https://unsplash.com/photos/a-living-room-filled-with-furniture-and-a-lamp-OAiJ1gcainE',
    section: 'Galeria',
    focus: '45% 50%',
  },
  galleryLiving: {
    id: '1628592102751-ba83b0314276',
    alt: 'Nowoczesny salon z fotelem i abstrakcyjną grafiką na ścianie',
    author: 'Huy Nguyen',
    page: 'https://unsplash.com/photos/living-room-with-television-and-armchair-AB-q9lwCVv8',
    section: 'Galeria',
    focus: '50% 50%',
  },
  aboutDetail: {
    id: '1787105975095-3d92ed060ac5',
    alt: 'Fakturowana zasłona i gładka ściana w ciepłym świetle lampy',
    author: 'Rohit Bhusan',
    page: 'https://unsplash.com/photos/curtain-and-wall-with-warm-light-h3CPHEy21GU',
    section: 'Dlaczego warto nam zaufać',
    focus: '50% 50%',
  },
  processSite: {
    id: '1618832515490-e181c4794a45',
    alt: 'Kuchnia w trakcie remontu z zabezpieczonymi frontami szafek',
    author: 'immo RENOVATION',
    page: 'https://unsplash.com/photos/kitchen-renovation-with-white-cabinets-UqNEbyRQ660',
    section: 'Jak wygląda współpraca',
    focus: '50% 50%',
  },
  processTile: {
    id: '1523413307857-ef24c53571ae',
    alt: 'Dłoń dopasowująca białą płytkę ścienną',
    author: 'charlesdeluvio',
    page: 'https://unsplash.com/photos/person-holding-white-tile-LyQi9DS7AEg',
    section: 'Jak wygląda współpraca',
    focus: '60% 50%',
  },
  formMood: {
    id: '1772208392480-2ad69429769a',
    alt: 'Przytłumione wnętrze z sofą i lampą stojącą',
    author: 'Josh Sorenson',
    page: 'https://unsplash.com/photos/a-dimly-lit-sofa-with-a-floor-lamp-behind-it-8qCTSvYbonM',
    section: 'Formularz wyceny',
    focus: '50% 50%',
  },
};

/** Zdalny URL do CDN Unsplash (fallback, gdy plik lokalny nie istnieje). */
export function remoteUrl(id, width, quality = 72) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=${quality}`;
}

/** Ścieżka lokalna względem /public. */
export function localPath(key, width) {
  return `/assets/images/${key}-${width}.webp`;
}

/** URL używany przez skrypt pobierania: WebP, przycięty do szerokości. */
export function downloadUrl(id, width) {
  return `https://images.unsplash.com/photo-${id}?fm=webp&fit=crop&w=${width}&q=74`;
}
