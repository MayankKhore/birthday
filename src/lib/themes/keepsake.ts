/**
 * Keepsake Theme — warm paper, memory cards, photo frames.
 */

import type { Theme, ThemeColors, ThemeFonts, ThemeAnimations, ThemeLayout } from '@/types';

const colors: ThemeColors = {
  primary: '#7c2d12',
  secondary: '#ea580c',
  accent: '#f59e0b',
  background: '#fff7ed',
  surface: '#ffffff',
  textPrimary: '#431407',
  textSecondary: '#7c2d12',
  textOnPrimary: '#ffffff',
  gradient: 'linear-gradient(160deg, #fff7ed 0%, #ffedd5 100%)',
};

const fonts: ThemeFonts = {
  heading: 'Fraunces, Georgia, serif',
  body: 'Plus Jakarta Sans, Inter, system-ui, -apple-system, sans-serif',
  accent: 'Fraunces, Georgia, serif',
};

const animations: ThemeAnimations = {
  enableConfetti: false,
  enableParallax: false,
  enableFadeIn: true,
  enableFloat: false,
  reducedMotionFallback: true,
};

const layout: ThemeLayout = {
  type: 'card',
  photoDisplay: 'grid',
  messagePosition: 'top',
  showMusicControls: false,
};

export const KEEPSAKE_THEME: Theme = {
  id: 'keepsake',
  name: 'Keepsake',
  description: 'Warm paper, memory cards, photo frames.',
  category: 'photo-focused',
  tier: 'free',
  previewImageUrl:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23fff7ed"/><rect x="40" y="40" width="120" height="120" fill="white" stroke="%23e7d5c0" stroke-width="2" rx="4"/><rect x="240" y="40" width="120" height="120" fill="white" stroke="%23e7d5c0" stroke-width="2" rx="4"/><rect x="40" y="180" width="120" height="80" fill="white" stroke="%23e7d5c0" stroke-width="2" rx="4"/><text x="200" y="240" font-family="Georgia,serif" font-size="18" fill="%237c2d12" text-anchor="middle">Keepsake</text></svg>',
  colors,
  fonts,
  animations,
  layout,
  isDefault: false,
};
