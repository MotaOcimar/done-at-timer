// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from './useTaskStore';

describe('useTaskStore startedAt', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
  });

  it('records startedAt when a task is started', () => {
    useTaskStore.setState({
      tasks: [{ id: '1', title: 'Task 1', duration: 10, status: 'PENDING' }],
    });

    const before = Date.now();
    useTaskStore.getState().startTask('1');

    const task = useTaskStore.getState().tasks.find((t) => t.id === '1');
    expect(task?.startedAt).toBeGreaterThanOrEqual(before);
    expect(task?.startedAt).toBeLessThanOrEqual(Date.now());
  });

  it('records startedAt on the next task when auto-advancing after completion', () => {
    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'Task 1', duration: 10, status: 'IN_PROGRESS' },
        { id: '2', title: 'Task 2', duration: 20, status: 'PENDING' },
      ],
      activeTaskId: '1',
    });

    const before = Date.now();
    useTaskStore.getState().completeActiveTask(0);

    const next = useTaskStore.getState().tasks.find((t) => t.id === '2');
    expect(next?.status).toBe('IN_PROGRESS');
    expect(next?.startedAt).toBeGreaterThanOrEqual(before);
    expect(next?.startedAt).toBeLessThanOrEqual(Date.now());
  });

  it('records startedAt on the next task when the active task is removed', () => {
    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'Task 1', duration: 10, status: 'IN_PROGRESS' },
        { id: '2', title: 'Task 2', duration: 20, status: 'PENDING' },
      ],
      activeTaskId: '1',
      targetEndTime: Date.now() + 10 * 60 * 1000,
    });

    const before = Date.now();
    useTaskStore.getState().removeTask('1');

    const next = useTaskStore.getState().tasks.find((t) => t.id === '2');
    expect(next?.status).toBe('IN_PROGRESS');
    expect(next?.startedAt).toBeGreaterThanOrEqual(before);
    expect(next?.startedAt).toBeLessThanOrEqual(Date.now());
  });

  it('keeps the original startedAt across pause and resume', () => {
    useTaskStore.setState({
      tasks: [{ id: '1', title: 'Task 1', duration: 10, status: 'PENDING' }],
    });
    useTaskStore.getState().startTask('1');
    const startedAt = useTaskStore
      .getState()
      .tasks.find((t) => t.id === '1')?.startedAt;

    useTaskStore.getState().pauseTask();
    useTaskStore.getState().resumeTask();

    const task = useTaskStore.getState().tasks.find((t) => t.id === '1');
    expect(task?.startedAt).toBe(startedAt);
  });

  it('stamps a fresh startedAt when a demoted task is started again', () => {
    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'Task 1', duration: 10, status: 'PENDING' },
        { id: '2', title: 'Task 2', duration: 20, status: 'PENDING' },
      ],
    });
    useTaskStore.getState().startTask('1');
    const firstRunStart = useTaskStore
      .getState()
      .tasks.find((t) => t.id === '1')!.startedAt!;

    // Starting task 2 demotes task 1 back to PENDING (a fresh run later).
    useTaskStore.getState().startTask('2');
    const demoted = useTaskStore.getState().tasks.find((t) => t.id === '1');
    expect(demoted?.startedAt).toBeUndefined();

    const beforeRestart = Date.now();
    useTaskStore.getState().startTask('1');

    const task = useTaskStore.getState().tasks.find((t) => t.id === '1');
    expect(task?.startedAt).toBeGreaterThanOrEqual(beforeRestart);
    expect(task?.startedAt).toBeGreaterThanOrEqual(firstRunStart);
  });

  it('clears startedAt when tasks are reset', () => {
    useTaskStore.setState({
      tasks: [
        {
          id: '1',
          title: 'T1',
          duration: 10,
          status: 'COMPLETED',
          startedAt: Date.now(),
          completedAt: Date.now(),
        },
        {
          id: '2',
          title: 'T2',
          duration: 10,
          status: 'IN_PROGRESS',
          startedAt: Date.now(),
        },
      ],
    });

    useTaskStore.getState().resetTasks();

    const { tasks } = useTaskStore.getState();
    expect(tasks.every((t) => t.startedAt === undefined)).toBe(true);
  });

  it('loads routine tasks without startedAt', () => {
    useTaskStore.setState({
      routines: [
        {
          id: 'r1',
          name: 'Routine',
          tasks: [{ title: 'A', duration: 5 }],
        },
      ],
    });

    useTaskStore.getState().loadRoutine('r1');

    const { tasks } = useTaskStore.getState();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].startedAt).toBeUndefined();
  });
});
