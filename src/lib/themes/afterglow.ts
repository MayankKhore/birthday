/**
 * Afterglow Theme — editorial typography, elegant dark surfaces, cinematic reveals.
 */

import type { Theme, ThemeColors, ThemeFonts, ThemeAnimations, ThemeLayout } from '@/types';

const colors: ThemeColors = {
  primary: '#f8fafc',
  secondary: '#cbd5e1',
  accent: '#fbbf24',
  background: '#020617',
  surface: '#0f172a',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textOnPrimary: '#020617',
  gradient: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
};

const fonts: ThemeFonts = {
  heading: 'Fraunces, Georgia, serif',
  body: 'Plus Jakarta Sans, Inter, system-ui, -apple-system, sans-serif',
  accent: 'Fraunces, Georgia, serif',
};

const animations: ThemeAnimations = {
  enableConfetti: false,
  enableParallax: true,
  enableFadeIn: true,
  enableFloat: false,
  reducedMotionFallback: true,
};

const layout: ThemeLayout = {
  type: 'fullscreen',
  photoDisplay: 'hero',
  messagePosition: 'overlay',
  showMusicControls: true,
};

export const AFTERGLOW_THEME: Theme = {
  id: 'afterglow',
  name: 'Afterglow',
  description: 'Editorial typography, elegant dark surfaces, cinematic reveals.',
  category: 'elegant',
  tier: 'premium',
  previewImageUrl:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%230f172a"/><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%23020617"/></linearGradient><rect width="400" height="300" fill="url(%23g)" opacity="0.6"/><text x="200" y="150" font-family="Georgia,serif" font-size="22" fill="white" text-anchor="middle" letter-spacing="2">Afterglow</text><text x="200" y="180" font-family="sans-serif" font-size="12" fill="%2394a3b8" text-anchor="middle">Premium theme</text></svg>',
  colors,
  fonts,
  animations,
  layout,
  isDefault: false,
};
