// @vitest-environment happy-dom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoutineItem } from './RoutineItem';
import * as swipeHook from '../hooks/useSwipeToReveal';
import type { Routine } from '../types';

vi.mock('../hooks/useSwipeToReveal');

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: vi.fn(
      ({
        children,
        layout,
        drag,
        dragConstraints,
        dragElastic,
        onDragStart,
        onDrag,
        onDragEnd,
        animate,
        ...props
      }) => (
        <div data-testid="motion-div" data-drag={drag?.toString()} {...props}>
          {children}
        </div>
      ),
    ),
  },
  animate: vi.fn(() => ({ stop: () => {}, finished: Promise.resolve() })),
}));

describe('RoutineItem swipe-to-delete', () => {
  const routine: Routine = {
    id: 'r1',
    name: 'Morning Routine',
    tasks: [{ title: 'Task 1', expectedDuration: 10 }],
  } as Routine;

  const baseProps = {
    routine,
    isExpanded: false,
    shareFeedback: null,
    activeSwipeId: null,
    onSwipeDismissAll: vi.fn(),
    onToggleExpand: vi.fn(),
    onLoad: vi.fn(),
    onShare: vi.fn(),
    onDelete: vi.fn(),
  };

  const mockHook = (overrides: Partial<{ isRevealed: boolean }> = {}) => {
    vi.mocked(swipeHook.useSwipeToReveal).mockReturnValue({
      isRevealed: false,
      isSwipeActive: false,
      dismiss: vi.fn(),
      x: { set: vi.fn(), get: () => 0 },
      redOpacity: { get: () => 0 },
      dragProps: {
        drag: 'x',
        dragConstraints: { left: -80, right: 0 },
        dragElastic: { left: 0.3, right: 0 },
        onDragStart: vi.fn(),
        onDrag: vi.fn(),
        onDragEnd: vi.fn(),
        style: {},
      },
      ...overrides,
    } as any);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockHook();
  });

  it('should enable the swipe hook for the routine', () => {
    render(<RoutineItem {...baseProps} />);

    expect(swipeHook.useSwipeToReveal).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'r1', isEnabled: true }),
    );
  });

  it('should render the delete button behind, hidden while not revealed', () => {
    render(<RoutineItem {...baseProps} />);

    const deleteButton = screen.getByLabelText('Delete routine');
    expect(deleteButton).toHaveAttribute('aria-hidden', 'true');
    expect(deleteButton).toHaveAttribute('tabindex', '-1');
  });

  it('should expose the delete button when revealed, and delete immediately on tap', () => {
    mockHook({ isRevealed: true });
    const onDelete = vi.fn();
    render(<RoutineItem {...baseProps} onDelete={onDelete} />);

    const deleteButton = screen.getByLabelText('Delete routine');
    expect(deleteButton).toHaveAttribute('aria-hidden', 'false');
    expect(deleteButton).toHaveAttribute('tabindex', '0');

    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith('r1');
  });

  it('should not render any always-visible delete button', () => {
    render(<RoutineItem {...baseProps} />);

    // The only delete affordance is the one in the reveal area.
    expect(screen.getAllByLabelText('Delete routine')).toHaveLength(1);
  });

  it('should delete the routine with the Delete key as a non-gesture fallback', () => {
    const onDelete = vi.fn();
    render(<RoutineItem {...baseProps} onDelete={onDelete} />);

    const container = screen.getByTestId('routine-item');
    fireEvent.keyDown(container, { key: 'Delete' });

    expect(onDelete).toHaveBeenCalledWith('r1');
  });

  it('should make the row draggable on the x axis', () => {
    render(<RoutineItem {...baseProps} />);

    expect(
      screen.getByTestId('routine-swipeable').getAttribute('data-drag'),
    ).toBe('x');
  });

  it('should keep the swiping row rounded so its corners stay curved mid-swipe', () => {
    render(<RoutineItem {...baseProps} />);

    expect(screen.getByTestId('routine-swipeable').className).toContain(
      'rounded-2xl',
    );
  });
});
