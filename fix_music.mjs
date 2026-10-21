import fs from 'fs';
let content = fs.readFileSync('src/components/experience/ExperienceMusicPlayer.tsx', 'utf8');

// Fix escaped strings
content = content.replace(/\\Couldn't play audio: \\/g, 'Couldn\'t play audio: ');
content = content.replace(/\\Audio error: \$\{(e.target as HTMLAudioElement).error\?.\message \?\? 'Unknown'\}\//g, 'Audio error: \$\{(e.target as HTMLAudioElement).error?.message ?? \"Unknown\"\}');

fs.writeFileSync('src/components/experience/ExperienceMusicPlayer.tsx', content);
console.log('Fixed music player');
