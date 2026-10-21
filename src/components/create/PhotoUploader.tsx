/** PhotoUploader — real local photo upload for the create wizard. */
import { useCallback, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { validateImageFile } from '@/lib/media/validation';
import { processImageFile } from '@/lib/media/imageProcessing';
import { MAX_WIZARD_PHOTOS, type WizardPhoto } from './createTypes';

interface Props {
  photos: WizardPhoto[];
  onChange: (photos: WizardPhoto[]) => void;
}

let localCounter = 0;
function nextLocalId(): string {
  localCounter += 1;
  return `local-${Date.now()}-${localCounter}`;
}

export function PhotoUploader({ photos, onChange }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) {
      setError('Choose image files (JPEG, PNG, WebP or GIF).');
      return;
    }
    const slots = MAX_WIZARD_PHOTOS - photos.length;
    if (slots <= 0) {
      setError(`You can add up to ${MAX_WIZARD_PHOTOS} photos.`);
      return;
    }
    setError(null);
    setBusy(true);
    const next = [...photos];
    for (const file of list.slice(0, slots)) {
      const validation = validateImageFile(file);
      if (!validation.success) {
        setError(validation.error?.message ?? 'That file could not be used.');
        continue;
      }
      try {
        const img = await processImageFile(file);
        next.push({
          localId: nextLocalId(),
          dataUrl: img.dataUrl,
          fileName: file.name,
          mimeType: img.mimeType,
          sizeBytes: img.sizeBytes,
          width: img.width,
          height: img.height,
          caption: '',
        });
      } catch {
        setError(`Could not read ${file.name}. Try a different photo.`);
      }
    }
    onChange(next);
    setBusy(false);
  }, [photos, onChange]);

  const setCaption = useCallback((localId: string, caption: string) => {
    onChange(photos.map((p) => (p.localId === localId ? { ...p, caption } : p)));
  }, [photos, onChange]);

  const remove = useCallback((localId: string) => {
    onChange(photos.filter((p) => p.localId !== localId));
  }, [photos, onChange]);

  const move = useCallback((localId: string, dir: -1 | 1) => {
    const idx = photos.findIndex((p) => p.localId === localId);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= photos.length) return;
    const next = [...photos];
    const a = next[idx];
    const b = next[swap];
    if (!a || !b) return;
    next[idx] = b;
    next[swap] = a;
    onChange(next);
  }, [photos, onChange]);

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Add photos"
        className={'clay-dropzone' + (dragActive ? ' clay-dropzone-active' : '')}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer?.files) void addFiles(e.dataTransfer.files); }}
      >
        <span className="clay-dropzone-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-4.5-4.5L6 21"/></svg>
        </span>
        <span className="clay-dropzone-text">{busy ? 'Adding photos…' : 'Drop photos here or click to browse'}</span>
        <span className="clay-dropzone-hint">JPEG, PNG, WebP or GIF · kept on this device · {photos.length}/{MAX_WIZARD_PHOTOS}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(e) => { if (e.target.files) void addFiles(e.target.files); e.target.value = ''; }}
        />
      </div>
      {error ? <p className="clay-error-text" role="alert" style={{ marginTop: 'var(--space-2)' }}>{error}</p> : null}
      <PhotoGrid photos={photos} setCaption={setCaption} remove={remove} move={move} />
    </div>
  );
}

function PhotoGrid(props: {
  photos: WizardPhoto[];
  setCaption: (id: string, caption: string) => void;
  remove: (id: string) => void;
  move: (id: string, dir: -1 | 1) => void;
}): ReactElement | null {
  const { photos, setCaption, remove, move } = props;
  if (photos.length === 0) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2" style={{ marginTop: 'var(--space-4)' }} role="list" aria-label="Uploaded photos">
      {photos.map((photo, index) => (
        <div key={photo.localId} className="clay-card-static" role="listitem" style={{ overflow: 'hidden' }}>
          <div style={{ position: 'relative' }}>
            <img src={photo.dataUrl} alt={photo.caption || photo.fileName} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
            <button
              type="button"
              onClick={() => remove(photo.localId)}
              className="clay-icon-btn clay-icon-btn-sm"
              style={{ position: 'absolute', top: '6px', right: '6px', background: 'var(--color-error-light)', color: 'var(--color-error-dark)' }}
              aria-label={`Remove ${photo.fileName}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div style={{ padding: 'var(--space-3)' }} className="space-y-2">
            <input
              type="text"
              value={photo.caption}
              maxLength={80}
              onChange={(e) => setCaption(photo.localId, e.target.value)}
              placeholder="Add a caption…"
              className="clay-input"
              style={{ minHeight: '38px', fontSize: 'var(--text-xs)' }}
              aria-label={`Caption for photo ${index + 1}`}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Photo {index + 1}</span>
              <span className="flex gap-1">
                <button type="button" className="clay-btn clay-btn-ghost clay-btn-sm" disabled={index === 0} onClick={() => move(photo.localId, -1)} aria-label="Move photo earlier">←</button>
                <button type="button" className="clay-btn clay-btn-ghost clay-btn-sm" disabled={index === photos.length - 1} onClick={() => move(photo.localId, 1)} aria-label="Move photo later">→</button>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

