/**
 * RouletteCard â€” Stage 8 interactive birthday card.
 *
 * Spinning roulette wheel with user-defined messages or prizes.
 * No breath detection â€” explicit tap-to-spin interaction.
 * Keyboard accessible: Enter/Space to spin.
 * Respects prefers-reduced-motion.
 */

import { useCallback, useState } from 'react';
import type { BirthdayProject } from '@/types';

interface Props {
  project: BirthdayProject;
  config?: { messages?: string[]; spinsRemaining?: number };
  onComplete?: () => void;
  reducedMotion: boolean;
}

const DEFAULT_MESSAGES = [
  'A warm hug is coming your way ðŸ¤—',
  'You deserve all the happiness today ðŸŽ‚',
  'Make a wish â€” it&apos;s your day! ðŸ•¯ï¸',
  'Extra slice of cake, just for you ðŸ°',
  'A birthday dance break ðŸ’ƒ',
  'Your favorite treat is on its way ðŸ¦',
];

export function RouletteCard({
  project,
  config,
  onComplete,
  reducedMotion,
}: Props) {
  const [rotation, setRotation] = useState(0);
  const [spins, setSpins] = useState(config?.spinsRemaining ?? 3);
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);

  const messages = config?.messages ?? project.message ? [project.message] : DEFAULT_MESSAGES;
  const prefersReducedMotion = reducedMotion;

  const handleSpin = useCallback(() => {
    if (spinning || spins <= 0) return;
    const randomDeg = Math.floor(Math.random() * 360) + 1440; // 4 full spins + random
    setRotation((prev) => prev + randomDeg);
    setSpinning(true);
    setSpins((prev) => prev - 1);
    setTimeout(() => {
      const finalDeg = (rotation + randomDeg) % 360;
      const segmentIndex = Math.floor(((360 - finalDeg) % 360) / (360 / messages.length));
      setResult(messages[segmentIndex] || messages[0] || null);
      setSpinning(false);
    }, 1000);
  }, [spinning, spins, rotation, messages, prefersReducedMotion]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (spinning || spins <= 0) return;
        handleSpin();
      } else if ((e.key === 'Enter' || e.key === ' ') && result && spins <= 0) {
        e.preventDefault();
        onComplete?.();
      }
    },
    [spinning, spins, result, handleSpin, onComplete],
  );

  const wheelSegments = messages.map((_, i) => {
    const angle = (360 / messages.length) * i;
    return (
      <div
        key={i}
        className="absolute inset-0 origin-[50%_50%]"
        style={{
          clipPath: `polygon(50% 50%, ${Math.cos((angle * Math.PI) / 180) * 50 + 50}% ${Math.sin((angle * Math.PI) / 180) * 50 + 50}%, ${Math.cos(((angle + 360 / messages.length) * Math.PI) / 180) * 50 + 50}% ${Math.sin(((angle + 360 / messages.length) * Math.PI) / 180) * 50 + 50}%)`,
          backgroundColor: ['#F472B6', '#A78BFA', '#34D399', '#FCD34D', '#FBBF24', '#60A5FA'][i % 6],
          transform: `rotate(${angle}deg)`,
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-12 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center text-xs font-medium text-[var(--color-text-primary)] whitespace-nowrap" style={{ transform: `rotate(-${angle}deg)` }}>
          {messages[i]}
        </div>
      </div>
    );
  });

  return (
    <div className="clay-card p-8 sm:p-12 max-w-md mx-auto text-center" role="region" aria-label="Prize roulette card">
      <div className="clay-icon-btn clay-icon-btn-lg mx-auto mb-6" style={{ background: 'var(--color-butter)', color: 'var(--color-text-primary)' }} aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6V2M12 12v4M4.93 4.93l7.07 7.07M17.5 17.5l-7.07-7.07M7.07 16.93l7.07-7.07M16.93 7.07l-7.07 7.07"/></svg>
      </div>

      <h2 className="font-display text-xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Spin for a surprise</h2>

      <div className="relative w-48 h-48 mx-auto mb-8 group" style={{ transition: prefersReducedMotion ? 'none' : `transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)`, transform: `rotate(${rotation}deg)` }}>
        <div className="absolute inset-0 rounded-full border-8 border-[var(--color-border)]" />
        <div className="absolute inset-0 rounded-full overflow-hidden" style={{ maskImage: 'radial-gradient(circle, white 70%, transparent 70%)' }}>
          {wheelSegments}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/4 w-4 h-8 rounded-full bg-[var(--color-brand-500)] shadow-lg" />
      </div>

      {spins > 0 && !spinning && !result && (
        <button type="button" role="button" aria-label={`Spin the wheel (${spins} spins remaining)`} onClick={handleSpin} onKeyDown={handleKeyDown} className="clay-btn clay-btn-primary clay-btn-lg animate-pulse">Spin the wheel ðŸŽ¡</button>
      )}

      {spinning && (
        <p className="text-lg text-[var(--color-text-secondary)] mb-4">Spinningâ€¦</p>
      )}

      {result && !spinning && (
        <div className="animate-scale-in">
          <div className="clay-card-static p-6 rounded-xl bg-[var(--color-surface-lavender)] mb-6">
            <p className="text-xl font-bold text-center" style={{ color: 'var(--color-text-primary)' }}>{result}</p>
          </div>
          {spins > 0 ? (
            <button type="button" role="button" aria-label="Spin again" onClick={handleSpin} onKeyDown={handleKeyDown} className="clay-btn clay-btn-secondary clay-btn-lg">Spin again</button>
          ) : (
            <button type="button" role="button" aria-label="Continue to next card" onClick={onComplete} onKeyDown={handleKeyDown} className="clay-btn clay-btn-primary clay-btn-lg">Continue â†’</button>
          )}
        </div>
      )}
    </div>
  );
}
