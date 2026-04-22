/** Small "AUTO" indicator shown next to slider values when the meter
 *  is recommending the displayed value instead of using the user's lock. */
export function AutoBadge() {
  return (
    <span
      className="text-[9px] font-bold leading-none tracking-[0.1em] uppercase px-1.5 py-1 rounded-full bg-accent/10 text-[color:var(--color-accent)] self-center"
      aria-label="auto"
    >
      AUTO
    </span>
  );
}
