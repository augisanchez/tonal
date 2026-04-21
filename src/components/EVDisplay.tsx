import type { ExposureMode } from '../hooks/useExposureRecommendation';

interface EVDisplayProps {
  kelvin: number;
  sceneDRStops: number | null;
  filmDRStops: number;
  sceneEV: number | null;
  deltaStops: number;
  mode: ExposureMode;
}

const MODE_LABEL: Record<ExposureMode, string> = {
  manual: 'M',
  'aperture-priority': 'Av',
  'shutter-priority': 'Tv',
  program: 'P',
  idle: '—',
};

function formatStopsDelta(d: number): string {
  if (Math.abs(d) < 0.05) return '±0';
  const sign = d > 0 ? '+' : '−';
  return `${sign}${Math.abs(d).toFixed(1)}`;
}

export function EVDisplay({
  kelvin,
  sceneDRStops,
  filmDRStops,
  sceneEV,
  deltaStops,
  mode,
}: EVDisplayProps) {
  const kRounded = Math.round(kelvin / 100) * 100;
  const drRounded = sceneDRStops != null ? Math.round(sceneDRStops * 10) / 10 : null;
  const drOver = drRounded != null ? drRounded > filmDRStops + 0.25 : false;

  const evLabel = sceneEV != null ? `EV ${(Math.round(sceneEV * 10) / 10).toFixed(1)}` : 'EV —';

  return (
    <div className="flex flex-col items-center gap-0.5 text-ink tracking-tight tabular-nums">
      <div className="flex items-baseline gap-1.5">
        <span className="text-[10px] font-bold text-ink-soft tracking-[0.1em]">
          {MODE_LABEL[mode]}
        </span>
        <span className="text-[16px] font-bold leading-[22px]">{evLabel}</span>
      </div>
      <span className="text-[16px] font-bold leading-[22px]">{kRounded} K</span>

      {mode === 'manual' && sceneEV != null && (
        <span
          className={`text-[11px] leading-[14px] font-semibold mt-0.5 ${
            Math.abs(deltaStops) < 0.5
              ? 'text-ink-soft'
              : 'text-[color:var(--color-warning)]'
          }`}
        >
          {formatStopsDelta(deltaStops)} EV
        </span>
      )}

      {drRounded != null && mode !== 'manual' && (
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
