/**
 * Local Demo Project Storage Adapter
 * Stores birthday projects in browser localStorage.
 * NOT a real database - for demo purposes only.
 * Replace with Firebase/Supabase adapter for production.
 */

import type {
  ProjectService,
  ServiceResult,
  PaginatedResult,
  ListOptions,
  ProjectProvider,
} from './interfaces';
import type {
  BirthdayProject,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectListItem,
  UUID,
  ProjectStatus,
  SubscriptionEntitlements,
} from '@/types';
import { createUUID, nowISO, STORAGE_KEYS, toISODateString } from '@/types';
import { LocalStorage } from './LocalStorage';
import { slugify } from '@/utils/slug';

export class LocalProjectAdapter implements ProjectService, ProjectProvider {
  async initialize(): Promise<void> {
    if (!LocalStorage.get(this.key(STORAGE_KEYS.PROJECTS_INDEX))) {
      LocalStorage.set(this.key(STORAGE_KEYS.PROJECTS_INDEX), []);
    }
  }

  getProjectService(): ProjectService {
    return this;
  }

  /**
   * STORAGE_KEYS values already carry the `bp_` prefix used by raw
   * localStorage access elsewhere (dashboard, auth chip), while the
   * LocalStorage helper adds its own `bp_` namespace. Strip one layer so
   * both paths resolve to the same underlying key.
   */
  private key(fullKey: string): string {
    return fullKey.startsWith('bp_') ? fullKey.slice(3) : fullKey;
  }

  private getProjects(): BirthdayProject[] {
    return LocalStorage.get<BirthdayProject[]>(this.key(STORAGE_KEYS.PROJECTS_INDEX)) ?? [];
  }

  private setProjects(projects: BirthdayProject[]): boolean {
    return LocalStorage.set(this.key(STORAGE_KEYS.PROJECTS_INDEX), projects);
  }

