/**
 * EnvelopeOpener — Stage 8 birthday letter experience.
 *
 * A sealed envelope displaying the recipient's name with an explicit
 * tap-to-open interaction and an elegant opening animation.
 * Keyboard accessible: Enter/Space opens the envelope.
 * Respects prefers-reduced-motion.
 */

import { useCallback, useState } from 'react';
import type { BirthdayProject } from '@/types';

interface Props {
  project: BirthdayProject;
  onOpen: () => void;
  reducedMotion: boolean;
}

const ENVELOPE_SVG = `
<svg width="260" height="180" viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Sealed birthday envelope" role="img">
  <defs>
    <linearGradient id="envGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F3C5D7" />
      <stop offset="100%" stop-color="#DFD8F3" />
    </linearGradient>
    <filter id="envShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.08" />
    </filter>
  </defs>
  <rect x="20" y="60" width="220" height="100" rx="8" fill="url(#envGrad)" filter="url(#envShadow)" />
  <path d="M20 60 L130 110 L240 60 Z" fill="url(#envGrad)" filter="url(#envShadow)" />
  <path d="M20 60 L130 110" stroke="#C3BDEC" strokeWidth="2" strokeLinecap="round" />
  <path d="M130 110 L240 60" stroke="#C3BDEC" strokeWidth="2" strokeLinecap="round" />
  <path d="M20 160 L130 110" stroke="#C3BDEC" strokeWidth="2" strokeLinecap="round" />
  <path d="M130 110 L240 160" stroke="#C3BDEC" strokeWidth="2" strokeLinecap="round" />
  <circle cx="130" cy="60" r="16" fill="#E0A428" filter="url(#envShadow)" />
  <circle cx="130" cy="60" r="10" fill="#FCD34D" />
  <path d="M122 56 Q130 60 138 56 M122 64 Q130 60 138 64" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" />
  <path d="M126 58 Q130 62 134 58" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" />
  <path d="M128 56 Q126 54 124 56 Q122 58 124 60 Q126 62 128 60 Q130 58 132 60 Q134 62 136 60 Q138 58 136 56 Q134 54 132 56 Z" fill="#B8860B" />
  <rect x="60" y="105" width="140" height="24" rx="4" fill="rgba(255,255,255,0.35)" />
  <rect x="60" y="105" width="140" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
</svg>
`;

export function EnvelopeOpener({ project, onOpen, reducedMotion }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    onOpen();
  }, [onOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpen();
      }
    },
    [handleOpen],
  );

  const recipientName = project.recipientName || 'Someone Special';
  const prefersReducedMotion = reducedMotion;

  return (
    <div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center text-center"
      style={{ background: 'var(--color-page)' }}
    >
      <div
        className="relative"
        style={{
          transform: isOpen ? 'scale(0.85)' : 'scale(1)',
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
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center"
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(40px)',
            transition: prefersReducedMotion
              ? 'none'
              : `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${isOpen ? '0.3s' : '0s'}`,
            pointerEvents: 'none',
          }}
        >
          <div className="w-64 h-80 rounded-2xl bg-white shadow-lg border border-[var(--color-border)] overflow-hidden">
            <div className="h-4 bg-[var(--color-surface-lavender)] w-1/3 mx-auto mb-4 rounded" />
            <div className="h-3 bg-[var(--color-border)] w-1/2 mx-auto mb-6 rounded" />
            <div className="p-6 text-center">
              <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                A letter for {recipientName}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Tap to open and read your birthday message
              </p>
            </div>
          </div>
        </div>
      </div>

      {!isOpen ? (
        <button
          type="button"
          role="button"
          aria-label={`Open the birthday envelope for ${recipientName}`}
          aria-pressed={isOpen}
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          className="mt-12 clay-btn clay-btn-primary clay-btn-lg animate-pulse"
          disabled={isOpen}
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: prefersReducedMotion ? 'none' : 'transform 0.2s ease',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Open envelope ✦
        </button>
      ) : (
        <button
          type="button"
          role="button"
          aria-label="Continue to the birthday letter"
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          className="mt-8 clay-btn clay-btn-primary clay-btn-lg"
        >
          Read the letter →
        </button>
      )}
    </div>
  );
}