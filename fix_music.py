import re

with open('src/components/experience/ExperienceMusicPlayer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Audio error in catch block
content = content.replace('setAudioError(Couldn\\'t play audio: );', 'setAudioError(\\Couldn\\'t play audio: \\);')

# Fix 2: linear-gradient styles - use regex with context
# Seek bar pattern
seek_pattern = r'(style=\\{\\{ background: \\\\linear-gradient\\(to right, var\\(--color-brand-500\\) \\\\%, var\\(--color-border\\) \\\\%\\)\\}\\})(?=.*aria-label=\\'Seek\\')'
content = re.sub(seek_pattern, 'style={{\\ackground: linear-gradient(to right, var(--color-brand-500) %, var(--color-border) %)\\}}', content, count=1)

# Music volume pattern
vol_pattern = r'(style=\\{\\{ background: \\\\linear-gradient\\(to right, var\\(--color-brand-500\\) \\\\%, var\\(--color-border\\) \\\\%\\)\\}\\})(?=.*aria-label=\\'Music volume\\')'
content = re.sub(vol_pattern, 'style={{\\ackground: linear-gradient(to right, var(--color-brand-500) %, var(--color-border) %)\\}}', content, count=1)

# SFX volume pattern
sfx_pattern = r'(style=\\{\\{ background: \\\\linear-gradient\\(to right, var\\(--color-brand-500\\) \\\\%, var\\(--color-border\\) \\\\%\\)\\}\\})(?=.*aria-label=\\'Sound effects volume\\')'
content = re.sub(sfx_pattern, 'style={{\\ackground: linear-gradient(to right, var(--color-brand-500) %, var(--color-border) %)\\}}', content, count=1)

# Fix 3: aria-label for sound effect buttons
content = content.replace('aria-label={\\\\Play \\\\ sound\\\\}', 'aria-label={\\Play  sound\\}')

# Fix 4: Audio error onError handler
content = content.replace('onError={(e) => setAudioError(\\\\Audio error: \\\\\\)}', 'onError={(e) => setAudioError(\\Audio error: \\)}')

with open('src/components/experience/ExperienceMusicPlayer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')