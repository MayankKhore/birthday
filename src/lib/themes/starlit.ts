/**
 * Starlit Theme — midnight sky, delicate stars, luminous typography.
 */

import type { Theme, ThemeColors, ThemeFonts, ThemeAnimations, ThemeLayout } from '@/types';

const colors: ThemeColors = {
  primary: '#0f172a',
  secondary: '#1e293b',
  accent: '#fbbf24',
  background: '#020617',
  surface: '#1e1b4b',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textOnPrimary: '#ffffff',
  gradient: 'radial-gradient(circle at 50% 40%, #1e293b 0%, #020617 100%)',
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
  enableFloat: true,
  reducedMotionFallback: true,
};

const layout: ThemeLayout = {
  type: 'fullscreen',
  photoDisplay: 'gallery',
  messagePosition: 'center',
  showMusicControls: true,
};

export const STARLIT_THEME: Theme = {
  id: 'starlit',
  name: 'Starlit',
  description: 'Midnight sky, delicate stars, luminous typography.',
  category: 'elegant',
  tier: 'free',
  previewImageUrl:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%230f172a"/><circle cx="120" cy="60" r="2" fill="white" opacity="0.9"/><circle cx="280" cy="90" r="1.5" fill="white" opacity="0.7"/><circle cx="340" cy="40" r="2" fill="white" opacity="0.8"/><circle cx="60" cy="140" r="1.5" fill="white" opacity="0.6"/><circle cx="200" cy="200" r="2.5" fill="white" opacity="1"/><circle cx="320" cy="220" r="1.5" fill="white" opacity="0.75"/><text x="200" y="160" font-family="Georgia,serif" font-size="20" fill="white" text-anchor="middle" opacity="0.6">Starlit</text></svg>',
  colors,
  fonts,
  animations,
  layout,
  isDefault: false,
};
