/**
 * SharePanel — Stage 9 share actions for the preview shell.
 *
 * Clearly distinguishes the three states:
 *   1. Local draft
 *   2. Local preview (this browser only)
 *   3. Published (still browser-local in this prototype)
 *
 * Provides copy-link (with success/error feedback), a QR code dialog, and the
 * Web Share API when available with a copy-link fallback. It never claims a
 * local preview is publicly accessible and never invents fake share URLs.
 */

import { useCallback, useState } from 'react';
import type { ProjectShareInfo } from '@/types';
import { copyToClipboard } from '@/lib/sharing/copyToClipboard';
import { isNativeShareAvailable, nativeShare } from '@/lib/sharing/nativeShare';
import { describeShareStatus, visibilityBadgeClass } from '@/lib/sharing/shareStatus';
import { QRCodePanel } from './QRCodePanel';

interface Props {
  shareInfo: ProjectShareInfo | null;
  /** Project title, used as share title. */
  title?: string;
  onPublish?: () => void;
  publishing?: boolean;
}

type CopyState = 'idle' | 'copied' | 'failed';

export function SharePanel({ shareInfo, title, onPublish, publishing }: Props) {
  const status = describeShareStatus(shareInfo);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [copyError, setCopyError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Only offer the preview URL when it actually resolves in this browser.
  const linkToShare = shareInfo?.shareUrl ?? shareInfo?.previewUrl ?? null;

  const handleCopy = useCallback(async () => {
    if (!linkToShare) return;
    const result = await copyToClipboard(linkToShare);
    if (result.ok) {
      setCopyState('copied');
      setCopyError(null);
      setTimeout(() => setCopyState('idle'), 2200);
    } else {
      setCopyState('failed');
      setCopyError(result.reason);
    }
  }, [linkToShare]);

  const handleNativeShare = useCallback(async () => {
    if (!linkToShare) return;
    setShareFeedback(null);
    const result = await nativeShare({
      title: title ?? 'Birthday page',
      text: 'A birthday surprise is waiting for you.',
      url: linkToShare,
    });
    if (result.status === 'shared') setShareFeedback('Shared.');
    else if (result.status === 'cancelled') setShareFeedback('Share cancelled.');
    else if (result.status === 'unavailable') setShareFeedback('Sharing is not available here — use Copy link instead.');
    else setShareFeedback(`Share failed: ${result.message}. Use Copy link instead.`);
  }, [linkToShare, title]);

  return (
    <div className="clay-card p-6 space-y-4" aria-label="Share options">
      <div className="flex items-center gap-3 flex-wrap">
        <span className={visibilityBadgeClass(status.tone)}>{status.label}</span>
        {shareInfo?.publishedAt && (
          <span className="text-xs text-[var(--color-text-tertiary)]">
            Published {new Date(shareInfo.publishedAt).toLocaleDateString()}
          </span>
        )}
      </div>
      <p className="text-sm text-[var(--color-text-secondary)]">{status.description}</p>

      {linkToShare ? (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <input className="clay-input w-full sm:flex-1" type="text" readOnly value={linkToShare} aria-label="Preview link" onFocus={(e) => e.target.select()} />
            <button type="button" className="clay-btn clay-btn-secondary" onClick={() => void handleCopy()} aria-live="polite">
              {copyState === 'copied' ? '✓ Copied' : copyState === 'failed' ? 'Copy failed' : 'Copy link'}
            </button>
          </div>
          {copyState === 'copied' && (
            <p className="text-xs text-[var(--color-mint)]" role="status">
              Link copied to clipboard.
            </p>
          )}
          {copyState === 'failed' && copyError && (
            <p className="text-xs text-[var(--color-error-dark)]" role="alert">
              Could not copy automatically ({copyError}). Select the link above and copy it manually.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {isNativeShareAvailable() && (
              <button type="button" className="clay-btn clay-btn-ghost clay-btn-sm" onClick={() => void handleNativeShare()}>
                Share…
              </button>
            )}
            <button type="button" className="clay-btn clay-btn-ghost clay-btn-sm" onClick={() => setShowQR((v) => !v)} aria-expanded={showQR}>
              {showQR ? 'Hide QR code' : 'Show QR code'}
            </button>
            <a className="clay-btn clay-btn-ghost clay-btn-sm" href={linkToShare} target="_blank" rel="noreferrer">
              Open in new tab
            </a>
          </div>
          {shareFeedback && (
            <p className="text-xs text-[var(--color-text-secondary)]" role="status">
              {shareFeedback}
            </p>
          )}

          {showQR && <QRCodePanel url={linkToShare} caption={linkToShare} onClose={() => setShowQR(false)} />}
        </>
      ) : (
        <div className="clay-card-sunken p-4">
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">No link yet. Publish to generate a resolvable preview link in this browser.</p>
          {onPublish && (
            <button type="button" className="clay-btn clay-btn-primary" disabled={publishing} onClick={onPublish}>
              {publishing ? 'Publishing…' : 'Publish & get link'}
            </button>
          )}
        </div>
      )}

      <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
        <strong>About this prototype:</strong> data lives in your browser&apos;s localStorage. Links and QR codes resolve only on this device and
        browser. A real deployment with a backend would make published pages accessible anywhere.
      </p>
    </div>
  );
}
