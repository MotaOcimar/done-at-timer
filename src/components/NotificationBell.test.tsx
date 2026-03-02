import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationBell } from './NotificationBell';
import { useNotification } from '../hooks/useNotification';

// Mock useNotification
vi.mock('../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}));

describe('NotificationBell', () => {
  const mockRequestPermission = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNotification as any).mockReturnValue({
      permission: 'default',
      requestPermission: mockRequestPermission,
    });
  });

  it('should render the bell icon when permission is default', () => {
    render(<NotificationBell />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    // Assuming we use a specific icon or title
    expect(screen.getByTitle(/enable notifications/i)).toBeInTheDocument();
  });

  it('should render a different icon or state when permission is granted', () => {
    (useNotification as any).mockReturnValue({
      permission: 'granted',
      requestPermission: mockRequestPermission,
    });
    render(<NotificationBell />);
    expect(screen.getByTitle(/notifications enabled/i)).toBeInTheDocument();
  });

  it('should call requestPermission when clicked and permission is default', () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it('should not render anything if notifications are unsupported', () => {
    (useNotification as any).mockReturnValue({
      permission: 'unsupported',
      requestPermission: mockRequestPermission,
    });
    const { container } = render(<NotificationBell />);
    expect(container.firstChild).toBeNull();
  });
});
