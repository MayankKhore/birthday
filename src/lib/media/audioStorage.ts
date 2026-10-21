/**
 * Uploaded-music storage — keeps the creator's own audio file as a Blob in
 * IndexedDB (existing MediaDB). The experience rebuilds an object URL from it.
 * No network, no server: files never leave this browser.
 */

import { getMediaDB } from './storage';

const CUSTOM_PREFIX = 'custom:';

/** musicTrackId for uploads: "custom:<mediaId>" */
export function customTrackId(mediaId: string): string {
  return CUSTOM_PREFIX + mediaId;
}

export function isCustomTrackId(trackId: string | undefined): boolean {
  return typeof trackId === 'string' && trackId.startsWith(CUSTOM_PREFIX);
}

export function customMediaId(trackId: string): string {
  return trackId.slice(CUSTOM_PREFIX.length);
}

export interface StoredAudio {
  mediaId: string;
  trackId: string;
  fileName: string;
  mimeType: string;
}

/** Validates + persists an audio File. Returns ids to store on the project. */
export async function saveUploadedAudio(file: File): Promise<StoredAudio> {
  const db = getMediaDB();
  await db.open();
  const now = new Date().toISOString();
  const mediaId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : 'audio-' + Date.now() + '-' + Math.floor(Math.random() * 1e9);
  await db.put({
    id: mediaId,
    fileName: file.name,
    mimeType: file.type || 'audio/mpeg',
    sizeBytes: file.size,
    createdAt: now,
    updatedAt: now,
    blob: file,
  });
  return { mediaId, trackId: customTrackId(mediaId), fileName: file.name, mimeType: file.type };
}

/** Rebuilds a playable object URL for a stored upload. Caller must revoke it. */
export async function loadAudioObjectUrl(trackId: string): Promise<string | null> {
  if (!isCustomTrackId(trackId)) return null;
  try {
    const db = getMediaDB();
    await db.open();
    const record = await db.get(customMediaId(trackId));
    if (record?.blob instanceof Blob && record.blob.size > 0) {
      return URL.createObjectURL(record.blob);
    }
    return null;
  } catch {
    return null;
  }
}

/** Removes a stored upload (creator deleted / replaced the track). */
export async function deleteUploadedAudio(trackId: string): Promise<void> {
  if (!isCustomTrackId(trackId)) return;
  try {
    const db = getMediaDB();
    await db.open();
    await db.delete(customMediaId(trackId));
  } catch {
    return;
  }
}

/** Looks up a stored upload's display name. */
export async function getStoredAudioName(trackId: string): Promise<string | null> {
  if (!isCustomTrackId(trackId)) return null;
  try {
    const db = getMediaDB();
    await db.open();
    const record = await db.get(customMediaId(trackId));
    return record?.fileName ?? null;
  } catch {
    return null;
  }
}
