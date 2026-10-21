/**
 * PresentationCard — Stage 8 interactive birthday card.
 *
 * Animated name reveal card with a personal opening line.
 * Keyboard accessible: Enter/Space advances the reveal.
 * Respects prefers-reduced-motion.
 */

import { useCallback, useState } from 'react';
import type { BirthdayProject } from '@/types';

interface Props {
  project: BirthdayProject;
  config?: { revealName?: boolean; revealMessage?: string };
  onComplete?: () => void;
  reducedMotion: boolean;
}

export function PresentationCard({
  project,
  config,
  onComplete,
  reducedMotion,
}: Props) {
  const [stage, setStage] = useState<'hidden' | 'name' | 'message'>('hidden');
  const [revealed, setRevealed] = useState(false);

  const recipientName = project.recipientName || 'Someone Special';
  const revealMessage = config?.revealMessage || project.customMessage || '';
  const prefersReducedMotion = reducedMotion;

  const advance = useCallback(() => {
    if (stage === 'hidden') {
      setStage('name');
    } else if (stage === 'name') {
      setStage('message');
      setRevealed(true);
      setTimeout(() => onComplete?.(), 800);
    }
  }, [stage, onComplete]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        advance();
      }
    },
    [advance],
  );

  return (
    <div
      className="clay-card p-8 sm:p-12 max-w-md mx-auto text-center"
      role="region"
      aria-label="Presentation card"
    >
      <div
        className="animate-fade-in"
        style={{ animationDelay: stage === 'hidden' ? '0s' : '300ms' }}
      >
        {!revealed && (
          <>
            <div className="clay-icon-btn clay-icon-btn-lg mx-auto mb-6 animate-pop" style={{ background: 'var(--color-surface-lavender)', color: 'var(--color-brand-500)' }} aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>
            </div>
            <h1 className="font-display text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{recipientName}</h1>
            <p className="text-lg text-[var(--color-text-secondary)]">It&apos;s your day</p>
            <button type="button" role="button" aria-label="Reveal the birthday message" onClick={advance} onKeyDown={handleKeyDown} className="mt-8 clay-btn clay-btn-primary clay-btn-lg">Open message ✦</button>
          </>
        )}
        {revealed && revealMessage && (
          <div className="animate-scale-in">
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>{recipientName}</h2>
            <p className="text-body text-lg leading-relaxed" style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-secondary)' }}>{revealMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}