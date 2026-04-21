import type { FilmStock, ZoneMarker } from '../types';
import { ZONE_LABELS } from '../data/filmStocks';
import type { FrameAnalysis } from './useFrameAnalysis';

/** Fallback positions used when the camera hasn't produced an analysis yet —
 *  the app still looks alive on first load while the feed boots up. */
const FALLBACK_POSITIONS: Record<number, { x: number; y: number }> = {
  3: { x: 0.18, y: 0.62 },
  4: { x: 0.42, y: 0.72 },
  5: { x: 0.64, y: 0.8 },
  7: { x: 0.78, y: 0.36 },
  8: { x: 0.35, y: 0.28 },
};

export function deriveZoneMarkers(
  film: FilmStock,
  expComp: number,
  analysis: FrameAnalysis | null,
): ZoneMarker[] {
  if (analysis) return analysis.zones;

  // Pre-camera fallback: show the film's usable core zones at demo positions.
  const fallback: ZoneMarker[] = [];
  for (const zStr of Object.keys(FALLBACK_POSITIONS)) {
    const z = Number(zStr);
    if (z < film.minZone - 1 || z > film.maxZone + 1) continue;
    const isClipping = z < film.minZone || z > film.maxZone;
    fallback.push({
      zone: z,
      label: ZONE_LABELS[z] ?? String(z),
      ...FALLBACK_POSITIONS[z],
      isClipping,
      isActive: true,
    });
  }
  // Suppress unused-var lint: expComp informs future logic but isn't needed for fallback positions.
  void expComp;
  return fallback;
}
