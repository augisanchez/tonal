import type { ExposureMode } from '../hooks/useExposureRecommendation';

interface EVDisplayProps {
  kelvin: number;
  sceneDRStops: number | null;
  filmDRStops: number;
  sceneEV: number | null;
  deltaStops: number;
  mode: ExposureMode;
  isCalibrated: boolean;
  canCalibrate: boolean;
  onToggleCalibration: () => void;
  isSpotModeActive: boolean;
  onToggleSpotMode: () => void;
  isFalseColorActive: boolean;
  onToggleFalseColor: () => void;
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
  isCalibrated,
  canCalibrate,
  onToggleCalibration,
  isSpotModeActive,
  onToggleSpotMode,
  isFalseColorActive,
  onToggleFalseColor,
}: EVDisplayProps) {
  const kRounded = Math.round(kelvin / 100) * 100;
  const drRounded = sceneDRStops != null ? Math.round(sceneDRStops * 10) / 10 : null;
  const drOver = drRounded != null ? drRounded > filmDRStops + 0.25 : false;

  const evLabel =
    sceneEV != null ? `EV ${(Math.round(sceneEV * 10) / 10).toFixed(1)}` : 'EV —';

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

      <div className="flex items-center gap-1 mt-1">
        <button
          type="button"
          onClick={onToggleCalibration}
          disabled={!canCalibrate && !isCalibrated}
          aria-pressed={isCalibrated}
          aria-label={isCalibrated ? 'Clear calibration' : 'Calibrate to current scene (point at 18% gray)'}
          className={`text-[9px] font-bold tracking-[0.1em] uppercase px-1.5 py-1 rounded-full leading-none transition-colors ${
            isCalibrated
              ? 'bg-accent/15 text-[color:var(--color-accent)]'
              : canCalibrate
                ? 'bg-grey-100 text-ink-soft active:bg-grey-200'
                : 'bg-grey-100/50 text-grey-300'
          }`}
        >
          {isCalibrated ? 'CAL •' : 'CAL'}
        </button>
        <button
          type="button"
          onClick={onToggleSpotMode}
          aria-pressed={isSpotModeActive}
          aria-label={isSpotModeActive ? 'Exit spot meter' : 'Enter spot meter mode'}
          className={`text-[9px] font-bold tracking-[0.1em] uppercase px-1.5 py-1 rounded-full leading-none transition-colors ${
            isSpotModeActive
              ? 'bg-accent/15 text-[color:var(--color-accent)]'
              : 'bg-grey-100 text-ink-soft active:bg-grey-200'
          }`}
        >
          SPOT
        </button>
        <button
          type="button"
          onClick={onToggleFalseColor}
          aria-pressed={isFalseColorActive}
          aria-label={isFalseColorActive ? 'Hide false color overlay' : 'Show false color overlay'}
          className={`text-[9px] font-bold tracking-[0.1em] uppercase px-1.5 py-1 rounded-full leading-none transition-colors ${
            isFalseColorActive
              ? 'bg-accent/15 text-[color:var(--color-accent)]'
              : 'bg-grey-100 text-ink-soft active:bg-grey-200'
          }`}
        >
          FC
        </button>
      </div>
    </div>
  );
}
