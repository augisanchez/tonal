import { useTonalStore } from '../store/useTonalStore';
import { calculateEV } from '../hooks/useEVCalc';

export function EVDisplay() {
  const aperture = useTonalStore((s) => s.aperture);
  const shutter = useTonalStore((s) => s.shutter);
  const kelvin = useTonalStore((s) => s.kelvin);

  const ev = calculateEV(aperture, shutter);
  const evRounded = Math.round(ev * 10) / 10;
  const kRounded = Math.round(kelvin / 100) * 100;

  return (
    <div className="flex flex-col items-center gap-1 text-[16px] font-bold leading-[22px] text-ink tracking-tight tabular-nums">
      <span>EV {evRounded.toFixed(1)}</span>
      <span>{kRounded} K</span>
    </div>
  );
}
