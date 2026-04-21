import type { FilmStock } from '../types';

const ROMAN_TO_NUM: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
};

export const ZONE_LABELS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
};

function z(v: string): number | 'clip' {
  if (v === 'clip') return 'clip';
  return ROMAN_TO_NUM[v];
}

function make(
  category: FilmStock['category'],
  manufacturer: string,
  film: string,
  ei: number,
  totalDR: number,
  shadowDR: number,
  highlightDR: number,
  minZone: string,
  maxZone: string,
  ex: [string, string, string, string, string, string, string],
): FilmStock {
  return {
    id: `${manufacturer.toLowerCase().replace(/\s+/g, '-')}-${film
      .toLowerCase()
      .replace(/\s+/g, '-')}-${ei}`,
    category,
    manufacturer,
    film,
    ei,
    totalDR,
    shadowDR,
    highlightDR,
    minZone: ROMAN_TO_NUM[minZone],
    maxZone: ROMAN_TO_NUM[maxZone],
    expComp: {
      [-3]: z(ex[0]),
      [-2]: z(ex[1]),
      [-1]: z(ex[2]),
      0: z(ex[3]),
      1: z(ex[4]),
      2: z(ex[5]),
      3: z(ex[6]),
    },
  };
}

export const FILM_STOCKS: FilmStock[] = [
  // Kodak Color Negative
  make('negative-color', 'Kodak', 'Portra 400', 200, 13, 5.0, 6.0, 'III', 'VIII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  make('negative-color', 'Kodak', 'Portra 400', 400, 12, 4.5, 5.5, 'III', 'VIII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  make('negative-color', 'Kodak', 'Portra 400', 800, 11, 4.0, 5.0, 'III', 'VIII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  make('negative-color', 'Kodak', 'Portra 160', 160, 11, 4.0, 5.0, 'III', 'VIII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  make('negative-color', 'Kodak', 'Portra 800', 800, 11, 4.0, 4.5, 'III', 'VIII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  make('negative-color', 'Kodak', 'Gold 200', 200, 10.5, 4.5, 5.0, 'III', 'VIII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  make('negative-color', 'Kodak', 'Ultramax 400', 400, 12, 5.0, 5.0, 'III', 'VIII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  make('negative-color', 'Kodak', 'Ektar 100', 100, 9, 2.5, 3.5, 'III', 'VII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'clip']),
  make('negative-color', 'Fujifilm', '200', 200, 10.5, 4.5, 5.0, 'III', 'VIII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  make('negative-color', 'Fujifilm', '400H', 400, 12, 5.0, 5.5, 'III', 'VIII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  make('negative-color', 'CineStill', '400D', 400, 12, 5.0, 5.0, 'III', 'VIII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  make('negative-color', 'CineStill', '800T', 800, 10, 4.0, 5.0, 'III', 'VIII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  make('negative-color', 'Harman', 'Phoenix 200', 200, 9.5, 3.5, 4.5, 'III', 'VIII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'clip']),

  // Black & White
  make('black-white', 'Kodak', 'Tri-X 400', 400, 10, 1.0, 4.0, 'IV', 'VIII', ['clip', 'IV', 'V', 'VI', 'VII', 'VIII', 'clip']),
  make('black-white', 'Kodak', 'Tri-X 400', 800, 9, 0.7, 3.5, 'IV', 'VIII', ['clip', 'IV', 'V', 'VI', 'VII', 'VIII', 'clip']),
  make('black-white', 'Kodak', 'Tri-X 400', 1600, 8, 0.5, 3.0, 'IV', 'VIII', ['clip', 'IV', 'V', 'VI', 'VII', 'VIII', 'clip']),
  make('black-white', 'Kodak', 'Tri-X 400', 3200, 7, 0.3, 2.5, 'V', 'VIII', ['clip', 'V', 'VI', 'VII', 'VIII', 'clip', 'clip']),
  make('black-white', 'Ilford', 'HP5+', 400, 12, 5.0, 4.5, 'II', 'VIII', ['clip', 'II', 'III', 'IV', 'V', 'VI', 'VII']),
  make('black-white', 'Ilford', 'Delta 3200', 3200, 8, 3.0, 3.0, 'III', 'VIII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'clip']),
  make('black-white', 'Ilford', 'Pan F 50', 50, 10, 5.0, 4.5, 'II', 'VIII', ['clip', 'II', 'III', 'IV', 'V', 'VI', 'VII']),
  make('black-white', 'Foma', 'Fomapan 100', 100, 11, 5.0, 4.0, 'II', 'VIII', ['clip', 'II', 'III', 'IV', 'V', 'VI', 'VII']),
  make('black-white', 'Foma', 'Fomapan 200', 200, 10.5, 4.5, 4.0, 'II', 'VIII', ['clip', 'II', 'III', 'IV', 'V', 'VI', 'VII']),
  make('black-white', 'Foma', 'Fomapan 400', 400, 10, 4.0, 4.0, 'II', 'VIII', ['clip', 'II', 'III', 'IV', 'V', 'VI', 'VII']),
  make('black-white', 'Harman', 'Kentmere 100', 100, 11, 5.5, 4.5, 'II', 'VIII', ['clip', 'II', 'III', 'IV', 'V', 'VI', 'VII']),
  make('black-white', 'Harman', 'Kentmere 400', 400, 10, 4.5, 4.0, 'II', 'VIII', ['clip', 'II', 'III', 'IV', 'V', 'VI', 'VII']),

  // Cinema
  make('cinema', 'Kodak Vision3', '50D', 50, 12, 4.5, 5.5, 'III', 'VIII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  make('cinema', 'Kodak Vision3', '250D', 250, 13, 5.0, 6.0, 'III', 'VIII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),
  make('cinema', 'Kodak Vision3', '500T', 500, 13, 5.0, 6.0, 'III', 'VIII', ['clip', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']),

  // Digital (highlight priority) — full ISO range, DR tapers with gain.
  // All share a single film group "Sensor / Digital" so the rating chips
  // (and main-screen ISO slider) give one clean push/pull control surface.
  make('digital', 'Sensor', 'Digital', 50, 12, 7.0, 2.0, 'II', 'VII', ['II', 'III', 'IV', 'V', 'VI', 'clip', 'clip']),
  make('digital', 'Sensor', 'Digital', 100, 12, 7.0, 2.0, 'II', 'VII', ['II', 'III', 'IV', 'V', 'VI', 'clip', 'clip']),
  make('digital', 'Sensor', 'Digital', 200, 11.5, 6.5, 2.0, 'II', 'VII', ['II', 'III', 'IV', 'V', 'VI', 'clip', 'clip']),
  make('digital', 'Sensor', 'Digital', 400, 11, 6.0, 2.0, 'II', 'VII', ['II', 'III', 'IV', 'V', 'VI', 'clip', 'clip']),
  make('digital', 'Sensor', 'Digital', 800, 10.5, 5.5, 2.0, 'II', 'VII', ['II', 'III', 'IV', 'V', 'VI', 'clip', 'clip']),
  make('digital', 'Sensor', 'Digital', 1600, 10, 5.0, 2.0, 'II', 'VII', ['II', 'III', 'IV', 'V', 'VI', 'clip', 'clip']),
  make('digital', 'Sensor', 'Digital', 3200, 9.5, 4.5, 2.0, 'II', 'VII', ['II', 'III', 'IV', 'V', 'VI', 'clip', 'clip']),
  make('digital', 'Sensor', 'Digital', 6400, 9, 4.0, 2.0, 'II', 'VII', ['II', 'III', 'IV', 'V', 'VI', 'clip', 'clip']),
  make('digital', 'Sensor', 'Digital', 12800, 8.5, 3.5, 2.0, 'II', 'VII', ['II', 'III', 'IV', 'V', 'VI', 'clip', 'clip']),
  make('digital', 'Sensor', 'Digital', 25600, 8, 3.0, 2.0, 'II', 'VII', ['II', 'III', 'IV', 'V', 'VI', 'clip', 'clip']),
];

export const CATEGORY_ORDER: FilmStock['category'][] = [
  'negative-color',
  'black-white',
  'cinema',
  'instant',
  'digital',
];

export const CATEGORY_LABEL: Record<FilmStock['category'], string> = {
  'negative-color': 'NEGATIVE COLOR FILMS',
  'black-white': 'BLACK & WHITE FILMS',
  cinema: 'CINEMA FILMS',
  instant: 'INSTANT FILM',
  digital: 'DIGITAL',
};

export const CATEGORY_SHORT: Record<FilmStock['category'], string> = {
  'negative-color': 'Color',
  'black-white': 'B&W',
  cinema: 'Cinema',
  instant: 'Instant',
  digital: 'Digital',
};

/** Films grouped by base name+manufacturer, each with its available EI options. */
export interface FilmGroup {
  key: string;
  manufacturer: string;
  film: string;
  category: FilmStock['category'];
  stocks: FilmStock[];
}

export function groupFilmsByCategory(category: FilmStock['category']): FilmGroup[] {
  const stocks = FILM_STOCKS.filter((f) => f.category === category);
  const groups = new Map<string, FilmGroup>();
  for (const s of stocks) {
    const key = `${s.manufacturer}::${s.film}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        manufacturer: s.manufacturer,
        film: s.film,
        category: s.category,
        stocks: [],
      });
    }
    groups.get(key)!.stocks.push(s);
  }
  return Array.from(groups.values());
}
