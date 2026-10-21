/**
 * ProgressIndicator — Stage 6 editor step progress.
 *
 * Shows the current step in a 6-step journey with completed/in-progress states.
 * Centered connecting line.
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
      <h2 className="font-display text-xs font-semibold uppercase tracking-widest mb-6 text-center" style={{ color: 'var(--color-text-tertiary)' }}>
        Building your birthday page
      </h2>
      <div className="relative flex items-center justify-center">
        {/* Connecting line */}
        <div className="absolute left-1/2 right-1/2 h-[2px] bg-[var(--color-border)]" style={{ top: '24px' }} aria-hidden="true" />
        <div className="flex justify-between w-full max-w-4xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          {STEPS.map((step) => {
            const isActive = step === currentStep;
            const isCompleted = completedSteps.has(step);
            return (
              <div key={step} className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold shadow-md transition-all ${
                    isActive
                      ? 'bg-[var(--color-brand-500)] text-white ring-2 ring-white ring-offset-2 ring-offset-[var(--color-surface)]'
                      : isCompleted
                      ? 'bg-[var(--color-brand-500)] text-white'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-tertiary)] border border-[var(--color-border)]'
                  }`}
                >
                  {isCompleted ? '✓' : step}
                </div>
                <span className={`text-xs font-medium text-center leading-none w-20 ${isActive || isCompleted ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'}`}>
                  {STEP_LABELS[step]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
