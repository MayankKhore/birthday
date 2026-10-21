/**
 * Step5Personalize — Stage 12 editor step 5: Personalize the experience.
 *
 * Edit message text, background treatment, decorative elements, music,
 * and configure interactive scenes. Users can enable/disable/reorder scenes.
 * Uses MusicPlayer for audio selection and playback controls.
 */

import { useState } from 'react';
import { useEditor } from '@/components/editor/EditorProvider';
import { MusicPlayer } from '@/components/editor/MusicPlayer';
import { getSceneTypeInfo, SCENE_TYPE_REGISTRY } from '@/lib/experience/config';
import type { SceneConfig, SceneType } from '@/lib/experience/types';
import { createUUID } from '@/types';

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

const BG_OPTIONS = [
  { id: 'gradient', label: 'Gradient', hint: 'Soft two-tone background' },
  { id: 'solid', label: 'Solid color', hint: 'Clean flat background' },
  { id: 'photo', label: 'Photo', hint: 'Use a photo as background' },
];

const DECOR_OPTIONS = [
  { id: 'stars', label: 'Stars', hint: 'Twinkling stars in the background' },
  { id: 'hearts', label: 'Hearts', hint: 'Floating hearts' },
  { id: 'confetti', label: 'Confetti', hint: 'Celebration confetti' },
  { id: 'none', label: 'None', hint: 'No decorations' },
];

// Scene configuration UI
const SCENE_OPTIONS = SCENE_TYPE_REGISTRY.filter(s => s.type !== 'celebration'); // Celebration is always last