  async create(input: CreateProjectInput, userId: UUID | null): Promise<ServiceResult<BirthdayProject>> {
    try {
      const projects = this.getProjects();
      const now = nowISO();
      const slug = slugify(input.title);

      let finalSlug = slug;
      let counter = 1;
      while (projects.some((p) => p.slug === finalSlug)) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      const projectId = createUUID();
      const photos = input.photos.map((photo) => ({
        ...photo,
        id: createUUID(),
        projectId,
        createdAt: now,
      }));

      const project: BirthdayProject = {
        id: projectId,
        userId,
        slug: finalSlug,
        title: input.title,
        occasion: input.occasion,
        recipientName: input.recipientName,
        ...(input.recipientAge !== undefined ? { recipientAge: input.recipientAge } : {}),
        ...(input.relationship !== undefined ? { relationship: input.relationship } : {}),
        themeId: input.themeId,
        message: input.message,
        ...(input.customMessage !== undefined ? { customMessage: input.customMessage } : {}),
        photos,
        cards: input.cards ?? [],
        scenes: input.scenes ?? [],
        musicEnabled: input.musicEnabled,
        ...(input.musicTrackId !== undefined ? { musicTrackId: input.musicTrackId } : {}),
        status: 'draft',
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      projects.push(project);
      const saved = this.setProjects(projects);

      if (!saved) {
        return {
          success: false,
          error: { code: 'STORAGE_FULL', message: 'Failed to save project. Storage may be full.' },
        };
      }

      return { success: true, data: project };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to create project',
        },
      };
    }
  }

  async getById(id: UUID): Promise<ServiceResult<BirthdayProject | null>> {
    const project = this.findProject(id);
    return { success: true, data: project ?? null };
  }

  async getBySlug(slug: string): Promise<ServiceResult<BirthdayProject | null>> {
    const project = this.getProjects().find((p) => p.slug === slug);
    return { success: true, data: project ?? null };
  }

  /** Find a project by its ID. */
  private findProject(id: UUID): BirthdayProject | undefined {
    return this.getProjects().find((p) => p.id === id);
  }

  async update(input: UpdateProjectInput): Promise<ServiceResult<BirthdayProject>> {
    try {
      const projects = this.getProjects();
      const index = projects.findIndex((p) => p.id === input.id);

      if (index === -1) {
        return { success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } };
      }

      const { id, ...updates } = input;
      const current = projects[index];
      if (!current) {
        return { success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } };
      }
      // Handle status from the input (cast allows status for publish/unpublish)
      const inputWithStatus = input as UpdateProjectInput & { status?: BirthdayProject['status']; publishedAt?: string };
      // Build updated project by explicitly handling each field to satisfy exactOptionalPropertyTypes
      const updated: BirthdayProject = {
        id: current.id,
        userId: current.userId,
        slug: current.slug,
        title: updates.title ?? current.title,
        occasion: updates.occasion ?? current.occasion,
        recipientName: updates.recipientName ?? current.recipientName,
        ...(updates.recipientAge !== undefined ? { recipientAge: updates.recipientAge } : (current.recipientAge !== undefined ? { recipientAge: current.recipientAge } : {})),
        ...(updates.relationship !== undefined ? { relationship: updates.relationship } : (current.relationship !== undefined ? { relationship: current.relationship } : {})),
        themeId: updates.themeId ?? current.themeId,
        message: updates.message ?? current.message,
        ...(updates.customMessage !== undefined ? { customMessage: updates.customMessage } : (current.customMessage !== undefined ? { customMessage: current.customMessage } : {})),
        photos: updates.photos ? updates.photos.map((photo, i) => ({
          ...photo,
          id: current.photos[i]?.id ?? createUUID(),
          projectId: current.id,
          createdAt: current.photos[i]?.createdAt ?? nowISO(),
        })) : current.photos,
        musicEnabled: updates.musicEnabled ?? current.musicEnabled,
        ...(updates.musicTrackId !== undefined ? { musicTrackId: updates.musicTrackId } : (current.musicTrackId !== undefined ? { musicTrackId: current.musicTrackId } : {})),
        cards: updates.cards ?? current.cards ?? [],
        scenes: updates.scenes ?? current.scenes ?? [],
        status: inputWithStatus.status ?? current.status,
        ...(inputWithStatus.publishedAt !== undefined ? { publishedAt: toISODateString(new Date(inputWithStatus.publishedAt)) } : (current.publishedAt !== undefined ? { publishedAt: current.publishedAt } : {})),
        viewCount: current.viewCount,
        createdAt: current.createdAt,
        updatedAt: nowISO(),
      };

      projects[index] = updated;
      const saved = this.setProjects(projects);

      if (!saved) {
        return {
          success: false,
          error: { code: 'STORAGE_FULL', message: 'Failed to update project. Storage may be full.' },
        };
      }

      return { success: true, data: updated };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to update project',
        },
      };
    }
  }

  async delete(id: UUID): Promise<ServiceResult<void>> {
    const projects = this.getProjects();
    const filtered = projects.filter((p) => p.id !== id);

    if (filtered.length === projects.length) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } };
    }

    const saved = this.setProjects(filtered);
    if (!saved) {
      return { success: false, error: { code: 'DELETE_FAILED', message: 'Failed to delete project' } };
    }

    return { success: true };
  }

  async listByUser(userId: UUID, options?: ListOptions): Promise<ServiceResult<PaginatedResult<ProjectListItem>>> {
    const projects = this.getProjects().filter((p) => p.userId === userId);
    return { success: true, data: this.paginate(projects, options) };
  }

  async listPublished(options?: ListOptions): Promise<ServiceResult<PaginatedResult<ProjectListItem>>> {
    const projects = this.getProjects().filter((p) => p.status === 'published');
    return { success: true, data: this.paginate(projects, options) };
  }

  private paginate(projects: BirthdayProject[], options?: ListOptions): PaginatedResult<ProjectListItem> {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const sortBy = options?.sortBy ?? 'updatedAt';
    const sortOrder = options?.sortOrder ?? 'desc';

    let filtered = [...projects];
    if (options?.status) {
      filtered = filtered.filter((p) => p.status === options.status);
    }

    filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize).map((p) => this.toListItem(p));

    return {
      items,
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  private toListItem(project: BirthdayProject): ProjectListItem {
    return {
      id: project.id,
      title: project.title,
      recipientName: project.recipientName,
      themeId: project.themeId,
      status: project.status,
      photoCount: project.photos.length,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      slug: project.slug,
    };
  }

  async publish(id: UUID): Promise<ServiceResult<BirthdayProject>> {
    return this.update({ id, status: 'published' as ProjectStatus, publishedAt: nowISO() } as UpdateProjectInput);
  }

  async unpublish(id: UUID): Promise<ServiceResult<BirthdayProject>> {
    return this.update({ id, status: 'draft' as ProjectStatus } as UpdateProjectInput);
  }

  async duplicate(id: UUID, userId: UUID): Promise<ServiceResult<BirthdayProject>> {
    const project = this.findProject(id);
    if (!project) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } };
    }

    const input: CreateProjectInput = {
      title: `${project.title} (Copy)`,
      occasion: project.occasion,
      recipientName: project.recipientName,
      ...(project.recipientAge !== undefined ? { recipientAge: project.recipientAge } : {}),
      ...(project.relationship !== undefined ? { relationship: project.relationship } : {}),
      themeId: project.themeId,
      message: project.message,
      ...(project.customMessage !== undefined ? { customMessage: project.customMessage } : {}),
      photos: project.photos.map((photo) => ({
        fileName: photo.fileName,
        mimeType: photo.mimeType,
        sizeBytes: photo.sizeBytes,
        width: photo.width,
        height: photo.height,
        dataUrl: photo.dataUrl,
        ...(photo.altText !== undefined ? { altText: photo.altText } : {}),
        ...(photo.caption !== undefined ? { caption: photo.caption } : {}),
        sortOrder: photo.sortOrder,
      })),
      musicEnabled: project.musicEnabled,
      ...(project.musicTrackId !== undefined ? { musicTrackId: project.musicTrackId } : {}),
      ...(project.cards !== undefined ? { cards: project.cards } : {}),
    };

    return this.create(input, userId);
  }

  async incrementViews(id: UUID): Promise<ServiceResult<number>> {
    const project = this.findProject(id);
    if (!project) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } };
    }
    const result = await this.update({ id, viewCount: project.viewCount + 1 } as UpdateProjectInput);
    if (!result.success) {
      return { success: false, error: result.error ?? { code: 'UPDATE_FAILED', message: 'Failed to increment views' } };
    }
    return { success: true, data: project.viewCount + 1 };
  }

  async canCreateProject(userId: UUID | null, entitlements: SubscriptionEntitlements): Promise<ServiceResult<boolean>> {
    const count = await this.getProjectCount(userId as UUID);
    if (!count.success || count.data === undefined) {
      return { success: false, error: { code: 'COUNT_FAILED', message: 'Failed to count projects' } };
    }
    if (entitlements.maxProjects === -1) {
      return { success: true, data: true };
    }
    return { success: true, data: count.data < entitlements.maxProjects };
  }

  async getProjectCount(userId: UUID): Promise<ServiceResult<number>> {
    const count = this.getProjects().filter((p) => p.userId === userId).length;
    return { success: true, data: count };
  }
}