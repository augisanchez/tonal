import { useState } from 'react';
import { useTonalStore } from '../store/useTonalStore';
import { APERTURE_STOPS, formatAperture } from '../data/exposureScales';
import { TickSlider } from './TickSlider';

export function ApertureSlider() {
  const aperture = useTonalStore((s) => s.aperture);
  const setAperture = useTonalStore((s) => s.setAperture);

  const currentIndex = APERTURE_STOPS.indexOf(aperture);
  const safeIndex = currentIndex >= 0 ? currentIndex : 5;
  const [scrub, setScrub] = useState<number | null>(null);

  const displayIndex = scrub != null ? Math.round(scrub) : safeIndex;
  const displayValue = APERTURE_STOPS[displayIndex] ?? APERTURE_STOPS[5];

  return (
    <div className="relative w-full flex items-center justify-center p-2">
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2">
        <TickSlider
          count={APERTURE_STOPS.length}
          index={safeIndex}
          onChange={(i) => {
            setScrub(null);
            setAperture(APERTURE_STOPS[i]);
          }}
          onScrub={setScrub}
        />
      </div>
      <div className="bg-white px-3 relative z-[1] flex items-baseline gap-1 text-[24px] leading-[22px] tracking-tight">
        <span className="italic font-serif">f</span>
        <span>{formatAperture(displayValue)}</span>
      </div>
    </div>
  );
}
