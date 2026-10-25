/**
 * MomentsCollage — decorative "Our Moments" photo board.
 *
 * Mirrors the reference art: a pastel storybook board with a display title,
 * a cream centre frame (the drop target / camera placeholder), tilted
 * polaroid tiles flanking it, scattered stars and hearts, and a retro camera
 * with a ribbon at the foot. The board is fluid, so the same component
 * serves the desktop wizard step and the phone-sized live preview.
 */

import { useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import '@/styles/moments-collage.css';

export interface MomentsPhoto {
  id: string;
  src: string;
  caption: string;
}

interface Props {
  photos: MomentsPhoto[];
  /** Compact layout for the narrow live-preview panel. */
  compact?: boolean;
  /** When provided the centre frame becomes the upload target. */
  onFiles?: ((files: FileList | File[]) => void) | undefined;
  onCaptionChange?: ((id: string, caption: string) => void) | undefined;
  onRemove?: ((id: string) => void) | undefined;
  onMove?: ((id: string, dir: -1 | 1) => void) | undefined;
  /** Id of the photo shown large in the centre frame (gallery mode). */
  featuredId?: string | undefined;
  /** Called when a surrounding tile is picked (gallery mode). */
  onSelect?: ((id: string) => void) | undefined;
  busy?: boolean;
  error?: string | null;
  /** Extra guidance rendered under the centre frame (e.g. file hints). */
  frameHint?: ReactNode;
}

const MAX_TILE_PHOTOS = 4;

export function MomentsCollage({
  photos,
  compact = false,
  onFiles,
  onCaptionChange,
  onRemove,
  onMove,
  featuredId,
  onSelect,
  busy = false,
  error = null,
  frameHint,
}: Props): ReactElement {
  // In gallery mode the featured photo lives in the centre frame; every other
  // photo becomes a surrounding tile. Otherwise the first four fill the tiles.
  const featured = featuredId ? photos.find((p) => p.id === featuredId) : undefined;
  const rest = featured ? photos.filter((p) => p.id !== featured.id) : photos;
  const tiles = rest.slice(0, MAX_TILE_PHOTOS);
  const extra = rest.slice(MAX_TILE_PHOTOS);
  const split = Math.ceil(tiles.length / 2);
  const left = tiles.slice(0, split);
  const right = tiles.slice(split);

  return (
    <section className={`moments-collage${compact ? ' moments-collage--compact' : ''}`} aria-label="Our moments photo board">
      <div className="moments-decor" aria-hidden="true">
        <span className="moments-star moments-star--1">✦</span>
        <span className="moments-star moments-star--2">✧</span>
        <span className="moments-star moments-star--3">✦</span>
        <span className="moments-star moments-star--4">✧</span>
        <span className="moments-heart moments-heart--1">♥</span>
        <span className="moments-heart moments-heart--2">♥</span>
        <span className="moments-heart moments-heart--3">♥</span>
        <span className="moments-heart moments-heart--4">♥</span>
      </div>

      <header className="moments-head">
        <p className="moments-eyebrow">A little box of happiness</p>
        <h2 className="moments-title">Our Moments</h2>
        <div className="moments-rule" aria-hidden="true">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M8 11S1.5 7.2 1.5 3.4A3.4 3.4 0 0 1 8 2a3.4 3.4 0 0 1 6.5 1.4C14.5 7.2 8 11 8 11Z" fill="currentColor" />
          </svg>
        </div>
        <p className="moments-subtitle">Every picture holds a little piece of us.</p>
      </header>

      <div className="moments-stage">
        <div className="moments-side moments-side--left">
          {left.map((photo, index) => (
            <Polaroid
              key={photo.id}
              photo={photo}
              index={index}
              onCaptionChange={onCaptionChange}
              onRemove={onRemove}
              onMove={onMove}
              onSelect={onSelect}
            />
          ))}
        </div>

        <div className="moments-center">
          <CentreFrame
            onFiles={onFiles}
            busy={busy}
            frameHint={frameHint}
            hasPhotos={photos.length > 0}
            featured={featured}
          />
        </div>

        <div className="moments-side moments-side--right">
          {right.map((photo, index) => (
            <Polaroid
              key={photo.id}
              photo={photo}
              index={index + split}
              onCaptionChange={onCaptionChange}
              onRemove={onRemove}
              onMove={onMove}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>

      {extra.length > 0 ? (
        <div className="moments-extra" role="list" aria-label="More photos">
          {extra.map((photo) => (
            <Polaroid
              key={photo.id}
              photo={photo}
              index={0}
              onCaptionChange={onCaptionChange}
              onRemove={onRemove}
              onMove={onMove}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="clay-error-text" role="alert" style={{ marginTop: 'var(--space-3)' }}>{error}</p>
      ) : null}

      <footer className="moments-foot">
        <CameraArt />
        <div className="moments-note">
          <p className="moments-note-text">Collect beautiful memories ♡</p>
          <Daisies />
        </div>
      </footer>
    </section>
  );
}

function Polaroid({
  photo,
  index,
  onCaptionChange,
  onRemove,
  onMove,
  onSelect,
}: {
  photo: MomentsPhoto;
  index: number;
  onCaptionChange?: ((id: string, caption: string) => void) | undefined;
  onRemove?: ((id: string) => void) | undefined;
  onMove?: ((id: string, dir: -1 | 1) => void) | undefined;
  onSelect?: ((id: string) => void) | undefined;
}): ReactElement {
  const editable = Boolean(onCaptionChange);
  const selectable = Boolean(onSelect);
  return (
    <figure
      className={`moments-polaroid${selectable ? ' moments-polaroid--selectable' : ''}`}
      role="listitem"
    >
      <span className="moments-tape" aria-hidden="true" />
      <span className="moments-polaroid-sticker" aria-hidden="true">♥</span>
      {selectable ? (
        <button
          type="button"
          className="moments-polaroid-pick"
          onClick={() => onSelect?.(photo.id)}
          aria-label={`Show ${photo.caption || `photo ${index + 1}`} in the centre`}
        >
          <img className="moments-polaroid-photo" src={photo.src} alt={photo.caption || `Photo ${index + 1}`} loading="lazy" />
        </button>
      ) : (
        <img className="moments-polaroid-photo" src={photo.src} alt={photo.caption || `Photo ${index + 1}`} loading="lazy" />
      )}
      <figcaption className="moments-caption">
        {editable ? (
          <input
            className="moments-caption-input"
            type="text"
            value={photo.caption}
            maxLength={80}
            placeholder="Add a caption…"
            aria-label={`Caption for photo ${index + 1}`}
            onChange={(e) => onCaptionChange?.(photo.id, e.target.value)}
          />
        ) : (
          <span className="moments-caption-text">{photo.caption || `Photo ${index + 1}`}</span>
        )}
        <span className="moments-caption-heart" aria-hidden="true">♥</span>
      </figcaption>
      {onRemove || onMove ? (
        <div className="moments-polaroid-actions">
          <button
            type="button"
            className="moments-tile-btn"
            aria-label={`Move photo ${index + 1} earlier`}
            disabled={!onMove}
            onClick={() => onMove?.(photo.id, -1)}
          >
            ←
          </button>
          <button
            type="button"
            className="moments-tile-btn moments-tile-btn-danger"
            aria-label={`Remove photo ${index + 1}`}
            onClick={() => onRemove?.(photo.id)}
          >
            ✕
          </button>
          <button
            type="button"
            className="moments-tile-btn"
            aria-label={`Move photo ${index + 1} later`}
            disabled={!onMove}
            onClick={() => onMove?.(photo.id, 1)}
          >
            →
          </button>
        </div>
      ) : null}
    </figure>
  );
}

function CentreFrame({
  onFiles,
  busy,
  frameHint,
  hasPhotos,
  featured,
}: {
  onFiles?: ((files: FileList | File[]) => void) | undefined;
  busy: boolean;
  frameHint?: ReactNode | undefined;
  hasPhotos: boolean;
  featured?: MomentsPhoto | undefined;
}): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const openPicker = (): void => inputRef.current?.click();

  return (
    <div
      className={`moments-frame${dragActive ? ' moments-dropzone-active' : ''}`}
      onDragOver={(e) => {
        if (!onFiles) return;
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        if (!onFiles) return;
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer?.files) onFiles(e.dataTransfer.files);
      }}
    >
      <span className="moments-frame-heart" aria-hidden="true">
        <svg width="26" height="22" viewBox="0 0 16 12" fill="none">
          <path d="M8 11S1.5 7.2 1.5 3.4A3.4 3.4 0 0 1 8 2a3.4 3.4 0 0 1 6.5 1.4C14.5 7.2 8 11 8 11Z" fill="currentColor" />
        </svg>
      </span>

      {featured ? (
        <figure className="moments-featured">
          <img className="moments-featured-photo" src={featured.src} alt={featured.caption || 'Featured memory'} />
          {featured.caption ? (
            <figcaption className="moments-featured-caption">{featured.caption}</figcaption>
          ) : null}
        </figure>
      ) : onFiles ? (
        <div
          className="moments-dropzone"
          role="button"
          tabIndex={0}
          aria-label="Add photos"
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker();
            }
          }}
        >
          <CameraGlyph />
          <p className="moments-frame-title">{busy ? 'Adding photos…' : hasPhotos ? 'Add more photos' : 'Add your photos'}</p>
          <p className="moments-frame-hint">Drop them here or click to browse</p>
        </div>
      ) : (
        <div className="moments-dropzone">
          <CameraGlyph />
          <p className="moments-frame-title">Your favourite picture goes here</p>
        </div>
      )}

      {frameHint ? <p className="moments-frame-hint">{frameHint}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          if (e.target.files && onFiles) onFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

/** Camera outline with a heart in the lens — the empty-frame placeholder. */
function CameraGlyph(): ReactElement {
  return (
    <svg width="72" height="60" viewBox="0 0 72 60" fill="none" aria-hidden="true">
      <rect x="8" y="16" width="56" height="38" rx="8" stroke="currentColor" strokeWidth="2" />
      <path d="M26 16l3-6h14l3 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="36" cy="35" r="11" stroke="currentColor" strokeWidth="2" />
      <path d="M36 40s-5-3.1-5-6a2.6 2.6 0 0 1 5-1.1A2.6 2.6 0 0 1 41 34c0 2.9-5 6-5 6Z" fill="currentColor" opacity=".65" />
      <circle cx="54" cy="26" r="2.4" fill="currentColor" opacity=".6" />
    </svg>
  );
}

/** Pink retro camera with a lavender ribbon — the board's footer art. */
function CameraArt(): ReactElement {
  return (
    <svg className="moments-camera" viewBox="0 0 220 130" fill="none" role="img" aria-label="A pink camera with a flowing lavender ribbon">
      <path d="M78 92c-16 8-30 4-40 14-6 6-14 8-22 6" stroke="#C9B8E6" strokeWidth="7" strokeLinecap="round" />
      <path d="M142 92c16 8 30 4 40 14 6 6 14 8 22 6" stroke="#C9B8E6" strokeWidth="7" strokeLinecap="round" />
      <path d="M92 106c8 8 28 8 36 0" stroke="#DCCFF0" strokeWidth="7" strokeLinecap="round" />
      <rect x="62" y="34" width="96" height="58" rx="12" fill="#F7BBD3" />
      <rect x="62" y="34" width="96" height="58" rx="12" stroke="#E79CBC" strokeWidth="2" />
      <path d="M92 34l5-9h26l5 9" fill="#F7BBD3" stroke="#E79CBC" strokeWidth="2" strokeLinejoin="round" />
      <rect x="86" y="40" width="22" height="10" rx="4" fill="#FFF1F6" stroke="#E79CBC" strokeWidth="1.5" />
      <circle cx="110" cy="64" r="20" fill="#FFF1F6" stroke="#E79CBC" strokeWidth="2" />
      <circle cx="110" cy="64" r="11" fill="#E9A9C0" opacity=".7" />
      <circle cx="142" cy="46" r="4" fill="#FFF1F6" stroke="#E79CBC" strokeWidth="1.5" />
    </svg>
  );
}

/** Small daisy cluster for the note card. */
function Daisies(): ReactElement {
  return (
    <svg className="moments-note-daisies" viewBox="0 0 60 60" fill="none" aria-hidden="true">
      <path d="M30 58V34" stroke="#8FAE7E" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 46c-6 0-11-3-13-8 6-1 11 1 13 8Z" fill="#A8C492" />
      <g transform="translate(30 22)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <ellipse key={deg} cx="0" cy="-10" rx="4" ry="7" fill="#FFFFFF" stroke="#E7D9EC" strokeWidth=".8" transform={`rotate(${deg})`} />
        ))}
        <circle r="5" fill="#F3D06A" />
      </g>
      <g transform="translate(14 40) scale(.62)">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse key={deg} cx="0" cy="-10" rx="4" ry="7" fill="#FFFFFF" stroke="#E7D9EC" strokeWidth="1" transform={`rotate(${deg})`} />
        ))}
        <circle r="5" fill="#F3D06A" />
      </g>
    </svg>
  );
}
