import { create } from 'zustand';
import type { FilmStock, FormatKey } from '../types';
import { FILM_STOCKS } from '../data/filmStocks';
import { FORMATS, findFormat } from '../data/formats';

interface TonalState {
  selectedFilm: FilmStock;

  aperture: number;
  shutter: number;
  expComp: number;

  format: FormatKey;
  aspectRatioId: string;
  focalLength: number;

  isFilmSheetOpen: boolean;
  shadowWarningEnabled: boolean;
  highlightWarningEnabled: boolean;
  isFrozen: boolean;

  setFilm: (film: FilmStock) => void;
  setAperture: (v: number) => void;
  setShutter: (v: number) => void;
  setExpComp: (v: number) => void;
  setFormat: (f: FormatKey) => void;
  setAspectRatioId: (id: string) => void;
  setFocalLength: (mm: number) => void;
  openFilmSheet: () => void;
  closeFilmSheet: () => void;
  toggleShadowWarning: () => void;
  toggleHighlightWarning: () => void;
  toggleFrozen: () => void;
  setFrozen: (v: boolean) => void;
}

const defaultFilm =
  FILM_STOCKS.find((f) => f.film === 'Portra 400' && f.ei === 200) ?? FILM_STOCKS[0];
const defaultFormat = FORMATS[0];
const defaultAspect = defaultFormat.aspects.find((a) => a.id === 'standard') ?? defaultFormat.aspects[0];

export const useTonalStore = create<TonalState>((set) => ({
  selectedFilm: defaultFilm,

  aperture: 5.6,
  shutter: 500,
  expComp: 0,

  format: defaultFormat.key,
  aspectRatioId: defaultAspect.id,
  focalLength: 28,

  isFilmSheetOpen: false,
  shadowWarningEnabled: false,
  highlightWarningEnabled: false,
  isFrozen: false,

  setFilm: (film) => set({ selectedFilm: film }),
  setAperture: (v) => set({ aperture: v }),
  setShutter: (v) => set({ shutter: v }),
  setExpComp: (v) => set({ expComp: v }),
  setFormat: (f) => {
    const fmt = findFormat(f);
    set({
      format: f,
      aspectRatioId: fmt.aspects[0].id,
      focalLength: fmt.aspects[0].standardFL,
    });
  },
  setAspectRatioId: (id) => set({ aspectRatioId: id }),
  setFocalLength: (mm) => set({ focalLength: mm }),
  openFilmSheet: () => set({ isFilmSheetOpen: true }),
  closeFilmSheet: () => set({ isFilmSheetOpen: false }),
  toggleShadowWarning: () =>
    set((s) => ({ shadowWarningEnabled: !s.shadowWarningEnabled })),
  toggleHighlightWarning: () =>
    set((s) => ({ highlightWarningEnabled: !s.highlightWarningEnabled })),
  toggleFrozen: () => set((s) => ({ isFrozen: !s.isFrozen })),
  setFrozen: (v) => set({ isFrozen: v }),
}));
