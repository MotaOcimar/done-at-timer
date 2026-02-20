import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { TaskList } from './TaskList';
import { useTaskStore } from '../store/useTaskStore';

describe('TaskList', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [] });
  });

  it('renders list of tasks', () => {
    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'Task 1', duration: 10, status: 'PENDING' },
        { id: '2', title: 'Task 2', duration: 20, status: 'PENDING' },
      ],
    });

    render(<TaskList />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('removes task when delete is clicked', () => {
    useTaskStore.setState({
      tasks: [{ id: '1', title: 'Task 1', duration: 10, status: 'PENDING' }],
    });

    render(<TaskList />);
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);

    const tasks = useTaskStore.getState().tasks;
    expect(tasks).toHaveLength(0);
  });

  it('shows empty state', () => {
    render(<TaskList />);
    expect(screen.getByText(/No tasks yet/i)).toBeInTheDocument();
  });

  it('shows Restart Routine when all tasks are completed', () => {
    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'Task 1', duration: 10, status: 'COMPLETED' },
      ],
    });

    render(<TaskList />);
    expect(screen.getByRole('button', { name: /restart routine/i })).toBeInTheDocument();
  });
});
