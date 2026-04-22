import type { ReactNode } from 'react';

export type PillVariant = 'tab' | 'chip' | 'toggle';

interface PillProps {
  variant: PillVariant;
  /** Used by 'tab' and 'chip' variants. Renders ink-filled state. */
  selected?: boolean;
  /** Used by 'toggle' variant. Renders accent-tinted state. */
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  ariaPressed?: boolean;
  className?: string;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<PillVariant, string> = {
  tab: 'shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold tracking-tight whitespace-nowrap transition-colors',
  chip: 'shrink-0 px-3 py-1.5 rounded-full text-[13px] font-semibold tracking-tight whitespace-nowrap transition-colors',
  toggle:
    'text-[9px] font-bold tracking-[0.1em] uppercase px-1.5 py-1 rounded-full leading-none transition-colors',
};

function stateClassesFor(variant: PillVariant, selected: boolean, active: boolean, disabled: boolean): string {
  if (variant === 'tab' || variant === 'chip') {
    return selected ? 'bg-ink text-white' : 'bg-grey-100 text-ink active:bg-grey-200';
  }
  // toggle
  if (disabled) return 'bg-grey-100/50 text-grey-300 cursor-not-allowed';
  if (active) return 'bg-accent/15 text-[color:var(--color-accent)]';
  return 'bg-grey-100 text-ink-soft active:bg-grey-200';
}

/** Rounded-full labeled button. Three visual variants for the three places
 *  the app needs this shape: sheet-style tabs, smaller chips, and tiny
 *  toggle indicators in the reading header. */
export function Pill({
  variant,
  selected = false,
  active = false,
  disabled = false,
  onClick,
  ariaLabel,
  ariaPressed,
  className = '',
  children,
}: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className={`${VARIANT_CLASSES[variant]} ${stateClassesFor(variant, selected, active, disabled)} ${className}`}
    >
      {children}
    </button>
  );
}
