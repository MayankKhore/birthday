/**
 * Daydream Theme — airy colours, playful shapes, soft motion.
 */

import type { Theme, ThemeColors, ThemeFonts, ThemeAnimations, ThemeLayout } from '@/types';

const colors: ThemeColors = {
  primary: '#084298',
  secondary: '#2563eb',
  accent: '#f472b6',
  background: '#f0f9ff',
  surface: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#1e3a8a',
  textOnPrimary: '#ffffff',
  gradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #fce7f3 100%)',
};

const fonts: ThemeFonts = {
  heading: 'Fraunces, Georgia, serif',
  body: 'Plus Jakarta Sans, Inter, system-ui, -apple-system, sans-serif',
  accent: 'Plus Jakarta Sans, Inter, system-ui, sans-serif',
};

const animations: ThemeAnimations = {
  enableConfetti: true,
  enableParallax: false,
  enableFadeIn: true,
  enableFloat: true,
  reducedMotionFallback: true,
};

const layout: ThemeLayout = {
  type: 'split',
  photoDisplay: 'carousel',
  messagePosition: 'center',
  showMusicControls: true,
};

export const DAYDREAM_THEME: Theme = {
  id: 'daydream',
  name: 'Daydream',
  description: 'Airy colours, playful shapes, soft motion.',
  category: 'animated',
  tier: 'free',
  previewImageUrl:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23f0f9ff"/><circle cx="80" cy="100" r="24" fill="%23bfdbfe" opacity="0.6"/><circle cx="320" cy="60" r="20" fill="%23bae6fd" opacity="0.5"/><circle cx="200" cy="220" r="28" fill="%23bfdbfe" opacity="0.4"/><ellipse cx="140" cy="180" rx="30" ry="16" fill="%23fce7f3" opacity="0.7"/><text x="200" y="160" font-family="Georgia,serif" font-size="18" fill="%23084298" text-anchor="middle">Daydream</text></svg>',
  colors,
  fonts,
  animations,
  layout,
  isDefault: false,
};
