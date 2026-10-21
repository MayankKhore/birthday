/** EditorShell — Redesigned creator layout with side‑by‑side preview & form */
import { useCallback, useEffect, useState } from 'react';
import { EditorProvider, useEditor } from '@/components/editor/EditorProvider';
import type { EditorStep } from '@/components/editor/EditorProvider';
import { ProgressIndicator5 } from '@/components/editor/ProgressIndicator5';
import { BottomActionBar } from '@/components/editor/BottomActionBar';
import { PreviewPanel } from '@/components/editor/PreviewPanel';
import { TopNav } from '@/components/layout/TopNav';
import { Step1Occasion } from '@/components/editor/steps/Step1Occasion';
import { Step2Details } from '@/components/editor/steps/Step2Details';
import { Step3Theme } from '@/components/editor/steps/Step3Theme';
import { Step4Photos } from '@/components/editor/steps/Step4Photos';
import { Step5Personalize } from '@/components/editor/steps/Step5Personalize';
import { Step6Music } from '@/components/editor/steps/Step6Music';
import { Step7Advanced } from '@/components/editor/steps/Step7Advanced';
import { Step8Preview } from '@/components/editor/steps/Step8Preview';

type NavStepProps = { onNext: () => void; onPrev: () => void };

const STEP_COMPONENTS: Record<number, React.ComponentType<NavStepProps>> = {
  1: Step1Occasion,
  2: Step2Details,
  3: Step3Theme,
  4: Step4Photos,
  5: Step5Personalize,
  6: Step6Music,
  7: Step7Advanced,
};

function ActiveStep({ onNext, onPrev }: NavStepProps) {
  const { currentStep } = useEditor();
  const StepComp = STEP_COMPONENTS[currentStep];
  if (!StepComp) return null;
  return <StepComp onNext={onNext} onPrev={onPrev} />;
}

function EditorShellInner() {
  const {
    currentStep,
    isDirty,
    canGoNext,
    saveDraft,
    goToStep,
    loadDraft,
  } = useEditor();

  const [beforeUnloadHandler] = useState(() => (e: BeforeUnloadEvent) => {
    if (!isDirty) return;
    e.preventDefault();
    e.returnValue = '';
  });

  useEffect(() => { loadDraft(); }, [loadDraft]);
  useEffect(() => {
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => window.removeEventListener('beforeunload', beforeUnloadHandler);
  }, [beforeUnloadHandler, isDirty]);

  const handleSave = useCallback(async () => { await saveDraft(); }, [saveDraft]);
  const handlePrev = () => { if (currentStep > 1) goToStep((currentStep - 1) as EditorStep); };
  const handleNext = () => { if (currentStep < 8) goToStep((currentStep + 1) as EditorStep); };

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 8;

  return (
    <div className="creator-shell" style={{ background: 'var(--color-page)' }}>
      {/* Top navigation */}
      <TopNav />

      {/* Progress indicator (5 UI steps) */}
      <ProgressIndicator5 />

      {/* Main two‑column layout */}
      <main className="creator-main">
        {/* Left: live preview */}
        <PreviewPanel />

        {/* Right: form / step content */}
        <section className="creator-form" aria-label="Creator form">
          {isLastStep ? (
            <Step8Preview onPrev={handlePrev} />
          ) : (
            <ActiveStep onNext={handleNext} onPrev={handlePrev} />
          )}
        </section>
      </main>

      {/* Bottom action bar */}
      <BottomActionBar
        onSave={handleSave}
        onNext={handleNext}
        onPrev={handlePrev}
        canGoNext={canGoNext}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
      />
    </div>
  );
}

export function EditorShell() {
  return (
    <EditorProvider>
      <EditorShellInner />
    </EditorProvider>
  );
}
