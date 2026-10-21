/**
 * Step1Occasion — Stage 6 editor step 1: Occasion & relationship.
 *
 * Birthday celebration, recipient relationship, and optional celebration title.
 */

import { useState } from 'react';
import { useEditor } from '@/components/editor/EditorProvider';

interface Props {
  onNext: () => void;
}

const OCCASION_OPTIONS = [
  { id: 'birthday' as const, label: 'Birthday', hint: 'Celebrate their special day' },
  { id: 'anniversary' as const, label: 'Anniversary', hint: 'A milestone to remember' },
  { id: 'graduation' as const, label: 'Graduation', hint: 'A new chapter begins' },
  { id: 'custom' as const, label: 'Other occasion', hint: 'Your own celebration' },
];

const RELATIONSHIP_OPTIONS = [
  'Best friend',
  'Romantic partner',
  'Spouse',
  'Sibling',
  'Parent',
  'Child',
  'Colleague',
  'Other',
];

export function Step1Occasion({ onNext }: Props) {
  const { project, updateField, setValidationError, canGoNext } = useEditor();
  const [touched, setTouched] = useState<{ occasion: boolean; recipientName: boolean }>({
    occasion: false,
    recipientName: false,
  });

  const handleOccasionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTouched((t) => ({ ...t, occasion: true }));
    updateField('occasion', e.target.value);
    setValidationError('occasion', '');
  };

  const handleRecipientName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTouched((t) => ({ ...t, recipientName: true }));
    updateField('recipientName', e.target.value);
    setValidationError('recipientName', '');
  };

  const handleRelationship = (value: string) => {
    updateField('relationship', value === '' ? undefined : value);
  };

  const handleRelationshipInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('relationship', e.target.value === '' ? undefined : e.target.value);
  };

  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('title', e.target.value === '' ? undefined : e.target.value);
  };

  const handleNext = () => {
    let valid = true;
    if (!project.occasion) {
      setValidationError('occasion', 'Please choose an occasion.');
      setTouched((t) => ({ ...t, occasion: true }));
      valid = false;
    }
    if (!project.recipientName?.trim()) {
      setValidationError('recipientName', "Tell us who's celebrating.");
      setTouched((t) => ({ ...t, recipientName: true }));
      valid = false;
    }
    if (!valid) return;
    onNext();
  };

  return (
    <section className="clay-card p-8 sm:p-12 max-w-2xl mx-auto space-y-8">
      <div>
        <span className="clay-badge clay-badge-primary mb-3 inline-block">Step 1 of 6</span>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Tell us about the celebration
        </h1>
        <p className="text-body sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Who are we celebrating, and what's the occasion?
        </p>
      </div>

      <form noValidate onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
        <div className="space-y-6">
          <div>
            <label className="clay-label block mb-2 font-medium">
              Occasion <span className="text-[var(--color-error-dark)]" aria-hidden="true">{touched.occasion && !project.occasion ? ' *' : ''}</span>
            </label>
            <select
              className="clay-input w-full"
              value={project.occasion ?? ''}
              onChange={handleOccasionChange}
              aria-invalid={touched.occasion && !project.occasion}
            >
              <option value="">Choose an occasion</option>
              {OCCASION_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            {touched.occasion && !project.occasion && (
              <p className="text-xs mt-1 text-[var(--color-error-dark)]">Please choose an occasion.</p>
            )}
            <p className="text-xs mt-1 text-[var(--color-text-tertiary)]">
              {OCCASION_OPTIONS.find((o) => o.id === project.occasion)?.hint ?? ''}
            </p>
          </div>

          <div>
            <label className="clay-label block mb-2 font-medium">
              Their name <span className="text-[var(--color-error-dark)]" aria-hidden="true">{touched.recipientName && !project.recipientName?.trim() ? ' *' : ''}</span>
            </label>
            <input
              className="clay-input w-full"
              type="text"
              placeholder="e.g. Maya"
              value={project.recipientName ?? ''}
              onChange={handleRecipientName}
              aria-invalid={touched.recipientName && !project.recipientName?.trim()}
            />
            {touched.recipientName && !project.recipientName?.trim() && (
              <p className="text-xs mt-1 text-[var(--color-error-dark)]">Tell us who's celebrating.</p>
            )}
          </div>

          <div>
            <span className="clay-label block mb-2 font-medium" id="step1-relationship-label">
              Recipient relationship
            </span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="step1-relationship-label">
              {RELATIONSHIP_OPTIONS.map((rel) => {
                const active = (project.relationship ?? '') === rel;
                return (
                  <button
                    key={rel}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => handleRelationship(active ? '' : rel)}
                    className={`clay-chip${active ? ' clay-chip-active' : ''}`}
                  >
                    {rel}
                  </button>
                );
              })}
            </div>
            <input
              className="clay-input w-full mt-3"
              type="text"
              placeholder="Or type your own (optional)"
              value={RELATIONSHIP_OPTIONS.includes(project.relationship ?? '') ? '' : (project.relationship ?? '')}
              onChange={handleRelationshipInput}
              aria-label="Custom relationship"
            />
          </div>

          <div>
            <label className="clay-label block mb-2 font-medium" htmlFor="step1-title">
              Celebration title (optional)
            </label>
            <input
              className="clay-input w-full"
              id="step1-title"
              type="text"
              placeholder="e.g. Maya turns thirty"
              maxLength={100}
              value={project.title ?? ''}
              onChange={handleTitle}
            />
            <p className="text-xs mt-1 text-[var(--color-text-tertiary)]">
              Shown at the top of the page. Leave blank to use their name.
            </p>
          </div>
        </div>

        <div className="pt-6 flex items-center gap-3">
          <button
            type="button"
            className="clay-btn clay-btn-primary clay-btn-lg"
            disabled={!canGoNext}
            onClick={handleNext}
          >
            Continue →
          </button>
        </div>
      </form>
    </section>
  );
}
