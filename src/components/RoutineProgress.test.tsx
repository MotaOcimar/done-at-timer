import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import RoutineProgress from './RoutineProgress';
import { useTaskStore } from '../store/useTaskStore';

describe('RoutineProgress', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
    vi.useFakeTimers();
  });

  it('renders overall progress correctly', () => {
    // 2 tasks: 1 done (10m), 1 pending (10m) -> 50%
    useTaskStore.getState().addTask('Done Task', 10);
    const task1 = useTaskStore.getState().tasks[0];
    useTaskStore.getState().updateTask(task1.id, { status: 'COMPLETED' });

    useTaskStore.getState().addTask('Pending Task', 10);

    render(<RoutineProgress />);

    // Check if progress bar exists and has 50% width
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveStyle('width: 50%');
    
    // Check for text like "50% Complete" or similar
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it('includes active task progress in calculation', () => {
    // 1 task running (20m total), 50% done (10m left)
    useTaskStore.getState().addTask('Running Task', 20);
    const task = useTaskStore.getState().tasks[0];
    
    // Start task and advance time by 10 mins
    useTaskStore.getState().startTask(task.id);
    vi.advanceTimersByTime(600000); 

    render(<RoutineProgress />);

    // Total 20m. Done 10m. Progress 50%.
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveStyle('width: 50%');
  });
});
