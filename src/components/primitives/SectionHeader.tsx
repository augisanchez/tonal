import type { ReactNode } from 'react';

interface SectionHeaderProps {
  children: ReactNode;
}

/** Uppercase small-caps label used above groups of controls inside sheets. */
export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <div className="text-[11px] font-semibold tracking-[0.12em] text-ink-soft uppercase">
      {children}
    </div>
  );
}
