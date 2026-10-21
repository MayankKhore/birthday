/** Wizard step 4b: scenes, games, cake options, story/quiz text, gift. */
import { GAME_META, type CreateFormState } from './createTypes';
import type { StepProps } from './CreateStepsA';
import { autoPersonalize } from './createMapping';
import { EMPTY_FORM } from './createTypes';

function SceneToggle({ label, blurb, checked, onChange }: {
  label: string; blurb: string; checked: boolean; onChange: (v: boolean) => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={'clay-tile' + (checked ? ' clay-tile-selected' : '')}
      style={{ flexDirection: 'row', justifyContent: 'space-between', textAlign: 'left', width: '100%', padding: 'var(--space-3) var(--space-4)' }}
    >
      <span>
        <span style={{ display: 'block', fontWeight: 600, fontSize: 'var(--text-sm)' }}>{label}</span>
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{blurb}</span>
      </span>
      <span className={'clay-toggle' + (checked ? ' clay-toggle-active' : '')} aria-hidden="true">
        <span className="clay-toggle-track"><span className="clay-toggle-thumb" /></span>
      </span>
    </button>
  );
}

export function StepScenes({ form, set }: StepProps): React.ReactElement {
  const toggleGame = (id: 'roulette' | 'quiz' | 'memory-match'): void => {
    const has = form.games.includes(id);
    set('games', has ? form.games.filter((g) => g !== id) : [...form.games, id]);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">The journey</p>
        <h2 className="text-display" style={{ fontSize: 'var(--text-2xl)', margin: 'var(--space-2) 0 var(--space-1)' }}>
          Pick the moments
        </h2>
        <p className="text-body text-sm">Switch scenes on or off and choose the games. The celebration finale is always included.</p>
      </div>

      <div className="space-y-2">
        <SceneToggle label="Sealed envelope" blurb="A tap-to-open envelope intro" checked={form.includeEnvelope} onChange={(v) => set('includeEnvelope', v)} />
        <SceneToggle label="Birthday letter" blurb="Animated letter reveal" checked={form.includeLetter} onChange={(v) => set('includeLetter', v)} />
        <SceneToggle label="Birthday cake" blurb="Candles, wishes and blow-out" checked={form.includeCake} onChange={(v) => set('includeCake', v)} />
        <SceneToggle label="Storybook" blurb="Personalized chapters" checked={form.includeStorybook} onChange={(v) => set('includeStorybook', v)} />
        <SceneToggle label="Photo memories" blurb={form.photos.length > 0 ? `${form.photos.length} uploaded photos` : 'Needs photos from step 3'} checked={form.includeGallery} onChange={(v) => set('includeGallery', v)} />
      </div>

      {form.includeCake ? (
        <div className="clay-card-static" style={{ padding: 'var(--space-4)' }}>
          <h3 className="font-display text-base font-bold" style={{ marginBottom: 'var(--space-3)' }}>Cake options</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="wz-candles">Candles (1–12)</label>
              <input id="wz-candles" type="number" min={1} max={12} className="clay-input" value={form.candleCount} onChange={(e) => set('candleCount', Math.max(1, Math.min(12, Number(e.target.value) || 1)))} />
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', alignSelf: 'end', paddingBottom: 'var(--space-3)' }}>
              <input type="checkbox" checked={form.enableMicrophoneBlow} onChange={(e) => set('enableMicrophoneBlow', e.target.checked)} style={{ width: 'auto' }} />
              <span style={{ fontSize: 'var(--text-sm)' }}>Allow blowing via microphone</span>
            </label>
          </div>
        </div>
      ) : null}

      <div>
        <h3 className="font-display text-base font-bold" style={{ marginBottom: 'var(--space-2)' }}>Mini-games (pick at least one)</h3>
        <div className="space-y-2">
          {GAME_META.map((g) => (
            <SceneToggle key={g.id} label={g.name} blurb={g.blurb} checked={form.games.includes(g.id)} onChange={() => toggleGame(g.id)} />
          ))}
        </div>
        {form.games.length === 0 ? <p className="clay-error-text" style={{ marginTop: 'var(--space-2)' }}>Pick at least one game, or the journey will skip straight to the gift.</p> : null}
      </div>

      <div className="space-y-2">
        <SceneToggle label="Gift reveal" blurb="The final surprise" checked={form.includeGift} onChange={(v) => set('includeGift', v)} />
      </div>

      {form.includeStorybook ? <StoryEditor form={form} set={set} /> : null}
      {form.includeGift ? <GiftEditor form={form} set={set} /> : null}
    </div>
  );
}

function StoryEditor({ form, set }: StepProps): React.ReactElement {
  const chapters = form.storyChapters;
  const refresh = (): void => {
    const auto = autoPersonalize({ ...EMPTY_FORM, ...form });
    set('storyChapters', auto.storyChapters);
    set('quizQuestions', auto.quizQuestions);
  };
  return (
    <div className="clay-card-static" style={{ padding: 'var(--space-4)' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
        <h3 className="font-display text-base font-bold">Storybook chapters</h3>
        <button type="button" className="clay-btn clay-btn-ghost clay-btn-sm" onClick={refresh}>Regenerate</button>
      </div>
      {chapters.length === 0 ? (
        <div className="space-y-2">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Chapters are written automatically from the birthday star&apos;s details. Tap regenerate to write them now, or keep editing below.</p>
          <button type="button" className="clay-btn clay-btn-secondary clay-btn-sm" onClick={refresh}>Write my chapters</button>
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map((ch, i) => (
            <div key={ch.id} style={{ borderTop: i > 0 ? '1px solid var(--color-divider)' : 'none', paddingTop: i > 0 ? 'var(--space-3)' : 0 }}>
              <label htmlFor={`wz-ch-title-${i}`} style={{ fontSize: 'var(--text-xs)' }}>Chapter {i + 1} title</label>
              <input
                id={`wz-ch-title-${i}`}
                type="text"
                className="clay-input"
                style={{ minHeight: '40px' }}
                value={ch.title}
                onChange={(e) => set('storyChapters', chapters.map((c, j) => (j === i ? { ...c, title: e.target.value } : c)))}
              />
              <label htmlFor={`wz-ch-text-${i}`} style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>Chapter {i + 1} text</label>
              <textarea
                id={`wz-ch-text-${i}`}
                rows={3}
                className="clay-textarea"
                value={ch.text}
                onChange={(e) => set('storyChapters', chapters.map((c, j) => (j === i ? { ...c, text: e.target.value } : c)))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GiftEditor({ form, set }: StepProps): React.ReactElement {
  return (
    <div className="clay-card-static" style={{ padding: 'var(--space-4)' }}>
      <h3 className="font-display text-base font-bold" style={{ marginBottom: 'var(--space-3)' }}>The final gift</h3>
      <div className="space-y-3">
        <div>
          <label htmlFor="wz-gift-title">Gift title</label>
          <input id="wz-gift-title" type="text" className="clay-input" value={form.giftTitle} onChange={(e) => set('giftTitle', e.target.value)} />
        </div>
        <div>
          <label htmlFor="wz-gift-msg">Gift message</label>
          <textarea id="wz-gift-msg" rows={3} className="clay-textarea" value={form.giftMessage} onChange={(e) => set('giftMessage', e.target.value)} />
        </div>
      </div>
    </div>
  );
}

