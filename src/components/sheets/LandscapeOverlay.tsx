import { useEffect, useState } from 'react';
import { RotatePhoneIcon } from '../primitives';

export function LandscapeOverlay() {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    // Only show the nudge on narrow devices — desktop landscape is fine.
    const m = window.matchMedia('(orientation: landscape) and (max-height: 520px)');
    const handler = () => setIsLandscape(m.matches);
    handler();
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }, []);

  if (!isLandscape) return null;

  return (
    <div
      className="fixed inset-0 z-[95] bg-white flex items-center justify-center p-8"
      role="dialog"
      aria-label="Please rotate your device"
    >
      <div className="flex flex-col items-center gap-4 max-w-[360px] text-center text-ink">
        <RotatePhoneIcon className="w-14 h-14 text-ink-soft" />
        <div className="text-[20px] font-semibold tracking-tight">Rotate to portrait</div>
        <div className="text-[14px] leading-[20px] text-ink-soft">
          Tonal is designed for portrait orientation. Turn your phone upright to continue metering.
        </div>
      </div>
    </div>
  );
}
