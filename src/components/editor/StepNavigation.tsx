/**
 * StepNavigation — Back / Next / Save controls for editor steps.
 */

import type { EditorStep } from '@/components/editor/EditorProvider';

interface Props {
  currentStep: EditorStep;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSave: () => void;
  saving: boolean;
  publishing: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function StepNavigation({
  currentStep,
  canGoNext,
  onPrev,
  onNext,
  onSave,
  saving,
  publishing,
  isFirstStep,
  isLastStep,
}: Props) {
  const showFinish = isLastStep;

  return (
    <div className="clay-card p-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4 border-t border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="clay-btn clay-btn-ghost"
          disabled={isFirstStep || saving || publishing}
          onClick={onPrev}
          aria-label="Previous step"
        >
          ← Back
        </button>
        <span className="text-xs text-[var(--color-text-tertiary)]">
          Step {currentStep} of 8
        </span>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {!showFinish && (
          <button
            type="button"
            className="clay-btn clay-btn-primary"
            disabled={!canGoNext || saving || publishing}
            onClick={onNext}
            aria-label="Next step"
          >
            Next step →
          </button>
        )}
        {showFinish && (
          <>
            <button
              type="button"
              className="clay-btn clay-btn-secondary"
              disabled={saving || publishing}
              onClick={onSave}
              aria-label="Save draft"
            >
              {saving ? 'Saving…' : 'Save draft'}
            </button>
            <button
              type="button"
              className="clay-btn clay-btn-primary clay-btn-lg"
              disabled={!canGoNext || saving || publishing}
              onClick={onNext}
              aria-label="Preview and finish"
            >
              {publishing ? 'Publishing…' : 'Preview & finish →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
