import { useState, useCallback, useEffect } from 'react';
import { NotificationService } from '../utils/notificationService';
import type { NotificationPermissionStatus } from '../utils/notificationService';

const notificationService = new NotificationService();

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermissionStatus>(
    typeof window !== 'undefined' && 'Notification' in window
      ? window.Notification.permission
      : 'unsupported'
  );

  const requestPermission = useCallback(async () => {
    const result = await notificationService.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const notifyTaskComplete = useCallback((taskTitle: string) => {
    console.log('useNotification.notifyTaskComplete called', taskTitle);
    notificationService.notify('Task Complete!', {
      body: `"${taskTitle}" has finished.`,
      icon: '/icon.svg',
    });
  }, []);

  // Update permission status on mount
  useEffect(() => {
    console.log('useNotification mounted - initial permission:', permission);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      console.log('useNotification useEffect - current window.Notification.permission:', window.Notification.permission);
      setPermission(window.Notification.permission);
    }
  }, []);

  return {
    permission,
    requestPermission,
    notifyTaskComplete,
  };
}
