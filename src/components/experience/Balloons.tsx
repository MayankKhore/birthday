/**
 * Balloons â€” Stage 8 floating balloon effect.
 *
 * Lightweight CSS-based floating balloons. Respects prefers-reduced-motion.
 */

import { useEffect, useState, useCallback } from 'react';

interface Props {
  /** Whether balloons are currently active */
  active: boolean;
  /** Number of balloons */
  count?: number;
  /** Colors for balloons */
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#f472b6',
  '#a78bfa',
  '#fbbf24',
  '#34d399',
  '#60a5fa',
  '#ec4899',
];

export function Balloons({ active, count = 12, colors = DEFAULT_COLORS }: Props) {
  const [balloons, setBalloons] = useState<
    Array<{ id: number; x: number; color: string | undefined; size: number; delay: number; speed: number }>
  >([]);

  const spawn = useCallback(() => {
    if (!active) return;
    const next = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[i % colors.length],
      size: Math.random() * 20 + 30,
      delay: Math.random() * 5,
      speed: Math.random() * 3 + 4,
    }));
    setBalloons(next);
  }, [active, count, colors]);

  useEffect(() => {
    spawn();
  }, [spawn]);

  if (balloons.length === 0) return null;

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[590] overflow-hidden"
      aria-hidden="true"
    >
      {balloons.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full border-2 border-white/60"
          style={{
            left: `${b.x}vw`,
            top: `110vh`,
            width: `${b.size}px`,
            height: `${b.size * 1.2}px`,
            backgroundColor: b.color,
            animation: prefersReducedMotion
              ? 'none'
              : `balloon-float ${b.speed}s ease-in-out ${b.delay}s infinite`,
            opacity: 0.9,
          }}
        >
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-transparent border-b-[var(--color-text-tertiary)]"
            style={{ borderBottomWidth: `${b.size * 0.15}px` }}
          />
        </div>
      ))}
      <style>
        {`
          @keyframes balloon-float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10vh) scale(1.05); }
            100% { transform: translateY(-20vh); }
          }
        `}
      </style>
    </div>
  );
}
