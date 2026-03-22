// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { triggerHaptic } from './haptics';

describe('triggerHaptic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.vibrate
    if (typeof navigator !== 'undefined') {
      (navigator as any).vibrate = vi.fn();
    }
  });

  it('calls navigator.vibrate when available', () => {
    triggerHaptic(15);
    expect(navigator.vibrate).toHaveBeenCalledWith(15);
  });

  it('defaults to 10ms', () => {
    triggerHaptic();
    expect(navigator.vibrate).toHaveBeenCalledWith(10);
  });

  it('no-ops when navigator.vibrate is not available', () => {
    const originalVibrate = navigator.vibrate;
    delete (navigator as any).vibrate;
    
    expect(() => triggerHaptic()).not.toThrow();
    
    // Restore for other tests
    (navigator as any).vibrate = originalVibrate;
  });
});
