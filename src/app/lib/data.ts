export type Place = {
  id: string;
  title: string;
  gallery: string[];
  type: 'recycling' | 'protected' | 'polluted' | 'eco_tour';
  text: string;
  // Optional coordinates (lat/lon) for the real map
  coords?: { lat: number; lon: number };
};

export type Tip = {
  key: string;
  icon: string;
  title: string;
  text: string;
  img: string;
};

export const places: Place[] = [
  {
    id: 'recycling_altagracia',
    title: 'Puntos de reciclaje - Altagracia',
    gallery: ['/punooo.jpg'],
    type: 'recycling',
    text: 'Puntos de reciclaje comunitarios en Altagracia: separa plásticos, vidrio y papel; reciclar protege al lago y apoya iniciativas locales.',
    coords: { lat: 11.5313, lon: -85.5695 },
  },
  {
    id: 'concepcion_zone',
    title: 'Zona protegida - Volcán Maderas (Altagracia)',
    gallery: [
      '/df39d81bd444bfa01311465181c72f94.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/1/1e/Volcano_trail.jpg',
    ],
    type: 'protected',
    text: 'Pendientes y senderos al pie del Volcán Maderas cerca de Altagracia; sensibilidad ecológica alta.',
    coords: { lat: 11.4450, lon: -85.5030 },
  },
  {
    id: 'polluted_shore',
    title: 'Orilla con acumulación de basura',
    gallery: [
      '/basura.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/6/66/Lago_de_Nicaragua.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/4a/Litter_on_shore.jpg',
    ],
    type: 'polluted',
    text: 'Tramos de costa en Altagracia con residuos acumulados; prioridad para limpieza comunitaria.',
    coords: { lat: 11.5400, lon: -85.5550 },
  },
  {
    id: 'eco_center',
    title: 'Centro ecológico - Senderos y pozas',
    gallery: [
      '/sendero.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/2d/Ojo_de_Agua_Ometepe.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/8/88/Nature_landscape.jpg',
    ],
    type: 'eco_tour',
    text: 'Sitios naturales y sostenibles para turismo responsable en Altagracia: guías locales y prácticas de bajo impacto.',
    coords: { lat: 11.5200, lon: -85.5450 },
  },
  {
    id: 'playa_paso_real',
    title: 'Playa Paso Real — Chispa el Perrito',
    gallery: ['/paso real.jpg'],
    type: 'eco_tour',
    text: 'Playa Paso Real: área recreativa; mantén la playa limpia para que Chispa y otros animales disfruten.',
    coords: { lat: 11.4850, lon: -85.6200 },
  },
  {
    id: 'playa_san_miguel',
    title: 'Playa San Miguel — Goldi el Pez',
    gallery: [
      '/playa san miguel.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/3/33/Tropical_fish.jpg',
    ],
    type: 'eco_tour',
    text: 'Playa San Miguel: aguas y orillas que necesitan protección; Goldi recuerda no arrojar residuos al agua.',
    coords: { lat: 11.5000, lon: -85.5850 },
  },
  {
    id: 'playa_taguizapa',
    title: 'Playa Tagüizapa — Rinho el Garrobo',
    gallery: ['/taguizapa.jpg'],
    type: 'eco_tour',
    text: 'Playa Tagüizapa: hábitat costero cercano a zonas rocosas, hogar de Rinho; respeta la flora y fauna.',
    coords: { lat: 11.4900, lon: -85.5750 },
  },
  {
    id: 'playa_santa_cruz',
    title: 'Playa Santa Cruz — Luna la Mariposa',
    gallery: [
      '/sto domingo.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/7/7f/Monarch_In_May.jpg',
    ],
    type: 'eco_tour',
    text: 'Playa Santa Cruz: espacios de anidación y descanso; Luna te invita a cuidar la arena y la vegetación costera.',
    coords: { lat: 11.4700, lon: -85.5550 },
  },
  {
    id: 'playa_santo_domingo',
    title: 'Playa Santo Domingo — Tito la Tortuga',
    gallery: [
      '/santo domingo.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/6/6e/Green_sea_turtle_grazing.jpg',
    ],
    type: 'eco_tour',
    text: 'Playa Santo Domingo: importante para tortugas y aves; Tito recuerda evitar luces y dejar los nidos intactos.',
    coords: { lat: 11.5100, lon: -85.5650 },
  },
  {
    id: 'playa_mango',
    title: 'Playa Mango — Pepe el Loro',
    gallery: [
      '/mango.jpeg',
      'https://upload.wikimedia.org/wikipedia/commons/3/32/Ara_macao_-Costa_Rica_-two-8a.jpg',
    ],
    type: 'eco_tour',
    text: 'Playa Mango: zona con vegetación costera; Pepe promueve el turismo responsable y apoyo a guías locales.',
    coords: { lat: 11.5150, lon: -85.5500 },
  },
  {
    id: 'rio_buen_suceso',
    title: 'Río Buen Suceso — Nico el Mono',
    gallery: [
      '/riooo.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/47/White-faced_capuchin.jpg',
    ],
    type: 'protected',
    text: 'Río Buen Suceso: ecosistema acuático y ribereño; Nico te recuerda cuidar la cuenca y evitar contaminación.',
    coords: { lat: 11.4600, lon: -85.5200 },
  },
  {
    id: 'reserva_pena_inculta',
    title: 'Reserva Natural Peña Inculta — Perla la Urraca',
    gallery: [
      '/peña.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/20/European_magpie_Pica_pica.jpg',
    ],
    type: 'protected',
    text: 'Reserva Natural Peña Inculta: área protegida con senderos y patrimonio natural; Perla invita a respetar las reglas de la reserva.',
    coords: { lat: 11.4550, lon: -85.5350 },
  },
];

