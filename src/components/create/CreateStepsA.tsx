/** Wizard steps 1–2: details + message. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { generateMessage, CATEGORY_OPTIONS, TONE_OPTIONS, type GenerationOptions, type MessageCategory, type MessageTone } from '@/lib/wishes/generator';
import type { CreateFormState } from './createTypes';

export type FieldSetter = <K extends keyof CreateFormState>(key: K, value: CreateFormState[K]) => void;

export interface StepProps {
  form: CreateFormState;
  set: FieldSetter;
}

const RELATIONSHIPS = [
  { id: 'friend', label: 'Friend' },
  { id: 'partner', label: 'Partner' },
  { id: 'family', label: 'Family' },
  { id: 'other', label: 'Other' },
];

export function StepDetails({ form, set }: StepProps): React.ReactElement {
  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">The birthday star</p>
        <h2 className="text-display" style={{ fontSize: 'var(--text-2xl)', margin: 'var(--space-2) 0 var(--space-1)' }}>
          Who are we celebrating?
        </h2>
        <p className="text-body text-sm">Start with a name — we will make the rest feel personal.</p>
      </div>
      <div>
        <label htmlFor="wz-name">Recipient&apos;s name</label>
        <input id="wz-name" type="text" className="clay-input" placeholder="e.g. Jamie" value={form.recipientName} onChange={(e) => set('recipientName', e.target.value)} />
      </div>
      <div>
        <span id="wz-rel" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Relationship</span>
        <div className="relationship-options" role="radiogroup" aria-labelledby="wz-rel">
          {RELATIONSHIPS.map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={form.relationship === r.id}
              className={'rel-chip' + (form.relationship === r.id ? ' selected' : '')}
              onClick={() => set('relationship', r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="wz-date">Birthday (optional)</label>
          <input id="wz-date" type="date" className="clay-input" value={form.birthdayDate} onChange={(e) => set('birthdayDate', e.target.value)} />
        </div>
        <div>
          <label htmlFor="wz-age">Their age (optional)</label>
          <input id="wz-age" type="number" min={1} max={120} className="clay-input" placeholder="e.g. 30" value={form.recipientAge} onChange={(e) => set('recipientAge', e.target.value)} />
        </div>
      </div>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
        <input type="checkbox" checked={form.unknownYear} onChange={(e) => set('unknownYear', e.target.checked)} style={{ width: 'auto' }} />
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>I don&apos;t know the year</span>
      </label>
      <div>
        <label htmlFor="wz-detail">A detail they&apos;ll love (optional)</label>
        <textarea id="wz-detail" rows={3} maxLength={200} className="clay-textarea" placeholder="Favorite hobby, inside joke, or little detail" value={form.detail} onChange={(e) => set('detail', e.target.value)} />
        <p className="clay-help" style={{ textAlign: 'right' }}>{form.detail.length}/200</p>
      </div>
      <div>
        <label htmlFor="wz-sender">Your name (optional)</label>
        <input id="wz-sender" type="text" className="clay-input" placeholder="So they know who it is from" value={form.senderName} onChange={(e) => set('senderName', e.target.value)} />
      </div>
    </div>
  );
}

export function StepMessage({ form, set }: StepProps): React.ReactElement {
  const [busy, setBusy] = useState(false);
  const genTimer = useRef<number | null>(null);

  useEffect(() => () => { if (genTimer.current !== null) window.clearTimeout(genTimer.current); }, []);

  const handleGenerate = useCallback(() => {
    setBusy(true);
    genTimer.current = window.setTimeout(() => {
      const opts: GenerationOptions = {
        recipientName: form.recipientName.trim() || 'Friend',
        ...(form.senderName.trim() ? { senderName: form.senderName.trim() } : {}),
        ...(form.category ? { category: form.category as MessageCategory } : {}),
        ...(form.tone ? { tone: form.tone as MessageTone } : {}),
        ...(form.detail.trim() ? { memory: form.detail.trim() } : {}),
        seed: Date.now(),
      };
      const result = generateMessage(opts);
      set('message', result.text);
      setBusy(false);
    }, 300);
  }, [form.recipientName, form.senderName, form.category, form.tone, form.detail, set]);

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">The message</p>
        <h2 className="text-display" style={{ fontSize: 'var(--text-2xl)', margin: 'var(--space-2) 0 var(--space-1)' }}>
          Write the birthday wish
        </h2>
        <p className="text-body text-sm">Generate a starting wish, or write your own — it becomes the letter and the heart of the page.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="wz-cat">Category</label>
          <select id="wz-cat" className="clay-select" value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">Any category</option>
            {CATEGORY_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.display}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="wz-tone">Tone</label>
          <select id="wz-tone" className="clay-select" value={form.tone} onChange={(e) => set('tone', e.target.value)}>
            <option value="">Any tone</option>
            {TONE_OPTIONS.map((t) => <option key={t.id} value={t.id}>{t.display}</option>)}
          </select>
        </div>
      </div>
      <button type="button" className="clay-btn clay-btn-secondary clay-btn-full" disabled={busy} onClick={handleGenerate}>
        {busy ? 'Writing…' : 'Generate a wish for me'}
      </button>
      <div>
        <label htmlFor="wz-message">Your message</label>
        <textarea id="wz-message" rows={6} maxLength={2000} className="clay-textarea" placeholder="Dear Jamie, …" value={form.message} onChange={(e) => set('message', e.target.value)} />
        <p className="clay-help" style={{ textAlign: 'right' }}>{form.message.length}/2000</p>
      </div>
    </div>
  );
}

