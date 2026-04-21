import type { RefObject } from 'react';

interface PreviewAreaProps {
  videoRef?: RefObject<HTMLVideoElement | null>;
  aspect: number;
  zoom: number;
  isReady: boolean;
  isPermissionDenied: boolean;
  onRequestCamera: () => void;
  isFrozen: boolean;
  onToggleFreeze: () => void;
  children?: React.ReactNode;
  overlay?: React.ReactNode;
}

function CameraIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8a2 2 0 0 1 2-2h2.5l1.5-2h6l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function PreviewArea({
  videoRef,
  aspect,
  zoom,
  isReady,
  isPermissionDenied,
  onRequestCamera,
  isFrozen,
  onToggleFreeze,
  children,
  overlay,
}: PreviewAreaProps) {
  // Fills parent's available height, derives width from aspect, never exceeds parent width.
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
              <button onClick={onRequestCamera} className="text-[14px] font-semibold text-ink mt-1">
                Tap to enable camera
              </button>
            )}
          </div>
        )}

        {isReady && overlay}

        {isReady && (
          <button
            type="button"
            onClick={onToggleFreeze}
            aria-label={isFrozen ? 'Resume live reading' : 'Freeze current reading'}
            aria-pressed={isFrozen}
            className="absolute inset-0 z-10"
          />
        )}

        {isReady && (
          <div className="absolute inset-0 pointer-events-none z-20">{children}</div>
        )}

        {isReady && isFrozen && (
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-ink text-white px-2.5 py-1 rounded-full text-[10px] font-bold pointer-events-none"
            style={{ letterSpacing: '0.12em' }}
            aria-hidden
          >
            HOLD
          </div>
        )}
      </div>
    </div>
  );
}
