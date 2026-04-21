import { useMemo, useState } from 'react';
import { useTonalStore } from '../store/useTonalStore';
import { FILM_STOCKS } from '../data/filmStocks';
import { TickSlider } from './TickSlider';

/** Main-screen ISO slider. Only meaningful when the current film group has
 *  multiple EI variants — which is true for Digital (50..25600) and for
 *  pushed/pulled film stocks like Tri-X 400 (400, 800, 1600, 3200). */
export function IsoSlider() {
  const film = useTonalStore((s) => s.selectedFilm);
  const setISO = useTonalStore((s) => s.setISO);

  const eis = useMemo(() => {
    return FILM_STOCKS.filter(
      (f) => f.manufacturer === film.manufacturer && f.film === film.film,
    )
      .map((f) => f.ei)
      .sort((a, b) => a - b);
  }, [film.manufacturer, film.film]);

  const idx = eis.indexOf(film.ei);
  const safeIndex = idx >= 0 ? idx : 0;
  const [scrub, setScrub] = useState<number | null>(null);
  const displayIndex = scrub != null ? Math.round(scrub) : safeIndex;
  const displayValue = eis[displayIndex] ?? film.ei;

  // If there's only one EI (e.g. a film rated only at box speed) there's nothing to slide.
  if (eis.length <= 1) return null;

  return (
    <div className="relative w-full flex items-center justify-center p-2">
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2">
        <TickSlider
          count={eis.length}
          index={safeIndex}
          onChange={(i) => {
            setScrub(null);
            setISO(eis[i]);
          }}
          onScrub={setScrub}
        />
      </div>
      <div className="bg-white px-3 relative z-[1] text-[24px] leading-[22px] tracking-tight tabular-nums">
        ISO {displayValue}
      </div>
    </div>
  );
}
