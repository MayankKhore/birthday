/**
 * LetterScene — animated birthday-letter reveal.
 * The paper unfolds, then each paragraph fades/slides in line by line.
 * Fully keyboard accessible; respects reduced motion (instant reveal).
 */

import { useEffect, useMemo, useState } from 'react';
import { playSfx } from '@/lib/media/sound';

interface Props {
  letterText: string;
  recipientName: string;
  sfxEnabled: boolean;
  reducedMotion: boolean;
  onComplete?: () => void;
}

export function LetterScene({ letterText, recipientName, sfxEnabled, reducedMotion, onComplete }: Props): React.ReactElement {
  const [unfolded, setUnfolded] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [done, setDone] = useState(false);

  const paragraphs = useMemo(() => letterText.split(/\n{2,}|\n/).map((p) => p.trim()).filter((p) => p.length > 0), [letterText]);
  const total = paragraphs.length;

  useEffect(() => {
    if (reducedMotion) {
      setUnfolded(true);
      setVisibleLines(total);
      return;
    }
    const t1 = window.setTimeout(() => {
      setUnfolded(true);
      if (sfxEnabled) playSfx('flip');
    }, 450);
    return () => window.clearTimeout(t1);
  }, [reducedMotion, sfxEnabled, total]);

  useEffect(() => {
    if (!unfolded || reducedMotion) return;
    if (visibleLines >= total) return;
    const t = window.setTimeout(() => {
      setVisibleLines((v) => v + 1);
      if (sfxEnabled && visibleLines > 0) playSfx('flip', { volume: 0.5 });
    }, visibleLines === 0 ? 500 : 650);
    return () => window.clearTimeout(t);
  }, [unfolded, visibleLines, total, reducedMotion, sfxEnabled]);

  useEffect(() => {
    if (visibleLines >= total && total > 0 && !done) {
      const t = window.setTimeout(() => setDone(true), reducedMotion ? 0 : 700);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [visibleLines, total, done, reducedMotion]);

  return (
    <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center p-6 overflow-y-auto" style={{ background: 'var(--color-page)' }}>
      <div className="w-full max-w-xl text-center">
        <p className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>A letter for {recipientName}</p>
        <div
          className="clay-card-static text-left"
          style={{
            padding: 'var(--space-8) var(--space-6)',
            background: 'linear-gradient(170deg, #FFFFFF 0%, #FDF6F9 70%, #FBF2E7 100%)',
            transform: unfolded ? 'rotateX(0deg) scale(1)' : 'rotateX(55deg) scale(0.94)',
            opacity: unfolded ? 1 : 0.35,
            transformOrigin: 'top center',
            transition: reducedMotion ? 'none' : 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease',
            boxShadow: 'var(--clay-shadow-lg)',
          }}
          role="region"
          aria-label={`Birthday letter for ${recipientName}`}
          aria-live="polite"
        >
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={i === 0 ? 'font-display' : 'text-body'}
              style={{
                fontSize: i === 0 ? 'var(--text-2xl)' : 'var(--text-base)',
                fontWeight: i === 0 ? 700 : 400,
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--leading-relaxed)',
                marginBottom: i === paragraphs.length - 1 ? 0 : 'var(--space-4)',
                whiteSpace: 'pre-wrap',
                opacity: i < visibleLines ? 1 : 0,
                transform: i < visibleLines ? 'translateY(0)' : 'translateY(14px)',
                filter: i < visibleLines ? 'blur(0)' : 'blur(3px)',
                transition: reducedMotion ? 'none' : 'opacity 0.6s ease, transform 0.6s ease, filter 0.6s ease',
              }}
            >
              {p}
            </p>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2" style={{ marginTop: 'var(--space-5)' }} aria-hidden="true">
          {paragraphs.map((_, i) => (
            <span
              key={i}
              style={{
                width: i < visibleLines ? '22px' : '8px',
                height: '8px',
                borderRadius: '9999px',
                background: i < visibleLines ? 'var(--color-brand-500)' : 'var(--color-border)',
                transition: reducedMotion ? 'none' : 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {done ? (
          <button
            type="button"
            aria-label="Continue"
            onClick={() => { if (sfxEnabled) playSfx('pop'); onComplete?.(); }}
            className="clay-btn clay-btn-primary clay-btn-lg animate-scale-in"
            style={{ marginTop: 'var(--space-6)' }}
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            className="clay-btn clay-btn-ghost clay-btn-sm"
            style={{ marginTop: 'var(--space-6)' }}
            onClick={() => { setUnfolded(true); setVisibleLines(total); }}
          >
            Skip the reveal
          </button>
        )}
      </div>
    </div>
  );
}
