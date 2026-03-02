import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from './notificationService';

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    notificationService = new NotificationService();
    
    // Mock Notification API if it exists in JSDOM, or add it
    if (typeof window.Notification === 'undefined') {
      (window as any).Notification = {
        permission: 'default',
        requestPermission: vi.fn(),
      } as any;
    } else {
      vi.stubGlobal('Notification', {
        permission: 'default',
        requestPermission: vi.fn(),
      });
    }
  });

  describe('requestPermission', () => {
    it('should return current permission if already granted', async () => {
      vi.stubGlobal('Notification', {
        permission: 'granted',
        requestPermission: vi.fn(),
      });
      
      const result = await notificationService.requestPermission();
      expect(result).toBe('granted');
      expect(Notification.requestPermission).not.toHaveBeenCalled();
    });

    it('should request permission if state is default', async () => {
      const requestMock = vi.fn().mockResolvedValue('granted');
      vi.stubGlobal('Notification', {
        permission: 'default',
        requestPermission: requestMock,
      });

      const result = await notificationService.requestPermission();
      expect(requestMock).toHaveBeenCalled();
      expect(result).toBe('granted');
    });

    it('should handle browsers that do not support Notification', async () => {
      vi.stubGlobal('Notification', undefined);
      
      const result = await notificationService.requestPermission();
      expect(result).toBe('unsupported');
    });

    it('should handle errors during requestPermission', async () => {
      vi.stubGlobal('Notification', {
        permission: 'default',
        requestPermission: vi.fn().mockRejectedValue(new Error('Test error')),
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await notificationService.requestPermission();
      
      expect(result).toBe('default');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('notify', () => {
    it('should create a notification if permission is granted', () => {
      const MockNotification = vi.fn();
      vi.stubGlobal('Notification', MockNotification);
      (Notification as any).permission = 'granted';

      notificationService.notify('Test Title', { body: 'Test Body' });

      expect(MockNotification).toHaveBeenCalledWith('Test Title', {
        body: 'Test Body',
      });
    });

    it('should not create a notification if permission is denied', () => {
      const MockNotification = vi.fn();
      vi.stubGlobal('Notification', MockNotification);
      (Notification as any).permission = 'denied';

      notificationService.notify('Test Title');

      expect(MockNotification).not.toHaveBeenCalled();
    });

    it('should not create a notification if unsupported', () => {
      vi.stubGlobal('Notification', undefined);

      notificationService.notify('Test Title');
      // No crash means success
    });

    it('should handle errors during notification creation', () => {
      const MockNotification = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      vi.stubGlobal('Notification', MockNotification);
      (Notification as any).permission = 'granted';

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      notificationService.notify('Test Title');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
