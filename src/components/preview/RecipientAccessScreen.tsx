/**
 * RecipientAccessScreen — Stage 9 demo recipient-access screen.
 *
 * Lets a recipient (or the creator testing on another device profile) enter or
 * select a local project to open. Clearly labels each project's status so a
 * draft is never mistaken for a published page.
 *
 * This screen only resolves projects stored in the current browser. It does
 * NOT provide access to pages on other devices — that would require a real
 * backend.
 */

import { useCallback, useEffect, useState } from 'react';
import type { ProjectListItem, UUID } from '@/types';
import { LocalProjectAdapter } from '@/lib/storage/LocalProjectAdapter';
import { ROUTES } from '@/utils/routes';

interface Props {
  /** Called when the user picks a project to open. */
  onOpenProject?: (projectId: UUID) => void;
}

export function RecipientAccessScreen({ onOpenProject }: Props) {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [manualId, setManualId] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const adapter = new LocalProjectAdapter();

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      await adapter.initialize();
      const result = await adapter.listPublished({ page: 1, pageSize: 50 });
      if (result.success && result.data) setProjects(result.data.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const handleManualOpen = useCallback(() => {
    setManualError(null);
    const trimmed = manualId.trim();
    if (!trimmed) {
      setManualError('Enter a project ID or a full preview URL.');
      return;
    }
    // Accept a raw UUID or a URL containing one.
    const uuidMatch = trimmed.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (!uuidMatch) {
      setManualError('That does not look like a valid project ID or preview URL.');
      return;
    }
    const id = uuidMatch[0];
    if (onOpenProject) {
      onOpenProject(id as UUID);
    } else {
      window.location.href = `${ROUTES.PREVIEW}/${id}`;
    }
  }, [manualId, onOpenProject]);

  const handleSelect = useCallback(
    (id: UUID) => {
      if (onOpenProject) onOpenProject(id);
      else window.location.href = `${ROUTES.PREVIEW}/${id}`;
    },
    [onOpenProject],
  );

  return (
    <section className="clay-card p-8 sm:p-10 max-w-2xl mx-auto space-y-8">
      <div>
        <span className="clay-badge clay-badge-primary mb-3 inline-block">Recipient access</span>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Open a birthday page</h1>
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
          Enter a project ID or choose one saved in this browser. This demo resolves only pages stored locally — it is not a public gallery.
        </p>
      </div>

      <div className="clay-card-static p-6 space-y-3">
        <label htmlFor="manual-project-id" className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Enter a project ID or preview link
        </label>
        <input
          id="manual-project-id"
          className="clay-input w-full"
          type="text"
          placeholder="Paste a project ID or /preview/… link"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleManualOpen(); }}
        />
        {manualError && (
          <p className="text-xs text-[var(--color-error-dark)]" role="alert">{manualError}</p>
        )}
        <button type="button" className="clay-btn clay-btn-primary" onClick={handleManualOpen}>Open page →</button>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Saved in this browser</h2>
        {loading && <p className="text-sm text-[var(--color-text-secondary)] animate-pulse">Loading…</p>}
        {!loading && projects.length === 0 && (
          <div className="clay-card-sunken p-4 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">No published pages in this browser yet.</p>
            <a href={ROUTES.CREATE} className="clay-btn clay-btn-ghost clay-btn-sm mt-3">Create one →</a>
          </div>
        )}
        {!loading && projects.length > 0 && (
          <ul className="space-y-2" role="list">
            {projects.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="clay-card w-full text-left p-4 flex items-center justify-between gap-3 hover:scale-[1.01] transition-transform"
                  onClick={() => handleSelect(p.id)}
                >
                  <div className="min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{p.title}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)] truncate">For {p.recipientName}</p>
                  </div>
                  <span className={`clay-badge ${p.status === 'published' ? 'clay-badge-success' : ''}`}>{p.status}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
        <strong>Prototype limitation:</strong> these pages are stored in this browser&apos;s localStorage. They cannot be opened from another
        device or browser until a real backend hosts them.
      </p>
    </section>
  );
}
