/** EV = log2(N² / t) where N is f-number, t is exposure time in seconds. */
export function calculateEV(aperture: number, shutterDenominator: number): number {
  if (shutterDenominator <= 0) return 0;
  const t = 1 / shutterDenominator;
  return Math.log2((aperture * aperture) / t);
}

export function formatEV(ev: number): string {
  const rounded = Math.round(ev * 10) / 10;
  return `EV ${rounded.toFixed(1)}`;
}
