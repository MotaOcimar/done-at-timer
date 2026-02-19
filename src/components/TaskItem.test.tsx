import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskItem from './TaskItem';
import { Task } from '../types';

describe('TaskItem', () => {
  const task: Task = { id: '1', title: 'Test Task', duration: 30, status: 'PENDING' };

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
});
