/**
 * Theme Types
 */

import type { SubscriptionTier } from './models';

export type ThemeCategory = 'elegant' | 'fun' | 'minimal' | 'photo-focused' | 'animated' | 'kids';

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  tier: SubscriptionTier;
  previewImageUrl: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  animations: ThemeAnimations;
  layout: ThemeLayout;
  isDefault: boolean;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textOnPrimary: string;
  gradient?: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
  accent?: string;
}

export interface ThemeAnimations {
  enableConfetti: boolean;
  enableParallax: boolean;
  enableFadeIn: boolean;
  enableFloat: boolean;
  reducedMotionFallback: boolean;
}

export interface ThemeLayout {
  type: 'centered' | 'split' | 'fullscreen' | 'card' | 'timeline';
  photoDisplay: 'gallery' | 'carousel' | 'grid' | 'hero' | 'scatter';
  messagePosition: 'top' | 'center' | 'bottom' | 'overlay';
  showMusicControls: boolean;
}