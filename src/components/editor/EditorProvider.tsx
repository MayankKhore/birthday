/**
 * EditorProvider - Stage 6 birthday microsite builder state.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { CreateProjectInput, Theme, UUID } from '@/types';
import { createUUID } from '@/types';
import { LocalStorage } from '@/lib/storage/LocalStorage';
import { THEME_REGISTRY, DEMO_ENTITLEMENTS } from '@/lib/themes';
import { getThemeById } from '@/lib/themes';
import type { CardConfig, SceneConfig } from '@/lib/experience/types';

export type EditorStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface EditorPhoto {
  id: UUID;
  file: File | null;
  previewUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  altText: string;
  caption: string;
  sortOrder: number;
  isNew: boolean;
}

export interface EditorState {
  currentStep: EditorStep;
  project: Partial<CreateProjectInput>;
  photos: EditorPhoto[];
  cards: CardConfig[];
  scenes: SceneConfig[];
  validationErrors: Record<string, string>;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  theme: Theme | undefined;
  // Music settings
  musicEnabled: boolean;
  musicTrackId: string | undefined;
  soundEffectsEnabled: boolean;
  // Advanced settings
  confettiEnabled: boolean;
  reducedMotion: boolean;
  allowComments: boolean;
  passwordProtected: boolean;
  password: string | undefined;
  scheduledDelivery: boolean;
  deliveryDate: string | undefined;
}

interface EditorContextValue extends EditorState {
  goToStep: (step: EditorStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  updateField: (field: keyof CreateProjectInput, value: unknown) => void;
  addPhoto: (photo: Omit<EditorPhoto, 'id' | 'sortOrder' | 'isNew'>) => void;
  removePhoto: (id: UUID) => void;
  updatePhoto: (id: UUID, updates: Partial<EditorPhoto>) => void;
  reorderPhotos: (ids: UUID[]) => void;
  setCards: (cards: CardConfig[]) => void;
  addCard: (card: Omit<CardConfig, 'id'>) => void;
  removeCard: (id: UUID) => void;
  updateCard: (id: UUID, updates: Partial<CardConfig>) => void;
  reorderCards: (ids: UUID[]) => void;
  setScenes: (scenes: SceneConfig[]) => void;
  addScene: (scene: Omit<SceneConfig, 'id'>) => void;
  removeScene: (id: UUID) => void;
  updateScene: (id: UUID, updates: Partial<SceneConfig>) => void;
  reorderScenes: (ids: UUID[]) => void;
  setValidationError: (field: string, message: string) => void;
  clearValidationError: (field: string) => void;
  setSaving: (saving: boolean) => void;
  setPublishing: (publishing: boolean) => void;
  resetDraft: () => void;
  saveDraft: () => Promise<void>;
  loadDraft: () => void;
  buildProjectInput: () => CreateProjectInput | null;
  // Music setters
  setMusicEnabled: (enabled: boolean) => void;
  setMusicTrackId: (id: string | undefined) => void;
  setSoundEffectsEnabled: (enabled: boolean) => void;
  // Advanced settings setters
  setConfettiEnabled: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setAllowComments: (enabled: boolean) => void;
  setPasswordProtected: (enabled: boolean) => void;
  setPassword: (password: string | undefined) => void;
  setScheduledDelivery: (enabled: boolean) => void;
  setDeliveryDate: (date: string | undefined) => void;
}

const DEFAULT_STATE: EditorState = {
  currentStep: 1,
  project: {},
  photos: [],
  cards: [],
  scenes: [],
  validationErrors: {},
  isDirty: false,
  isSaving: false,
  isPublishing: false,
  theme: undefined,
  // Music settings
  musicEnabled: false,
  musicTrackId: undefined,
  soundEffectsEnabled: true,
  // Advanced settings
  confettiEnabled: true,
  reducedMotion: false,
  allowComments: false,
  passwordProtected: false,
  password: undefined,
  scheduledDelivery: false,
  deliveryDate: undefined,
};

const DRAFT_KEY = 'bp_editor_draft';
const EditorContext = createContext<EditorContextValue | null>(null);
const MAX_PHOTOS = DEMO_ENTITLEMENTS.maxPhotosPerProject;

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EditorState>(DEFAULT_STATE);
  const dirtyRef = useRef(false);

  useEffect(() => {
    const first = THEME_REGISTRY[0];
    const defaultTheme = getThemeById(first ? first.id : 'starlit');
    setState((s) => (s.theme ? s : { ...s, theme: defaultTheme }));
  }, []);

  useEffect(() => {
    if (!dirtyRef.current) return;
    const draft = {
      currentStep: state.currentStep,
      project: state.project,
      photos: state.photos.map((p) => ({ ...p, file: undefined })),
      cards: state.cards,
      scenes: state.scenes,
    };
    LocalStorage.set(DRAFT_KEY, draft);
  }, [state]);

  const mutate = useCallback(
    (updater: Partial<EditorState> | ((prev: EditorState) => EditorState)) => {
      setState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
        dirtyRef.current = true;
        return next;
      });
    },
    [],
  );

  const goToStep = useCallback((step: EditorStep) => { mutate({ currentStep: step }); }, [mutate]);

  const nextStep = useCallback(() => {
    mutate((prev) => ({
      ...prev,
      currentStep: (prev.currentStep >= 6 ? 6 : prev.currentStep + 1) as EditorStep,
    }));
  }, [mutate]);

  const prevStep = useCallback(() => {
    mutate((prev) => ({
      ...prev,
      currentStep: (prev.currentStep <= 1 ? 1 : prev.currentStep - 1) as EditorStep,
    }));
  }, [mutate]);

  const updateField = useCallback((field: keyof CreateProjectInput, value: unknown) => {
    mutate((prev) => ({
      ...prev,
      project: { ...prev.project, [field]: value },
      validationErrors: { ...prev.validationErrors, [field]: '' },
    }));
  }, [mutate]);

  const clearValidationError = useCallback((field: string) => {
    mutate((prev) => {
      const next = { ...prev.validationErrors };
      delete next[field];
      return { ...prev, validationErrors: next };
    });
  }, [mutate]);

  const addPhoto = useCallback((photo: Omit<EditorPhoto, 'id' | 'sortOrder' | 'isNew'>) => {
    mutate((prev) => {
      if (prev.photos.length >= MAX_PHOTOS) return prev;
      const id = createUUID() as UUID;
      const next: EditorPhoto = { ...photo, id, sortOrder: prev.photos.length, isNew: true };
      return { ...prev, photos: [...prev.photos, next] };
    });
  }, [mutate]);

  const removePhoto = useCallback((id: UUID) => {
    mutate((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== id).map((p, idx) => ({ ...p, sortOrder: idx })),
    }));
  }, [mutate]);

  const updatePhoto = useCallback((id: UUID, updates: Partial<EditorPhoto>) => {
    mutate((prev) => ({
      ...prev,
      photos: prev.photos.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, [mutate]);

  const reorderPhotos = useCallback((ids: UUID[]) => {
    mutate((prev) => {
      const byId = new Map(prev.photos.map((p) => [p.id, p]));
      const ordered: EditorPhoto[] = [];
      ids.forEach((id) => {
        const found = byId.get(id);
        if (found) ordered.push(found);
      });
      return { ...prev, photos: ordered.map((p, idx) => ({ ...p, sortOrder: idx })) };
    });
  }, [mutate]);

  const setValidationError = useCallback((field: string, message: string) => {
    mutate((prev) => ({ ...prev, validationErrors: { ...prev.validationErrors, [field]: message } }));
  }, [mutate]);

  const setSaving = useCallback((s: boolean) => { mutate({ isSaving: s }); }, [mutate]);
  const setPublishing = useCallback((p: boolean) => { mutate({ isPublishing: p }); }, [mutate]);

  const resetDraft = useCallback(() => {
    setState(DEFAULT_STATE);
    dirtyRef.current = false;
    LocalStorage.remove(DRAFT_KEY);
  }, []);

  const saveDraft = useCallback(async () => {
    mutate({ isSaving: true });
    try {
      const draft = {
        currentStep: state.currentStep,
        project: state.project,
        photos: state.photos.map((p) => ({ ...p, file: undefined })),
        cards: state.cards,
        scenes: state.scenes,
      };
      LocalStorage.set(DRAFT_KEY, draft);
    } finally {
      mutate({ isSaving: false });
      dirtyRef.current = false;
    }
  }, [state, mutate]);

  const loadDraft = useCallback(() => {
    const draft = LocalStorage.get<{
      currentStep: EditorStep;
      project: Partial<CreateProjectInput>;
      photos: Array<Omit<EditorPhoto, 'file'>>;
      cards: CardConfig[];
      scenes: SceneConfig[];
    }>(DRAFT_KEY);
    if (!draft) return;
    setState((prev) => ({
      ...prev,
      currentStep: draft.currentStep,
      project: draft.project,
      photos: (draft.photos ?? []).map((p, idx) => ({
        ...p,
        id: p.id ?? (createUUID() as UUID),
        sortOrder: idx,
        isNew: false,
        file: null,
        previewUrl: p.previewUrl ?? '',
      })),
      cards: (draft.cards ?? []).map((c, idx) => ({
        ...c,
        id: c.id ?? (createUUID() as UUID),
        sortOrder: c.sortOrder ?? idx,
      })),
      scenes: (draft.scenes ?? []).map((s, idx) => ({
        ...s,
        id: s.id ?? (createUUID() as UUID),
        sortOrder: s.sortOrder ?? idx,
      })),
    }));
    dirtyRef.current = true;
  }, []);

  const canGoNext = (() => {
    const { currentStep, project } = state;
    switch (currentStep) {
      case 1: return !!project.occasion && !!project.recipientName;
      case 2: return !!project.message;
      case 3: return !!project.themeId && !!getThemeById(project.themeId ?? '');
      case 4: return true;
      case 5: return true;
      case 6: return true; // Music settings - optional
      case 7: return true; // Advanced settings - optional
      default: return false;
    }
  })();

  const setCards = useCallback((cards: CardConfig[]) => {
    mutate({ cards });
  }, [mutate]);

  const addCard = useCallback((card: Omit<CardConfig, 'id'>) => {
    mutate((prev) => ({
      ...prev,
      cards: [...prev.cards, { ...card, id: createUUID() as UUID, sortOrder: Date.now() }],
    }));
  }, [mutate]);

  const removeCard = useCallback((id: UUID) => {
    mutate((prev) => ({
      ...prev,
      cards: prev.cards.filter((c) => c.id !== id),
    }));
  }, [mutate]);

  const updateCard = useCallback((id: UUID, updates: Partial<CardConfig>) => {
    mutate((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, [mutate]);

  const reorderCards = useCallback((ids: UUID[]) => {
    mutate((prev) => {
      const idSet = new Set(ids);
      const ordered = ids.map((id) => prev.cards.find((c) => c.id === id)).filter(Boolean) as CardConfig[];
      const rest = prev.cards.filter((c) => !idSet.has(c.id));
      return { ...prev, cards: [...ordered, ...rest] };
    });
  }, [mutate]);

  const setScenes = useCallback((scenes: SceneConfig[]) => {
    mutate({ scenes });
  }, [mutate]);

  const addScene = useCallback((scene: Omit<SceneConfig, 'id'>) => {
    mutate((prev) => ({
      ...prev,
      scenes: [...prev.scenes, { ...scene, id: createUUID() as UUID, sortOrder: Date.now() }],
    }));
  }, [mutate]);

  const removeScene = useCallback((id: UUID) => {
    mutate((prev) => ({
      ...prev,
      scenes: prev.scenes.filter((s) => s.id !== id),
    }));
  }, [mutate]);

  const updateScene = useCallback((id: UUID, updates: Partial<SceneConfig>) => {
    mutate((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, [mutate]);

  const reorderScenes = useCallback((ids: UUID[]) => {
    mutate((prev) => {
      const idSet = new Set(ids);
      const ordered = ids.map((id) => prev.scenes.find((s) => s.id === id)).filter(Boolean) as SceneConfig[];
      const rest = prev.scenes.filter((s) => !idSet.has(s.id));
      return { ...prev, scenes: [...ordered, ...rest] };
    });
  }, [mutate]);

  const buildProjectInput = useCallback((): CreateProjectInput | null => {
    const { project, photos } = state;
    if (!project.recipientName || !project.occasion || !project.themeId || !project.message) return null;
    return {
      title: (project.title ?? project.recipientName + "'s Birthday") as string,
      occasion: project.occasion as 'birthday',
      recipientName: project.recipientName as string,
      ...(project.recipientAge !== undefined ? { recipientAge: project.recipientAge } : {}),
      ...(project.relationship ? { relationship: project.relationship } : {}),
      themeId: project.themeId as string,
      message: project.message as string,
      ...(project.customMessage ? { customMessage: project.customMessage } : {}),
      photos: photos.map((p) => ({
        fileName: p.fileName,
        mimeType: p.mimeType,
        sizeBytes: p.sizeBytes,
        width: p.width,
        height: p.height,
        dataUrl: p.previewUrl,
        sortOrder: p.sortOrder,
        ...(p.altText ? { altText: p.altText } : {}),
        ...(p.caption ? { caption: p.caption } : {}),
      })),
      musicEnabled: !!project.musicEnabled,
      ...(project.musicTrackId ? { musicTrackId: project.musicTrackId } : {}),
      ...(state.cards.length > 0 ? { cards: state.cards } : {}),
      ...(state.scenes.length > 0 ? { scenes: state.scenes } : {}),
    };
  }, [state.project, state.photos, state.cards, state.scenes]);

  // Music setters
  const setMusicEnabled = useCallback((enabled: boolean) => { mutate({ musicEnabled: enabled }); }, [mutate]);
  const setMusicTrackId = useCallback((id: string | undefined) => { mutate({ musicTrackId: id }); }, [mutate]);
  const setSoundEffectsEnabled = useCallback((enabled: boolean) => { mutate({ soundEffectsEnabled: enabled }); }, [mutate]);
  
  // Advanced settings setters
  const setConfettiEnabled = useCallback((enabled: boolean) => { mutate({ confettiEnabled: enabled }); }, [mutate]);
  const setReducedMotion = useCallback((enabled: boolean) => { mutate({ reducedMotion: enabled }); }, [mutate]);
  const setAllowComments = useCallback((enabled: boolean) => { mutate({ allowComments: enabled }); }, [mutate]);
  const setPasswordProtected = useCallback((enabled: boolean) => { mutate({ passwordProtected: enabled }); }, [mutate]);
  const setPassword = useCallback((password: string | undefined) => { mutate({ password }); }, [mutate]);
  const setScheduledDelivery = useCallback((enabled: boolean) => { mutate({ scheduledDelivery: enabled }); }, [mutate]);
  const setDeliveryDate = useCallback((date: string | undefined) => { mutate({ deliveryDate: date }); }, [mutate]);

  const value: EditorContextValue = {
    ...state, goToStep, nextStep, prevStep, canGoNext, updateField,
    addPhoto, removePhoto, updatePhoto, reorderPhotos,
    setValidationError, clearValidationError, setSaving, setPublishing,
    resetDraft, saveDraft, loadDraft, buildProjectInput,
    setCards, addCard, removeCard, updateCard, reorderCards,
    setScenes, addScene, removeScene, updateScene, reorderScenes,
    // Music setters
    setMusicEnabled, setMusicTrackId, setSoundEffectsEnabled,
    // Advanced settings setters
    setConfettiEnabled, setReducedMotion, setAllowComments, setPasswordProtected, setPassword, setScheduledDelivery, setDeliveryDate,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within an EditorProvider');
  return ctx;
}
