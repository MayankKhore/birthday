/**
 * Confetti â€” Stage 8 celebration effect.
 *
 * Lightweight CSS-based confetti burst. Respects prefers-reduced-motion.
 * No external libraries required.
 */

import { useEffect, useState, useCallback } from 'react';

interface Props {
  /** Whether confetti is currently active */
  active: boolean;
  /** Number of confetti pieces */
  count?: number;
  /** Colors for confetti pieces */
  colors?: string[];
  /** Duration in ms before confetti disappears */
  duration?: number;
}

const DEFAULT_COLORS = [
  '#fbbf24',
  '#f472b6',
  '#a78bfa',
  '#34d399',
  '#60a5fa',
  '#fcd34d',
];

export function Confetti({
  active,
  count = 40,
  colors = DEFAULT_COLORS,
  duration = 1800,
}: Props) {
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; y: number; color: string | undefined; rotation: number }>>([]);

  const trigger = useCallback(() => {
    if (!active) return;
    const next = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      color: colors[i % colors.length],
      rotation: Math.random() * 360,
    }));
    setPieces(next);
    setTimeout(() => setPieces([]), duration);
  }, [active, count, colors, duration]);

  useEffect(() => {
    trigger();
  }, [trigger]);

  if (pieces.length === 0) return null;

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[600] overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 rounded"
          style={{
            left: `${piece.x}vw`,
            top: `${piece.y}vh`,
            backgroundColor: piece.color,
            animation: prefersReducedMotion
              ? 'none'
              : `confetti-fall ${Math.random() * 1 + 0.5}s ease-out ${Math.random() * 0.5}s forwards`,
            transform: `rotate(${piece.rotation}deg)`,
            opacity: prefersReducedMotion ? 1 : 0.9,
          }}
        />
      ))}
      <style>
        {`
          @keyframes confetti-fall {
            to {
              transform: translateY(110vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}
