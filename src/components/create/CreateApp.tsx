/** CreateApp — the real 5-step birthday-page creator (React island on /create). */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LocalProjectAdapter } from '@/lib/storage/LocalProjectAdapter';
import { unlockAudio } from '@/lib/media/sound';
import { formToProjectInput } from './createMapping';
import { DRAFT_KEY, EMPTY_FORM, type CreateFormState } from './createTypes';
import { StepDetails, StepMessage, type FieldSetter } from './CreateStepsA';
import { StepPhotos } from './CreateStepsPhotos';
import { StepMusic } from './CreateStepsMusic';
import { StepScenes } from './CreateStepsScenes';
import { StepReview } from './CreateStepsReview';
import type { UUID } from '@/types';

const STEPS = [
  { id: 1, label: 'Details' },
  { id: 2, label: 'Message' },
  { id: 3, label: 'Memories' },
  { id: 4, label: 'Style' },
  { id: 5, label: 'Preview & share' },
];

const adapter = new LocalProjectAdapter();

function loadDraft(): CreateFormState | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CreateFormState>;
    return { ...EMPTY_FORM, ...parsed, photos: Array.isArray(parsed.photos) ? parsed.photos : [] };
  } catch {
    return null;
  }
}

export function CreateApp(): React.ReactElement {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CreateFormState>(EMPTY_FORM);
  const [restored, setRestored] = useState(false);
  const [uploadedTrackId, setUploadedTrackId] = useState<string | null>(null);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setForm(draft);
      setRestored(true);
    }
  }, []);

  useEffect(() => {
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form, message: form.message.slice(0, 2000) }));
      } catch {
        return;
      }
    }, 600);
    return () => { if (saveTimer.current !== null) window.clearTimeout(saveTimer.current); };
  }, [form]);

  const set: FieldSetter = useCallback(<K extends keyof CreateFormState>(key: K, value: CreateFormState[K]) => {
    setSaveState((s) => (s === 'saved' ? 'idle' : s));
    setSavedProjectId((id) => (id ? null : id));
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaveError(null);
    setSaveState('saving');
    try {
      const wantsMusic = form.musicEnabled && form.track !== 'none';
      const resolvedTrack = !wantsMusic
        ? undefined
        : form.track === 'uploaded'
          ? (uploadedTrackId ?? undefined)
          : form.track;
      const input = formToProjectInput(form, resolvedTrack);
      const result = await adapter.create(input, null);
      if (!result.success || !result.data) {
        const code = result.error?.code;
        setSaveError(code === 'STORAGE_FULL'
          ? 'This browser ran out of space — try fewer or smaller photos, then save again.'
          : (result.error?.message ?? 'Could not save the page. Please try again.'));
        setSaveState('error');
        return;
      }
      setSavedProjectId(result.data.id);
      setSaveState('saved');
      try { window.localStorage.removeItem(DRAFT_KEY); } catch { return; }
    } catch {
      setSaveError('Could not save the page. Please try again.');
      setSaveState('error');
    }
  }, [form, uploadedTrackId]);

  const handleUploaded = useCallback((trackId: string | null) => {
    setUploadedTrackId(trackId);
  }, []);

  const sceneSummary = useMemo(() => {
    const enabled: string[] = [];
    if (form.includeEnvelope) enabled.push('envelope');
    if (form.includeLetter) enabled.push('letter');
    if (form.includeCake) enabled.push('cake');
    if (form.includeStorybook) enabled.push('storybook');
    if (form.includeGallery && form.photos.length > 0) enabled.push('photo-gallery');
    for (let i = 0; i < form.games.length; i++) enabled.push('mini-game');
    if (form.includeGift) enabled.push('gift-reveal');
    enabled.push('celebration');
    return enabled;
  }, [form]);

  const canContinue = step !== 5;

  return (
    <div>
      <header className="container-page" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-2)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div>
          <span className="eyebrow">Birthday page · Step {step} of 5</span>
          <h1 className="text-display" style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)', marginTop: 'var(--space-2)' }}>Build their little world</h1>
        </div>
        <button
          type="button"
          className="clay-btn clay-btn-secondary clay-btn-sm"
          aria-label="Save draft"
          onClick={() => {
            try {
              window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
              setSaveError(null);
            } catch {
              setSaveError('The draft could not be stored — this browser may be out of space.');
            }
          }}
        >
          Save draft
        </button>
      </header>
      {restored ? (
        <p className="container-page text-xs" role="status" style={{ color: 'var(--color-text-tertiary)', paddingBottom: 'var(--space-2)' }}>
          Picked up where you left off — your draft was restored.
        </p>
      ) : null}

      <nav className="progress-indicator" aria-label="Creation steps">
        <ol className="progress-list">
          {STEPS.map((s, idx) => (
            <li className="progress-item" key={s.id} aria-current={s.id === step ? 'step' : undefined}>
              <button
                type="button"
                className={'progress-step' + (s.id === step ? ' active' : '') + (s.id < step ? ' completed' : '')}
                disabled={s.id >= step}
                onClick={() => setStep(s.id)}
              >
                <span className="progress-circle" aria-hidden="true">{s.id < step ? '✓' : s.id}</span>
                <span className="progress-label">{s.label}</span>
              </button>
              {idx < STEPS.length - 1 ? <span className="progress-connector" aria-hidden="true" /> : null}
            </li>
          ))}
        </ol>
      </nav>

      <div style={{ maxWidth: 'var(--max-width-2xl)', margin: '0 auto', padding: 'var(--space-4) var(--space-6) var(--space-16)', width: '100%' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-5" aria-label={`Step ${step}: ${STEPS[step - 1]?.label ?? ''}`}>
            <div className="clay-card-static" style={{ padding: 'var(--space-6)' }}>
              {step === 1 ? <StepDetails form={form} set={set} /> : null}
              {step === 2 ? <StepMessage form={form} set={set} /> : null}
              {step === 3 ? <StepPhotos form={form} set={set} /> : null}
              {step === 4 ? (
                <div className="space-y-8">
                  <StepMusic form={form} set={set} uploadedTrackId={uploadedTrackId} onUploaded={handleUploaded} />
                  <StepScenes form={form} set={set} />
                </div>
              ) : null}
              {step === 5 ? (
                <StepReview
                  form={form}
                  set={set}
                  sceneSummary={sceneSummary}
                  saveState={saveState}
                  saveError={saveError}
                  savedProjectId={savedProjectId}
                  onSave={() => { unlockAudio(); void handleSave(); }}
                />
              ) : null}

              <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                {step > 1 ? (
                  <button type="button" className="clay-btn clay-btn-ghost" onClick={() => setStep((s) => Math.max(1, s - 1))}>← Back</button>
                ) : <span />}
                {canContinue ? (
                  <button type="button" className="clay-btn clay-btn-primary" onClick={() => setStep((s) => Math.min(5, s + 1))}>
                    {step === 4 ? 'Review & launch →' : 'Continue →'}
                  </button>
                ) : <span />}
              </div>
            </div>
          </section>

          <section className="lg:col-span-7" aria-label="Live preview">
            <CreatePreview form={form} step={step} sceneSummary={sceneSummary} />
          </section>
        </div>
      </div>
    </div>
  );
}

