import { useEffect, useRef } from 'react';
import type { FrameAnalysis } from '../../hooks/useFrameAnalysis';

interface FalseColorOverlayProps {
  analysis: FrameAnalysis | null;
  active: boolean;
}

// Zone-keyed palette: shadows → cool, midtone → neutral, highlights → warm.
// Saved as RGBA tuples so we can fill the ImageData buffer directly.
const ZONE_PALETTE: Array<[number, number, number, number]> = [
  [42, 26, 74, 130], // 0 — deep purple (deepest shadow)
  [38, 64, 130, 130], // 1
  [52, 110, 180, 120], // 2 — blue
  [62, 160, 186, 115], // 3 — cyan
  [74, 176, 112, 108], // 4 — green
  [150, 150, 150, 90], // 5 — neutral gray (midtone)
  [212, 180, 64, 115], // 6 — yellow
  [228, 126, 32, 125], // 7 — orange
  [212, 56, 38, 135], // 8 — red
  [224, 72, 160, 140], // 9 — magenta
  [250, 250, 250, 150], // 10 — white (blown)
];

export function FalseColorOverlay({ analysis, active }: FalseColorOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!active || !analysis) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const { cellZones, gridW, gridH } = analysis;
    if (canvas.width !== gridW || canvas.height !== gridH) {
      canvas.width = gridW;
      canvas.height = gridH;
    }

    const imageData = ctx.createImageData(gridW, gridH);
    const data = imageData.data;

    for (let i = 0; i < cellZones.length; i++) {
      const z = cellZones[i];
      const idx = i * 4;
      if (z < 0 || z > 10) continue;
      const [r, g, b, a] = ZONE_PALETTE[z];
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = a;
    }

    ctx.putImageData(imageData, 0, 0);
  }, [analysis, active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ imageRendering: 'auto' }}
      aria-hidden
    />
  );
}
