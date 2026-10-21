/**
 * BirthdayExperience — modular recipient-facing scene renderer.
 *
 * A real scene queue (array order, duplicates allowed) drives the journey:
 * envelope → letter → cake → storybook → gallery → mini-games → gift → finale.
 * Each scene gets a HUD (progress, restart) and a render key so replaying a
 * scene always starts it fresh. Sound effects are wired to the moments.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BirthdayProject, Theme } from '@/types';
import type { ExperienceConfig, SceneConfig } from '@/lib/experience/types';
import { DEFAULT_EXPERIENCE_CONFIG } from '@/lib/experience/types';
import { personalizeProjectView } from '@/lib/experience/personalize';
import { playSfx, unlockAudio } from '@/lib/media/sound';
import { EnvelopeOpener } from './EnvelopeOpener';
import { LetterScene } from './LetterScene';
import { CakeCelebration } from './CakeCelebration';
import { CardSequence } from './CardSequence';
import { Confetti } from './Confetti';
import { Balloons } from './Balloons';
import { StorybookCard } from './StorybookCard';
import { GiftRevealCard } from './GiftRevealCard';
import { ExperienceMusicPlayer } from './ExperienceMusicPlayer';
import { PhotoGalleryScene } from './PhotoGalleryScene';

interface Props {
  project: BirthdayProject;
  theme: Theme;
  config?: Partial<ExperienceConfig>;
  onMusicToggle?: () => void;
  onRestart?: () => void;
  onClose?: () => void;
}

const SCENE_LABELS: Record<string, string> = {
  envelope: 'Envelope',
  letter: 'Letter',
  cake: 'Cake',
  storybook: 'Storybook',
  'photo-gallery': 'Photos',
  'mini-game': 'Game',
  'gift-reveal': 'Gift',
  celebration: 'Finale',
};

export function BirthdayExperience({
  project, theme, config: partialConfig, onMusicToggle, onRestart, onClose,
}: Props): React.ReactElement {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [runId, setRunId] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBalloons, setShowBalloons] = useState(false);

  const config: ExperienceConfig = { ...DEFAULT_EXPERIENCE_CONFIG, ...partialConfig };

  const queue: SceneConfig[] = useMemo(() => {
    const scenes = (config.scenes ?? []).filter((s) => s.enabled);
    return [...scenes].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [config.scenes]);

  const personalized = useMemo(() => personalizeProjectView(project), [project]);
  const recipientName = personalized.name;
  const sfxEnabled = config.soundEffectsEnabled !== false;
  const showHud = sceneIndex > 0 && sceneIndex < queue.length;
  const currentScene = queue[sceneIndex];
  const gameScenesSoFar = queue.slice(0, sceneIndex + 1).filter((s) => s.type === 'mini-game').length;
  const totalGames = queue.filter((s) => s.type === 'mini-game').length;

  const sfx = useCallback((...args: Parameters<typeof playSfx>) => {
    if (sfxEnabled) playSfx(...args);
  }, [sfxEnabled]);

  const advance = useCallback(() => {
    unlockAudio();
    setSceneIndex((i) => i + 1);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const goTo = useCallback((index: number) => {
    unlockAudio();
    setRunId((r) => r + 1);
    setSceneIndex(index);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleRestart = useCallback(() => {
    setShowConfetti(false);
    setShowBalloons(false);
    setMusicPlaying(false);
    setRunId((r) => r + 1);
    setSceneIndex(0);
    window.scrollTo({ top: 0, behavior: 'auto' });
    onRestart?.();
  }, [onRestart]);

  const handleMusic = useCallback((playing: boolean) => {
    setMusicPlaying(playing);
    onMusicToggle?.();
  }, [onMusicToggle]);

  const handleCakeComplete = useCallback(() => {
    sfx('fanfare');
    setShowConfetti(true);
    window.setTimeout(() => advance(), 900);
  }, [advance, sfx]);

  const gameCard = currentScene?.gameConfig;
  const storyScene = currentScene?.type === 'storybook' ? currentScene : undefined;
  const storyChapters = storyScene?.chapters && storyScene.chapters.length > 0
    ? storyScene.chapters
    : personalized.storyChapters;

  const quizQuestions = gameCard?.type === 'quiz' && gameCard.questions && gameCard.questions.length > 0
    ? gameCard.questions
    : personalized.quizQuestions;

  const renderCurrentScene = (): React.ReactElement | null => {
    if (!currentScene) return null;
    const key = `${runId}-${currentScene.id}`;
    switch (currentScene.type) {
      case 'envelope':
        return <EnvelopeOpener key={key} project={project} reducedMotion={false} onOpen={() => { sfx('chime'); advance(); }} />;
      case 'letter':
        return (
          <LetterScene
            key={key}
            letterText={personalized.letterText}
            recipientName={recipientName}
            sfxEnabled={sfxEnabled}
            reducedMotion={false}
            onComplete={() => advance()}
          />
        );
      case 'cake':
        return (
          <CakeCelebration
            key={key}
            project={project}
            confettiEnabled={config.confettiEnabled}
            reducedMotion={false}
            candleCount={currentScene.candleCount ?? 5}
            enableMicrophoneBlow={currentScene.enableMicrophoneBlow !== false}
            onComplete={handleCakeComplete}
          />
        );
      case 'storybook':
        return (
          <div key={key} className="fixed inset-0 z-[500] flex flex-col items-center justify-center p-6 overflow-y-auto" style={{ background: 'var(--color-page)' }}>
            <div className="w-full max-w-md">
              <StorybookCard
                project={project}
                config={{ chapters: storyChapters }}
                onComplete={() => { sfx('chime'); advance(); }}
                reducedMotion={false}
              />
            </div>
          </div>
        );
      case 'photo-gallery':
        return (
          <PhotoGalleryScene
            key={key}
            photos={project.photos ?? []}
            recipientName={recipientName}
            sfxEnabled={sfxEnabled}
            onComplete={() => { sfx('chime'); advance(); }}
          />
        );
      case 'mini-game': {
        const gameType = gameCard?.type ?? currentScene.gameType ?? 'roulette';
        const label = gameType === 'roulette' ? 'Prize Roulette' : gameType === 'quiz' ? 'Birthday Quiz' : 'Memory Match';
        return (
          <div key={key} className="fixed inset-0 z-[500] flex flex-col items-center justify-center p-6 overflow-y-auto" style={{ background: 'var(--color-page)' }}>
            <div className="w-full max-w-md">
              <p className="text-xs font-semibold uppercase text-center" style={{ letterSpacing: 'var(--tracking-widest)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-3)' }}>
                Game {Math.max(1, gameScenesSoFar)} of {Math.max(1, totalGames)} · {label}
              </p>
              <CardSequence
                project={project}
                cards={[{
                  id: currentScene.id,
                  type: gameType,
                  title: label,
                  enabled: true,
                  sortOrder: 0,
                  ...(gameType === 'quiz' ? { questions: quizQuestions } : {}),
                  ...(gameType === 'memory-match' ? { gridSize: 8 } : {}),
                  ...(gameType === 'roulette' && gameCard?.messages ? { messages: gameCard.messages } : {}),
                }]}
                onComplete={() => { sfx('fanfare'); advance(); }}
                reducedMotion={false}
              />
            </div>
          </div>
        );
      }
      case 'gift-reveal':
        return (
          <div key={key} className="fixed inset-0 z-[500] flex flex-col items-center justify-center p-6 overflow-y-auto" style={{ background: 'var(--color-page)' }}>
            <div className="w-full max-w-md">
              <GiftRevealCard
                project={project}
                config={currentScene.giftConfig ? { giftConfig: currentScene.giftConfig } : {}}
                onComplete={() => { sfx('fanfare'); advance(); }}
                reducedMotion={false}
              />
            </div>
          </div>
        );
      case 'celebration':
        return (
          <CelebrationScene
            key={key}
            recipientName={recipientName}
            project={project}
            onRestart={handleRestart}
            onClose={onClose}
            onCelebrate={() => { sfx('fanfare'); setShowConfetti(true); setShowBalloons(true); }}
          />
        );
      default:
        return null;
    }
  };

  const finished = sceneIndex >= queue.length;

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ background: theme.colors.background }}>
      <div className="absolute inset-0 -z-10" style={{ background: theme.colors.gradient }} />
      {showConfetti && <Confetti active count={80} duration={2600} />}
      {showBalloons && <Balloons active count={14} />}

      {showHud && currentScene ? (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 550,
            background: 'rgba(250, 247, 242, 0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between gap-3" style={{ maxWidth: '720px', margin: '0 auto', padding: 'var(--space-2) var(--space-4)' }}>
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              {sceneIndex + 1} of {queue.length} · {SCENE_LABELS[currentScene.type] ?? currentScene.type}
            </span>
            <button type="button" className="clay-btn clay-btn-ghost clay-btn-sm" onClick={() => goTo(0)} aria-label="Restart from the beginning">
              Restart
            </button>
          </div>
          <div className="clay-progress" style={{ borderRadius: 0 }} aria-hidden="true">
            <div className="clay-progress-bar" style={{ width: `${Math.round(((sceneIndex + 1) / Math.max(1, queue.length)) * 100)}%` }} />
          </div>
        </div>
      ) : null}

      {finished ? (
        <CelebrationScene
          key={`finale-${runId}`}
          recipientName={recipientName}
          project={project}
          onRestart={handleRestart}
          onClose={onClose}
          onCelebrate={() => { sfx('fanfare'); setShowConfetti(true); setShowBalloons(true); }}
          onViewPage={() => { window.location.href = `/preview/${project.id}`; }}
        />
      ) : (
        renderCurrentScene()
      )}

      {(config.musicEnabled || config.soundEffectsEnabled) && (
        <ExperienceMusicPlayer
          project={project}
          soundEffectsEnabled={config.soundEffectsEnabled}
          onMusicToggle={handleMusic}
        />
      )}
      <span className="sr-only" role="status">{musicPlaying ? 'Music playing' : 'Music off'}</span>
    </div>
  );
}

function CelebrationScene({ recipientName, project, onRestart, onClose, onCelebrate, onViewPage }: {
  recipientName: string;
  project: BirthdayProject;
  onRestart?: () => void;
  onClose?: () => void;
  onCelebrate: () => void;
  onViewPage?: () => void;
}): React.ReactElement {
  const [celebrated, setCelebrated] = useState(false);
  const celebrate = (): void => {
    if (celebrated) return;
    setCelebrated(true);
    onCelebrate();
  };
  return (
    <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center text-center p-6 overflow-y-auto" style={{ background: 'var(--color-page)' }}>
      <div className="w-full max-w-md">
        <div className="clay-icon-btn clay-icon-btn-lg mx-auto animate-pop" style={{ background: 'var(--color-gold-soft)', color: 'var(--color-gold-deep)', marginBottom: 'var(--space-5)' }} aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3c0 4.7 3.6 8.3 8.3 8.3v1.4C15.6 12.7 12 16.3 12 21c0-4.7-3.6-8.3-8.3-8.3v-1.4C8.4 11.3 12 7.7 12 3z" /></svg>
        </div>
        <p className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>The grand finale</p>
        <h2 className="font-display font-bold" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
          Happy birthday, {recipientName}!
        </h2>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          {(project.customMessage ? project.customMessage.split('\n')[0] : project.message) || 'What an amazing celebration!'}
        </p>
        {!celebrated ? (
          <button type="button" className="clay-btn clay-btn-primary clay-btn-lg animate-pulse" onClick={celebrate} aria-label="Celebrate">
            Celebrate! 🎉
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-scale-in">
            <button type="button" className="clay-btn clay-btn-primary clay-btn-lg" onClick={onRestart} aria-label="Experience again">
              Experience again
            </button>
            {onViewPage ? (
              <button type="button" className="clay-btn clay-btn-secondary clay-btn-lg" onClick={onViewPage} aria-label="View birthday page">
                View birthday page
              </button>
            ) : null}
            {onClose ? (
              <button type="button" className="clay-btn clay-btn-ghost clay-btn-lg" onClick={onClose} aria-label="Close">
                Close
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}


