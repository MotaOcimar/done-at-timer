import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ActiveTask from './ActiveTask';
import { useTaskStore } from '../store/useTaskStore';

describe('ActiveTask', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
    vi.useFakeTimers();
  });

  it('renders nothing if no task is in progress', () => {
    useTaskStore.getState().addTask('Pending Task', 10);
    const { container } = render(<ActiveTask />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the active task details and countdown', () => {
    useTaskStore.getState().addTask('Running Task', 10);
    const task = useTaskStore.getState().tasks[0];
    
    // Simula o início da tarefa através da lógica da store
    useTaskStore.getState().updateTask(task.id, { status: 'IN_PROGRESS' });
    
    render(<ActiveTask />);
    expect(screen.getByText('Running Task')).toBeInTheDocument();
    // 10 mins = 600 seconds. Initial display should be 10:00 or similar
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
  });

  it('allows marking a task as done', () => {
    useTaskStore.getState().addTask('Running Task', 10);
    const task = useTaskStore.getState().tasks[0];
    useTaskStore.getState().updateTask(task.id, { status: 'IN_PROGRESS' });
    
    render(<ActiveTask />);
    fireEvent.click(screen.getByRole('button', { name: /Done/i }));
    
    const tasks = useTaskStore.getState().tasks;
    expect(tasks[0].status).toBe('COMPLETED');
  });
});
