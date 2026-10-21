/**
 * Birthday Experience Config — Stage 12.
 *
 * Default scene/card configurations and metadata for each type.
 * These are used by the editor to populate scene/card selection and by the
 * recipient-facing renderer to build the experience sequence.
 */

import type { CardConfig, CardType, ExperienceConfig, SceneConfig, SceneType } from './types';
import type { BirthdayProject, Theme, UUID } from '@/types';
import { createUUID } from '@/types';
import { DEFAULT_EXPERIENCE_CONFIG } from './types';

/* ============================================================
 * Card Type Metadata
 * ============================================================ */

export interface CardTypeInfo {
  type: CardType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const CARD_TYPE_REGISTRY: CardTypeInfo[] = [
  { type: 'presentation', label: 'Presentation Card', description: 'Animated name reveal with a personal opening line.', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5', color: 'var(--color-brand-500)' },
  { type: 'countdown', label: 'Countdown Card', description: 'Counts down to the big day with celebration.', icon: 'M12 2v20M12 2l-7 7 7 7M22 12l-7 7-7-7', color: 'var(--color-peach)' },
  { type: 'photo-timeline', label: 'Photo Timeline', description: 'A scrolling timeline of uploaded photos with dates.', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z', color: 'var(--color-mint)' },
  { type: 'memory-gallery', label: 'Memory Gallery', description: 'A beautiful grid of photos with captions.', icon: 'M12 2c4 0 8 2 8 6v3H4v-3c0-4 4-6 8-6zM4 14h16v-2H4v2z', color: 'var(--color-rose)' },
  { type: 'roulette', label: 'Prize Roulette', description: 'Spin the wheel for a surprise message or prize.', icon: 'M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zM12 6V2M12 12v4M7.5 12l4.5 4.5M16.5 12l-4.5 4.5M4.929 4.929l6.364 6.364M17.5 17.5l-6.364-6.364', color: 'var(--color-butter)' },
  { type: 'quiz', label: 'Surprise Quiz', description: 'A playful quiz with a birthday surprise at the end.', icon: 'M9 16h6v6h-6v-6zM12 12a3 3 0 100-6 3 3 0 000 6z', color: 'var(--color-lavender)' },
  { type: 'storybook', label: 'Storybook Card', description: 'Interactive personalized storybook with chapters.', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20a2.5 2.5 0 0 1 0 5H6.5a2.5 2.5 0 0 1 0-5zM6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z', color: 'var(--color-peach)' },
  { type: 'memory-match', label: 'Memory Match', description: 'Find matching pairs in this classic memory game.', icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z', color: 'var(--color-mint)' },
  { type: 'gift-reveal', label: 'Gift Reveal', description: 'Unwrap a final surprise gift with animation.', icon: 'M12 8H4l1.45 1.45L10 14.54V22h1l-.39-2.7L14 13l-1.71-1.71zM18 16H8l4-4 4 4z', color: 'var(--color-rose)' },
];

export function getCardTypeInfo(type: CardType): CardTypeInfo {
  return CARD_TYPE_REGISTRY.find((c) => c.type === type) ?? CARD_TYPE_REGISTRY[0]!;
}

/* ============================================================
 * Scene Type Metadata (Stage 12)
 * ============================================================ */

export interface SceneTypeInfo {
  type: SceneType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const SCENE_TYPE_REGISTRY: SceneTypeInfo[] = [
  { type: 'envelope', label: 'Envelope Opening', description: 'A sealed envelope with animated opening.', icon: 'M20 4H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z', color: 'var(--color-brand-500)' },
  { type: 'letter', label: 'Birthday Letter', description: 'A personal handwritten-style letter.', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8', color: 'var(--color-rose)' },
  { type: 'cake', label: 'Interactive Cake', description: 'Light candles, make a wish, blow them out.', icon: 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z', color: 'var(--color-butter)' },
  { type: 'storybook', label: 'Storybook', description: 'Personalized chapters telling their story.', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20a2.5 2.5 0 0 1 0 5H6.5a2.5 2.5 0 0 1 0-5zM6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z', color: 'var(--color-peach)' },
  { type: 'photo-gallery', label: 'Photo Gallery', description: 'Beautiful layout of memory photos.', icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z', color: 'var(--color-mint)' },
  { type: 'mini-game', label: 'Mini Game', description: 'Interactive birthday mini-game.', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', color: 'var(--color-butter)' },
  { type: 'gift-reveal', label: 'Gift Reveal', description: 'Unwrap the final birthday surprise.', icon: 'M12 8H4l1.45 1.45L10 14.54V22h1l-.39-2.7L14 13l-1.71-1.71zM18 16H8l4-4 4 4z', color: 'var(--color-rose)' },
  { type: 'celebration', label: 'Celebration Finale', description: 'Confetti, fireworks, and closing message.', icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3', color: 'var(--color-lavender)' },
];

export function getSceneTypeInfo(type: SceneType): SceneTypeInfo {
  return SCENE_TYPE_REGISTRY.find((c) => c.type === type) ?? SCENE_TYPE_REGISTRY[0]!;
}

/* ============================================================
 * Default Card Configs
 * ============================================================ */

export function createDefaultCard(type: CardType): CardConfig {
  const base: CardConfig = {
    id: createUUID() as UUID,
    type,
    title: getCardTypeInfo(type).label,
    enabled: true,
    sortOrder: Date.now(),
  };

  switch (type) {
    case 'presentation':
      return { ...base, revealName: true, revealMessage: '' };
    case 'countdown':
      return base;
    case 'photo-timeline':
      return { ...base, photoIds: [] };
    case 'memory-gallery':
      return { ...base, photoIds: [] };
    case 'roulette':
      return { ...base, messages: ['A warm hug is coming your way 🤗', 'You deserve all the happiness today 🎂', 'Make a wish — it\'s your day! 🕯️', 'Extra slice of cake, just for you 🍰', 'A birthday dance break 💃', 'Your favorite treat is on its way 🍦'], spinsRemaining: 3 };
    case 'quiz':
      return { ...base, questions: [{ id: createUUID() as UUID, question: 'What\'s the best thing about birthdays?', options: ['Cake!', 'Presents', 'Celebrating with loved ones', 'All of the above'], correctAnswerIndex: 3, feedback: 'Correct! Every birthday is worth celebrating.' }, { id: createUUID() as UUID, question: 'What do you blow out on a birthday cake?', options: ['Candles', 'Lights', 'Music', 'The oven'], correctAnswerIndex: 0, feedback: 'Right on — candles, and then make a wish!' }] };
    case 'storybook':
      return { ...base, chapters: [{ id: createUUID() as UUID, title: 'Once Upon a Time...', text: 'In a world not so far away, there lived someone truly special...' }, { id: createUUID() as UUID, title: 'The Adventure Begins', text: 'Every year brought new adventures, laughter, and wonderful memories.' }, { id: createUUID() as UUID, title: 'A Special Day', text: 'And today, the whole world celebrates YOU!' }] };
    case 'memory-match':
      return { ...base, pairs: [], gridSize: 8 };
    case 'gift-reveal':
      return { ...base, giftConfig: { title: 'A Special Gift for You!', message: 'Open your gift to discover a wonderful surprise...', animationType: 'unwrap' } };
    default:
      return base;
  }
}

/* ============================================================
 * Default Scene Configs
 * ============================================================ */

export function createDefaultScene(type: SceneType): SceneConfig {
  const base: SceneConfig = {
    id: createUUID() as UUID,
    type,
    title: getSceneTypeInfo(type).label,
    enabled: true,
    sortOrder: Date.now(),
  };

  switch (type) {
    case 'envelope':
      return { ...base, envelopeStyle: 'wax-seal' };
    case 'letter':
      return { ...base, handwrittenFont: true };
    case 'cake':
      return { ...base, candleCount: 3, enableMicrophoneBlow: true };
    case 'storybook':
      return { ...base, chapters: [{ id: createUUID() as UUID, title: 'Once Upon a Time...', text: 'In a world not so far away, there lived someone truly special...' }, { id: createUUID() as UUID, title: 'The Adventure Begins', text: 'Every year brought new adventures, laughter, and wonderful memories.' }, { id: createUUID() as UUID, title: 'A Special Day', text: 'And today, the whole world celebrates YOU!' }] };
    case 'photo-gallery':
      return { ...base, layout: 'grid', photoIds: [] };
    case 'mini-game':
      return { ...base, gameType: 'memory-match' };
    case 'gift-reveal':
      return { ...base, giftConfig: { title: 'A Special Gift for You!', message: 'Open your gift to discover a wonderful surprise...', animationType: 'unwrap' } };
    case 'celebration':
      return { ...base, confettiEnabled: true, fireworksEnabled: true, message: 'What an amazing celebration!' };
    default:
      return base;
  }
}

/* ============================================================
 * Default Experience Config from Project
 * ============================================================ */

export function buildExperienceConfig(
  project: BirthdayProject,
  theme: Theme,
  cards: CardConfig[] = [],
  scenes: SceneConfig[] = [],
): ExperienceConfig {
  const hasPhotos = project.photos && project.photos.length > 0;

  const defaultCards: CardConfig[] = [
    createDefaultCard('presentation'),
    ...(hasPhotos ? [createDefaultCard('photo-timeline'), createDefaultCard('memory-gallery')] : []),
    createDefaultCard('roulette'),
    createDefaultCard('quiz'),
    createDefaultCard('storybook'),
    createDefaultCard('memory-match'),
    createDefaultCard('gift-reveal'),
  ];

  const defaultScenes: SceneConfig[] = [
    createDefaultScene('envelope'),
    createDefaultScene('letter'),
    createDefaultScene('cake'),
    ...(hasPhotos ? [createDefaultScene('photo-gallery')] : []),
    createDefaultScene('storybook'),
    createDefaultScene('mini-game'),
    createDefaultScene('gift-reveal'),
    createDefaultScene('celebration'),
  ];

  // Start with provided scenes or defaults
  let finalScenes = scenes.length > 0 ? [...scenes] : [...defaultScenes];

  // Ensure celebration is present and placed at the very end
  let celebrationScene = finalScenes.find(s => s.type === 'celebration');
  if (!celebrationScene) {
    celebrationScene = createDefaultScene('celebration');
    finalScenes.push(celebrationScene);
  }
  // Force very high sortOrder so celebration appears last
  celebrationScene.sortOrder = Number.MAX_SAFE_INTEGER;

  // Ensure gift-reveal (if present) is placed just before celebration
  const giftScene = finalScenes.find(s => s.type === 'gift-reveal');
  if (giftScene) {
    giftScene.sortOrder = Number.MAX_SAFE_INTEGER - 1;
  }

  // Keep order by sortOrder
  finalScenes.sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    ...DEFAULT_EXPERIENCE_CONFIG,
    cards: cards.length > 0 ? cards : defaultCards,
    scenes: finalScenes,
    musicEnabled: !!project.musicEnabled,
    ...(project.musicTrackId ? { musicTrackId: project.musicTrackId } : {}),
    confettiEnabled: theme.animations.enableConfetti,
    reducedMotion: false,
  };
}
