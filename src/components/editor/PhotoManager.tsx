/** PhotoManager — Stage 7 media-management system. */

import { useCallback, useRef, useState } from 'react';
import { useEditor } from '@/components/editor/EditorProvider';
import { getTierByPhotoCount, getDefaultTier } from '@/lib/media/config';
import { validateImageFile } from '@/lib/media/validation';
import { createObjectUrl, revokeObjectUrl } from '@/lib/media/storage';
import type { EditorPhoto } from '@/components/editor/EditorProvider';
import type { UUID } from '@/types';

interface PhotoManagerProps {
  onPhotoAdded?: (photo: EditorPhoto) => void;
}

export function PhotoManager({ onPhotoAdded }: PhotoManagerProps) {
  const { photos, addPhoto, removePhoto, updatePhoto, reorderPhotos } = useEditor();
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTier = getTierByPhotoCount(photos.length) ?? getDefaultTier();
  const photoLimit = currentTier.maxPhotos;
  const atLimit = photos.length >= photoLimit;
  const processFiles = useCallback(
    async (files: File[]) => {
      setUploadError(null);
      const filesToProcess = files.filter((f) => f.type.startsWith('image/'));

      if (filesToProcess.length === 0) {
        setUploadError('No image files found in the selection.');
        return;
      }

      if (atLimit) {
        setUploadError(
          `Photo limit reached (${photoLimit} photos on the ${currentTier.name} plan).`,
        );
        return;
      }

      const slotsLeft = photoLimit - photos.length;
      const toAdd = filesToProcess.slice(0, slotsLeft);

      if (toAdd.length < filesToProcess.length) {
        setUploadError(
          `Only ${slotsLeft} more photo(s) can be added (${photoLimit} total on the ${currentTier.name} plan).`,
        );
      }

      for (const file of toAdd) {
        const validation = validateImageFile(file);
        if (!validation.success) {
          setUploadError(validation.error?.message ?? 'Invalid file.');
          continue;
        }

        try {
          const previewUrl = createObjectUrl(file);

          addPhoto({
            file,
            previewUrl,
            fileName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            width: 0,
            height: 0,
            altText: '',
            caption: '',
          });

          const { width, height } = await readImageDimensions(file);

          onPhotoAdded?.({
            file,
            previewUrl,
            fileName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            width,
            height,
            altText: '',
            caption: '',
          } as EditorPhoto);
        } catch {
          setUploadError(`Couldn't process ${file.name}.`);
        }
      }
    },
    [photos, atLimit, photoLimit, currentTier.name, addPhoto, updatePhoto, onPhotoAdded],
  );

  const handleImageDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      setUploadError(null);
      const files = e.dataTransfer?.files;
      if (files) {
        await processFiles(Array.from(files));
      }
    },
    [processFiles],
  );

  const handleImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleImageDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(Array.from(files));
    e.target.value = '';
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = useCallback(
    (id: string) => {
      const photo = photos.find((p) => p.id === id);
      if (photo?.previewUrl) {
        revokeObjectUrl(photo.previewUrl);
      }
      removePhoto(id as UUID);
    },
    [photos, removePhoto],
  );

  const handleCaptionChange = (id: string, caption: string) => {
    updatePhoto(id as UUID, { caption });
  };

  const handleDateChange = (id: string, date: string) => {
    updatePhoto(id as UUID, { caption: date });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId === null || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const fromIndex = photos.findIndex((p) => p.id === draggedId);
    const toIndex = photos.findIndex((p) => p.id === targetId);
    if (fromIndex === -1 || toIndex === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const newPhotos = [...photos];
    const removed = newPhotos.splice(fromIndex, 1);
    if (removed.length === 0) return;
    newPhotos.splice(toIndex, 0, removed[0]!);
    const sorted = newPhotos.map((p, i) => ({
      ...p,
      sortOrder: i,
    }));
    const newOrder = sorted.map((p) => p.id) as UUID[];
    reorderPhotos(newOrder);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const readImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = createObjectUrl(file);
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        revokeObjectUrl(url);
      };
      img.onerror = () => {
        reject(new Error(`Failed to decode image: ${file.name}`));
      };
      img.src = url;
    });



  return (
    <div>
      {/* Upload zone */}
      <div
        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
        style={{
          borderColor: dragActive ? 'var(--color-brand-500)' : 'var(--color-border)',
          background: dragActive ? 'var(--color-brand-500-10)' : 'var(--color-surface)',
        }}
        onClick={handleBrowseClick}
        onDragOver={handleImageDragOver}
        onDragLeave={handleImageDragLeave}
        onDrop={handleImageDrop}
        role="button"
        aria-label="Upload photos"
        tabIndex={0}
      >
        <div className="flex flex-col items-center gap-3">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Drop photos here, or click to browse
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            JPEG, PNG, WebP, GIF (max 8MB each)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div
          className="clay-card p-4 border-l-4 border-l-[var(--color-error-dark)] mt-4"
          role="alert"
        >
          <p className="text-sm text-[var(--color-error-dark)]">{uploadError}</p>
        </div>
      )}
      {/* Photos grid */}
      {photos.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group rounded-xl border border-[var(--color-border)] overflow-hidden"
              draggable
              onDragStart={(e) => handleDragStart(e, photo.id)}
              onDragOver={(e) => handleDragOver(e, photo.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, photo.id)}
              onDragEnd={handleDragEnd}
            >
              <img
                src={photo.previewUrl}
                alt={photo.altText || photo.fileName}
                className="w-full h-40 object-cover"
                style={{ minHeight: '120px' }}
              />
              {photo.width > 0 && photo.height > 0 && (
                <div className="absolute bottom-1 right-1 text-[10px] text-[var(--color-text-tertiary)] bg-[var(--color-background)] px-1.5 py-0.5 rounded">
                  {photo.width} x {photo.height}
                </div>
              )}
              <div className="absolute top-1 right-1">
                <button
                  type="button"
                  onClick={() => handleRemove(photo.id)}
                  className="clay-icon-btn clay-icon-btn-sm !w-7 !h-7 !p-0"
                  style={{ background: 'var(--color-error-light)', color: 'var(--color-error-dark)' }}
                  aria-label={`Remove ${photo.fileName}`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="p-3 space-y-2">
                <input type="hidden" value={index} />
                <input
                  type="text"
                  placeholder="Caption"
                  value={photo.caption}
                  onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                  className="w-full text-xs border border-[var(--color-border)] rounded px-2 py-1"
                />
                <input
                  type="text"
                  placeholder="Date"
                  value={photo.caption}
                  onChange={(e) => handleDateChange(photo.id, e.target.value)}
                  className="w-full text-xs border border-[var(--color-border)] rounded px-2 py-1"
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Upgrade prompt when limit is reached */}
      {atLimit && (
        <div className="mt-6 clay-card p-5 border border-[var(--color-border)]">
          <div className="clay-icon-btn clay-icon-btn-lg mb-3" style={{ background: 'var(--color-brand-500)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h3 className="font-display text-base font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            You have reached the photo limit
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">
            You can add up to {photoLimit} photos on the {currentTier.name} plan. Upgrade to add
            more photos to your birthday microsite.
          </p>
          <a href="https://birthday-platform.example.com/pricing" className="clay-btn clay-btn-primary clay-btn-sm">
            Upgrade to add more photos
          </a>
        </div>
      )}
    </div>
  );
}
