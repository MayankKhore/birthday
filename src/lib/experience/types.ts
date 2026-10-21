/**
 * Birthday Experience Types — Stage 12 recipient-facing renderer.
 *
 * Defines the scene/card types, experience configuration, and props for the
 * recipient-facing birthday experience renderer. This is what the birthday
 * recipient sees when they open a shared birthday link — a distinct,
 * emotionally-focused experience that does not look like the editor or dashboard.
 */

import type { BirthdayProject, Theme, UUID } from '@/types';

/* ============================================================
 * Scene Types (Stage 12: Modular scenes beyond cards)
 * ============================================================ */

export type SceneType =
  | 'envelope' // Sealed envelope opening
  | 'letter' // Personal birthday letter
  | 'cake' // Interactive cake with candles
  | 'storybook' // Personalized storybook chapters
  | 'photo-gallery' // Photo memory gallery
  | 'mini-game' // Interactive mini-games
  | 'gift-reveal' // Final gift/surprise reveal
  | 'celebration'; // Final celebration screen

export type CardType =
  | 'presentation' // Animated name reveal card
  | 'countdown' // Countdown to birthday
  | 'photo-timeline' // Photo timeline
  | 'memory-gallery' // Memory gallery
  | 'roulette' // Spinning roulette with messages/prizes
  | 'quiz' // Interactive quiz / surprise card
  | 'storybook' // Interactive storybook (card variant)
  | 'memory-match' // Memory match game
  | 'gift-reveal'; // Gift reveal (card variant)

export interface QuizQuestion {
  id: UUID;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  feedback: string;
}

export interface StorybookChapter {
  id: UUID;
  title: string;
  text: string;
  imageId?: UUID; // Optional photo reference
  backgroundColor?: string;
}

export interface MemoryMatchPair {
  id: UUID;
  imageId: UUID;
  label: string;
}

export interface GiftRevealConfig {
  title: string;
  message: string;
  imageId?: UUID;
  animationType: 'unwrap' | 'fade' | 'pop' | 'slide';
}

export interface CardConfig {
  id: UUID;
  type: CardType;
  title: string;
  enabled: boolean;
  sortOrder: number;

  // Presentation card
  revealName?: boolean;
  revealMessage?: string;

  // Countdown card
  targetDate?: string;

  // Roulette card
  messages?: string[];
  spinsRemaining?: number;

  // Quiz card
  questions?: QuizQuestion[];

  // Photo timeline / memory gallery
  photoIds?: UUID[];

  // Storybook card
  chapters?: StorybookChapter[];

  // Memory match card
  pairs?: MemoryMatchPair[];
  gridSize?: number; // 4, 6, 8, 12

  // Gift reveal card
  giftConfig?: GiftRevealConfig;
}

export interface SceneConfig {
  id: UUID;
  type: SceneType;
  title: string;
  enabled: boolean;
  sortOrder: number;

  // Envelope scene
  envelopeStyle?: 'classic' | 'modern' | 'wax-seal';

  // Letter scene
  letterText?: string;
  handwrittenFont?: boolean;

  // Cake scene
  candleCount?: number;
  candleColors?: string[];
  enableMicrophoneBlow?: boolean;

  // Storybook scene
  chapters?: StorybookChapter[];
  autoPlay?: boolean;

  // Photo gallery scene
  photoIds?: UUID[];
  layout?: 'timeline' | 'grid' | 'carousel';

  // Mini-game scene
  gameType?: 'roulette' | 'quiz' | 'memory-match';
  gameConfig?: CardConfig; // Reuse card config for game settings

  // Gift reveal scene
  giftConfig?: GiftRevealConfig;

  // Celebration scene
  confettiEnabled?: boolean;
  fireworksEnabled?: boolean;
  message?: string;
}

/* ============================================================
 * Experience Configuration
 * ============================================================ */

export interface ExperienceConfig {
  /** Global settings */
  musicEnabled: boolean;
  musicTrackId?: string;
  soundEffectsEnabled: boolean;
  confettiEnabled: boolean;
  reducedMotion: boolean;

  /** Scene sequence (Stage 12: replaces flat card array) */
  scenes: SceneConfig[];

  /** Legacy card support for backward compatibility */
  cards: CardConfig[];
  showEnvelope: boolean;
  showLetter: boolean;
  showParty: boolean;
  showCards: boolean;
  showClosing: boolean;
}

/* ============================================================
 * Experience State
 * ============================================================ */

export type ExperienceStage =
  | 'entrance' // Sealed envelope
  | 'letter' // Birthday letter
  | 'cake' // Interactive cake scene
  | 'storybook' // Storybook chapters
  | 'photo-gallery' // Photo memories
  | 'mini-game' // Mini-games
  | 'gift-reveal' // Gift reveal
  | 'celebration' // Final celebration
  | 'cards' // Legacy card sequence
  | 'closing' // Legacy closing
  | 'complete'; // Experience finished

export interface BirthdayExperienceProps {
  project: BirthdayProject;
  theme: Theme;
  config?: Partial<ExperienceConfig>;
  onMusicToggle?: () => void;
  onRestart?: () => void;
  onClose?: () => void;
}

/* ============================================================
 * Defaults
 * ============================================================ */

export const DEFAULT_EXPERIENCE_CONFIG: ExperienceConfig = {
  showEnvelope: true,
  showLetter: true,
  showParty: true,
  showCards: true,
  showClosing: true,
  cards: [],
  musicEnabled: false,
  soundEffectsEnabled: true,
  confettiEnabled: true,
  reducedMotion: false,
  scenes: [],
};
