import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from './useTaskStore';

describe('useTaskStore', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [] });
  });

  it('should add a task', () => {
    useTaskStore.getState().addTask('Test Task', 30);

    const { tasks } = useTaskStore.getState();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Test Task');
    expect(tasks[0].duration).toBe(30);
    expect(tasks[0].status).toBe('PENDING');
  });

  it('should remove a task', () => {
    // Manually add a task first since addTask is broken
    useTaskStore.setState({
      tasks: [{ id: '1', title: 'Task 1', duration: 15, status: 'PENDING' }],
    });

    useTaskStore.getState().removeTask('1');

    const { tasks } = useTaskStore.getState();
    expect(tasks).toHaveLength(0);
  });

  it('should update a task', () => {
    useTaskStore.setState({
      tasks: [{ id: '1', title: 'Original Title', duration: 10, status: 'PENDING' }],
    });

    useTaskStore.getState().updateTask('1', { title: 'Updated Title' });

    const { tasks } = useTaskStore.getState();
    expect(tasks[0].title).toBe('Updated Title');
  });
});
