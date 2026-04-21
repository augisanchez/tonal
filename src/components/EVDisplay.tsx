import { useTonalStore } from '../store/useTonalStore';
import { calculateEV } from '../hooks/useEVCalc';

interface EVDisplayProps {
  kelvin: number;
  sceneDRStops: number | null;
  filmDRStops: number;
}

export function EVDisplay({ kelvin, sceneDRStops, filmDRStops }: EVDisplayProps) {
  const aperture = useTonalStore((s) => s.aperture);
  const shutter = useTonalStore((s) => s.shutter);

  const ev = calculateEV(aperture, shutter);
  const evRounded = Math.round(ev * 10) / 10;
  const kRounded = Math.round(kelvin / 100) * 100;

  // DR fit: negative = scene is wider than film (risk of clipping),
  // positive = film has headroom for the scene. Clamp display to 1 decimal.
  const drRounded = sceneDRStops != null ? Math.round(sceneDRStops * 10) / 10 : null;
  const drOver = drRounded != null ? drRounded > filmDRStops + 0.25 : false;

  return (
    <div className="flex flex-col items-center gap-0.5 text-ink tracking-tight tabular-nums">
      <span className="text-[16px] font-bold leading-[22px]">EV {evRounded.toFixed(1)}</span>
      <span className="text-[16px] font-bold leading-[22px]">{kRounded} K</span>
      {drRounded != null && (
        <span
          className={`text-[11px] leading-[14px] font-semibold mt-0.5 ${
            drOver ? 'text-[color:var(--color-warning)]' : 'text-ink-soft'
          }`}
        >
          SCENE {drRounded.toFixed(1)} / FILM {filmDRStops}
        </span>
      )}
    </div>
  );
}
