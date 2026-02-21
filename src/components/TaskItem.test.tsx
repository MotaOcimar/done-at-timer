import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskItem } from './TaskItem';
import type { Task } from '../types';
import { useTaskStore } from '../store/useTaskStore';

vi.mock('@dnd-kit/sortable', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useSortable: vi.fn(() => ({
      attributes: { 'data-testid': 'sortable-attributes' },
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: false,
    })),
  };
});

describe('TaskItem', () => {
  const task: Task = { id: '1', title: 'Test Task', duration: 30, status: 'PENDING' };

  beforeEach(() => {
    useTaskStore.getState().clearTasks();
    useTaskStore.getState().addTask(task.title, task.duration);
  });

  it('renders task details', () => {
    render(<TaskItem task={task} onDelete={vi.fn()} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText(/min/)).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<TaskItem task={task} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(task.id);
  });

  it('starts task when play button is clicked', () => {
    const taskFromStore = useTaskStore.getState().tasks[0];
    render(<TaskItem task={taskFromStore} onDelete={vi.fn()} />);
    
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    
    expect(useTaskStore.getState().activeTaskId).toBe(taskFromStore.id);
  });

  it('renders correctly when task is completed', () => {
    const completedTask: Task = { ...task, status: 'COMPLETED' };
    render(<TaskItem task={completedTask} onDelete={vi.fn()} />);
    
    // Title should have line-through (applied to h3 parent)
    const title = screen.getByText('Test Task');
    expect(title.closest('h3')).toHaveClass('line-through');
    
    // Should have a checkmark icon instead of play button
    expect(screen.queryByRole('button', { name: /play/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('checkmark-icon')).toBeInTheDocument();
  });

  it('enters edit mode when clicking title', () => {
    const taskFromStore = useTaskStore.getState().tasks[0];
    render(<TaskItem task={taskFromStore} onDelete={vi.fn()} />);

    const titleElement = screen.getByText('Test Task');
    fireEvent.click(titleElement);

    const input = screen.getByDisplayValue('Test Task');
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('updates title on blur', () => {
    const taskFromStore = useTaskStore.getState().tasks[0];
    render(<TaskItem task={taskFromStore} onDelete={vi.fn()} />);

    const titleElement = screen.getByText('Test Task');
    fireEvent.click(titleElement);

    const input = screen.getByDisplayValue('Test Task');
    fireEvent.change(input, { target: { value: 'Updated Title' } });
    fireEvent.blur(input);

    const updatedTask = useTaskStore.getState().tasks[0];
    expect(updatedTask.title).toBe('Updated Title');
  });

  it('updates duration on enter', () => {
    const taskFromStore = useTaskStore.getState().tasks[0];
    render(<TaskItem task={taskFromStore} onDelete={vi.fn()} />);

    const durationElement = screen.getByText('30');
    fireEvent.click(durationElement);

    const input = screen.getByDisplayValue('30');
    fireEvent.change(input, { target: { value: '45' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    const updatedTask = useTaskStore.getState().tasks[0];
    expect(updatedTask.duration).toBe(45);
  });

  it('reverts changes on escape', () => {
    const taskFromStore = useTaskStore.getState().tasks[0];
    render(<TaskItem task={taskFromStore} onDelete={vi.fn()} />);

    const titleElement = screen.getByText('Test Task');
    fireEvent.click(titleElement);

    const input = screen.getByDisplayValue('Test Task');
    fireEvent.change(input, { target: { value: 'Cancelled Change' } });
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

    const updatedTask = useTaskStore.getState().tasks[0];
    expect(updatedTask.title).toBe('Test Task');
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Cancelled Change')).not.toBeInTheDocument();
  });

  it('is sortable', () => {
    render(<TaskItem task={task} onDelete={vi.fn()} />);
    
    // The handle should have the attributes from useSortable mock
    const handle = screen.getByLabelText(/drag to reorder/i);
    expect(handle).toHaveAttribute('data-testid', 'sortable-attributes');
  });
});
