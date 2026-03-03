import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNotification } from './useNotification';
import { NotificationProvider } from '../NotificationContext';
import { NotificationService } from '../utils/notificationService';

describe('useNotification', () => {
  const mocks = {
    requestPermission: vi.fn(),
    notify: vi.fn(),
  };

  const mockService = {
    requestPermission: mocks.requestPermission,
    notify: mocks.notify,
    addNotifier: vi.fn(),
  } as unknown as NotificationService;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <NotificationProvider service={mockService}>
      {children}
    </NotificationProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'Notification', {
      value: { permission: 'default' },
      configurable: true,
    });
  });

  it('should initialize with default permission state', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });
    expect(result.current.permission).toBe('default');
  });

  it('should call requestPermission and update state', async () => {
    mocks.requestPermission.mockResolvedValue('granted');
    const { result } = renderHook(() => useNotification(), { wrapper });

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(mocks.requestPermission).toHaveBeenCalled();
    expect(result.current.permission).toBe('granted');
  });

  it('should call notifyTaskComplete which calls service.notify', async () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    await act(async () => {
      await result.current.notifyTaskComplete('Task 1');
    });

    expect(mocks.notify).toHaveBeenCalledWith('Task Complete!', {
      body: '"Task 1" has finished.',
      icon: '/icon.svg',
      vibrate: [200, 100, 200],
      silent: false,
      requireInteraction: true,
      tag: 'task-complete',
    });
  });
});
