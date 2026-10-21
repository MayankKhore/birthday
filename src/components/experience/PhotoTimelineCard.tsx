/**
 * PhotoTimelineCard — Stage 8 interactive birthday card.
 *
 * A scrolling timeline of uploaded photos with dates. Empty state shown
 * when no photos are available.
 * Keyboard accessible, respects prefers-reduced-motion.
 */

import { useCallback, useState } from 'react';
import type { BirthdayProject } from '@/types';

interface Props {
  project: BirthdayProject;
  config?: { photoIds?: string[] };
  onComplete?: () => void;
  reducedMotion: boolean;
}

export function PhotoTimelineCard({
  project,
  config,
  onComplete,
  reducedMotion,
}: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [viewed, setViewed] = useState(false);

  const photos = (project.photos ?? []).sort((a, b) => a.sortOrder - b.sortOrder);
  const orderedPhotoIds = config?.photoIds ?? photos.map((p) => p.id);
  const orderedPhotos = photos.filter((p) => orderedPhotoIds.includes(p.id));
  const prefersReducedMotion = reducedMotion;

  const handleScroll = useCallback(() => {
    setScrolled(true);
  }, []);

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
      <div className="clay-card p-8 sm:p-12 max-w-md mx-auto text-center" role="region" aria-label="Photo timeline card">
        <div className="clay-icon-btn clay-icon-btn-lg mx-auto mb-6" style={{ background: 'var(--color-surface-lavender)', color: 'var(--color-brand-500)' }} aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
        <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Photo Timeline</h2>
        <p className="text-lg text-[var(--color-text-secondary)] mb-8">No photos yet — add photos in the creator to see them here.</p>
        <button type="button" role="button" aria-label="Continue to next card" onClick={onComplete} onKeyDown={handleKeyDown} className="clay-btn clay-btn-primary clay-btn-lg">Continue →</button>
      </div>
    );
  }

  return (
    <div className="clay-card p-8 sm:p-12 max-w-md mx-auto" role="region" aria-label="Photo timeline card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Memories in time</h2>
      </div>

      <div className="relative overflow-x-auto pb-4 snap-x scroll-smooth no-scrollbar" onScroll={handleScroll}>
        <div className="flex gap-4 px-2">
          {orderedPhotos.map((photo) => (
            <div key={photo.id} className="snap-start flex-shrink-0 w-64 h-64 rounded-2xl overflow-hidden border border-[var(--color-border-strong)] shadow-sm animate-fade-in group" style={{ animationDelay: `${100 * orderedPhotos.indexOf(photo)}ms` }}>
              <img src={photo.dataUrl} alt={photo.altText || 'Memory photo'} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white text-sm">
                {photo.caption || photo.fileName}
              </div>
              {photo.caption && (
                <div className="absolute top-1 right-1 bg-white/90 backdrop-blur text-[var(--color-text-tertiary)] text-xs px-2 py-0.5 rounded">
                  {photo.caption}
                </div>
              )}
              <div className="p-3 text-center">
                <p className="text-xs text-[var(--color-text-tertiary)]">{photo.fileName}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {scrolled && !viewed && (
        <div className="mt-6 animate-fade-in">
          <p className="text-sm text-[var(--color-text-tertiary)] mb-4">Scroll through the memories above</p>
          <button type="button" role="button" aria-label="Continue to next card" onClick={() => { setViewed(true); onComplete?.(); }} onKeyDown={handleKeyDown} className="clay-btn clay-btn-primary clay-btn-lg">Continue →</button>
        </div>
      )}

      {viewed && (
        <button type="button" role="button" aria-label="Continue to next card" onClick={onComplete} onKeyDown={handleKeyDown} className="mt-8 clay-btn clay-btn-primary clay-btn-lg">Continue →</button>
      )}
    </div>
  );
}