import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskList } from './TaskList';
import { useTaskStore } from '../store/useTaskStore';

vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    DndContext: vi.fn(({ children, onDragEnd }) => (
      <div data-testid="dnd-context" onClick={() => onDragEnd && onDragEnd({ active: { id: '1' }, over: { id: '2' } })}>
        {children}
      </div>
    )),
  };
});

vi.mock('@dnd-kit/sortable', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    SortableContext: vi.fn(({ children }) => <div data-testid="sortable-context">{children}</div>),
  };
});

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

  it('renders sortable tasks within a DndContext and SortableContext', () => {
    useTaskStore.setState({
      tasks: [{ id: '1', title: 'Task 1', duration: 10, status: 'PENDING' }],
    });

    render(<TaskList />);
    
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
  });

  it('updates store on drag end', () => {
    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'Task 1', duration: 10, status: 'PENDING' },
        { id: '2', title: 'Task 2', duration: 20, status: 'PENDING' },
      ],
    });

    render(<TaskList />);
    
    // Trigger the mock drag end by clicking the dnd-context div
    fireEvent.click(screen.getByTestId('dnd-context'));
    
    const { tasks } = useTaskStore.getState();
    expect(tasks[0].id).toBe('2');
    expect(tasks[1].id).toBe('1');
  });
});
