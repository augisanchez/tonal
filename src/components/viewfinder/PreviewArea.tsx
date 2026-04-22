import type { RefObject } from 'react';
import { CameraIcon, StatusBadge } from '../primitives';

interface PreviewAreaProps {
  videoRef?: RefObject<HTMLVideoElement | null>;
  aspect: number;
  zoom: number;
  isReady: boolean;
  isPermissionDenied: boolean;
  onRequestCamera: () => void;
  isFrozen: boolean;
  isSpotModeActive: boolean;
  /** x/y normalized within the visible preview. */
  onTap: (x: number, y: number) => void;
  children?: React.ReactNode;
  overlay?: React.ReactNode;
}

/** Aspect-ratio-cropped viewfinder. Fills parent height; width derives from aspect.
 *  Stack (back→front): video → overlays (clipping / false color) → tap layer →
 *  children (zone markers, spot) → state badges (HOLD / SPOT). */
export function PreviewArea({
  videoRef,
  aspect,
  zoom,
  isReady,
  isPermissionDenied,
  onRequestCamera,
  isFrozen,
  isSpotModeActive,
  onTap,
  children,
  overlay,
}: PreviewAreaProps) {
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <div
        className="relative rounded-[10px] border border-grey-200 overflow-hidden bg-white"
        style={{
          aspectRatio: aspect,
          height: '100%',
          width: 'auto',
          maxWidth: '100%',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            opacity: isReady ? 1 : 0,
            transition: 'opacity 200ms ease',
          }}
        />

        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-soft p-6 text-center">
            <CameraIcon className="w-8 h-8 text-ink-soft" />
            {isPermissionDenied ? (
              <>
                <p className="text-[14px] font-semibold text-ink">Camera access required</p>
                <p className="text-[12px] leading-tight max-w-[260px]">
                  Tonal needs camera access to meter light. Enable it in Settings → Safari → Camera.
                </p>
              </>
            ) : (
              <button
                onClick={onRequestCamera}
                className="text-[14px] font-semibold text-ink mt-1"
              >
                Tap to enable camera
              </button>
            )}
          </div>
        )}

        {isReady && overlay}

        {isReady && (
          <button
            type="button"
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width;
              const y = (e.clientY - rect.top) / rect.height;
              onTap(Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y)));
            }}
            aria-label={
              isSpotModeActive
                ? 'Tap to place spot meter'
                : isFrozen
                  ? 'Resume live reading'
                  : 'Freeze current reading'
            }
            className={`absolute inset-0 z-10 ${isSpotModeActive ? 'cursor-crosshair' : ''}`}
          />
        )}

        {isReady && (
          <div className="absolute inset-0 pointer-events-none z-20">{children}</div>
        )}

        {isReady && isFrozen && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
            <StatusBadge tone="ink">HOLD</StatusBadge>
          </div>
        )}

        {isReady && isSpotModeActive && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
            <StatusBadge tone="accent">SPOT</StatusBadge>
          </div>
        )}
      </div>
    </div>
  );
}
