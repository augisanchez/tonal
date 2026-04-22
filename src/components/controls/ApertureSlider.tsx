import { useState } from 'react';
import { useTonalStore } from '../../store/useTonalStore';
import { APERTURE_STOPS, formatAperture } from '../../data/exposureScales';
import { ValueSliderRow } from './ValueSliderRow';

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
    <ValueSliderRow
      count={APERTURE_STOPS.length}
      index={effectiveIndex}
      onChange={(i) => {
        setScrub(null);
        setAperture(APERTURE_STOPS[i]);
      }}
      onScrub={setScrub}
      onDoubleTap={() => setApertureLocked(false)}
      isAuto={isAuto}
    >
      <span className="italic font-serif">f</span>
      <span className="tabular-nums">{formatAperture(displayValue)}</span>
    </ValueSliderRow>
  );
}
