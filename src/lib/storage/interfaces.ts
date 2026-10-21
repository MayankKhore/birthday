/**
 * Project Storage Service Interface
 * Implementations can be swapped for Firebase, Supabase, etc.
 */

import type {
  BirthdayProject,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectListItem,
  UUID,
  SubscriptionEntitlements,
} from '@/types';

export interface ProjectService {
  /** Create a new birthday project */
  create(input: CreateProjectInput, userId: UUID | null): Promise<ServiceResult<BirthdayProject>>;

  /** Get a project by ID */
  getById(id: UUID): Promise<ServiceResult<BirthdayProject | null>>;

  /** Get a project by slug (for public share pages) */
  getBySlug(slug: string): Promise<ServiceResult<BirthdayProject | null>>;

  /** Update an existing project */
  update(input: UpdateProjectInput): Promise<ServiceResult<BirthdayProject>>;

  /** Delete a project */
  delete(id: UUID): Promise<ServiceResult<void>>;

  /** List projects for a user */
  listByUser(userId: UUID, options?: ListOptions): Promise<ServiceResult<PaginatedResult<ProjectListItem>>>;

  /** List published projects (for discovery) */
  listPublished(options?: ListOptions): Promise<ServiceResult<PaginatedResult<ProjectListItem>>>;

  /** Publish a project (generate slug, make public) */
  publish(id: UUID): Promise<ServiceResult<BirthdayProject>>;

  /** Unpublish a project */
  unpublish(id: UUID): Promise<ServiceResult<BirthdayProject>>;

  /** Duplicate a project */
  duplicate(id: UUID, userId: UUID): Promise<ServiceResult<BirthdayProject>>;

  /** Increment view count */
  incrementViews(id: UUID): Promise<ServiceResult<number>>;

  /** Check if user can create more projects (entitlement check) */
  canCreateProject(userId: UUID | null, entitlements: SubscriptionEntitlements): Promise<ServiceResult<boolean>>;

  /** Get project count for user */
  getProjectCount(userId: UUID): Promise<ServiceResult<number>>;
}

export interface ListOptions {
  page?: number;
  pageSize?: number;
  status?: BirthdayProject['status'];
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ProjectProvider {
  initialize(): Promise<void>;
  getProjectService(): ProjectService;
}