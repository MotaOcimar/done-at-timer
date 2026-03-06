import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useTaskStore } from './useTaskStore';

describe('useTaskStore - Edit Task', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should update task details for pending tasks', () => {
    useTaskStore.getState().addTask('Task 1', 30);
    const { tasks } = useTaskStore.getState();
    const taskId = tasks[0].id;

    useTaskStore.getState().updateTask(taskId, { title: 'Updated Task', duration: 45 });

    const updatedTasks = useTaskStore.getState().tasks;
    expect(updatedTasks[0].title).toBe('Updated Task');
    expect(updatedTasks[0].duration).toBe(45);
  });

  it('should adjust targetEndTime when active task duration is increased', () => {
    useTaskStore.getState().addTask('Active Task', 20); // 20 mins
    const { tasks } = useTaskStore.getState();
    const taskId = tasks[0].id;

    const startTime = Date.now();
    vi.setSystemTime(startTime);

    useTaskStore.getState().startTask(taskId);
    
    // Advance 10 mins (50% done)
    vi.advanceTimersByTime(10 * 60 * 1000);
    
    const oldTarget = useTaskStore.getState().targetEndTime!;
    expect(oldTarget).toBeDefined();

    // Update duration to 30 mins (increase by 10m)
    useTaskStore.getState().updateTask(taskId, { duration: 30 });
    
    const newTarget = useTaskStore.getState().targetEndTime!;
    
    // Duration increased by 10 mins (600,000ms)
    // The target time should move forward by 10 mins
    expect(newTarget).toBe(oldTarget + (10 * 60 * 1000));
  });

  it('should adjust targetEndTime when active task duration is decreased', () => {
    useTaskStore.getState().addTask('Active Task', 20); // 20 mins
    const { tasks } = useTaskStore.getState();
    const taskId = tasks[0].id;

    const startTime = Date.now();
    vi.setSystemTime(startTime);

    useTaskStore.getState().startTask(taskId);
    
    // Advance 5 mins
    vi.advanceTimersByTime(5 * 60 * 1000);
    
    const oldTarget = useTaskStore.getState().targetEndTime!;
    
    // Decrease duration to 15 mins (decrease by 5m)
    useTaskStore.getState().updateTask(taskId, { duration: 15 });
    
    const newTarget = useTaskStore.getState().targetEndTime!;
    
    // Duration decreased by 5 mins
    // The target time should move backward by 5 mins
    expect(newTarget).toBe(oldTarget - (5 * 60 * 1000));
  });
});
