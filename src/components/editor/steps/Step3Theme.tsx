/**
 * Step3Theme — Stage 6 editor step 3: Choose a visual theme.
 *
 * Renders a theme card for each registered theme. Selecting a theme updates the
 * editor state; the preview step renders the chosen theme through a single
 * renderer, so the editor is never duplicated per theme.
 */

import { useState } from 'react';
import type { Theme } from '@/types';
import { THEME_REGISTRY, DEMO_TIER, isThemeAccessible } from '@/lib/themes';
import { useEditor } from '@/components/editor/EditorProvider';

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

function ThemeBadge({ theme }: { theme: Theme }) {
  if (theme.tier === 'premium' && DEMO_TIER !== 'premium') {
    return <span className="clay-badge clay-badge-outline text-xs">Premium</span>;
  }
  return <span className="clay-badge clay-badge-success text-xs">Free</span>;
}

export function Step3Theme({ onNext, onPrev }: Props) {
  const { project, updateField, theme: currentTheme, canGoNext } = useEditor();
  const [selectedId, setSelectedId] = useState<string>(project.themeId ?? currentTheme?.id ?? '');

  const handleSelect = (id: string) => {
    const theme = THEME_REGISTRY.find((t) => t.id === id);
    if (!theme || !isThemeAccessible(theme, DEMO_TIER)) return;
    setSelectedId(id);
    updateField('themeId', id);
  };

  return (
    <section className="clay-card p-8 sm:p-12 max-w-4xl mx-auto space-y-8">
      <div>
        <span className="clay-badge clay-badge-primary mb-3 inline-block">Step 3 of 6</span>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Choose a visual theme
        </h1>
        <p className="text-body sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Pick the look & feel of the microsite. Each theme renders the same
          project data differently.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {THEME_REGISTRY.map((theme) => {
          const accessible = isThemeAccessible(theme, DEMO_TIER);
          const isSelected = selectedId === theme.id;
          const locked = !accessible;
          return (
            <div
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={locked ? -1 : 0}
              className={`clay-card cursor-pointer p-5 text-center transition-all ${
                isSelected
                  ? 'clay-tile-selected'
                  : locked
                  ? 'opacity-60 border-[var(--color-text-tertiary)] bg-[var(--color-surface-sunken)]'
                  : ''
              }`}
              style={{
                border: isSelected ? '1px solid var(--color-brand-500)' : '1px solid var(--color-border)',
              }}
            >
              <div
                className="relative mx-auto mb-4 aspect-square rounded-2xl overflow-hidden border border-[var(--color-border)]"
                style={{ width: 96, height: 96, background: theme.colors.background }}
              >
                <img
                  src={theme.previewImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  aria-hidden="true"
                />
                {locked && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                    <span className="text-xs font-bold text-white">Premium</span>
                  </div>
                )}
              </div>
              <h3 className="font-display text-base font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                {theme.name}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">
                {theme.description}
              </p>
              <ThemeBadge theme={theme} />
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[var(--color-text-tertiary)] text-center max-w-md mx-auto">
        Locked themes require a Premium plan. Free themes: Starlit, Keepsake,
        Daydream.
      </p>

      <div className="pt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" className="clay-btn clay-btn-ghost" onClick={onPrev}>
          ← Back
        </button>
        <button
          type="button"
          className="clay-btn clay-btn-primary clay-btn-lg"
          disabled={!canGoNext || !selectedId}
          onClick={onNext}
        >
          Continue →
        </button>
      </div>
    </section>
  );
}
