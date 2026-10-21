/**
 * Editor State Types
 */

import type { CreateProjectInput } from './project';

export type EditorStep = 1 | 2 | 3 | 4 | 5;

export interface EditorState {
  currentStep: EditorStep;
  project: Partial<CreateProjectInput>;
  validationErrors: Record<string, string>;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
}

export interface EditorStepConfig {
  step: EditorStep;
  title: string;
  description: string;
  isComplete: (state: EditorState) => boolean;
  canSkip: boolean;
}

export const EDITOR_STEPS: EditorStepConfig[] = [
  {
    step: 1,
    title: 'Basics',
    description: 'Name, occasion, and recipient details',
    isComplete: (state) =>
      !!state.project.recipientName && !!state.project.occasion,
    canSkip: false,
  },
  {
    step: 2,
    title: 'Message',
    description: 'Choose or write a birthday wish',
    isComplete: (state) => !!state.project.message,
    canSkip: false,
  },
  {
    step: 3,
    title: 'Theme',
    description: 'Pick a visual theme',
    isComplete: (state) => !!state.project.themeId,
    canSkip: false,
  },
  {
    step: 4,
    title: 'Photos',
    description: 'Add photos (optional)',
    isComplete: () => true,
    canSkip: true,
  },
  {
    step: 5,
    title: 'Preview',
    description: 'Review and publish',
    isComplete: (state) =>
      !!state.project.recipientName &&
      !!state.project.message &&
      !!state.project.themeId,
    canSkip: false,
  },
];