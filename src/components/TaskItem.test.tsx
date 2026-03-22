// @vitest-environment happy-dom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskItem } from './TaskItem';
import type { Task } from '../types';
import { useTaskStore } from '../store/useTaskStore';

// Mock framer-motion to check for layout prop
vi.mock('framer-motion', () => ({
  motion: {
    div: vi.fn(({ children, layout, drag, dragConstraints, onDragStart, onDrag, onDragEnd, animate, ...props }) => (
      <div 
        data-testid="motion-div" 
        data-layout={layout?.toString()} 
        {...props}
      >
        {children}
      </div>
    )),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  LayoutGroup: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useMotionValue: (initial: any) => ({
    get: () => initial,
    set: vi.fn(),
    onChange: vi.fn(),
  }),
  useTransform: (_value: any, _input: any, output: any) => output[0],
}));

vi.mock('@dnd-kit/sortable', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    useSortable: vi.fn(() => ({
      attributes: { 'aria-roledescription': 'sortable' },
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

  it('is sortable when pending', async () => {
    const { useSortable } = await import('@dnd-kit/sortable');
    render(<TaskItem task={task} onDelete={vi.fn()} />);
    
    expect(useSortable).toHaveBeenCalledWith(expect.objectContaining({
      id: task.id,
      disabled: false
    }));
    
    const container = screen.getByTestId('task-item-container');
    expect(container).toHaveAttribute('aria-roledescription', 'sortable');
  });

  it('is not sortable when completed', async () => {
    const { useSortable } = await import('@dnd-kit/sortable');
    const completedTask: Task = { ...task, status: 'COMPLETED' };
    render(<TaskItem task={completedTask} onDelete={vi.fn()} />);
    
    expect(useSortable).toHaveBeenCalledWith(expect.objectContaining({
      id: task.id,
      disabled: true
    }));
  });

  it('renders a motion.div wrapper with layout="position" prop for animations', () => {
    render(<TaskItem task={task} onDelete={vi.fn()} />);
    
    // There are multiple motion.divs now (reveal layer and swipe layer)
    const motionDivs = screen.getAllByTestId('motion-div');
    const layoutDiv = motionDivs.find(div => div.hasAttribute('data-layout'));
    
    expect(layoutDiv).toBeDefined();
    expect(layoutDiv?.getAttribute('data-layout')).toBe('position');
  });

  it('disables layout animation during dragging to prevent conflicts with dnd-kit transforms', async () => {
    const { useSortable } = await import('@dnd-kit/sortable');
    
    // Mock isDragging as true
    vi.mocked(useSortable).mockReturnValueOnce({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: true,
    } as any);

    render(<TaskItem task={task} onDelete={vi.fn()} />);
    
    const motionDivs = screen.getAllByTestId('motion-div');
    const layoutDiv = motionDivs.find(div => div.hasAttribute('data-layout'));
    
    // layout prop should be false when isDragging is true
    expect(layoutDiv?.getAttribute('data-layout')).toBe('false');
  });
});
