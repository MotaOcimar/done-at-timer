import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ArrivalDisplay from './ArrivalDisplay';
import { useTaskStore } from '../store/useTaskStore';

describe('ArrivalDisplay', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
  });

  it('calculates arrival time correctly based on tasks and now', () => {
    useTaskStore.getState().addTask('T1', 30);
    useTaskStore.getState().addTask('T2', 30);

    render(<ArrivalDisplay />);

    // 10:00 + 60 mins = 11:00
    expect(screen.getByText('11:00')).toBeInTheDocument();
  });

  it('updates arrival time when a task is in progress', () => {
    useTaskStore.getState().addTask('T1', 30);
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().startTask(taskId);

    vi.advanceTimersByTime(600000); // 10 mins passed

    render(<ArrivalDisplay />);

    // Total duration was 30 mins. 10 passed. 20 left.
    // 10:10 (current time) + 20 mins = 10:30
    expect(screen.getByText('10:30')).toBeInTheDocument();
  });
});
