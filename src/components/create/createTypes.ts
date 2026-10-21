/**
 * Create wizard form state. The wizard is a self-contained React
 * island mounted on /create. No EditorProvider dependency.
 */

import type { MusicTrackId } from '@/lib/media/sound';
import type { QuizQuestion, StorybookChapter } from '@/lib/experience/types';

export type WizardTrack = MusicTrackId | 'uploaded' | 'none';

export interface WizardPhoto {
  localId: string;
  dataUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  caption: string;
}

export interface CreateFormState {
  recipientName: string;
  relationship: string;
  birthdayDate: string;
  unknownYear: boolean;
  recipientAge: string;
  detail: string;
  senderName: string;
  message: string;
  category: string;
  tone: string;
  photos: WizardPhoto[];
  musicEnabled: boolean;
  track: WizardTrack;
  uploadedFileName: string;
  soundEffects: boolean;
  includeEnvelope: boolean;
  includeLetter: boolean;
  includeCake: boolean;
  includeStorybook: boolean;
  includeGallery: boolean;
  games: Array<'roulette' | 'quiz' | 'memory-match'>;
  includeGift: boolean;
  candleCount: number;
  enableMicrophoneBlow: boolean;
  storyChapters: StorybookChapter[];
  quizQuestions: QuizQuestion[];
  giftTitle: string;
  giftMessage: string;
  themeId: string;
}

export const EMPTY_FORM: CreateFormState = {
  recipientName: '',
  relationship: 'friend',
  birthdayDate: '',
  unknownYear: false,
  recipientAge: '',
  detail: '',
  senderName: '',
  message: '',
  category: '',
  tone: '',
  photos: [],
  musicEnabled: true,
  track: 'gentle-piano',
  uploadedFileName: '',
  soundEffects: true,
  includeEnvelope: true,
  includeLetter: true,
  includeCake: true,
  includeStorybook: true,
  includeGallery: true,
  games: ['roulette', 'quiz', 'memory-match'],
  includeGift: true,
  candleCount: 5,
  enableMicrophoneBlow: true,
  storyChapters: [],
  quizQuestions: [],
  giftTitle: 'A Special Gift for You!',
  giftMessage: 'Open your gift to discover a wonderful surprise…',
  themeId: 'keepsake',
};

export const DRAFT_KEY = 'bw_create_draft_v1';
export const MAX_WIZARD_PHOTOS = 8;

export const GAME_META: Array<{ id: 'roulette' | 'quiz' | 'memory-match'; name: string; blurb: string }> = [
  { id: 'roulette', name: 'Prize Roulette', blurb: 'Spin the wheel for little surprises' },
  { id: 'quiz', name: 'Birthday Quiz', blurb: 'Playful questions about the star' },
  { id: 'memory-match', name: 'Memory Match', blurb: 'Flip cards, find the pairs' },
];
