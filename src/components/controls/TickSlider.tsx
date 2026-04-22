import { useEffect, useRef } from 'react';

interface TickSliderProps {
  /** Total number of tick positions. */
  count: number;
  /** Current visual index. Can change underneath (e.g. meter recommendation) without disrupting an in-flight drag. */
  index: number;
  /** Called with a snapped integer index when the user releases a drag. */
  onChange: (index: number) => void;
  /** Called continuously during a drag (fractional index). */
  onScrub?: (index: number) => void;
  /** Called when the user double-taps the slider (used for reset/auto). */
  onDoubleTap?: () => void;
  showCenterMarker?: boolean;
  className?: string;
}

const DRAG_THRESHOLD_PX = 6;
const DOUBLE_TAP_MS = 300;

export function TickSlider({
  count,
  index,
  onChange,
  onScrub,
  onDoubleTap,
  showCenterMarker = false,
  className = '',
}: TickSliderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Refs for values that listeners need to see latest of, without rebinding.
  const indexRef = useRef(index);
  indexRef.current = index;
  const countRef = useRef(count);
  countRef.current = count;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onScrubRef = useRef(onScrub);
  onScrubRef.current = onScrub;
  const onDoubleTapRef = useRef(onDoubleTap);
  onDoubleTapRef.current = onDoubleTap;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startIndex = 0;
    let currentIndex = 0;
    let lastTapTs = 0;

    const begin = (clientX: number) => {
      dragging = true;
      moved = false;
      startX = clientX;
      startIndex = indexRef.current;
      currentIndex = startIndex;
    };

    const move = (clientX: number) => {
      if (!dragging) return;
      const delta = clientX - startX;
      if (Math.abs(delta) > DRAG_THRESHOLD_PX) moved = true;
      const rect = root.getBoundingClientRect();
      const c = countRef.current;
      const unit = rect.width / Math.max(1, c - 1);
      const deltaUnit = delta / unit;
      currentIndex = Math.max(0, Math.min(c - 1, startIndex + deltaUnit));
      onScrubRef.current?.(currentIndex);
    };

    const end = () => {
      if (!dragging) return;
      dragging = false;

      if (!moved) {
        // Tap without drag — detect double tap
        const now = Date.now();
        onScrubRef.current?.(startIndex);
        if (now - lastTapTs < DOUBLE_TAP_MS) {
          lastTapTs = 0;
          onDoubleTapRef.current?.();
        } else {
          lastTapTs = now;
        }
        return;
      }

      const snapped = Math.round(currentIndex);
      onChangeRef.current(
        Math.max(0, Math.min(countRef.current - 1, snapped)),
      );
    };

    const onTouchStart = (e: TouchEvent) => begin(e.touches[0].clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (dragging && moved) e.preventDefault();
      move(e.touches[0].clientX);
    };
    const onTouchEnd = () => end();

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      root.setPointerCapture(e.pointerId);
      begin(e.clientX);
    };
    const onPointerMove = (e: PointerEvent) => move(e.clientX);
    const onPointerUp = (e: PointerEvent) => {
      try {
        root.releasePointerCapture(e.pointerId);
      } catch {
        // already released
      }
      end();
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
    // Bind once; refs supply latest values to listeners.
  }, []);

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
