/**
 * Safe LocalStorage Wrapper
 * Handles unavailable storage, corrupted data, and quota errors gracefully.
 * IMPORTANT: localStorage is convenience storage, NOT a secure database.
 * Never store sensitive data (passwords, tokens, PII) here.
 */

export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function safeJSONParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export class LocalStorage {
  private static readonly DEFAULT_NAMESPACE = 'bp';

  static get<T>(key: string, namespace = LocalStorage.DEFAULT_NAMESPACE): T | null {
    if (!isStorageAvailable()) return null;
    try {
      const raw = window.localStorage.getItem(`${namespace}_${key}`);
      return safeJSONParse<T>(raw);
    } catch (error) {
      if (error instanceof Error && error.name === 'SecurityError') {
        console.warn('localStorage access denied');
        return null;
      }
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  static set<T>(key: string, value: T, namespace = LocalStorage.DEFAULT_NAMESPACE): boolean {
    if (!isStorageAvailable()) return false;
    try {
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(`${namespace}_${key}`, serialized);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded');
        // Attempt to free space by clearing old drafts
        LocalStorage.clearDrafts();
        try {
          const serialized = JSON.stringify(value);
          window.localStorage.setItem(`${namespace}_${key}`, serialized);
          return true;
        } catch {
          return false;
        }
      }
      if (error instanceof Error && error.name === 'SecurityError') {
        console.warn('localStorage access denied');
        return false;
      }
      console.warn('Failed to write to localStorage:', error);
      return false;
    }
  }

  static remove(key: string, namespace = LocalStorage.DEFAULT_NAMESPACE): void {
    if (!isStorageAvailable()) return;
    try {
      window.localStorage.removeItem(`${namespace}_${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  static clear(namespace = LocalStorage.DEFAULT_NAMESPACE): void {
    if (!isStorageAvailable()) return;
    try {
      const prefix = `${namespace}_`;
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  static clearDrafts(namespace = LocalStorage.DEFAULT_NAMESPACE): void {
    if (!isStorageAvailable()) return;
    try {
      const prefix = `${namespace}_draft_`;
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear drafts:', error);
    }
  }

  static getStorageUsage(namespace = LocalStorage.DEFAULT_NAMESPACE): {
    usedBytes: number;
    quotaBytes: number;
    percentageUsed: number;
  } {
    if (!isStorageAvailable()) {
      return { usedBytes: 0, quotaBytes: 0, percentageUsed: 0 };
    }
    try {
      let usedBytes = 0;
      const prefix = `${namespace}_`;
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const value = window.localStorage.getItem(key);
          if (value) {
            usedBytes += key.length + value.length;
          }
        }
      }
      // localStorage typically has a ~5MB limit
      const quotaBytes = 5 * 1024 * 1024;
      const percentageUsed = Math.round((usedBytes / quotaBytes) * 100);
      return { usedBytes, quotaBytes, percentageUsed };
    } catch (error) {
      console.warn('Failed to get storage usage:', error);
      return { usedBytes: 0, quotaBytes: 0, percentageUsed: 0 };
    }
  }
}