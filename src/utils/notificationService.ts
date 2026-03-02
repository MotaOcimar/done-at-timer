export type NotificationPermissionStatus = NotificationPermission | 'unsupported';

export class NotificationService {
  /**
   * Request permission for notifications.
   * Returns current status or requests it if 'default'.
   */
  async requestPermission(): Promise<NotificationPermissionStatus> {
    if (typeof window === 'undefined' || !window.Notification) {
      return 'unsupported';
    }

    if (window.Notification.permission !== 'default') {
      return window.Notification.permission;
    }

    try {
      return await window.Notification.requestPermission();
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'default';
    }
  }

  /**
   * Show a notification if permission is granted.
   */
  notify(title: string, options?: NotificationOptions): void {
    if (
      typeof window === 'undefined' ||
      !window.Notification ||
      window.Notification.permission !== 'granted'
    ) {
      return;
    }

    try {
      new window.Notification(title, options);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
}
