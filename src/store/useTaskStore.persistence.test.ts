// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from './useTaskStore';

const STORAGE_KEY = 'done-at-timer-storage';

const readPersisted = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  expect(raw).not.toBeNull();
  return JSON.parse(raw!) as {
    state: Record<string, unknown>;
    version: number;
  };
};

const seedPersisted = (state: Record<string, unknown>, version: number) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, version }));
};

describe('useTaskStore persistence shape', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
  });

  it('does not persist activeTaskTimeLeft or isTimeUp', () => {
    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'T1', expectedDuration: 10, status: 'IN_PROGRESS' },
      ],
      activeTaskId: '1',
      targetEndTime: Date.now() + 10 * 60 * 1000,
      activeTaskTimeLeft: 599,
      isTimeUp: false,
    });

    const { state } = readPersisted();
    expect(state).not.toHaveProperty('activeTaskTimeLeft');
    expect(state).not.toHaveProperty('isTimeUp');
    expect(state).toHaveProperty('targetEndTime');
    expect(state).toHaveProperty('activeTaskId');
  });

  it('re-derives the remaining time of a running task on rehydrate', async () => {
    const targetEndTime = Date.now() + 5 * 60 * 1000;
    seedPersisted(
      {
        tasks: [
          {
            id: '1',
            title: 'T1',
            expectedDuration: 10,
            status: 'IN_PROGRESS',
            startedAt: targetEndTime - 10 * 60 * 1000,
          },
        ],
        activeTaskId: '1',
        targetEndTime,
        totalElapsedBeforePause: 0,
        isNotificationsEnabled: true,
        routines: [],
      },
      1,
    );

    await useTaskStore.persist.rehydrate();

    const state = useTaskStore.getState();
    expect(state.activeTaskTimeLeft).toBeGreaterThanOrEqual(5 * 60 - 1);
    expect(state.activeTaskTimeLeft).toBeLessThanOrEqual(5 * 60);
    expect(state.isTimeUp).toBe(false);
  });

  it('re-derives overtime (isTimeUp) on rehydrate when the target has passed', async () => {
    seedPersisted(
      {
        tasks: [
          {
            id: '1',
            title: 'T1',
            expectedDuration: 10,
            status: 'IN_PROGRESS',
          },
        ],
        activeTaskId: '1',
        targetEndTime: Date.now() - 90 * 1000,
        totalElapsedBeforePause: 0,
        isNotificationsEnabled: true,
        routines: [],
      },
      1,
    );

    await useTaskStore.persist.rehydrate();

    const state = useTaskStore.getState();
    expect(state.isTimeUp).toBe(true);
    expect(state.activeTaskTimeLeft).toBeLessThanOrEqual(-89);
  });

  it('re-derives the remaining time of a paused task on rehydrate', async () => {
    seedPersisted(
      {
        tasks: [
          {
            id: '1',
            title: 'T1',
            expectedDuration: 10,
            status: 'IN_PROGRESS',
          },
        ],
        activeTaskId: '1',
        targetEndTime: null,
        totalElapsedBeforePause: 240,
        isNotificationsEnabled: true,
        routines: [],
      },
      1,
    );

    await useTaskStore.persist.rehydrate();

    const state = useTaskStore.getState();
    expect(state.activeTaskTimeLeft).toBe(6 * 60);
    expect(state.isTimeUp).toBe(false);
  });

  it('migrates a v0 snapshot: renames duration, anchors the running task', async () => {
    const targetEndTime = Date.now() + 20 * 60 * 1000;
    seedPersisted(
      {
        tasks: [
          {
            id: '1',
            title: 'Done task',
            duration: 5,
            status: 'COMPLETED',
            actualDuration: 9,
            completedAt: 1774373264072,
          },
          {
            id: '2',
            title: 'Running task',
            duration: 30,
            status: 'IN_PROGRESS',
          },
          { id: '3', title: 'Pending task', duration: 10, status: 'PENDING' },
        ],
        activeTaskTimeLeft: 1793,
        activeTaskId: '2',
        targetEndTime,
        totalElapsedBeforePause: 0,
        isTimeUp: false,
        isNotificationsEnabled: false,
        routines: [
          {
            id: 'r1',
            name: 'Routine',
            tasks: [
              { title: 'a', duration: 1 },
              { title: 'b', duration: 2 },
            ],
          },
        ],
      },
      0,
    );

    await useTaskStore.persist.rehydrate();

    const state = useTaskStore.getState();
    expect(state.tasks.map((t) => t.expectedDuration)).toEqual([5, 30, 10]);
    expect(state.tasks.every((t) => !('duration' in t))).toBe(true);

    const done = state.tasks.find((t) => t.id === '1')!;
    expect(done.actualDuration).toBe(9);
    expect(done.completedAt).toBe(1774373264072);
    expect(done.startedAt).toBeUndefined();

    const running = state.tasks.find((t) => t.id === '2')!;
    expect(running.startedAt).toBe(targetEndTime - 30 * 60 * 1000);

    expect(state.tasks.find((t) => t.id === '3')!.startedAt).toBeUndefined();

    expect(state.routines[0].tasks.map((t) => t.expectedDuration)).toEqual([
      1, 2,
    ]);
    expect(state.isNotificationsEnabled).toBe(false);
    expect(state.activeTaskId).toBe('2');
    expect(state.targetEndTime).toBe(targetEndTime);
  });

  it('migrates a v0 snapshot paused mid-task without inventing an anchor', async () => {
    seedPersisted(
      {
        tasks: [
          {
            id: '1',
            title: 'Paused task',
            duration: 10,
            status: 'IN_PROGRESS',
          },
        ],
        activeTaskTimeLeft: 360,
        activeTaskId: '1',
        targetEndTime: null,
        totalElapsedBeforePause: 240,
        isTimeUp: false,
        isNotificationsEnabled: true,
        routines: [],
      },
      0,
    );

    await useTaskStore.persist.rehydrate();

    const state = useTaskStore.getState();
    const paused = state.tasks.find((t) => t.id === '1')!;
    expect(paused.expectedDuration).toBe(10);
    expect(paused.startedAt).toBeUndefined();
    // The pause itself still recovers: 10 min − 240 s elapsed = 6 min left.
    expect(state.activeTaskTimeLeft).toBe(6 * 60);
    expect(state.isTimeUp).toBe(false);
  });

  it('rehydrates an idle session with no derived leftovers', async () => {
    seedPersisted(
      {
        tasks: [
          {
            id: '1',
            title: 'T1',
            expectedDuration: 10,
            status: 'PENDING',
          },
        ],
        activeTaskId: null,
        targetEndTime: null,
        totalElapsedBeforePause: 0,
        isNotificationsEnabled: true,
        routines: [],
      },
      1,
    );

    await useTaskStore.persist.rehydrate();

    const state = useTaskStore.getState();
    expect(state.activeTaskTimeLeft).toBeNull();
    expect(state.isTimeUp).toBe(false);
  });
});
