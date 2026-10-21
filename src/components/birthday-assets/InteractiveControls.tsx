/**
 * InteractiveControls — HTML/CSS/SVG interactive controls demo.
 *
 * All controls are built with HTML, CSS, and SVG — no images used as buttons.
 * Demonstrates button variants, toggle switches, sliders, and radial menus.
 */
import { useState } from 'react';

export function InteractiveControls() {
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [confettiEnabled, setConfettiEnabled] = useState(false);
  const [volume, setVolume] = useState(70);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Music Toggle - SVG toggle button */}
      <div className="clay-card-static p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Celebration Music</span>
          <button
            type="button"
            role="switch"
            aria-checked={musicEnabled}
            aria-label="Toggle celebration music"
            onClick={() => setMusicEnabled(!musicEnabled)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)] ${
              musicEnabled ? 'bg-[var(--color-coral)]' : 'bg-[var(--color-border)]'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 rounded-full bg-[var(--color-warm-ivory)] absolute ${
                musicEnabled ? 'right-1' : 'left-1'
              } top-1 transition-transform duration-300 transform ${
                musicEnabled ? 'translate-x-0' : '-translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {musicEnabled ? 'Playing' : 'Silent'}
        </p>
      </div>

      {/* Confetti Toggle */}
      <div className="clay-card-static p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Confetti Effects</span>
          <button
            type="button"
            role="switch"
            aria-checked={confettiEnabled}
            aria-label="Toggle confetti effects"
            onClick={() => setConfettiEnabled(!confettiEnabled)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)] ${
              confettiEnabled ? 'bg-[var(--color-coral)]' : 'bg-[var(--color-border)]'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 rounded-full bg-[var(--color-warm-ivory)] absolute ${
                confettiEnabled ? 'right-1' : 'left-1'
              } top-1 transition-transform duration-300 transform ${
                confettiEnabled ? 'translate-x-0' : '-translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {confettiEnabled ? 'Active' : 'Off'}
        </p>
      </div>

      {/* Volume Slider */}
      <div className="clay-card-static p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] lg:col-span-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Volume</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value, 10))}
            className="w-full accent-[var(--color-coral)] h-2 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-[var(--color-text-secondary)] w-8 text-right">{volume}%</span>
        </div>
      </div>

      {/* SVG Radial Action Menu */}
      <div className="clay-card-static p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] lg:col-span-2">
        <div className="flex flex-col items-center gap-4">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Quick Actions</span>
          <div className="flex gap-2">
            {[
              { label: 'Wish', icon: '✦', color: 'var(--color-lavender)' },
              { label: 'Toast', icon: '🥂', color: 'var(--color-coral)' },
              { label: 'Celebrate', icon: '🎉', color: 'var(--color-midnight)' },
            ].map((action) => (
              <button
                key={action.label}
                type="button"
                aria-label={action.label}
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all hover:scale-105 active:scale-95 border border-[var(--color-border)]"
                style={{ background: 'var(--color-surface-lavender)', color: action.color }}
              >
                {action.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}