/**
 * PhotoGalleryScene — swipeable photo gallery with captions.
 *
 * The gallery is presented as the decorative "Our Moments" board: the photo
 * in focus sits in the cream centre frame while the remaining photos fan out
 * as tilted polaroids on either side. Picking a tile promotes it to the
 * centre, so the board stays browsable without losing the collage look.
 */

import { useState } from 'react';
import { playSfx } from '@/lib/media/sound';
import { MomentsCollage } from '@/components/create/MomentsCollage';
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
    <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto" style={{ background: 'var(--color-page)' }}>
      <div className="w-full max-w-2xl">
        <MomentsCollage
          photos={photos.map((p) => ({
            id: p.id,
            src: p.dataUrl,
            caption: p.caption || '',
          }))}
          featuredId={current.id}
          onSelect={(id) => {
            const next = photos.findIndex((p) => p.id === id);
            if (next >= 0 && next !== index) {
              if (sfxEnabled) playSfx('pop');
              setIndex(next);
            }
          }}
        />

        <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-5)' }}>
          Moments with {recipientName}
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

        <div className="text-center">
          <button type="button" className="clay-btn clay-btn-primary clay-btn-lg" style={{ marginTop: 'var(--space-5)' }} onClick={onComplete}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}