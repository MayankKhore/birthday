/**
 * Local Demo Authentication Adapter
 * Prototype only. Email-only demo sessions stored in localStorage.
 * No passwords are collected, stored, or transmitted.
 * Replace with Firebase/Supabase adapter for production.
 */

import type { AuthService, AuthResult, AuthState, AuthProvider } from './interfaces';
import type { UserProfile, UUID } from '@/types';
import { createUUID, nowISO, STORAGE_KEYS } from '@/types';
import { LocalStorage } from '@/lib/storage/LocalStorage';

export interface DemoSignInInput {
  email: string;
  displayName?: string;
}

export interface DemoRegisterInput {
  email: string;
  displayName: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidDemoEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export class LocalAuthAdapter implements AuthService, AuthProvider {
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  private listeners = new Set<(state: AuthState) => void>();

  constructor() {
    this.restoreSession();
  }

  async initialize(): Promise<void> {
    this.restoreSession();
  }

  getAuthService(): AuthService {
    return this;
  }

  private restoreSession(): void {
    const stored = LocalStorage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    if (stored && this.isValidUserProfile(stored)) {
      this.state = {
        user: stored,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    }
  }

  private isValidUserProfile(data: unknown): data is UserProfile {
    if (!data || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;
    return (
      typeof obj['id'] === 'string' &&
      typeof obj['email'] === 'string' &&
      typeof obj['displayName'] === 'string' &&
      typeof obj['role'] === 'string' &&
      typeof obj['createdAt'] === 'string' &&
      typeof obj['updatedAt'] === 'string' &&
      typeof obj['subscriptionTier'] === 'string' &&
      typeof obj['subscriptionStatus'] === 'string'
    );
  }

  getState(): AuthState {
    return { ...this.state };
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(update: Partial<AuthState>): void {
    this.state = { ...this.state, ...update };
    this.listeners.forEach((listener) => listener(this.state));
  }

  async signInWithEmail(input: DemoSignInInput): Promise<AuthResult<UserProfile>> {
    this.setState({ isLoading: true, error: null });
    try {
      const email = input.email.trim().toLowerCase();
      if (!isValidDemoEmail(email)) {
        const message = 'Enter a valid email address, like you@example.com.';
        this.setState({ isLoading: false, error: message });
        return { success: false, error: { code: 'INVALID_EMAIL', message } };
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
      const registry = LocalStorage.get<Record<string, UserProfile>>('bp_demo_users') ?? {};
      let user = registry[email];
      if (!user || !this.isValidUserProfile(user)) {
        const fallback = input.displayName?.trim() || email.split('@')[0] || 'Demo user';
        user = this.createDemoUser(email, fallback);
        registry[email] = user;
        LocalStorage.set('bp_demo_users', registry);
      }
      LocalStorage.set(STORAGE_KEYS.USER_PROFILE, user);
      this.setState({ user, isAuthenticated: true, isLoading: false, error: null });
      return { success: true, data: user };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Demo sign-in failed';
      this.setState({ isLoading: false, error: message });
      return { success: false, error: { code: 'SIGN_IN_FAILED', message } };
    }
  }

  async registerWithEmail(input: DemoRegisterInput): Promise<AuthResult<UserProfile>> {
    this.setState({ isLoading: true, error: null });
    try {
      const email = input.email.trim().toLowerCase();
      const displayName = input.displayName.trim();
      if (!isValidDemoEmail(email)) {
        const message = 'Enter a valid email address, like you@example.com.';
        this.setState({ isLoading: false, error: message });
        return { success: false, error: { code: 'INVALID_EMAIL', message } };
      }
      if (displayName.length < 1 || displayName.length > 50) {
        const message = 'Display name must be 1–50 characters.';
        this.setState({ isLoading: false, error: message });
        return { success: false, error: { code: 'INVALID_NAME', message } };
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
      const registry = LocalStorage.get<Record<string, UserProfile>>('bp_demo_users') ?? {};
      if (registry[email] && this.isValidUserProfile(registry[email])) {
        const message = 'This demo email is already registered. Try signing in instead.';
        this.setState({ isLoading: false, error: message });
        return { success: false, error: { code: 'EMAIL_EXISTS', message } };
      }
      const user = this.createDemoUser(email, displayName);
      registry[email] = user;
      LocalStorage.set('bp_demo_users', registry);
      LocalStorage.set(STORAGE_KEYS.USER_PROFILE, user);
      this.setState({ user, isAuthenticated: true, isLoading: false, error: null });
      return { success: true, data: user };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Demo sign-up failed';
      this.setState({ isLoading: false, error: message });
      return { success: false, error: { code: 'SIGN_UP_FAILED', message } };
    }
  }

  async signIn(credentials: { email: string; displayName?: string }): Promise<AuthResult<UserProfile>> {
    return this.signInWithEmail({
      email: credentials.email,
      ...(credentials.displayName !== undefined ? { displayName: credentials.displayName } : {}),
    });
  }

  async signUp(credentials: { email: string; displayName: string }): Promise<AuthResult<UserProfile>> {
    return this.registerWithEmail({ email: credentials.email, displayName: credentials.displayName });
  }

  private createDemoUser(email: string, displayName: string): UserProfile {
    const now = nowISO();
    return {
      id: createUUID(),
      email,
      displayName,
      role: 'user',
      createdAt: now,
      updatedAt: now,
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
    };
  }

  async signOut(): Promise<AuthResult<void>> {
    LocalStorage.remove(STORAGE_KEYS.USER_PROFILE);
    this.setState({ user: null, isAuthenticated: false, error: null });
    return { success: true };
  }

  getCurrentUser(): UserProfile | null {
    return this.state.user;
  }

  async updateProfile(userId: UUID, updates: Partial<UserProfile>): Promise<AuthResult<UserProfile>> {
    if (!this.state.user || this.state.user.id !== userId) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'Not signed in to this demo session' } };
    }
    if (updates.email !== undefined || (updates as Record<string, unknown>)['password'] !== undefined) {
      return { success: false, error: { code: 'NOT_SUPPORTED', message: 'Email and password changes are disabled in the demo' } };
    }
    const safe: Partial<UserProfile> = {};
    if (typeof updates.displayName === 'string') safe.displayName = updates.displayName.slice(0, 50);
    if (typeof updates.avatarUrl === 'string') safe.avatarUrl = updates.avatarUrl;
    const updated = { ...this.state.user, ...safe, updatedAt: nowISO() };
    LocalStorage.set(STORAGE_KEYS.USER_PROFILE, updated);
    this.setState({ user: updated });
    return { success: true, data: updated };
  }

  async sendPasswordReset(email: string): Promise<AuthResult<void>> {
    if (!isValidDemoEmail(email)) {
      return { success: false, error: { code: 'INVALID_EMAIL', message: 'Enter a valid email address first.' } };
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
    return { success: true };
  }

  hasRole(role: UserProfile['role']): boolean {
    return this.state.user?.role === role;
  }

  hasPremiumAccess(): boolean {
    return this.state.user?.subscriptionTier === 'premium';
  }
}