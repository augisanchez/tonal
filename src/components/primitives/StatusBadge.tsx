import type { ReactNode } from 'react';

type StatusTone = 'ink' | 'accent';

interface StatusBadgeProps {
  tone?: StatusTone;
  children: ReactNode;
}

const TONE_CLASSES: Record<StatusTone, string> = {
  ink: 'bg-ink text-white',
  accent: 'bg-accent text-white',
};

/** Non-interactive pill used as an in-preview state indicator (HOLD, SPOT). */
export function StatusBadge({ tone = 'ink', children }: StatusBadgeProps) {
  return (
    <div
      className={`${TONE_CLASSES[tone]} px-2.5 py-1 rounded-full text-[10px] font-bold pointer-events-none`}
      style={{ letterSpacing: '0.12em' }}
      aria-hidden
    >
      {children}
    </div>
  );
}
