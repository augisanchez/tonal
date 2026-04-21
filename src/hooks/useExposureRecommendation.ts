import { APERTURE_STOPS, SHUTTER_DENOMINATORS } from '../data/exposureScales';

export type ExposureMode = 'manual' | 'aperture-priority' | 'shutter-priority' | 'program' | 'idle';

export interface ExposureRecommendation {
  /** Effective aperture (locked value if user-set, else recommended). */
  aperture: number;
  /** Effective shutter denominator. */
  shutter: number;
  /** Effective ISO. */
  iso: number;
  /** Scene EV at the effective ISO. null when no scene data yet. */
  sceneEV: number | null;
  /** Scene EV adjusted for exposure compensation. */
  targetEV: number | null;
  /** EV produced by the user's current (effective) aperture + shutter. */
  userEV: number;
  /** Stops of under/over exposure (positive = user is underexposing). */
  deltaStops: number;
  mode: ExposureMode;
}

interface Args {
  aperture: number;
  shutter: number;
  iso: number;
  expComp: number;
  medianLog: number | null | undefined;
  apertureLocked: boolean;
  shutterLocked: boolean;
  isoLocked: boolean;
  availableISOs: number[];
}

// ── Calibration ─────────────────────────────────────────────────────────
// Scene EV for a middle-gray (18% reflectance) subject at ISO 100.
// A bright overcast day is ~EV 13; direct sun is EV 15; well-lit room is EV 7–9.
// We pick 12 as a middle anchor. Later we'll add a gray-card calibration tap.
const EV_ANCHOR_AT_ISO100 = 12;
const MIDDLE_GRAY_LINEAR = 0.18;
const LOG2_MIDDLE_GRAY = Math.log2(MIDDLE_GRAY_LINEAR); // ≈ -2.474

// Defaults for modes where a control is auto but no locked partner exists
const PROGRAM_DEFAULT_SHUTTER = 125;
// ────────────────────────────────────────────────────────────────────────

function snapNearestLog<T extends number>(values: readonly T[], target: number): T {
  let best = values[0];
  let bestDist = Infinity;
  for (const v of values) {
    const d = Math.abs(Math.log2(v / target));
    if (d < bestDist) {
      bestDist = d;
      best = v;
    }
  }
  return best;
}

export function computeExposureRecommendation(args: Args): ExposureRecommendation {
  const {
    aperture,
    shutter,
    iso,
    expComp,
    medianLog,
    apertureLocked,
    shutterLocked,
    isoLocked,
    availableISOs,
  } = args;

  const userEV = Math.log2(aperture * aperture * shutter);

  if (medianLog === null || medianLog === undefined || !Number.isFinite(medianLog)) {
    return {
      aperture,
      shutter,
      iso,
      sceneEV: null,
      targetEV: null,
      userEV,
      deltaStops: 0,
      mode: apertureLocked && shutterLocked ? 'manual' : 'idle',
    };
  }

  const sceneEVAt100 = EV_ANCHOR_AT_ISO100 + (medianLog - LOG2_MIDDLE_GRAY);

  // ISO used for scene-EV computation — either the locked ISO or a default if auto
  const effectiveIso = iso;
  const sceneEV = sceneEVAt100 + Math.log2(effectiveIso / 100);
  const targetEV = sceneEV - expComp;

  let recAperture = aperture;
  let recShutter = shutter;
  let recIso = iso;

  if (apertureLocked && shutterLocked) {
    // Manual. If ISO is auto, pick an ISO so user's EV matches target.
    if (!isoLocked) {
      // user_EV = sceneEVAt100 + log2(iso/100) - expComp
      // iso = 100 * 2^(user_EV - sceneEVAt100 + expComp)
      const idealIso = 100 * Math.pow(2, userEV - sceneEVAt100 + expComp);
      recIso = snapNearestLog(availableISOs, idealIso);
    }
  } else if (apertureLocked && !shutterLocked) {
    // Aperture priority: compute shutter denominator from target EV.
    // EV = log2(N² * denom) → denom = 2^EV / N²
    const denom = Math.pow(2, targetEV) / (aperture * aperture);
    recShutter = snapNearestLog(SHUTTER_DENOMINATORS, denom);
  } else if (!apertureLocked && shutterLocked) {
    // Shutter priority: compute aperture.
    // EV = log2(N² * denom) → N = sqrt(2^EV / denom)
    const N = Math.sqrt(Math.pow(2, targetEV) / shutter);
    recAperture = snapNearestLog(APERTURE_STOPS, N);
  } else {
    // Program: anchor shutter at 1/125 then pick aperture.
    recShutter = PROGRAM_DEFAULT_SHUTTER;
    const N = Math.sqrt(Math.pow(2, targetEV) / recShutter);
    recAperture = snapNearestLog(APERTURE_STOPS, N);
  }

  const finalEV = Math.log2(recAperture * recAperture * recShutter);
  const deltaStops = targetEV - finalEV;

  const mode: ExposureMode =
    apertureLocked && shutterLocked
      ? 'manual'
      : apertureLocked
        ? 'aperture-priority'
        : shutterLocked
          ? 'shutter-priority'
          : 'program';

  return {
    aperture: recAperture,
    shutter: recShutter,
    iso: recIso,
    sceneEV,
    targetEV,
    userEV,
    deltaStops,
    mode,
  };
}
