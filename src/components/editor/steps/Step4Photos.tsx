/**
 * Step4Photos — Stage 7 editor step 4: Add photographs (optional).
 *
 * Uses PhotoManager for drag-and-drop + file picker image uploads with previews,
 * remove/reorder, per-file errors, captions, dates, and tier-aware photo limits.
 */

import { useEditor } from '@/components/editor/EditorProvider';
import { PhotoManager } from '@/components/editor/PhotoManager';
import { TierComparison } from '@/components/editor/TierComparison';

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

export function Step4Photos({ onNext, onPrev }: Props) {
  const { photos } = useEditor();

  return (
    <section className="clay-card p-8 sm:p-12 max-w-3xl mx-auto space-y-8">
      <div>
        <span className="clay-badge clay-badge-primary mb-3 inline-block">Step 4 of 8</span>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Add photographs (optional)
        </h1>
        <p className="text-body sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Upload photos to include in the birthday microsite. Captions and dates are saved per photo.
        </p>
      </div>

      <PhotoManager />

      <div className="pt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" className="clay-btn clay-btn-ghost" onClick={onPrev}>
          ← Back
        </button>
        <button
          type="button"
          className="clay-btn clay-btn-primary clay-btn-lg"
          onClick={onNext}
        >
          Continue →
        </button>
      </div>
    </section>
  );
}
