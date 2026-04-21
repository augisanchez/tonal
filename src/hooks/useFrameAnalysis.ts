import { useEffect, useRef, useState, type RefObject } from 'react';
import type { FilmStock, ZoneMarker } from '../types';
import { ZONE_LABELS } from '../data/filmStocks';

export interface FrameAnalysis {
  /** Zone markers with snap-gridded x/y positions (normalized 0–1 within the visible preview). */
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

interface Args {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isReady: boolean;
  containerAspect: number;
  zoom: number;
  film: FilmStock;
  expComp: number;
  active?: boolean;
}

// ── Tunables ────────────────────────────────────────────────────────────
const GRID_W = 24;
const GRID_H = 16;
const CELL_COUNT = GRID_W * GRID_H; // 384
const CANVAS_W = 192;
const CANVAS_H = 128;
const CELL_PX_W = CANVAS_W / GRID_W; // 8
const CELL_PX_H = CANVAS_H / GRID_H; // 8
const TARGET_FPS = 15;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
/** Min blob size for a zone to be shown, as a fraction of total cells. */
const MIN_COMPONENT_FRACTION = 0.015;
const MIN_COMPONENT_CELLS = Math.max(6, Math.floor(CELL_COUNT * MIN_COMPONENT_FRACTION));
/** Snap grid resolution — marker can land at (SNAP_COLS * SNAP_ROWS) discrete spots. */
const SNAP_COLS = 6;
const SNAP_ROWS = 4;
/** Max commit rate when only snap-position changes (zone set changes commit immediately). */
const COMMIT_INTERVAL_MS = 500;
/** A tracked blob stays selected unless a competing blob is this much larger. */
const SWITCH_BLOB_THRESHOLD = 1.4;
// ────────────────────────────────────────────────────────────────────────

function srgbToLinear(v: number): number {
  return Math.pow(v, 2.2);
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

interface Component {
  count: number;
  xSum: number;
  ySum: number;
}

/** 8-connectivity flood fill over cells matching targetZone. Uses the shared labels buffer. */
function findComponents(
  cellZones: Int8Array,
  labels: Int16Array,
  targetZone: number,
): Component[] {
  labels.fill(0);
  const components: Component[] = [];
  let nextLabel = 1;
  // Reuse a stack across BFS runs
  const stack: number[] = [];

  for (let i = 0; i < CELL_COUNT; i++) {
    if (cellZones[i] !== targetZone || labels[i] !== 0) continue;

    stack.length = 0;
    stack.push(i);
    labels[i] = nextLabel;
    let count = 0;
    let xSum = 0;
    let ySum = 0;

    while (stack.length > 0) {
      const idx = stack.pop()!;
      const cx = idx % GRID_W;
      const cy = (idx - cx) / GRID_W;
      count++;
      xSum += cx;
      ySum += cy;

      for (let dy = -1; dy <= 1; dy++) {
        const ny = cy + dy;
        if (ny < 0 || ny >= GRID_H) continue;
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = cx + dx;
          if (nx < 0 || nx >= GRID_W) continue;
          const nIdx = ny * GRID_W + nx;
          if (cellZones[nIdx] !== targetZone || labels[nIdx] !== 0) continue;
          labels[nIdx] = nextLabel;
          stack.push(nIdx);
        }
      }
    }

    components.push({ count, xSum, ySum });
    nextLabel++;
  }

  return components;
}

function snapX(rawX: number): number {
  const col = Math.max(0, Math.min(SNAP_COLS - 1, Math.floor(rawX * SNAP_COLS)));
  return (col + 0.5) / SNAP_COLS;
}
function snapY(rawY: number): number {
  const row = Math.max(0, Math.min(SNAP_ROWS - 1, Math.floor(rawY * SNAP_ROWS)));
  return (row + 0.5) / SNAP_ROWS;
}

interface ZoneLock {
  snapX: number;
  snapY: number;
  rawX: number;
  rawY: number;
  count: number;
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

  const zoneLocksRef = useRef<Map<number, ZoneLock>>(new Map());
  const lastCommitRef = useRef(0);

  const buffersRef = useRef({
    lumaLinear: new Float32Array(CELL_COUNT),
    logLuma: new Float32Array(CELL_COUNT),
    cellZones: new Int8Array(CELL_COUNT),
    labels: new Int16Array(CELL_COUNT),
  });

  // Reset zone locks when film or a whole-stop exp-comp change happens —
  // the target zone set may have shifted and old positions become meaningless.
  useEffect(() => {
    zoneLocksRef.current.clear();
    lastCommitRef.current = 0;
  }, [film.id, Math.round(expComp)]);

