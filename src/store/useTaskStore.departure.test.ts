// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from './useTaskStore';

describe('useTaskStore routine departure time (TK-035)', () => {
  beforeEach(() => {
    useTaskStore.setState({
      routines: [
        {
          id: 'r1',
          name: 'Routine',
          tasks: [{ title: 'A', expectedDuration: 5 }],
        },
      ],
    });
  });

  it('saves a departure time on the routine in place', () => {
    useTaskStore.getState().setRoutineDeparture('r1', '07:00');

    const routine = useTaskStore.getState().routines[0];
    expect(routine.departureTime).toBe('07:00');
    expect(routine.id).toBe('r1'); // same routine, not a copy
    expect(useTaskStore.getState().routines).toHaveLength(1);
  });

  it('clears the departure time, returning the routine to the live forecast', () => {
    useTaskStore.getState().setRoutineDeparture('r1', '07:00');
    useTaskStore.getState().setRoutineDeparture('r1', undefined);

    expect(useTaskStore.getState().routines[0].departureTime).toBeUndefined();
  });

  it('imports a routine carrying its departure time', () => {
    useTaskStore
      .getState()
      .importRoutine('Shared', [{ title: 'B', expectedDuration: 10 }], '08:30');

    const imported = useTaskStore.getState().routines.at(-1);
    expect(imported?.name).toBe('Shared');
    expect(imported?.departureTime).toBe('08:30');
  });

  it('imports a routine without a departure time (older links)', () => {
    useTaskStore
      .getState()
      .importRoutine('Shared', [{ title: 'B', expectedDuration: 10 }]);

    expect(
      useTaskStore.getState().routines.at(-1)?.departureTime,
    ).toBeUndefined();
  });
});
