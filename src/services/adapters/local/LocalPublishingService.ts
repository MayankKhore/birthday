/**
 * LocalPublishingService — Stage 9 browser-local publishing adapter.
 *
 * IMPORTANT LIMITATIONS (documented on purpose):
 *
 * This adapter stores everything in `localStorage`. A "published" page in this
 * prototype is NOT publicly accessible — it resolves only in the same browser
 * and profile where it was created. There is no server, so:
 *
 *  - Share URLs are local-preview URLs, not live public links.
 *  - QR codes generated from them only work on devices that have the same
 *    localStorage data.
 *  - There is no real authentication, authorization, or password enforcement.
 *    Any client-side password prompt would be cosmetic, not security.
 *  - Private-link tokens and stable public URLs are represented in the data
 *    model but cannot be enforced without a backend.
 *
 * Replace this adapter with a real PublishingService implementation (e.g.
 * backed by Supabase, Firebase, or a custom API) to make pages genuinely
 * public.
 */

import type { BirthdayProject, ProjectShareInfo, UUID } from '@/types';
import type { PublishingService, PublishResult, UnpublishResult } from '@/services/interfaces/publishing';
import { LocalProjectAdapter } from '@/lib/storage/LocalProjectAdapter';
import { nowISO } from '@/types';
import { previewUrl, shareUrl } from '@/utils/routes';

export class LocalPublishingService implements PublishingService {
  private adapter: LocalProjectAdapter;

  constructor() {
    this.adapter = new LocalProjectAdapter();
  }

  async publish(projectId: UUID): Promise<PublishResult> {
    const project = await this.adapter.getById(projectId);
    if (!project.success || !project.data) {
      return { success: false, error: project.error ?? { code: 'NOT_FOUND', message: 'Project not found' } };
    }
    const done = await this.adapter.publish(projectId);
    if (!done.success || !done.data) {
      return { success: false, error: done.error ?? { code: 'PUBLISH_FAILED', message: 'Could not publish' } };
    }
    const shareInfo = await this.getShareInfo(projectId);
    return { success: true, ...(shareInfo ? { shareInfo } : {}) };
  }

  async unpublish(projectId: UUID): Promise<UnpublishResult> {
    const done = await this.adapter.unpublish(projectId);
    if (!done.success) {
      return { success: false, ...(done.error ? { error: done.error } : {}) };
    }
    return { success: true };
  }

  async getShareInfo(projectId: UUID): Promise<ProjectShareInfo | null> {
    const project = await this.adapter.getById(projectId);
    if (!project.success || !project.data) return null;
    return this.buildShareInfo(project.data);
  }

  async getBySlug(slug: string): Promise<BirthdayProject | null> {
    const result = await this.adapter.getBySlug(slug);
    return result.success && result.data ? result.data : null;
  }

  private buildShareInfo(project: BirthdayProject): ProjectShareInfo {
    const published = project.status === 'published';
    return {
      projectId: project.id,
      visibility: published ? 'published' : 'draft',
      previewUrl: previewUrl(project.id),
      ...(published ? { shareUrl: shareUrl(project.slug) } : {}),
      slug: project.slug,
      ...(project.publishedAt ? { publishedAt: project.publishedAt } : {}),
      // Reserved for a future backend. Not enforced client-side.
      publicUrlStable: true,
      passwordProtected: false,
    };
  }

  /** Stamp helper used when a project is re-published after editing. */
  static touchPublishedAt(): string {
    return nowISO();
  }
}
