import type { MediaTierConfig } from './types';

/**
 * Photo management tier configuration.
 *
 * Four configurable photo limits for the birthday microsite creator.
 * Add new tiers here and they will be automatically picked up by the
 * photo manager, validation, and upgrade prompt.
 */
export const MEDIA_TIERS: MediaTierConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    maxPhotos: 1,
    description: 'A quick snapshot for a simple page.',
  },
  {
    id: 'plus',
    name: 'Plus',
    maxPhotos: 3,
    description: 'A few special moments from the day.',
  },
  {
    id: 'premium',
    name: 'Premium',
    maxPhotos: 5,
    description: 'A truly memorable day captured in detail.',
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    maxPhotos: 10,
    description: 'The complete celebration in full.',
  },
];

/**
 * Returns the tier config matching the given ID.
 */
export function getTierById(id: string): MediaTierConfig | undefined {
  return MEDIA_TIERS.find((t) => t.id === id);
}

/**
 * Returns the highest-tier config whose `maxPhotos` is >= the current
 * photo count. Falls back to the last tier (the most generous).
 */
export function getTierByPhotoCount(count: number): MediaTierConfig | undefined {
  return MEDIA_TIERS.find((t) => count <= t.maxPhotos) ?? MEDIA_TIERS[MEDIA_TIERS.length - 1];
}

/**
 * Returns the default tier used when no tier state is available.
 * This is the most generous free-tiering tier so developers can rely
 * on a concrete value.
 */
export function getDefaultTier(): MediaTierConfig {
  return MEDIA_TIERS[2] ?? MEDIA_TIERS[0] ?? { id: 'starter', name: 'Starter', maxPhotos: 1, description: 'A quick snapshot for a simple page.' };
}

/**
 * Returns the numeric index of the given tier ID, or -1 if not found.
 */
export function getTierIndex(id: string): number {
  return MEDIA_TIERS.findIndex((t) => t.id === id);
}

/**
 * Returns the total number of configured tiers.
 */
export function getTierCount(): number {
  return MEDIA_TIERS.length;
}