export function Step5Personalize({ onNext, onPrev }: Props) {
  const {
    project,
    updateField,
    theme,
    canGoNext,
    cards,
    setCards,
    reorderCards,
    scenes,
    setScenes,
    addScene,
    removeScene,
    updateScene,
    reorderScenes: reorderScenesGlobal,
  } = useEditor();
  
  const [bgTreatment, setBgTreatment] = useState<string>(() => String(project.musicTrackId ?? 'gradient'));
  const [decoration, setDecoration] = useState<string>('none');
  const [revealMessage, setRevealMessage] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [revealText, setRevealText] = useState<string>(() => String((project as { revealMessage?: string }).revealMessage ?? ''));
  const [confettiEnabled, setConfettiEnabled] = useState<boolean>(() => !!theme?.animations.enableConfetti);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState<boolean>(true);

  const getDefaultSceneConfig = (type: SceneType): Partial<SceneConfig> => {
    switch (type) {
      case 'cake':
        return { candleCount: 3, enableMicrophoneBlow: true };
      case 'storybook':
        return { chapters: [
          { id: createUUID() as any, title: 'Once Upon a Time...', text: 'In a world not so far away, there lived someone truly special...' },
          { id: createUUID() as any, title: 'The Adventure Begins', text: 'Every year brought new adventures, laughter, and wonderful memories.' },
          { id: createUUID() as any, title: 'A Special Day', text: 'And today, the whole world celebrates YOU!' }
        ]};
      case 'memory-lane':
        return { photos: [], captions: [] };
      case 'wishes':
        return { wishCount: 3, allowCustomWishes: true };
      case 'mini-game':
        return { gameType: 'tap-cake', difficulty: 'easy' };
      case 'gift-reveal':
        return { title: 'A Special Gift for You!', message: 'Open your gift to discover a wonderful surprise...', animationType: 'unwrap' };
      case 'envelope':
        return { envelopeStyle: 'wax-seal' };
      case 'letter':
        return { handwrittenFont: true };
      case 'celebration':
        return { message: 'What an amazing celebration!', confettiEnabled: true, fireworksEnabled: true };
      default:
        return {};
    }
  };

  const [expandedSceneId, setExpandedSceneId] = useState<string | null>(null);

  const handleBg = (id: string) => {
    setBgTreatment(id);
    updateField('musicTrackId', id);
  };

  const toggleScene = (sceneId: string) => {
    setScenes(prev => prev.map(s => 
      s.id === sceneId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const reorderScenes = (sceneIds: string[]) => {
    reorderScenesGlobal(sceneIds);
  };

  const onUpdate = (sceneId: string, config: Partial<SceneConfig>) => {
    updateScene(sceneId, config);
  };

  const renderSceneConfig = (scene: SceneConfig) => {
    const sceneInfo = getSceneTypeInfo(scene.type);
    if (!sceneInfo) return null;
    
    switch (scene.type) {
      case 'cake':
        return (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-1' style={{ color: 'var(--color-text-primary)' }}>Candle count</label>
              <select value={scene.candleCount ?? 3} onChange={(e) => onUpdate(scene.id, { candleCount: parseInt(e.target.value) })} className='clay-input w-full sm:w-auto'>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>
            <div className='flex items-center gap-2 cursor-pointer'>
              <input type='checkbox' checked={scene.enableMicrophoneBlow ?? true} onChange={(e) => onUpdate(scene.id, { enableMicrophoneBlow: e.target.checked })} className='clay-checkbox' />
              <span className='text-sm' style={{ color: 'var(--color-text-primary)' }}>Enable microphone blow</span>
            </div>
          </div>
        );
      case 'storybook':
        return (
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <label className='block text-sm font-medium' style={{ color: 'var(--color-text-primary)' }}>Chapters</label>
              <button onClick={() => {
                const newChapters = [...(scene.chapters ?? []), { id: createUUID() as any, title: `Chapter ${(scene.chapters?.length ?? 0) + 1}`, text: '' }];
                onUpdate(scene.id, { chapters: newChapters });
              }} className='text-sm text-primary hover:underline'>
                + Add chapter
              </button>
            </div>
            {scene.chapters?.map((chapter, idx) => (
              <div key={chapter.id ?? idx} className='space-y-2 p-3 border rounded-lg' style={{ borderColor: 'var(--color-border)' }}>
                <div className='flex items-center justify-between'>
                  <input type='text' value={chapter.title ?? ''} onChange={(e) => {
                    const newChapters = [...(scene.chapters ?? [])];
                    newChapters[idx] = { ...newChapters[idx], title: e.target.value };
                    onUpdate(scene.id, { chapters: newChapters });
                  }} className='clay-input flex-1 mr-2' placeholder='Chapter title' />
                  <button onClick={() => {
                    const newChapters = (scene.chapters ?? []).filter((_, i) => i !== idx);
                    onUpdate(scene.id, { chapters: newChapters });
                  }} className='text-sm text-error hover:underline'>
                    Remove
                  </button>
                </div>
                <textarea value={chapter.text ?? ''} onChange={(e) => {
                  const newChapters = [...(scene.chapters ?? [])];
                  newChapters[idx] = { ...newChapters[idx], text: e.target.value };
                  onUpdate(scene.id, { chapters: newChapters });
                }} className='clay-input w-full min-h-[60px] resize-y' placeholder='Chapter content...' />
              </div>
            ))}
          </div>
        );
      case 'memory-lane':
        return (
          <div className='space-y-2'>
            <label className='block text-sm font-medium mb-1' style={{ color: 'var(--color-text-primary)' }}>Layout</label>
            <select value={scene.layout ?? 'grid'} onChange={(e) => onUpdate(scene.id, { layout: e.target.value as any })} className='clay-input w-full sm:w-auto'>
              <option value='grid'>Grid</option>
              <option value='carousel'>Carousel</option>
              <option value='masonry'>Masonry</option>
            </select>
          </div>
        );
      case 'wishes':
        return (
          <div className='space-y-2'>
            <div>
              <label className='block text-sm font-medium mb-1' style={{ color: 'var(--color-text-primary)' }}>Number of wishes</label>
              <select value={scene.wishCount ?? 3} onChange={(e) => onUpdate(scene.id, { wishCount: parseInt(e.target.value) })} className='clay-input w-full sm:w-auto'>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>
            <div className='flex items-center gap-2 cursor-pointer'>
              <input type='checkbox' checked={scene.allowCustomWishes ?? true} onChange={(e) => onUpdate(scene.id, { allowCustomWishes: e.target.checked })} className='clay-checkbox' />
              <span className='text-sm' style={{ color: 'var(--color-text-primary)' }}>Allow custom wishes</span>
            </div>
          </div>
        );
      case 'mini-game':
        return (
          <div className='space-y-2'>
            <label className='block text-sm font-medium mb-1' style={{ color: 'var(--color-text-primary)' }}>Game type</label>
            <select value={scene.gameType ?? 'tap-cake'} onChange={(e) => onUpdate(scene.id, { gameType: e.target.value as any })} className='clay-input w-full sm:w-auto'>
              <option value='tap-cake'>Tap the Cake</option>
              <option value='memory-match'>Memory Match</option>
              <option value='whack-balloon'>Whack-a-Balloon</option>
            </select>
            <label className='block text-sm font-medium mb-1' style={{ color: 'var(--color-text-primary)' }}>Difficulty</label>
            <select value={scene.difficulty ?? 'easy'} onChange={(e) => onUpdate(scene.id, { difficulty: e.target.value as any })} className='clay-input w-full sm:w-auto'>
              <option value='easy'>Easy</option>
              <option value='medium'>Medium</option>
              <option value='hard'>Hard</option>
            </select>
          </div>
        );
      case 'gift-reveal':
        return (
          <div className='space-y-4'>
            <label className='block text-sm font-medium mb-1' style={{ color: 'var(--color-text-primary)' }}>Animation type</label>
            <select value={scene.animationType ?? 'unwrap'} onChange={(e) => onUpdate(scene.id, { animationType: e.target.value as any })} className='clay-input w-full sm:w-auto'>
              <option value='unwrap'>Unwrap</option>
              <option value='fade'>Fade in</option>
              <option value='pop'>Pop</option>
              <option value='slide'>Slide up</option>
            </select>
          </div>
        );
      case 'celebration':
        return (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-1' style={{ color: 'var(--color-text-primary)' }}>Closing message</label>
              <textarea value={scene.message ?? ''} onChange={(e) => onUpdate(scene.id, { message: e.target.value })} className='clay-input w-full min-h-[60px] resize-y' placeholder='What an amazing celebration!' />
            </div>
            <div className='grid gap-2 sm:grid-cols-2'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input type='checkbox' checked={scene.confettiEnabled ?? true} onChange={(e) => onUpdate(scene.id, { confettiEnabled: e.target.checked })} className='clay-checkbox' />
                <span>Confetti</span>
              </label>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input type='checkbox' checked={scene.fireworksEnabled ?? true} onChange={(e) => onUpdate(scene.id, { fireworksEnabled: e.target.checked })} className='clay-checkbox' />
                <span>Fireworks</span>
              </label>
            </div>
          </div>
        );
      case 'envelope':
        return (
          <div className='space-y-2'>
            <label className='block text-sm font-medium mb-1' style={{ color: 'var(--color-text-primary)' }}>Envelope style</label>
            <select value={scene.envelopeStyle ?? 'wax-seal'} onChange={(e) => onUpdate(scene.id, { envelopeStyle: e.target.value as any })} className='clay-input w-full sm:w-auto'>
              <option value='classic'>Classic</option>
              <option value='modern'>Modern</option>
              <option value='wax-seal'>Wax Seal</option>
            </select>
          </div>
        );
      case 'letter':
        return (
          <div className='space-y-2'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input type='checkbox' checked={scene.handwrittenFont ?? true} onChange={(e) => onUpdate(scene.id, { handwrittenFont: e.target.checked })} className='clay-checkbox' />
              <span className='text-sm' style={{ color: 'var(--color-text-primary)' }}>Use handwritten font style</span>
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-2xl font-bold mb-2' style={{ color: 'var(--color-text-primary)' }}>Personalize</h2>
        <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>Add your personal touch with messages, backgrounds, music, and interactive scenes.</p>
      </div>

      {/* Background Treatment */}
      <div className='clay-card p-6'>
        <h3 className='text-lg font-semibold mb-4' style={{ color: 'var(--color-text-primary)' }}>Background</h3>
        <div className='grid gap-4 sm:grid-cols-3'>
          {BG_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => handleBg(opt.id)} className={`clay-card p-4 text-left transition-all ${bgTreatment === opt.id ? 'ring-2' : ''}`} style={{ ringColor: 'var(--color-primary)' }}>
              <div className='font-medium mb-1' style={{ color: 'var(--color-text-primary)' }}>{opt.label}</div>
              <div className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>{opt.hint}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Reveal Message */}
      <div className='clay-card p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold' style={{ color: 'var(--color-text-primary)' }}>Reveal Message</h3>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input type='checkbox' checked={revealMessage} onChange={(e) => setRevealMessage(e.target.checked)} className='clay-checkbox' />
            <span className='text-sm'>Show reveal message</span>
          </label>
        </div>
        {revealMessage && (
          <textarea value={revealText} onChange={(e) => setRevealText(e.target.value)} className='clay-input w-full min-h-[80px] resize-y' placeholder='Enter the message shown when the experience is revealed...' />
        )}
      </div>

      {/* Confetti & Sound Effects */}
      <div className='clay-card p-6'>
        <h3 className='text-lg font-semibold mb-4' style={{ color: 'var(--color-text-primary)' }}>Effects</h3>
        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input type='checkbox' checked={confettiEnabled} onChange={(e) => { setConfettiEnabled(e.target.checked); updateField('confettiEnabled', e.target.checked); }} className='clay-checkbox' />
            <span className='text-sm' style={{ color: 'var(--color-text-primary)' }}>Confetti on reveal</span>
          </label>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input type='checkbox' checked={soundEffectsEnabled} onChange={(e) => setSoundEffectsEnabled(e.target.checked)} className='clay-checkbox' />
            <span className='text-sm' style={{ color: 'var(--color-text-primary)' }}>Sound effects</span>
          </label>
        </div>
      </div>

      {/* Scene Configuration */}
      <div className='clay-card p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold' style={{ color: 'var(--color-text-primary)' }}>Interactive Scenes</h3>
          <span className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>
            Drag to reorder • Click to expand • Toggle to enable/disable
          </span>
        </div>
        
        <div className='space-y-3'>
          {scenes.map((scene, index) => {
            const sceneInfo = getSceneTypeInfo(scene.type);
            const isExpanded = expandedSceneId === scene.id;
            return (
              <div key={scene.id} className='clay-card'>
                <div className='flex items-center gap-3 p-4' style={{ backgroundColor: isExpanded ? 'var(--color-surface-hover)' : 'transparent' }}>
                  <button onClick={() => setExpandedSceneId(isExpanded ? null : scene.id)} className='p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700' aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                    {isExpanded ? '▲' : '▼'}
                  </button>
                  <div className='flex items-center gap-2 flex-1'>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <input type='checkbox' checked={scene.enabled} onChange={() => toggleScene(scene.id)} className='clay-checkbox' />
                      <span className='font-medium' style={{ color: 'var(--color-text-primary)' }}>{sceneInfo?.label ?? scene.type}</span>
                    </label>
                    <span className='text-xs px-2 py-1 rounded' style={{ backgroundColor: scene.enabled ? 'var(--color-success-bg)' : 'var(--color-muted-bg)', color: scene.enabled ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                      {scene.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button onClick={() => index > 0 && reorderScenes([...scenes].sort((a,b) => a.sortOrder - b.sortOrder).map((s,i) => i === index ? scenes[index-1].id : i === index-1 ? scenes[index].id : s.id))} disabled={index === 0} className='p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50' aria-label='Move up'>↑</button>
                    <button onClick={() => index < scenes.length - 1 && reorderScenes([...scenes].sort((a,b) => a.sortOrder - b.sortOrder).map((s,i) => i === index ? scenes[index+1].id : i === index+1 ? scenes[index].id : s.id))} disabled={index === scenes.length - 1} className='p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50' aria-label='Move down'>↓</button>
                  </div>
                </div>
                {isExpanded && (
                  <div className='px-4 pb-4 border-t' style={{ borderColor: 'var(--color-border)' }}>
                    {renderSceneConfig(scene)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className='flex justify-between pt-4'>
        <button onClick={onPrev} className='clay-btn clay-btn-secondary'>
          Previous
        </button>
        <button onClick={onNext} className='clay-btn clay-btn-primary' disabled={!canGoNext}>
          Next
        </button>
      </div>
    </div>
  );
}
