/**
 * PreviewApp — Stage 6 public preview hydrator.
 *
 * Reads a BirthdayProject from localStorage by ID, resolves its theme, and
 * renders it through PreviewRenderer. Includes client-side music controls.
 * Used by pages/preview/[id].astro.
 */

import { useCallback, useEffect, useState } from 'react';
import type { BirthdayProject, Theme, UUID } from '@/types';
import { PreviewRenderer } from '@/components/editor/PreviewRenderer';
import { getThemeById } from '@/lib/themes';
import { LocalProjectAdapter } from '@/lib/storage/LocalProjectAdapter';

interface Props {
  projectId: string;
}

const adapter = new LocalProjectAdapter();

export function PreviewApp({ projectId }: Props) {
  const [project, setProject] = useState<BirthdayProject | null>(null);
  const [theme, setTheme] = useState<Theme | undefined>(undefined);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    if (!projectId) {
      setError('No project ID provided.');
      return;
    }
    const result = await adapter.getById(projectId as UUID);
    if (result.success && result.data) {
      setProject(result.data);
      setTheme(getThemeById(result.data.themeId));
      setError(null);
    } else {
      setError('Birthday page not found. It may not have been published yet.');
    }
  }, [projectId]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  const handleMusic = useCallback(() => {
    setMusicPlaying((p) => !p);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-page)' }}>
        <div className="clay-card p-10 text-center max-w-md">
          <div className="clay-icon-btn clay-icon-btn-lg mx-auto mb-4" style={{ background: 'var(--color-error-light)', color: 'var(--color-error-dark)' }} aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12.01" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{error}</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">Return to the home page to create or open a page.</p>
        </div>
      </div>
    );
  }

  if (!project || !theme) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-page)' }}>
        <div className="clay-card p-10 text-center max-w-md">
          <div className="clay-icon-btn clay-icon-btn-lg mx-auto mb-4 animate-pop" style={{ background: 'var(--color-surface-lavender)', color: 'var(--color-brand-600)' }} aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">Loading your birthday page…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ background: 'var(--color-page)' }}>
      <PreviewRenderer
        project={project}
        theme={theme}
        onMusicToggle={handleMusic}
      />
    </div>
  );
}
