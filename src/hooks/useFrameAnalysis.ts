import { useEffect, useRef, useState, type RefObject } from 'react';
import type { FilmStock, ZoneMarker } from '../types';
import { ZONE_LABELS } from '../data/filmStocks';

export interface FrameAnalysis {
  /** Zone markers with smoothed x/y centroids (normalized 0-1 within the visible preview). */
  zones: ZoneMarker[];
  /** Per-cell zone number (0–10), row-major, length = gridW * gridH. -1 = no data. */
  cellZones: Int8Array;
  gridW: number;
  gridH: number;
  /** Scene dynamic range — 2nd to 98th percentile spread, in stops. */
  sceneDRStops: number;
  /** Minimum and maximum cell zones present (clamped). */
  minZone: number;
  maxZone: number;
  /** Rough Kelvin estimate, rounded to nearest 100K. */
  kelvin: number;
}

function estimateKelvin(r: number, b: number): number {
  if (b <= 0) return 5500;
  const ratio = r / b;
  if (ratio > 1.8) return 2700;
  if (ratio > 1.4) return 3200;
  if (ratio > 1.1) return 4000;
  if (ratio > 0.9) return 5500;
  if (ratio > 0.75) return 6500;
  return 8000;
}

interface Args {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isReady: boolean;
  /** Aspect ratio of the visible preview (w/h). */
  containerAspect: number;
  /** CSS zoom applied to the video (>=1). */
  zoom: number;
  film: FilmStock;
  expComp: number;
  /** When false, analysis is paused (e.g. tab hidden). */
  active?: boolean;
}

const GRID_W = 48;
const GRID_H = 32;
const CELL_COUNT = GRID_W * GRID_H;
const CANVAS_W = 192;
const CANVAS_H = 128;
const CELL_PX_W = CANVAS_W / GRID_W; // 4
const CELL_PX_H = CANVAS_H / GRID_H; // 4
const TARGET_FPS = 15;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
const EMA_ALPHA = 0.25;
const MIN_CELL_FRACTION = 0.003; // a zone must occupy ≥0.3% of cells to show a marker

function srgbToLinear(v: number): number {
  // Fast sRGB inverse-gamma approximation (Rec. sRGB piecewise → simple pow 2.2 is close enough here)
  return Math.pow(v, 2.2);
}

