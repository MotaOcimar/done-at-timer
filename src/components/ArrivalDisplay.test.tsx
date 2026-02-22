import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArrivalDisplay } from './ArrivalDisplay';
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

  it('maintains arrival time when task is paused', () => {
    useTaskStore.getState().addTask('T1', 30);
    const taskId = useTaskStore.getState().tasks[0].id;
    
    useTaskStore.getState().startTask(taskId);
    vi.advanceTimersByTime(600000); // 10 mins passed
    
    useTaskStore.getState().pauseTask();
    
    render(<ArrivalDisplay />);
    
    // Ainda deve ser 10:30 (10:10 atual + 20 restantes)
    expect(screen.getByText('10:30')).toBeInTheDocument();

    // Check for remaining time text (20 min left)
    expect(screen.getByText(/20 min left/i)).toBeInTheDocument();
    
    // Check for progress bar
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
  });

  it('shows celebration message when all tasks are completed', () => {
    useTaskStore.getState().addTask('T1', 10);
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().updateTask(taskId, { status: 'COMPLETED' });

    render(<ArrivalDisplay />);

    expect(screen.getByText(/Routine Complete/i)).toBeInTheDocument();
    expect(screen.getByText(/All tasks finished/i)).toBeInTheDocument();
  });

  it('shows amber color and drifting text when paused', () => {
    useTaskStore.getState().addTask('T1', 30);
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().startTask(taskId);
    useTaskStore.getState().pauseTask();

    const { container } = render(<ArrivalDisplay />);
    
    expect(screen.getByText(/Arrival time is drifting/i)).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-amber-500');
  });

  it('shows amber color and drifting text when time is up', () => {
    useTaskStore.getState().addTask('T1', 30);
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().startTask(taskId);
    
    // Simulate time up
    useTaskStore.getState().onTimeUp();

    const { container } = render(<ArrivalDisplay />);
    
    expect(screen.getByText(/Arrival time is drifting/i)).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-amber-500');
  });

  it('calculates ETA correctly during overtime (no past ETA)', () => {
    // Current Time: 10:00
    useTaskStore.getState().addTask('T1', 1); // 1 min task
    useTaskStore.getState().addTask('T2', 10); // 10 min task
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().startTask(taskId);

    // Fast forward 5 minutes (4 mins past T1's estimate)
    // Clock is now 10:05. T1 is in overtime.
    vi.advanceTimersByTime(300000); 
    useTaskStore.getState().onTimeUp();

    render(<ArrivalDisplay />);

    // T1 is done at 10:05 (Now) + T2 (10 mins) = 10:15
    // BEFORE fix, it would show 10:00 + 1 + 10 = 10:11 (which is in the past relative to 10:05)
    expect(screen.getByText('10:15')).toBeInTheDocument();
  });
});
