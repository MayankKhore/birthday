/**
 * Validation Schemas (Zod)
 */

import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1).max(100),
  occasion: z.enum(['birthday', 'anniversary', 'graduation', 'custom']),
  recipientName: z.string().min(1).max(50),
  recipientAge: z.number().int().min(1).max(150).optional(),
  relationship: z.string().max(50).optional(),
  themeId: z.string().min(1),
  message: z.string().min(1).max(2000),
  customMessage: z.string().max(2000).optional(),
  photos: z.array(z.object({
    fileName: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number(),
    width: z.number(),
    height: z.number(),
    dataUrl: z.string(),
    altText: z.string().optional(),
    caption: z.string().optional(),
    sortOrder: z.number(),
  })).max(50),
  musicEnabled: z.boolean(),
  musicTrackId: z.string().optional(),
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;

/* Demo auth: email-only. Passwords are never collected or stored. */
export const demoEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address, like you@example.com.'),
  displayName: z.string().trim().min(1, 'Enter a display name.').max(50, 'Display name must be 50 characters or fewer.').optional(),
});

export type DemoEmailSchema = z.infer<typeof demoEmailSchema>;

export const demoRegisterSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address, like you@example.com.'),
  displayName: z.string().trim().min(1, 'Enter a display name.').max(50, 'Display name must be 50 characters or fewer.'),
});

export type DemoRegisterSchema = z.infer<typeof demoRegisterSchema>;

export const demoResetSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address first.'),
});

export type DemoResetSchema = z.infer<typeof demoResetSchema>;

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().optional(),
  email: z.string().email().optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;