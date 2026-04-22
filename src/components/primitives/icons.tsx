/** Shared icon components. All are stroke-currentColor so they pick up text color.
 *  Size via className (e.g. "w-5 h-5"). */

interface IconProps {
  className?: string;
}

export function ChevronLeftIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 12 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 3L3 10l6 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 12 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3l6 7-6 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CameraIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8a2 2 0 0 1 2-2h2.5l1.5-2h6l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function RotatePhoneIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="14" y="6" width="28" height="52" rx="4" />
      <circle cx="28" cy="50" r="1.5" fill="currentColor" />
      <path d="M46 20a18 18 0 0 1-4 28" strokeLinecap="round" />
      <path d="M40 48l2 6 6-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MeterIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="32" cy="32" r="22" />
      <path d="M32 12v4M32 48v4M12 32h4M48 32h4M18 18l3 3M46 46l-3-3M18 46l3-3M46 18l-3 3" />
      <path d="M32 32l10-6" strokeLinecap="round" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="2" fill="currentColor" />
    </svg>
  );
}

export function ZonesIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="8" y="12" width="48" height="40" rx="4" />
      <circle cx="20" cy="28" r="6" />
      <circle cx="42" cy="22" r="6" />
      <circle cx="32" cy="42" r="6" />
    </svg>
  );
}

export function ShieldIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M32 8l20 6v14c0 12-8 22-20 28-12-6-20-16-20-28V14l20-6z" />
      <path d="M24 32l6 6 12-14" strokeLinecap="round" strokeWidth="2.5" />
    </svg>
  );
}

export function SlidersIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="8" y1="20" x2="56" y2="20" />
      <circle cx="40" cy="20" r="5" fill="currentColor" stroke="none" />
      <line x1="8" y1="32" x2="56" y2="32" />
      <circle cx="20" cy="32" r="5" fill="currentColor" stroke="none" />
      <line x1="8" y1="44" x2="56" y2="44" />
      <circle cx="32" cy="44" r="5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Shadow warning — diagonal hatch inside a circle (filled when active). */
export function ShadowWarningIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5" aria-hidden>
      <defs>
        <pattern
          id="tonal-shadow-hatch"
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="2" height="4" fill="currentColor" />
        </pattern>
      </defs>
      <circle
        cx="10"
        cy="10"
        r="9"
        fill={active ? 'url(#tonal-shadow-hatch)' : 'none'}
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

/** Highlight warning — hatched circle with diagonal strikethrough. */
export function HighlightWarningIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5" aria-hidden>
      <defs>
        <pattern
          id="tonal-highlight-hatch"
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-45)"
        >
          <rect width="2" height="4" fill="currentColor" />
        </pattern>
      </defs>
      <circle
        cx="10"
        cy="10"
        r="9"
        fill={active ? 'url(#tonal-highlight-hatch)' : 'none'}
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <line x1="3" y1="17" x2="17" y2="3" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
