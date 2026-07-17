// @vitest-environment happy-dom
import { render, screen, act, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RoutineItem } from './RoutineItem';
import * as swipeHook from '../hooks/useSwipeToReveal';
import type { Routine } from '../types';

vi.mock('../hooks/useSwipeToReveal');

// Mock framer-motion (same shape as the swipe test)
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

describe('RoutineItem finish forecast (TK-032)', () => {
  // 10:00 UTC + a 40-minute routine ⇒ finishes at 10:40.
  const routine: Routine = {
    id: 'r1',
    name: 'Morning Routine',
    tasks: [
      { title: 'Task 1', expectedDuration: 10 },
      { title: 'Task 2', expectedDuration: 30 },
    ],
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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
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
    } as unknown as ReturnType<typeof swipeHook.useSwipeToReveal>);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the departure–arrival pair on the collapsed row, departure as the word "now" (TK-034)', () => {
    render(<RoutineItem {...baseProps} isExpanded={false} />);

    const forecast = screen.getByTestId('routine-forecast');
    // The row reads as a journey: ◉ now ┄ ⌖ 10:40.
    expect(within(forecast).getByTestId('route-start')).toHaveTextContent(
      /^now$/,
    );
    expect(within(forecast).getByTestId('route-end')).toHaveTextContent(
      '10:40',
    );
    expect(forecast).toHaveTextContent('Leaving now · estimated arrival');
    expect(forecast.querySelector('.lucide-circle-dot')).toBeTruthy();
    expect(forecast.querySelector('.lucide-map-pin')).toBeTruthy();
    // Same ink as the row's other metadata (task count · total): the forecast
    // carries no color of its own, inheriting the row's gray (user feedback).
    expect(forecast).not.toHaveClass('text-gray-500');
  });

  it('repeats the pair in the expanded preview as an interactive tooltip with the reworded label', () => {
    render(<RoutineItem {...baseProps} isExpanded={true} />);

    const tooltip = screen.getByRole('button', {
      description: 'Leaving now · estimated arrival',
    });
    expect(tooltip).toHaveTextContent('now');
    expect(tooltip).toHaveTextContent('10:40');
  });

  it('advances the forecast as the shared clock ticks', () => {
    render(<RoutineItem {...baseProps} isExpanded={false} />);

    expect(screen.getByTestId('routine-forecast')).toHaveTextContent('10:40');

    act(() => {
      vi.advanceTimersByTime(60_000); // one minute later
    });

    expect(screen.getByTestId('routine-forecast')).toHaveTextContent('10:41');
  });
});
