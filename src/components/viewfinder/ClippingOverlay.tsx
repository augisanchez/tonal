import { useEffect, useRef } from 'react';
import type { FrameAnalysis } from '../../hooks/useFrameAnalysis';

interface ClippingOverlayProps {
  analysis: FrameAnalysis | null;
  minZone: number;
  maxZone: number;
  showShadow: boolean;
  showHighlight: boolean;
}

const SHADOW_COLOR = 'rgba(45, 90, 230, 0.38)';
const HIGHLIGHT_COLOR = 'rgba(230, 70, 70, 0.4)';

export function ClippingOverlay({
  analysis,
  minZone,
  maxZone,
  showShadow,
  showHighlight,
}: ClippingOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!analysis || (!showShadow && !showHighlight)) {
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

    const parseRgba = (s: string) => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return [0, 0, 0, 255];
      const parts = m[1].split(',').map((p) => parseFloat(p.trim()));
      return [parts[0], parts[1], parts[2], Math.round((parts[3] ?? 1) * 255)];
    };
    const [sr, sg, sb, sa] = parseRgba(SHADOW_COLOR);
    const [hr, hg, hb, ha] = parseRgba(HIGHLIGHT_COLOR);

    for (let i = 0; i < cellZones.length; i++) {
      const z = cellZones[i];
      const idx = i * 4;
      if (z < 0) continue;
      if (showHighlight && z > maxZone) {
        data[idx] = hr;
        data[idx + 1] = hg;
        data[idx + 2] = hb;
        data[idx + 3] = ha;
      } else if (showShadow && z < minZone) {
        data[idx] = sr;
        data[idx + 1] = sg;
        data[idx + 2] = sb;
        data[idx + 3] = sa;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [analysis, minZone, maxZone, showShadow, showHighlight]);

  if (!showShadow && !showHighlight) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ imageRendering: 'auto' }}
      aria-hidden
    />
  );
}
