/**
 * CountdownCard — Stage 8 interactive birthday card.
 *
 * Counts down to the birthday with celebration. Falls back to a simple
 * celebratory message when no target date is set.
 * Keyboard accessible: Enter/Space to interact.
 * Respects prefers-reduced-motion.
 */

import { useCallback, useEffect, useState } from 'react';
import type { BirthdayProject } from '@/types';

interface Props {
  project: BirthdayProject;
  config?: { targetDate?: string };
  onComplete?: () => void;
  reducedMotion: boolean;
}

export function CountdownCard({
  project,
  config,
  onComplete,
  reducedMotion,
}: Props) {
  const [seconds, setSeconds] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const recipientName = project.recipientName || 'Someone Special';
  const recipientAge = project.recipientAge ?? 0;
  const targetDate = config?.targetDate;
  const prefersReducedMotion = reducedMotion;

  useEffect(() => {
    if (!targetDate) {
      setFinished(true);
      return;
    }
    const target = new Date(targetDate).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      if (diff === 0) {
        setSeconds(0);
        setFinished(true);
      } else {
        setSeconds(diff);
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && finished) {
        e.preventDefault();
        onComplete?.();
      }
    },
    [finished, onComplete],
  );

  const formatTime = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return { days, hours, minutes, secs };
  };

  return (
    <div className="clay-card p-8 sm:p-12 max-w-md mx-auto text-center" role="region" aria-label="Countdown card">
      <div className="clay-icon-btn clay-icon-btn-lg mx-auto mb-6 animate-pop" style={{ background: 'var(--color-peach)', color: 'var(--color-text-primary)' }} aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>

      {!finished && seconds !== null ? (
        <>
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Counting down to {recipientName}&apos;s day</h2>
          <div className="flex justify-center gap-2 mb-8">
            {['d', 'h', 'm', 's'].map((label, i) => {
              const values = formatTime(seconds);
              const val = [values.days, values.hours, values.minutes, values.secs][i];
              return (
                <div key={label} className="clay-card-static p-4 min-w-16 text-center">
                  <div className="font-display text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{val}</div>
                  <div className="text-xs text-[var(--color-text-tertiary)] uppercase">{label}</div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{recipientName}&apos;s day is here! 🎉</h1>
          {recipientAge > 0 && <p className="text-lg text-[var(--color-text-secondary)] mb-8">Celebrating {recipientAge} wonderful years.</p>}
        </>
      )}

      {!finished ? (
        <p className="text-sm text-[var(--color-text-tertiary)]">The countdown continues…</p>
      ) : (
        <button type="button" role="button" aria-label="Continue to next card" onClick={onComplete} onKeyDown={handleKeyDown} className="mt-8 clay-btn clay-btn-primary clay-btn-lg">Continue →</button>
      )}
    </div>
  );
}