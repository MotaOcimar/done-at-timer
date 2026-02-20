import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskItem } from './TaskItem';
import type { Task } from '../types';
import { useTaskStore } from '../store/useTaskStore';

describe('TaskItem', () => {
  const task: Task = { id: '1', title: 'Test Task', duration: 30, status: 'PENDING' };

  beforeEach(() => {
    useTaskStore.getState().clearTasks();
  });

  it('renders task details', () => {
    render(<TaskItem task={task} onDelete={vi.fn()} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<TaskItem task={task} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(task.id);
  });

  it('starts task when play button is clicked', () => {
    useTaskStore.getState().addTask('Test', 10);
    const taskFromStore = useTaskStore.getState().tasks[0];
    
    render(<TaskItem task={taskFromStore} onDelete={vi.fn()} />);
    
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    
    expect(useTaskStore.getState().activeTaskId).toBe(taskFromStore.id);
  });

  it('renders correctly when task is completed', () => {
    const completedTask: Task = { ...task, status: 'COMPLETED' };
    render(<TaskItem task={completedTask} onDelete={vi.fn()} />);
    
    // Title should have line-through
    const title = screen.getByText('Test Task');
    expect(title).toHaveClass('line-through');
    
    // Should have a checkmark icon instead of play button
    expect(screen.queryByRole('button', { name: /play/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('checkmark-icon')).toBeInTheDocument();
    
    // Container should be dimmed
    const container = title.closest('div.flex.flex-col');
    expect(container).toHaveClass('opacity-70');
  });

  it('renders ProgressBar and timer when task is active', () => {
    useTaskStore.setState({
      activeTaskId: '1',
      tasks: [
        { id: '1', title: 'Active Task', duration: 10, status: 'IN_PROGRESS' }
      ],
      targetEndTime: Date.now() + 10 * 60 * 1000,
      totalElapsedBeforePause: 0,
    });
    
    const activeTask = useTaskStore.getState().tasks[0];
    render(<TaskItem task={activeTask} onDelete={vi.fn()} />);
    
    // Should show progress bar (or a placeholder for it)
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    // Should show "min left"
    expect(screen.getByText(/min left/i)).toBeInTheDocument();
    // Should show Pause button
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    // Should show Done button
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
  });

  it('maintains consistent status icon container across states', () => {
    // Test Pending State
    const { rerender } = render(<TaskItem task={{ ...task, status: 'PENDING' }} onDelete={vi.fn()} />);
    const pendingIcon = screen.getByLabelText(/play/i).parentElement;
    expect(pendingIcon).toHaveClass('w-10', 'h-10');

    // Test Active State (Running)
    useTaskStore.setState({ activeTaskId: task.id, targetEndTime: Date.now() + 10000 });
    rerender(<TaskItem task={{ ...task, status: 'IN_PROGRESS' }} onDelete={vi.fn()} />);
    const activeIcon = screen.getByLabelText(/pause/i).parentElement;
    expect(activeIcon).toHaveClass('w-10', 'h-10');

    // Test Active State (Paused)
    useTaskStore.setState({ activeTaskId: task.id, targetEndTime: null });
    rerender(<TaskItem task={{ ...task, status: 'IN_PROGRESS' }} onDelete={vi.fn()} />);
    const pausedIcon = screen.getByLabelText(/resume/i).parentElement;
    expect(pausedIcon).toHaveClass('w-10', 'h-10');

    // Test Completed State
    rerender(<TaskItem task={{ ...task, status: 'COMPLETED' }} onDelete={vi.fn()} />);
    const completedIcon = screen.getByTestId('checkmark-icon');
    expect(completedIcon).toHaveClass('w-10', 'h-10');
  });

  it('uses consistent duration text styling across states', () => {
    const { rerender } = render(<TaskItem task={{ ...task, status: 'PENDING' }} onDelete={vi.fn()} />);
    expect(screen.getByText('30 min')).toHaveClass('text-xs', 'font-bold', 'uppercase');

    rerender(<TaskItem task={{ ...task, status: 'COMPLETED' }} onDelete={vi.fn()} />);
    expect(screen.getByText('30 min')).toHaveClass('text-xs', 'font-bold', 'uppercase');
  });
});
