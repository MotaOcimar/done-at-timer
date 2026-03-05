// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

describe('PWA Build verification', () => {
  // Skip tests if dist directory doesn't exist (e.g., fresh clone before build)
  const distExists = fs.existsSync(distPath);

  it.runIf(distExists)('should generate a valid manifest.webmanifest in the dist directory', () => {
    const manifestPath = path.resolve(distPath, 'manifest.webmanifest');
    
    expect(fs.existsSync(manifestPath)).toBe(true);
    
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
  });

  it.runIf(distExists)('should include PWA meta tags in dist/index.html', () => {
    const indexPath = path.resolve(distPath, 'index.html');
    
    expect(fs.existsSync(indexPath)).toBe(true);
    
    const indexHtml = fs.readFileSync(indexPath, 'utf-8');
    
    expect(indexHtml).toContain('<meta name="mobile-web-app-capable" content="yes">');
    expect(indexHtml).toContain('<meta name="apple-mobile-web-app-capable" content="yes">');
    expect(indexHtml).toContain('<link rel="apple-touch-icon" href="pwa-192x192.png">');
    expect(indexHtml).toContain('<meta name="apple-mobile-web-app-status-bar-style" content="default">');
    expect(indexHtml).toContain('<meta name="apple-mobile-web-app-title" content="Done-At">');
    expect(indexHtml).toContain('<link rel="icon" type="image/svg+xml" href="icon.svg" />');
  });

  it.runIf(distExists)('should generate a service worker with precaching in the dist directory', () => {
    const swPath = path.resolve(distPath, 'sw.js');
    
    expect(fs.existsSync(swPath)).toBe(true);
    
    const swContent = fs.readFileSync(swPath, 'utf-8');
    // Check if it uses workbox precaching
    expect(swContent).toContain('precacheAndRoute');
    expect(swContent).toContain('index.html');
  });
});
