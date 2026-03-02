import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PWAUpdateNotification } from './PWAUpdateNotification';

// Mock the virtual:pwa-register hook
const mockUpdateServiceWorker = vi.fn();
const mockNeedRefresh = vi.fn();

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [mockNeedRefresh(), vi.fn()],
    updateServiceWorker: mockUpdateServiceWorker,
  }),
}));

describe('PWAUpdateNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render anything when no update is available', () => {
    mockNeedRefresh.mockReturnValue(false);
    const { container } = render(<PWAUpdateNotification />);
    expect(container.firstChild).toBeNull();
  });

  it('should render a notification when an update is available', () => {
    mockNeedRefresh.mockReturnValue(true);
    render(<PWAUpdateNotification />);
    expect(screen.getByText(/New content available/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload/i })).toBeInTheDocument();
  });

  it('should call updateServiceWorker(true) when reload button is clicked', () => {
    mockNeedRefresh.mockReturnValue(true);
    render(<PWAUpdateNotification />);
    fireEvent.click(screen.getByRole('button', { name: /Reload/i }));
    expect(mockUpdateServiceWorker).toHaveBeenCalledWith(true);
  });

  it('should hide when close button is clicked', () => {
    mockNeedRefresh.mockReturnValue(true);
    render(<PWAUpdateNotification />);
    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText(/New content available/i)).not.toBeInTheDocument();
  });
});
