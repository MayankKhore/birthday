/** Wizard step 3: memories (photo upload). */
import { autoPersonalize } from './createMapping';
import { EMPTY_FORM, type CreateFormState } from './createTypes';
import { PhotoUploader } from './PhotoUploader';
import type { StepProps } from './CreateStepsA';

export function StepPhotos({ form, set }: StepProps): React.ReactElement {
  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">Memories</p>
        <h2 className="text-display" style={{ fontSize: 'var(--text-2xl)', margin: 'var(--space-2) 0 var(--space-1)' }}>
          Add their favorite photos
        </h2>
        <p className="text-body text-sm">Photos stay in this browser and appear in the memory gallery. Add captions and reorder them.</p>
      </div>
      <PhotoUploader photos={form.photos} onChange={(photos: CreateFormState['photos']) => set('photos', photos)} />
      <button
        type="button"
        className="clay-btn clay-btn-ghost clay-btn-sm"
        onClick={() => {
          const auto = autoPersonalize({ ...EMPTY_FORM, ...form });
          set('storyChapters', auto.storyChapters);
          set('quizQuestions', auto.quizQuestions);
        }}
      >
        Refresh story + quiz from these details
      </button>
    </div>
  );
}
