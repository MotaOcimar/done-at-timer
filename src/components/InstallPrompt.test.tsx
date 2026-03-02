import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InstallPrompt } from './InstallPrompt';

describe('InstallPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window event listeners if needed
  });

  it('should not render when beforeinstallprompt has not fired', () => {
    render(<InstallPrompt />);
    expect(screen.queryByRole('button', { name: /install/i })).not.toBeInTheDocument();
  });

  it('should render when beforeinstallprompt fires', () => {
    render(<InstallPrompt />);
    
    const event = new Event('beforeinstallprompt') as any;
    event.prompt = vi.fn();
    event.userChoice = Promise.resolve({ outcome: 'accepted' });
    
    fireEvent(window, event);
    
    expect(screen.getByRole('button', { name: /install/i })).toBeInTheDocument();
  });

  it('should call prompt() when install button is clicked', async () => {
    render(<InstallPrompt />);
    
    const event = new Event('beforeinstallprompt') as any;
    event.prompt = vi.fn();
    event.userChoice = Promise.resolve({ outcome: 'accepted' });
    
    fireEvent(window, event);
    
    const installBtn = screen.getByRole('button', { name: /install/i });
    fireEvent.click(installBtn);
    
    expect(event.prompt).toHaveBeenCalled();
  });

  it('should hide the button after successful installation', async () => {
    render(<InstallPrompt />);
    
    const event = new Event('beforeinstallprompt') as any;
    event.prompt = vi.fn();
    event.userChoice = Promise.resolve({ outcome: 'accepted' });
    
    fireEvent(window, event);
    
    const installBtn = screen.getByRole('button', { name: /install/i });
    fireEvent.click(installBtn);
    
    // Simulate appinstalled event
    fireEvent(window, new Event('appinstalled'));
    
    expect(screen.queryByRole('button', { name: /install/i })).not.toBeInTheDocument();
  });

  it('should render iOS instructions on iOS', () => {
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
});
