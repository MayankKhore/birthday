/**
 * Birthday Platform Domain Models - Core Types
 */

import type { UUID, ISODateString } from './core';

/* ============================================================
 * User & Authentication
 * ============================================================ */

export type UserRole = 'guest' | 'user' | 'premium' | 'admin';

export interface UserProfile {
  id: UUID;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/* ============================================================
 * Subscription & Entitlements
 * ============================================================ */

export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';

export interface SubscriptionEntitlements {
  maxProjects: number;
  maxPhotosPerProject: number;
  maxVideoLengthSeconds: number;
  canUsePremiumThemes: boolean;
  canRemoveBranding: boolean;
  canExportHD: boolean;
  canScheduleDelivery: boolean;
  hasPrioritySupport: boolean;
}

export const FREE_ENTITLEMENTS: SubscriptionEntitlements = {
  maxProjects: 3,
  maxPhotosPerProject: 5,
  maxVideoLengthSeconds: 0,
  canUsePremiumThemes: false,
  canRemoveBranding: false,
  canExportHD: false,
  canScheduleDelivery: false,
  hasPrioritySupport: false,
};

export const PREMIUM_ENTITLEMENTS: SubscriptionEntitlements = {
  maxProjects: -1,
  maxPhotosPerProject: 50,
  maxVideoLengthSeconds: 60,
  canUsePremiumThemes: true,
  canRemoveBranding: true,
  canExportHD: true,
  canScheduleDelivery: true,
  hasPrioritySupport: true,
};

export function getEntitlements(tier: SubscriptionTier): SubscriptionEntitlements {
  return tier === 'premium' ? PREMIUM_ENTITLEMENTS : FREE_ENTITLEMENTS;
}