export type NotificationPermissionStatus = NotificationPermission | 'unsupported';

export interface INotifier {
  notify(title: string, options?: NotificationOptions): void;
}

export class BrowserNotifier implements INotifier {
  notify(title: string, options?: NotificationOptions): void {
    console.log('BrowserNotifier.notify called', { title, options, permission: window.Notification?.permission });
    if (
      typeof window === 'undefined' ||
      !window.Notification ||
      window.Notification.permission !== 'granted'
    ) {
      console.log('BrowserNotifier.notify skipped - missing window, Notification or permission');
      return;
    }

    try {
      console.log('Creating new Notification', title);
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
  notify(title: string, options?: NotificationOptions): void {
    this.notifiers.forEach((notifier) => notifier.notify(title, options));
  }

  /**
   * Register a new notifier.
   */
  addNotifier(notifier: INotifier): void {
    this.notifiers.push(notifier);
  }
}
