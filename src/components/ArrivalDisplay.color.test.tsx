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

  it('shows active blue colors when a task is running', () => {
    useTaskStore.getState().addTask('T1', 30);
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().startTask(taskId);

    const { container } = render(<ArrivalDisplay />);
    
    // Main container should be active blue
    expect(container.firstChild).toHaveClass('bg-blue-600');
    expect(container.firstChild).not.toHaveClass('bg-amber-500');

    // Label should be blue-200
    const label = screen.getByText(/You will be done at/i);
    expect(label).toHaveClass('text-blue-200');
  });

  it('shows neutral gray colors when a task is paused', () => {
    useTaskStore.getState().addTask('T1', 30);
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().startTask(taskId);
    useTaskStore.getState().pauseTask();

    const { container } = render(<ArrivalDisplay />);
    
    // Main container should be neutral gray (currently it's bg-amber-500)
    expect(container.firstChild).toHaveClass('bg-gray-100');
    expect(container.firstChild).toHaveClass('text-gray-900');
    expect(container.firstChild).not.toHaveClass('bg-amber-500');

    // Label should be gray-500
    const label = screen.getByText(/Arrival time is drifting/i);
    expect(label).toHaveClass('text-gray-500');
  });

  it('shows softer amber colors when a task is in overtime', () => {
    useTaskStore.getState().addTask('T1', 30);
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().startTask(taskId);
    
    // Simulate time up
    useTaskStore.getState().onTimeUp();

    const { container } = render(<ArrivalDisplay />);
    
    // Main container should be softer amber (currently it's bg-amber-500)
    expect(container.firstChild).toHaveClass('bg-amber-50');
    expect(container.firstChild).toHaveClass('text-amber-900');
    expect(container.firstChild).not.toHaveClass('bg-amber-500');

    // Label should be amber-600
    const label = screen.getByText(/Arrival time is drifting/i);
    expect(label).toHaveClass('text-amber-600');
  });
});
