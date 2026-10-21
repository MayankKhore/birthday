/**
 * Browser demo-auth client
 * Reads/writes only non-sensitive demo session state.
 * Storage may be unavailable — every helper fails safe.
 */

import type { UserProfile } from '@/types';
import { STORAGE_KEYS } from '@/types';
import { LocalStorage } from '@/lib/storage/LocalStorage';

export interface DemoSession {
  user: UserProfile | null;
  storageAvailable: boolean;
  storageNotice: string | null;
}

function isValidSessionUser(value: unknown): value is UserProfile {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
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

export function readDemoSession(): DemoSession {
  let probeOk = true;
  try {
    const key = '__bw_probe__';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
  } catch {
    probeOk = false;
  }
  const user = LocalStorage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  const valid = user && isValidSessionUser(user) ? user : null;
  if (user && !valid) {
    LocalStorage.remove(STORAGE_KEYS.USER_PROFILE);
  }
  return {
    user: valid,
    storageAvailable: probeOk,
    storageNotice: probeOk
      ? null
      : 'Browser storage is unavailable here, so demo sign-in will not persist after refresh. You can still browse and create.',
  };
}

export function clearDemoSession(): void {
  LocalStorage.remove(STORAGE_KEYS.USER_PROFILE);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateDemoEmail(raw: string): string | null {
  if (!EMAIL_RE.test(raw.trim())) {
    return 'Enter a valid email address, like you@example.com.';
  }
  return null;
}

export function initialsFor(name: string, email: string): string {
  const base = (name || '').trim() || (email || '').trim();
  if (!base) return '?';
  const parts = base.split(/\s+/).filter(Boolean);
  const first = parts[0];
  const second = parts[1];
  if (parts.length >= 2 && first && second && first.length > 0 && second.length > 0) {
    const f = first[0];
    const s = second[0];
    if (f && s) return (f + s).toUpperCase();
  }
  if (base.includes('@')) return base.slice(0, 2).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export function relativeTime(iso: string, nowMs = Date.now()): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return 'Unknown date';
  const diff = Math.max(0, nowMs - then);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return 'Just now';
  if (diff < hour) {
    const m = Math.floor(diff / minute);
    return `${m} minute${m === 1 ? '' : 's'} ago`;
  }
  if (diff < day) {
    const h = Math.floor(diff / hour);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  if (diff < 7 * day) {
    const d = Math.floor(diff / day);
    return `${d} day${d === 1 ? '' : 's'} ago`;
  }
  try {
    return new Date(then).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Unknown date';
  }
}