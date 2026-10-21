/**
 * Client-side image processing — downscale + compress photos so multi-photo
 * projects still fit inside the browser's localStorage quota.
 * Everything stays on-device; no uploads anywhere.
 */

export const MAX_IMAGE_DIMENSION = 1280;
export const JPEG_QUALITY = 0.82;

/** Pure math helper (unit-tested): target size preserving aspect ratio. */
export function computeTargetSize(
  width: number,
  height: number,
  maxDimension = MAX_IMAGE_DIMENSION,
): { width: number; height: number } {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { width: 0, height: 0 };
  }
  const longest = Math.max(width, height);
  if (longest <= maxDimension) return { width: Math.round(width), height: Math.round(height) };
  const scale = maxDimension / longest;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export interface ProcessedImage {
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
}

function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image dimensions.'));
    };
    img.src = url;
  });
}

/**
 * Downscale + compress an image file to a storage-friendly JPEG data URL.
 * GIFs are preserved as-is (to keep animation); everything else becomes JPEG.
 */
export async function processImageFile(file: File): Promise<ProcessedImage> {
  if (file.type === 'image/gif') {
    const dims = await readDimensions(file).catch(() => ({ width: 0, height: 0 }));
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Could not read file.'));
      reader.readAsDataURL(file);
    });
    return { dataUrl, width: dims.width, height: dims.height, sizeBytes: file.size, mimeType: file.type };
  }
  const dims = await readDimensions(file);
  const target = computeTargetSize(dims.width, dims.height);
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not decode image.'));
      el.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) throw new Error('Canvas is not available in this browser.');
    ctx2d.drawImage(img, 0, 0, target.width, target.height);
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    const sizeBytes = Math.round((dataUrl.length * 3) / 4);
    return { dataUrl, width: target.width, height: target.height, sizeBytes, mimeType: 'image/jpeg' };
  } finally {
    URL.revokeObjectURL(url);
  }
}
