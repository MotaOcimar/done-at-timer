import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from './useTaskStore';

describe('useTaskStore', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
  });

  it('should add a task', () => {
    useTaskStore.getState().addTask('Test Task', 30);

    const { tasks } = useTaskStore.getState();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Test Task');
    expect(tasks[0].duration).toBe(30);
    expect(tasks[0].status).toBe('PENDING');
  });

  it('should add new tasks to the end of the list', () => {
    useTaskStore.getState().addTask('First Task', 10);
    useTaskStore.getState().addTask('Second Task', 20);

    const { tasks } = useTaskStore.getState();
    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('First Task');
    expect(tasks[1].title).toBe('Second Task');
  });

  it('should reset progress of all tasks', () => {
    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'T1', duration: 10, status: 'COMPLETED' },
        { id: '2', title: 'T2', duration: 10, status: 'IN_PROGRESS' },
      ],
    });

    useTaskStore.getState().resetTasks();

    const { tasks } = useTaskStore.getState();
    expect(tasks.every((t) => t.status === 'PENDING')).toBe(true);
  });

  it('should clear all tasks', () => {
    useTaskStore.setState({
      tasks: [{ id: '1', title: 'T1', duration: 10, status: 'PENDING' }],
    });

    useTaskStore.getState().clearTasks();
    expect(useTaskStore.getState().tasks).toHaveLength(0);
  });

  it('should reorder tasks', () => {
    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'Task 1', duration: 10, status: 'PENDING' },
        { id: '2', title: 'Task 2', duration: 20, status: 'PENDING' },
        { id: '3', title: 'Task 3', duration: 30, status: 'PENDING' },
      ],
    });

    useTaskStore.getState().reorderTasks('1', '2');

    const { tasks } = useTaskStore.getState();
    expect(tasks[0].id).toBe('2');
    expect(tasks[1].id).toBe('1');
    expect(tasks[2].id).toBe('3');
  });
});
