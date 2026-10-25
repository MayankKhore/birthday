/**
 * ShareApp — Stage 9 public share route hydrator.
 *
 * Resolves a BirthdayProject by its slug (via LocalPublishingService) and
 * renders the recipient-facing BirthdayExperience. In this static prototype
 * the project is still read from localStorage, so the page only resolves in
 * the browser that created it — this limitation is surfaced in the UI when a
 * slug cannot be found.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BirthdayProject, Theme } from '@/types';
import { BirthdayExperience } from '@/components/experience/BirthdayExperience';
import { buildExperienceConfig } from '@/lib/experience/config';
import { getThemeById } from '@/lib/themes';
import { LocalPublishingService } from '@/services/adapters/local/LocalPublishingService';
import { ROUTES } from '@/utils/routes';

interface Props {
  slug: string;
}

export function ShareApp({ slug }: Props) {
  const [project, setProject] = useState<BirthdayProject | null>(null);
  const [theme, setTheme] = useState<Theme | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Stable across renders: a new instance on every render would change the
  // `load` callback identity and re-trigger the load effect in a loop.
  const publishingService = useMemo(() => new LocalPublishingService(), []);

  // Memoized so the scene queue keeps stable ids between renders — otherwise
  // every render would mint new scene UUIDs and remount the active scene.
  // Declared before the early returns below to keep the hook order stable.
  const config = useMemo(
    () => (project && theme ? buildExperienceConfig(project, theme) : null),
    [project, theme],
  );

  const load = useCallback(async () => {
    if (!slug) {
      setError('No share link provided.');
      setLoading(false);
      return;
    }
    const found = await publishingService.getBySlug(slug);
    if (found) {
      setProject(found);
      setTheme(getThemeById(found.themeId));
      setError(null);
    } else {
      setError(
        'This birthday page is not available in this browser. Shared pages in this prototype are stored locally — open the link on the device that created it, or create your own.',
      );
    }
    setLoading(false);
  }, [slug, publishingService]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-page)' }}>
        <div className="clay-card p-10 text-center max-w-md">
          <p className="text-sm text-[var(--color-text-secondary)] animate-pulse">Loading birthday page…</p>
        </div>
      </div>
    );
  }

  if (error || !project || !theme) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-page)' }}>
        <div className="clay-card p-10 text-center max-w-md">
          <div className="clay-icon-btn clay-icon-btn-lg mx-auto mb-4" style={{ background: 'var(--color-error-light)', color: 'var(--color-error-dark)' }} aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12.01" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Page not found here</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">{error ?? 'This page could not be loaded.'}</p>
          <div className="flex flex-col gap-2">
            <a className="clay-btn clay-btn-primary" href={ROUTES.ACCESS}>Open another page</a>
            <a className="clay-btn clay-btn-ghost" href={ROUTES.CREATE}>Create your own →</a>
          </div>
        </div>
      </div>
    );
  }

  // Memoized so the scene queue keeps stable ids between renders — otherwise
  // every render would mint new scene UUIDs and remount the active scene.
  return (
    <div className="min-h-screen w-full" style={{ background: 'var(--color-page)' }}>
      <BirthdayExperience project={project} theme={theme} config={config ?? {}} />
    </div>
  );
}
