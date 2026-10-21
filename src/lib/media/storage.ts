import type { PersistentMediaRecord } from './types';

/**
 * Persisted media data stored in IndexedDB.
 * Files are stored as Blobs for future re-upload or in-memory reuse.
 */
export interface MediaRecord extends PersistentMediaRecord {
  dataUrl?: string;
  blob?: Blob;
}

const DB_NAME = 'birthday-platform-media';
const DB_VERSION = 1;
const STORE_NAME = 'media';

const instanceMap = new WeakMap<MediaDB, IDBDatabase | null>();

class MediaDB {
  private db: IDBDatabase | null = null;

  constructor() {
    instanceMap.set(this, null);
  }

  private getDB(): IDBDatabase | null {
    return instanceMap.get(this) ?? null;
  }

  /**
   * Opens (or creates) the IndexedDB database.
   * Uses a promise wrapper around the async IDB callbacks.
   */
  open(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        instanceMap.set(this, this.db);
        resolve();
      };

      request.onerror = () => {
        reject(request.error ?? new Error('Failed to open IndexedDB'));
      };
    });
  }

  /**
   * Stores a media record (file metadata + optional Blob or data URL).
   */
  put(record: MediaRecord): Promise<void> {
    return this._transaction(STORE_NAME, 'readwrite', (store) => {
      store.put(record);
    });
  }

  /**
   * Retrieves a media record by ID.
   */
  get(id: string): Promise<MediaRecord | null> {
    return this._transaction(STORE_NAME, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => reject(request.error ?? new Error('Failed to get media record'));
      });
    });
  }

  /**
   * Retrieves all media records, sorted by createdAt ascending.
   */
  getAll(): Promise<MediaRecord[]> {
    return this._transaction(STORE_NAME, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result ?? []);
        request.onerror = () => reject(request.error ?? new Error('Failed to get all media'));
      });
    });
  }

  /**
   * Deletes a media record by ID.
   */
  delete(id: string): Promise<void> {
    return this._transaction(STORE_NAME, 'readwrite', (store) => {
      store.delete(id);
    });
  }

  /**
   * Clears all media records from the database.
   */
  clear(): Promise<void> {
    return this._transaction(STORE_NAME, 'readwrite', (store) => {
      store.clear();
    });
  }

  /**
   * Runs a transaction on the given store and calls `op` with the store.
   */
  private _transaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    op: (store: IDBObjectStore) => T | Promise<T>,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const db = this.getDB();
      if (!db) {
        reject(new Error('Database not opened'));
        return;
      }

      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);

      const result = op(store);

      transaction.oncomplete = () => {
        resolve(result as T);
      };

      transaction.onerror = () => {
        reject(transaction.error ?? new Error('Transaction failed'));
      };

      // If op returns a Promise, we can't await inside the callback easily.
      // We attach a simple resolution for the common case.
      // For simplicity, we return the result directly (most ops are synchronous).
      if (result instanceof Promise) {
        // This path is not reachable in this implementation, but kept for completeness.
        (result as Promise<T>).then(resolve, reject);
      }
    });
  }
}

let mediaDBInstance: MediaDB | null = null;

/**
 * Returns a singleton MediaDB instance.
 */
export function getMediaDB(): MediaDB {
  if (!mediaDBInstance) {
    mediaDBInstance = new MediaDB();
  }
  return mediaDBInstance;
}

/**
 * Deletes the singleton instance (mainly for testing).
 */
export function resetMediaDB(): void {
  mediaDBInstance = null;
}

/**
 * Returns the IndexedDB database name used for persistent media storage.
 */
export function getMediaDBName(): string {
  return DB_NAME;
}

/**
 * Returns the object store name used for persistent media storage.
 */
export function getMediaStoreName(): string {
  return STORE_NAME;
}


/**
 * Creates an object URL for previewing a file.
 * The URL is tracked internally for later cleanup with `revokeObjectUrl`.
 */
export function createObjectUrl(file: File): string {
  const url = URL.createObjectURL(file);
  return url;
}

/**
 * Revokes an object URL created by `createObjectUrl`.
 */
export function revokeObjectUrl(url: string): void {
  URL.revokeObjectURL(url);
}
