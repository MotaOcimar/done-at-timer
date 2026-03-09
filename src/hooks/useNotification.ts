import { useState, useCallback } from 'react';
import { useNotificationService } from '../NotificationContext';
import { useTaskStore } from '../store/useTaskStore';
import type { NotificationPermissionStatus } from '../utils/notificationService';

export function useNotification() {
  const notificationService = useNotificationService();
  const isNotificationsEnabled = useTaskStore((state) => state.isNotificationsEnabled);
  const [permission, setPermission] = useState<NotificationPermissionStatus>(
    typeof window !== 'undefined' && 'Notification' in window
      ? window.Notification.permission
      : 'unsupported'
  );

  const requestPermission = useCallback(async () => {
    const result = await notificationService.requestPermission();
    setPermission(result);
    return result;
  }, [notificationService]);

  const notifyTaskComplete = useCallback(async (taskTitle: string) => {
    if (!isNotificationsEnabled) return;

    await notificationService.notify('Task Complete!', {
      body: `"${taskTitle}" has finished.`,
      icon: `${import.meta.env.BASE_URL}icon.svg`,
      vibrate: [200, 100, 200],
      silent: false,
      requireInteraction: true,
      tag: 'task-complete',
    });
  }, [notificationService, isNotificationsEnabled]);

  return {
    permission,
    requestPermission,
    notifyTaskComplete,
  };
}
