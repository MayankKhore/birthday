/**
 * Step2Details — Stage 6 editor step 2: Birthday message.
 *
 * Picks or writes the wish text that will appear on the microsite. Templates are
 * human-written (never labeled AI-generated), matching Stage 5 conventions.
 */

import { useCallback, useEffect, useState } from 'react';
import type { GeneratedMessage } from '@/types';
import { generateMessage, CATEGORY_OPTIONS, TONE_OPTIONS } from '@/lib/wishes/generator';
import { useEditor } from '@/components/editor/EditorProvider';

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

export function Step2Details({ onNext, onPrev }: Props) {
  const {
    project,
    updateField,
    setValidationError,
    canGoNext,
  } = useEditor();
  const [message, setMessage] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [tone, setTone] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [memory, setMemory] = useState<string>('');
  const [generated, setGenerated] = useState<GeneratedMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [personalNote, setPersonalNote] = useState<string>(project.customMessage ?? '');

  useEffect(() => {
    setMessage(project.message ?? '');
    setRecipientName(project.recipientName ?? '');
    setPersonalNote(project.customMessage ?? '');
  }, [project.message, project.recipientName]);

  const handleGenerate = useCallback(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const result = generateMessage({
        recipientName,
        senderName,
        category: (category || undefined) as never,
        tone: (tone || undefined) as never,
        memory,
        seed: Date.now(),
      });
      setGenerated(result);
      setMessage(result.text);
      updateField('message', result.text);
      setValidationError('message', '');
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [recipientName, senderName, category, tone, memory, updateField, setValidationError]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    updateField('message', e.target.value);
    setValidationError('message', '');
  };

  const handleUseGenerated = () => {
    if (!generated) return;
    setMessage(generated.text);
    updateField('message', generated.text);
    setValidationError('message', '');
  };

  const handleNext = () => {
    if (!message?.trim()) {
      setValidationError('message', 'A message makes the page complete.');
      return;
    }
    if (!recipientName?.trim()) {
      setValidationError('recipientName', "Tell us who's celebrating.");
      return;
    }
    updateField('message', message.trim());
    updateField('recipientName', recipientName.trim());
    updateField('customMessage', personalNote.trim() === '' ? undefined : personalNote.trim());
    onNext();
  };

  return (
    <section className="clay-card p-8 sm:p-12 max-w-3xl mx-auto space-y-8">
      <div>
        <span className="clay-badge clay-badge-primary mb-3 inline-block">Step 2 of 6</span>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Write the birthday wish
        </h1>
        <p className="text-body sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Choose a template or write your own. This is what they&apos;ll read on the page.
        </p>
      </div>

      <form noValidate onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="col-span-2 sm:col-span-1 clay-card-static p-5 space-y-4">
            <h2 className="font-display text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Make it personal
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Leave blank to keep the template as-is.
            </p>
            <div className="space-y-3">
              <div>
                <label className="clay-label block text-xs font-medium mb-1" htmlFor="step2-recipient">
                  Recipient name
                </label>
                <input
                  id="step2-recipient"
                  className="clay-input w-full"
                  value={recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value);
                    updateField('recipientName', e.target.value === '' ? undefined : e.target.value);
                  }}
                />
              </div>
              <div>
                <label className="clay-label block text-xs font-medium mb-1" htmlFor="step2-sender">
                  Sender name
                </label>
                <input
                  id="step2-sender"
                  className="clay-input w-full"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Alex"
                />
              </div>
              <div>
                <label className="clay-label block text-xs font-medium mb-1" htmlFor="step2-note">
                  Personal note (optional)
                </label>
                <textarea
                  id="step2-note"
                  className="clay-input w-full"
                  rows={3}
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder="Something only the two of you share…"
                />
              </div>
              <div>
                <label className="clay-label block text-xs font-medium mb-1">A memory or detail (optional)</label>
                <textarea
                  className="clay-input w-full"
                  rows={3}
                  value={memory}
                  onChange={(e) => setMemory(e.target.value)}
                  placeholder="That trip to the coast…"
                />
              </div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 clay-card-static p-5 space-y-4">
            <h2 className="font-display text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Filter templates
            </h2>
            <div className="space-y-3">
              <div>
                <label className="clay-label block text-xs font-medium mb-1">Category</label>
                <select className="clay-input w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Any category</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>{c.display}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="clay-label block text-xs font-medium mb-1">Tone</label>
                <select className="clay-input w-full" value={tone} onChange={(e) => setTone(e.target.value)}>
                  <option value="">Any tone</option>
                  {TONE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>{t.display}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="button"
              className="clay-btn clay-btn-secondary w-full"
              disabled={loading}
              onClick={handleGenerate}
            >
              {loading ? 'Generating…' : 'Generate a wish'}
            </button>
          </div>
        </div>

        {generated && (
          <div className="clay-card-static p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">Suggested wish</p>
            <p className="text-body text-[var(--color-text-primary)] whitespace-pre-wrap">{generated.text}</p>
            <button
              type="button"
              className="clay-btn clay-btn-ghost text-sm"
              onClick={handleUseGenerated}
            >
              Use this wish
            </button>
          </div>
        )}

        <div>
          <label className="clay-label block mb-2 font-medium">
            Your message <span className="text-[var(--color-error-dark)]" aria-hidden="true">*</span>
          </label>
          <textarea
            className="clay-input w-full"
            rows={6}
            placeholder="Write a heartfelt birthday wish…"
            value={message}
            onChange={handleMessageChange}
            aria-invalid={!message?.trim()}
          />
          {!message?.trim() && (
            <p className="text-xs mt-1 text-[var(--color-error-dark)]">A message makes the page complete.</p>
          )}
          <p className="text-xs mt-1 text-[var(--color-text-tertiary)]">
            {message.length} / 2000 characters
          </p>
        </div>

        <div className="pt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" className="clay-btn clay-btn-ghost" onClick={onPrev}>
            ← Back
          </button>
          <button
            type="button"
            className="clay-btn clay-btn-primary clay-btn-lg"
            disabled={!canGoNext || !message?.trim()}
            onClick={handleNext}
          >
            Continue →
          </button>
        </div>
      </form>
    </section>
  );
}
