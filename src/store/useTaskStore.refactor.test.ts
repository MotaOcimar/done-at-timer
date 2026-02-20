import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from './useTaskStore';

describe('useTaskStore Refactor', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
  });

  it('should have initial state for new fields', () => {
    const state = useTaskStore.getState();
    expect(state.activeTaskId).toBeNull();
    expect(state.targetEndTime).toBeNull();
    expect(state.totalElapsedBeforePause).toBe(0);
  });

  it('should update activeTaskId and targetEndTime', () => {
    const now = Date.now();
    const target = now + 10000;

    useTaskStore.setState({ activeTaskId: 'task-1', targetEndTime: target });

    const state = useTaskStore.getState();
    expect(state.activeTaskId).toBe('task-1');
    expect(state.targetEndTime).toBe(target);
  });

  it('should update totalElapsedBeforePause', () => {
    useTaskStore.setState({ totalElapsedBeforePause: 45 });

    const state = useTaskStore.getState();
    expect(state.totalElapsedBeforePause).toBe(45);
  });
});
