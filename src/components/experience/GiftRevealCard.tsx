/**
 * GiftRevealCard — Stage 12 interactive birthday card.
 *
 * Unwrap a final surprise gift with animation.
 * Multiple animation types: unwrap, fade, pop, slide.
 * Keyboard accessible: Enter/Space to unwrap.
 * Respects prefers-reduced-motion.
 */

import React, { useCallback, useState } from 'react';
import type { BirthdayProject } from '@/types';
import type { GiftRevealConfig } from '@/lib/experience/types';

interface Props {
  project: BirthdayProject;
  config?: { giftConfig?: GiftRevealConfig };
  onComplete?: () => void;
  reducedMotion: boolean;
}

interface GiftBoxSVGProps {
  open: boolean;
  prefersReducedMotion: boolean;
}

// Gift box SVG component
const GiftBoxSVG: React.FC<GiftBoxSVGProps> = ({ open, prefersReducedMotion }) => (
  <svg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg' role='img' aria-label='Birthday gift box'>
    <defs>
      <linearGradient id='boxGrad' x1='0%' y1='0%' x2='0%' y2='100%'>
        <stop offset='0%' stopColor='#B5456F' />
        <stop offset='100%' stopColor='#8C2E50' />
      </linearGradient>
      <linearGradient id='lidGrad' x1='0%' y1='0%' x2='0%' y2='100%'>
        <stop offset='0%' stopColor='#F8DCE6' />
        <stop offset='100%' stopColor='#E8B8C8' />
      </linearGradient>
      <filter id='boxShadow' x='-20%' y='-20%' width='140%' height='140%'>
        <feDropShadow dx='0' dy='8' stdDeviation='12' floodColor='#000' floodOpacity='0.15' />
      </filter>
    </defs>
    {/* Box base */}
    <rect x='30' y='60' width='140' height='100' rx='8' fill='url(#boxGrad)' filter='url(#boxShadow)' />
    {/* Ribbon vertical */}
    <rect x='98' y='60' width='4' height='100' fill='url(#lidGrad)' />
    {/* Ribbon horizontal */}
    <rect x='30' y='108' width='140' height='4' fill='url(#lidGrad)' />
    {/* Lid */}
    <rect
      x='20'
      y='35'
      width='160'
      height='25'
      rx='8 8 0 0'
      fill='url(#lidGrad)'
      filter='url(#boxShadow)'
      style={{
        transform: open ? 'rotateX(-120deg) translateY(-20px)' : 'rotateX(0deg)',
        transformOrigin: 'center bottom',
        transition: prefersReducedMotion ? 'none' : 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    />
    {/* Bow */}
    <g transform='translate(100, 45)' style={{ opacity: open ? 0 : 1, transition: 'opacity 0.3s ease' }}>
      <path d='M-20 0 Q-10 -15 0 0 Q10 -15 20 0 Q10 10 0 0 Q-10 10 -20 0' fill='url(#lidGrad)' />
      <circle cx='0' cy='0' r='8' fill='url(#lidGrad)' />
    </g>
    {/* Sparkles when open */}
    {open && (
      <>
        <circle cx='60' cy='50' r='4' fill='#FFD700' style={{ animation: 'sparkle 1s ease-in-out infinite' }} />
        <circle cx='140' cy='50' r='4' fill='#FFD700' style={{ animation: 'sparkle 1s ease-in-out infinite 0.3s' }} />
        <circle cx='100' cy='30' r='3' fill='#FFD700' style={{ animation: 'sparkle 1s ease-in-out infinite 0.6s' }} />
        <style>
          {`@keyframes sparkle { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }`}
        </style>
      </>
    )}
  </svg>
);

export function GiftRevealCard({ project, config, onComplete, reducedMotion }: Props) {
  const [stage, setStage] = useState<'wrapped' | 'unwrapping' | 'revealed'>('wrapped');
  const prefersReducedMotion = reducedMotion;

  const giftConfig: GiftRevealConfig = config?.giftConfig ?? {
    title: 'A Special Gift for You!',
    message: 'Open your gift to discover a wonderful surprise...',
    animationType: 'unwrap',
  };

  const handleUnwrap = useCallback(() => {
    if (stage !== 'wrapped') return;
    setStage('unwrapping');
    setTimeout(() => setStage('revealed'), prefersReducedMotion ? 100 : 800);
    setTimeout(() => onComplete?.(), prefersReducedMotion ? 1200 : 1800);
  }, [stage, onComplete, prefersReducedMotion]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (stage === 'revealed') {
        onComplete?.();
      } else if (stage === 'wrapped') {
        handleUnwrap();
      }
    }
  }, [stage, handleUnwrap, onComplete]);

  const recipientName = project.recipientName || 'Someone Special';

  if (stage === 'revealed') {
    return (
      <div className='clay-card p-8 sm:p-12 max-w-md mx-auto text-center' role='region' aria-label='Gift reveal card'>
        <div className='clay-icon-btn clay-icon-btn-lg mx-auto mb-6 animate-pop' style={{ background: 'var(--color-rose)', color: 'var(--color-text-on-primary)' }} aria-hidden='true'>
          <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='20 6 9 17l-5-5'/></svg>
        </div>
        <h1 className='font-display text-3xl font-bold mb-2' style={{ color: 'var(--color-text-primary)' }}>Surprise! 🎁</h1>
        <p className='text-lg text-[var(--color-text-secondary)] mb-4'>{giftConfig.title}</p>
        <p className='text-body text-lg leading-relaxed mb-8' style={{ color: 'var(--color-text-secondary)' }}>{giftConfig.message}</p>
        <p className='text-[var(--color-text-tertiary)] mb-8'>Made with love for {recipientName} ✨</p>
        <button type='button' role='button' aria-label='Continue to next card' onClick={onComplete} onKeyDown={handleKeyDown} className='clay-btn clay-btn-primary clay-btn-lg'>Continue →</button>
      </div>
    );
  }

  return (
    <div className='clay-card p-8 sm:p-12 max-w-md mx-auto text-center' role='region' aria-label='Gift reveal card'>
      <h2 className='font-display text-xl font-bold mb-8' style={{ color: 'var(--color-text-primary)' }}>{giftConfig.title}</h2>

      <div className='relative mb-8' style={{ transition: prefersReducedMotion ? 'none' : 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        <GiftBoxSVG open={stage === 'unwrapping'} prefersReducedMotion={prefersReducedMotion} />
        {stage === 'unwrapping' && (
          <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
            <div className='text-6xl animate-pop' style={{ animationDuration: prefersReducedMotion ? '0.1s' : '0.8s' }}>✨</div>
          </div>
        )}
      </div>

      <p className='text-lg text-[var(--color-text-secondary)] mb-8'>{giftConfig.message}</p>

      {stage === 'wrapped' && (
        <button
          type='button'
          role='button'
          aria-label='Unwrap your gift'
          onClick={handleUnwrap}
          onKeyDown={handleKeyDown}
          className='clay-btn clay-btn-primary clay-btn-lg animate-pulse'
        >
          Unwrap Gift 🎁
        </button>
      )}

      {stage === 'unwrapping' && (
        <p className='mt-4 text-lg text-[var(--color-text-secondary)] animate-pulse'>Unwrapping...</p>
      )}
    </div>
  );
}
