export type NotificationPermissionStatus = NotificationPermission | 'unsupported';

export interface INotifier {
  notify(title: string, options?: NotificationOptions): Promise<void>;
}

export class BrowserNotifier implements INotifier {
  async notify(title: string, options?: NotificationOptions): Promise<void> {
    if (
      typeof window === 'undefined' ||
      !window.Notification ||
      window.Notification.permission !== 'granted'
    ) {
      return;
    }

    try {
      // Prefer service worker for PWA notifications
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.showNotification(title, options);
          return;
        }
      }

      new window.Notification(title, options);
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }
}

export class NotificationService {
  private notifiers: INotifier[] = [];

  constructor(notifiers: INotifier[] = [new BrowserNotifier()]) {
    this.notifiers = notifiers;
  }

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
   * Show a notification using all registered notifiers.
   */
  async notify(title: string, options?: NotificationOptions): Promise<void> {
    await Promise.all(this.notifiers.map((notifier) => notifier.notify(title, options)));
  }

  /**
   * Register a new notifier.
   */
  addNotifier(notifier: INotifier): void {
    this.notifiers.push(notifier);
  }
}
