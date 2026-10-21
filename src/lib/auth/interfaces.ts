/**
 * Authentication Service Interface
 * Demo prototype only — no real auth, no passwords, no tokens.
 */

import type { UserProfile, UUID } from '@/types';
import type { AuthState } from '@/types/models';

export interface DemoCredentials {
  email: string;
  displayName?: string;
}

export interface DemoRegistration {
  email: string;
  displayName: string;
}

export interface AuthService {
  getState(): AuthState;
  subscribe(listener: (state: AuthState) => void): () => void;
  signIn(credentials: DemoCredentials): Promise<AuthResult<UserProfile>>;
  signUp(credentials: DemoRegistration): Promise<AuthResult<UserProfile>>;
  signOut(): Promise<AuthResult<void>>;
  getCurrentUser(): UserProfile | null;
  updateProfile(userId: UUID, updates: Partial<UserProfile>): Promise<AuthResult<UserProfile>>;
  sendPasswordReset(email: string): Promise<AuthResult<void>>;
  hasRole(role: UserProfile['role']): boolean;
  hasPremiumAccess(): boolean;
}

export interface AuthResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface AuthProvider {
  initialize(): Promise<void>;
  getAuthService(): AuthService;
}

export type { AuthState } from '@/types/models';