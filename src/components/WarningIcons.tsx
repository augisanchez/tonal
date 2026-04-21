import { useTonalStore } from '../store/useTonalStore';

function ShadowIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5" aria-hidden>
      <defs>
        <pattern id="shadow-diag" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="2" height="4" fill="currentColor" />
        </pattern>
      </defs>
      <circle
        cx="10"
        cy="10"
        r="9"
        fill={active ? 'url(#shadow-diag)' : 'none'}
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

function HighlightIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5" aria-hidden>
      <defs>
        <pattern id="highlight-diag" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="2" height="4" fill="currentColor" />
        </pattern>
      </defs>
      <circle
        cx="10"
        cy="10"
        r="9"
        fill={active ? 'url(#highlight-diag)' : 'none'}
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <line x1="3" y1="17" x2="17" y2="3" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function ShadowWarningButton() {
  const enabled = useTonalStore((s) => s.shadowWarningEnabled);
  const toggle = useTonalStore((s) => s.toggleShadowWarning);
  return (
    <button
      onClick={toggle}
      aria-label="Toggle shadow clipping warning"
      aria-pressed={enabled}
      className="w-11 h-11 flex items-center justify-center text-ink"
    >
      <ShadowIcon active={enabled} />
    </button>
  );
}

export function HighlightWarningButton() {
  const enabled = useTonalStore((s) => s.highlightWarningEnabled);
  const toggle = useTonalStore((s) => s.toggleHighlightWarning);
  return (
    <button
      onClick={toggle}
      aria-label="Toggle highlight clipping warning"
      aria-pressed={enabled}
      className="w-11 h-11 flex items-center justify-center text-ink"
    >
      <HighlightIcon active={enabled} />
    </button>
  );
}
