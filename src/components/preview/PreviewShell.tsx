/**
 * PreviewShell Ã¢â‚¬â€ Stage 9 preview workflow.
 *
 * Renders the ACTUAL birthday experience (BirthdayExperience from Stage 8),
 * not a screenshot. Supports:
 *   - Full-page desktop preview
 *   - Mobile preview mode (constrained device frame)
 *   - Return to editor
 *   - Save & continue editing
 *   - Share actions (copy link, QR, native share) via SharePanel
 *
 * Preview status (draft / local-preview / published) is always visible so the
 * user never mistakes a local preview for a public link.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BirthdayProject, ProjectShareInfo, Theme } from '@/types';
import { BirthdayExperience } from '@/components/experience/BirthdayExperience';
import { buildExperienceConfig } from '@/lib/experience/config';
import { LocalPublishingService } from '@/services/adapters/local/LocalPublishingService';
import { SharePanel } from './SharePanel';

interface Props {
  project: BirthdayProject;
  theme: Theme;
  onReturnToEditor?: () => void;
  onSave?: () => Promise<void> | void;
  replayKey?: number;
}

type PreviewMode = 'desktop' | 'mobile';

export function PreviewShell({ project, theme, onReturnToEditor, onSave, replayKey = 0 }: Props) {
  const [mode, setMode] = useState<PreviewMode>('desktop');
  const [shareInfo, setShareInfo] = useState<ProjectShareInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [experienceKey, setExperienceKey] = useState(0);

  const publishingService = useMemo(() => new LocalPublishingService(), []);

  const refreshShareInfo = useCallback(async () => {
    const info = await publishingService.getShareInfo(project.id);
    setShareInfo(info);
  }, [publishingService, project.id]);

  useEffect(() => {
    void refreshShareInfo();
  }, [refreshShareInfo]);

  useEffect(() => {
    setExperienceKey((k) => k + 1);
  }, [replayKey]);

  const experienceConfig = useMemo(() => buildExperienceConfig(project, theme), [project, theme]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await onSave?.();
      await refreshShareInfo();
      setSaveMessage('Saved to this browser.');
    } catch {
      setSaveMessage('Could not save. Storage may be full.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 2600);
    }
  }, [onSave, refreshShareInfo]);

  const handlePublish = useCallback(async () => {
    setPublishing(true);
    try {
      await publishingService.publish(project.id);
      await refreshShareInfo();
    } finally {
      setPublishing(false);
    }
  }, [publishingService, project.id, refreshShareInfo]);

  const handleReplay = useCallback(() => {
    setExperienceKey((k) => k + 1);
  }, []);

  const isMobileFrame = mode === 'mobile';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-page)' }}>
      <header className="clay-card-static border-b border-[var(--color-border)] sticky top-0 z-40" style={{ background: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="clay-badge clay-badge-primary">Preview</span>
          <span className="text-sm font-semibold truncate max-w-[200px]" style={{ color: 'var(--color-text-primary)' }}>{project.title}</span>
          <div className="flex items-center gap-1 ml-auto" role="group" aria-label="Preview mode">
            <button type="button" className={`clay-btn clay-btn-sm ${mode === 'desktop' ? 'clay-btn-primary' : 'clay-btn-ghost'}`} aria-pressed={mode === 'desktop'} onClick={() => setMode('desktop')}>Desktop</button>
            <button type="button" className={`clay-btn clay-btn-sm ${mode === 'mobile' ? 'clay-btn-primary' : 'clay-btn-ghost'}`} aria-pressed={mode === 'mobile'} onClick={() => setMode('mobile')}>Mobile</button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="clay-btn clay-btn-ghost clay-btn-sm" onClick={handleReplay}>Replay</button>
            {onSave && (<button type="button" className="clay-btn clay-btn-secondary clay-btn-sm" disabled={saving} onClick={() => void handleSave()}>{saving ? 'SavingÃ¢â‚¬Â¦' : 'Save & continue'}</button>)}
            {onReturnToEditor && (<button type="button" className="clay-btn clay-btn-primary clay-btn-sm" onClick={onReturnToEditor}>Ã¢â€ Â Return to editor</button>)}
          </div>
        </div>
        {saveMessage && (<div className="max-w-6xl mx-auto px-4 pb-2" role="status"><p className="text-xs text-[var(--color-mint)]">{saveMessage}</p></div>)}
      </header>

      <main className="flex-1 flex flex-col items-center py-6 px-4">
        <div className={`w-full ${isMobileFrame ? 'max-w-[390px]' : 'max-w-5xl'} transition-all duration-300`} style={isMobileFrame ? { borderRadius: '2.5rem', border: '10px solid #111827', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', overflow: 'hidden', height: '780px' } : undefined}>
          <div className={isMobileFrame ? 'h-full overflow-y-auto' : ''}>
            <BirthdayExperience key={experienceKey} project={project} theme={theme} config={experienceConfig} />
          </div>
        </div>
        {isMobileFrame && (<p className="mt-3 text-xs text-[var(--color-text-tertiary)]">Mobile preview Ã¢â‚¬â€ 390 Ãƒâ€” 780 device frame</p>)}
        <div className="w-full max-w-2xl mt-8">
          <SharePanel shareInfo={shareInfo} title={project.title} onPublish={() => void handlePublish()} publishing={publishing} />
        </div>
      </main>
    </div>
  );
}
