import type { ManifestOptions } from 'vite-plugin-pwa';

export const pwaManifest: Partial<ManifestOptions> = {
  name: 'Done-At Timer',
  short_name: 'Done-At',
  description: 'A simple task timer to know when you will be done.',
  theme_color: '#ffffff',
  start_url: '/done-at-timer/',
  display: 'standalone',
  background_color: '#ffffff',
  icons: [
    {
      src: 'pwa-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: 'pwa-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
    {
      src: 'pwa-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
  ],
};
