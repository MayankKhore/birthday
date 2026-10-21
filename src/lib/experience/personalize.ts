/**
 * Personalization + scene-building helpers for the birthday experience.
 * Pure functions (no DOM), so they are easy to unit-test.
 */

import type { CardConfig, QuizQuestion, SceneConfig, StorybookChapter } from './types';
import type { BirthdayProject, UUID } from '@/types';
import { createUUID } from '@/types';

export interface PersonalizeInput {
  recipientName: string;
  recipientAge?: number;
  relationship?: string;
  detail?: string;
  senderName?: string;
}

const FALLBACK_NAME = 'Someone Special';

export function displayName(input: PersonalizeInput): string {
  const name = input.recipientName.trim();
  return name.length > 0 ? name : FALLBACK_NAME;
}

export interface CreateSceneChoices {
  includeEnvelope: boolean;
  includeLetter: boolean;
  includeCake: boolean;
  includeStorybook: boolean;
  includeGallery: boolean;
  games: Array<'roulette' | 'quiz' | 'memory-match'>;
  includeGift: boolean;
  storybookChapters: StorybookChapter[];
  quizQuestions: QuizQuestion[];
  giftTitle: string;
  giftMessage: string;
  candleCount: number;
  enableMicrophoneBlow: boolean;
}

export const DEFAULT_SCENE_CHOICES: CreateSceneChoices = {
  includeEnvelope: true,
  includeLetter: true,
  includeCake: true,
  includeStorybook: true,
  includeGallery: true,
  games: ['roulette', 'quiz', 'memory-match'],
  includeGift: true,
  storybookChapters: [],
  quizQuestions: [],
  giftTitle: 'A Special Gift for You!',
  giftMessage: 'Open your gift to discover a wonderful surprise…',
  candleCount: 5,
  enableMicrophoneBlow: true,
};

/**
 * Builds the ordered, repeatable scene queue from creator choices.
 * Multiple mini-game scenes are first-class citizens (one per game).
 */
export function buildCreateScenes(choices: CreateSceneChoices, photoCount: number): SceneConfig[] {
  const scenes: SceneConfig[] = [];
  let order = 0;
  const push = (s: Omit<SceneConfig, 'id' | 'sortOrder'>): void => {
    scenes.push({ ...s, id: createUUID(), sortOrder: order++ });
  };
  if (choices.includeEnvelope) {
    push({ type: 'envelope', title: 'Envelope Opening', enabled: true, envelopeStyle: 'wax-seal' });
  }
  if (choices.includeLetter) {
    push({ type: 'letter', title: 'Birthday Letter', enabled: true, handwrittenFont: true });
  }
  if (choices.includeCake) {
    push({
      type: 'cake', title: 'Birthday Cake', enabled: true,
      candleCount: Math.max(1, Math.min(12, Math.floor(choices.candleCount) || 5)),
      enableMicrophoneBlow: choices.enableMicrophoneBlow,
    });
  }
  if (choices.includeStorybook) {
    push({ type: 'storybook', title: 'Storybook', enabled: true, chapters: choices.storybookChapters });
  }
  if (choices.includeGallery && photoCount > 0) {
    push({ type: 'photo-gallery', title: 'Photo Memories', enabled: true, layout: 'grid' });
  }
  for (const gameType of choices.games) {
    const gameConfig: CardConfig = {
      id: createUUID(), type: gameType, title: gameType, enabled: true, sortOrder: 0,
      ...(gameType === 'quiz' ? { questions: choices.quizQuestions } : {}),
      ...(gameType === 'memory-match' ? { gridSize: 8 } : {}),
    };
    push({ type: 'mini-game', title: 'Mini-Game', enabled: true, gameType, gameConfig });
  }
  if (choices.includeGift) {
    push({
      type: 'gift-reveal', title: 'Gift Reveal', enabled: true,
      giftConfig: { title: choices.giftTitle || 'A Special Gift for You!', message: choices.giftMessage || 'Made with love, just for you.', animationType: 'unwrap' },
    });
  }
  push({ type: 'celebration', title: 'Celebration', enabled: true, confettiEnabled: true, fireworksEnabled: true });
  return scenes;
}

