/**
 * StorybookBook — the "Our story" open book for the birthday experience.
 *
 * One open spread at a time: the left page carries the memory portrait and
 * the right page carries the chapter text. Page turns are implemented in
 * pure CSS (a leaf that rotates around the spine) so the scene has no
 * third-party dependency.
 *
 * Every colour comes from the website's "Gilded Porcelain" tokens so the book
 * always feels part of the site, whatever theme the project picked.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BirthdayProject, ProjectPhoto, Theme } from '@/types';
import type { StorybookChapter } from '@/lib/experience/types';
import { playSfx, unlockAudio } from '@/lib/media/sound';
import '@/styles/storybook-book.css';

interface Props {
  project: BirthdayProject;
  theme: Theme;
  chapters: StorybookChapter[];
  letterText: string;
  reducedMotion: boolean;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  musicPlaying: boolean;
  onToggleMusic?: () => void | Promise<void>;
  onComplete: () => void;
  onExit?: () => void;
}

interface Spread {
  id: string;
  label: string;
  title: string;
  body: string;
  photo: ProjectPhoto | undefined;
  closing: boolean;
}

interface ConfettiMark {
  top: string;
  left: string;
  size: string;
  color: string;
  rotate: string;
  round: boolean;
}

/** Paper confetti scattered around the portrait on the left page. */
const CONFETTI: ConfettiMark[] = [
  { top: '11%', left: '14%', size: '9px', color: 'var(--color-brand-300)', rotate: '-16deg', round: false },
  { top: '24%', left: '7%', size: '7px', color: 'var(--color-gold)', rotate: '22deg', round: true },
  { top: '72%', left: '11%', size: '8px', color: 'var(--color-mint)', rotate: '34deg', round: false },
  { top: '84%', left: '24%', size: '6px', color: 'var(--color-periwinkle)', rotate: '-12deg', round: true },
  { top: '16%', left: '82%', size: '7px', color: 'var(--color-peach)', rotate: '18deg', round: false },
  { top: '38%', left: '90%', size: '9px', color: 'var(--color-brand-200)', rotate: '-26deg', round: true },
  { top: '66%', left: '86%', size: '6px', color: 'var(--color-gold-light)', rotate: '12deg', round: false },
  { top: '88%', left: '70%', size: '8px', color: 'var(--color-rose-light)', rotate: '-8deg', round: true },
];

/** Find the photo that belongs to a chapter, falling back to a rotating pick. */
function findChapterPhoto(
  chapter: StorybookChapter,
  chapterIndex: number,
  photos: ProjectPhoto[],
): ProjectPhoto | undefined {
  if (chapter.imageId) {
    const exact = photos.find((photo) => photo.id === chapter.imageId);
    if (exact) return exact;
  }
  if (photos.length === 0) return undefined;
  return photos[chapterIndex % photos.length];
}

/** Split a chapter body into readable paragraphs. */
function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

interface PortraitPageProps {
  spread: Spread;
}

function PortraitPage({ spread }: PortraitPageProps): React.ReactElement {
  return (
    <div className="storybook-book__page storybook-book__page--left">
      <div className="storybook-book__dots" aria-hidden="true" />
      <div className="storybook-book__confetti" aria-hidden="true">
        {CONFETTI.map((mark) => (
          <span
            key={`${mark.top}-${mark.left}`}
            className={`storybook-book__confetti-mark${mark.round ? ' is-round' : ''}`}
            style={{
              top: mark.top,
              left: mark.left,
              width: mark.size,
              height: mark.size,
              background: mark.color,
              transform: `rotate(${mark.rotate})`,
            }}
          />
        ))}
      </div>

      <figure className="storybook-book__portrait">
        {spread.photo ? (
          <img
            src={spread.photo.dataUrl}
            alt={spread.photo.altText || spread.photo.caption || 'A shared memory'}
          />
        ) : (
          <img
            src={spread.closing ? '/assets/letters/love-letter.svg' : '/assets/gifts/gift-box.svg'}
            alt=""
          />
        )}
        {spread.photo?.caption ? <figcaption>{spread.photo.caption}</figcaption> : null}
      </figure>
    </div>
  );
}

interface TextPageProps {
  spread: Spread;
  folio: number;
}

function TextPage({ spread, folio }: TextPageProps): React.ReactElement {
  return (
    <div className="storybook-book__page storybook-book__page--right">
      <p className="storybook-book__chapter-label">{spread.label}</p>
      <h2 className="storybook-book__chapter-title">{spread.title}</h2>
      <div className="storybook-book__prose">
        {paragraphs(spread.body).map((paragraph, paragraphIndex) => (
          <p
            key={`${spread.id}-paragraph-${paragraphIndex}`}
            className={paragraphIndex === 0 ? 'storybook-book__dropcap' : undefined}
          >
            {paragraph}
          </p>
        ))}
      </div>
      <span className="storybook-book__folio" aria-hidden="true">
        {folio}
      </span>
    </div>
  );
}

