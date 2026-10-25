/** PhotoUploader — real local photo upload for the create wizard. */
import { useCallback, useState } from 'react';
import { validateImageFile } from '@/lib/media/validation';
import { processImageFile } from '@/lib/media/imageProcessing';
import { MAX_WIZARD_PHOTOS, type WizardPhoto } from './createTypes';
import { MomentsCollage } from './MomentsCollage';

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
    <MomentsCollage
      photos={photos.map((p) => ({ id: p.localId, src: p.dataUrl, caption: p.caption }))}
      onFiles={(files) => void addFiles(files)}
      onCaptionChange={setCaption}
      onRemove={remove}
      onMove={move}
      busy={busy}
      error={error}
      frameHint={`JPEG, PNG, WebP or GIF - kept on this device - ${photos.length}/${MAX_WIZARD_PHOTOS}`}
    />
  );
}


