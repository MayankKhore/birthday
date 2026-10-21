/** TierComparison — Stage 7 premium tier comparison UI. */

import { MEDIA_TIERS } from '@/lib/media/config';

interface Props {
  /** Current selected tier ID */
  currentTierId?: string;
  /** Callback when user selects a different tier */
  onTierChange?: (tierId: string) => void;
  /** Whether to show as an upgrade prompt (more prominent) */
  isUpgradePrompt?: boolean;
}

/**
 * TierComparison displays the four photo tiers with their limits.
 * Photo limits are centralized in MEDIA_TIERS config.
 */
export function TierComparison({
  currentTierId = 'starter',
  onTierChange,
  isUpgradePrompt = false,
}: Props) {
  return (
    <div className={isUpgradePrompt ? 'space-y-4' : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4'}>
      {MEDIA_TIERS.map((tier) => (
        <div
          key={tier.id}
          className={`clay-card p-5 relative transition-all ${
            currentTierId === tier.id
              ? 'clay-tile-selected ring-2 ring-[var(--color-brand-500)]'
              : ''
          }`}
          style={{
            borderColor:
              currentTierId === tier.id
                ? 'var(--color-brand-500)'
                : 'var(--color-border)',
          }}
        >
          {isUpgradePrompt && currentTierId === tier.id && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <span className="clay-badge clay-badge-primary text-xs">Current</span>
            </div>
          )}

          <div className="text-center mb-4">
            <h3 className="font-display text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {tier.name}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {tier.maxPhotos} photo{tier.maxPhotos !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
              {tier.description}
            </p>
          </div>

          <div className="space-y-2">
            {Array.from({ length: tier.maxPhotos }, (_, i) => i + 1).map((num) => (
              <div
                key={num}
                className={`flex items-center gap-2 h-8 ${
                  currentTierId === tier.id ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div
                  className={`flex-1 h-full rounded border transition-colors ${
                    currentTierId === tier.id
                      ? 'bg-[var(--color-brand-500-10)] border-[var(--color-brand-500)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)]'
                  }`}
                />
              </div>
            ))}
            {currentTierId !== tier.id &&
              tier.maxPhotos > 1 &&
              tier.maxPhotos < 10 && (
                <div className="flex items-center gap-2 h-8 text-center text-[var(--color-text-tertiary)]">
                  <div className="flex-1 h-full border-t border-dashed border-[var(--color-border)]" />
                  <span className="text-xs">+{10 - tier.maxPhotos} more</span>
                </div>
              )}
          </div>

          {onTierChange && currentTierId !== tier.id && (
            <button
              type="button"
              onClick={() => onTierChange(tier.id)}
              className="mt-4 w-full clay-btn clay-btn-primary clay-btn-sm"
            >
              {isUpgradePrompt ? `Upgrade to ${tier.name}` : `Select ${tier.name}`}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
