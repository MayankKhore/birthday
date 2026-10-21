// src/components/experience/MemoryMatchCard.tsx
﻿/**
 * MemoryMatchCard — Stage 12 interactive birthday card.
 *
 * Classic memory match game - find all matching pairs.
 * Keyboard accessible: Enter/Space to flip cards, arrow keys to navigate.
 * Respects prefers-reduced-motion.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { BirthdayProject } from '@/types';
import type { MemoryMatchPair } from '@/lib/experience/types';

interface Props {
  project: BirthdayProject;
  config?: { pairs?: MemoryMatchPair[]; gridSize?: number };
  onComplete?: () => void;
  reducedMotion: boolean;
}

const DEFAULT_PAIRS: MemoryMatchPair[] = [
  { id: '1' as any, imageId: '1' as any, label: '🎂' },
  { id: '2' as any, imageId: '2' as any, label: '🎁' },
  { id: '3' as any, imageId: '3' as any, label: '🎈' },
  { id: '4' as any, imageId: '4' as any, label: '🍰' },
];

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function MemoryMatchCard({
  project,
  config,
  onComplete,
  reducedMotion,
}: Props) {
  /* ───── stable refs ───── */
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  const cardsRef = useRef<Array<{
    id: string; pairId: string; label: string; flipped: boolean; matched: boolean
  }>>([]);

  /* ───── state ───── */
  const [cards, setCards] = useState<Array<{
    id: string; pairId: string; label: string; flipped: boolean; matched: boolean
  }>>([]);

  // keep cardsRef in sync with cards state
  useEffect(() => { cardsRef.current = cards; }, [cards]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [lockBoard, setLockBoard] = useState(false);

  const prefersReducedMotion = reducedMotion;

  /* ───── one‑time board setup ───── */
  useEffect(() => {
    const cfg = configRef.current;
    const pairs = cfg?.pairs?.length ? cfg.pairs : DEFAULT_PAIRS;
    const gridSize = cfg?.gridSize ?? 8;
    const cardCount = Math.min(gridSize, pairs.length * 2);
    const gamePairs = pairs.slice(0, cardCount / 2);

    const cardData = shuffle([
      ...gamePairs.flatMap(pair => [
        { id: pair.id + '-a', pairId: pair.id, label: pair.label, flipped: false, matched: false },
        { id: pair.id + '-b', pairId: pair.id, label: pair.label, flipped: false, matched: false },
      ]),
    ]).slice(0, cardCount);

    setCards(cardData);
    setFlippedIndices([]);
    setMatchedCount(0);
    setMoves(0);
    setCompleted(false);
    setLockBoard(false);
  }, []);                     // ← run once on mount

  /* ───── flip handling ───── */
  const flipCard = useCallback((index: number) => {
    if (lockBoard) return;
    const currentCards = cardsRef.current;
    if (currentCards[index].flipped || currentCards[index].matched) return;
    if (flippedIndices.length >= 2) return;

    setCards(prev => {
      const next = [...prev];
      next[index] = { ...next[index], flipped: true };
      return next;
    });
    setFlippedIndices(prev => [...prev, index]);
  }, [flippedIndices, lockBoard]);

  /* ───── helper for final‑pair check ───── */
  const gamePairsLength = (() => {
    const cfg = configRef.current;
    const pairs = cfg?.pairs?.length ? cfg.pairs : DEFAULT_PAIRS;
    const gridSize = cfg?.gridSize ?? 8;
    const cardCount = Math.min(gridSize, pairs.length * 2);
    return cardCount / 2;
  })();

  /* ───── match / mismatch resolution ───── */
  useEffect(() => {
    if (flippedIndices.length !== 2) return;

    setLockBoard(true);
    setMoves(prev => prev + 1);
    const [i1, i2] = flippedIndices;
    const currentCards = cardsRef.current;
    const match = currentCards[i1].pairId === currentCards[i2].pairId;

    const timer = setTimeout(() => {
      if (match) {
        setCards(prev => {
          const next = [...prev];
          next[i1] = { ...next[i1], matched: true, flipped: true };
          next[i2] = { ...next[i2], matched: true, flipped: true };
          return next;
        });
        setMatchedCount(prev => prev + 1);
      } else {
        setCards(prev => {
          const next = [...prev];
          next[i1] = { ...next[i1], flipped: false };
          next[i2] = { ...next[i2], flipped: false };
          return next;
        });
      }
      setFlippedIndices([]);
      setLockBoard(false);

      if (match && matchedCount + 1 === gamePairsLength) {
        setCompleted(true);
      }
    }, prefersReducedMotion ? 0 : 800);

    return () => clearTimeout(timer);
  }, [flippedIndices, matchedCount, prefersReducedMotion, gamePairsLength]);

  /* ───── keyboard / completion ───── */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (completed) onComplete?.();
    }
  }, [completed, onComplete]);

  if (completed) {
    return (
      <div className='clay-card p-8 sm:p-12 max-w-md mx-auto text-center' role='region' aria-label='Memory match card'>
        <div className='clay-icon-btn clay-icon-btn-lg mx-auto mb-6 animate-pop' style={{ background: 'var(--color-mint)', color: 'var(--color-text-primary)' }} aria-hidden='true'>
          <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='20 6 9 17l-5-5'/></svg>
        </div>
        <h1 className='font-display text-3xl font-bold mb-2' style={{ color: 'var(--color-text-primary)' }}>Perfect Match! 🎉</h1>
        <p className='text-lg text-[var(--color-text-secondary)] mb-4'>You found all pairs in {moves} moves!</p>
        <p className='text-[var(--color-text-tertiary)] mb-8'>{project.recipientName || 'Someone Special'}, your memory is amazing!</p>
        <button type='button' role='button' aria-label='Continue to next card' onClick={onComplete} onKeyDown={handleKeyDown} className='clay-btn clay-btn-primary clay-btn-lg'>Continue →</button>
      </div>
    );
  }

  const cols = (() => {
    const cfg = configRef.current;
    const pairs = cfg?.pairs?.length ? cfg.pairs : DEFAULT_PAIRS;
    const gridSize = cfg?.gridSize ?? 8;
    const cardCount = Math.min(gridSize, pairs.length * 2);
    return cardCount <= 4 ? 2 : cardCount <= 8 ? 4 : 6;
  })();

  return (
    <div className='clay-card p-8 sm:p-12 max-w-md mx-auto' role='region' aria-label='Memory match card'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='font-display text-xl font-bold' style={{ color: 'var(--color-text-primary)' }}>Memory Match</h2>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-[var(--color-text-tertiary)]'>Moves: {moves}</span>
          <button type='button' role='button' aria-label='Skip memory match and continue' onClick={onComplete} onKeyDown={handleKeyDown} className='clay-btn clay-btn-secondary clay-btn-sm'>Next →</button>
        </div>
      </div>

      <p className='text-sm text-[var(--color-text-secondary)] mb-6 text-center'>
        Find all matching pairs! Tap a card to flip it.
      </p>

      <div
        className='grid gap-2'
        style={{ gridTemplateColumns: 'repeat(' + cols + ', 1fr)' }}
        role='list'
        aria-label='Memory game cards'
      >
        {cards.map((card, index) => (
          <button
            key={card.id}
            type='button'
            role='listitem'
            aria-label={card.flipped || card.matched ? card.label : 'Hidden card'}
            aria-pressed={card.flipped || card.matched}
            disabled={card.flipped || card.matched || lockBoard}
            onClick={() => flipCard(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                flipCard(index);
              }
            }}
            className={'relative aspect-square rounded-xl border-2 transition-all ' +
              (card.matched ? 'border-[var(--color-success-dark)] bg-[var(--color-success-light)] cursor-default' :
               card.flipped ? 'border-[var(--color-brand-500)] bg-white cursor-default' :
               'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-500)] hover:shadow-md')}
            style={{
              transform: card.flipped || card.matched ? 'rotateY(0deg)' : 'rotateY(180deg)',
              transition: prefersReducedMotion ? 'none' : 'transform 0.4s ease',
              transformStyle: 'preserve-3d',
            }}
          >
            <div className='absolute inset-0 flex items-center justify-center text-3xl' style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              {card.label}
            </div>
            <div className='absolute inset-0 flex items-center justify-center text-2xl' style={{ backfaceVisibility: 'hidden' }}>
              <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ color: 'var(--color-text-tertiary)' }}><rect x='2' y='2' width='20' height='20' rx='2' ry='2'/><path d='M2 10h20M2 14h20'/></svg>
            </div>
          </button>
        ))}
      </div>

      <p className='mt-6 text-center text-sm text-[var(--color-text-tertiary)]'>
        {matchedCount} of {gamePairsLength} pairs found
      </p>
    </div>
  );
}
