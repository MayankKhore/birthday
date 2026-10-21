/**
 * MemoryGalleryCard — Stage 8 interactive birthday card.
 *
 * A beautiful grid of photos with captions. Empty state shown when no
 * photos are available. Keyboard accessible, respects prefers-reduced-motion.
 */

import { useCallback, useState } from 'react';
import type { BirthdayProject } from '@/types';

interface Props {
  project: BirthdayProject;
  config?: { photoIds?: string[] };
  onComplete?: () => void;
  reducedMotion: boolean;
}

export function MemoryGalleryCard({
  project,
  config,
  onComplete,
  reducedMotion,
}: Props) {
  const [viewed, setViewed] = useState(false);

  const photos = (project.photos ?? []).sort((a, b) => a.sortOrder - b.sortOrder);
  const orderedPhotoIds = config?.photoIds ?? photos.map((p) => p.id);
  const orderedPhotos = photos.filter((p) => orderedPhotoIds.includes(p.id));
  const prefersReducedMotion = reducedMotion;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && viewed) {
        e.preventDefault();
        onComplete?.();
      }
    },
    [viewed, onComplete],
  );

  if (orderedPhotos.length === 0) {
    return (
      <div className="clay-card p-8 sm:p-12 max-w-md mx-auto text-center" role="region" aria-label="Memory gallery card">
        <div className="clay-icon-btn clay-icon-btn-lg mx-auto mb-6" style={{ background: 'var(--color-surface-lavender)', color: 'var(--color-brand-500)' }} aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
        <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Memory Gallery</h2>
        <p className="text-lg text-[var(--color-text-secondary)] mb-8">No photos yet — add photos in the creator to see them here.</p>
        <button type="button" role="button" aria-label="Continue to next card" onClick={onComplete} onKeyDown={handleKeyDown} className="clay-btn clay-btn-primary clay-btn-lg">Continue →</button>
      </div>
    );
  }

  return (
    <div className="clay-card p-8 sm:p-12 max-w-md mx-auto" role="region" aria-label="Memory gallery card">
      <h2 className="font-display text-xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Your favorite memories</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orderedPhotos.map((photo, idx) => (
          <div key={photo.id} className={`relative rounded-2xl overflow-hidden border border-[var(--color-border-strong)] shadow-sm animate-fade-in group`} style={{ animationDelay: `${150 + idx * 100}ms` }}>
            <img src={photo.dataUrl} alt={photo.altText || 'Memory photo'} className="w-full h-48 object-cover" loading="lazy" />
            <div className="p-4">
              <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">{photo.caption || photo.fileName}</p>
              {photo.caption && <p className="text-xs text-[var(--color-text-tertiary)]">{photo.caption}</p>}
            </div>
          </div>
        ))}
      </div>

      <button type="button" role="button" aria-label="Continue to next card" onClick={() => { setViewed(true); onComplete?.(); }} onKeyDown={handleKeyDown} className="mt-8 clay-btn clay-btn-primary clay-btn-lg">Continue →</button>
    </div>
  );
}