import { useState } from 'react';
import { useTonalStore } from '../store/useTonalStore';
import { APERTURE_STOPS, formatAperture } from '../data/exposureScales';
import { TickSlider } from './TickSlider';
import { AutoBadge } from './AutoBadge';

interface ApertureSliderProps {
  /** Effective aperture — either the user's locked value or the meter's recommendation. */
  effectiveValue: number;
  isAuto: boolean;
}

export function ApertureSlider({ effectiveValue, isAuto }: ApertureSliderProps) {
  const setAperture = useTonalStore((s) => s.setAperture);
  const setApertureLocked = useTonalStore((s) => s.setApertureLocked);

  const effectiveIndex = Math.max(0, APERTURE_STOPS.indexOf(effectiveValue));
  const [scrub, setScrub] = useState<number | null>(null);

  const displayIndex = scrub != null ? Math.round(scrub) : effectiveIndex;
  const displayValue = APERTURE_STOPS[displayIndex] ?? effectiveValue;

  return (
    <div className="relative w-full flex items-center justify-center p-2">
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2">
        <TickSlider
          count={APERTURE_STOPS.length}
          index={effectiveIndex}
          onChange={(i) => {
            setScrub(null);
            setAperture(APERTURE_STOPS[i]);
          }}
          onScrub={setScrub}
          onDoubleTap={() => setApertureLocked(false)}
        />
      </div>
      <div className="bg-white px-3 relative z-[1] flex items-baseline gap-1.5 text-[24px] leading-[22px] tracking-tight">
        {isAuto && <AutoBadge />}
        <span className="italic font-serif">f</span>
        <span className="tabular-nums">{formatAperture(displayValue)}</span>
      </div>
    </div>
  );
}
