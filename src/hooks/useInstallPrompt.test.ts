// @vitest-environment happy-dom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInstallPrompt } from './useInstallPrompt';
import type { BeforeInstallPromptEvent } from './useInstallPrompt';

describe('useInstallPrompt', () => {
  const originalUserAgent = navigator.userAgent;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset matchMedia mock
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    // Reset user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    });
    window.matchMedia = originalMatchMedia;
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isIOS).toBe(false);
    expect(result.current.isStandalone).toBe(false);
  });

  it('should detect standalone mode', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(display-mode: standalone)',
      media: query,
    }));

    const { result } = renderHook(() => useInstallPrompt());
    
    expect(result.current.isStandalone).toBe(true);
  });

  it('should detect beforeinstallprompt event', () => {
    const { result } = renderHook(() => useInstallPrompt());
    
    const event = new Event('beforeinstallprompt') as any;
    event.preventDefault = vi.fn();
    
    act(() => {
      window.dispatchEvent(event);
    });
    
    expect(result.current.isInstallable).toBe(true);
    expect(result.current.isIOS).toBe(false);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should handle appinstalled event', () => {
    const { result } = renderHook(() => useInstallPrompt());
    
    // First trigger installable
    act(() => {
      window.dispatchEvent(new Event('beforeinstallprompt'));
    });
    expect(result.current.isInstallable).toBe(true);
    
    // Then trigger installed
    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });
    expect(result.current.isInstallable).toBe(false);
  });

  it('should detect iOS device', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      configurable: true,
    });

    const { result } = renderHook(() => useInstallPrompt());
    
    expect(result.current.isIOS).toBe(true);
    expect(result.current.isInstallable).toBe(true);
  });

  it('should not show iOS instructions if already in standalone mode', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      configurable: true,
    });
    
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(display-mode: standalone)',
      media: query,
    }));

    const { result } = renderHook(() => useInstallPrompt());
    
    expect(result.current.isIOS).toBe(false);
    expect(result.current.isInstallable).toBe(false);
  });

  it('should prompt installation', async () => {
    const { result } = renderHook(() => useInstallPrompt());
    
    const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
    const promptSpy = vi.fn().mockResolvedValue(undefined);
    const userChoiceMock = Promise.resolve({ outcome: 'accepted', platform: 'web' });
    
    Object.defineProperty(event, 'prompt', { value: promptSpy });
    Object.defineProperty(event, 'userChoice', { value: userChoiceMock });
    
    act(() => {
      window.dispatchEvent(event);
    });
    
    let outcome;
    await act(async () => {
      outcome = await result.current.promptInstall();
    });
    
    expect(promptSpy).toHaveBeenCalled();
    expect(outcome).toBe('accepted');
    expect(result.current.isInstallable).toBe(false);
  });

  it('should hide install prompt', () => {
    const { result } = renderHook(() => useInstallPrompt());
    
    act(() => {
      window.dispatchEvent(new Event('beforeinstallprompt'));
    });
    expect(result.current.isInstallable).toBe(true);
    
    act(() => {
      result.current.hideInstall();
    });
    expect(result.current.isInstallable).toBe(false);
  });
});
