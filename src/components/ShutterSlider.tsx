import { useState } from 'react';
import { useTonalStore } from '../store/useTonalStore';
import { SHUTTER_DENOMINATORS, formatShutter } from '../data/exposureScales';
import { TickSlider } from './TickSlider';

export function ShutterSlider() {
  const shutter = useTonalStore((s) => s.shutter);
  const setShutter = useTonalStore((s) => s.setShutter);

  const idx = SHUTTER_DENOMINATORS.indexOf(shutter);
  const safeIndex = idx >= 0 ? idx : SHUTTER_DENOMINATORS.indexOf(500);
  const [scrub, setScrub] = useState<number | null>(null);

  const displayIndex = scrub != null ? Math.round(scrub) : safeIndex;
  const displayValue = SHUTTER_DENOMINATORS[displayIndex];

  return (
    <div className="relative w-full flex items-center justify-center p-2">
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2">
        <TickSlider
          count={SHUTTER_DENOMINATORS.length}
          index={safeIndex}
          onChange={(i) => {
            setScrub(null);
            setShutter(SHUTTER_DENOMINATORS[i]);
          }}
          onScrub={setScrub}
        />
      </div>
      <div className="bg-white px-3 relative z-[1] text-[24px] leading-[22px] tracking-tight">
        {formatShutter(displayValue)}
      </div>
    </div>
  );
}
