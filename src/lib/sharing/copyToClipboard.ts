/**
 * copyToClipboard — Stage 9 clipboard helper with graceful fallback.
 *
 * Uses the async Clipboard API when available, falls back to a hidden
 * textarea + document.execCommand, and reports failure so callers can show
 * accurate feedback (copy can fail in insecure contexts or when the user
 * denies permission).
 */

export type CopyResult = { ok: true } | { ok: false; reason: string };

export async function copyToClipboard(text: string): Promise<CopyResult> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Clipboard write failed';
      return legacyCopy(text, msg);
    }
  }
  return legacyCopy(text, 'Clipboard API unavailable');
}

function legacyCopy(text: string, firstReason: string): CopyResult {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (ok) return { ok: true };
    return { ok: false, reason: `${firstReason}; execCommand copy failed` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'execCommand copy failed';
    return { ok: false, reason: `${firstReason}; ${msg}` };
  }
}
