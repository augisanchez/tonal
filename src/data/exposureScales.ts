export const APERTURE_STOPS = [1, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];

export const SHUTTER_DENOMINATORS = [1, 2, 4, 8, 15, 30, 60, 125, 250, 500, 1000, 2000, 4000];

export function formatAperture(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1);
}

export function formatShutter(denom: number): string {
  if (denom <= 1) return `${Math.round(1 / denom) || 1}s`;
  return `1/${denom}`;
}

/** Snap a raw index (possibly fractional) to the closest value in an array. */
export function snapToArray<T>(arr: T[], index: number): number {
  return Math.max(0, Math.min(arr.length - 1, Math.round(index)));
}

/** 1/3-stop exposure compensation scale from -3 to +3 (19 positions). */
export const EXP_COMP_STEPS = Array.from({ length: 19 }, (_, i) => -3 + i / 3);

export function formatExpComp(v: number): string {
  if (Math.abs(v) < 0.01) return '0';
  const sign = v > 0 ? '+' : '−';
  const abs = Math.abs(v);
  const whole = Math.floor(abs + 1e-6);
  const frac = abs - whole;
  let fracStr = '';
  if (Math.abs(frac - 1 / 3) < 0.05) fracStr = '⅓';
  else if (Math.abs(frac - 2 / 3) < 0.05) fracStr = '⅔';
  if (whole === 0) return `${sign}${fracStr}`;
  return `${sign}${whole}${fracStr}`;
}