function CreatePreview({ form, step, sceneSummary }: {
  form: CreateFormState; step: number; sceneSummary: string[];
}): React.ReactElement {
  const name = form.recipientName.trim() || 'Friend';
  const message = form.message.trim() || `A little celebration for ${name}.`;
  const shownPhotos = form.photos.slice(0, 3);
  return (
    <div className="preview-panel" style={{ minHeight: '560px' }}>
      <span className="preview-badge">Live preview</span>
      <div className="preview-canvas">
        <div className="preview-card">
          <p className="eyebrow">A little celebration for</p>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-4xl)', letterSpacing: '-0.02em', color: 'var(--color-brand-700)', margin: 'var(--space-2) 0' }}>
            {name}
          </div>
          <div className="text-body" style={{ fontSize: 'var(--text-sm)', maxWidth: '340px', margin: '0 auto' }}>{message}</div>
          {shownPhotos.length > 0 ? (
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
              {shownPhotos.map((p) => (
                <img key={p.localId} src={p.dataUrl} alt={p.caption || p.fileName} style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }} />
              ))}
            </div>
          ) : (
            <img src="/images/floral-card.svg" alt="Floral birthday card illustration" style={{ width: '100%', maxWidth: '220px', margin: 'var(--space-4) auto 0' }} />
          )}
        </div>
      </div>
      <div className="preview-controls">
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Step {step} of 5 · {sceneSummary.length} moments</span>
        <p className="text-xs" style={{ margin: 0, color: 'var(--color-text-tertiary)' }}><span style={{ color: 'var(--color-gold)' }}>✦</span> Changes appear here instantly.</p>
      </div>
      <style>{'.preview-card{width:100%;max-width:440px;background:linear-gradient(168deg,#FFFFFF 0%,#FDF6F9 55%,#FBF2E7 100%);border:1px solid var(--color-border);border-radius:var(--radius-2xl);box-shadow:var(--clay-shadow-lg);padding:1.75rem var(--space-6) var(--space-6);text-align:center;}'}</style>
    </div>
  );
}

