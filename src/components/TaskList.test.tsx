import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TaskList } from './TaskList';
import { useTaskStore } from '../store/useTaskStore';

// Mock framer-motion to check for LayoutGroup
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, layout, ...props }: any) => (
      <div data-testid="motion-div" data-layout={layout?.toString()} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  LayoutGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="layout-group">{children}</div>,
}));

vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    DndContext: vi.fn(({ children, onDragEnd }) => (
      <div 
        data-testid="dnd-context" 
        onClick={(e: any) => {
          // Access properties from the native event
          const activeId = e.nativeEvent.activeId || '1';
          const overId = e.nativeEvent.overId || '2';
          onDragEnd && onDragEnd({ active: { id: activeId }, over: { id: overId } });
        }}
      >
        {children}
      </div>
    )),
  };
});

vi.mock('@dnd-kit/sortable', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    SortableContext: vi.fn(({ children }) => <div data-testid="sortable-context">{children}</div>),
  };
});

describe('TaskList', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const triggerDragEnd = (activeId: string, overId: string) => {
    const dndContext = screen.getByTestId('dnd-context');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'activeId', { value: activeId });
    Object.defineProperty(event, 'overId', { value: overId });
    dndContext.dispatchEvent(event);
  };

  it('computes and passes ETA to TaskItems', () => {
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'Task 1', duration: 10, status: 'PENDING' },
      ],
      activeTaskTimeLeft: null,
    });
    
    render(<TaskList />);
    expect(screen.getByText(/10:10/)).toBeInTheDocument();
  });

  it('updates ETA in real-time when the clock advances', () => {
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'Task 1', duration: 10, status: 'PENDING' },
      ],
      activeTaskTimeLeft: null,
    });
    
    render(<TaskList />);
    expect(screen.getByText(/10:10/)).toBeInTheDocument();

    act(() => {
      vi.setSystemTime(new Date('2026-01-01T10:01:00Z'));
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/10:11/)).toBeInTheDocument();
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
    
    // Trigger the mock drag end
    act(() => {
      triggerDragEnd('1', '2');
    });
    
    const { tasks } = useTaskStore.getState();
    expect(tasks[0].id).toBe('2');
    expect(tasks[1].id).toBe('1');
  });

  it('prevents reordering PENDING tasks above ACTIVE tasks', () => {
    // Task 1 (ACTIVE), Task 2 (PENDING)
    useTaskStore.setState({
      tasks: [
        { id: '2', title: 'Active Task', duration: 10, status: 'IN_PROGRESS' },
        { id: '1', title: 'Pending Task', duration: 20, status: 'PENDING' },
      ],
      activeTaskId: '2',
    });

    render(<TaskList />);
    
    // Move '1' over '2'
    act(() => {
      triggerDragEnd('1', '2');
    });
    
    const { tasks } = useTaskStore.getState();
    // Order should NOT change
    expect(tasks[0].id).toBe('2');
    expect(tasks[1].id).toBe('1');
  });

  it('clamps reordering of PENDING tasks to be after COMPLETED tasks', () => {
    useTaskStore.setState({
      tasks: [
        { id: 'c1', title: 'Completed 1', duration: 10, status: 'COMPLETED' },
        { id: 'i1', title: 'Active 1', duration: 10, status: 'IN_PROGRESS' },
        { id: 'p1', title: 'Pending 1', duration: 10, status: 'PENDING' },
        { id: 'p2', title: 'Pending 2', duration: 10, status: 'PENDING' },
      ],
      activeTaskId: 'i1',
    });

    render(<TaskList />);
    
    // Try to move 'p2' over 'c1' (completed)
    act(() => {
      triggerDragEnd('p2', 'c1');
    });
    
    let { tasks } = useTaskStore.getState();
    // 'p2' should be clamped to the first pending position (index 2)
    // List should be [c1, i1, p2, p1]
    expect(tasks[2].id).toBe('p2');
    expect(tasks[0].id).toBe('c1');
    expect(tasks[1].id).toBe('i1');

    // Try to move 'p1' over 'i1' (active)
    act(() => {
      triggerDragEnd('p1', 'i1');
    });
    tasks = useTaskStore.getState().tasks;
    // 'p1' should be clamped to the first pending position (index 2)
    // Current list is [c1, i1, p2, p1]. Move p1 over i1 -> clamped to 2 -> [c1, i1, p1, p2]
    expect(tasks[2].id).toBe('p1');
    expect(tasks[1].id).toBe('i1');
  });

  it('recalculates ETAs when tasks are reordered', () => {
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'Task 1', duration: 10, status: 'PENDING' },
        { id: '2', title: 'Task 2', duration: 20, status: 'PENDING' },
      ],
    });

    render(<TaskList />);
    
    // Initial ETAs: Task 1: 10:10, Task 2: 10:30
    expect(screen.getByText(/10:10/)).toBeInTheDocument();
    expect(screen.getByText(/10:30/)).toBeInTheDocument();

    // Reorder: Move '1' over '2' -> arrayMove(0, 1) -> ['2', '1']
    act(() => {
      triggerDragEnd('1', '2');
    });
    
    // New Order: Task 2 (20 min), Task 1 (10 min)
    // New ETAs: Task 2: 10:20, Task 1: 10:30
    expect(screen.getByText(/10:20/)).toBeInTheDocument();
    expect(screen.getByText(/10:30/)).toBeInTheDocument();
  });

  it('wraps the sortable items in a LayoutGroup for smooth reordering', () => {
    useTaskStore.setState({
      tasks: [{ id: '1', title: 'Task 1', duration: 10, status: 'PENDING' }],
    });

    render(<TaskList />);
    
    expect(screen.getByTestId('layout-group')).toBeInTheDocument();
  });
});
