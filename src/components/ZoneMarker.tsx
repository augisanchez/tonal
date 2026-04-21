interface ZoneMarkerProps {
  label: string;
  x: number;
  y: number;
  isClipping: boolean;
}

export function ZoneMarker({ label, x, y, isClipping }: ZoneMarkerProps) {
  return (
    <div
      className="absolute w-8 h-8 rounded-full bg-grey-100 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}
      aria-label={`Zone ${label}${isClipping ? ' — clipping' : ''}`}
    >
      <span className="text-[13px] font-bold leading-[16px] tracking-tight text-ink">
        {label}
      </span>
      {isClipping && (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5"
          style={{
            background: 'var(--color-warning)',
            clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
            borderTopRightRadius: '3px',
          }}
        />
      )}
    </div>
  );
}
