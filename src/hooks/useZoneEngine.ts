import { useMemo } from 'react';
import type { FilmStock, ZoneMarker } from '../types';
import { ZONE_LABELS } from '../data/filmStocks';

/** Demo positions — static until Stage 3 brings real luminance analysis.
 *  Picked to look scattered and natural within 0.1–0.9 range. */
const DEMO_POSITIONS: Record<number, { x: number; y: number }> = {
  2: { x: 0.22, y: 0.48 },
  3: { x: 0.18, y: 0.62 },
  4: { x: 0.42, y: 0.72 },
  5: { x: 0.64, y: 0.8 },
  6: { x: 0.52, y: 0.35 },
  7: { x: 0.78, y: 0.36 },
  8: { x: 0.35, y: 0.28 },
};

/** Snap the exp-comp slider value to the nearest whole stop for the film table. */
function nearestWholeStop(expComp: number): -3 | -2 | -1 | 0 | 1 | 2 | 3 {
  const r = Math.max(-3, Math.min(3, Math.round(expComp))) as -3 | -2 | -1 | 0 | 1 | 2 | 3;
  return r;
}

export function useZoneEngine(film: FilmStock, expComp: number): ZoneMarker[] {
  return useMemo(() => {
    const whole = nearestWholeStop(expComp);
    const placement = film.expComp[whole];

    // placement is either a zone number or 'clip'. When 'clip', treat
    // that column as a flag that the extreme zones of the usable range
    // are clipping at this exp-comp setting.
    const shifted = typeof placement === 'number' ? placement - 5 : 0;

    // Choose the set of zones to display — use the stops around midtone
    // that span the film's usable range.
    const zonesToShow = [3, 4, 5, 7, 8];

    return zonesToShow
      .map<ZoneMarker | null>((baseZone) => {
        const adjusted = baseZone + shifted;
        if (adjusted < 1 || adjusted > 10) return null;

        const outsideRange = adjusted < film.minZone || adjusted > film.maxZone;
        const clipFlag = placement === 'clip';

        const pos = DEMO_POSITIONS[baseZone] ?? { x: 0.5, y: 0.5 };

        return {
          zone: adjusted,
          label: ZONE_LABELS[adjusted] ?? String(adjusted),
          x: pos.x,
          y: pos.y,
          isClipping: outsideRange || clipFlag,
          isActive: true,
        };
      })
      .filter((m): m is ZoneMarker => m !== null);
  }, [film, expComp]);
}
