/** Bottom action bar for creator: Save draft (outlined) and Continue (primary) */
import { useEditor } from '@/components/editor/EditorProvider';

interface Props {
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function BottomActionBar({ onSave, onNext, onPrev, canGoNext, isFirstStep, isLastStep }: Props) {
  const { currentStep } = useEditor();

  if (isLastStep) return null; // final step handles its own actions

  return (
    <footer className="creator-actions" role="region" aria-label="Creator actions">
      <div className="creator-actions-inner">
        <button type="button" className="btn btn-ghost" onClick={onSave}>
          Save and come back later
        </button>
        <div className="creator-actions-primary">
          {isFirstStep ? null : (
            <button type="button" className="btn btn-secondary" onClick={onPrev}>
              ← Back
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNext}
            disabled={!canGoNext}
            aria-disabled={!canGoNext}
          >
            {isFirstStep ? 'Continue to your message →' : 'Continue →'}
          </button>
        </div>
      </div>
    </footer>
  );
}