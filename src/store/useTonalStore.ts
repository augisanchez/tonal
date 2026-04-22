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

  // Exposure control locks. Drag → lock. Double-tap → unlock (auto).
  isApertureLocked: boolean;
  isShutterLocked: boolean;
  isIsoLocked: boolean;

  /** log2(scene median linear luminance) captured during a gray-card tap.
   *  null = no user calibration; the meter falls back to theoretical 18% gray. */
  calibrationMedianLog: number | null;

  /** Spot meter: when active, tapping the preview marks a point and reads that cell. */
  isSpotModeActive: boolean;
  spotPosition: { x: number; y: number } | null;

  setFilm: (film: FilmStock) => void;
  /** Change ISO within the currently selected film group. Locks ISO. */
  setISO: (ei: number) => void;
  /** User-driven aperture change from a drag. Locks aperture. */
  setAperture: (v: number) => void;
  /** User-driven shutter change from a drag. Locks shutter. */
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

  setApertureLocked: (v: boolean) => void;
  setShutterLocked: (v: boolean) => void;
  setIsoLocked: (v: boolean) => void;

  setCalibrationMedianLog: (v: number | null) => void;

  toggleSpotMode: () => void;
  setSpotPosition: (p: { x: number; y: number } | null) => void;
}

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

  // Startup: aperture locked at f/5.6, ISO locked at 400, shutter auto so
  // the meter shows a live recommendation from the first frame.
  isApertureLocked: true,
  isShutterLocked: false,
  isIsoLocked: true,

  calibrationMedianLog: null,

  isSpotModeActive: false,
  spotPosition: null,

  setFilm: (film) => set({ selectedFilm: film, isIsoLocked: true }),
  setISO: (ei) =>
    set((s) => {
      const match = FILM_STOCKS.find(
        (f) =>
          f.manufacturer === s.selectedFilm.manufacturer &&
          f.film === s.selectedFilm.film &&
          f.ei === ei,
      );
      return match ? { selectedFilm: match, isIsoLocked: true } : {};
    }),
  setAperture: (v) => set({ aperture: v, isApertureLocked: true }),
  setShutter: (v) => set({ shutter: v, isShutterLocked: true }),
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

  setApertureLocked: (v) => set({ isApertureLocked: v }),
  setShutterLocked: (v) => set({ isShutterLocked: v }),
  setIsoLocked: (v) => set({ isIsoLocked: v }),

  setCalibrationMedianLog: (v) => set({ calibrationMedianLog: v }),

  toggleSpotMode: () =>
    set((s) => ({
      isSpotModeActive: !s.isSpotModeActive,
      spotPosition: s.isSpotModeActive ? null : s.spotPosition,
    })),
  setSpotPosition: (p) => set({ spotPosition: p }),
}));
