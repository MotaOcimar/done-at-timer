import { describe, it, expect } from 'vitest';
import { pwaManifest } from '../pwa-manifest';

describe('PWA Manifest Configuration', () => {
  it('should have the correct name and description', () => {
    expect(pwaManifest.name).toBe('Done-At Timer');
    expect(pwaManifest.short_name).toBe('Done-At');
    expect(pwaManifest.description).toBe('A simple task timer to know when you will be done.');
  });

  it('should have correct PWA settings', () => {
    expect(pwaManifest.start_url).toBe('/done-at-timer/');
    expect(pwaManifest.display).toBe('standalone');
  });

  it('should include related_applications for PWA installation detection', () => {
    expect(pwaManifest.related_applications).toBeDefined();
    expect(pwaManifest.related_applications).toHaveLength(1);
    expect(pwaManifest.related_applications![0]).toEqual({
      platform: 'webapp',
      url: 'https://motaocimar.github.io/done-at-timer/manifest.webmanifest',
    });
  });

  it('should have mandatory icons', () => {
    expect(pwaManifest.icons).toBeDefined();
    expect(pwaManifest.icons!.length).toBeGreaterThanOrEqual(2);
    
    const icon192 = pwaManifest.icons!.find(i => i.sizes === '192x192');
    const icon512 = pwaManifest.icons!.find(i => i.sizes === '512x512');
    
    expect(icon192).toBeDefined();
    expect(icon512).toBeDefined();
  });
});
