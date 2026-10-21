/**
 * qrCode - Stage 9 QR generation for the current preview URL.
 *
 * Uses dynamic import of the `qrcode` library so it is only loaded when the
 * user actually requests a QR code. This prevents the library's Node.js
 * built-ins (Buffer, crypto) from crashing Vite's browser bundle during the
 * initial page load (which was breaking the editor hydration).
 *
 * If the library fails to load, an honest error is surfaced instead of a
 * broken page.
 */

export interface QRResult {
  ok: boolean;
  dataUrl?: string;
  error?: string;
}

export async function generateQRCodeDataUrl(
  text: string,
  options?: { width?: number; margin?: number; darkColor?: string; lightColor?: string },
): Promise<QRResult> {
  if (!text) return { ok: false, error: 'No URL provided for the QR code.' };
  try {
    const mod = (await import('qrcode')) as unknown as { toDataURL: (text: string, opts?: Record<string, unknown>) => Promise<string> };
    const dataUrl = await mod.toDataURL(text, {
      width: options?.width ?? 320,
      margin: options?.margin ?? 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: options?.darkColor ?? '#1f2937',
        light: options?.lightColor ?? '#ffffff',
      },
    });
    return { ok: true, dataUrl };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'QR generation failed';
    return { ok: false, error: `Could not generate QR code: ${msg}` };
  }
}

/** Print just the QR code area (used by QRCodePanel). */
export function printQRCode(dataUrl: string, caption: string): void {
  if (typeof window === 'undefined') return;
  const printWindow = window.open('', '_blank', 'width=420,height=520');
  if (!printWindow) return;
  const safeCaption = caption.replace(/[<>&"]/g, '');
  printWindow.document.write(
    `<!DOCTYPE html><html><head><title>Birthday page QR code</title>` +
      `<style>body{font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;background:#fff}` +
      `img{max-width:320px;width:100%;height:auto}p{margin:16px 0 0;font-size:13px;color:#555;text-align:center;word-break:break-all}</style></head>` +
      `<body><img src="${dataUrl}" alt="QR code" /><p>${safeCaption}</p></body></html>`,
  );
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
}