export const tips: Tip[] = [
  { key: 'tito', icon: '🐢', title: 'Tito la Tortuga', text: 'La basura puede dañar a los animales del lago.', img: 'tito.png' },
  { key: 'luna', icon: '🦋', title: 'Luna la Mariposa', text: 'Reciclar ayuda a mantener limpia la isla.', img: 'luna.png' },
  { key: 'nico', icon: '🐒', title: 'Nico el Mono', text: 'Explora sin contaminar los senderos.', img: 'nico.png' },
  { key: 'pepe', icon: '🦜', title: 'Pepe el Loro', text: '¡Cuida la isla y comparte lo que aprendes!', img: 'pepe.png' },
  { key: 'perla', icon: '🪶', title: 'Perla la Urraca', text: 'Si cuidamos la naturaleza, siempre tendremos un lugar hermoso.', img: 'perla.png' },
  { key: 'goldi', icon: '🐟', title: 'Goldi el Pez', text: 'La basura en el agua afecta a todos los animales.', img: 'goldi.png' },
  { key: 'chispa', icon: '🐶', title: 'Chispa el Perrito', text: 'Una playa limpia es un hogar feliz.', img: 'chispa.png' },
  { key: 'rinho', icon: '🦎', title: 'Rinho el Garrobo', text: 'La naturaleza es nuestro hogar, cuidémosla juntos.', img: 'rinho.png' },
];

export const carouselSlides = [
  { id: 'maderas', title: 'Volcán Maderas', img: '/df39d81bd444bfa01311465181c72f94.jpg' },
  { id: 'primavera', title: 'Playa Primavera', img: '/Sin título.jpg' },
  { id: 'playa_santa_cruz', title: 'Playa Santa Cruz', img: '/sto domingo.jpg' },
  { id: 'bomberos2', title: 'Bomberos de Ometepe', img: '/bomberos2.jpeg' },
];

export const categoryLabels: Record<string, string> = {
  basura: 'Basura',
  incendio: 'Incendio / Quema',
  tala: 'Tala ilegal',
  contaminacion: 'Contaminación del agua',
  otro: 'Otro',
};

export const emergencyContacts = [
  { key: 'ismary', name: 'Capitana Ismary Busto', role: 'Autoridad local', phone: '83341054' },
  { key: 'ambiente', name: 'Ambiente', role: 'Ministerio del Ambiente', phone: '86244759' },
  { key: 'bomberos', name: 'Bomberos — Capitán Julio Alvarez', role: 'Bomberos de Ometepe', phone: '82175445' },
];

export const whatsappNumber = '50588363931';

export const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  reviewed: 'En revisión',
  resolved: 'Resuelto',
};

export const statusColors: Record<string, string> = {
  pending: '#c04b3a',
  reviewed: '#cda77a',
  resolved: '#2f8f4a',
};

export type Report = {
  id: string;
  category: string;
  description: string;
  location: string | null;
  photoUrl: string | null;
  status: string;
  reporter: string | null;
  directedTo: string | null;
  createdAt: string;
};
