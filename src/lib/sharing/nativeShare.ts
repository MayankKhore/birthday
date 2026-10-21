/**
 * nativeShare — Stage 9 Web Share API wrapper with copy-link fallback.
 *
 * Uses `navigator.share` when available (mobile Safari, Chrome Android, etc.)
 * and otherwise reports `unavailable` so the UI can show the copy-link action.
 */

export type NativeShareResult =
  | { status: 'shared' }
  | { status: 'cancelled' }
  | { status: 'unavailable' }
  | { status: 'error'; message: string };

export function isNativeShareAvailable(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export async function nativeShare(data: { title?: string; text?: string; url: string }): Promise<NativeShareResult> {
  if (!isNativeShareAvailable()) return { status: 'unavailable' };
  try {
    await navigator.share(data);
    return { status: 'shared' };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return { status: 'cancelled' };
    const msg = err instanceof Error ? err.message : 'Share failed';
    return { status: 'error', message: msg };
  }
}
