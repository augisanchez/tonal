import type { ReactNode } from 'react';
import { TickSlider } from './TickSlider';
import { AutoBadge } from '../primitives';

interface ValueSliderRowProps {
  /** Number of tick positions on the scale. */
  count: number;
  /** Visual index the track should sit at. */
  index: number;
  onChange: (index: number) => void;
  onScrub?: (index: number) => void;
  onDoubleTap?: () => void;
  /** Whether the displayed value is the meter's auto recommendation (shows AUTO badge). */
  isAuto?: boolean;
  /** The value label rendered over the track — e.g. "f 5.6", "1/500", "ISO 400". */
  children: ReactNode;
}

/** Shared layout for aperture / shutter / ISO slider rows: tick track behind,
 *  value label centered on a white chip, optional AUTO badge, symmetric padding. */
export function ValueSliderRow({
  count,
  index,
  onChange,
  onScrub,
  onDoubleTap,
  isAuto = false,
  children,
}: ValueSliderRowProps) {
  return (
    <div className="relative w-full flex items-center justify-center p-2">
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2">
        <TickSlider
          count={count}
          index={index}
          onChange={onChange}
          onScrub={onScrub}
          onDoubleTap={onDoubleTap}
        />
      </div>
      <div className="bg-white px-3 relative z-[1] flex items-baseline gap-1.5 text-[24px] leading-[22px] tracking-tight">
        {isAuto && <AutoBadge />}
        {children}
      </div>
    </div>
  );
}
