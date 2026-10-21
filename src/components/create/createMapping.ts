/**
 * Mapping between the wizard form and project inputs.
 */

import type { CreateProjectInput } from '@/types';
import {
  buildCreateScenes, buildQuizQuestions, buildStoryChapters,
  type CreateSceneChoices,
} from '@/lib/experience/personalize';
import type { CreateFormState } from './createTypes';

export function deriveAge(birthdayDate: string, unknownYear: boolean, manualAge: string): number | undefined {
  const manual = Number.parseInt(manualAge, 10);
  if (Number.isFinite(manual) && manual > 0 && manual < 130) return manual;
  if (unknownYear || !birthdayDate) return undefined;
  const d = new Date(birthdayDate + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const had = now.getMonth() > d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() >= d.getDate());
  if (!had) age -= 1;
  return age > 0 && age < 130 ? age : undefined;
}

function personalizeInput(state: CreateFormState): {
  recipientName: string; recipientAge?: number; relationship?: string; detail?: string; senderName?: string;
} {
  const age = deriveAge(state.birthdayDate, state.unknownYear, state.recipientAge);
  return {
    recipientName: state.recipientName,
    ...(age !== undefined ? { recipientAge: age } : {}),
    ...(state.relationship ? { relationship: state.relationship } : {}),
    ...(state.detail.trim() ? { detail: state.detail.trim() } : {}),
    ...(state.senderName.trim() ? { senderName: state.senderName.trim() } : {}),
  };
}

/** Auto-generate chapters/questions from the form (regenerate buttons use this). */
export function autoPersonalize(state: CreateFormState): Pick<CreateFormState, 'storyChapters' | 'quizQuestions'> {
  const input = personalizeInput(state);
  return {
    storyChapters: buildStoryChapters(input),
    quizQuestions: buildQuizQuestions(input),
  };
}

/** Map the wizard form (+ resolved music track id) to a project create input. */
export function formToProjectInput(
  state: CreateFormState,
  resolvedMusicTrackId: string | undefined,
): CreateProjectInput {
  const name = state.recipientName.trim() || 'Someone Special';
  const age = deriveAge(state.birthdayDate, state.unknownYear, state.recipientAge);
  const wish = state.message.trim() || `Happy birthday, ${name}!`;
  const detail = state.detail.trim();
  const photos: CreateProjectInput['photos'] = state.photos.map((p, i) => ({
    fileName: p.fileName,
    mimeType: p.mimeType,
    sizeBytes: p.sizeBytes,
    width: p.width,
    height: p.height,
    dataUrl: p.dataUrl,
    caption: p.caption,
    sortOrder: i,
  }));
  const sceneChoices: CreateSceneChoices = {
    includeEnvelope: state.includeEnvelope,
    includeLetter: state.includeLetter,
    includeCake: state.includeCake,
    includeStorybook: state.includeStorybook,
    includeGallery: state.includeGallery,
    games: state.games,
    includeGift: state.includeGift,
    storybookChapters: state.storyChapters.length > 0 ? state.storyChapters : buildStoryChapters(personalizeInput(state)),
    quizQuestions: state.quizQuestions.length > 0 ? state.quizQuestions : buildQuizQuestions(personalizeInput(state)),
    giftTitle: state.giftTitle,
    giftMessage: state.giftMessage,
    candleCount: state.candleCount,
    enableMicrophoneBlow: state.enableMicrophoneBlow,
  };
  return {
    title: `${name}'s Birthday`,
    occasion: 'birthday',
    recipientName: name,
    ...(age !== undefined ? { recipientAge: age } : {}),
    ...(state.relationship ? { relationship: state.relationship } : {}),
    themeId: state.themeId,
    message: wish,
    ...(detail || state.senderName.trim()
      ? { customMessage: wish + (detail ? `\n\nA little thing I love: ${detail}` : '') + (state.senderName.trim() ? `\n\n— ${state.senderName.trim()}` : '') }
      : {}),
    photos,
    musicEnabled: state.musicEnabled && resolvedMusicTrackId !== undefined,
    ...(resolvedMusicTrackId !== undefined ? { musicTrackId: resolvedMusicTrackId } : {}),
    cards: [],
    scenes: buildCreateScenes(sceneChoices, photos.length),
  };
}
