import { useState, useCallback, useEffect } from 'react';
import { NotificationService, NotificationPermissionStatus } from '../utils/notificationService';

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
    notificationService.notify('Task Complete!', {
      body: `"${taskTitle}" has finished.`,
      icon: '/icon.svg',
    });
  }, []);

  // Update permission status on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(window.Notification.permission);
    }
  }, []);

  return {
    permission,
    requestPermission,
    notifyTaskComplete,
  };
}
