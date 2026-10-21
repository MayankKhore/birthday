/**
 * CardSequence — Stage 12 interactive card orchestrator.
 *
 * Renders the selected cards as an intentional sequence, allowing the
 * recipient to progress through each card with clear navigation.
 * Keyboard accessible: Enter/Space to advance each card.
 * Respects prefers-reduced-motion.
 */

import { useCallback, useEffect, useState } from 'react';
import type { BirthdayProject } from '@/types';
import type { CardConfig, CardType } from '@/lib/experience/types';
import { PresentationCard } from './PresentationCard';
import { CountdownCard } from './CountdownCard';
import { PhotoTimelineCard } from './PhotoTimelineCard';
import { MemoryGalleryCard } from './MemoryGalleryCard';
import { RouletteCard } from './RouletteCard';
import { QuizCard } from './QuizCard';
import { StorybookCard } from './StorybookCard';
import { MemoryMatchCard } from './MemoryMatchCard';
import { GiftRevealCard } from './GiftRevealCard';

interface Props {
  project: BirthdayProject;
  cards: CardConfig[];
  onComplete: () => void;
  reducedMotion: boolean;
}

const CARD_COMPONENTS: Record<CardType, React.ComponentType<{
  project: BirthdayProject;
  config?: { 
    revealName?: boolean; 
    revealMessage?: string; 
    targetDate?: string; 
    photoIds?: string[]; 
    messages?: string[]; 
    spinsRemaining?: number; 
    questions?: import('@/lib/experience/types').QuizQuestion[];
    chapters?: import('@/lib/experience/types').StorybookChapter[];
    pairs?: import('@/lib/experience/types').MemoryMatchPair[];
    gridSize?: number;
    giftConfig?: import('@/lib/experience/types').GiftRevealConfig;
  };
  onComplete?: () => void;
  reducedMotion: boolean;
}>> = {
  presentation: PresentationCard,
  countdown: CountdownCard,
  'photo-timeline': PhotoTimelineCard,
  'memory-gallery': MemoryGalleryCard,
  roulette: RouletteCard,
  quiz: QuizCard,
  storybook: StorybookCard,
  'memory-match': MemoryMatchCard,
  'gift-reveal': GiftRevealCard,
};

export function CardSequence({ project, cards, onComplete, reducedMotion }: Props) {
  const [cardIndex, setCardIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  const enabledCards = cards.filter((c) => c.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
  const currentCard = enabledCards[cardIndex];

  const handleCardComplete = useCallback(() => {
    if (cardIndex < enabledCards.length - 1) {
      setCardIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  }, [cardIndex, enabledCards.length]);

  useEffect(() => {
    if (completed || !currentCard) {
      const t = window.setTimeout(() => onComplete(), 60);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [completed, currentCard, onComplete]);

  if (completed || !currentCard) {
    return null;
  }
  const cardConfig: any = {
    revealName: currentCard.revealName,
    revealMessage: currentCard.revealMessage,
    targetDate: currentCard.targetDate,
    photoIds: currentCard.photoIds,
    messages: currentCard.messages,
    spinsRemaining: currentCard.spinsRemaining,
    questions: currentCard.questions,
    chapters: currentCard.chapters,
    pairs: currentCard.pairs,
    gridSize: currentCard.gridSize,
    giftConfig: currentCard.giftConfig,
  };

  return (
    <div className='fixed inset-0 z-[500] flex flex-col items-center justify-center p-6' style={{ background: 'var(--color-page)' }}>
      <div className='max-w-md w-full text-center'>
        <div className='mb-6 flex items-center justify-between'>
          <span className='text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]'>
            Card {cardIndex + 1} of {enabledCards.length}
          </span>
          <span className='text-xs text-[var(--color-text-tertiary)]'>{currentCard.title}</span>
        </div>

        {(() => {
          const CardComponent = CARD_COMPONENTS[currentCard.type];
          return (
            <CardComponent
              project={project}
              config={cardConfig}
              onComplete={handleCardComplete}
              reducedMotion={reducedMotion}
            />
          );
        })()}
      </div>
    </div>
  );
}
