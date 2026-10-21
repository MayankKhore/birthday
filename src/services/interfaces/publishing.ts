/**
 * PublishingService — Stage 9.
 *
 * Contract for turning a local birthday project into something shareable.
 *
 * This static prototype ships only a browser-local adapter
 * (`LocalPublishingService`) whose "published" pages are still stored in
 * localStorage and therefore only resolvable in the same browser. A real
 * backend (Firebase, Supabase, custom API) would implement this interface to
 * produce genuinely public URLs.
 *
 * The interface is intentionally shaped so a future backend can add:
 *  - Stable public URLs that do not change when the project is re-published.
 *  - Private (unlisted) link tokens.
 *  - Optional recipient password protection enforced server-side.
 */

import type { BirthdayProject, ProjectShareInfo, UUID } from '@/types';

export interface PublishResult {
  success: boolean;
  shareInfo?: ProjectShareInfo;
  error?: { code: string; message: string };
}

export interface UnpublishResult {
  success: boolean;
  error?: { code: string; message: string };
}

export interface PublishingService {
  /**
   * Publish a project and return its share info. Implementations must never
   * silently change the public URL of an already-published project on edit.
   */
  publish(projectId: UUID): Promise<PublishResult>;

  /** Revert a project to draft status. */
  unpublish(projectId: UUID): Promise<UnpublishResult>;

  /**
   * Resolve share info for a project. Used by the preview shell and the
   * recipient-access screen to label draft / local-preview / published state.
   */
  getShareInfo(projectId: UUID): Promise<ProjectShareInfo | null>;

  /**
   * Resolve a project by its public slug (for the /share/[slug] route).
   * Returns null when the slug does not resolve in the current storage.
   */
  getBySlug(slug: string): Promise<BirthdayProject | null>;
}