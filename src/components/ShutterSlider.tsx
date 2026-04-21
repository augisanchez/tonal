import { useState } from 'react';
import { useTonalStore } from '../store/useTonalStore';
import { SHUTTER_DENOMINATORS, formatShutter } from '../data/exposureScales';
import { TickSlider } from './TickSlider';
import { AutoBadge } from './AutoBadge';

interface ShutterSliderProps {
  effectiveValue: number;
  isAuto: boolean;
}

export function ShutterSlider({ effectiveValue, isAuto }: ShutterSliderProps) {
  const setShutter = useTonalStore((s) => s.setShutter);
  const setShutterLocked = useTonalStore((s) => s.setShutterLocked);

  const effectiveIndex = Math.max(0, SHUTTER_DENOMINATORS.indexOf(effectiveValue));
  const [scrub, setScrub] = useState<number | null>(null);

  const displayIndex = scrub != null ? Math.round(scrub) : effectiveIndex;
  const displayValue = SHUTTER_DENOMINATORS[displayIndex] ?? effectiveValue;

  return (
    <div className="relative w-full flex items-center justify-center p-2">
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2">
        <TickSlider
          count={SHUTTER_DENOMINATORS.length}
          index={effectiveIndex}
          onChange={(i) => {
            setScrub(null);
            setShutter(SHUTTER_DENOMINATORS[i]);
          }}
          onScrub={setScrub}
          onDoubleTap={() => setShutterLocked(false)}
        />
      </div>
      <div className="bg-white px-3 relative z-[1] flex items-baseline gap-1.5 text-[24px] leading-[22px] tracking-tight">
        {isAuto && <AutoBadge />}
        <span className="tabular-nums">{formatShutter(displayValue)}</span>
      </div>
    </div>
  );
}
