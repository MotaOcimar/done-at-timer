import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ActiveTask from './ActiveTask';
import { useTaskStore } from '../store/useTaskStore';

describe('ActiveTask', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [] });
    vi.useFakeTimers();
  });

  it('renders nothing if no task is in progress', () => {
    useTaskStore.setState({
      tasks: [{ id: '1', title: 'Pending Task', duration: 10, status: 'PENDING' }],
    });
    const { container } = render(<ActiveTask />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the active task details and countdown', () => {
    useTaskStore.setState({
      tasks: [{ id: '1', title: 'Running Task', duration: 10, status: 'IN_PROGRESS' }],
    });
    
    render(<ActiveTask />);
    expect(screen.getByText('Running Task')).toBeInTheDocument();
    // 10 mins = 600 seconds. Initial display should be 10:00 or similar
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
  });

  it('allows marking a task as done', () => {
    useTaskStore.setState({
      tasks: [{ id: '1', title: 'Running Task', duration: 10, status: 'IN_PROGRESS' }],
    });
    
    render(<ActiveTask />);
    fireEvent.click(screen.getByRole('button', { name: /Done/i }));
    
    const tasks = useTaskStore.getState().tasks;
    expect(tasks[0].status).toBe('COMPLETED');
  });
});
