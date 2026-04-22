import { useState } from 'react';

const STORAGE_KEY = 'tonal_onboarded_v1';

interface Slide {
  title: string;
  body: string;
  Icon: React.FC<{ className?: string }>;
}

function MeterIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="32" cy="32" r="22" />
      <path d="M32 12v4M32 48v4M12 32h4M48 32h4M18 18l3 3M46 46l-3-3M18 46l3-3M46 18l-3 3" />
      <path d="M32 32l10-6" strokeLinecap="round" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="2" fill="currentColor" />
    </svg>
  );
}

function ZonesIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="8" y="12" width="48" height="40" rx="4" />
      <circle cx="20" cy="28" r="6" />
      <circle cx="42" cy="22" r="6" />
      <circle cx="32" cy="42" r="6" />
    </svg>
  );
}

function ProtectIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M32 8l20 6v14c0 12-8 22-20 28-12-6-20-16-20-28V14l20-6z" />
      <path d="M24 32l6 6 12-14" strokeLinecap="round" strokeWidth="2.5" />
    </svg>
  );
}

function ControlIcon({ className = '' }: { className?: string }) {
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

const SLIDES: Slide[] = [
  {
    Icon: MeterIcon,
    title: 'Meet Tonal',
    body: 'The light meter made for film. Choose your film and camera setup — Tonal does the rest.',
  },
  {
    Icon: ZonesIcon,
    title: 'See your zones',
    body: 'Tonal shows where shadows, midtones, and highlights fall across your frame in real time.',
  },
  {
    Icon: ProtectIcon,
    title: 'Protect detail',
    body: 'Warnings appear when tones fall outside your film’s latitude — so you can shoot with intent.',
  },
  {
    Icon: ControlIcon,
    title: 'Stay in control',
    body: 'Drag any slider to lock a value. Double-tap to return to auto. Classic meter control, zone-system smarts.',
  },
];

function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* private mode, etc. — silent */
  }
}

export function OnboardingCarousel() {
  const [isOpen, setIsOpen] = useState(() => !hasSeenOnboarding());
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const dismiss = () => {
    markSeen();
    setIsOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-white flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Tonal"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex justify-end px-6 pt-2">
        <button
          onClick={dismiss}
          className="text-[14px] font-semibold text-ink-soft active:text-ink"
          aria-label="Skip onboarding"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8 text-center">
        <div className="text-ink">
          <slide.Icon className="w-24 h-24" />
        </div>
        <div className="flex flex-col gap-3 max-w-[320px]">
          <h1 className="text-[28px] font-semibold tracking-tight leading-tight">
            {slide.title}
          </h1>
          <p className="text-[16px] leading-[22px] text-ink-soft">{slide.body}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pb-4" aria-hidden>
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? 'w-6 bg-ink' : 'w-1.5 bg-grey-200'
            }`}
          />
        ))}
      </div>

      <div
        className="px-6 pb-2"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
      >
        <button
          onClick={() => (isLast ? dismiss() : setStep((s) => s + 1))}
          className="w-full bg-accent text-white rounded-[14px] py-3.5 px-5 text-[17px] font-semibold tracking-tight active:opacity-90"
        >
          {isLast ? 'Get started' : 'Next'}
        </button>
      </div>
    </div>
  );
}
