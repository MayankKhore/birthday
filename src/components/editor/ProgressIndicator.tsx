/**
 * ProgressIndicator — Stage 6 editor step progress.
 *
 * Shows the current step in a 6-step journey with completed/in-progress states.
 */

import type { EditorStep } from '@/components/editor/EditorProvider';

interface Props {
  currentStep: EditorStep;
  completedSteps: Set<number>;
}

const STEP_LABELS: Record<EditorStep, string> = {
  1: 'Occasion',
  2: 'Details',
  3: 'Theme',
  4: 'Photos',
  5: 'Personalize',
  6: 'Music',
  7: 'Advanced',
  8: 'Preview',
};

const STEPS: EditorStep[] = [1, 2, 3, 4, 5, 6, 7, 8];

export function ProgressIndicator({ currentStep, completedSteps }: Props) {

  return (
    <div className="clay-card p-6 mb-8" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={8}>
      <h2 className="font-display text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
        Building your birthday page
      </h2>
      <div className="grid grid-cols-8 gap-2" style={{ position: 'relative' }}>
        <div className="col-span-8 h-[1px] bg-[var(--color-border)] -mt-[6px] mb-8 relative" aria-hidden="true" />
        {STEPS.map((step) => {
          const isActive = step === currentStep;
          const isCompleted = completedSteps.has(step);
          return (
            <div
              key={step}
              className="flex flex-col items-center gap-2 relative z-10"
              style={{ position: 'relative' }}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold shadow-md transition-all ${
                  isActive
                    ? 'bg-[var(--color-brand-500)] text-white ring-2 ring-white ring-offset-2 ring-offset-[var(--color-surface)]'
                    : isCompleted
                    ? 'bg-[var(--color-brand-500)] text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-tertiary)] border border-[var(--color-border)]'
                }`}
              >
                {step}
              </div>
              <span className={`text-xs font-medium text-center leading-none ${
                isActive || isCompleted ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'
              }`}>
                {STEP_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
