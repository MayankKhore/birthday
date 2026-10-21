/**
 * StarlitRenderer — Stage 6 theme renderer.
 *
 * Fullscreen midnight-sky birthday page: parallax stars, floating particles,
 * center-aligned luminous message, gallery photos. Click-to-enter opening,
 * animated message reveal, photo memories, restart/replay, music controls.
 */

import { useState } from 'react';
import type { BirthdayProject, Theme } from '@/types';

interface Props {
  project: BirthdayProject;
  theme: Theme;
  onMusicToggle: () => void;
}

export function StarlitRenderer({ project, theme, onMusicToggle }: Props) {
  const [stage, setStage] = useState<'entrance' | 'reveal' | 'memories' | 'closed'>('entrance');
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [confetti, setConfetti] = useState<number[]>([]);

  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 4 + 4,
  }));

  const handleEnter = () => {
    setStage('reveal');
    triggerConfetti();
  };

  const triggerConfetti = () => {
    setConfetti(Array.from({ length: 30 }, (_, i) => i));
    setTimeout(() => setConfetti([]), 1800);
  };

  const handleReplay = () => {
    setStage('entrance');
    setConfetti([]);
    triggerConfetti();
  };

  const handleClose = () => {
    setStage('closed');
  };

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
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: 0.6 + Math.random() * 0.4,
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      {stage === 'entrance' && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center"
          style={{ background: theme.colors.background }}
        >
          <div className="clay-icon-btn clay-icon-btn-lg mb-6 animate-pop" style={{ background: 'rgba(255,255,255,0.1)', color: theme.colors.textOnPrimary }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h1 className="font-display text-5xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>{project.recipientName}</h1>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8">It&apos;s your birthday</p>
          <button type="button" className="clay-btn clay-btn-primary clay-btn-lg animate-pop" onClick={handleEnter}>
            Open the page ✦
          </button>
        </div>
      )}

      {stage === 'reveal' && (
        <>
          <header className="fixed top-0 left-0 right-0 p-6 z-40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="clay-icon-btn clay-icon-btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: theme.colors.textOnPrimary }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>
              </div>
              <span className="font-display text-sm font-bold tracking-widest uppercase">{project.recipientName}</span>
            </div>
            <button type="button" className="clay-icon-btn clay-icon-btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: theme.colors.textOnPrimary }} onClick={handleMusic} aria-pressed={musicPlaying} aria-label="Toggle music">
              {musicPlaying ? '❚❚' : '♪'}
            </button>
          </header>

          <main className="flex flex-col items-center justify-center min-h-screen px-6 py-24 text-center">
            <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="text-[var(--color-accent)] text-xl font-bold mb-2 tracking-widest uppercase">It&apos;s your day</div>
              <h1 className="font-display text-6xl font-bold mb-6 leading-tight" style={{ lineHeight: '1.1' }}>{project.recipientName}</h1>
              <div className="clay-card p-8 max-w-xl mx-auto backdrop-blur-sm bg-white/10 border border-white/10">
                <p className="text-body text-lg leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{project.message}</p>
              </div>
            </div>

            {project.photos.length > 0 && (
              <section className="mt-12 animate-fade-in" style={{ animationDelay: '600ms' }}>
                <h2 className="font-display text-xl font-bold mb-6" style={{ letterSpacing: '-0.02em' }}>Memories</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
                  {project.photos.map((photo, idx) => (
                    <div key={photo.id} className={`relative rounded-xl overflow-hidden border border-white/10 animate-fade-in group`} style={{ animationDelay: `${400 + idx * 100}ms` }}>
                      <img src={photo.dataUrl} alt={photo.altText || ''} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white text-sm">{photo.caption}</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-10 flex items-center gap-3">
              <button type="button" className="clay-btn clay-btn-ghost text-sm" onClick={handleReplay}>Replay</button>
              <button type="button" className="clay-btn clay-btn-ghost text-sm" onClick={handleClose}>Close</button>
            </div>
          </main>

          <div className="fixed inset-0 pointer-events-none z-10">
            {confetti.map((i) => (
              <div key={i} className="deco-confetti absolute" style={{
                left: `${Math.random() * 100}vw`,
                top: `-10px`,
                backgroundColor: ['#fbbf24', '#f472b6', '#a78bfa', '#34d399'][i % 4],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 2 + 1}s`,
              }} />
            ))}
          </div>
        </>
      )}

      {stage === 'closed' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center" style={{ background: theme.colors.background }}>
          <div className="clay-icon-btn clay-icon-btn-lg mb-6 animate-scale-in" style={{ background: 'rgba(255,255,255,0.1)', color: theme.colors.textOnPrimary }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 className="font-display text-3xl font-bold mb-2">Thanks for celebrating</h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-6">The moment has been shared.</p>
          <button type="button" className="clay-btn clay-btn-primary" onClick={handleReplay}>Experience again</button>
        </div>
      )}
    </div>
  );
}
