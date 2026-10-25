import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://birthday-platform.example.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    react(),
    tailwind()
  ],
  vite: {
    optimizeDeps: {
      include: ['react', 'react-dom']
    }
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets'
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  }
});