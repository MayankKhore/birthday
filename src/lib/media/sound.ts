/**
 * Sound engine — 100% local WebAudio synthesis. No files, no network.
 * Everything runs after a user gesture (no autoplay).
 */

export type SfxKey =
  | 'pop' | 'chime' | 'sparkle' | 'whoosh' | 'flip'
  | 'match' | 'unwrap' | 'blow' | 'fanfare' | 'confettiPop';

export type MusicTrackId = 'gentle-piano' | 'warm-strings' | 'soft-ambient';

export const MUSIC_TRACKS: Array<{ id: MusicTrackId; name: string; mood: string }> = [
  { id: 'gentle-piano', name: 'Gentle Piano', mood: 'Soft music-box melody' },
  { id: 'warm-strings', name: 'Warm Strings', mood: 'Slow glowing pads' },
  { id: 'soft-ambient', name: 'Soft Ambient', mood: 'Dreamy drifting tones' },
];

let ctx: AudioContext | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxVolume = 0.4;
let musicVolume = 0.5;

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    sfxBus = ctx.createGain();
    sfxBus.gain.value = sfxVolume;
    sfxBus.connect(ctx.destination);
    musicBus = ctx.createGain();
    musicBus.gain.value = musicVolume;
    musicBus.connect(ctx.destination);
  }
  return ctx;
}

/** Call from any user gesture so the browser unlocks audio. Safe to call often. */
export function unlockAudio(): void {
  const c = ac();
  if (c && c.state === 'suspended') void c.resume();
}

export function getAudioContext(): AudioContext | null { return ac(); }
export function getMusicBus(): GainNode | null { void ac(); return musicBus; }

export function setSfxVolume(v: number): void {
  sfxVolume = Math.min(1, Math.max(0, v));
  if (sfxBus && ctx) sfxBus.gain.setTargetAtTime(sfxVolume, ctx.currentTime, 0.02);
}

export function setMusicVolume(v: number): void {
  musicVolume = Math.min(1, Math.max(0, v));
  if (musicBus && ctx) musicBus.gain.setTargetAtTime(musicVolume, ctx.currentTime, 0.05);
}

export function getSfxVolume(): number { return sfxVolume; }
export function getMusicVolume(): number { return musicVolume; }

export const midiToFreq = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);

export interface ToneOpts {
  freq: number; time: number; dur: number;
  type?: OscillatorType; gain?: number; glideTo?: number;
  bus?: GainNode | null; filterFreq?: number;
}

export function playTone(o: ToneOpts): void {
  const c = ac();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(Math.max(20, o.freq), o.time);
  if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.glideTo), o.time + o.dur);
  const peak = o.gain ?? 0.5;
  g.gain.setValueAtTime(0.0001, o.time);
  g.gain.exponentialRampToValueAtTime(peak, o.time + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, o.time + o.dur);
  if (o.filterFreq) {
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = o.filterFreq;
    osc.connect(g); g.connect(f); f.connect(o.bus ?? sfxBus ?? c.destination);
  } else {
    osc.connect(g); g.connect(o.bus ?? sfxBus ?? c.destination);
  }
  osc.start(o.time);
  osc.stop(o.time + o.dur + 0.05);
}

export interface NoiseOpts {
  time: number; dur: number;
  type?: BiquadFilterType; from?: number; to?: number;
  gain?: number; bus?: GainNode | null;
}

