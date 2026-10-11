/** Treści strony (PL). Oddzielone od szablonu, aby łatwo je edytować. */

export const hero = {
  label: 'Remonty • Wykończenia • Wnętrza',
  title: 'Tworzymy wnętrza, w których chce się żyć.',
  text: 'Kompleksowe remonty i wykończenia mieszkań w Warszawie. Przemyślany proces, dbałość o detale i rozwiązania dopasowane do Twoich potrzeb.',
  primary: { label: 'Bezpłatna wycena', href: '#wycena' },
  secondary: { label: 'Poznaj nasze usługi', href: '#uslugi' },
  meta: ['Warszawa i okolice', 'Mieszkania, łazienki, kuchnie', 'Wycena po oględzinach'],
};

export const services = [
  {
    key: 'serviceComplete',
    workType: 'kompleksowy-remont',
    title: 'Kompleksowe remonty mieszkań',
    text: 'Prowadzimy remont od pierwszych pomiarów po ostatnie poprawki: rozbiórki, instalacje, ściany, podłogi i wykończenie. Jeden harmonogram i jedna osoba do kontaktu przez cały czas trwania prac.',
    layout: 'feature',
  },
  {
    key: 'serviceTurnkey',
    workType: 'pod-klucz',
    title: 'Wykończenia pod klucz',
    text: 'Mieszkanie w stanie deweloperskim doprowadzamy do stanu gotowego do zamieszkania — według projektu wnętrza albo wspólnie ustalonego zakresu.',
    layout: 'tall',
  },
  {
    key: 'serviceBathroom',
    workType: 'lazienka',
    title: 'Remonty łazienek',
    text: 'Hydroizolacja, instalacje, płytki, zabudowy i biały montaż. Pilnujemy spadków, fug i styków materiałów, bo to one decydują o trwałości łazienki.',
    layout: 'portrait',
  },
  {
    key: 'serviceKitchen',
    workType: 'kuchnia',
    title: 'Remonty kuchni',
    text: 'Przygotowanie ścian i instalacji pod zabudowę, okładziny między szafkami, oświetlenie i montaż urządzeń — w koordynacji ze stolarzem.',
    layout: 'portrait-offset',
  },
  {
    key: 'servicePainting',
    workType: 'malowanie-gladzie',
    title: 'Malowanie i gładzie',
    text: 'Gładzie gipsowe, szlifowanie i malowanie z zabezpieczeniem pomieszczeń. Równe płaszczyzny, czyste narożniki i staranne łączenia kolorów.',
    layout: 'square',
  },
  {
    key: 'serviceFloors',
    workType: 'podlogi-plytki',
    title: 'Podłogi i płytki',
    text: 'Wylewki samopoziomujące, parkiet, deska warstwowa, panele i gres wielkoformatowy. Odpowiednie podłoże, poziomowanie i precyzyjne docinki.',
    layout: 'wide',
  },
  {
    key: 'serviceFinishing',
    workType: 'prace-wykonczeniowe',
    title: 'Prace wykończeniowe',
    text: 'Listwy, drzwi wewnętrzne, zabudowy i sufity z płyt g-k, montaż oświetlenia i osprzętu — wszystko, co składa się na spójny efekt końcowy.',
    layout: 'compact',
  },
];

export const gallery = [
  { key: 'galleryFireplace', shape: 'feature', caption: 'Salon z kominkiem — ciepłe światło i naturalne materiały' },
  { key: 'galleryKitchen', shape: 'landscape', caption: 'Kuchnia w ciemnych, matowych frontach' },
  { key: 'galleryGreen', shape: 'landscape', caption: 'Głęboka zieleń ścian i miękkie tkaniny' },
  { key: 'galleryLamp', shape: 'tall', caption: 'Wieczorne światło we wnętrzu' },
  { key: 'galleryBathroom', shape: 'portrait', caption: 'Łazienka z wanną i kabiną walk-in' },
  { key: 'galleryLiving', shape: 'landscape', caption: 'Jasny salon o spokojnej kompozycji' },
];

