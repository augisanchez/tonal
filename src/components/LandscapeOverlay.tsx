import { useEffect, useState } from 'react';

function RotateIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="14" y="6" width="28" height="52" rx="4" />
      <circle cx="28" cy="50" r="1.5" fill="currentColor" />
      <path d="M46 20a18 18 0 0 1-4 28" strokeLinecap="round" />
      <path d="M40 48l2 6 6-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
        <RotateIcon className="w-14 h-14 text-ink-soft" />
        <div className="text-[20px] font-semibold tracking-tight">Rotate to portrait</div>
        <div className="text-[14px] leading-[20px] text-ink-soft">
          Tonal is designed for portrait orientation. Turn your phone upright to continue metering.
        </div>
      </div>
    </div>
  );
}
