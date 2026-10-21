/**
 * PhotoGalleryScene — swipeable photo gallery with captions.
 */

import { useState } from 'react';
import { playSfx } from '@/lib/media/sound';
import type { BirthdayProject } from '@/types';

interface Props {
  photos: BirthdayProject['photos'];
  recipientName: string;
  sfxEnabled: boolean;
  onComplete: () => void;
}

export function PhotoGalleryScene({ photos, recipientName, sfxEnabled, onComplete }: Props): React.ReactElement {
  const [index, setIndex] = useState(0);
  const current = photos[index];
  const go = (dir: -1 | 1): void => {
    if (sfxEnabled) playSfx('flip');
    setIndex((i) => (i + dir + photos.length) % Math.max(1, photos.length));
  };
  if (!current || photos.length === 0) {
    return (
      <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center p-6 text-center" style={{ background: 'var(--color-page)' }}>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>No photos were added to this page.</p>
        <button type="button" className="clay-btn clay-btn-primary clay-btn-lg" style={{ marginTop: 'var(--space-5)' }} onClick={onComplete}>Continue →</button>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center p-6 overflow-y-auto" style={{ background: 'var(--color-page)' }}>
      <div className="w-full max-w-md text-center">
        <p className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>Photo memories</p>
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
          Moments with {recipientName}
        </h2>
        <div className="clay-photo-frame" style={{ width: '100%' }}>
          <img src={current.dataUrl} alt={current.caption || current.fileName || `Memory ${index + 1}`} style={{ width: '100%', maxHeight: '46vh', objectFit: 'cover', borderRadius: 'var(--radius-md)', display: 'block' }} />
        </div>
        {current.caption ? (
          <p className="text-body" style={{ marginTop: 'var(--space-3)' }}>{current.caption}</p>
        ) : null}
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)', marginTop: 'var(--space-2)' }}>
          {index + 1} of {photos.length}
        </p>
        <div className="flex items-center justify-center gap-2" style={{ marginTop: 'var(--space-4)' }}>
          <button type="button" className="clay-icon-btn" onClick={() => go(-1)} aria-label="Previous photo">←</button>
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { if (sfxEnabled) playSfx('pop'); setIndex(i); }}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              style={{
                width: i === index ? '22px' : '8px', height: '8px', borderRadius: '9999px',
                background: i === index ? 'var(--color-brand-500)' : 'var(--color-border)',
              }}
            />
          ))}
          <button type="button" className="clay-icon-btn" onClick={() => go(1)} aria-label="Next photo">→</button>
        </div>
        <button type="button" className="clay-btn clay-btn-primary clay-btn-lg" style={{ marginTop: 'var(--space-6)' }} onClick={onComplete}>
          Continue →
        </button>
      </div>
    </div>
  );
}