/** Media module type definitions. */

export interface MediaTierConfig {
  id: 'starter' | 'plus' | 'premium' | 'ultimate';
  name: string;
  maxPhotos: number;
  description: string;
}

export interface PhotoValidationError {
  code: string;
  message: string;
}

export interface ValidationResult {
  success: boolean;
  error?: PhotoValidationError;
}

export interface PersistentMediaRecord {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
}
