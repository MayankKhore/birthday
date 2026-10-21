import { describe, it, expect, beforeEach } from 'vitest';
import { LocalAuthAdapter } from './LocalAuthAdapter';
import type { DemoCredentials, DemoRegistration } from './interfaces';
import { LocalStorage } from '../storage/LocalStorage';
import { STORAGE_KEYS } from '@/types';

beforeEach(() => {
  LocalStorage.clear();
});

describe('LocalAuthAdapter', () => {
  let adapter: LocalAuthAdapter;

  beforeEach(() => {
    adapter = new LocalAuthAdapter();
  });

  describe('signIn', () => {
    it('should sign in with valid email and create a demo user', async () => {
      const credentials: DemoCredentials = { email: 'test@example.com' };
      const result = await adapter.signIn(credentials);

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('test@example.com');
      expect(result.data?.role).toBe('user');
      expect(result.data?.subscriptionTier).toBe('free');
      expect(result.data?.subscriptionStatus).toBe('active');
    });

    it('should return an error for invalid email', async () => {
      const result = await adapter.signIn({ email: 'invalid-email' });
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_EMAIL');
    });

    it('should sign in existing user', async () => {
      const firstResult = await adapter.signIn({ email: 'existing@example.com' });
      expect(firstResult.success).toBe(true);

      // New adapter instance reads the persisted registry — simulates a refresh
      const adapter2 = new LocalAuthAdapter();
      const secondResult = await adapter2.signIn({ email: 'existing@example.com' });

      expect(secondResult.success).toBe(true);
      expect(secondResult.data?.id).toBe(firstResult.data?.id);
    });

    it('should use displayName for first-time profiles', async () => {
      const result = await adapter.signIn({ email: 'named@example.com', displayName: 'Test User' });
      expect(result.data?.displayName).toBe('Test User');
    });

    describe('signUp', () => {
    it('should sign up with valid email and displayName', async () => {
      const credentials: DemoRegistration = { email: 'newuser@example.com', displayName: 'New User' };
      const result = await adapter.signUp(credentials);

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('newuser@example.com');
      expect(result.data?.displayName).toBe('New User');
    });

    it('should return an error for invalid email in signUp', async () => {
      const credentials: DemoRegistration = { email: 'bad-email', displayName: 'Bad User' };
      const result = await adapter.signUp(credentials);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_EMAIL');
    });

    it('should return an error for duplicate email', async () => {
      const credentials: DemoRegistration = { email: 'duplicate@example.com', displayName: 'First User' };
      await adapter.signUp(credentials);

      const duplicateCredentials: DemoRegistration = { email: 'duplicate@example.com', displayName: 'Second User' };
      const result = await adapter.signUp(duplicateCredentials);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('EMAIL_EXISTS');
    });
  });

  describe('signOut', () => {
    it('should clear session and sign out', async () => {
      const credentials: DemoCredentials = { email: 'logout@example.com' };
      await adapter.signIn(credentials);

      const stateBefore = adapter.getState();
      expect(stateBefore.isAuthenticated).toBe(true);

      const result = await adapter.signOut();

      expect(result.success).toBe(true);

      const stateAfter = adapter.getState();
      expect(stateAfter.isAuthenticated).toBe(false);
      expect(stateAfter.user).toBeNull();
      expect(LocalStorage.get(STORAGE_KEYS.USER_PROFILE)).toBeNull();
    });

    it('should handle sign out when not signed in', async () => {
      const result = await adapter.signOut();
      expect(result.success).toBe(true);
      const state = adapter.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when not signed in', () => {
      const user = adapter.getCurrentUser();
      expect(user).toBeNull();
    });

    it('should return current user when signed in', async () => {
      const credentials: DemoCredentials = { email: 'currentuser@example.com' };
      await adapter.signIn(credentials);

      const user = adapter.getCurrentUser();
      expect(user).toBeDefined();
      expect(user?.email).toBe('currentuser@example.com');
    });

    it('should restore session from localStorage on initialization', () => {
      const userData = {
        id: 'test-id-123',
        email: 'persistent@example.com',
        displayName: 'Persistent User',
        role: 'user',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        subscriptionTier: 'free',
        subscriptionStatus: 'active',
      };

      LocalStorage.set(STORAGE_KEYS.USER_PROFILE, userData);

      const adapter2 = new LocalAuthAdapter();
      const user = adapter2.getCurrentUser();

      expect(user).toBeDefined();
      expect(user?.email).toBe('persistent@example.com');
      expect(user?.id).toBe('test-id-123');
    });
  });

  describe('sendPasswordReset', () => {
    it('should acknowledge password reset request for valid email', async () => {
      const result = await adapter.sendPasswordReset('reset@example.com');
      expect(result.success).toBe(true);
    });

    it('should fail for invalid email', async () => {
      const result = await adapter.sendPasswordReset('invalid-email');
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_EMAIL');
    });
  });

  describe('hasRole and hasPremiumAccess', () => {
    it('should check user role', async () => {
      const credentials: DemoCredentials = { email: 'roleuser@example.com' };
      await adapter.signIn(credentials);

      expect(adapter.hasRole('user')).toBe(true);
      expect(adapter.hasRole('admin')).toBe(false);
      expect(adapter.hasRole('guest')).toBe(false);
    });

    it('should check premium access', async () => {
      const credentials: DemoCredentials = { email: 'freeuser@example.com' };
      await adapter.signIn(credentials);

      expect(adapter.hasPremiumAccess()).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile displayName', async () => {
      const credentials: DemoCredentials = { email: 'update@example.com' };
      const signInResult = await adapter.signIn(credentials);
      const userId = signInResult.data?.id;

      expect(userId).toBeDefined();

      const result = await adapter.updateProfile(userId!, { displayName: 'Updated Name' });

      expect(result.success).toBe(true);
      expect(result.data?.displayName).toBe('Updated Name');
      expect(result.data?.email).toBe('update@example.com');
    });

    it('should prevent email changes', async () => {
      const credentials: DemoCredentials = { email: 'nochange@example.com' };
      const signInResult = await adapter.signIn(credentials);
      const userId = signInResult.data?.id;

      const result = await adapter.updateProfile(userId!, { email: 'new@example.com' });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_SUPPORTED');
    });
  });
});
});