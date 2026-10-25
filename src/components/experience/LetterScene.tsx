/**
 * LetterScene — a themed, animated letter-opening moment.
 *
 * The website's Gilded Porcelain palette drives every color. The scene opens
 * automatically, while the early tap, skip action, and continue remain accessible.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { playSfx } from '@/lib/media/sound';
import '@/styles/letter-scene.css';

interface Props {
  letterText: string;
  recipientName: string;
  sfxEnabled: boolean;
  reducedMotion: boolean;
  onComplete?: () => void;
}

type LetterPhase = 'sealed' | 'opening' | 'reading';

export function LetterScene({
  letterText,
  recipientName,
  sfxEnabled,
  reducedMotion,
  onComplete,
}: Props): React.ReactElement {
  const [phase, setPhase] = useState<LetterPhase>('sealed');
  const [typedCharacters, setTypedCharacters] = useState(0);
  const [done, setDone] = useState(false);

  const paragraphs = useMemo(
    () => letterText.split(/\n{2,}|\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
    [letterText],
  );
  const paragraphStarts = useMemo(() => {
    let cursor = 0;
    return paragraphs.map((paragraph) => {
      const start = cursor;
      cursor += paragraph.length + 2;
      return start;
    });
  }, [paragraphs]);
  const totalCharacters = useMemo(
    () => paragraphs.reduce((total, paragraph) => total + paragraph.length, 0) + Math.max(0, paragraphs.length - 1) * 2,
    [paragraphs],
  );
  const systemReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldReduceMotion = reducedMotion || systemReducedMotion;

  const startOpening = useCallback(() => {
    setPhase((currentPhase) => currentPhase === 'sealed' ? 'opening' : currentPhase);
    if (sfxEnabled) playSfx('flip');
  }, [sfxEnabled]);

  const showLetter = useCallback(() => {
    setPhase('reading');
    setTypedCharacters(totalCharacters);
    if (sfxEnabled) playSfx('chime', { volume: 0.55 });
  }, [sfxEnabled, totalCharacters]);

  useEffect(() => {
    if (shouldReduceMotion) {
      setPhase('reading');
      setTypedCharacters(totalCharacters);
      return;
    }
    const timer = window.setTimeout(startOpening, 1100);
    return () => window.clearTimeout(timer);
  }, [shouldReduceMotion, startOpening, totalCharacters]);

  useEffect(() => {
    if (phase !== 'opening') return;
    const timer = window.setTimeout(() => {
      setPhase('reading');
      setTypedCharacters(0);
    }, 2800);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'reading') return;
    if (shouldReduceMotion) {
      setDone(true);
      return;
    }
    if (typedCharacters >= totalCharacters) {
      const timer = window.setTimeout(() => setDone(true), 450);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setTypedCharacters((count) => count + 1), 38);
    return () => window.clearTimeout(timer);
  }, [phase, typedCharacters, totalCharacters, shouldReduceMotion]);

  return (
    <section
      className={`letter-scene letter-scene--${phase}`}
      aria-label={`Birthday letter for ${recipientName}`}
    >
      <div className="letter-scene__glow letter-scene__glow--one" aria-hidden="true" />
      <div className="letter-scene__glow letter-scene__glow--two" aria-hidden="true" />
      <div className="letter-scene__sparks" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
      </div>

      <div className="letter-scene__content">
        <p className="letter-scene__eyebrow">
          A letter for {recipientName}
        </p>

        <div className="letter-stage">
          <article
            className="letter-sheet"
            aria-label={`Personal birthday message for ${recipientName}`}
          >
            <div className="letter-sheet__ornament" aria-hidden="true">✦</div>
            <h2 className="letter-sheet__title">A little note for you</h2>
            <div className="letter-sheet__divider" aria-hidden="true" />
            <p className="sr-only">{letterText}</p>
            <div className="letter-sheet__copy" aria-hidden="true">
              {paragraphs.map((paragraph, index) => {
                const start = paragraphStarts[index] ?? 0;
                const visibleCharacters = Math.max(0, Math.min(paragraph.length, typedCharacters - start));
                const visibleText = paragraph.slice(0, visibleCharacters);
                const isActiveParagraph =
                  visibleCharacters > 0 &&
                  typedCharacters >= start &&
                  typedCharacters <= start + paragraph.length;

                if (visibleText.length === 0) return null;

                return (
                  <p
                    key={`${index}-${paragraph.slice(0, 12)}`}
                    className={index === 0 ? 'letter-sheet__greeting' : undefined}
                    style={{ color: index === 0 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                  >
                    {visibleText}
                    {isActiveParagraph ? <span className="letter-sheet__cursor" aria-hidden="true" /> : null}
                  </p>
                );
              })}
            </div>
          </article>

          <div className="envelope" aria-hidden="true">
            <div className="envelope__back" />
            <div className="envelope__flap" />
            <div className="envelope__pocket" />
            <div className="envelope__seal">♥</div>
            <div className="envelope__shine" />
          </div>
        </div>

        <div className="letter-scene__actions">
          {phase === 'sealed' ? (
            <button type="button" className="letter-scene__button" onClick={startOpening}>
              Open my letter <span aria-hidden="true">→</span>
            </button>
          ) : null}
          {phase === 'opening' ? (
            <p className="letter-scene__status">
              <span className="letter-scene__status-dot" />
              A surprise is unfolding…
            </p>
          ) : null}
          {phase === 'reading' && !done ? (
            <button type="button" className="letter-scene__skip" onClick={showLetter}>
              Skip the reveal
            </button>
          ) : null}
          {phase === 'reading' && done ? (
            <button type="button" className="letter-scene__button letter-scene__button--continue" onClick={() => { if (sfxEnabled) playSfx('pop'); onComplete?.(); }}>
              Continue the celebration <span aria-hidden="true">→</span>
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
