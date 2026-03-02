import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService, BrowserNotifier } from './notificationService';

describe('BrowserNotifier', () => {
  let browserNotifier: BrowserNotifier;

  beforeEach(() => {
    vi.clearAllMocks();
    browserNotifier = new BrowserNotifier();
    
    // Mock Notification API
    vi.stubGlobal('Notification', {
      permission: 'default',
      requestPermission: vi.fn(),
    });
  });

  it('should create a notification if permission is granted', async () => {
    const MockNotification = vi.fn();
    vi.stubGlobal('Notification', MockNotification);
    (window.Notification as any).permission = 'granted';

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await browserNotifier.notify('Test Title', { body: 'Test Body' });

    expect(MockNotification).toHaveBeenCalledWith('Test Title', {
      body: 'Test Body',
    });
    consoleSpy.mockRestore();
  });

  it('should not create a notification if permission is denied', async () => {
    const MockNotification = vi.fn();
    vi.stubGlobal('Notification', MockNotification);
    (window.Notification as any).permission = 'denied';

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await browserNotifier.notify('Test Title');

    expect(MockNotification).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    notificationService = new NotificationService();
    
    // Mock Notification API
    vi.stubGlobal('Notification', {
      permission: 'default',
      requestPermission: vi.fn(),
    });
  });

  describe('requestPermission', () => {
    it('should return current permission if already granted', async () => {
      vi.stubGlobal('Notification', {
        permission: 'granted',
        requestPermission: vi.fn(),
      });
      
      const result = await notificationService.requestPermission();
      expect(result).toBe('granted');
      expect(window.Notification.requestPermission).not.toHaveBeenCalled();
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
    it('should call all registered notifiers', async () => {
      const mockNotifier1 = { notify: vi.fn() };
      const mockNotifier2 = { notify: vi.fn() };
      const service = new NotificationService([mockNotifier1]);
      service.addNotifier(mockNotifier2);

      await service.notify('Test Title');

      expect(mockNotifier1.notify).toHaveBeenCalledWith('Test Title', undefined);
      expect(mockNotifier2.notify).toHaveBeenCalledWith('Test Title', undefined);
    });

    it('should use BrowserNotifier by default', async () => {
      const MockNotification = vi.fn();
      vi.stubGlobal('Notification', MockNotification);
      (window.Notification as any).permission = 'granted';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const service = new NotificationService();
      await service.notify('Test Default');

      expect(MockNotification).toHaveBeenCalledWith('Test Default', undefined);
      consoleSpy.mockRestore();
    });
  });
});
