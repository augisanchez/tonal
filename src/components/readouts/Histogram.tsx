import { useMemo } from 'react';
import type { FrameAnalysis } from '../../hooks/useFrameAnalysis';

interface HistogramProps {
  analysis: FrameAnalysis | null;
  filmMinZone: number;
  filmMaxZone: number;
}

export function Histogram({ analysis, filmMinZone, filmMaxZone }: HistogramProps) {
  const counts = useMemo(() => {
    const c = new Array(11).fill(0);
    if (!analysis) return c;
    for (let i = 0; i < analysis.cellZones.length; i++) {
      const z = analysis.cellZones[i];
      if (z >= 0 && z <= 10) c[z]++;
    }
    return c;
  }, [analysis]);

  const max = Math.max(1, ...counts);

  return (
    <div className="flex items-end gap-[2px] h-5 w-full px-1" aria-label="Zone histogram" aria-hidden>
      {counts.map((count, z) => {
        const pct = (count / max) * 100;
        const inRange = z >= filmMinZone && z <= filmMaxZone;
        return (
          <div
            key={z}
            className={`flex-1 rounded-t-[1px] transition-[height] duration-300 ${
              inRange ? 'bg-ink/80' : 'bg-[color:var(--color-warning)]/70'
            }`}
            style={{ height: `${Math.max(2, pct)}%`, opacity: count > 0 ? 1 : 0.2 }}
          />
        );
      })}
    </div>
  );
}
