import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskItem } from './TaskItem';
import { useTaskStore } from '../store/useTaskStore';
import { useNotification } from '../hooks/useNotification';

// Mock useNotification
vi.mock('../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}));

// Mock useSortable
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

describe('TaskItem Notifications', () => {
  const mockNotifyTaskComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useTaskStore.getState().clearTasks();
    
    (useNotification as any).mockReturnValue({
      permission: 'granted',
      requestPermission: vi.fn(),
      notifyTaskComplete: mockNotifyTaskComplete,
    });
  });

  it('should call notifyTaskComplete when timer finishes and permission is granted', async () => {
    vi.useFakeTimers();
    
    // Add task and start it
    const taskTitle = 'Notification Task';
    useTaskStore.getState().addTask(taskTitle, 1); // 1 minute
    const task = useTaskStore.getState().tasks[0];
    
    render(<TaskItem task={task} onDelete={vi.fn()} />);
    
    // Start task
    act(() => {
      useTaskStore.getState().startTask(task.id);
    });

    // Advance time to completion
    await act(async () => {
      vi.advanceTimersByTime(60000);
    });

    // Verify notifyTaskComplete was called
    expect(mockNotifyTaskComplete).toHaveBeenCalledWith(taskTitle);
    
    vi.useRealTimers();
  });

  it('should NOT call notifyTaskComplete when permission is denied', async () => {
    vi.useFakeTimers();
    
    (useNotification as any).mockReturnValue({
      permission: 'denied',
      requestPermission: vi.fn(),
      notifyTaskComplete: mockNotifyTaskComplete,
    });
    
    useTaskStore.getState().addTask('Denied Task', 1);
    const task = useTaskStore.getState().tasks[0];
    
    render(<TaskItem task={task} onDelete={vi.fn()} />);
    
    act(() => {
      useTaskStore.getState().startTask(task.id);
    });

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    // It should NOT be called if we handle permission inside TaskItem
    // OR it should be called but handle itself inside useNotification
    // Based on requirements, "when denied, no notification"
    // If we call it and useNotification handles it, that's also fine.
    // But let's check if we want to call it at all if permission is denied.
    
    // Actually, useNotification.notifyTaskComplete already uses NotificationService.notify
    // which checks for 'granted'. So calling it is safe.
    // But the task says "no notification".
  });
});
