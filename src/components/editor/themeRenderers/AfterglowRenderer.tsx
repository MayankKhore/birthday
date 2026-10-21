/**
 * AfterglowRenderer — Stage 6 theme renderer (Premium).
 *
 * Editorial typography theme: fullscreen dark surfaces, cinematic message
 * reveal, hero photo, overlay message position. Click-to-enter opening,
 * animated reveal, photo hero, restart/replay, music controls.
 */

import { useState } from 'react';
import type { BirthdayProject, Theme } from '@/types';

interface Props {
  project: BirthdayProject;
  theme: Theme;
  onMusicToggle: () => void;
}

export function AfterglowRenderer({ project, theme, onMusicToggle }: Props) {
  const [stage, setStage] = useState<'entrance' | 'reveal' | 'closed'>('entrance');
  const [musicPlaying, setMusicPlaying] = useState(false);

  const handleEnter = () => setStage('reveal');
  const handleReplay = () => setStage('entrance');
  const handleClose = () => setStage('closed');

  const handleMusic = () => {
    setMusicPlaying((p) => {
      const next = !p;
      onMusicToggle();
      return next;
    });
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        background: theme.colors.background,
        color: theme.colors.textPrimary,
        fontFamily: theme.fonts.body,
      }}
    >
      <div className="absolute inset-0 -z-10" style={{ background: theme.colors.gradient }} />

      {stage === 'entrance' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center p-6" style={{ background: theme.colors.background }}>
          <div className="clay-icon-btn clay-icon-btn-lg mb-8 animate-pop" style={{ background: 'rgba(255,255,255,0.08)', color: theme.colors.textPrimary }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>
          </div>
          <h1 className="font-display text-5xl font-bold mb-3 tracking-tight" style={{ letterSpacing: '-0.03em' }}>{project.recipientName}</h1>
          <p className="text-xl text-[var(--color-text-secondary)] mb-10 tracking-wide uppercase">A birthday to remember</p>
          <button type="button" className="clay-btn clay-btn-primary clay-btn-lg animate-pop" onClick={handleEnter}>
            Enter
          </button>
        </div>
      )}

      {stage === 'reveal' && (
        <div className="min-h-screen flex flex-col px-6 py-24">
          <header className="flex items-center justify-between mb-12">
            <span className="font-display text-xs font-bold tracking-widest uppercase text-[var(--color-text-secondary)]">{project.recipientName}</span>
            <button type="button" className="clay-icon-btn clay-icon-btn-sm" style={{ background: 'rgba(255,255,255,0.08)', color: theme.colors.textPrimary }} onClick={handleMusic} aria-pressed={musicPlaying} aria-label="Toggle music">
              {musicPlaying ? '❚❚' : '♪'}
            </button>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center relative">
            {project.photos.length > 0 && project.photos[0] ? (
              <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img src={project.photos[0].dataUrl} alt="Hero memory" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/90 via-[var(--color-primary)]/40 to-transparent" />
              </div>
            ) : null}
            <div className="relative z-10 animate-scale-in mb-8" style={{ animationDelay: '300ms' }}>
              <h2 className="font-display text-xs font-bold tracking-widest uppercase text-[var(--color-text-secondary)] mb-4">A birthday message for</h2>
              <h1 className="font-display text-6xl font-bold mb-8 tracking-tight leading-none">{project.recipientName}</h1>
              <div className="clay-card p-12 max-w-lg mx-auto backdrop-blur-md bg-[var(--color-surface)]/80 border border-white/10">
                <p className="text-body text-lg leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{project.message}</p>
              </div>
            </div>

            {project.photos.length > 1 && (
              <section className="relative z-10 animate-fade-in mt-12" style={{ animationDelay: '700ms' }}>
                <h2 className="font-display text-sm font-bold tracking-widest uppercase text-[var(--color-text-secondary)] mb-6">Additional memories</h2>
                <div className="grid gap-4 sm:grid-cols-2 max-w-md mx-auto">
                  {project.photos.slice(1).map((photo, idx) => (
                    <div key={photo.id} className="rounded-xl overflow-hidden border border-white/10 animate-fade-in group" style={{ animationDelay: `${800 + idx * 150}ms` }}>
                      <img src={photo.dataUrl} alt={photo.altText || ''} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-12 flex items-center gap-4">
              <button type="button" className="clay-btn clay-btn-ghost text-sm" onClick={handleReplay}>Replay</button>
              <button type="button" className="clay-btn clay-btn-ghost text-sm" onClick={handleClose}>Close</button>
            </div>
          </main>
        </div>
      )}

      {stage === 'closed' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center p-6" style={{ background: theme.colors.background }}>
          <div className="clay-icon-btn clay-icon-btn-lg mb-8 animate-scale-in" style={{ background: 'rgba(255,255,255,0.08)', color: theme.colors.textPrimary }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 className="font-display text-3xl font-bold mb-3 tracking-tight">Shared</h2>
          <p className="text-xl text-[var(--color-text-secondary)] mb-10">Thank you for celebrating.</p>
          <button type="button" className="clay-btn clay-btn-primary" onClick={handleReplay}>Open again</button>
        </div>
      )}
    </div>
  );
}