import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from './useTaskStore';

describe('useTaskStore Routines', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
    // We also need to clear routines, but clearTasks doesn't do that.
    // Let's manually reset the state for testing.
    useTaskStore.setState({ routines: [] });
  });

  it('should save the current task list as a routine', () => {
    const store = useTaskStore.getState();
    store.addTask('Task 1', 10);
    store.addTask('Task 2', 20);

    store.saveRoutine('My Routine');

    const state = useTaskStore.getState();
    expect(state.routines).toHaveLength(1);
    expect(state.routines[0].name).toBe('My Routine');
    expect(state.routines[0].tasks).toHaveLength(2);
    expect(state.routines[0].tasks[0].title).toBe('Task 1');
  });

  it('should not save an empty task list', () => {
    const store = useTaskStore.getState();
    store.saveRoutine('Empty Routine');

    const state = useTaskStore.getState();
    expect(state.routines).toHaveLength(0);
  });

  it('should load a saved routine', () => {
    const store = useTaskStore.getState();
    store.addTask('Original Task', 5);
    
    // Setup a routine manually in state
    useTaskStore.setState({
      routines: [
        {
          id: 'routine-1',
          name: 'Saved Routine',
          tasks: [
            { title: 'Routine Task 1', duration: 15 },
            { title: 'Routine Task 2', duration: 25 },
          ],
        },
      ],
    });

    store.loadRoutine('routine-1');

    const state = useTaskStore.getState();
    expect(state.tasks).toHaveLength(2);
    expect(state.tasks[0].title).toBe('Routine Task 1');
    expect(state.tasks[0].status).toBe('PENDING');
    expect(state.tasks[0].id).toBeDefined();
    expect(state.tasks[1].title).toBe('Routine Task 2');
    
    // Ensure state is reset
    expect(state.activeTaskId).toBeNull();
  });

  it('should delete a routine', () => {
    useTaskStore.setState({
      routines: [
        { id: '1', name: 'R1', tasks: [] },
        { id: '2', name: 'R2', tasks: [] },
      ],
    });

    useTaskStore.getState().deleteRoutine('1');

    const state = useTaskStore.getState();
    expect(state.routines).toHaveLength(1);
    expect(state.routines[0].id).toBe('2');
  });
});
