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
  /** Change ISO within the currently selected film group (same manufacturer + film name). */
  setISO: (ei: number) => void;
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

// App opens on digital. Digital is the closest analogue to how the
// iPhone's sensor behaves, so the initial reading is honest before any
// film decision has been made.
const defaultFilm =
  FILM_STOCKS.find((f) => f.category === 'digital' && f.ei === 400) ?? FILM_STOCKS[0];
const defaultFormat = FORMATS[0];
const defaultAspect =
  defaultFormat.aspects.find((a) => a.id === 'standard') ?? defaultFormat.aspects[0];

export const useTonalStore = create<TonalState>((set) => ({
  selectedFilm: defaultFilm,

  aperture: 5.6,
  shutter: 500,
  expComp: 0,

  format: defaultFormat.key,
  aspectRatioId: defaultAspect.id,
  focalLength: 50,

  isFilmSheetOpen: false,
  shadowWarningEnabled: false,
  highlightWarningEnabled: false,
  isFrozen: false,

  setFilm: (film) => set({ selectedFilm: film }),
  setISO: (ei) =>
    set((s) => {
      const match = FILM_STOCKS.find(
        (f) =>
          f.manufacturer === s.selectedFilm.manufacturer &&
          f.film === s.selectedFilm.film &&
          f.ei === ei,
      );
      return match ? { selectedFilm: match } : {};
    }),
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
