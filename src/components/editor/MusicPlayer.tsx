/** MusicPlayer — Stage 7 audio selection and playback controls. */

import { useCallback, useRef, useState } from 'react';
import { useEditor } from '@/components/editor/EditorProvider';

interface Props {
  onMusicChange?: (enabled: boolean, trackId?: string) => void;
}

/**
 * Sample audio tracks bundled with the project.
 * These are original, properly licensed assets.
 */
export const SAMPLE_AUDIO_TRACKS: Array<{
  id: string;
  name: string;
  src: string;
  duration?: number;
}> = [
  { id: 'gentle-piano', name: 'Gentle Piano', src: '/audio/gentle-piano.mp3', duration: 45 },
  { id: 'cheerful-ukulele', name: 'Cheerful Ukulele', src: '/audio/cheerful-ukulele.mp3', duration: 38 },
  { id: 'warm-strings', name: 'Warm Strings', src: '/audio/warm-strings.mp3', duration: 52 },
  { id: 'soft-ambient', name: 'Soft Ambient', src: '/audio/soft-ambient.mp3', duration: 60 },
];

export function MusicPlayer({ onMusicChange }: Props) {
  const { project, updateField } = useEditor();
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedTrackId, setSelectedTrackId] = useState<string | undefined>(project.musicTrackId);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const musicEnabled = !!project.musicEnabled;

  const handleTrackChange = useCallback(
    (trackId: string | undefined) => {
      setSelectedTrackId(trackId);
      updateField('musicTrackId', trackId);
      onMusicChange?.(musicEnabled, trackId);
      if (audioRef.current) {
        audioRef.current.src = trackId
          ? SAMPLE_AUDIO_TRACKS.find((t) => t.id === trackId)?.src ?? ''
          : '';
        audioRef.current.load();
        if (playing) audioRef.current.play().catch(() => setPlaying(false));
      }
    },
    [updateField, onMusicChange, musicEnabled, playing],
  );

  const handleMusicToggle = useCallback(
    (enabled: boolean) => {
      updateField('musicEnabled', enabled);
      onMusicChange?.(enabled, selectedTrackId);
    },
    [updateField, onMusicChange, selectedTrackId],
  );

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().then(() => setPlaying(true)).catch((err) => { setAudioError(`Couldn't play audio: ${err.message}`); setPlaying(false); }); }
  }, [playing]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const vol = parseFloat(e.target.value);
      setVolume(vol);
      if (audioRef.current) audioRef.current.volume = vol;
    }, [],
  );

  const handleTimeUpdate = useCallback(() => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); }, []);
  const handleLoadedMetadata = useCallback(() => { if (audioRef.current) setDuration(audioRef.current.duration); }, []);
  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value);
      if (audioRef.current) { audioRef.current.currentTime = time; setCurrentTime(time); }
    }, [],
  );
  const handleEnded = useCallback(() => { setPlaying(false); setCurrentTime(0); }, []);

  const selectedTrack = SAMPLE_AUDIO_TRACKS.find((t) => t.id === selectedTrackId);

  return (
    <div className="space-y-4">
      <div className="clay-card p-4">
        <h3 className="font-display text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>Background music (optional)</h3>
        <label className="flex items-center gap-3 cursor-pointer clay-card-static p-4">
          <input type="checkbox" checked={musicEnabled} onChange={(e) => handleMusicToggle(e.target.checked)} className="clay-checkbox" />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Enable background music</span>
        </label>
        {musicEnabled && (
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-2">Choose a track</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {SAMPLE_AUDIO_TRACKS.map((track) => (
                  <button key={track.id} type="button" onClick={() => handleTrackChange(track.id)} className={`clay-card p-3 text-left transition-all ${selectedTrackId === track.id ? 'clay-tile-selected' : ''}`} style={{ borderColor: selectedTrackId === track.id ? 'var(--color-brand-500)' : 'var(--color-border)' }}>
                    <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{track.name}</p>
                    {track.duration && <p className="text-xs text-[var(--color-text-tertiary)]">{track.duration}s</p>}
                  </button>
                ))}
              </div>
            </div>
            {selectedTrack && (
              <div className="clay-card-static p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={handlePlayPause} className="clay-btn clay-btn-primary" aria-label={playing ? 'Pause' : 'Play'} style={{ minWidth: '44px' }}>
                    {playing ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21" /></svg>
                    )}
                  </button>
                  <input type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek} className="flex-1 h-2 -webkit-appearance-none appearance-none rounded bg-[var(--color-border)]" style={{ background: `linear-gradient(to right, var(--color-brand-500) ${(currentTime / (duration || 1)) * 100}%, var(--color-border) ${(currentTime / (duration || 1)) * 100}%)` }} aria-label="Seek" />
                  <span className="text-xs tabular-nums text-[var(--color-text-tertiary)] w-14 text-right">{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-tertiary)' }}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19 3l4 4" /><path d="M23 3l-4 4" /><path d="M15 9a5 5 0 0 1 0 6" /></svg>
                  <input type="range" min={0} max={1} step={0.1} value={volume} onChange={handleVolumeChange} className="flex-1 h-2 -webkit-appearance-none appearance-none rounded bg-[var(--color-border)]" style={{ background: `linear-gradient(to right, var(--color-brand-500) ${volume * 100}%, var(--color-border) ${volume * 100}%)` }} aria-label="Volume" />
                  <span className="text-xs tabular-nums text-[var(--color-text-tertiary)] w-10 text-right">{Math.round(volume * 100)}%</span>
                </div>
                {audioError && <p className="text-xs text-[var(--color-error-dark)]" role="alert">{audioError}</p>}
              </div>
            )}
          </div>
        )}
        <p className="mt-4 text-xs text-[var(--color-text-tertiary)]">Music never autoplays. The recipient must explicitly interact to start playback.</p>
      </div>
      <audio ref={audioRef} src={selectedTrack?.src ?? ''} preload="metadata" onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleEnded} onError={(e) => setAudioError(`Audio error: ${(e.target as HTMLAudioElement).error?.message ?? 'Unknown'}`)} />
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
