import { useState } from 'react';
import { useTonalStore } from '../store/useTonalStore';
import { EXP_COMP_STEPS, formatExpComp } from '../data/exposureScales';
import { TickSlider } from './TickSlider';

function nearestIndex(v: number): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < EXP_COMP_STEPS.length; i++) {
    const d = Math.abs(EXP_COMP_STEPS[i] - v);
    if (d < bestDist) {
      best = i;
      bestDist = d;
    }
  }
  return best;
}

const ZERO_INDEX = nearestIndex(0);

export function ExpCompSlider() {
  const expComp = useTonalStore((s) => s.expComp);
  const setExpComp = useTonalStore((s) => s.setExpComp);

  const idx = nearestIndex(expComp);
  const [scrub, setScrub] = useState<number | null>(null);
  const displayIndex = scrub != null ? Math.round(scrub) : idx;
  const displayValue = EXP_COMP_STEPS[displayIndex] ?? 0;

  const step = (delta: number) => {
    const next = Math.max(0, Math.min(EXP_COMP_STEPS.length - 1, idx + delta));
    setExpComp(EXP_COMP_STEPS[next]);
  };

  return (
    <div className="w-full flex flex-col items-center gap-1 py-1">
      <div className="flex items-center justify-between w-[360px] text-[14px] font-semibold leading-[22px] tracking-tight">
        <button
          aria-label="Decrease exposure compensation"
          onClick={() => step(-1)}
          className="w-6 h-6 flex items-center justify-center text-ink"
        >
          −
        </button>
        <span className="tabular-nums">{formatExpComp(displayValue)}</span>
        <button
          aria-label="Increase exposure compensation"
          onClick={() => step(1)}
          className="w-6 h-6 flex items-center justify-center text-ink"
        >
          +
        </button>
      </div>
      <div className="w-[350px]">
        <TickSlider
          count={EXP_COMP_STEPS.length}
          index={idx}
          onChange={(i) => {
            setScrub(null);
            setExpComp(EXP_COMP_STEPS[i]);
          }}
          onScrub={setScrub}
          onDoubleTap={() => setExpComp(EXP_COMP_STEPS[ZERO_INDEX])}
          showCenterMarker
        />
      </div>
    </div>
  );
}
