/**
 * Local Demo Subscription Adapter
 * Simulates subscription management using browser localStorage.
 * NO actual payments - for demo purposes only.
 * Replace with Stripe/Paddle adapter for production.
 */

import type {
  SubscriptionService,
  SubscriptionResult,
  SubscriptionProvider,
} from './interfaces';
import type {
  SubscriptionTier,
  SubscriptionStatus,
  SubscriptionEntitlements,
  UUID,
} from '@/types';
import { FREE_ENTITLEMENTS, PREMIUM_ENTITLEMENTS, nowISO } from '@/types';
import { LocalStorage } from '@/lib/storage/LocalStorage';

const SUB_KEY = 'subscription_state';

interface SubscriptionState {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trialEndDate?: string;
  upgradedAt?: string;
  cancelledAt?: string;
}

const DEFAULT_STATE: SubscriptionState = {
  tier: 'free',
  status: 'active',
};

export class LocalSubscriptionAdapter implements SubscriptionService, SubscriptionProvider {
  async initialize(): Promise<void> {
    if (!LocalStorage.get<Record<string, SubscriptionState>>(SUB_KEY)) {
      LocalStorage.set(SUB_KEY, {});
    }
  }

  getSubscriptionService(): SubscriptionService {
    return this;
  }

  private getState(userId: UUID): SubscriptionState {
    const allStates = LocalStorage.get<Record<string, SubscriptionState>>(SUB_KEY) ?? {};
    return allStates[userId] ?? { ...DEFAULT_STATE };
  }

  private setState(userId: UUID, state: SubscriptionState): boolean {
    const allStates = LocalStorage.get<Record<string, SubscriptionState>>(SUB_KEY) ?? {};
    allStates[userId] = state;
    return LocalStorage.set(SUB_KEY, allStates);
  }

  async getTier(userId: UUID): Promise<SubscriptionResult<SubscriptionTier>> {
    return { success: true, data: this.getState(userId).tier };
  }

  async getStatus(userId: UUID): Promise<SubscriptionResult<SubscriptionStatus>> {
    return { success: true, data: this.getState(userId).status };
  }

  async getEntitlements(userId: UUID): Promise<SubscriptionResult<SubscriptionEntitlements>> {
    const { tier } = this.getState(userId);
    return {
      success: true,
      data: tier === 'premium' ? PREMIUM_ENTITLEMENTS : FREE_ENTITLEMENTS,
    };
  }

  async canAccess(userId: UUID, feature: keyof SubscriptionEntitlements): Promise<SubscriptionResult<boolean>> {
    const entitlements = await this.getEntitlements(userId);
    if (!entitlements.success || !entitlements.data) {
      return { success: false, error: { code: 'ENTITLEMENT_CHECK_FAILED', message: 'Failed to check entitlements' } };
    }
    const value = entitlements.data[feature];
    return { success: true, data: value === -1 || value === true || (typeof value === 'number' && value > 0) };
  }

  async upgradeToPremium(userId: UUID): Promise<SubscriptionResult<SubscriptionTier>> {
    const state = this.getState(userId);
    state.tier = 'premium';
    state.status = 'active';
    state.upgradedAt = nowISO();
    delete state.cancelledAt;

    if (!this.setState(userId, state)) {
      return { success: false, error: { code: 'UPGRADE_FAILED', message: 'Failed to save subscription state' } };
    }
    return { success: true, data: 'premium' };
  }

  async downgradeToFree(userId: UUID): Promise<SubscriptionResult<SubscriptionTier>> {
    const state = this.getState(userId);
    state.tier = 'free';
    state.status = 'active';

    if (!this.setState(userId, state)) {
      return { success: false, error: { code: 'DOWNGRADE_FAILED', message: 'Failed to save subscription state' } };
    }
    return { success: true, data: 'free' };
  }

  async isEligibleForTrial(userId: UUID): Promise<SubscriptionResult<boolean>> {
    const state = this.getState(userId);
    return { success: true, data: state.tier === 'free' && !state.trialEndDate };
  }

  async startTrial(userId: UUID, trialDays: number): Promise<SubscriptionResult<SubscriptionTier>> {
    const state = this.getState(userId);
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + trialDays);

    state.tier = 'premium';
    state.status = 'trialing';
    state.trialEndDate = trialEnd.toISOString();
    state.upgradedAt = nowISO();

    if (!this.setState(userId, state)) {
      return { success: false, error: { code: 'TRIAL_FAILED', message: 'Failed to start trial' } };
    }
    return { success: true, data: 'premium' };
  }

  async cancel(userId: UUID): Promise<SubscriptionResult<SubscriptionStatus>> {
    const state = this.getState(userId);
    state.status = 'cancelled';
    state.cancelledAt = nowISO();

    if (!this.setState(userId, state)) {
      return { success: false, error: { code: 'CANCEL_FAILED', message: 'Failed to cancel subscription' } };
    }
    return { success: true, data: 'cancelled' };
  }

  async reactivate(userId: UUID): Promise<SubscriptionResult<SubscriptionStatus>> {
    const state = this.getState(userId);
    state.status = 'active';
    delete state.cancelledAt;

    if (!this.setState(userId, state)) {
      return { success: false, error: { code: 'REACTIVATE_FAILED', message: 'Failed to reactivate subscription' } };
    }
    return { success: true, data: 'active' };
  }
}