export const principles = [
  {
    icon: 'process',
    title: 'Przemyślany proces',
    text: 'Zaczynamy od rozmowy i oględzin, a potem przygotowujemy zakres prac i plan etapów. Na każdym etapie wiesz, co się dzieje i co będzie dalej.',
  },
  {
    icon: 'detail',
    title: 'Dbałość o detale',
    text: 'Równe fugi, czyste styki materiałów, dokładne docinki. Detale wykonujemy tak, jakby miały być oglądane z bliska — bo będą.',
  },
  {
    icon: 'talk',
    title: 'Jasna komunikacja',
    text: 'Ustalamy jeden kanał kontaktu i regularnie informujemy o postępach. Każdą zmianę zakresu omawiamy, zanim zostanie wykonana.',
  },
  {
    icon: 'fit',
    title: 'Rozwiązania dopasowane do potrzeb',
    text: 'Proponujemy materiały i rozwiązania z uwzględnieniem budżetu, sposobu korzystania z mieszkania i tego, co jest dla Ciebie najważniejsze.',
  },
];

export const processSteps = [
  {
    title: 'Rozmowa i potrzeby',
    text: 'Krótka rozmowa lub wiadomość, a następnie oględziny mieszkania. Poznajemy Twoje oczekiwania, budżet i planowany termin.',
  },
  {
    title: 'Wycena i plan',
    text: 'Przygotowujemy szczegółową wycenę oraz proponowaną kolejność prac. Wspólnie doprecyzowujemy zakres, zanim cokolwiek się zacznie.',
  },
  {
    title: 'Realizacja prac',
    text: 'Prace prowadzimy etapami, z zabezpieczeniem mieszkania i części wspólnych oraz bieżącą informacją o postępach.',
  },
  {
    title: 'Odbiór i podsumowanie',
    text: 'Razem sprawdzamy wykonane prace, ustalamy ewentualne poprawki i przekazujemy wskazówki dotyczące pielęgnacji materiałów.',
  },
];

export const faq = [
  {
    q: 'Jak uzyskać wycenę remontu?',
    a: [
      'Wypełnij formularz na stronie lub skontaktuj się z nami bezpośrednio. Na podstawie opisu wstępnie omówimy zakres, a dokładną wycenę przygotujemy po oględzinach mieszkania — stan ścian, instalacji i podłóg ma duży wpływ na koszt i kolejność prac.',
      'Przygotowanie wyceny jest bezpłatne i do niczego nie zobowiązuje.',
    ],
  },
  {
    q: 'Jak przygotować mieszkanie do remontu?',
    a: [
      'Najlepiej opróżnić pomieszczenia objęte pracami albo ustalić z nami, które meble zostają i jak je zabezpieczymy. Warto też sprawdzić regulamin wspólnoty lub spółdzielni (godziny prac, ewentualne zgłoszenie remontu) i zebrać inspiracje lub projekt wnętrza, jeśli go masz.',
    ],
  },
  {
    q: 'Czy można wykonać remont etapami?',
    a: [
      'W wielu przypadkach tak — np. najpierw łazienka, a później pokoje. Etapowanie wymaga dobrego zaplanowania kolejności (instalacje przed wykończeniem), dlatego omawiamy je już przy wycenie. Trzeba pamiętać, że zwykle wydłuża to cały remont i może wpłynąć na koszt.',
    ],
  },
  {
    q: 'Jak ustalany jest zakres prac?',
    a: [
      'Na podstawie rozmowy, oględzin i — jeśli jest — projektu wnętrza. Spisujemy listę prac i materiałów, którą razem weryfikujemy. Zmiany pojawiające się w trakcie omawiamy i potwierdzamy przed ich wykonaniem.',
    ],
  },
  {
    q: 'Kto kupuje materiały wykończeniowe?',
    a: [
      'Możliwe są oba warianty: materiały wykończeniowe wybierasz i kupujesz samodzielnie albo zamawiamy je po wspólnym wyborze. Sposób rozliczenia ustalamy na etapie wyceny.',
    ],
  },
  {
    q: 'Jak skontaktować się w sprawie projektu?',
    a: [
      'Najprościej przez formularz na tej stronie — w opisie podaj lokalizację, przybliżony metraż i zakres prac. Pozostałe formy kontaktu znajdziesz w sekcji Kontakt.',
    ],
  },
];
