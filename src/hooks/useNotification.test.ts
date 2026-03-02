import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNotification } from './useNotification';
import { NotificationService } from '../utils/notificationService';

// Mock NotificationService
const mocks = vi.hoisted(() => ({
  requestPermission: vi.fn(),
  notify: vi.fn(),
}));

vi.mock('../utils/notificationService', () => {
  return {
    NotificationService: vi.fn().mockImplementation(function() {
      return {
        requestPermission: mocks.requestPermission,
        notify: mocks.notify,
      };
    }),
  };
});

describe('useNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default permission state', async () => {
    // We need to control what the mock returns
    const { result } = renderHook(() => useNotification());
    
    // Permission is usually 'default', 'granted', 'denied' or 'unsupported'
    // We expect the hook to expose this state
    expect(result.current.permission).toBeDefined();
  });

  it('should call requestPermission and update state', async () => {
    mocks.requestPermission.mockResolvedValue('granted');
    const { result } = renderHook(() => useNotification());
    
    await act(async () => {
      const permission = await result.current.requestPermission();
      expect(permission).toBe('granted');
    });

    expect(result.current.permission).toBe('granted');
    expect(mocks.requestPermission).toHaveBeenCalled();
  });

  it('should call notifyTaskComplete which calls service.notify', async () => {
    const { result } = renderHook(() => useNotification());
    
    await act(async () => {
      await result.current.notifyTaskComplete('Task 1');
    });

    expect(mocks.notify).toHaveBeenCalledWith('Task Complete!', {
      body: '"Task 1" has finished.',
      icon: '/icon.svg',
    });
  });
});
