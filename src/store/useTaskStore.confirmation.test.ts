import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from './useTaskStore';

describe('useTaskStore: Manual Completion', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
  });

  it('should track when time is up for the active task', () => {
    useTaskStore.getState().addTask('Task 1', 10);
    const taskId = useTaskStore.getState().tasks[0].id;
    
    useTaskStore.getState().startTask(taskId);
    expect(useTaskStore.getState().isTimeUp).toBe(false);

    useTaskStore.getState().onTimeUp();
    expect(useTaskStore.getState().isTimeUp).toBe(true);
  });

  it('should mark active task as COMPLETED and start next PENDING task when completeActiveTask is called', () => {
    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'Task 1', duration: 10, status: 'IN_PROGRESS' },
        { id: '2', title: 'Task 2', duration: 20, status: 'PENDING' },
      ],
      activeTaskId: '1',
      isTimeUp: true,
    });

    useTaskStore.getState().completeActiveTask();

    const { tasks, activeTaskId, isTimeUp } = useTaskStore.getState();
    
    // Task 1 should be COMPLETED
    expect(tasks.find(t => t.id === '1')?.status).toBe('COMPLETED');
    
    // Task 2 should be IN_PROGRESS
    expect(tasks.find(t => t.id === '2')?.status).toBe('IN_PROGRESS');
    expect(activeTaskId).toBe('2');
    
    // isTimeUp should be reset
    expect(isTimeUp).toBe(false);
  });
});
