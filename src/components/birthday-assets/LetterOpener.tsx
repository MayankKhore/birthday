/**
 * LetterOpener — Animated birthday letter opening experience.
 *
 * Uses SVG envelope and letter assets from public/assets/.
 * Tap-to-open interaction with smooth unfolding animation and line-by-line text reveal.
 * Keyboard accessible: Enter/Space opens the envelope.
 * Respects prefers-reduced-motion.
 */
import { useCallback, useState } from 'react';
import type { BirthdayProject } from '@/types';

interface Props {
  recipientName?: string;
  onComplete?: () => void;
}

const LETTER_TEXT = `Happy Birthday, {name}!`;

const ENVELOPE_SVG = `
<svg width="260" height="180" viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Sealed birthday envelope" role="img">
  <defs>
    <linearGradient id="envGradLO" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F3C5D7" />
      <stop offset="100%" stop-color="#DFD8F3" />
    </linearGradient>
    <filter id="envShadowLO" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.15" />
    </filter>
  </defs>
  <rect x="20" y="60" width="220" height="100" rx="8" fill="url(#envGradLO)" filter="url(#envShadowLO)" />
  <path d="M20 60 L130 110 L240 60 Z" fill="url(#envGradLO)" filter="url(#envShadowLO)" />
  <path d="M20 60 L130 110" stroke="#C3BDEC" strokeWidth="2" strokeLinecap="round" />
  <path d="M130 110 L240 60" stroke="#C3BDEC" strokeWidth="2" strokeLinecap="round" />
  <path d="M20 160 L130 110" stroke="#C3BDEC" strokeWidth="2" strokeLinecap="round" />
  <path d="M130 110 L240 160" stroke="#C3BDEC" strokeWidth="2" strokeLinecap="round" />
  <circle cx="130" cy="60" r="16" fill="#F472B6" filter="url(#envShadowLO)" />
  <circle cx="130" cy="60" r="10" fill="#FB7185" />
  <path d="M122 56 Q130 60 138 56 M122 64 Q130 60 138 64" stroke="#B45363" strokeWidth="2" strokeLinecap="round" />
  <path d="M126 58 Q130 62 134 58" stroke="#B45363" strokeWidth="2" strokeLinecap="round" />
  <path d="M128 56 Q126 54 124 56 Q122 58 124 60 Q126 62 128 60 Q130 58 132 60 Q134 62 136 60 Q138 58 136 56 Q134 54 132 56 Z" fill="#B45363" />
  <rect x="60" y="105" width="140" height="24" rx="4" fill="rgba(255,255,255,0.35)" />
  <rect x="60" y="105" width="140" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
</svg>
`;

export function LetterOpener({ recipientName = 'Someone Special', onComplete }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [letterModal, setLetterModal] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (onComplete) onComplete();
  }, [onComplete]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpen();
      }
    },
    [handleOpen],
  );

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="relative"
        style={{
          transform: isOpen ? 'scale(0.9)' : 'scale(1)',
          transition: prefersReducedMotion ? 'none' : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transformOrigin: 'top center',
            transform: isOpen ? 'rotateX(-140deg)' : 'rotateX(0deg)',
            transition: prefersReducedMotion
              ? 'none'
              : 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: isOpen ? 1 : 3,
          }}
          dangerouslySetInnerHTML={{ __html: ENVELOPE_SVG }}
        />
        {!isOpen ? (
          <button
            type="button"
            role="button"
            aria-label={`Open the birthday envelope for ${recipientName}`}
            onClick={handleOpen}
            onKeyDown={handleKeyDown}
            className="mt-8 clay-btn clay-btn-primary clay-btn-lg w-full"
            disabled={isOpen}
          >
            Open envelope ✦
          </button>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              type="button"
              role="button"
              aria-label="Read the birthday letter"
              onClick={() => setLetterModal(true)}
              onKeyDown={handleKeyDown}
              className="clay-btn clay-btn-primary clay-btn-lg"
            >
              Read the letter →
            </button>
          </div>
        )}
      </div>

      {letterModal && (
        <div
          className="fixed inset-0 z-[500] flex flex-col items-center justify-center p-6 overflow-y-auto"
          style={{ background: 'rgba(43, 36, 82, 0.95)' }}
        >
          <div className="w-full max-w-xl text-center">
            <button
              type="button"
              aria-label="Close letter"
              onClick={() => setLetterModal(false)}
              className="absolute top-4 right-4 clay-btn clay-btn-ghost clay-btn-sm text-[var(--color-warm-ivory)]"
            >
              ✕
            </button>
            <p className="eyebrow text-[var(--color-coral)] font-semibold mb-3 uppercase tracking-wider text-xs">
              A letter for {recipientName}
            </p>
            <div
              className="clay-card-static text-left p-8 rounded-2xl bg-gradient-to-b from-[var(--color-warm-ivory)] via-[var(--color-warm-ivory)]/80 to-[#f3e8d8] shadow-2xl border border-[var(--color-border)]/50"
              role="region"
              aria-label={`Birthday letter for ${recipientName}`}
              aria-live="polite"
            >
              <p className="font-display text-xl font-bold mb-4">Happy Birthday, {recipientName}!</p>
              <p className="text-body text-base mb-4 last:mb-0" style={{ color: 'var(--color-text-primary)', lineHeight: 'var(--leading-relaxed)', whiteSpace: 'pre-wrap' }}>
                Wishing you a day filled with joy, laughter, and wonderful surprises. May this year bring you new adventures, cherished memories, and all the happiness your heart can hold.
              </p>
              <p className="text-body text-base mb-4 last:mb-0" style={{ color: 'var(--color-text-primary)', lineHeight: 'var(--leading-relaxed)', whiteSpace: 'pre-wrap' }}>
                With love and celebration.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="w-3 h-1.5 rounded-full"
                  style={{
                    width: '22px',
                    background: 'var(--color-coral)',
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Close the letter"
              onClick={() => setLetterModal(false)}
              className="clay-btn clay-btn-primary clay-btn-lg mt-8"
            >
              Close letter →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}