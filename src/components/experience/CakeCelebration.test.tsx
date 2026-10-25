import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BirthdayProject } from '@/types';
import { CakeCelebration } from './CakeCelebration';

const project = {
  recipientName: 'Maya',
} as BirthdayProject;

function renderCake(onComplete = vi.fn()): ReturnType<typeof vi.fn> {
  render(
    <CakeCelebration
      project={project}
      confettiEnabled
      reducedMotion={false}
      enableMicrophoneBlow={false}
      onComplete={onComplete}
    />,
  );
  return onComplete;
}

describe('CakeCelebration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('moves from the wish to the interactive blow prompt', () => {
    renderCake();

    expect(screen.getByRole('heading', { name: 'A wish for Maya' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'I made my wish' }));

    expect(screen.getByRole('heading', { name: 'Blow out the candles' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Hold to blow out the candles' })).toBeTruthy();
  });

  it('shows the post-blow celebration and continues only when requested', () => {
    const onComplete = renderCake();

    fireEvent.click(screen.getByRole('button', { name: 'I made my wish' }));
    fireEvent.click(screen.getByRole('button', { name: 'Blow out all candles now' }));

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(screen.getByRole('heading', { name: 'Your wish is on its way, Maya' })).toBeTruthy();
    expect(document.querySelector('.cake-scene--celebrating')).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /continue the celebration/i }));
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
