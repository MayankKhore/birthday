/**
 * Image Upload Service Interface
 * Implementations can be swapped for Firebase Storage, Supabase Storage, S3, etc.
 */

import type { UUID } from '@/types';

export interface ImageUploadService {
  /** Upload an image from a File object, returns stored image metadata */
  upload(file: File, options?: UploadOptions): Promise<ImageUploadResult>;

  /** Upload from a base64 data URL */
  uploadFromDataUrl(dataUrl: string, fileName: string, options?: UploadOptions): Promise<ImageUploadResult>;

  /** Get a stored image by ID */
  getImage(imageId: UUID): Promise<ImageUploadResult>;

  /** Delete an image */
  delete(imageId: UUID): Promise<{ success: boolean; error?: string }>;

  /** Get all images for a project */
  getProjectImages(projectId: UUID): Promise<StoredImage[]>;

  /** Validate an image before upload */
  validateImage(file: File, constraints: ImageConstraints): ImageValidationResult;

  /** Get storage usage for current context */
  getStorageUsage(): Promise<StorageUsage>;
}

export interface UploadOptions {
  projectId?: UUID;
  altText?: string;
  caption?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
}

export interface StoredImage {
  id: UUID;
  projectId?: UUID;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  dataUrl: string; // base64 data URL (for local) or CDN URL (for remote)
  altText?: string;
  caption?: string;
  createdAt: string;
}

export interface ImageUploadResult {
  success: boolean;
  data?: StoredImage;
  error?: {
    code: string;
    message: string;
  };
}

export interface ImageConstraints {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
}

export interface ImageValidationResult {
  valid: boolean;
  errors: string[];
}

export interface StorageUsage {
  usedBytes: number;
  quotaBytes: number;
  imageCount: number;
  percentageUsed: number;
}

export interface ImageUploadProvider {
  initialize(): Promise<void>;
  getImageService(): ImageUploadService;
}