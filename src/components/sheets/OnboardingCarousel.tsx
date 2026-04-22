import { useState } from 'react';
import { MeterIcon, ZonesIcon, ShieldIcon, SlidersIcon } from '../primitives';

const STORAGE_KEY = 'tonal_onboarded_v1';

interface Slide {
  title: string;
  body: string;
  Icon: React.FC<{ className?: string }>;
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
    Icon: ShieldIcon,
    title: 'Protect detail',
    body: "Warnings appear when tones fall outside your film's latitude — so you can shoot with intent.",
  },
  {
    Icon: SlidersIcon,
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
