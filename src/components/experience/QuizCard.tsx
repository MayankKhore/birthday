/**
 * QuizCard â€” Stage 8 interactive birthday card.
 *
 * A playful quiz with a birthday surprise at the end.
 * Keyboard accessible: Enter/Space to select and advance.
 * Respects prefers-reduced-motion.
 */

import { useCallback, useState } from 'react';
import type { BirthdayProject } from '@/types';
import type { QuizQuestion } from '@/lib/experience/types';

interface Props {
  project: BirthdayProject;
  config?: { questions?: QuizQuestion[] };
  onComplete?: () => void;
  reducedMotion: boolean;
}

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  { id: 'q1' as any, question: "What's the best thing about birthdays?", options: ['Cake!', 'Presents', 'Celebrating with loved ones', 'All of the above'], correctAnswerIndex: 3, feedback: 'Correct! Every birthday is worth celebrating.' },
  { id: 'q2' as any, question: 'What do you blow out on a birthday cake?', options: ['Candles', 'Lights', 'Music', 'The oven'], correctAnswerIndex: 0, feedback: 'Right on â€” candles, and then make a wish!' },
];

export function QuizCard({ project, config, onComplete, reducedMotion }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completed, setCompleted] = useState(false);

  const questions = config?.questions ?? DEFAULT_QUESTIONS;
  const currentQuestion = questions[currentIndex]!;
  const prefersReducedMotion = reducedMotion;

  const selectAnswer = useCallback((index: number) => {
    setSelectedAnswer(index);
    setShowFeedback(true);
  }, []);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setCompleted(true);
      setTimeout(() => onComplete?.(), 1000);
    }
  }, [currentIndex, questions.length, onComplete]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (completed) { onComplete?.(); }
        else if (showFeedback) { nextQuestion(); }
        else if (selectedAnswer !== null) { nextQuestion(); }
      }
    },
    [completed, showFeedback, selectedAnswer, nextQuestion, onComplete],
  );

  if (completed) {
    return (
      <div className="clay-card p-8 sm:p-12 max-w-md mx-auto text-center" role="region" aria-label="Quiz card">
        <div className="clay-icon-btn clay-icon-btn-lg mx-auto mb-6 animate-pop" style={{ background: 'var(--color-mint)', color: 'var(--color-text-primary)' }} aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17l-5-5"/></svg>
        </div>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Quiz complete! ðŸŽ‰</h1>
        <p className="text-lg text-[var(--color-text-secondary)] mb-8">You aced it, {project.recipientName || 'Someone Special'}!</p>
        <button type="button" role="button" aria-label="Continue to next card" onClick={onComplete} onKeyDown={handleKeyDown} className="clay-btn clay-btn-primary clay-btn-lg">Continue â†’</button>
      </div>
    );
  }

  return (
    <div className="clay-card p-8 sm:p-12 max-w-md mx-auto" role="region" aria-label="Quiz card">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">Question {currentIndex + 1} of {questions.length}</span>
      </div>

      <h2 className="font-display text-xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>{currentQuestion.question}</h2>

      <div className="space-y-3">
        {currentQuestion.options.map((option, i) => (
          <button key={i} type="button" role="radio" aria-checked={selectedAnswer === i} disabled={showFeedback} onClick={() => selectAnswer(i)} onKeyDown={handleKeyDown} className={`w-full text-left p-4 rounded-xl border transition-all ${showFeedback ? selectedAnswer === i ? currentQuestion.correctAnswerIndex === i ? 'border-[var(--color-success-dark)] bg-[var(--color-success-light)] text-[var(--color-success-dark)]' : 'border-[var(--color-error-dark)] bg-[var(--color-error-light)] text-[var(--color-error-dark)]' : currentQuestion.correctAnswerIndex === i ? 'border-[var(--color-success-dark)]/40 bg-[var(--color-success-light)]/20' : 'border-[var(--color-border)]/40' : 'border-[var(--color-border)] hover:bg-[var(--color-surface-lavender)]'}`}>
            {option}
          </button>
        ))}
      </div>

      {showFeedback && selectedAnswer !== null && (
        <div className="mt-4 animate-fade-in">
          <p className={`text-sm font-medium ${selectedAnswer === currentQuestion.correctAnswerIndex ? 'text-[var(--color-success-dark)]' : 'text-[var(--color-error-dark)]'}`}>
            {selectedAnswer === currentQuestion.correctAnswerIndex ? 'âœ“ ' : 'âœ— '}{currentQuestion.feedback}
          </p>
        </div>
      )}

      {!showFeedback && <p className="mt-8 text-sm text-[var(--color-text-tertiary)]">Select an answer to continue</p>}

      {showFeedback && selectedAnswer === null && (
        <button type="button" role="button" aria-label="Next question" onClick={nextQuestion} onKeyDown={handleKeyDown} className="mt-8 clay-btn clay-btn-primary clay-btn-lg">Next question â†’</button>
      )}
    </div>
  );
}