type TurnDirection = 'next' | 'back';

/**
 * Viewport at or below which the spread collapses into a single page. Kept in
 * sync with the `max-width: 700px` breakpoint in storybook-book.css.
 */
const COMPACT_QUERY = '(max-width: 700px)';

interface TurnState {
  /** Index the reader is leaving. */
  from: number;
  /** Index the reader is arriving at. */
  to: number;
  direction: TurnDirection;
}

export default function StorybookBook({
  project,
  theme,
  chapters,
  letterText,
  reducedMotion,
  sfxEnabled,
  musicEnabled,
  musicPlaying,
  onToggleMusic,
  onComplete,
  onExit,
}: Props): React.ReactElement {
  const photos = useMemo(() => project.photos ?? [], [project.photos]);

  const spreads = useMemo<Spread[]>(() => {
    const chapterSpreads: Spread[] = chapters.map((chapter, index) => ({
      id: chapter.id,
      label: `Chapter ${index + 1}`,
      title: chapter.title || `Chapter ${index + 1}`,
      body: chapter.text || '',
      photo: findChapterPhoto(chapter, index, photos),
      closing: false,
    }));

    const closingBody = (letterText || project.customMessage || project.message || '').trim();
    if (closingBody) {
      chapterSpreads.push({
        id: 'storybook-closing',
        label: 'The last page',
        title: `A note for ${project.recipientName || 'you'}`,
        body: closingBody,
        photo: undefined,
        closing: true,
      });
    }

    return chapterSpreads;
  }, [chapters, letterText, photos, project.customMessage, project.message, project.recipientName]);

  const [index, setIndex] = useState(0);
  const [turnState, setTurnState] = useState<TurnState | null>(null);
  const [finished, setFinished] = useState(false);
  const turningRef = useRef(false);

  // Honour both the scene setting and the system preference so the CSS
  // animation and the commit timer below always agree.
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent): void => setSystemReducedMotion(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  const shouldReduceMotion = reducedMotion || systemReducedMotion;

  // Below the breakpoint the spread becomes a single stacked page, so the
  // 3D leaf has no spine to hinge on and is replaced by a simple fade.
  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(COMPACT_QUERY);
    setIsCompact(query.matches);
    const onChange = (event: MediaQueryListEvent): void => setIsCompact(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  /*
   * A turn is "flat" when there is nothing to sweep: either the reader asked
   * for less motion, or the layout is a single page with no spine. In both
   * cases the spread swaps to the incoming chapter straight away.
   */
  const isFlatTurn = shouldReduceMotion || isCompact;

  const total = spreads.length;
  const current = spreads[Math.min(index, Math.max(total - 1, 0))];
  const isLast = total > 0 && index >= total - 1;
  const canGoBack = index > 0 && !turnState;
  const displayIndex = turnState ? turnState.to : index;

  /*
   * While a leaf is mid-turn the two columns show different spreads so the
   * animation reads as a real sheet swinging across the spine:
   *   next — the leaf's front carries the outgoing chapter and swings left,
   *          revealing the incoming chapter underneath on the right;
   *   back — the leaf swings right again, uncovering the incoming chapter.
   */
  const staticLeft = turnState
    ? spreads[isFlatTurn ? turnState.to : turnState.direction === 'next' ? turnState.from : turnState.to]
    : current;
  const staticRight = turnState
    ? spreads[isFlatTurn ? turnState.to : turnState.direction === 'next' ? turnState.to : turnState.from]
    : current;
  const staticRightFolio = turnState
    ? (isFlatTurn ? turnState.to : turnState.direction === 'next' ? turnState.to : turnState.from) + 1
    : index + 1;

  /*
   * Re-keying the pages on the incoming chapter restarts the CSS entrance
   * animation used by the compact, single-page layout. The wide layout keeps
   * a stable key so its pages update in place while the leaf sweeps.
   */
  const pageKey = isCompact ? `page-${turnState ? turnState.to : index}` : 'page';

  const turn = useCallback(
    (step: 1 | -1) => {
      if (turningRef.current) return;
      const target = index + step;

      // Advancing past the final spread finishes the story.
      if (step === 1 && index === total - 1) {
        unlockAudio();
        setFinished(true);
        onComplete();
        return;
      }

      if (target < 0 || target > total - 1) return;

      unlockAudio();
      if (sfxEnabled) playSfx('flip');

      turningRef.current = true;
      setTurnState({
        from: index,
        to: target,
        direction: step === 1 ? 'next' : 'back',
      });
    },
    [index, onComplete, sfxEnabled, total],
  );

  // Commit the new page once the leaf has finished sweeping across the spine.
  useEffect(() => {
    if (!turnState) return;
    const duration = shouldReduceMotion ? 0 : 720;
    const timer = window.setTimeout(() => {
      setIndex(turnState.to);
      setTurnState(null);
      turningRef.current = false;
    }, duration);
    return () => window.clearTimeout(timer);
  }, [turnState, shouldReduceMotion]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        turn(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        turn(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [turn]);

  const toggleMusic = useCallback(() => {
    unlockAudio();
    void onToggleMusic?.();
  }, [onToggleMusic]);

  const handleExit = useCallback(() => {
    unlockAudio();
    onExit?.();
  }, [onExit]);

  if (!current) {
    return (
      <section className="storybook-book" aria-label="Storybook">
        <p className="storybook-book__empty">This story is still being written…</p>
      </section>
    );
  }

  return (
    <section
      className={`storybook-book${shouldReduceMotion ? ' storybook-book--reduced' : ''}${isCompact ? ' storybook-book--compact' : ''}`}
      data-theme={theme.id}
      aria-label={`Storybook for ${project.recipientName || 'you'}`}
    >
      <div className="storybook-book__glow storybook-book__glow--one" aria-hidden="true" />
      <div className="storybook-book__glow storybook-book__glow--two" aria-hidden="true" />

      <header className="storybook-book__masthead">
        <p className="storybook-book__eyebrow">Chapter by chapter</p>
        <h1 className="storybook-book__title">Our story</h1>
        <div className="storybook-book__masthead-tools">
          {musicEnabled ? (
            <button
              type="button"
              className="storybook-book__tool"
              onClick={toggleMusic}
              aria-pressed={musicPlaying}
            >
              {musicPlaying ? 'Pause music' : 'Tap to hear'}
            </button>
          ) : null}
          {onExit ? (
            <button type="button" className="storybook-book__tool" onClick={handleExit}>
              Close
            </button>
          ) : null}
        </div>
      </header>

      <div className="storybook-book__stage">
        <button
          type="button"
          className="storybook-book__nav storybook-book__nav--prev"
          onClick={() => turn(-1)}
          disabled={!canGoBack}
          aria-label="Previous page"
        >
          <span aria-hidden="true">‹</span>
        </button>

        <div className="storybook-book__book">
          <div className="storybook-book__cover">
            <div
              className="storybook-book__spread"
              style={{ perspective: '2000px' }}
              aria-live="polite"
            >
              {/* Static left page — the illustration stays put while the leaf turns. */}
              <PortraitPage key={`${pageKey}-left`} spread={staticLeft!} />

              {/* Right-hand stack: the live page plus the leaf that turns. */}
              <div className="storybook-book__stack">
                {turnState && !isFlatTurn ? (
                  <div
                    key={`leaf-${turnState.from}-${turnState.to}`}
                    className={`storybook-book__leaf storybook-book__leaf--${turnState.direction}`}
                    aria-hidden="true"
                  >
                    <div className="storybook-book__leaf-face storybook-book__leaf-face--front">
                      {turnState.direction === 'next' ? (
                        <TextPage spread={spreads[turnState.from]!} folio={turnState.from + 1} />
                      ) : (
                        <TextPage spread={spreads[turnState.to]!} folio={turnState.to + 1} />
                      )}
                    </div>
                    <div className="storybook-book__leaf-face storybook-book__leaf-face--back">
                      {turnState.direction === 'next' ? (
                        <PortraitPage spread={spreads[turnState.to]!} />
                      ) : (
                        <PortraitPage spread={spreads[turnState.from]!} />
                      )}
                    </div>
                  </div>
                ) : null}

                <TextPage key={`${pageKey}-right`} spread={staticRight!} folio={staticRightFolio} />
              </div>
            </div>
          </div>
          <div className="storybook-book__ribbon" aria-hidden="true" />
        </div>

        <button
          type="button"
          className="storybook-book__nav storybook-book__nav--next"
          onClick={() => turn(1)}
          aria-label={isLast ? 'Finish the story' : 'Next page'}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <footer className="storybook-book__controls">
        <p className="storybook-book__pager">
          <span className="storybook-book__pager-dot" aria-hidden="true" />
          Page {displayIndex + 1} of {total}
        </p>
        <p className="storybook-book__hint">
          {finished ? 'The end — thank you for reading' : 'turn the page'}
        </p>
      </footer>
    </section>
  );
}
