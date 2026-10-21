import type { PhotoValidationError, ValidationResult } from './types';

/**
 * Supported image file types (MIME types).
 */
export const SUPPORTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

/**
 * Supported audio file types (MIME types).
 */
export const SUPPORTED_AUDIO_TYPES = new Set([
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/x-wav',
]);

/**
 * Maximum file size for images: 8 MB.
 */
export const MAX_FILE_BYTES = 8 * 1024 * 1024;

/**
 * Maximum file size for audio: 50 MB.
 */
export const MAX_AUDIO_BYTES = 50 * 1024 * 1024;

/**
 * Returns a validation error object for the given code and message.
 */
export function createValidationError(code: string, message: string): PhotoValidationError {
  return { code, message };
}

/**
 * Validates a single image file.
 *
 * Checks:
 *  - File type is one of the supported image MIME types
 *  - File size does not exceed MAX_FILE_BYTES
 */
export function validateImageFile(file: File): ValidationResult {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    return {
      success: false,
      error: createValidationError(
        'UNSUPPORTED_FILE_TYPE',
        `${file.name} is not a supported image type. Use JPEG, PNG, WebP, or GIF.`,
      ),
    };
  }
  if (file.size > MAX_FILE_BYTES) {
    const maxMb = (MAX_FILE_BYTES / (1024 * 1024)).toFixed(0);
    return {
      success: false,
      error: createValidationError(
        'FILE_TOO_LARGE',
        `${file.name} exceeds the ${maxMb}MB image limit.`,
      ),
    };
  }
  return { success: true };
}

/**
 * Validates a single audio file.
 *
 * Checks:
 *  - File type is one of the supported audio MIME types
 *  - File size does not exceed MAX_AUDIO_BYTES
 */
export function validateAudioFile(file: File): ValidationResult {
  if (!SUPPORTED_AUDIO_TYPES.has(file.type)) {
    return {
      success: false,
      error: createValidationError(
        'UNSUPPORTED_AUDIO_TYPE',
        `${file.name} is not a supported audio type. Use MP3, WAV, OGG, or AAC.`,
      ),
    };
  }
  if (file.size > MAX_AUDIO_BYTES) {
    const maxMb = (MAX_AUDIO_BYTES / (1024 * 1024)).toFixed(0);
    return {
      success: false,
      error: createValidationError(
        'FILE_TOO_LARGE',
        `${file.name} exceeds the ${maxMb}MB audio limit.`,
      ),
    };
  }
  return { success: true };
}

/**
 * Validates a media file (image or audio).
 *
 * @param file - The file to validate
 * @param isAudio - `true` if the file is audio, `false` if it is an image
 */
export function validateMediaFile(file: File, isAudio: boolean): ValidationResult {
  return isAudio ? validateAudioFile(file) : validateImageFile(file);
}