/** Personalizes whatever the recipient reads from the project at view time. */
export function personalizeProjectView(project: BirthdayProject): {
  name: string;
  letterText: string;
  quizQuestions: QuizQuestion[];
  storyChapters: StorybookChapter[];
} {
  const input: PersonalizeInput = {
    recipientName: project.recipientName,
    ...(project.recipientAge !== undefined ? { recipientAge: project.recipientAge } : {}),
    ...(project.relationship ? { relationship: project.relationship } : {}),
  };
  return {
    name: displayName(input),
    letterText: buildLetterText(input, project.customMessage ?? project.message),
    quizQuestions: buildQuizQuestions(input),
    storyChapters: buildStoryChapters(input),
  };
}


export function agePhrase(age?: number): string {
  if (typeof age !== 'number' || !Number.isFinite(age) || age <= 0) return 'another wonderful year';
  return `turning ${Math.floor(age)}`;
}

export function buildLetterText(input: PersonalizeInput, message: string): string {
  const name = displayName(input);
  const who = input.relationship ? `my dearest ${input.relationship}` : 'someone truly special';
  const base = message.trim().length > 0 ? message.trim() : `Happy birthday, ${name}!`;
  const parts = [
    `Dear ${name},`,
    `Today we celebrate you — ${who} — ${agePhrase(input.recipientAge)}.`,
    base,
    input.detail ? `I'll never forget: ${input.detail}` : '',
    input.senderName ? `With all my love,\n${input.senderName}` : 'With all my love.',
  ];
  return parts.filter((p) => p.trim().length > 0).join('\n\n');
}

export function buildStoryChapters(input: PersonalizeInput): StorybookChapter[] {
  const name = displayName(input);
  return [
    {
      id: createUUID(),
      title: 'Once Upon a Time…',
      text: `In a world not so far away, there lived someone truly special named ${name}. Everywhere they went, ordinary days turned a little brighter.`,
    },
    {
      id: createUUID(),
      title: 'The Adventure So Far',
      text: input.detail
        ? `From ${input.detail} to a hundred small kindnesses nobody else noticed — ${name} has been collecting moments like treasures.`
        : `Year after year, ${name} has been collecting laughter, friendship, and wonderful memories like treasures.`,
    },
    {
      id: createUUID(),
      title: 'A Very Special Day',
      text: `And today, the whole world celebrates ${name} ${agePhrase(input.recipientAge)}! Blow out the candles, make a wish, and know how loved you are.`,
    },
  ];
}

export function buildQuizQuestions(input: PersonalizeInput): QuizQuestion[] {
  const name = displayName(input);
  const hasAge = typeof input.recipientAge === 'number' && Number.isFinite(input.recipientAge) && input.recipientAge > 0;
  const age = hasAge ? Math.floor(input.recipientAge as number) : null;
  const distract = age !== null ? [Math.max(1, age - 2), age + 1, age + 5] : null;
  const options = age !== null && distract
    ? [String(age), ...distract.map(String)]
    : ['Cake', 'Presents', 'Hugs'];
  const shuffled = [...options].sort();
  return [
    {
      id: createUUID(),
      question: age !== null ? `How old is ${name} turning?` : `What is the best birthday gift for ${name}?`,
      options: shuffled,
      correctAnswerIndex: Math.max(0, shuffled.indexOf(age !== null ? String(age) : 'Hugs')),
      feedback: age !== null ? `That's right — ${age} looks wonderful on ${name}!` : 'Correct — hugs win every time!',
    },
    {
      id: createUUID(),
      question: 'What do you blow out on a birthday cake?',
      options: ['Candles', 'Balloons', 'Speakers', 'Fireworks'],
      correctAnswerIndex: 0,
      feedback: 'Right — candles out, wish made!',
    },
  ];
}
