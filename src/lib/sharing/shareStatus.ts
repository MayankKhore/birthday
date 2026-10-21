/**
 * shareStatus — Stage 9 helpers for the three-state share distinction.
 *
 * The preview UI must always be honest about what a link actually is:
 *  - `draft`          → not shared; only a local save.
 *  - `local-preview`  → resolvable in this browser, NOT a public link.
 *  - `published`      → in this prototype, still browser-local; a real
 *                       backend would make it public.
 */

import type { ProjectShareInfo, ShareVisibility } from '@/types';

export interface ShareStatusMeta {
  visibility: ShareVisibility;
  label: string;
  description: string;
  tone: 'neutral' | 'info' | 'success';
}

export function describeShareStatus(info: ProjectShareInfo | null): ShareStatusMeta {
  if (!info) {
    return {
      visibility: 'draft',
      label: 'Not saved',
      description: 'Save a draft or publish to get a resolvable local preview link.',
      tone: 'neutral',
    };
  }
  switch (info.visibility) {
    case 'published':
      return {
        visibility: 'published',
        label: 'Published (this browser)',
        description:
          'Marked published and resolvable at the share route in this browser. This static prototype has no server, so other devices cannot open it yet.',
        tone: 'success',
      };
    case 'local-preview':
      return {
        visibility: 'local-preview',
        label: 'Local preview',
        description: 'The preview link resolves in this browser only. It is not a public link.',
        tone: 'info',
      };
    default:
      return {
        visibility: 'draft',
        label: 'Local draft',
        description: 'Saved to this browser as a draft. Not shared with anyone.',
        tone: 'neutral',
      };
  }
}

/** Visibility badge class per tone, matching the clay design system. */
export function visibilityBadgeClass(tone: ShareStatusMeta['tone']): string {
  switch (tone) {
    case 'success':
      return 'clay-badge clay-badge-success';
    case 'info':
      return 'clay-badge clay-badge-primary';
    default:
      return 'clay-badge';
  }
}
