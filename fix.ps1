$path = "D:\New folder (3)\src\components\editor\steps\Step5Personalize.tsx"
$content = Get-Content $path -Raw

# Move getDefaultSceneConfig before useState
$newFunc = @"
const [soundEffectsEnabled, setSoundEffectsEnabled] = useState<boolean>(true);

  // Scene configuration helper - must be defined before use in useState initializer
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

  // Scene management state
  const [scenes, setScenes] = useState<SceneConfig[]>(() => {
"@

$content = $content -replace "const \[soundEffectsEnabled, setSoundEffectsEnabled\] = useState<boolean>\(true\);\s+// Scene management state\s+const \[scenes, setScenes\] = useState<SceneConfig\[\]>\(\(\) => \{", $newFunc

# Remove the old duplicate function
$oldFunc = @"
const handleBg = (id: string) => {
    setBgTreatment(id);
    updateField('musicTrackId', id);
  };

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
      case 'photo-gallery':
        return { layout: 'grid', photoIds: project.photos?.map(p => p.id) ?? [] };
      case 'mini-game':
        return { gameType: 'memory-match' };
      case 'gift-reveal':
        return { giftConfig: { title: 'A Special Gift for You!', message: 'Open your gift to discover a wonderful surprise...', animationType: 'unwrap' }};
      case 'celebration':
        return { confettiEnabled: true, fireworksEnabled: true, message: 'What an amazing celebration!' };
      default:
        return {};
    }
  };
"@

$newHandleBg = @"
const handleBg = (id: string) => {
    setBgTreatment(id);
    updateField('musicTrackId', id);
  };
"@

$content = $content -replace [regex]::Escape($oldFunc), $newHandleBg

Set-Content -Path $path -Value $content -NoNewline
Write-Host "Done"