import { useState } from 'react';
import { useTonalStore } from '../../store/useTonalStore';
import { SHUTTER_DENOMINATORS, formatShutter } from '../../data/exposureScales';
import { ValueSliderRow } from './ValueSliderRow';

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
    <ValueSliderRow
      count={SHUTTER_DENOMINATORS.length}
      index={effectiveIndex}
      onChange={(i) => {
        setScrub(null);
        setShutter(SHUTTER_DENOMINATORS[i]);
      }}
      onScrub={setScrub}
      onDoubleTap={() => setShutterLocked(false)}
      isAuto={isAuto}
    >
      <span className="tabular-nums">{formatShutter(displayValue)}</span>
    </ValueSliderRow>
  );
}
