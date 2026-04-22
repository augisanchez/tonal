import { ZONE_LABELS } from '../data/filmStocks';

interface SpotMarkerProps {
  x: number;
  y: number;
  zone: number | null;
}

export function SpotMarker({ x, y, zone }: SpotMarkerProps) {
  const label = zone != null && Number.isFinite(zone) ? ZONE_LABELS[zone] ?? String(zone) : '—';
  return (
    <div
      className="absolute flex flex-col items-center gap-1"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}
      aria-label={`Spot meter at zone ${label}`}
    >
      <div className="w-10 h-10 rounded-full border-2 border-[color:var(--color-accent)] bg-white/0" />
      <div className="px-2 py-0.5 rounded-full bg-[color:var(--color-accent)] text-white text-[11px] font-bold tracking-tight">
        Zone {label}
      </div>
    </div>
  );
}
