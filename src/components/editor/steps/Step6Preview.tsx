/**
 * Step6Preview - Stage 9 editor step 6: Preview & finish.
 *
 * Renders the ACTUAL birthday experience (BirthdayExperience) inline so the
 * creator sees exactly what the recipient will see. Offers desktop/mobile
 * preview toggle, save draft, publish & get a local preview link, and return
 * to editor. The share panel clearly labels the page as local-only.
 */

import { useCallback, useMemo, useState } from 'react';
import { useEditor } from '@/components/editor/EditorProvider';
import { BirthdayExperience } from '@/components/experience/BirthdayExperience';
import { buildExperienceConfig } from '@/lib/experience/config';
import { SharePanel } from '@/components/preview/SharePanel';
import { LocalPublishingService } from '@/services/adapters/local/LocalPublishingService';
import { LocalProjectAdapter } from '@/lib/storage/LocalProjectAdapter';
import { createUUID, nowISO } from '@/types';
import type { BirthdayProject, ISODateString, ProjectPhoto, ProjectShareInfo, UUID } from '@/types';

interface Props { onPrev: () => void; }
const pubSvc = new LocalPublishingService();
const projAdapter = new LocalProjectAdapter();

export function Step6Preview({ onPrev }: Props) {
  const { project, photos, theme, buildProjectInput, saveDraft, isSaving, setSaving, isPublishing, setPublishing } = useEditor();
  const [savedId, setSavedId] = useState<UUID | null>(null);
  const [shareInfo, setShareInfo] = useState<ProjectShareInfo | null>(null);
  const [pubErr, setPubErr] = useState<string | null>(null);
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');

  const stamp = nowISO();
  const fbTheme = { id: 'starlit', colors: { background: '#0f172a', gradient: 'linear-gradient(160deg,#0f172a,#1e1b4b)', textPrimary: '#f8fafc', textOnPrimary: '#fff' }, fonts: { body: 'system-ui' } } as never;
  const previewProject: BirthdayProject = useMemo(() => ({
    id: (savedId ?? createUUID()) as UUID, userId: null, slug: 'preview',
    title: project.title ?? (project.recipientName ? project.recipientName + "'s Birthday" : 'Birthday page'),
    occasion: (project.occasion ?? 'birthday') as BirthdayProject['occasion'],
    recipientName: project.recipientName ?? 'Someone',
    ...(project.recipientAge !== undefined ? { recipientAge: project.recipientAge } : {}),
    ...(project.relationship ? { relationship: project.relationship } : {}),
    themeId: project.themeId ?? theme?.id ?? 'starlit',
    message: project.message ?? '',
    ...(project.customMessage ? { customMessage: project.customMessage } : {}),
    photos: photos.map((p): ProjectPhoto => ({
      id: p.id, projectId: 'preview' as UUID, fileName: p.fileName, mimeType: p.mimeType,
      sizeBytes: p.sizeBytes, width: p.width, height: p.height, dataUrl: p.previewUrl,
      ...(p.altText !== '' ? { altText: p.altText } : {}),
      ...(p.caption !== '' ? { caption: p.caption } : {}),
      sortOrder: p.sortOrder, createdAt: stamp as ISODateString })),
    musicEnabled: !!project.musicEnabled,
    ...(project.musicTrackId ? { musicTrackId: project.musicTrackId } : {}),
    status: 'draft', viewCount: 0, createdAt: stamp as ISODateString, updatedAt: stamp as ISODateString,
  }), [savedId, project, photos, theme, stamp]);

  const expConfig = useMemo(() => buildExperienceConfig(previewProject, theme ?? fbTheme), [previewProject, theme, fbTheme]);

  const handleSave = useCallback(async () => { setSaving(true); try { await saveDraft(); } finally { setSaving(false); } }, [saveDraft, setSaving]);

  const handlePublish = useCallback(async () => {
    setPubErr(null);
    const input = buildProjectInput();
    if (!input) { setPubErr('Finish steps 1-3 first: occasion, message, and theme are required.'); return; }
    setPublishing(true);
    try {
      const created = await projAdapter.create(input, null);
      if (!created.success || !created.data) { setPubErr(created.error?.message ?? 'Could not publish.'); return; }
      const pub = await pubSvc.publish(created.data.id);
      if (!pub.success || !pub.shareInfo) { setPubErr(pub.error?.message ?? 'Could not publish.'); return; }
      setSavedId(created.data.id); setShareInfo(pub.shareInfo);
    } finally { setPublishing(false); }
  }, [buildProjectInput, setPublishing]);

  const isMobile = mode === 'mobile';

  return (
    <section className="clay-card p-8 sm:p-12 max-w-4xl mx-auto space-y-8">
      <div>
        <span className="clay-badge clay-badge-primary mb-3 inline-block">Step 6 of 6</span>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Preview &amp; finish</h1>
        <p className="text-body sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>This is the actual birthday experience your recipient will see.</p>
      </div>
      {pubErr && (<div className="clay-card p-4 border-l-4 border-l-[var(--color-error-dark)]" role="alert"><p className="text-sm text-[var(--color-error-dark)]">{pubErr}</p></div>)}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Preview mode">
        <button type="button" className={'clay-btn clay-btn-sm ' + (mode === 'desktop' ? 'clay-btn-primary' : 'clay-btn-ghost')} aria-pressed={mode === 'desktop'} onClick={() => setMode('desktop')}>Desktop</button>
        <button type="button" className={'clay-btn clay-btn-sm ' + (isMobile ? 'clay-btn-primary' : 'clay-btn-ghost')} aria-pressed={isMobile} onClick={() => setMode('mobile')}>Mobile</button>
        {photos.length === 0 && <span className="text-xs text-[var(--color-text-tertiary)] ml-2">No photos yet - the theme still renders the full message and reveal.</span>}
      </div>
      <div className={'mx-auto w-full transition-all duration-300 ' + (isMobile ? 'max-w-[390px]' : 'max-w-full')} style={isMobile ? { borderRadius: '2rem', border: '8px solid #111827', boxShadow: '0 16px 40px rgba(0,0,0,0.2)', overflow: 'hidden', height: '720px' } : undefined}>
        <div className={isMobile ? 'h-full overflow-y-auto' : ''}>
          <BirthdayExperience project={previewProject} theme={theme ?? fbTheme} config={expConfig} />
        </div>
      </div>
      {isMobile && <p className="text-center text-xs text-[var(--color-text-tertiary)]">Mobile preview - 390 x 720 device frame</p>}
      <div className="pt-4 grid gap-3 sm:grid-cols-3">
        <button type="button" className="clay-btn clay-btn-ghost" onClick={onPrev}>&#8592; Back to editing</button>
        <button type="button" className="clay-btn clay-btn-secondary" disabled={isSaving} onClick={() => void handleSave()}>{isSaving ? 'Saving...' : 'Save draft'}</button>
        {!shareInfo && (<button type="button" className="clay-btn clay-btn-primary clay-btn-lg" disabled={isPublishing} onClick={() => void handlePublish()}>{isPublishing ? 'Publishing...' : 'Publish & get link'}</button>)}
      </div>
      {shareInfo && (
        <div className="space-y-4">
          <SharePanel shareInfo={shareInfo} title={previewProject.title} />
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="clay-btn clay-btn-ghost" onClick={onPrev}>&#8592; Keep editing</button>
            <a className="clay-btn clay-btn-primary" href={shareInfo.previewUrl}>Open full preview</a>
          </div>
        </div>
      )}
    </section>
  );
}

