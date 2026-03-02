import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  it('should include iOS meta tags in dist/index.html', () => {
    const indexPath = path.resolve(__dirname, '../dist/index.html');
    
    expect(fs.existsSync(indexPath)).toBe(true);
    
    if (fs.existsSync(indexPath)) {
      const indexHtml = fs.readFileSync(indexPath, 'utf-8');
      
      expect(indexHtml).toContain('<meta name="apple-mobile-web-app-capable" content="yes">');
      expect(indexHtml).toContain('<link rel="apple-touch-icon" href="/done-at-timer/pwa-192x192.png">');
      expect(indexHtml).toContain('<meta name="apple-mobile-web-app-status-bar-style" content="default">');
      expect(indexHtml).toContain('<meta name="apple-mobile-web-app-title" content="Done-At">');
      expect(indexHtml).toContain('<link rel="icon" type="image/svg+xml" href="/done-at-timer/icon.svg" />');
    }
  });
});
