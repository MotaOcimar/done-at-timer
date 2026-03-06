import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArrivalDisplay } from './ArrivalDisplay';
import { useTaskStore } from '../store/useTaskStore';

describe('ArrivalDisplay Color Refinements', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
  });

  it('shows neutral colors when no task is active (idle)', () => {
    useTaskStore.getState().addTask('T1', 30);
    // Task is added but not started (activeTaskId is null)

    const { container } = render(<ArrivalDisplay />);
    
    // Main container should be neutral gray, but with border and shadow for contrast
    expect(container.firstChild).toHaveClass('bg-white');
    expect(container.firstChild).toHaveClass('border-gray-200');
    expect(container.firstChild).toHaveClass('text-gray-900');
    expect(container.firstChild).not.toHaveClass('bg-blue-600');

    // Label should be gray-500
    const label = screen.getByText(/You will be done at/i);
    expect(label).toHaveClass('text-gray-500');

    // Progress bar should have good contrast in idle
    const progressBg = screen.getByRole('progressbar');
    const progressFill = progressBg.firstChild;
    expect(progressBg).toHaveClass('bg-gray-200');
    expect(progressFill).toHaveClass('bg-gray-400');
  });

  it('shows active blue colors when a task is running', () => {
    useTaskStore.getState().addTask('T1', 30);
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().startTask(taskId);

    const { container } = render(<ArrivalDisplay />);
    
    // Main container should be active blue (no border, blue shadow)
    expect(container.firstChild).toHaveClass('bg-blue-600');
    expect(container.firstChild).not.toHaveClass('bg-amber-500');
    expect(container.firstChild).not.toHaveClass('border');

    // Label should be blue-200
    const label = screen.getByText(/You will be done at/i);
    expect(label).toHaveClass('text-blue-200');

    // Progress bar in running should be white/90 for maximum contrast against blue
    const progressFill = screen.getByRole('progressbar').firstChild;
    expect(progressFill).toHaveClass('bg-white/90');
  });

  it('shows neutral gray colors when a task is paused', () => {
    useTaskStore.getState().addTask('T1', 30);
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().startTask(taskId);
    useTaskStore.getState().pauseTask();

    const { container } = render(<ArrivalDisplay />);
    
    // Main container should be neutral gray with border and shadow
    expect(container.firstChild).toHaveClass('bg-gray-50');
    expect(container.firstChild).toHaveClass('border-gray-300');
    expect(container.firstChild).toHaveClass('text-gray-900');
    expect(container.firstChild).not.toHaveClass('bg-amber-500');

    // Label should be gray-500
    const label = screen.getByText(/Arrival time is drifting/i);
    expect(label).toHaveClass('text-gray-500');

    // Progress bar should have good contrast in paused
    const progressBg = screen.getByRole('progressbar');
    const progressFill = progressBg.firstChild;
    expect(progressBg).toHaveClass('bg-gray-200');
    expect(progressFill).toHaveClass('bg-gray-400');
  });

  it('shows softer amber colors when a task is in overtime', () => {
    useTaskStore.getState().addTask('T1', 30);
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().startTask(taskId);
    
    // Simulate time up
    useTaskStore.getState().onTimeUp();

    const { container } = render(<ArrivalDisplay />);
    
    // Main container should be softer amber with border and shadow
    expect(container.firstChild).toHaveClass('bg-amber-50');
    expect(container.firstChild).toHaveClass('border-amber-300');
    expect(container.firstChild).toHaveClass('text-amber-900');
    expect(container.firstChild).not.toHaveClass('bg-amber-500');

    // Label should be amber-600
    const label = screen.getByText(/Arrival time is drifting/i);
    expect(label).toHaveClass('text-amber-600');

    // Progress bar should have good contrast in overtime
    const progressBg = screen.getByRole('progressbar');
    const progressFill = progressBg.firstChild;
    expect(progressBg).toHaveClass('bg-amber-200/50');
    expect(progressFill).toHaveClass('bg-amber-400');
  });
});
