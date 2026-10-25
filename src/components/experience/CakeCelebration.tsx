/**
 * CakeCelebration — cinematic, interactive birthday cake scene.
 *
 * The cake reacts continuously to wind. Holding the blow button and using the
 * microphone share the same interaction model, and candles extinguish one by
 * one before the celebration background comes alive.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BirthdayProject } from '@/types';
import { CelebrationCake } from './CelebrationCake';
import '@/styles/celebration-cake.css';

interface Props {
  project: BirthdayProject;
  confettiEnabled: boolean;
  reducedMotion: boolean;
  onComplete?: () => void;
  enableMicrophoneBlow?: boolean;
}

type CakeStage = 'wish' | 'blowPrompt' | 'blown' | 'celebrating';
type MicState = 'idle' | 'requesting' | 'active' | 'denied' | 'unsupported' | 'silent';

const SPARKLES = [
  { x: '8%', y: '16%', size: '1rem', color: '#E5C171', duration: '2.4s', delay: '-0.4s' },
  { x: '18%', y: '48%', size: '0.6rem', color: '#D4729C', duration: '2.8s', delay: '-1.2s' },
  { x: '28%', y: '9%', size: '0.75rem', color: '#A99BD6', duration: '3.1s', delay: '-0.8s' },
  { x: '76%', y: '12%', size: '0.8rem', color: '#E5C171', duration: '2.6s', delay: '-1.6s' },
  { x: '91%', y: '33%', size: '1.1rem', color: '#D4729C', duration: '3s', delay: '-0.2s' },
  { x: '82%', y: '66%', size: '0.65rem', color: '#93C3AC', duration: '2.7s', delay: '-1.1s' },
  { x: '12%', y: '76%', size: '0.8rem', color: '#A99BD6', duration: '3.2s', delay: '-1.9s' },
  { x: '93%', y: '82%', size: '0.6rem', color: '#E5C171', duration: '2.5s', delay: '-0.7s' },
  { x: '48%', y: '5%', size: '0.55rem', color: '#F0A186', duration: '2.9s', delay: '-1.4s' },
  { x: '62%', y: '88%', size: '0.75rem', color: '#D4729C', duration: '3.3s', delay: '-0.9s' },
];
const PARTICLES = [
  { x: '4%', y: '-8%', w: '8px', h: '13px', color: '#FCD34D', duration: '3.8s', delay: '0.2s', drift: '4rem' },
  { x: '9%', y: '-15%', w: '6px', h: '10px', color: '#F472B6', duration: '4.6s', delay: '1.1s', drift: '-3rem' },
  { x: '15%', y: '-11%', w: '7px', h: '11px', color: '#A78BFA', duration: '4.1s', delay: '0.7s', drift: '5rem' },
  { x: '21%', y: '-18%', w: '6px', h: '9px', color: '#34D399', duration: '4.8s', delay: '1.5s', drift: '-4rem' },
  { x: '28%', y: '-7%', w: '8px', h: '12px', color: '#60A5FA', duration: '4.3s', delay: '0.35s', drift: '3rem' },
  { x: '35%', y: '-14%', w: '6px', h: '10px', color: '#FCD34D', duration: '4.5s', delay: '1.25s', drift: '-5rem' },
  { x: '42%', y: '-9%', w: '7px', h: '11px', color: '#F472B6', duration: '3.9s', delay: '0.55s', drift: '2rem' },
  { x: '49%', y: '-16%', w: '6px', h: '9px', color: '#A78BFA', duration: '4.7s', delay: '1.4s', drift: '-3rem' },
  { x: '56%', y: '-6%', w: '8px', h: '12px', color: '#34D399', duration: '4.2s', delay: '0.1s', drift: '4rem' },
  { x: '63%', y: '-13%', w: '6px', h: '10px', color: '#60A5FA', duration: '4.9s', delay: '1.6s', drift: '-4rem' },
  { x: '70%', y: '-8%', w: '7px', h: '11px', color: '#FCD34D', duration: '4s', delay: '0.8s', drift: '3rem' },
  { x: '77%', y: '-17%', w: '6px', h: '10px', color: '#F472B6', duration: '4.6s', delay: '1.3s', drift: '-5rem' },
  { x: '84%', y: '-10%', w: '8px', h: '12px', color: '#A78BFA', duration: '4.4s', delay: '0.45s', drift: '4rem' },
  { x: '91%', y: '-15%', w: '6px', h: '9px', color: '#34D399', duration: '4.8s', delay: '1.7s', drift: '-3rem' },
  { x: '96%', y: '-6%', w: '7px', h: '11px', color: '#60A5FA', duration: '4.1s', delay: '0.95s', drift: '2rem' },
];

export function CakeCelebration({
  project,
  confettiEnabled,
  reducedMotion,
  onComplete,
  enableMicrophoneBlow = true,
}: Props): React.ReactElement {
  const count = 6;
  const [stage, setStage] = useState<CakeStage>('wish');
  const [candlesLit, setCandlesLit] = useState<boolean[]>(() => Array(count).fill(true));
  const [mic, setMic] = useState<MicState>('idle');
  const [micLevel, setMicLevel] = useState(0);
  const [micMessage, setMicMessage] = useState('');
  const [blowStrength, setBlowStrength] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const historyRef = useRef<number[]>([]);
  const blowStartRef = useRef<number | null>(null);
  const nextMicExtinguishRef = useRef(0);
  const doneRef = useRef(false);
  const candlesLitRef = useRef(candlesLit);
  const recipientName = project.recipientName || 'Someone Special';
  const anyLit = candlesLit.some(Boolean);

  const cleanupMic = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try { track.stop(); } catch { /* The stream may already be closed. */ }
      });
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      const context = audioCtxRef.current;
      audioCtxRef.current = null;
      analyserRef.current = null;
      void context.close().catch(() => undefined);
    }
  }, []);

  useEffect(() => () => {
    cleanupMic();
    doneRef.current = false;
  }, [cleanupMic]);

  const extinguishOne = useCallback(() => {
    if (doneRef.current) return;
    setCandlesLit((current) => {
      const nextIndex = current.findIndex(Boolean);
      if (nextIndex === -1) return current;
      const next = current.map((lit, index) => index === nextIndex ? false : lit);
      candlesLitRef.current = next;
      return next;
    });
  }, []);

  const goBlowPrompt = useCallback(() => setStage('blowPrompt'), []);

  const startBlowing = useCallback(() => {
    if (doneRef.current || !candlesLitRef.current.some(Boolean)) return;
    setIsHolding(true);
    setBlowStrength(92);
  }, []);

  const stopBlowing = useCallback(() => {
    setIsHolding(false);
    if (mic !== 'active') setBlowStrength(0);
  }, [mic]);

  useEffect(() => {
    if (!isHolding) return;
    const interval = window.setInterval(extinguishOne, reducedMotion ? 420 : 260);
    return () => window.clearInterval(interval);
  }, [extinguishOne, isHolding, reducedMotion]);

  useEffect(() => {
    if (stage !== 'blowPrompt' || anyLit || candlesLit.length === 0) return;
    doneRef.current = true;
    setIsHolding(false);
    setBlowStrength(0);
    setStage('blown');
  }, [anyLit, candlesLit.length, stage]);

  useEffect(() => {
    if (stage !== 'blown') return;
    const timer = window.setTimeout(() => {
      setStage('celebrating');
      setCelebrating(true);
    }, reducedMotion ? 250 : 1200);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, stage]);

  const requestMic = useCallback(() => {
    if (!enableMicrophoneBlow) return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMic('unsupported');
      setMicMessage('Microphone not supported. Use Hold to blow instead.');
      return;
    }
    setMic('requesting');
    setMicMessage('Requesting microphone permission…');
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false } })
      .then((stream) => {
        streamRef.current = stream;
        const AudioContextClass = window.AudioContext
          ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) throw new Error('AudioContext is unavailable');
        const context = new AudioContextClass();
        audioCtxRef.current = context;
        if (context.state === 'suspended') void context.resume();
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.55;
        source.connect(analyser);
        analyserRef.current = analyser;
        setMic('active');
        setMicMessage('Blow steadily into the microphone…');
        historyRef.current = [];
        blowStartRef.current = null;
        nextMicExtinguishRef.current = 0;

        const buffer = new Uint8Array(analyser.fftSize);
        let silentFrames = 0;
        const tick = (): void => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteTimeDomainData(buffer);
          let sum = 0;
          for (let index = 0; index < buffer.length; index += 1) {
            const sample = (buffer[index] ?? 128) - 128;
            sum += sample * sample;
          }
          const rms = Math.sqrt(sum / buffer.length);
          const level = Math.min(100, Math.round(rms * 360));
          setMicLevel(level);
          const history = historyRef.current;
          history.push(level);
          if (history.length > 40) history.shift();
          const baseline = history.slice(0, 20).reduce((sum, value) => sum + value, 0)
            / Math.max(1, Math.min(20, history.length));
          const threshold = Math.max(28, baseline + 20);
          const now = performance.now();

          if (level >= threshold) {
            setBlowStrength(Math.max(28, level));
            if (blowStartRef.current === null) blowStartRef.current = now;
            if (now - blowStartRef.current >= 320 && now >= nextMicExtinguishRef.current) {
              extinguishOne();
              nextMicExtinguishRef.current = now + 480;
            }
          } else {
            blowStartRef.current = null;
            setBlowStrength(0);
          }
          if (level < 3) silentFrames += 1;
          else silentFrames = 0;
          if (silentFrames > 600) {
            setMic('silent');
            setMicMessage('No sound detected. Check the mic, or use Hold to blow.');
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      })
      .catch((error: { name?: string }) => {
        cleanupMic();
        setMic('denied');
        setMicMessage(error.name === 'NotFoundError'
          ? 'No microphone found. Use Hold to blow instead.'
          : 'Microphone unavailable. Use Hold to blow instead.');
      });
  }, [cleanupMic, enableMicrophoneBlow, extinguishOne]);

  const stopMic = useCallback(() => {
    cleanupMic();
    setMic('idle');
    setMicLevel(0);
    setMicMessage('');
    setBlowStrength(0);
  }, [cleanupMic]);

  const handleReplay = useCallback(() => {
    cleanupMic();
    doneRef.current = false;
    setMic('idle');
    setMicLevel(0);
    setMicMessage('');
    setCelebrating(false);
    setBlowStrength(0);
    setIsHolding(false);
    const lit = Array(count).fill(true);
    candlesLitRef.current = lit;
    setCandlesLit(lit);
    setStage('wish');
  }, [cleanupMic, count]);

  const blowAll = useCallback(() => {
    const lit = candlesLitRef.current.map(() => false);
    candlesLitRef.current = lit;
    setCandlesLit(lit);
  }, []);

  const celebrationParticles = useMemo(
    () => confettiEnabled ? PARTICLES : PARTICLES.slice(0, 5),
    [confettiEnabled],
  );

  const copy = stage === 'wish'
    ? { eyebrow: 'Make a wish', title: `A wish for ${recipientName}`, body: 'Close your eyes for a moment. The best wishes are the ones you whisper quietly.' }
    : stage === 'blowPrompt'
      ? { eyebrow: 'Make a wish', title: 'Blow out the candles', body: 'Take a deep breath, then hold the button or blow into your microphone.' }
      : stage === 'blown'
        ? { eyebrow: 'Wish made', title: 'Every candle is out', body: 'Your wish is floating up through the golden light…' }
        : { eyebrow: 'It worked', title: `Your wish is on its way, ${recipientName}`, body: 'May your day be filled with beautiful surprises, warm laughter, and all your favorite people.' };

  return (
    <section className={`cake-scene ${stage === 'celebrating' ? 'cake-scene--celebrating' : ''}`} aria-label={`Birthday cake wish for ${recipientName}`}>
      <div className="cake-scene__celebration" aria-hidden="true">
        <div className="cake-scene__rays" />
        {SPARKLES.map((sparkle, index) => (
          <span key={index} className="cake-scene__sparkle" style={{ '--x': sparkle.x, '--y': sparkle.y, '--size': sparkle.size, '--color': sparkle.color, '--duration': sparkle.duration, '--delay': sparkle.delay } as React.CSSProperties}>✦</span>
        ))}
        {celebrationParticles.map((particle, index) => (
          <span key={index} className="cake-scene__particle" style={{ '--x': particle.x, '--y': particle.y, '--w': particle.w, '--h': particle.h, '--color': particle.color, '--duration': particle.duration, '--delay': particle.delay, '--drift': particle.drift } as React.CSSProperties} />
        ))}
      </div>

      <div className="cake-scene__content">
        <div className="cake-scene__intro">
          <p className="cake-scene__eyebrow">{copy.eyebrow}</p>
          <h1 className="cake-scene__title">{copy.title}</h1>
          <p className="cake-scene__copy">{copy.body}</p>
        </div>

        <div className="cake-scene__stage">
          <div className="cake-scene__halo" />
          <CelebrationCake
            candlesLit={candlesLit}
            blowStrength={blowStrength}
            celebrating={celebrating}
            reducedMotion={reducedMotion}
          />
        </div>

        <div className="cake-scene__actions">
          {stage === 'wish' ? (
            <button type="button" className="clay-btn clay-btn-primary clay-btn-lg" onClick={goBlowPrompt} aria-label="I made my wish">
              I made my wish <span aria-hidden="true">→</span>
            </button>
          ) : null}

          {stage === 'blowPrompt' ? (
            <>
              <div className="cake-scene__buttons">
                <button
                  type="button"
                  className={`clay-btn clay-btn-primary clay-btn-lg cake-scene__blow-button ${isHolding ? 'is-blowing' : ''}`}
                  onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); startBlowing(); }}
                  onPointerUp={stopBlowing}
                  onPointerCancel={stopBlowing}
                  onPointerLeave={(event) => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) stopBlowing(); }}
                  onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); startBlowing(); } }}
                  onKeyUp={(event) => { if (event.key === ' ' || event.key === 'Enter') stopBlowing(); }}
                  aria-label="Hold to blow out the candles"
                >
                  <span aria-hidden="true">💨</span> Hold to blow
                </button>
                <button type="button" className="clay-btn clay-btn-secondary clay-btn-lg" onClick={blowAll} aria-label="Blow out all candles now">
                  Blow all at once
                </button>
              </div>

              {enableMicrophoneBlow && mic === 'idle' ? (
                <button type="button" className="clay-btn clay-btn-ghost clay-btn-sm" onClick={requestMic} aria-label="Enable microphone blow detection">
                  <span aria-hidden="true">🎤</span> Use microphone
                </button>
              ) : null}
              {enableMicrophoneBlow && mic === 'requesting' ? <p className="cake-scene__mic-message" role="status">Requesting microphone…</p> : null}
              {enableMicrophoneBlow && mic === 'active' ? (
                <>
                  <div className="cake-scene__wind-meter" role="status" aria-label={`Blow strength ${micLevel}%`}>
                    <span aria-hidden="true">🌬️</span>
                    <div className="cake-scene__wind-track"><div className="cake-scene__wind-fill" style={{ width: `${micLevel}%` }} /></div>
                    <span>{micLevel}%</span>
                    <button type="button" className="clay-btn clay-btn-ghost clay-btn-sm" onClick={stopMic}>Stop mic</button>
                  </div>
                  <p className="cake-scene__mic-message">Blow into your microphone to extinguish the candles.</p>
                </>
              ) : null}
              {micMessage ? <p className="cake-scene__mic-message" role="status">{micMessage}</p> : null}
            </>
          ) : null}

          {stage === 'blown' ? <p className="cake-scene__copy animate-pulse" role="status">Watch your wish light up the room ✨</p> : null}

          {stage === 'celebrating' ? (
            <div className="cake-scene__success">
              <div className="cake-scene__buttons">
                <button type="button" className="clay-btn clay-btn-secondary clay-btn-lg" onClick={handleReplay}>Replay</button>
                <button type="button" className="clay-btn clay-btn-primary clay-btn-lg" onClick={() => onComplete?.()}>
                  Continue the celebration <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
