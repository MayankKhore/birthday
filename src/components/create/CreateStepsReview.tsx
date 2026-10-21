/** Wizard step 5: style + review + launch. */
import { THEME_REGISTRY } from '@/lib/themes';
import { MUSIC_TRACKS } from '@/lib/media/sound';
import { deriveAge } from './createMapping';
import type { CreateFormState } from './createTypes';
import type { StepProps } from './CreateStepsA';

const SCENE_LABELS: Record<string, string> = {
  envelope: 'Envelope',
  letter: 'Letter',
  cake: 'Cake',
  storybook: 'Storybook',
  'photo-gallery': 'Photos',
  'mini-game': 'Games',
  'gift-reveal': 'Gift',
  celebration: 'Finale',
};

export interface ReviewProps extends StepProps {
  sceneSummary: string[];
  saveState: 'idle' | 'saving' | 'saved' | 'error';
  saveError: string | null;
  savedProjectId: string | null;
  onSave: () => void;
}

export function StepReview({ form, set, sceneSummary, saveState, saveError, savedProjectId, onSave }: ReviewProps): React.ReactElement {
  const name = form.recipientName.trim() || 'Someone Special';
  const age = deriveAge(form.birthdayDate, form.unknownYear, form.recipientAge);
  const trackLabel = form.track === 'uploaded'
    ? (form.uploadedFileName || 'Your uploaded file')
    : form.track === 'none'
      ? 'No music'
      : (MUSIC_TRACKS.find((t) => t.id === form.track)?.name ?? 'Gentle Piano');

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Preview &amp; share</p>
        <h2 className="text-display" style={{ fontSize: 'var(--text-2xl)', margin: 'var(--space-2) 0 var(--space-1)' }}>
          Ready to launch?
        </h2>
        <p className="text-body text-sm">Pick a look, then save the page. Everything stays in this browser.</p>
      </div>

      <div>
        <span id="wz-theme" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Style</span>
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-labelledby="wz-theme">
          {THEME_REGISTRY.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={form.themeId === t.id}
              onClick={() => set('themeId', t.id)}
              className={'clay-tile' + (form.themeId === t.id ? ' clay-tile-selected' : '')}
              style={{ alignItems: 'flex-start', textAlign: 'left', width: '100%' }}
            >
              <span style={{ width: '100%', height: '44px', borderRadius: 'var(--radius-md)', background: t.colors.gradient ?? t.colors.background, border: '1px solid var(--color-border)' }} aria-hidden="true" />
              <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{t.name}</span>
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{t.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="clay-card-static" style={{ padding: 'var(--space-4)' }}>
        <h3 className="font-display text-base font-bold" style={{ marginBottom: 'var(--space-2)' }}>
          {name}{age !== undefined ? ` turns ${age}` : ''}
        </h3>
        <dl className="space-y-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <div className="flex gap-2"><dt style={{ minWidth: '86px', color: 'var(--color-text-tertiary)' }}>Wish</dt><dd style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.message.trim() || 'A default birthday wish'}</dd></div>
          <div className="flex gap-2"><dt style={{ minWidth: '86px', color: 'var(--color-text-tertiary)' }}>Photos</dt><dd>{form.photos.length} uploaded</dd></div>
          <div className="flex gap-2"><dt style={{ minWidth: '86px', color: 'var(--color-text-tertiary)' }}>Music</dt><dd>{form.musicEnabled ? trackLabel : 'Off'} · SFX {form.soundEffects ? 'on' : 'off'}</dd></div>
          <div className="flex gap-2"><dt style={{ minWidth: '86px', color: 'var(--color-text-tertiary)' }}>Journey</dt><dd>{sceneSummary.map((s) => SCENE_LABELS[s] ?? s).join(' → ')}</dd></div>
        </dl>
      </div>

      {saveError ? <p className="clay-error-text" role="alert">{saveError}</p> : null}
      {(() => {
        const state = saveState as 'idle' | 'saving' | 'saved' | 'error';
        const isSaving = state === 'saving';
        const isSaved = state === 'saved';
        return isSaved && savedProjectId ? (
          <div className="clay-card-lavender" style={{ padding: 'var(--space-4)' }}>
            <h3 className="font-display text-base font-bold" style={{ marginBottom: 'var(--space-2)' }}>Your page is ready!</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
              Open it on this device any time — the link works in this browser where the page was saved.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a href={`/preview/${savedProjectId}`} className="clay-btn clay-btn-primary clay-btn-full">Open the birthday page</a>
              <button type="button" className="clay-btn clay-btn-secondary clay-btn-full" onClick={onSave} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save again'}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="clay-btn clay-btn-primary clay-btn-lg clay-btn-full" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save & launch the page'}
          </button>
        );
      })()}
    </div>
  );
}
