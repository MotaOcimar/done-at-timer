import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PWA Build verification', () => {
  it('should generate a valid manifest.webmanifest in the dist directory', () => {
    const manifestPath = path.resolve(__dirname, '../dist/manifest.webmanifest');
    
    // This will fail because vite-plugin-pwa is not yet configured
    expect(fs.existsSync(manifestPath)).toBe(true);
    
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifest.name).toBe('Done-At Timer');
      expect(manifest.short_name).toBe('Done-At');
      expect(manifest.start_url).toBe('/done-at-timer/');
      expect(manifest.display).toBe('standalone');
      expect(manifest.icons).toContainEqual(expect.objectContaining({
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      }));
    }
  });
});
