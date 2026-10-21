/**
 * Step7Advanced — Editor step 7: Advanced Settings.
 * Configure confetti, reduced motion, comments, password protection, and scheduled delivery.
 */

import { useEditor } from '@/components/editor/EditorProvider';

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

export function Step7Advanced({ onNext, onPrev }: Props) {
  const {
    confettiEnabled,
    reducedMotion,
    allowComments,
    passwordProtected,
    password,
    scheduledDelivery,
    deliveryDate,
    setConfettiEnabled,
    setReducedMotion,
    setAllowComments,
    setPasswordProtected,
    setPassword,
    setScheduledDelivery,
    setDeliveryDate,
    canGoNext,
  } = useEditor();

  return (
    <section className="clay-card p-8 sm:p-12 max-w-3xl mx-auto space-y-8">
      <div>
        <span className="clay-badge clay-badge-primary mb-3 inline-block">Step 7 of 8</span>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Advanced settings
        </h1>
        <p className="text-body sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Fine-tune the experience with accessibility, privacy, and delivery options.
        </p>
      </div>

      <AdvancedVisualEffects 
        confettiEnabled={confettiEnabled} 
        reducedMotion={reducedMotion}
        setConfettiEnabled={setConfettiEnabled}
        setReducedMotion={setReducedMotion}
      />
      <AdvancedInteraction 
        allowComments={allowComments}
        passwordProtected={passwordProtected}
        password={password}
        setAllowComments={setAllowComments}
        setPasswordProtected={setPasswordProtected}
        setPassword={setPassword}
      />
      <AdvancedDelivery
        scheduledDelivery={scheduledDelivery}
        deliveryDate={deliveryDate}
        setScheduledDelivery={setScheduledDelivery}
        setDeliveryDate={setDeliveryDate}
      />

      <div className="pt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" className="clay-btn clay-btn-ghost" onClick={onPrev}>
          \u2190 Back
        </button>
        <button
          type="button"
          className="clay-btn clay-btn-primary clay-btn-lg"
          disabled={!canGoNext}
          onClick={onNext}
        >
          Continue \u2192
        </button>
      </div>
    </section>
  );
}
function AdvancedVisualEffects({ 
  confettiEnabled, 
  reducedMotion,
  setConfettiEnabled,
  setReducedMotion 
}: { 
  confettiEnabled: boolean; 
  reducedMotion: boolean;
  setConfettiEnabled: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
}) {
  return (
    <div className="space-y-6 border-t pt-6">
      <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Visual effects
      </h2>
      <div className="space-y-4 mt-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confettiEnabled}
            onChange={(e) => setConfettiEnabled(e.target.checked)}
            className="clay-checkbox"
          />
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Enable confetti celebrations
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            className="clay-checkbox"
          />
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Respect prefers-reduced-motion
          </span>
        </label>
      </div>
    </div>
  );
}

function AdvancedInteraction({ 
  allowComments,
  passwordProtected,
  password,
  setAllowComments,
  setPasswordProtected,
  setPassword 
}: { 
  allowComments: boolean;
  passwordProtected: boolean;
  password: string | undefined;
  setAllowComments: (enabled: boolean) => void;
  setPasswordProtected: (enabled: boolean) => void;
  setPassword: (password: string | undefined) => void;
}) {
  return (
    <div className="space-y-6 border-t pt-6">
      <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Interaction & privacy
      </h2>
      <div className="space-y-4 mt-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={allowComments}
            onChange={(e) => setAllowComments(e.target.checked)}
            className="clay-checkbox"
          />
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Allow guest comments (requires backend)
          </span>
        </label>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={passwordProtected}
              onChange={(e) => setPasswordProtected(e.target.checked)}
              className="clay-checkbox"
            />
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Password protect the page
            </span>
          </label>
          {passwordProtected && (
            <div className="ml-6">
              <label className="clay-label block mb-2 font-medium" htmlFor="step7-password">
                Password
              </label>
              <input
                id="step7-password"
                type="password"
                className="clay-input w-full max-w-xs"
                value={password ?? ''}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a password for the recipient"
              />
              <p className="text-xs mt-1 text-[var(--color-text-tertiary)]">
                The recipient will need this password to view the page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdvancedDelivery({
  scheduledDelivery,
  deliveryDate,
  setScheduledDelivery,
  setDeliveryDate
}: {
  scheduledDelivery: boolean;
  deliveryDate: string | undefined;
  setScheduledDelivery: (enabled: boolean) => void;
  setDeliveryDate: (date: string | undefined) => void;
}) {
  return (
    <div className="space-y-6 border-t pt-6">
      <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Scheduled delivery
      </h2>
      <div className="space-y-4 mt-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={scheduledDelivery}
            onChange={(e) => setScheduledDelivery(e.target.checked)}
            className="clay-checkbox"
          />
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Schedule delivery for a specific date
          </span>
        </label>
        {scheduledDelivery && (
          <div className="ml-6">
            <label className="clay-label block mb-2 font-medium" htmlFor="step7-delivery-date">
              Delivery date & time
            </label>
            <input
              id="step7-delivery-date"
              type="datetime-local"
              className="clay-input w-full max-w-xs"
              value={deliveryDate ?? ''}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
            <p className="text-xs mt-1 text-[var(--color-text-tertiary)]">
              The page will become accessible on this date. Requires Premium plan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
