/**
 * Step6Music — Editor step 6: Music & Sound.
 * Configure background music and sound effects for the birthday experience.
 */

import { useEditor } from '@/components/editor/EditorProvider';
import { MusicPlayer } from '@/components/editor/MusicPlayer';

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

export function Step6Music({ onNext, onPrev }: Props) {
  const {
    musicEnabled,
    musicTrackId,
    soundEffectsEnabled,
    setMusicEnabled,
    setMusicTrackId,
    setSoundEffectsEnabled,
    canGoNext,
  } = useEditor();

  return (
    <section className="clay-card p-8 sm:p-12 max-w-3xl mx-auto space-y-8">
      <div>
        <span className="clay-badge clay-badge-primary mb-3 inline-block">Step 6 of 8</span>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Add music & sound
        </h1>
        <p className="text-body sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Choose a background track and enable sound effects for an immersive experience.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={musicEnabled}
              onChange={(e) => setMusicEnabled(e.target.checked)}
              className="clay-checkbox"
            />
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Enable background music
            </span>
          </label>
          <p className="text-xs mt-1 text-[var(--color-text-tertiary)]">
            Music plays automatically when the recipient opens the page (requires user interaction first).
          </p>
        </div>

        {musicEnabled && (
          <MusicPlayer
            project={{ musicEnabled: true, musicTrackId } as any}
            soundEffectsEnabled={soundEffectsEnabled}
            onMusicToggle={(enabled) => setMusicEnabled(enabled ?? false)}
          />
        )}

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={soundEffectsEnabled}
              onChange={(e) => setSoundEffectsEnabled(e.target.checked)}
              className="clay-checkbox"
            />
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Enable sound effects
            </span>
          </label>
          <p className="text-xs mt-1 text-[var(--color-text-tertiary)]">
            Subtle sounds for interactions like confetti, card flips, and button clicks.
          </p>
        </div>
      </div>

      <div className="pt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" className="clay-btn clay-btn-ghost" onClick={onPrev}>
          ← Back
        </button>
        <button
          type="button"
          className="clay-btn clay-btn-primary clay-btn-lg"
          disabled={!canGoNext}
          onClick={onNext}
        >
          Continue →
        </button>
      </div>
    </section>
  );
}