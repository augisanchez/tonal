import { useEffect, useMemo, useState } from 'react';
import { useTonalStore } from '../store/useTonalStore';
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  FILM_STOCKS,
  groupFilmsByCategory,
  type FilmGroup,
} from '../data/filmStocks';
import { FORMATS, findFormat } from '../data/formats';
import type { FilmCategory, FilmStock, FormatKey } from '../types';

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 12 20" className="w-[9px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.5">
      {dir === 'left' ? (
        <path d="M9 3L3 10l6 7" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M3 3l6 7-6 7" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function cycle<T>(arr: T[], current: number, delta: number): number {
  const n = arr.length;
  return ((current + delta) % n + n) % n;
}

export function FilmSelectionSheet() {
  const isOpen = useTonalStore((s) => s.isFilmSheetOpen);
  const close = useTonalStore((s) => s.closeFilmSheet);
  const selectedFilm = useTonalStore((s) => s.selectedFilm);
  const setFilm = useTonalStore((s) => s.setFilm);
  const formatKey = useTonalStore((s) => s.format);
  const setFormat = useTonalStore((s) => s.setFormat);
  const aspectId = useTonalStore((s) => s.aspectRatioId);
  const setAspectRatioId = useTonalStore((s) => s.setAspectRatioId);
  const focalLength = useTonalStore((s) => s.focalLength);
  const setFocalLength = useTonalStore((s) => s.setFocalLength);

  // Local working state — only commit on Done
  const [workingFilm, setWorkingFilm] = useState<FilmStock>(selectedFilm);
  const [category, setCategory] = useState<FilmCategory>(selectedFilm.category);
  const [workingFormat, setWorkingFormat] = useState<FormatKey>(formatKey);
  const [workingAspectId, setWorkingAspectId] = useState(aspectId);
  const [workingFocal, setWorkingFocal] = useState(focalLength);

  useEffect(() => {
    if (isOpen) {
      setWorkingFilm(selectedFilm);
      setCategory(selectedFilm.category);
      setWorkingFormat(formatKey);
      setWorkingAspectId(aspectId);
      setWorkingFocal(focalLength);
    }
  }, [isOpen, selectedFilm, formatKey, aspectId, focalLength]);

  const groups = useMemo(() => groupFilmsByCategory(category), [category]);
  const groupIdx = Math.max(
    0,
    groups.findIndex((g) => g.film === workingFilm.film && g.manufacturer === workingFilm.manufacturer),
  );
  const currentGroup: FilmGroup | undefined = groups[groupIdx];
  const eiIdx = currentGroup
    ? Math.max(0, currentGroup.stocks.findIndex((s) => s.ei === workingFilm.ei))
    : 0;

  const fmtDef = findFormat(workingFormat);
  const aspectIdx = Math.max(
    0,
    fmtDef.aspects.findIndex((a) => a.id === workingAspectId),
  );
  const focalIdx = Math.max(
    0,
    fmtDef.focalLengths.findIndex((mm) => mm === workingFocal),
  );

  if (!isOpen) return null;

  const cycleCategory = (delta: number) => {
    // Skip empty categories
    let next = category;
    for (let i = 0; i < CATEGORY_ORDER.length; i++) {
      const idx = (CATEGORY_ORDER.indexOf(next) + delta + CATEGORY_ORDER.length) % CATEGORY_ORDER.length;
      next = CATEGORY_ORDER[idx];
      if (FILM_STOCKS.some((f) => f.category === next)) break;
    }
    const firstGroup = groupFilmsByCategory(next)[0];
    setCategory(next);
    if (firstGroup) setWorkingFilm(firstGroup.stocks[0]);
  };

  const cycleFilm = (delta: number) => {
    if (!groups.length) return;
    const nextIdx = cycle(groups, groupIdx, delta);
    setWorkingFilm(groups[nextIdx].stocks[0]);
  };

  const cycleEI = (delta: number) => {
    if (!currentGroup) return;
    const nextIdx = cycle(currentGroup.stocks, eiIdx, delta);
    setWorkingFilm(currentGroup.stocks[nextIdx]);
  };

  const cycleFormat = (delta: number) => {
    const next = FORMATS[cycle(FORMATS, FORMATS.findIndex((f) => f.key === workingFormat), delta)];
    setWorkingFormat(next.key);
    setWorkingAspectId(next.aspects[0].id);
    if (!next.focalLengths.includes(workingFocal)) {
      setWorkingFocal(next.aspects[0].standardFL);
    }
  };

  const cycleAspect = (delta: number) => {
    const next = fmtDef.aspects[cycle(fmtDef.aspects, aspectIdx, delta)];
    setWorkingAspectId(next.id);
  };

  const cycleFocal = (delta: number) => {
    const next = fmtDef.focalLengths[cycle(fmtDef.focalLengths, focalIdx, delta)];
    setWorkingFocal(next);
  };

  const commitAndClose = () => {
    setFilm(workingFilm);
    if (workingFormat !== formatKey) setFormat(workingFormat);
    setAspectRatioId(workingAspectId);
    setFocalLength(workingFocal);
    close();
  };

  const currentAspect = fmtDef.aspects[aspectIdx];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* backdrop */}
      <button
        aria-label="Close film selection"
        onClick={close}
        className="absolute inset-0 bg-black/30"
      />

      <div className="relative bg-white rounded-t-[16px] max-h-[90vh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
        <div className="flex flex-col gap-8 items-center p-6">
          {/* Category nav */}
          <div className="flex items-center justify-between w-[260px]">
            <button onClick={() => cycleCategory(-1)} className="p-2 text-ink" aria-label="Previous category">
              <Chevron dir="left" />
            </button>
            <span className="text-[14px] font-semibold tracking-tight">
              {CATEGORY_LABEL[category]}
            </span>
            <button onClick={() => cycleCategory(1)} className="p-2 text-ink" aria-label="Next category">
              <Chevron dir="right" />
            </button>
          </div>

          {/* Film carousel */}
          <div className="w-full flex flex-col gap-4 items-center">
            <div className="bg-grey-100 h-[137px] w-full rounded-[4px]" />
            <div className="flex items-center justify-between w-full">
              <button onClick={() => cycleFilm(-1)} className="p-2 text-ink" aria-label="Previous film">
                <Chevron dir="left" />
              </button>
              <span className="text-[28px] font-semibold tracking-tight text-center flex-1">
                {workingFilm.film}
              </span>
              <button onClick={() => cycleFilm(1)} className="p-2 text-ink" aria-label="Next film">
                <Chevron dir="right" />
              </button>
            </div>
            <div className="flex flex-col items-center w-full gap-2">
              <div className="flex items-center gap-4">
                <button onClick={() => cycleEI(-1)} className="p-1 text-ink-soft text-[14px]" aria-label="Previous EI">
                  −
                </button>
                <span className="text-[14px] font-semibold tracking-tight">
                  @ ISO {workingFilm.ei}
                </span>
                <button onClick={() => cycleEI(1)} className="p-1 text-ink-soft text-[14px]" aria-label="Next EI">
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-grey-100" />

          {/* Format */}
          <div className="flex items-center justify-between w-[200px]">
            <button onClick={() => cycleFormat(-1)} className="p-2 text-ink" aria-label="Previous format">
              <Chevron dir="left" />
            </button>
            <span className="text-[14px] font-semibold tracking-tight">{fmtDef.label}</span>
            <button onClick={() => cycleFormat(1)} className="p-2 text-ink" aria-label="Next format">
              <Chevron dir="right" />
            </button>
          </div>

          {/* Aspect carousel */}
          <div className="flex items-center justify-center gap-6 w-full">
            <button onClick={() => cycleAspect(-1)} className="p-2 text-ink" aria-label="Previous aspect">
              <Chevron dir="left" />
            </button>
            <div className="flex flex-col items-center gap-2 w-[120px]">
              <div
                className="bg-ink"
                style={{
                  width: currentAspect.aspect >= 1 ? '60px' : `${60 * currentAspect.aspect}px`,
                  height: currentAspect.aspect >= 1 ? `${60 / currentAspect.aspect}px` : '60px',
                }}
              />
              <div className="text-[16px] font-semibold tracking-tight text-center">
                {currentAspect.name}
              </div>
              <div className="text-[13px] text-ink-soft">{currentAspect.ratio}</div>
            </div>
            <button onClick={() => cycleAspect(1)} className="p-2 text-ink" aria-label="Next aspect">
              <Chevron dir="right" />
            </button>
          </div>

          <div className="h-px w-full bg-grey-100" />

          {/* Focal length */}
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-[14px] font-semibold tracking-tight">FOCAL LENGTH</div>
            <div className="flex items-center justify-between w-full">
              <button onClick={() => cycleFocal(-1)} className="p-2 text-ink" aria-label="Shorter focal length">
                <Chevron dir="left" />
              </button>
              <span className="text-[21px] font-semibold tracking-tight">{workingFocal}mm</span>
              <button onClick={() => cycleFocal(1)} className="p-2 text-ink" aria-label="Longer focal length">
                <Chevron dir="right" />
              </button>
            </div>
          </div>

          {/* Done */}
          <button
            onClick={commitAndClose}
            className="w-full bg-accent text-white rounded-[14px] py-3.5 px-5 text-[17px] font-semibold tracking-tight"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
