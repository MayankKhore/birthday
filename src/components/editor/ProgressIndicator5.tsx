/** Five-step progress indicator for the creator */
import { useEditor } from '@/components/editor/EditorProvider';

const STEPS = [
  { id: 1, label: 'The surprise' },
  { id: 2, label: 'Your message' },
  { id: 3, label: 'Memories' },
  { id: 4, label: 'Soundtrack' },
  { id: 5, label: 'Preview & share' },
] as const;

export function ProgressIndicator5() {
  const { currentStep, goToStep } = useEditor();
  // Map 8 internal steps to 5 UI steps
  const uiStepMap: Record<number, number> = {
    1: 1, 2: 1, // occasion & details -> The surprise
    3: 2, // theme -> Your message (maybe)
    4: 3, // photos -> Memories
    5: 3, // personalize -> Memories
    6: 4, // music -> Soundtrack
    7: 4, // advanced -> Soundtrack
    8: 5, // preview -> Preview & share
  };
  const uiCurrent = uiStepMap[currentStep] ?? 1;

  return (
    <nav className="progress-indicator" aria-label="Creator steps" role="navigation">
      <ol className="progress-list">
        {STEPS.map((step, idx) => {
          const isActive = step.id === uiCurrent;
          const isCompleted = step.id < uiCurrent;
          return (
            <li key={step.id} className="progress-item">
              <button
                type="button"
                className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  // navigate only if allowed: can go to completed or current
                  if (step.id <= uiCurrent) {
                    // map back to first internal step of that ui step
                    const targetInternal = Object.keys(uiStepMap).find(k => uiStepMap[Number(k)] === step.id);
                    if (targetInternal) goToStep(Number(targetInternal) as any);
                  }
                }}
                disabled={step.id > uiCurrent}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="progress-circle" aria-hidden="true">{isCompleted ? '✓' : step.id}</span>
                <span className="progress-label">{step.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <span className="progress-connector" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}