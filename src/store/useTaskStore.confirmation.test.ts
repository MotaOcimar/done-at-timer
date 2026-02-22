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

    // Click Done (simulating 5 minutes left of a 10 min task = 5 mins taken)
    useTaskStore.getState().completeActiveTask(300);

    const { tasks, activeTaskId, isTimeUp } = useTaskStore.getState();
    
    // Task 1 should be COMPLETED and have actualDuration
    const task1 = tasks.find(t => t.id === '1');
    expect(task1?.status).toBe('COMPLETED');
    expect(task1?.actualDuration).toBe(5);
    
    // Task 2 should be IN_PROGRESS
    expect(tasks.find(t => t.id === '2')?.status).toBe('IN_PROGRESS');
    expect(activeTaskId).toBe('2');
    
    // isTimeUp should be reset
    expect(isTimeUp).toBe(false);
  });

  it('should calculate actualDuration correctly for overtime', () => {
    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'Task 1', duration: 10, status: 'IN_PROGRESS' },
      ],
      activeTaskId: '1',
      isTimeUp: true,
    });

    // Simulating 5 minutes overtime (timeLeft = -300)
    // 10 mins original + 5 mins over = 15 mins total
    useTaskStore.getState().completeActiveTask(-300);

    const { tasks } = useTaskStore.getState();
    const task1 = tasks.find(t => t.id === '1');
    expect(task1?.actualDuration).toBe(15);
  });
});
