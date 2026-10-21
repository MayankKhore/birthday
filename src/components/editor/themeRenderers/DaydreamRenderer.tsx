/**
 * DaydreamRenderer — Stage 6 theme renderer.
 *
 * Airy colours theme: split layout, carousel photos, center message, confetti,
 * floating shapes. Click-to-enter opening, animated message reveal, confetti
 * burst, restart/replay.
 */

import { useState } from 'react';
import type { BirthdayProject, Theme } from '@/types';

interface Props {
  project: BirthdayProject;
  theme: Theme;
  onMusicToggle: () => void;
}

export function DaydreamRenderer({ project, theme, onMusicToggle }: Props) {
  const [stage, setStage] = useState<'entrance' | 'reveal' | 'closed'>('entrance');
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [confetti, setConfetti] = useState<number[]>([]);

  const handleEnter = () => {
    setStage('reveal');
    setConfetti(Array.from({ length: 40 }, (_, i) => i));
    setTimeout(() => setConfetti([]), 2000);
  };

  const handleReplay = () => {
    setStage('entrance');
    setConfetti([]);
  };

  const handleClose = () => setStage('closed');

  const handleMusic = () => {
    setMusicPlaying((p) => {
      const next = !p;
      onMusicToggle();
      return next;
    });
  };

  const shapes = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 60 + 40,
    color: ['#bfdbfe', '#fce7f3', '#bae6fd'][i % 3],
    delay: Math.random() * 6,
  }));

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
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {shapes.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              background: s.color,
              opacity: 0.5,
              filter: 'blur(40px)',
              animation: `floatGentle 7s ease-in-out ${s.delay}s infinite`,
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      {stage === 'entrance' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center p-6" style={{ background: theme.colors.background }}>
          <div className="clay-icon-btn clay-icon-btn-lg mb-6 animate-pop" style={{ background: theme.colors.surface, color: theme.colors.primary }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14l3 3 7-7"/></svg>
          </div>
          <h1 className="font-display text-4xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>{project.recipientName}</h1>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8">A daydream for your birthday</p>
          <button type="button" className="clay-btn clay-btn-primary clay-btn-lg animate-pop" onClick={handleEnter}>
            Step into the dream ✦
          </button>
        </div>
      )}

      {stage === 'reveal' && (
        <div className="min-h-screen flex flex-col px-6 py-20 text-center">
          <header className="flex items-center justify-center gap-3 mb-8">
            <span className="clay-badge clay-badge-primary text-xs">Birthday celebration</span>
            <span className="font-display text-sm font-bold tracking-widest uppercase text-[var(--color-secondary)]">{project.recipientName}</span>
            <button type="button" className="clay-icon-btn clay-icon-btn-sm" style={{ background: theme.colors.surface, color: theme.colors.primary }} onClick={handleMusic} aria-pressed={musicPlaying} aria-label="Toggle music">
              {musicPlaying ? '❚❚' : '♪'}
            </button>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center">
            <div className="animate-scale-in mb-8" style={{ animationDelay: '150ms' }}>
              <h1 className="font-display text-5xl font-bold mb-4 leading-tight">{project.recipientName}</h1>
              <div className="clay-card p-10 max-w-xl mx-auto backdrop-blur-sm bg-white/80 border border-[var(--color-border)]">
                <p className="text-body text-lg leading-relaxed italic" style={{ whiteSpace: 'pre-wrap' }}>{project.message}</p>
              </div>
            </div>

            {project.photos.length > 0 && (
              <section className="animate-fade-in mb-10" style={{ animationDelay: '500ms' }}>
                <h2 className="font-display text-xl font-bold mb-5">Carousel of memories</h2>
                <div className="flex gap-3 overflow-x-auto pb-4 snap-x scroll-smooth no-scrollbar">
                  {project.photos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className="snap-start flex-shrink-0 w-64 h-64 rounded-2xl overflow-hidden border border-[var(--color-border-strong)] shadow-sm animate-fade-in group"
                      style={{ animationDelay: `${300 + idx * 150}ms` }}
                    >
                      <img src={photo.dataUrl} alt={photo.altText || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-8 flex items-center justify-center gap-3">
              <button type="button" className="clay-btn clay-btn-ghost text-sm" onClick={handleReplay}>Replay</button>
              <button type="button" className="clay-btn clay-btn-ghost text-sm" onClick={handleClose}>Close</button>
            </div>
          </main>

          <div className="fixed inset-0 pointer-events-none z-10">
            {confetti.map((i) => (
              <div
                key={i}
                className="deco-confetti absolute"
                style={{
                  left: `${Math.random() * 100}vw`,
                  top: `-10px`,
                  backgroundColor: ['#f472b6', '#a78bfa', '#34d399', '#fbbf24'][i % 4],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${Math.random() * 2 + 1}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {stage === 'closed' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center p-6" style={{ background: theme.colors.background }}>
          <div className="clay-icon-btn clay-icon-btn-lg mb-6 animate-scale-in" style={{ background: theme.colors.surface, color: theme.colors.primary }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Dream saved</h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-6">Thank you for celebrating.</p>
          <button type="button" className="clay-btn clay-btn-primary" onClick={handleReplay}>Dream again</button>
        </div>
      )}
    </div>
  );
}