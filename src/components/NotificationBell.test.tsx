// @vitest-environment happy-dom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationBell } from './NotificationBell';
import { useNotification } from '../hooks/useNotification';

// Mock the hook
vi.mock('../hooks/useNotification');

describe('NotificationBell', () => {
  const mockRequestPermission = vi.fn();
  const mockNotifyTaskComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the bell icon when permission is default', () => {
    (useNotification as any).mockReturnValue({
      permission: 'default',
      requestPermission: mockRequestPermission,
      notifyTaskComplete: mockNotifyTaskComplete,
    });

    render(<NotificationBell />);
    expect(screen.getByRole('button', { name: /enable notifications/i })).toBeInTheDocument();
  });

  it('should render a different icon or state when permission is granted', () => {
    (useNotification as any).mockReturnValue({
      permission: 'granted',
      requestPermission: mockRequestPermission,
      notifyTaskComplete: mockNotifyTaskComplete,
    });
    render(<NotificationBell />);
    expect(screen.getByTitle(/notifications enabled/i)).toBeInTheDocument();
  });

  it('should call requestPermission when clicked and permission is default', () => {
    (useNotification as any).mockReturnValue({
      permission: 'default',
      requestPermission: mockRequestPermission,
      notifyTaskComplete: mockNotifyTaskComplete,
    });

    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it('should not render anything if notifications are unsupported', () => {
    (useNotification as any).mockReturnValue({
      permission: 'unsupported',
      requestPermission: mockRequestPermission,
      notifyTaskComplete: mockNotifyTaskComplete,
    });

    const { container } = render(<NotificationBell />);
    expect(container.firstChild).toBeNull();
  });
});
