/**
 * Walidacja formularza wyceny — wspólna dla przeglądarki i serwera.
 * Plik nie ma zależności i działa jako moduł ES w obu środowiskach.
 */

export const WORK_TYPES = [
  { value: 'kompleksowy-remont', label: 'Kompleksowy remont mieszkania' },
  { value: 'pod-klucz', label: 'Wykończenie pod klucz' },
  { value: 'lazienka', label: 'Remont łazienki' },
  { value: 'kuchnia', label: 'Remont kuchni' },
  { value: 'malowanie-gladzie', label: 'Malowanie i gładzie' },
  { value: 'podlogi-plytki', label: 'Podłogi i płytki' },
  { value: 'prace-wykonczeniowe', label: 'Prace wykończeniowe' },
  { value: 'inne', label: 'Inne / jeszcze nie wiem' },
];

export const START_OPTIONS = [
  { value: 'jak-najszybciej', label: 'Jak najszybciej' },
  { value: '1-3-miesiace', label: 'W ciągu 1–3 miesięcy' },
  { value: '3-6-miesiecy', label: 'Za 3–6 miesięcy' },
  { value: 'pozniej', label: 'Później / elastycznie' },
];

export const LIMITS = {
  nameMin: 3,
  nameMax: 80,
  phoneMinDigits: 9,
  phoneMaxDigits: 15,
  emailMax: 120,
  areaMin: 1,
  areaMax: 2000,
  descriptionMin: 20,
  descriptionMax: 2000,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_ALLOWED_RE = /^[+\d][\d\s\-()]*$/;

const str = (v) => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim());

/**
 * Normalizuje i waliduje dane formularza.
 * @returns {{ ok: boolean, data: object, errors: Record<string,string> }}
 */
export function validateEstimate(input = {}) {
  const errors = {};
  const data = {
    name: str(input.name).replace(/\s+/g, ' '),
    phone: str(input.phone),
    email: str(input.email).toLowerCase(),
    workType: str(input.workType),
    area: str(input.area).replace(',', '.'),
    startDate: str(input.startDate),
    description: str(input.description),
    consent: input.consent === true || input.consent === 'true' || input.consent === 'on',
  };

  if (!data.name) errors.name = 'Podaj imię i nazwisko.';
  else if (data.name.length < LIMITS.nameMin) errors.name = 'Imię i nazwisko jest zbyt krótkie.';
  else if (data.name.length > LIMITS.nameMax) errors.name = `Maksymalnie ${LIMITS.nameMax} znaków.`;

  const digits = data.phone.replace(/\D/g, '');
  if (!data.phone) errors.phone = 'Podaj numer telefonu.';
  else if (!PHONE_ALLOWED_RE.test(data.phone)) errors.phone = 'Numer może zawierać tylko cyfry, spacje, „+”, „-” i nawiasy.';
  else if (digits.length < LIMITS.phoneMinDigits || digits.length > LIMITS.phoneMaxDigits)
    errors.phone = 'Sprawdź numer telefonu — wygląda na niepełny.';

  if (data.email) {
    if (data.email.length > LIMITS.emailMax || !EMAIL_RE.test(data.email))
      errors.email = 'Sprawdź adres e-mail.';
  }

  if (!data.workType) errors.workType = 'Wybierz rodzaj prac.';
  else if (!WORK_TYPES.some((t) => t.value === data.workType)) errors.workType = 'Wybierz rodzaj prac z listy.';

  if (data.area) {
    const n = Number(data.area);
    if (!Number.isFinite(n) || n < LIMITS.areaMin || n > LIMITS.areaMax)
      errors.area = `Podaj metraż jako liczbę od ${LIMITS.areaMin} do ${LIMITS.areaMax} m².`;
    else data.area = String(Math.round(n * 10) / 10);
  }

  if (data.startDate && !START_OPTIONS.some((o) => o.value === data.startDate))
    errors.startDate = 'Wybierz termin z listy.';

  if (!data.description) errors.description = 'Opisz krótko swój projekt.';
  else if (data.description.length < LIMITS.descriptionMin)
    errors.description = `Napisz kilka słów więcej (min. ${LIMITS.descriptionMin} znaków).`;
  else if (data.description.length > LIMITS.descriptionMax)
    errors.description = `Maksymalnie ${LIMITS.descriptionMax} znaków.`;

  if (!data.consent) errors.consent = 'Zgoda jest wymagana, abyśmy mogli odpowiedzieć na zapytanie.';

  return { ok: Object.keys(errors).length === 0, data, errors };
}

export function labelFor(list, value) {
  return list.find((o) => o.value === value)?.label ?? value;
}
