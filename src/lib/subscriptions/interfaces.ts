/**
 * Subscription & Entitlements Service Interface
 * Implementations can be swapped for Stripe, Paddle, etc.
 */

import type { SubscriptionTier, SubscriptionStatus, SubscriptionEntitlements, UUID } from '@/types';

export interface SubscriptionService {
  /** Get current subscription tier for a user */
  getTier(userId: UUID): Promise<SubscriptionResult<SubscriptionTier>>;

  /** Get subscription status for a user */
  getStatus(userId: UUID): Promise<SubscriptionResult<SubscriptionStatus>>;

  /** Get entitlements for a user's tier */
  getEntitlements(userId: UUID): Promise<SubscriptionResult<SubscriptionEntitlements>>;

  /** Check if user can access a specific feature */
  canAccess(userId: UUID, feature: keyof SubscriptionEntitlements): Promise<SubscriptionResult<boolean>>;

  /** Simulate upgrade to premium (demo - no actual payment) */
  upgradeToPremium(userId: UUID): Promise<SubscriptionResult<SubscriptionTier>>;

  /** Simulate downgrade to free */
  downgradeToFree(userId: UUID): Promise<SubscriptionResult<SubscriptionTier>>;

  /** Check if user is eligible for a trial */
  isEligibleForTrial(userId: UUID): Promise<SubscriptionResult<boolean>>;

  /** Start trial (demo) */
  startTrial(userId: UUID, trialDays: number): Promise<SubscriptionResult<SubscriptionTier>>;

  /** Cancel subscription */
  cancel(userId: UUID): Promise<SubscriptionResult<SubscriptionStatus>>;

  /** Reactivate subscription */
  reactivate(userId: UUID): Promise<SubscriptionResult<SubscriptionStatus>>;
}

export interface SubscriptionResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface SubscriptionProvider {
  initialize(): Promise<void>;
  getSubscriptionService(): SubscriptionService;
}

export interface PlanComparison {
  tier: SubscriptionTier;
  name: string;
  price: string;
  priceNote: string;
  features: PlanFeature[];
  cta: string;
  highlight: boolean;
}

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}