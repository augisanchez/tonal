import { useMemo, useState } from 'react';
import { useTonalStore } from '../store/useTonalStore';
import { FILM_STOCKS } from '../data/filmStocks';
import { TickSlider } from './TickSlider';
import { AutoBadge } from './AutoBadge';

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

  if (eis.length <= 1) return null;

  return (
    <div className="relative w-full flex items-center justify-center p-2">
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2">
        <TickSlider
          count={eis.length}
          index={effectiveIndex}
          onChange={(i) => {
            setScrub(null);
            setISO(eis[i]);
          }}
          onScrub={setScrub}
          onDoubleTap={() => setIsoLocked(false)}
        />
      </div>
      <div className="bg-white px-3 relative z-[1] flex items-baseline gap-1.5 text-[24px] leading-[22px] tracking-tight tabular-nums">
        {isAuto && <AutoBadge />}
        <span>ISO {displayValue}</span>
      </div>
    </div>
  );
}
