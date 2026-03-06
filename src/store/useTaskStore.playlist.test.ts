import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTaskStore } from './useTaskStore';

describe('useTaskStore Playlist Logic', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
  });

  it('should start a task and set targetEndTime', () => {
    const store = useTaskStore.getState();
    store.addTask('Task 1', 10); // 10 minutes
    const taskId = useTaskStore.getState().tasks[0].id;

    useTaskStore.getState().startTask(taskId);

    const state = useTaskStore.getState();
    expect(state.activeTaskId).toBe(taskId);
    expect(state.tasks[0].status).toBe('IN_PROGRESS');
    // 10 minutes = 600,000 ms
    expect(state.targetEndTime).toBe(Date.now() + 600000);
  });

  it('should pause a task and clear targetEndTime while saving elapsed', () => {
    const store = useTaskStore.getState();
    store.addTask('Task 1', 10);
    const taskId = useTaskStore.getState().tasks[0].id;

    useTaskStore.getState().startTask(taskId);
    
    // Advance 1 minute (60 seconds)
    vi.advanceTimersByTime(60000);

    useTaskStore.getState().pauseTask();

    const state = useTaskStore.getState();
    expect(state.targetEndTime).toBeNull();
    // Should have saved ~60 seconds of elapsed time
    expect(state.totalElapsedBeforePause).toBe(60);
  });

  it('should resume a task and recalculate targetEndTime correctly', () => {
    const store = useTaskStore.getState();
    store.addTask('Task 1', 10);
    const taskId = useTaskStore.getState().tasks[0].id;

    useTaskStore.getState().startTask(taskId);
    vi.advanceTimersByTime(60000); // 1 min passed
    useTaskStore.getState().pauseTask();
    
    // Wait some time while paused
    vi.advanceTimersByTime(300000); // 5 mins later

    useTaskStore.getState().resumeTask();

    const state = useTaskStore.getState();
    // Remaining time was 9 mins (540,000 ms)
    expect(state.targetEndTime).toBe(Date.now() + 540000);
  });
});
