// @vitest-environment happy-dom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskItem } from './TaskItem';
import * as swipeHook from '../hooks/useSwipeToReveal';
import { useSortable } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';

vi.mock('../hooks/useSwipeToReveal');

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: vi.fn(({ children, layout, drag, dragConstraints, dragElastic, onDragStart, onDrag, onDragEnd, animate, ...props }) => (
      <div data-testid="motion-div" data-layout={layout?.toString()} {...props}>
        {children}
      </div>
    )),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  LayoutGroup: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  animate: vi.fn(() => ({ stop: () => {}, finished: Promise.resolve() })),
}));

vi.mock('@dnd-kit/sortable', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    useSortable: vi.fn(() => ({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: false,
    })),
  };
});

describe('TaskItem Swipe (Phase 2 RED)', () => {
  const task = { id: '1', title: 'Test Task', duration: 30, status: 'PENDING' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.mocked(swipeHook.useSwipeToReveal).mockReturnValue({
      isRevealed: false,
      isSwipeActive: false,
      dismiss: vi.fn(),
      x: { set: vi.fn(), get: () => 0 },
      redOpacity: { get: () => 0 },
      dragProps: {
        drag: "x",
        dragConstraints: { left: -80, right: 0 },
        dragElastic: { left: 0.3, right: 0 },
        onDragStart: vi.fn(),
        onDrag: vi.fn(),
        onDragEnd: vi.fn(),
        style: { x: 0 },
      },
    } as any);
  });

  it('reveals Delete button when isRevealed is true', () => {
    vi.mocked(swipeHook.useSwipeToReveal).mockReturnValue({
      isRevealed: true,
      isSwipeActive: false,
      dismiss: vi.fn(),
      x: { set: vi.fn(), get: () => -80 },
      redOpacity: { get: () => 1 },
      dragProps: { style: { x: -80 } } as any,
    } as any);

    render(<TaskItem task={task} onDelete={vi.fn()} />);
    
    // In Phase 2, the revealed Delete button should have Trash2 icon (checked via role)
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('calls onDelete when the revealed Delete button is clicked', () => {
    const onDelete = vi.fn();
    vi.mocked(swipeHook.useSwipeToReveal).mockReturnValue({
      isRevealed: true,
      isSwipeActive: false,
      dismiss: vi.fn(),
      x: { set: vi.fn(), get: () => -80 },
      redOpacity: { get: () => 1 },
      dragProps: { style: { x: -80 } } as any,
    } as any);

    render(<TaskItem task={task} onDelete={onDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /^Delete$/ });
    fireEvent.click(deleteButton);
    
    expect(onDelete).toHaveBeenCalledWith(task.id);
  });

  it('trash button is not accessible when not revealed', () => {
    // Reveal state is controlled by the hook's isRevealed output
    vi.mocked(swipeHook.useSwipeToReveal).mockReturnValue({
      isRevealed: false,
      isSwipeActive: false,
      dismiss: vi.fn(),
      x: { set: vi.fn(), get: () => 0 },
      redOpacity: { get: () => 0 },
      dragProps: { style: { x: 0 } } as any,
    } as any);

    render(<TaskItem task={task} onDelete={vi.fn()} />);
    
    // The button exists in DOM (for opacity reveal) but is hidden from screen readers/keyboard
    const deleteButton = screen.getByTestId('delete-button');
    expect(deleteButton).toHaveAttribute('tabIndex', '-1');
    expect(deleteButton).toHaveAttribute('aria-hidden', 'true');
  });

  it('trash button is keyboard-reachable when revealed', () => {
    vi.mocked(swipeHook.useSwipeToReveal).mockReturnValue({
      isRevealed: true,
      isSwipeActive: false,
      dismiss: vi.fn(),
      x: { set: vi.fn(), get: () => -80 },
      redOpacity: { get: () => 1 },
      dragProps: { style: { x: -80 } } as any,
    } as any);

    render(<TaskItem task={task} onDelete={vi.fn()} />);
    
    const deleteButton = screen.getByTestId('delete-button');
    expect(deleteButton).toHaveAttribute('tabIndex', '0');
    expect(deleteButton).toHaveAttribute('aria-hidden', 'false');
  });

  it('does not render reveal layer for completed tasks', () => {
    const completedTask = { ...task, status: 'COMPLETED' };
    render(<TaskItem task={completedTask} onDelete={vi.fn()} />);
    
    // The reveal layer (containing Delete button) should not be rendered at all
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('disables swipe-to-delete for completed tasks', () => {
    const completedTask = { ...task, status: 'COMPLETED' };
    render(<TaskItem task={completedTask} onDelete={vi.fn()} />);
    
    expect(swipeHook.useSwipeToReveal).toHaveBeenCalledWith(expect.objectContaining({
      isEnabled: false
    }));
  });

  it('triggers onDelete on Delete key down if card is focused', () => {
    const onDelete = vi.fn();
    render(<TaskItem task={task} onDelete={onDelete} />);
    
    const card = screen.getByTestId('task-item-container');
    fireEvent.keyDown(card, { key: 'Delete', code: 'Delete' });
    
    expect(onDelete).toHaveBeenCalledWith(task.id);
  });

  it('does NOT trigger onDelete on Delete key if an input is focused', () => {
    const onDelete = vi.fn();
    render(<TaskItem task={task} onDelete={onDelete} />);
    
    // We'll use the title which is an InlineEdit (renders input when clicked)
    const title = screen.getByText('Test Task');
    fireEvent.click(title);
    const input = screen.getByDisplayValue('Test Task');
    
    fireEvent.keyDown(input, { key: 'Delete', code: 'Delete' });
    
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('resets x motion value to 0 when drag-to-reorder starts (isDragging=true)', () => {
    const xSetSpy = vi.fn();
    const mockX = { set: xSetSpy, get: () => -10 }; // Simulate partial swipe

    vi.mocked(swipeHook.useSwipeToReveal).mockReturnValue({
      isRevealed: false,
      isSwipeActive: false,
      x: mockX,
      redOpacity: { get: () => 0.1 },
      dragProps: {
        drag: "x",
        dragConstraints: { left: -80, right: 0 },
        dragElastic: { left: 0.3, right: 0 },
        onDragStart: vi.fn(),
        onDrag: vi.fn(),
        onDragEnd: vi.fn(),
        style: { x: mockX },
      } as any,
    } as any);

    const { rerender } = render(<TaskItem task={task} onDelete={vi.fn()} />);
    xSetSpy.mockClear();

    // Re-mock useSortable to return isDragging: true
    vi.mocked(useSortable).mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: true,
    } as any);

    rerender(<TaskItem task={task} onDelete={vi.fn()} />);

    expect(xSetSpy).toHaveBeenCalledWith(0);
  });

  it('blocks stale framer-motion onDragEnd after dnd-kit drag release', () => {
    const hookDragEnd = vi.fn();
    const xSetSpy = vi.fn();
    const mockX = { set: xSetSpy, get: () => 0 };

    vi.mocked(swipeHook.useSwipeToReveal).mockReturnValue({
      isRevealed: false,
      isSwipeActive: false,
      x: mockX,
      redOpacity: { get: () => 0 },
      dragProps: {
        drag: "x",
        dragConstraints: { left: -80, right: 0 },
        dragElastic: { left: 0.3, right: 0 },
        onDragStart: vi.fn(),
        onDrag: vi.fn(),
        onDragEnd: hookDragEnd,
        style: { x: mockX },
      },
    } as any);

    // Start with isDragging: true (dnd-kit drag active)
    vi.mocked(useSortable).mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: true,
    } as any);

    const { rerender } = render(<TaskItem task={task} onDelete={vi.fn()} />);

    // Release: isDragging → false (drag re-enables to "x")
    vi.mocked(useSortable).mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: false,
    } as any);
    rerender(<TaskItem task={task} onDelete={vi.fn()} />);

    // Simulate framer-motion firing a stale onDragEnd from the PanSession
    const motionDiv = vi.mocked(motion.div) as any;
    const lastCallProps = motionDiv.mock.calls[motionDiv.mock.calls.length - 1][0];
    lastCallProps.onDragEnd(null, { offset: { x: -60 }, velocity: { x: 0 } });

    // The hook's onDragEnd must NOT have been called
    expect(hookDragEnd).not.toHaveBeenCalled();
  });
});
