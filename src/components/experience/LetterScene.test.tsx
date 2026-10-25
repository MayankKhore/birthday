import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LetterScene } from './LetterScene';
import { playSfx } from '@/lib/media/sound';

vi.mock('@/lib/media/sound', () => ({
  playSfx: vi.fn(),
}));

const letterText = 'Dear Maya,\n\nHave the most wonderful birthday!\n\nWith love.';

function renderLetter(reducedMotion = false, onComplete = vi.fn()) {
  render(
    <LetterScene
      letterText={letterText}
      recipientName="Maya"
      sfxEnabled
      reducedMotion={reducedMotion}
      onComplete={onComplete}
    />,
  );
  return onComplete;
}

describe('LetterScene', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('opens the envelope and reveals the personalized letter', () => {
    renderLetter();

    expect(screen.getByRole('button', { name: /open my letter/i })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /open my letter/i }));
    expect(screen.getByText(/a surprise is unfolding/i)).toBeTruthy();
    expect(playSfx).toHaveBeenCalledWith('flip');

    act(() => {
      vi.advanceTimersByTime(2800);
    });
    expect(screen.getByRole('button', { name: /skip the reveal/i })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /skip the reveal/i }));
    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(screen.getByRole('button', { name: /continue the celebration/i })).toBeTruthy();
  });

  it('can skip the reveal and continue to the next scene', () => {
    const onComplete = renderLetter();

    act(() => {
      vi.advanceTimersByTime(1101);
    });
    act(() => {
      vi.advanceTimersByTime(2801);
    });
    fireEvent.click(screen.getByRole('button', { name: /skip the reveal/i }));

    act(() => {
      vi.advanceTimersByTime(450);
    });
    fireEvent.click(screen.getByRole('button', { name: /continue the celebration/i }));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(playSfx).toHaveBeenCalledWith('pop');
  });

  it('types the letter character by character', () => {
    renderLetter();

    act(() => {
      vi.advanceTimersByTime(1101);
    });
    act(() => {
      vi.advanceTimersByTime(2801);
    });
    act(() => {
      vi.advanceTimersByTime(190);
    });

    const typedMessage = document.querySelector('.letter-sheet__copy')?.textContent ?? '';
    expect(typedMessage.length).toBeGreaterThan(0);
    expect(typedMessage.length).toBeLessThan(letterText.length);
    expect(typedMessage.startsWith('D')).toBe(true);
    expect(document.querySelector('.letter-sheet__cursor')).toBeTruthy();
  });

  it('shows the complete letter immediately when reduced motion is enabled', () => {
    renderLetter(true);

    expect(screen.queryByRole('button', { name: /open my letter/i })).toBeNull();
    expect(screen.getByText('Have the most wonderful birthday!')).toBeTruthy();
    expect(screen.getByRole('button', { name: /continue the celebration/i })).toBeTruthy();
  });
});
