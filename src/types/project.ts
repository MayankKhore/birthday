/**
 * Birthday Project Types
 */

import type { UUID, ISODateString } from './core';
import type { CardConfig, SceneConfig } from '@/lib/experience/types';

export type ProjectStatus = 'draft' | 'published' | 'archived';
export type OccasionType = 'birthday' | 'anniversary' | 'graduation' | 'custom';

export interface BirthdayProject {
  id: UUID;
  userId: UUID | null;
  slug: string;
  title: string;
  occasion: OccasionType;
  recipientName: string;
  recipientAge?: number;
  relationship?: string;
  themeId: string;
  message: string;
  customMessage?: string;
  photos: ProjectPhoto[];
  musicEnabled: boolean;
  musicTrackId?: string;
  cards?: CardConfig[];
  scenes?: SceneConfig[];
  status: ProjectStatus;
  publishedAt?: ISODateString;
  viewCount: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ProjectPhoto {
  id: UUID;
  projectId: UUID;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  dataUrl: string;
  altText?: string;
  caption?: string;
  sortOrder: number;
  createdAt: ISODateString;
}

export interface CreateProjectInput {
  title: string;
  occasion: OccasionType;
  recipientName: string;
  recipientAge?: number;
  relationship?: string;
  themeId: string;
  message: string;
  customMessage?: string;
  photos: Omit<ProjectPhoto, 'id' | 'projectId' | 'createdAt'>[];
  musicEnabled: boolean;
  musicTrackId?: string;
  cards?: CardConfig[];
  scenes?: SceneConfig[];
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  id: UUID;
}

export interface ProjectListItem {
  id: UUID;
  title: string;
  recipientName: string;
  themeId: string;
  status: ProjectStatus;
  photoCount: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  slug?: string;
}

/* ============================================================
 * Stage 9 — Preview & Sharing types
 * ============================================================ */

/**
 * A three-state distinction that the UI must always make clear:
 *
 * 1. `draft`       — saved local draft in this browser only.
 * 2. `local-preview` — resolvable preview URL in this browser (localStorage).
 * 3. `published`   — a published page. In this static prototype the data still
 *                    lives in the browser; a real deployment would host it.
 */
export type ShareVisibility = 'draft' | 'local-preview' | 'published';

export interface ProjectShareInfo {
  projectId: UUID;
  visibility: ShareVisibility;
  /** Absolute URL of the local preview, resolvable in this browser. */
  previewUrl: string;
  /**
   * Absolute URL of the share page. Only meaningful when published; in this
   * static prototype it still resolves only in the browser where the project
   * is stored.
   */
  shareUrl?: string;
  /** Public slug used on the share route. */
  slug: string;
  publishedAt?: ISODateString;
  /**
   * Reserved for a future backend: the stable public URL will not change when
   * the project is edited after publication.
   */
  publicUrlStable?: boolean;
  /**
   * Reserved for a future backend: whether a recipient password protects the
   * published page. Client-side prompts are NOT secure; this flag exists so the
   * data model is ready when a real server enforces it.
   */
  passwordProtected?: boolean;
  /**
   * Reserved for a future backend: private (unlisted) share links with
   * unguessable tokens.
   */
  privateLinkToken?: string;
}