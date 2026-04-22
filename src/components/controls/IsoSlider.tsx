import { useMemo, useState } from 'react';
import { useTonalStore } from '../../store/useTonalStore';
import { FILM_STOCKS } from '../../data/filmStocks';
import { ValueSliderRow } from './ValueSliderRow';

interface IsoSliderProps {
  effectiveValue: number;
  isAuto: boolean;
}

export function IsoSlider({ effectiveValue, isAuto }: IsoSliderProps) {
  const film = useTonalStore((s) => s.selectedFilm);
  const setISO = useTonalStore((s) => s.setISO);
  const setIsoLocked = useTonalStore((s) => s.setIsoLocked);

  const eis = useMemo(() => {
    return FILM_STOCKS.filter(
      (f) => f.manufacturer === film.manufacturer && f.film === film.film,
    )
      .map((f) => f.ei)
      .sort((a, b) => a - b);
  }, [film.manufacturer, film.film]);

  const effectiveIndex = Math.max(0, eis.indexOf(effectiveValue));
  const [scrub, setScrub] = useState<number | null>(null);
  const displayIndex = scrub != null ? Math.round(scrub) : effectiveIndex;
  const displayValue = eis[displayIndex] ?? effectiveValue;

  // Single-variant films don't need a slider — ISO is effectively locked.
  if (eis.length <= 1) return null;

  return (
    <ValueSliderRow
      count={eis.length}
      index={effectiveIndex}
      onChange={(i) => {
        setScrub(null);
        setISO(eis[i]);
      }}
      onScrub={setScrub}
      onDoubleTap={() => setIsoLocked(false)}
      isAuto={isAuto}
    >
      <span className="tabular-nums">ISO {displayValue}</span>
    </ValueSliderRow>
  );
}
