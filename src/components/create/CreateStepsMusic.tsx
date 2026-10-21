/** Wizard step 4a: music picker + upload-from-file. Files stay on-device. */
import { useCallback, useRef, useState } from 'react';
import { MUSIC_TRACKS, startMusic, stopMusic, type MusicTrackId } from '@/lib/media/sound';
import { validateAudioFile } from '@/lib/media/validation';
import { deleteUploadedAudio, saveUploadedAudio } from '@/lib/media/audioStorage';
import type { WizardTrack } from './createTypes';
import type { StepProps } from './CreateStepsA';

interface MusicProps extends StepProps {
  uploadedTrackId: string | null;
  onUploaded: (trackId: string | null, fileName: string) => void;
}

export function StepMusic({ form, set, uploadedTrackId, onUploaded }: MusicProps): React.ReactElement {
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioBusy, setAudioBusy] = useState(false);
  const [previewing, setPreviewing] = useState<WizardTrack | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const stopPreview = useCallback(() => {
    stopMusic();
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
    }
    setPreviewing(null);
  }, []);

  const previewTrack = useCallback(async (track: WizardTrack) => {
    stopPreview();
    if (track === 'none') return;
    setPreviewing(track);
    if (track === 'uploaded') {
      if (!uploadedTrackId) { setAudioError('Upload a music file first.'); setPreviewing(null); return; }
      const { loadAudioObjectUrl } = await import('@/lib/media/audioStorage');
      const url = await loadAudioObjectUrl(uploadedTrackId);
      if (!url) { setAudioError('The uploaded file could not be found. Upload it again.'); setPreviewing(null); return; }
      const el = new Audio(url);
      el.loop = true;
      audioPreviewRef.current = el;
      try { await el.play(); } catch { setPreviewing(null); }
      return;
    }
    startMusic(track as MusicTrackId);
  }, [stopPreview, uploadedTrackId]);

  const handleFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    const validation = validateAudioFile(file);
    if (!validation.success) {
      setAudioError(validation.error?.message ?? 'That audio file could not be used.');
      return;
    }
    setAudioError(null);
    setAudioBusy(true);
    stopPreview();
    try {
      if (uploadedTrackId) await deleteUploadedAudio(uploadedTrackId);
      const stored = await saveUploadedAudio(file);
      onUploaded(stored.trackId, stored.fileName);
      set('uploadedFileName', stored.fileName);
      set('track', 'uploaded');
    } catch {
      setAudioError('Could not store that file in this browser.');
    } finally {
      setAudioBusy(false);
    }
  }, [onUploaded, set, stopPreview, uploadedTrackId]);

  const trackOptions: Array<{ id: WizardTrack; name: string; mood: string }> = [
    ...MUSIC_TRACKS.map((t) => ({ id: t.id as WizardTrack, name: t.name, mood: t.mood + ' · plays offline' })),
    { id: 'uploaded' as WizardTrack, name: form.uploadedFileName ? `Your file: ${form.uploadedFileName}` : 'Your own file', mood: 'MP3, WAV, OGG or AAC from this device' },
    { id: 'none' as WizardTrack, name: 'No music', mood: 'Keep the experience silent' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Soundtrack</p>
        <h2 className="text-display" style={{ fontSize: 'var(--text-2xl)', margin: 'var(--space-2) 0 var(--space-1)' }}>
          Choose the music
        </h2>
        <p className="text-body text-sm">Built-in tunes are generated on-device — no downloads. Or add your own file; it never leaves this browser.</p>
      </div>

      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
        <input type="checkbox" checked={form.musicEnabled} onChange={(e) => set('musicEnabled', e.target.checked)} style={{ width: 'auto' }} />
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Play music during the experience</span>
      </label>

      <div className="space-y-2" role="radiogroup" aria-label="Music track">
        {trackOptions.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={form.track === t.id}
            onClick={() => { set('track', t.id); setAudioError(null); }}
            className={'clay-tile' + (form.track === t.id ? ' clay-tile-selected' : '')}
            style={{ flexDirection: 'row', justifyContent: 'space-between', textAlign: 'left', width: '100%', padding: 'var(--space-3) var(--space-4)' }}
          >
            <span>
              <span style={{ display: 'block', fontWeight: 600, fontSize: 'var(--text-sm)' }}>{t.name}</span>
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{t.mood}</span>
            </span>
            <span className="flex gap-1">
              {previewing === t.id ? (
                <span className="clay-btn clay-btn-ghost clay-btn-sm" onClick={(e) => { e.stopPropagation(); stopPreview(); }}>Stop</span>
              ) : (
                t.id !== 'none' && (
                  <span className="clay-btn clay-btn-ghost clay-btn-sm" onClick={(e) => { e.stopPropagation(); void previewTrack(t.id); }}>Preview</span>
                )
              )}
            </span>
          </button>
        ))}
      </div>

      <div>
        <input
          ref={fileRef}
          type="file"
          accept="audio/mpeg,audio/wav,audio/ogg,audio/aac,.mp3,.wav,.ogg,.aac,.m4a"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(e) => { void handleFile(e.target.files?.[0]); e.target.value = ''; }}
        />
        <button type="button" className="clay-btn clay-btn-secondary" disabled={audioBusy} onClick={() => fileRef.current?.click()}>
          {audioBusy ? 'Storing…' : form.uploadedFileName ? 'Replace music file' : 'Upload a music file'}
        </button>
        {audioError ? <p className="clay-error-text" role="alert" style={{ marginTop: 'var(--space-2)' }}>{audioError}</p> : null}
      </div>

      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
        <input type="checkbox" checked={form.soundEffects} onChange={(e) => set('soundEffects', e.target.checked)} style={{ width: 'auto' }} />
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Play sound effects (pops, chimes, fanfares)</span>
      </label>
    </div>
  );
}
