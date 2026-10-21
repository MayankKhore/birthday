/**
 * PreviewRenderer — Stage 6 theme-agnostic preview.
 *
 * Renders a BirthdayProject through the selected theme's renderer. The editor
 * never duplicates UI per theme — it delegates here, and each theme renderer
 * owns its own layout, illustrations, and animations.
 */

import type { BirthdayProject, Theme } from '@/types';
import { StarlitRenderer } from './themeRenderers/StarlitRenderer';
import { KeepsakeRenderer } from './themeRenderers/KeepsakeRenderer';
import { DaydreamRenderer } from './themeRenderers/DaydreamRenderer';
import { AfterglowRenderer } from './themeRenderers/AfterglowRenderer';

interface Props {
  project: BirthdayProject;
  theme: Theme | undefined;
  onMusicToggle: () => void;
}

export function PreviewRenderer({ project, theme, onMusicToggle }: Props) {
  const ThemeComponent = getThemeComponent(theme?.id);
  if (!ThemeComponent || !theme) {
    return (
      <div className="clay-card p-8 text-center">
        <p className="text-[var(--color-text-secondary)]">Select a theme to preview.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ThemeComponent project={project} theme={theme} onMusicToggle={onMusicToggle} />
    </div>
  );
}

function getThemeComponent(themeId?: string) {
  switch (themeId) {
    case 'starlit':
      return StarlitRenderer;
    case 'keepsake':
      return KeepsakeRenderer;
    case 'daydream':
      return DaydreamRenderer;
    case 'afterglow':
      return AfterglowRenderer;
    default:
      return StarlitRenderer;
  }
}
