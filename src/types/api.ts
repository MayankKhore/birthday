/**
 * API Response Types
 */

import type { ISODateString } from './core';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: ISODateString;
    requestId: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ApiResponse<T>['meta'] & {
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

/* ============================================================
 * Storage Keys
 * ============================================================ */

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'bp_auth_token',
  USER_PROFILE: 'bp_user_profile',
  DRAFT_PREFIX: 'bp_draft_',
  PROJECTS_INDEX: 'bp_projects_index',
  PUBLISHED_PROJECTS: 'bp_published_projects',
  THEME_PREFERENCES: 'bp_theme_preferences',
  CONSENT: 'bp_consent',
} as const;