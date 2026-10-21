/**
 * QRCodePanel — Stage 9 printable QR code for the current preview URL.
 *
 * Generates a QR code for the provided URL using the lightweight `qrcode`
 * library, shows a loading / error state, and offers a print action. The QR
 * only encodes the URL that was given — it never invents a destination.
 */

import { useEffect, useState } from 'react';
import { generateQRCodeDataUrl, printQRCode } from '@/lib/sharing/qrCode';

interface Props {
  url: string;
  caption?: string;
  onClose?: () => void;
}

export function QRCodePanel({ url, caption, onClose }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDataUrl(null);
    void generateQRCodeDataUrl(url).then((result) => {
      if (cancelled) return;
      if (result.ok && result.dataUrl) {
        setDataUrl(result.dataUrl);
      } else {
        setError(result.error ?? 'Could not generate a QR code for this URL.');
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div
      className="clay-card p-6 max-w-sm mx-auto text-center space-y-4"
      role="dialog"
      aria-modal="true"
      aria-label="QR code for preview link"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">QR code</p>
        {onClose && (
          <button type="button" className="clay-btn clay-btn-ghost clay-btn-sm" onClick={onClose} aria-label="Close QR code">
            ✕
          </button>
        )}
      </div>

      <div className="clay-card-sunken p-4 flex items-center justify-center min-h-[220px]">
        {loading && (
          <p className="text-sm text-[var(--color-text-secondary)] animate-pulse" role="status">
            Generating QR code…
          </p>
        )}
        {!loading && error && (
          <div role="alert">
            <p className="text-sm text-[var(--color-error-dark)] mb-1">QR code unavailable</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">{error}</p>
          </div>
        )}
        {!loading && !error && dataUrl && (
          <img
            src={dataUrl}
            alt={caption ? `QR code for ${caption}` : 'QR code for preview link'}
            className="max-w-[280px] w-full h-auto rounded-lg"
            style={{ background: '#fff' }}
          />
        )}
      </div>

      {caption && <p className="text-xs text-[var(--color-text-tertiary)] break-all">{caption}</p>}

      <div className="flex gap-2 justify-center">
        <button
          type="button"
          className="clay-btn clay-btn-secondary clay-btn-sm"
          disabled={!dataUrl}
          onClick={() => dataUrl && printQRCode(dataUrl, url)}
        >
          Print QR code
        </button>
      </div>

      <p className="text-[11px] text-[var(--color-text-tertiary)]">
        This QR encodes the exact URL shown. In this prototype the URL resolves only in this browser.
      </p>
    </div>
  );
}
