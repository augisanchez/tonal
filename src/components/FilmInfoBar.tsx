import { useTonalStore } from '../store/useTonalStore';
import { findFormat } from '../data/formats';

export function FilmInfoBar() {
  const film = useTonalStore((s) => s.selectedFilm);
  const formatKey = useTonalStore((s) => s.format);
  const aspectId = useTonalStore((s) => s.aspectRatioId);
  const focalLength = useTonalStore((s) => s.focalLength);
  const open = useTonalStore((s) => s.openFilmSheet);

  const fmt = findFormat(formatKey);
  const aspect = fmt.aspects.find((a) => a.id === aspectId) ?? fmt.aspects[0];
  const formatShort = formatKey === '35mm' ? '35mm' : formatKey === '120' ? 'Medium Format' : formatKey === 'lf' ? 'Large Format' : 'Instant';

  return (
    <button
      onClick={open}
      className="w-full flex flex-col items-center gap-2 py-3 px-2 rounded-[10px] active:bg-grey-100/50 transition-colors"
      aria-label="Open film, format, and focal length selection"
    >
      <div className="flex items-center gap-2">
        <span className="text-[28px] leading-[22px] font-semibold tracking-tight text-ink">
          {film.film}
        </span>
        <span className="bg-iso-cream rounded-[4px] px-1 py-0.5">
          <span className="text-[13px] font-semibold leading-[16px] tracking-tight text-ink">
            ISO {film.ei}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-2 text-[13px] leading-[16px] text-ink">
        <span>
          {formatShort} {aspect.ratio}
        </span>
        <span className="text-ink-soft">•</span>
        <span>{focalLength}mm lens</span>
      </div>
    </button>
  );
}