  useEffect(() => {
    if (!isReady || !active) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let rafId = 0;
    let lastFrameTs = 0;
    let cancelled = false;

    const tick = (ts: number) => {
      if (cancelled) return;
      rafId = requestAnimationFrame(tick);
      if (ts - lastFrameTs < FRAME_INTERVAL) return;
      lastFrameTs = ts;

      if (video.readyState < 2) return;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;

      // Match object-fit: cover + CSS zoom crop
      const videoAspect = vw / vh;
      let srcW: number;
      let srcH: number;
      let srcX: number;
      let srcY: number;
      if (videoAspect > containerAspect) {
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
        return;
      }
      const data = frame.data;
      const { lumaLinear, logLuma, cellZones, labels } = buffersRef.current;

      // Per-cell averages + global R/B sums for Kelvin
      let rGlobal = 0;
      let bGlobal = 0;
      let nGlobal = 0;

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
          bGlobal += bSum;
          nGlobal += n;

          const r = rSum / n / 255;
          const g = gSum / n / 255;
          const b = bSum / n / 255;
          const y =
            0.2126 * srgbToLinear(r) +
            0.7152 * srgbToLinear(g) +
            0.0722 * srgbToLinear(b);
          lumaLinear[cy * GRID_W + cx] = y;
        }
      }

      const kelvin =
        nGlobal > 0 ? estimateKelvin(rGlobal / nGlobal, bGlobal / nGlobal) : 5500;

      // Log-median + percentile DR
      let valid = 0;
      for (let i = 0; i < CELL_COUNT; i++) {
        const L = lumaLinear[i];
        if (L > 1e-5) logLuma[valid++] = Math.log2(L);
      }
      if (valid < CELL_COUNT * 0.05) return;

      const sorted = Array.from(logLuma.subarray(0, valid)).sort((a, b) => a - b);
      const medianLog = sorted[Math.floor(valid / 2)];
      const p02 = sorted[Math.floor(valid * 0.02)];
      const p98 = sorted[Math.floor(valid * 0.98)];
      const sceneDRStops = Math.max(0, p98 - p02);

      // Cell zones: Zone V at scene median, shifted by exp-comp
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

      // Zones we consider: film's usable range ± 1 so we can show "near clipping" markers.
      const zMin = Math.max(1, film.minZone - 1);
      const zMax = Math.min(10, film.maxZone + 1);

      // Compute candidate (snap-gridded) positions for each zone.
      type Candidate = { z: number; snapX: number; snapY: number; rawX: number; rawY: number; count: number };
      const candidates: Candidate[] = [];

      for (let z = zMin; z <= zMax; z++) {
        const components = findComponents(cellZones, labels, z);
        if (components.length === 0) continue;

        // Filter to components that are big enough
        const valid = components.filter((c) => c.count >= MIN_COMPONENT_CELLS);
        if (valid.length === 0) continue;

        // Pick dominant blob with tracking continuity: if we already track a blob
        // for this zone, prefer the component closest to that position unless a
        // competing blob is substantially larger.
        let chosen = valid[0];
        for (let j = 1; j < valid.length; j++) {
          if (valid[j].count > chosen.count) chosen = valid[j];
        }

        const prev = zoneLocksRef.current.get(z);
        if (prev) {
          // Find the component nearest to the previously locked position (raw, not snapped)
          const prevX = prev.rawX * GRID_W;
          const prevY = prev.rawY * GRID_H;
          let nearest = valid[0];
          let nearestDist = Infinity;
          for (const c of valid) {
            const cx = c.xSum / c.count;
            const cy = c.ySum / c.count;
            const dx = cx - prevX;
            const dy = cy - prevY;
            const d = dx * dx + dy * dy;
            if (d < nearestDist) {
              nearestDist = d;
              nearest = c;
            }
          }
          // Stick with nearest unless a competing blob is clearly larger
          if (chosen.count <= nearest.count * SWITCH_BLOB_THRESHOLD) {
            chosen = nearest;
          }
        }

        const rawX = (chosen.xSum / chosen.count + 0.5) / GRID_W;
        const rawY = (chosen.ySum / chosen.count + 0.5) / GRID_H;
        candidates.push({
          z,
          snapX: snapX(rawX),
          snapY: snapY(rawY),
          rawX,
          rawY,
          count: chosen.count,
        });
      }

      // Diff candidates vs. committed locks to decide whether to re-render
      const locks = zoneLocksRef.current;
      const candidateZones = new Set(candidates.map((c) => c.z));

      let zoneSetChanged = false;
      let snapPosChanged = false;

      for (const c of candidates) {
        const prev = locks.get(c.z);
        if (!prev) {
          zoneSetChanged = true;
          break;
        }
        if (prev.snapX !== c.snapX || prev.snapY !== c.snapY) {
          snapPosChanged = true;
        }
      }
      if (!zoneSetChanged) {
        for (const z of locks.keys()) {
          if (!candidateZones.has(z)) {
            zoneSetChanged = true;
            break;
          }
        }
      }

      const now = performance.now();
      const throttleOK = now - lastCommitRef.current >= COMMIT_INTERVAL_MS;

      if (!zoneSetChanged && !snapPosChanged) return;
      if (!zoneSetChanged && !throttleOK) return;

      // Commit: update locks and emit state
      const newLocks = new Map<number, ZoneLock>();
      for (const c of candidates) {
        newLocks.set(c.z, {
          snapX: c.snapX,
          snapY: c.snapY,
          rawX: c.rawX,
          rawY: c.rawY,
          count: c.count,
        });
      }
      zoneLocksRef.current = newLocks;
      lastCommitRef.current = now;

      const markers: ZoneMarker[] = candidates.map((c) => ({
        zone: c.z,
        label: ZONE_LABELS[c.z] ?? String(c.z),
        x: c.snapX,
        y: c.snapY,
        isClipping: c.z < film.minZone || c.z > film.maxZone,
        isActive: true,
      }));

      setState({
        zones: markers,
        cellZones: new Int8Array(cellZones),
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
