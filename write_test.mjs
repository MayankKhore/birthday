import fs from "fs";
const content = `import { useCallback, useEffect, useState } from "react";
import type { BirthdayProject, Theme } from "@/types";
import type { ExperienceConfig, ExperienceStage } from "@/lib/experience/types";

interface Props { 
  project: BirthdayProject; 
  theme: Theme; 
  config?: Partial<ExperienceConfig>; 
}

export function BirthdayExperience({ 
  project, 
  theme, 
  config: partialConfig 
}: Props) {
  const [stage, setStage] = useState<ExperienceStage>("entrance");
  const config: ExperienceConfig = { showEnvelope: true, showLetter: true, showParty: true, showCards: true, showClosing: true, cards: [], musicEnabled: false, soundEffectsEnabled: true, confettiEnabled: true, reducedMotion: false, scenes: [] } as ExperienceConfig;
  const recipientName = project.recipientName || "Someone Special";

  const renderScene = () => {
    switch (stage) {
      case "closing":
        if (!config.showClosing) return null;
        return (
          <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center text-center p-6" style={{ background: theme.colors.background }}>
            <div className="clay-icon-btn clay-icon-btn-lg mb-6 animate-scale-in" style={{ background: "rgba(255,255,255,0.1)", color: theme.colors.textOnPrimary }} aria-hidden="true">🎂</div>
            <h2 className="font-display text-3xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>Thanks for celebrating, {recipientName}</h2>
            <p className="text-lg text-[var(--color-text-secondary)] mb-8">The moment has been shared.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return <div>{renderScene()}</div>;
}`;
fs.writeFileSync("minimal_test.tsx", content);
console.log("Written");
