// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArrivalDisplay } from './ArrivalDisplay';
import { useTaskStore } from '../store/useTaskStore';

describe('ArrivalDisplay routine start endpoint (TK-034)', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
  });

  it('reads "now" before anything starts', () => {
    useTaskStore.getState().addTask('T1', 30);

    render(<ArrivalDisplay />);

    expect(screen.getByTestId('arrival-start')).toHaveTextContent(/^now$/);
  });

  it("is fixed at the first task's actual start once underway", () => {
    useTaskStore.getState().addTask('T1', 30);
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().startTask(taskId);

    vi.advanceTimersByTime(10 * 60 * 1000); // 10 minutes into the run

    render(<ArrivalDisplay />);

    expect(screen.getByTestId('arrival-start')).toHaveTextContent('10:00');
  });

  it('keeps the first start when later tasks take over', () => {
    useTaskStore.getState().addTask('T1', 10);
    useTaskStore.getState().addTask('T2', 20);
    const [t1] = useTaskStore.getState().tasks;
    useTaskStore.getState().startTask(t1.id);

    vi.advanceTimersByTime(5 * 60 * 1000);
    useTaskStore.getState().completeActiveTask(5 * 60); // T2 auto-starts at 10:05

    render(<ArrivalDisplay />);

    expect(screen.getByTestId('arrival-start')).toHaveTextContent('10:00');
  });

  it('shows no start endpoint with an empty list', () => {
    render(<ArrivalDisplay />);

    expect(screen.queryByTestId('arrival-start')).toBeNull();
  });
});
