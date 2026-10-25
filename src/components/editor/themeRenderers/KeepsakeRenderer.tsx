/**
 * KeepsakeRenderer — Stage 6 theme renderer.
 *
 * Warm paper theme: card layout, grid photos, top-aligned message, soft fade-in.
 * Click-to-enter opening, animated message reveal, photo memories, restart/replay.
 */

import { useState } from 'react';
import type { BirthdayProject, Theme } from '@/types';

interface Props {
  project: BirthdayProject;
  theme: Theme;
  onMusicToggle: () => void;
}

export function KeepsakeRenderer({ project, theme, onMusicToggle }: Props) {
  const [stage, setStage] = useState<'entrance' | 'reveal' | 'closed'>('entrance');

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

  const [musicPlaying, setMusicPlaying] = useState(false);

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
          <div className="clay-icon-btn clay-icon-btn-lg mb-6 animate-pop" style={{ background: theme.colors.surface, color: theme.colors.primary }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><polyline points="8 12 12 16 16 12"/></svg>
          </div>
          <h1 className="font-display text-4xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>{project.recipientName}</h1>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8">A little something for your birthday</p>
          <button type="button" className="clay-btn clay-btn-primary clay-btn-lg animate-pop" onClick={handleEnter}>
            Open keepsake ✦
          </button>
        </div>
      )}

      {stage === 'reveal' && (
        <div className="min-h-screen flex flex-col px-6 py-20 max-w-2xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <span className="font-display text-sm font-bold tracking-widest uppercase text-[var(--color-secondary)]">{project.recipientName}</span>
            <button type="button" className="clay-icon-btn clay-icon-btn-sm" style={{ background: theme.colors.surface, color: theme.colors.primary }} onClick={handleMusic} aria-pressed={musicPlaying} aria-label="Toggle music">
              {musicPlaying ? '❚❚' : '♪'}
            </button>
          </header>

          <div className="clay-card p-8 mb-8 animate-fade-in">
            <div className="text-[var(--color-secondary)] text-sm font-semibold mb-3 tracking-widest uppercase">Happy birthday</div>
            <h1 className="font-display text-3xl font-bold mb-6 leading-snug">{project.recipientName}</h1>
            <p className="text-body text-lg leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{project.message}</p>
          </div>

          {project.photos.length > 0 && (
            <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <h2 className="font-display text-xl font-bold mb-5" style={{ letterSpacing: '-0.02em' }}>Memories</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {project.photos.map((photo, idx) => (
                  <div key={photo.id} className={`relative rounded-2xl overflow-hidden border border-[var(--color-border-strong)] shadow-sm animate-fade-in group`} style={{ animationDelay: `${200 + idx * 120}ms` }}>
                    <img src={photo.dataUrl} alt={photo.altText || ''} className="w-full h-52 object-cover" />
                    <div className="p-4">
                      <p className="text-sm text-[var(--color-text-secondary)]">{photo.fileName}</p>
                      {photo.caption && <p className="text-xs text-[var(--color-text-primary)] mt-1">{photo.caption}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-10 flex items-center gap-3">
            <button type="button" className="clay-btn clay-btn-ghost text-sm" onClick={handleReplay}>Replay</button>
            <button type="button" className="clay-btn clay-btn-ghost text-sm" onClick={handleClose}>Close</button>
          </div>
        </div>
      )}

      {stage === 'closed' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center p-6" style={{ background: theme.colors.background }}>
          <div className="clay-icon-btn clay-icon-btn-lg mb-6 animate-scale-in" style={{ background: theme.colors.surface, color: theme.colors.primary }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Saved as a keepsake</h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-6">Thank you for celebrating.</p>
          <button type="button" className="clay-btn clay-btn-primary" onClick={handleReplay}>Open again</button>
        </div>
      )}
    </div>
  );
}
