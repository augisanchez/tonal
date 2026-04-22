/** Visual-only for now — represents the preset slot pagination (see Figma).
 *  Multi-preset storage is deferred until the UX decisions are made. */
export function PresetDots() {
  return (
    <div className="flex items-center justify-center gap-2 py-1" aria-hidden>
      <span className="w-2 h-2 rounded-full bg-ink" />
      <span className="w-2 h-2 rounded-full bg-grey-200" />
      <span className="text-[10px] text-grey-300 pl-1">+</span>
    </div>
  );
}
