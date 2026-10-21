/**
 * Theme Registry — Birthday Microsite Builder (Stage 6)
 *
 * Data-driven theme configuration. Each theme is a self-contained visual
 * direction. The editor renders every theme through a single PreviewRenderer
 * so the editor UI is never duplicated per theme.
 */

import type { Theme, SubscriptionTier } from '@/types';
import { FREE_ENTITLEMENTS } from '@/types';
import { STARLIT_THEME } from './starlit';
import { KEEPSAKE_THEME } from './keepsake';
import { DAYDREAM_THEME } from './daydream';
import { AFTERGLOW_THEME } from './afterglow';

export const DEMO_TIER: SubscriptionTier = 'free';
export const DEMO_ENTITLEMENTS = FREE_ENTITLEMENTS;
export const MAX_PHOTOS = DEMO_ENTITLEMENTS.maxPhotosPerProject;

export const THEME_REGISTRY: Theme[] = [
  STARLIT_THEME,
  KEEPSAKE_THEME,
  DAYDREAM_THEME,
  AFTERGLOW_THEME,
];

export function getThemeById(id: string): Theme | undefined {
  return THEME_REGISTRY.find((t) => t.id === id);
}

export function getDefaultTheme(): Theme {
  return THEME_REGISTRY.find((t) => t.isDefault) ?? THEME_REGISTRY[0] ?? STARLIT_THEME;
}

export function getFreeThemes(): Theme[] {
  return THEME_REGISTRY.filter((t) => t.tier === 'free');
}

export function isThemeAccessible(theme: Theme, tier: SubscriptionTier): boolean {
  if (theme.tier === 'free') return true;
  if (theme.tier === 'premium' && tier === 'premium') return true;
  return false;
}
