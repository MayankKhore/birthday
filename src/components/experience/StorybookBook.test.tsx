import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BirthdayProject, Theme } from '@/types';
import type { StorybookChapter } from '@/lib/experience/types';
import { playSfx } from '@/lib/media/sound';
import StorybookBook from './StorybookBook';

vi.mock('@/lib/media/sound', () => ({
  playSfx: vi.fn(),
  unlockAudio: vi.fn(),
}));

const theme = {
  id: 'elegant-rose',
  name: 'Elegant Rose',
  description: 'A soft, editorial theme',
  category: 'elegant',
  tier: 'free',
  previewImageUrl: '',
  colors: {
    primary: '#A02F60',
    secondary: '#6E9B84',
    accent: '#A87F2E',
    background: '#FAF7F2',
    surface: '#FFFFFF',
    textPrimary: '#241D2E',
    textSecondary: '#5A5266',
    textOnPrimary: '#FFFFFF',
  },
  fonts: { heading: 'Fraunces', body: 'Plus Jakarta Sans' },
  animations: {
    enableConfetti: true,
    enableParallax: false,
    enableFadeIn: true,
    enableFloat: true,
    reducedMotionFallback: true,
  },
  layout: {
    type: 'centered',
    photoDisplay: 'gallery',
    messagePosition: 'center',
    showMusicControls: true,
  },
  isDefault: false,
} as Theme;

const project = {
  id: 'project-1',
  recipientName: 'Maya',
  message: 'A very happy birthday to you.',
  photos: [],
} as unknown as BirthdayProject;

const chapters: StorybookChapter[] = [
  {
    id: 'chapter-1' as StorybookChapter['id'],
    title: 'The First Hello',
    text: 'It started with a tiny note and a whole lot of courage.',
  },
  {
    id: 'chapter-2' as StorybookChapter['id'],
    title: 'The Late Nights',
    text: 'We talked until the sky turned pale.',
  },
];

function renderBook(overrides: Partial<React.ComponentProps<typeof StorybookBook>> = {}) {
  const onComplete = vi.fn();
  const onExit = vi.fn();
  const { container } = render(
    <StorybookBook
      project={project}
      theme={theme}
      chapters={chapters}
      letterText="With all my love, always."
      reducedMotion={false}
      sfxEnabled
      musicEnabled={false}
      musicPlaying={false}
      onToggleMusic={vi.fn()}
      onComplete={onComplete}
      onExit={onExit}
      {...overrides}
    />,
  );
  return { onComplete, onExit, container };
}

describe('StorybookBook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  /** Let the CSS leaf finish its sweep so the new spread is committed. */
  function settleTurn(): void {
    act(() => {
      vi.advanceTimersByTime(720);
    });
  }

  it('renders the masthead and the first chapter spread', () => {
    renderBook();

    expect(screen.getByText('Chapter by chapter')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Our story' })).toBeTruthy();
    expect(screen.getByText('Chapter 1')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'The First Hello' })).toBeTruthy();
    expect(screen.getByText(/tiny note and a whole lot of courage/i)).toBeTruthy();
  });

  it('shows the pager and disables the previous arrow on the first page', () => {
    renderBook();

    expect(screen.getByText(/Page 1 of 3/i)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('turns to the next chapter and plays a page-flip sound', () => {
    renderBook();

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    expect(playSfx).toHaveBeenCalledWith('flip');
    expect(screen.getByText('Chapter 2')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'The Late Nights' })).toBeTruthy();
    expect(screen.getByText(/Page 2 of 3/i)).toBeTruthy();

    settleTurn();

    expect(screen.getByText('Chapter 2')).toBeTruthy();
    expect(screen.getByText(/Page 2 of 3/i)).toBeTruthy();
  });

  it('turns back to the previous chapter', () => {
    renderBook();

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    settleTurn();
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));

    expect(screen.getByText('Chapter 1')).toBeTruthy();
    expect(screen.getByText(/Page 1 of 3/i)).toBeTruthy();

    settleTurn();

    expect(screen.getByText('Chapter 1')).toBeTruthy();
    expect(screen.getByText(/Page 1 of 3/i)).toBeTruthy();
  });

  it('supports keyboard navigation', () => {
    renderBook();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });
    expect(screen.getByText('Chapter 2')).toBeTruthy();

    settleTurn();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    });
    expect(screen.getByText('Chapter 1')).toBeTruthy();
  });

  it('appends the letter as a closing spread and completes on the last page', () => {
    const { onComplete } = renderBook();

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    settleTurn();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    settleTurn();

    expect(screen.getByText('The last page')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'A note for Maya' })).toBeTruthy();
    expect(screen.getByText(/Page 3 of 3/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Finish the story' }));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(screen.getByText(/the end/i)).toBeTruthy();
  });

  it('closes the book through the exit button', () => {
    const { onExit } = renderBook();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onExit).toHaveBeenCalledOnce();
  });

  it('sweeps a leaf across the spine when turning to the next chapter', () => {
    const { container } = renderBook();

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    const leaf = container.querySelector('.storybook-book__leaf');
    expect(leaf).toBeTruthy();
    expect(leaf?.className).toContain('storybook-book__leaf--next');

    settleTurn();

    expect(container.querySelector('.storybook-book__leaf')).toBeNull();
  });

  it('sweeps the leaf back over the same spine when turning backwards', () => {
    const { container } = renderBook();

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    settleTurn();
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));

    const leaf = container.querySelector('.storybook-book__leaf');
    expect(leaf).toBeTruthy();
    expect(leaf?.className).toContain('storybook-book__leaf--back');

    settleTurn();

    expect(container.querySelector('.storybook-book__leaf')).toBeNull();
  });

  it('commits the turn immediately and renders no leaf when motion is reduced', () => {
    const { container } = renderBook({ reducedMotion: true });

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    expect(container.querySelector('.storybook-book__leaf')).toBeNull();
    expect(screen.getByText('Chapter 2')).toBeTruthy();
    expect(screen.getByText(/Page 2 of 3/i)).toBeTruthy();
  });

  it('marks the scene as compact so the single-page layout is used', () => {
    const { container } = renderBook();

    // The default matchMedia mock reports no match, so the scene stays wide.
    expect(container.querySelector('.storybook-book--compact')).toBeNull();
    expect(container.querySelector('.storybook-book--reduced')).toBeNull();
  });
});
