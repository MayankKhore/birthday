/**
 * Demo project seeding for the dashboard
 * Creates clearly fictional starter projects on first dashboard visit.
 * Never overwrites existing user data.
 */

import type { BirthdayProject, CreateProjectInput, UUID } from '@/types';
import { LocalProjectAdapter } from '@/lib/storage/LocalProjectAdapter';
import { LocalStorage } from '@/lib/storage/LocalStorage';
import { STORAGE_KEYS } from '@/types';

const SEED_FLAG = 'bw_demo_seeded_v1';

function starterProjects(): CreateProjectInput[] {
  return [
    {
      title: 'Maya Turns 30',
      occasion: 'birthday',
      recipientName: 'Maya',
      recipientAge: 30,
      relationship: 'Best friend',
      themeId: 'lavender-parade',
      message:
        'Maya, thank you for turning ordinary Tuesdays into small celebrations. May this year bring you back every bit of joy you give away so freely.',
      photos: [],
      musicEnabled: false,
    },
    {
      title: 'Dad’s Garden Party',
      occasion: 'birthday',
      recipientName: 'Robert',
      recipientAge: 62,
      relationship: 'Parent',
      themeId: 'mint-meadow',
      message:
        'Dad, your garden taught me patience and your laugh taught me joy. Wishing you a slow, sunny birthday with cake under the apple tree.',
      photos: [],
      musicEnabled: false,
    },
  ];
}

export async function ensureDemoProjects(userId: UUID | null): Promise<{ seeded: boolean; error: string | null }> {
  try {
    if (LocalStorage.get<string>(SEED_FLAG)) return { seeded: false, error: null };
    const adapter = new LocalProjectAdapter();
    await adapter.initialize();
    const existing: BirthdayProject[] = LocalStorage.get<BirthdayProject[]>(STORAGE_KEYS.PROJECTS_INDEX) ?? [];
    const owned = userId ? existing.filter((p) => p.userId === userId) : existing;
    if (owned.length > 0) {
      LocalStorage.set(SEED_FLAG, '1');
      return { seeded: false, error: null };
    }
    for (const input of starterProjects()) {
      const created = await adapter.create(input, userId);
      if (!created.success || !created.data) {
        return { seeded: false, error: 'Demo projects could not be saved — browser storage may be unavailable.' };
      }
      if (created.data.title === 'Maya Turns 30') {
        await adapter.publish(created.data.id);
      }
    }
    LocalStorage.set(SEED_FLAG, '1');
    return { seeded: true, error: null };
  } catch (error) {
    return {
      seeded: false,
      error: error instanceof Error ? error.message : 'Demo projects could not be created.',
    };
  }
}