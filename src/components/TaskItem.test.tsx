import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskItem from './TaskItem';
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
    const container = title.closest('div.flex.items-center.justify-between');
    expect(container).toHaveClass('opacity-80');
  });
});
