import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InstallPrompt } from './InstallPrompt';

describe('InstallPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when beforeinstallprompt has not fired', () => {
    render(<InstallPrompt />);
    expect(screen.queryByRole('button', { name: /install/i })).not.toBeInTheDocument();
  });

  it('should render when beforeinstallprompt fires', async () => {
    render(<InstallPrompt />);
    
    const event = new Event('beforeinstallprompt') as any;
    event.prompt = vi.fn();
    event.userChoice = Promise.resolve({ outcome: 'accepted' });
    
    await act(async () => {
      window.dispatchEvent(event);
    });
    
    expect(screen.getByRole('button', { name: /install/i })).toBeInTheDocument();
  });

  it('should call prompt() when install button is clicked', async () => {
    render(<InstallPrompt />);
    
    const event = new Event('beforeinstallprompt') as any;
    event.prompt = vi.fn().mockResolvedValue(undefined);
    event.userChoice = Promise.resolve({ outcome: 'accepted' });
    
    await act(async () => {
      window.dispatchEvent(event);
    });
    
    const installBtn = screen.getByRole('button', { name: /install/i });
    await act(async () => {
      fireEvent.click(installBtn);
    });
    
    expect(event.prompt).toHaveBeenCalled();
  });

  it('should hide the banner when user rejects the installation', async () => {
    render(<InstallPrompt />);
    
    const event = new Event('beforeinstallprompt') as any;
    event.prompt = vi.fn().mockResolvedValue(undefined);
    event.userChoice = Promise.resolve({ outcome: 'dismissed' });
    
    await act(async () => {
      window.dispatchEvent(event);
    });
    
    const installBtn = screen.getByRole('button', { name: /install/i });
    await act(async () => {
      fireEvent.click(installBtn);
    });
    
    expect(screen.queryByRole('button', { name: /install/i })).not.toBeInTheDocument();
  });

  it('should hide the banner when close button is clicked', async () => {
    render(<InstallPrompt />);
    
    const event = new Event('beforeinstallprompt') as any;
    event.prompt = vi.fn();
    event.userChoice = Promise.resolve({ outcome: 'accepted' });
    
    await act(async () => {
      window.dispatchEvent(event);
    });
    
    const closeBtn = screen.getByLabelText(/close/i);
    await act(async () => {
      fireEvent.click(closeBtn);
    });
    
    expect(screen.queryByRole('button', { name: /install/i })).not.toBeInTheDocument();
  });

  it('should hide the banner after successful installation (appinstalled event)', async () => {
    render(<InstallPrompt />);
    
    const event = new Event('beforeinstallprompt') as any;
    event.prompt = vi.fn();
    event.userChoice = Promise.resolve({ outcome: 'accepted' });
    
    await act(async () => {
      window.dispatchEvent(event);
    });
    
    await act(async () => {
      window.dispatchEvent(new Event('appinstalled'));
    });
    
    expect(screen.queryByRole('button', { name: /install/i })).not.toBeInTheDocument();
  });

  it('should render iOS instructions on iOS', async () => {
    // Mock iOS user agent
    const originalUserAgent = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      configurable: true,
    });

    render(<InstallPrompt />);
    
    expect(screen.getByText(/Tap/i)).toBeInTheDocument();
    expect(screen.getByText(/Share and then "Add to Home Screen"/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /install/i })).not.toBeInTheDocument();

    // Reset user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    });
  });

  it('should remove event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<InstallPrompt />);
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('appinstalled', expect.any(Function));
  });
});
