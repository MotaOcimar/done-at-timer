import { useEffect, useRef } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useNotification } from '../hooks/useNotification';

export const NotificationManager = () => {
  const isTimeUp = useTaskStore((state) => state.isTimeUp);
  const activeTaskId = useTaskStore((state) => state.activeTaskId);
  const tasks = useTaskStore((state) => state.tasks);
  const { notifyTaskComplete, permission } = useNotification();
  
  // Track which task we've already notified for
  const notifiedTaskId = useRef<string | null>(null);

  useEffect(() => {
    if (isTimeUp && activeTaskId && notifiedTaskId.current !== activeTaskId) {
      const task = tasks.find(t => t.id === activeTaskId);
      if (task && permission === 'granted') {
        notifyTaskComplete(task.title);
        notifiedTaskId.current = activeTaskId;
      }
    } else if (!isTimeUp) {
      notifiedTaskId.current = null;
    }
  }, [isTimeUp, activeTaskId, tasks, permission, notifyTaskComplete]);

  return null;
};
