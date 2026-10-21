/**
 * CakeCelebration - Stage 13 premium cake scene.
 * Original CSS illustration: layered frosting, plate, flames, glow.
 * State machine: welcome -> lit -> wish -> blowPrompt -> blown -> celebrating
 * Mic: only after explicit opt-in, local analysis only, never recorded.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { BirthdayProject } from '@/types';

interface Props {
  project: BirthdayProject;
  confettiEnabled: boolean;
  reducedMotion: boolean;
  onComplete?: () => void;
  candleCount?: number;
  enableMicrophoneBlow?: boolean;
  candleColors?: string[];
}

type CakeStage = 'welcome' | 'lit' | 'wish' | 'blowPrompt' | 'blown' | 'celebrating';
type MicState = 'idle' | 'requesting' | 'active' | 'denied' | 'unsupported' | 'silent';

const DEFAULT_CANDLE_COLORS = ['#FCD34D', '#F472B6', '#A78BFA', '#34D399', '#60A5FA', '#FBBF24', '#EC4899', '#FB923C'];

export function CakeCelebration({ project, confettiEnabled, reducedMotion, onComplete, candleCount = 3, enableMicrophoneBlow = true, candleColors = DEFAULT_CANDLE_COLORS }: Props) {
  const count = Math.max(1, Math.min(candleCount, 12));
  const [stage, setStage] = useState<CakeStage>('welcome');
  const [candlesLit, setCandlesLit] = useState<boolean[]>(function () { return Array(count).fill(true); });
  const [mic, setMic] = useState<MicState>('idle');
  const [micLevel, setMicLevel] = useState(0);
  const [micMessage, setMicMessage] = useState('');
  const [celebrating, setCelebrating] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const histRef = useRef<number[]>([]);
  const blowStartRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const recipientName = project.recipientName || 'Someone Special';
  const prefersReducedMotion = reducedMotion;
  const allLit = candlesLit.every(Boolean);

  function cleanupMic() {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(function (t) { try { t.stop(); } catch (e) { return; } }); streamRef.current = null; }
    if (audioCtxRef.current) { const ctx = audioCtxRef.current; audioCtxRef.current = null; analyserRef.current = null; ctx.close().catch(function () { return; }); }
  }

  useEffect(function () {
    return function () { cleanupMic(); doneRef.current = false; };
  }, []);

  const goLit = useCallback(function () {
    setCandlesLit(Array(count).fill(true));
    setStage('lit');
    setTimeout(function () { setStage('wish'); }, prefersReducedMotion ? 100 : 1200);
  }, [count, prefersReducedMotion]);

  const goBlowPrompt = useCallback(function () {
    setStage('blowPrompt');
  }, []);

  const doBlowOut = useCallback(function () {
    if (doneRef.current) return;
    if (!allLit) return;
    doneRef.current = true;
    cleanupMic();
    setCandlesLit(Array(count).fill(false));
    setStage('blown');
    setTimeout(function () { setStage('celebrating'); setCelebrating(true); }, prefersReducedMotion ? 200 : 1400);
    setTimeout(function () { if (onComplete) onComplete(); }, prefersReducedMotion ? 1200 : 3200);
  }, [allLit, count, onComplete, prefersReducedMotion]);
  const requestMic = useCallback(function () {
    if (!enableMicrophoneBlow) return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMic('unsupported');
      setMicMessage('Microphone not supported. Use the blow button.');
      return;
    }
    setMic('requesting');
    setMicMessage('Requesting microphone permission...');
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false } }).then(function (stream) {
      streamRef.current = stream;
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') { ctx.resume().catch(function () { return; }); }
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.55;
      src.connect(analyser);
      analyserRef.current = analyser;
      setMic('active');
      setMicMessage('Blow steadily into the microphone...');
      histRef.current = [];
      blowStartRef.current = null;
      const buf = new Uint8Array(analyser.fftSize);
      let silentFrames = 0;
      function tick() {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) { const sample: number | undefined = buf[i]; const v = ((sample ?? 128) - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / buf.length);
        const level = Math.min(100, Math.round(rms * 320));
        setMicLevel(level);
        const hist = histRef.current;
        hist.push(level);
        if (hist.length > 40) hist.shift();
        const base = hist.slice(0, 20).reduce(function (a, b) { return a + b; }, 0) / Math.max(1, Math.min(20, hist.length));
        const threshold = Math.max(28, base + 22);
        const now = performance.now();
        if (level >= threshold) {
          if (blowStartRef.current === null) blowStartRef.current = now;
          if (now - (blowStartRef.current || now) >= 650) { doBlowOut(); return; }
        } else { blowStartRef.current = null; }
        if (level < 3) { silentFrames += 1; } else { silentFrames = 0; }
        if (silentFrames > 600) { setMic('silent'); setMicMessage('No sound detected. Check mic input or use the blow button.'); }
        rafRef.current = requestAnimationFrame(tick);
      }
      rafRef.current = requestAnimationFrame(tick);
    }).catch(function (err: { name?: string }) {
      if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) {
        setMic('denied');
        setMicMessage('Microphone blocked. Use the blow button - it works the same.');
      } else if (err && err.name === 'NotFoundError') {
        setMic('denied');
        setMicMessage('No microphone found. Use the blow button.');
      } else {
        setMic('denied');
        setMicMessage('Microphone unavailable. Use the blow button.');
      }
    });
  }, [enableMicrophoneBlow, doBlowOut]);

  const stopMic = useCallback(function () {
    cleanupMic();
    setMic('idle');
    setMicLevel(0);
    setMicMessage('');
  }, []);

  const handleKey = useCallback(function (e: React.KeyboardEvent) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (stage === 'welcome') goLit();
    else if (stage === 'lit' || stage === 'wish') goBlowPrompt();
    else if (stage === 'blowPrompt') doBlowOut();
  }, [stage, goLit, goBlowPrompt, doBlowOut]);

  const handleReplay = useCallback(function () {
    doneRef.current = false;
    cleanupMic();
    setMic('idle');
    setMicLevel(0);
    setMicMessage('');
    setCelebrating(false);
    setCandlesLit(Array(count).fill(false));
    setStage('welcome');
  }, [count]);

  const positions = candlesLit.map(function (_, i) {
    const spacing = 100 / (count + 1);
    return { left: (spacing * (i + 1)).toFixed(2) + '%', top: (-18 - (i % 3) * 4) + 'px', color: candleColors[i % candleColors.length] || '#FCD34D' };
  });
  const blown = stage === 'blown' || stage === 'celebrating';
  return (
    <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center text-center p-6 overflow-hidden" style={{ background: 'var(--color-page)' }} onKeyDown={handleKey}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 72%, rgba(252,211,77,0.22), transparent 62%)' }} />
      {stage === 'welcome' ? (
        <div style={{ position: 'relative', maxWidth: '28rem' }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>A birthday surprise</p>
          <h1 className="font-display text-3xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>Welcome, {recipientName}</h1>
          <p className="text-lg mt-2" style={{ color: 'var(--color-text-secondary)' }}>We baked something just for you.</p>
          <button type="button" aria-label="Show the birthday cake" onClick={goLit} className="clay-btn clay-btn-primary clay-btn-lg mt-6">Show my cake</button>
        </div>
      ) : null}
      {stage !== 'welcome' ? (
        <div style={{ position: 'relative', width: '100%', maxWidth: '26rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', width: '16rem', height: '15rem' }}>
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '12rem', height: '6rem', borderRadius: '9999px', background: 'rgba(255,232,163,0.55)' }} />
              <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', width: '10rem', height: '5rem', borderRadius: '9999px', background: 'rgba(255,232,163,0.85)' }} />
              <div style={{ position: 'absolute', bottom: '4rem', left: '50%', transform: 'translateX(-50%)', width: '8rem', height: '4rem', borderRadius: '9999px', background: '#F3C5D7' }} />
              <div style={{ position: 'absolute', bottom: '0.5rem', left: '50%', transform: 'translateX(-50%)', width: '14rem', height: '1.5rem', borderRadius: '9999px', background: 'rgba(224,164,40,0.35)' }} />
              {candlesLit.map(function (lit, i) {
                if (blown || !lit) return null;
                const pos = positions[i] || { left: '50%', top: '-18px', color: '#FCD34D' };
                return (
                  <div key={i} className="absolute" style={{ left: pos.left, top: pos.top, transform: 'translateX(-50%)' }}>
                    <div style={{ width: '4px', height: '3rem', margin: '0 auto', borderRadius: '2px', background: pos.color }} />
                    <div aria-hidden="true" style={{ width: '14px', height: '22px', margin: '-4px auto 0', borderRadius: '9999px', background: 'radial-gradient(circle at 50% 72%, #FFF7CC 0%, #FCD34D 42%, #F59E0B 72%, rgba(245,158,11,0) 100%)', animation: prefersReducedMotion ? 'none' : 'cake-flicker 0.9s ease-in-out infinite', transformOrigin: '50% 90%' }} />
                  </div>
                );
              })}
              {blown ? (
                <div aria-hidden="true" style={{ position: 'absolute', top: '-1.4rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '1.6rem', opacity: 0.75 }}>
                  {candlesLit.map(function (_, i) {
                    return <span key={i} style={{ width: '6px', height: '18px', borderRadius: '9999px', background: 'linear-gradient(to top, rgba(148,163,184,0), rgba(148,163,184,0.75))', animation: prefersReducedMotion ? 'none' : 'cake-smoke 1.8s ease-out infinite', animationDelay: (i * 0.18) + 's' }} />;
                  })}
                </div>
              ) : null}
            </div>
          </div>
          {stage === 'lit' ? <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>Your candles are lit.</p> : null}
          {stage === 'wish' ? (
            <div>
              <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>Close your eyes and make a wish, {recipientName}.</p>
              <button type="button" aria-label="I made my wish" onClick={goBlowPrompt} className="clay-btn clay-btn-primary clay-btn-lg mt-5">I made my wish</button>
            </div>
          ) : null}
          {stage === 'blowPrompt' ? (
            <div>
              <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Blow the candles</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Tap the button, or use your microphone if you like. Both work exactly the same.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-5">
                <button type="button" aria-label="Blow out the candles" onClick={function () { doBlowOut(); }} className="clay-btn clay-btn-primary clay-btn-lg">Blow out candles</button>
                {enableMicrophoneBlow && mic === 'idle' ? <button type="button" onClick={requestMic} className="clay-btn clay-btn-ghost clay-btn-sm" aria-label="Enable microphone blow detection">Use microphone</button> : null}
                {enableMicrophoneBlow && mic === 'requesting' ? <p className="text-sm" role="status">Requesting microphone…</p> : null}
                {enableMicrophoneBlow && mic === 'active' ? (
                  <div className="flex items-center gap-2">
                    <div style={{ width: '8rem', height: '0.6rem', background: 'var(--color-border)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: micLevel + '%', height: '100%', background: 'var(--color-brand-500)', transition: 'width 80ms linear' }} />
                    </div>
                    <button type="button" onClick={stopMic} className="clay-btn clay-btn-ghost clay-btn-sm" aria-label="Stop microphone">Stop mic</button>
                  </div>
                ) : null}
              </div>
              {micMessage ? <p className="text-xs mt-3" role="status" style={{ color: 'var(--color-text-secondary)' }}>{micMessage}</p> : null}
              {enableMicrophoneBlow && (mic === 'denied' || mic === 'unsupported' || mic === 'silent') ? <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>The button above always works.</p> : null}
            </div>
          ) : null}
          {stage === 'blown' ? <p className="text-lg animate-pulse" style={{ color: 'var(--color-text-secondary)' }}>The flames fade…</p> : null}
          {stage === 'celebrating' ? (
            <div className="mt-6">
              <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Your wish is sealed, {recipientName}</h2>
              <p className="text-lg mt-2" style={{ color: 'var(--color-text-secondary)' }}>May your day be filled with joy.</p>
              <div className="flex gap-3 justify-center mt-6">
                <button type="button" aria-label="Replay the cake scene" onClick={handleReplay} className="clay-btn clay-btn-ghost clay-btn-lg">Replay</button>
                <button type="button" aria-label="Continue" onClick={function () { if (onComplete) onComplete(); }} className="clay-btn clay-btn-primary clay-btn-lg">Continue</button>
              </div>
            </div>
          ) : null}
          <style>{'@keyframes cake-flicker{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.72;transform:scale(0.94)}}@keyframes cake-smoke{0%{transform:translateY(0) scale(1);opacity:0.7}100%{transform:translateY(-22px) scale(1.6);opacity:0}}'}</style>
        </div>
      ) : null}
    </div>
  );
}