export function playNoise(o: NoiseOpts): void {
  const c = ac();
  if (!c) return;
  const len = Math.max(1, Math.floor(c.sampleRate * o.dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = o.type ?? 'bandpass';
  f.frequency.setValueAtTime(o.from ?? 1200, o.time);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, o.time + o.dur);
  const g = c.createGain();
  g.gain.setValueAtTime(o.gain ?? 0.4, o.time);
  g.gain.exponentialRampToValueAtTime(0.0001, o.time + o.dur);
  src.connect(f); f.connect(g); g.connect(o.bus ?? sfxBus ?? c.destination);
  src.start(o.time);
}

/* -------------------------------------------------- SFX */

export function playSfx(key: SfxKey, opts?: { volume?: number }): void {
  const c = ac();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();
  const t = c.currentTime + 0.01;
  const v = opts?.volume ?? 1;
  switch (key) {
    case 'pop':
      playTone({ freq: 320, glideTo: 660, time: t, dur: 0.12, gain: 0.5 * v });
      break;
    case 'chime':
      [81, 85, 88].forEach((m, i) => playTone({ freq: midiToFreq(m), time: t + i * 0.12, dur: 0.7, type: 'triangle', gain: 0.32 * v }));
      break;
    case 'sparkle':
      [0, 0.09, 0.18].forEach((d, i) => playTone({ freq: 1900 + i * 500, glideTo: 3400 + i * 600, time: t + d, dur: 0.22, gain: 0.16 * v }));
      break;
    case 'whoosh':
      playNoise({ time: t, dur: 0.5, from: 350, to: 2600, gain: 0.35 * v });
      break;
    case 'flip':
      playNoise({ time: t, dur: 0.07, type: 'highpass', from: 3000, gain: 0.25 * v });
      playNoise({ time: t + 0.09, dur: 0.09, type: 'highpass', from: 2400, gain: 0.3 * v });
      break;
    case 'match':
      playTone({ freq: midiToFreq(76), time: t, dur: 0.5, type: 'triangle', gain: 0.35 * v });
      playTone({ freq: midiToFreq(79), time: t + 0.08, dur: 0.6, type: 'triangle', gain: 0.35 * v });
      break;
    case 'unwrap':
      [0, 0.12, 0.24, 0.36].forEach((d) => playNoise({ time: t + d, dur: 0.1, type: 'lowpass', from: 1400, gain: 0.3 * v }));
      break;
    case 'blow':
      playNoise({ time: t, dur: 0.8, type: 'lowpass', from: 900, to: 300, gain: 0.5 * v });
      break;
    case 'fanfare':
      [72, 76, 79, 84].forEach((m, i) => playTone({ freq: midiToFreq(m), time: t + i * 0.14, dur: 0.32, type: 'sawtooth', gain: 0.16 * v, filterFreq: 2200 }));
      playTone({ freq: midiToFreq(76), time: t + 0.58, dur: 1.1, type: 'sawtooth', gain: 0.14 * v, filterFreq: 2200 });
      playTone({ freq: midiToFreq(79), time: t + 0.58, dur: 1.1, type: 'sawtooth', gain: 0.14 * v, filterFreq: 2200 });
      playTone({ freq: midiToFreq(84), time: t + 0.58, dur: 1.1, type: 'triangle', gain: 0.2 * v });
      break;
    case 'confettiPop':
      [0, 0.14, 0.28].forEach((d, i) => playTone({ freq: 420 + i * 140, glideTo: 900 + i * 160, time: t + d, dur: 0.1, type: 'square', gain: 0.1 * v }));
      break;
  }
}

/* -------------------------------------------------- generative music */

let musicTimer: number | null = null;
let musicTrack: MusicTrackId | null = null;
let musicStep = 0;

const PROG: number[][] = [
  [57, 60, 64], // Am
  [53, 57, 60], // F
  [48, 52, 55], // C (low)
  [55, 59, 62], // G
];
const PENTA = [69, 72, 74, 76, 79, 81, 84];

function scheduleBar(track: MusicTrackId, barIndex: number, barTime: number, barDur: number): void {
  const bus = getMusicBus();
  const chord = PROG[barIndex % PROG.length] ?? PROG[0] ?? [60, 64, 67];
  if (track === 'gentle-piano') {
    chord.forEach((m, i) => playTone({ freq: midiToFreq(m - 12), time: barTime + i * 0.06, dur: barDur * 0.9, type: 'triangle', gain: 0.10, bus }));
    for (let b = 0; b < 4; b++) {
      const pick = PENTA[(barIndex * 3 + b * 2 + (b % 2)) % PENTA.length] ?? 76;
      playTone({ freq: midiToFreq(pick), time: barTime + b * (barDur / 4), dur: 0.9, type: 'sine', gain: 0.14, bus });
    }
  } else if (track === 'warm-strings') {
    chord.forEach((m) => {
      playTone({ freq: midiToFreq(m), time: barTime, dur: barDur * 1.02, type: 'sawtooth', gain: 0.05, bus, filterFreq: 900 });
      playTone({ freq: midiToFreq(m) * 1.003, time: barTime, dur: barDur * 1.02, type: 'sawtooth', gain: 0.05, bus, filterFreq: 900 });
    });
    playTone({ freq: midiToFreq((chord[0] ?? 57) - 24), time: barTime, dur: barDur, type: 'sine', gain: 0.10, bus });
  } else {
    const root = chord[0] ?? 57;
    playTone({ freq: midiToFreq(root + 12), time: barTime, dur: barDur * 1.4, type: 'sine', gain: 0.07, bus });
    playTone({ freq: midiToFreq(root + 19), time: barTime + barDur / 2, dur: barDur, type: 'sine', gain: 0.06, bus });
    if (barIndex % 2 === 0) {
      playTone({ freq: midiToFreq(root + 24), time: barTime + barDur * 0.75, dur: 0.8, type: 'sine', gain: 0.05, bus });
    }
  }
}

export function startMusic(track: MusicTrackId): void {
  const c = ac();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();
  stopMusic();
  musicTrack = track;
  musicStep = 0;
  const BAR = 3.2;
  const tick = (): void => {
    const cc = ac();
    if (!cc || !musicTrack) return;
    const barTime = Math.max(cc.currentTime + 0.05, (tick as unknown as { next?: number }).next ?? cc.currentTime + 0.05);
    scheduleBar(musicTrack, musicStep, barTime, BAR);
    (tick as unknown as { next?: number }).next = barTime + BAR;
    musicStep += 1;
  };
  tick();
  musicTimer = window.setInterval(tick, 1500);
}

export function stopMusic(): void {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
  musicTrack = null;
}

export function isMusicPlaying(): boolean { return musicTimer !== null; }
export function getCurrentMusicTrack(): MusicTrackId | null { return musicTrack; }

