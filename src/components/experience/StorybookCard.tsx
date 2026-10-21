/**
 * StorybookCard — Stage 12 interactive birthday card.
 *
 * An interactive personalized storybook with chapters.
 * Keyboard accessible: Enter/Space to turn pages.
 * Respects prefers-reduced-motion.
 */

import * as React from 'react';
import type { BirthdayProject } from '@/types';
import type { StorybookChapter } from '@/lib/experience/types';

interface Props {
  project: BirthdayProject;
  config?: { chapters?: StorybookChapter[] };
  onComplete?: () => void;
  reducedMotion: boolean;
}

export function StorybookCard({ project, config, onComplete, reducedMotion }: Props) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [completed, setCompleted] = React.useState(false);

  const chapters: StorybookChapter[] = config?.chapters ?? [
    { id: '1' as any, title: 'Once Upon a Time...', text: 'In a world not so far away, there lived someone truly special...' },
    { id: '2' as any, title: 'The Adventure Begins', text: 'Every year brought new adventures, laughter, and wonderful memories.' },
    { id: '3' as any, title: 'A Special Day', text: 'And today, the whole world celebrates YOU!' },
  ];

  const currentChapter = chapters[currentPage];
  if (!currentChapter) {
    return null;
  }
  const isLastPage = currentPage === chapters.length - 1;
  const prefersReducedMotion = reducedMotion;

  const turnPage = React.useCallback(() => {
    if (isLastPage) {
      setCompleted(true);
      setTimeout(() => onComplete?.(), 800);
    } else {
      setCurrentPage(prev => prev + 1);
    }
  }, [isLastPage, onComplete]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (completed) {
          onComplete?.();
        } else {
          turnPage();
        }
      }
    },
    [completed, turnPage, onComplete]
  );

  if (completed) {
    return (
      <div className="clay-card p-8 sm:p-12 max-w-md mx-auto text-center" role="region" aria-label="Storybook card">
        <div className="clay-icon-btn clay-icon-btn-lg mx-auto mb-6 animate-pop" style={{ background: 'var(--color-peach)', color: 'var(--color-text-primary)' }} aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17l-5-5"/></svg>
        </div>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>The End... for now ✨</h1>
        <p className="text-lg text-[var(--color-text-secondary)] mb-8">What a wonderful story, {project.recipientName || 'Someone Special'}!</p>
        <button type="button" role="button" aria-label="Continue to next card" onClick={onComplete} onKeyDown={handleKeyDown} className="clay-btn clay-btn-primary clay-btn-lg">Continue →</button>
      </div>
    );
  }

  return (
    <div className="clay-card p-8 sm:p-12 max-w-md mx-auto" role="region" aria-label="Storybook card">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
          Chapter {currentPage + 1} of {chapters.length}
        </span>
      </div>

      <div className="relative mb-8" style={{ transition: prefersReducedMotion ? 'none' : 'transform 0.4s ease, opacity 0.4s ease' }}>
        <div className="absolute inset-0 bg-[var(--color-surface-lavender)] rounded-xl opacity-50" />
        <div className="relative p-6 bg-white/50 backdrop-blur rounded-xl border border-[var(--color-border)]">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>{currentChapter.title}</h2>
          <p className="text-body text-lg leading-relaxed" style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-secondary)' }}>{currentChapter.text}</p>
        </div>
        {currentChapter.imageId && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-[var(--color-surface)] border-4 border-[var(--color-page)] shadow-lg overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-[var(--color-peach)] to-[var(--color-rose)]" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        {chapters.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === currentPage}
            aria-label={`Chapter ${i + 1}`}
            onClick={() => setCurrentPage(i)}
            disabled={completed}
            className={`w-2 h-2 rounded-full transition-all ${i === currentPage ? 'bg-[var(--color-brand-500)] w-6' : 'bg-[var(--color-border)] hover:bg-[var(--color-text-tertiary)]'}`}
            style={{ transition: prefersReducedMotion ? 'none' : 'all 0.3s ease' }}
          />
        ))}
      </div>

      <button
        type="button"
        role="button"
        aria-label={isLastPage ? 'Finish the story' : 'Turn page'}
        onClick={turnPage}
        onKeyDown={handleKeyDown}
        className="w-full clay-btn clay-btn-primary clay-btn-lg"
      >
        {isLastPage ? 'The End →' : 'Turn page →'}
      </button>
    </div>
  );
}