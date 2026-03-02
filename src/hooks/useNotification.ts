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

  const notifyTaskComplete = useCallback(async (taskTitle: string) => {
    await notificationService.notify('Task Complete!', {
      body: `"${taskTitle}" has finished.`,
      icon: `${import.meta.env.BASE_URL}icon.svg`,
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
