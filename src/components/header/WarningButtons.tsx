import { useTonalStore } from '../../store/useTonalStore';
import { ShadowWarningIcon, HighlightWarningIcon } from '../primitives';

function toggleButtonClass(): string {
  return 'w-11 h-11 flex items-center justify-center text-ink';
}

export function ShadowWarningButton() {
  const enabled = useTonalStore((s) => s.shadowWarningEnabled);
  const toggle = useTonalStore((s) => s.toggleShadowWarning);
  return (
    <button
      onClick={toggle}
      aria-label="Toggle shadow clipping warning"
      aria-pressed={enabled}
      className={toggleButtonClass()}
    >
      <ShadowWarningIcon active={enabled} />
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
      className={toggleButtonClass()}
    >
      <HighlightWarningIcon active={enabled} />
    </button>
  );
}
