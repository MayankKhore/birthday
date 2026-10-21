/**
 * ExperienceMusicPlayer — real music + sound controller for the experience.
 * - Built-in tracks: generated locally with WebAudio (no files, no network).
 * - Uploaded track: played from the IndexedDB blob saved by the creator.
 * - No autoplay: everything starts from an explicit tap.
 * Floating pill UI that never covers the scene content.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { BirthdayProject } from '@/types';
import {
  MUSIC_TRACKS, setMusicVolume, setSfxVolume,
  startMusic, stopMusic, unlockAudio, playSfx,
  type MusicTrackId, type SfxKey,
} from '@/lib/media/sound';
import { isCustomTrackId, loadAudioObjectUrl, getStoredAudioName } from '@/lib/media/audioStorage';

interface Props {
  project: BirthdayProject;
  soundEffectsEnabled?: boolean;
  onMusicToggle?: (playing: boolean) => void;
}

const SFX_BUTTONS: Array<{ key: SfxKey; label: string }> = [
  { key: 'pop', label: 'Pop' },
  { key: 'chime', label: 'Chime' },
  { key: 'sparkle', label: 'Sparkle' },
  { key: 'whoosh', label: 'Whoosh' },
  { key: 'flip', label: 'Flip' },
  { key: 'match', label: 'Match' },
  { key: 'unwrap', label: 'Unwrap' },
  { key: 'fanfare', label: 'Fanfare' },
];

export function ExperienceMusicPlayer({ project, soundEffectsEnabled = true, onMusicToggle }: Props): React.ReactElement | null {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [sfxVol, setSfxVolState] = useState(0.4);
  const [expanded, setExpanded] = useState(false);
  const [trackLabel, setTrackLabel] = useState<string>('');
  const [notice, setNotice] = useState<string | null>(null);
  const fileAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileUrlRef = useRef<string | null>(null);
  const trackId = project.musicTrackId;
  const enabled = Boolean(project.musicEnabled) && trackId !== undefined;

  useEffect(() => {
    let cancelled = false;
    if (!trackId || isCustomTrackId(trackId)) {
      if (!trackId) { setTrackLabel('Silent'); return; }
      setTrackLabel('Your song');
      void getStoredAudioName(trackId).then((name) => {
        if (!cancelled && name) setTrackLabel(name);
      });
      return () => { cancelled = true; };
    }
    const found = MUSIC_TRACKS.find((t) => t.id === trackId);
    setTrackLabel(found ? found.name : 'Music');
    return () => { cancelled = true; };
  }, [trackId]);

  const stopAll = useCallback(() => {
    stopMusic();
    if (fileAudioRef.current) {
      fileAudioRef.current.pause();
      fileAudioRef.current = null;
    }
    if (fileUrlRef.current) {
      URL.revokeObjectURL(fileUrlRef.current);
      fileUrlRef.current = null;
    }
    setPlaying(false);
  }, []);

  useEffect(() => () => { stopAll(); }, [stopAll]);

  const handleToggle = useCallback(async () => {
    unlockAudio();
    setNotice(null);
    if (playing) {
      stopAll();
      onMusicToggle?.(false);
      return;
    }
    if (!trackId) return;
    if (isCustomTrackId(trackId)) {
      const url = await loadAudioObjectUrl(trackId);
      if (!url) {
        setNotice('The uploaded song is not on this device, so the built-in tune will play instead.');
        startMusic('gentle-piano');
        setPlaying(true);
        onMusicToggle?.(true);
        return;
      }
      fileUrlRef.current = url;
      const el = new Audio(url);
      el.loop = true;
      el.volume = volume;
      fileAudioRef.current = el;
      try {
        await el.play();
        setPlaying(true);
        onMusicToggle?.(true);
      } catch {
        setNotice('Music could not start — tap again to retry.');
      }
      return;
    }
    startMusic(trackId as MusicTrackId);
    setPlaying(true);
    onMusicToggle?.(true);
  }, [playing, stopAll, trackId, volume, onMusicToggle]);

  const handleVolume = useCallback((v: number) => {
    setVolumeState(v);
    setMusicVolume(v);
    if (fileAudioRef.current) fileAudioRef.current.volume = v;
  }, []);

  const handleSfxVolume = useCallback((v: number) => {
    setSfxVolState(v);
    setSfxVolume(v);
  }, []);

  const previewSfx = useCallback((key: SfxKey) => {
    unlockAudio();
    playSfx(key);
  }, []);

  if (!enabled && !soundEffectsEnabled) return null;

  return (
    <div
      style={{
        position: 'fixed', right: 'var(--space-4)', bottom: 'var(--space-4)', zIndex: 600,
        maxWidth: 'calc(100vw - 2rem)',
      }}
    >
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        {enabled ? (
          <button
            type="button"
            className="clay-icon-btn clay-icon-btn-sm"
            style={{ color: playing ? 'var(--color-brand-700)' : undefined }}
            onClick={() => void handleToggle()}
            aria-label={playing ? "Pause ${trackLabel}" : "Play ${trackLabel}"}
            aria-pressed={playing}
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
        ) : null}
        <button
          type="button"
          className="clay-btn clay-btn-ghost clay-btn-sm"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-label="Sound controls"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>
          {enabled ? trackLabel : "Sounds"}
        </button>
      </div>

      {expanded ? (
        <div className="glass-panel animate-slide-up" style={{ marginTop: 'var(--space-2)', padding: 'var(--space-4)', width: '270px' }}>
          {enabled ? (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-1)' }}>
                <span className="text-xs font-semibold">Music volume</span>
                <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range" min={0} max={1} step={0.05} value={volume}
                onChange={(e) => handleVolume(parseFloat(e.target.value))}
                aria-label="Music volume" style={{ minHeight: 'auto' }}
              />
            </div>
          ) : null}
          {soundEffectsEnabled ? (
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-1)' }}>
                <span className="text-xs font-semibold">Sound effects</span>
                <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{Math.round(sfxVol * 100)}%</span>
              </div>
              <input
                type="range" min={0} max={1} step={0.05} value={sfxVol}
                onChange={(e) => handleSfxVolume(parseFloat(e.target.value))}
                aria-label="Sound effects volume" style={{ minHeight: 'auto' }}
              />
              <div className="flex flex-wrap gap-1" style={{ marginTop: 'var(--space-2)' }}>
                {SFX_BUTTONS.map((b) => (
                  <button key={b.key} type="button" className="clay-btn clay-btn-ghost clay-btn-sm" style={{ fontSize: 'var(--text-xs)' }} onClick={() => previewSfx(b.key)} aria-label={"Preview ${b.label} sound"}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {notice ? <p className="text-xs" role="status" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>{notice}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Global helper so scenes can trigger real sound effects. */
export function playSoundEffect(key: SfxKey): void {
  playSfx(key);
}