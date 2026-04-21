import { useEffect, useRef } from 'react';

interface TickSliderProps {
  /** Total number of tick positions. */
  count: number;
  /** Current index (can be fractional while dragging). */
  index: number;
  /** Every `majorEvery` ticks are slightly taller. */
  majorEvery?: number;
  /** Called with a snapped integer index on release. */
  onChange: (index: number) => void;
  /** Called continuously while dragging (fractional). */
  onScrub?: (index: number) => void;
  /** Optional center marker (for exposure compensation). */
  showCenterMarker?: boolean;
  className?: string;
}

export function TickSlider({
  count,
  index,
  onChange,
  onScrub,
  showCenterMarker = false,
  className = '',
}: TickSliderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let startX = 0;
    let startIndex = 0;
    let currentIndex = index;

    const handleStart = (clientX: number) => {
      dragging.current = true;
      startX = clientX;
      startIndex = index;
      currentIndex = index;
    };

    const handleMove = (clientX: number) => {
      if (!dragging.current) return;
      const rect = root.getBoundingClientRect();
      const unit = rect.width / Math.max(1, count - 1);
      // Drag right = smaller index (like scrubbing a dial)? Follow spec: swipe L/R changes value.
      // We'll use drag right = higher index (natural scrub).
      const delta = (clientX - startX) / unit;
      currentIndex = Math.max(0, Math.min(count - 1, startIndex + delta));
      onScrub?.(currentIndex);
    };

    const handleEnd = () => {
      if (!dragging.current) return;
      dragging.current = false;
      const snapped = Math.round(currentIndex);
      onChange(Math.max(0, Math.min(count - 1, snapped)));
    };

    const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (dragging.current) e.preventDefault();
      handleMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => handleEnd();

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // touch handled separately
      root.setPointerCapture(e.pointerId);
      handleStart(e.clientX);
    };
    const onPointerMove = (e: PointerEvent) => handleMove(e.clientX);
    const onPointerUp = (e: PointerEvent) => {
      root.releasePointerCapture(e.pointerId);
      handleEnd();
    };

    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchmove', onTouchMove, { passive: false });
    root.addEventListener('touchend', onTouchEnd);
    root.addEventListener('touchcancel', onTouchEnd);
    root.addEventListener('pointerdown', onPointerDown);
    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerup', onPointerUp);
    root.addEventListener('pointercancel', onPointerUp);

    return () => {
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchmove', onTouchMove);
      root.removeEventListener('touchend', onTouchEnd);
      root.removeEventListener('touchcancel', onTouchEnd);
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerup', onPointerUp);
      root.removeEventListener('pointercancel', onPointerUp);
    };
  }, [count, index, onChange, onScrub]);

  // We render ticks as individual divs for crisp positioning at any count.
  const ticks = Array.from({ length: count });

  return (
    <div
      ref={rootRef}
      className={`relative h-4 w-full select-none touch-none cursor-grab active:cursor-grabbing ${className}`}
    >
      <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-between">
        {ticks.map((_, i) => {
          const isMajor = i % 5 === 0;
          return (
            <span
              key={i}
              className="bg-ink/80"
              style={{
                width: '1px',
                height: isMajor ? '8px' : '6px',
              }}
            />
          );
        })}
      </div>
      {showCenterMarker && (
        <span
          className="absolute top-0 bottom-0 bg-ink"
          style={{ left: '50%', width: '2px', transform: 'translateX(-50%)' }}
        />
      )}
    </div>
  );
}