export function useFrameAnalysis({
  videoRef,
  canvasRef,
  isReady,
  containerAspect,
  zoom,
  film,
  expComp,
  active = true,
}: Args): FrameAnalysis | null {
  const [state, setState] = useState<FrameAnalysis | null>(null);
  const smoothedPosRef = useRef<Map<number, { x: number; y: number }>>(new Map());

  // Persistent buffers to avoid per-frame allocations
  const buffersRef = useRef({
    lumaLinear: new Float32Array(CELL_COUNT),
    logLuma: new Float32Array(CELL_COUNT),
    cellZones: new Int8Array(CELL_COUNT),
  });

  // Reset smoothed positions when film or expComp changes meaningfully
  useEffect(() => {
    smoothedPosRef.current.clear();
  }, [film.id, Math.round(expComp * 3)]);

  useEffect(() => {
    if (!isReady || !active) {
      // leave state as-is so markers stay in their last position rather than popping away
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let rafId = 0;
    let lastTs = 0;
    let cancelled = false;

    const tick = (ts: number) => {
      if (cancelled) return;
      rafId = requestAnimationFrame(tick);
      if (ts - lastTs < FRAME_INTERVAL) return;
      lastTs = ts;

      if (video.readyState < 2) return;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;

      // Compute visible source rect inside the video frame, matching the
      // `object-fit: cover` crop plus the zoom transform applied in CSS.
      const videoAspect = vw / vh;
      let srcW: number;
      let srcH: number;
      let srcX: number;
      let srcY: number;
      if (videoAspect > containerAspect) {
        // Video is wider — cropped horizontally
        srcH = vh;
        srcW = vh * containerAspect;
        srcX = (vw - srcW) / 2;
        srcY = 0;
      } else {
        srcW = vw;
        srcH = vw / containerAspect;
        srcX = 0;
        srcY = (vh - srcH) / 2;
      }
      // Apply zoom (central crop)
      const zw = srcW / zoom;
      const zh = srcH / zoom;
      srcX += (srcW - zw) / 2;
      srcY += (srcH - zh) / 2;
      srcW = zw;
      srcH = zh;

      try {
        ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, CANVAS_W, CANVAS_H);
      } catch {
        return;
      }

      let frame: ImageData;
      try {
        frame = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
      } catch {
        // Tainted canvas — e.g. camera access revoked mid-frame
        return;
      }
      const data = frame.data;

      const { lumaLinear, logLuma, cellZones } = buffersRef.current;

      // Global R/G/B sums for Kelvin estimation
      let rGlobal = 0;
      let gGlobal = 0;
      let bGlobal = 0;
      let nGlobal = 0;

      // Per-cell average luminance (linear, sRGB-gamma-inverted)
      for (let cy = 0; cy < GRID_H; cy++) {
        for (let cx = 0; cx < GRID_W; cx++) {
          let rSum = 0;
          let gSum = 0;
          let bSum = 0;
          let n = 0;
          const startX = cx * CELL_PX_W;
          const startY = cy * CELL_PX_H;
          for (let py = 0; py < CELL_PX_H; py++) {
            const row = (startY + py) * CANVAS_W;
            for (let px = 0; px < CELL_PX_W; px++) {
              const idx = (row + startX + px) * 4;
              rSum += data[idx];
              gSum += data[idx + 1];
              bSum += data[idx + 2];
              n++;
            }
          }
          rGlobal += rSum;
          gGlobal += gSum;
          bGlobal += bSum;
          nGlobal += n;

          const r = rSum / n / 255;
          const g = gSum / n / 255;
          const b = bSum / n / 255;
          const rLin = srgbToLinear(r);
          const gLin = srgbToLinear(g);
          const bLin = srgbToLinear(b);
          // Rec. 709 luma
          const y = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
          lumaLinear[cy * GRID_W + cx] = y;
        }
      }

      const kelvin =
        nGlobal > 0
          ? estimateKelvin(rGlobal / nGlobal, bGlobal / nGlobal)
          : 5500;
      // gGlobal collected but unused — kept to avoid a second pass if we later want G-channel features.
      void gGlobal;

      // Log-median + percentiles for scene DR
      let valid = 0;
      for (let i = 0; i < CELL_COUNT; i++) {
        const L = lumaLinear[i];
        if (L > 1e-5) {
          logLuma[valid++] = Math.log2(L);
        }
      }
      if (valid < CELL_COUNT * 0.05) return; // too dark / not enough signal

      // Copy + sort (small array, Array.sort is fine)
      const sorted = Array.from(logLuma.subarray(0, valid)).sort((a, b) => a - b);
      const medianLog = sorted[Math.floor(valid / 2)];
      const p02 = sorted[Math.floor(valid * 0.02)];
      const p98 = sorted[Math.floor(valid * 0.98)];
      const sceneDRStops = Math.max(0, p98 - p02);

      // Assign each cell a zone using scene-median = Zone V + exp-comp bias
      // cell_zone = round(5 + log2(luma/median) + expComp)
      let minCellZone = 10;
      let maxCellZone = 0;
      for (let i = 0; i < CELL_COUNT; i++) {
        const L = lumaLinear[i];
        if (L <= 1e-5) {
          cellZones[i] = -1;
          continue;
        }
        const stops = Math.log2(L) - medianLog;
        let z = Math.round(5 + stops + expComp);
        if (z < 0) z = 0;
        else if (z > 10) z = 10;
        cellZones[i] = z;
        if (z < minCellZone) minCellZone = z;
        if (z > maxCellZone) maxCellZone = z;
      }

      // Zones to display: the film's usable range, plus one on each side so we can
      // visualize "near clipping" markers. Markers outside [minZone, maxZone] get the clipping flag.
      const zonePad = 1;
      const zMin = Math.max(1, film.minZone - zonePad);
      const zMax = Math.min(10, film.maxZone + zonePad);

      const markers: ZoneMarker[] = [];
      const livePositions = new Map<number, { x: number; y: number }>();

      const minCells = CELL_COUNT * MIN_CELL_FRACTION;

      for (let z = zMin; z <= zMax; z++) {
        let xSum = 0;
        let ySum = 0;
        let n = 0;
        for (let i = 0; i < CELL_COUNT; i++) {
          if (cellZones[i] === z) {
            xSum += i % GRID_W;
            ySum += (i / GRID_W) | 0;
            n++;
          }
        }
        if (n < minCells) continue;

        const rawX = (xSum / n + 0.5) / GRID_W;
        const rawY = (ySum / n + 0.5) / GRID_H;

        const prev = smoothedPosRef.current.get(z);
        const sx = prev ? prev.x * (1 - EMA_ALPHA) + rawX * EMA_ALPHA : rawX;
        const sy = prev ? prev.y * (1 - EMA_ALPHA) + rawY * EMA_ALPHA : rawY;

        livePositions.set(z, { x: sx, y: sy });

        const isClipping = z < film.minZone || z > film.maxZone;

        markers.push({
          zone: z,
          label: ZONE_LABELS[z] ?? String(z),
          x: sx,
          y: sy,
          isClipping,
          isActive: true,
        });
      }

      // Cull stale smoothed positions so disappearing zones start fresh next time
      smoothedPosRef.current = livePositions;

      // Build a snapshot copy of cellZones for state (buffer is reused next frame)
      const cellZonesSnapshot = new Int8Array(cellZones);

      setState({
        zones: markers,
        cellZones: cellZonesSnapshot,
        gridW: GRID_W,
        gridH: GRID_H,
        sceneDRStops,
        minZone: minCellZone,
        maxZone: maxCellZone,
        kelvin,
      });
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [videoRef, canvasRef, isReady, containerAspect, zoom, film, expComp, active]);

  return state;
}
