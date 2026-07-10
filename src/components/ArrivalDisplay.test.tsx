// @vitest-environment happy-dom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArrivalDisplay } from './ArrivalDisplay';
import { useTaskStore } from '../store/useTaskStore';

describe('ArrivalDisplay', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
  });

  it('calculates arrival time correctly based on tasks and now', () => {
    useTaskStore.getState().addTask('T1', 30);
    useTaskStore.getState().addTask('T2', 30);

    render(<ArrivalDisplay />);

    // 10:00 + 60 mins = 11:00
    expect(screen.getByText('11:00')).toBeInTheDocument();
  });

  it('updates arrival time when a task is in progress', () => {
    useTaskStore.getState().addTask('T1', 30);
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().startTask(taskId);

    vi.advanceTimersByTime(600000); // 10 mins passed

    render(<ArrivalDisplay />);

    // Total duration was 30 mins. 10 passed. 20 left.
    // 10:10 (current time) + 20 mins = 10:30
    expect(screen.getByText('10:30')).toBeInTheDocument();
  });

  it('uses a visible (blue-tinted) shimmer on the white running fill', () => {
    useTaskStore.getState().addTask('T1', 30);
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().startTask(taskId);

    render(<ArrivalDisplay />);

    const fill = screen.getByRole('progressbar').firstChild;
    expect(fill).toHaveClass('shimmer');
    expect(fill).toHaveClass('shimmer-blue');
  });

  it('maintains arrival time when task is paused', () => {
    useTaskStore.getState().addTask('T1', 30);
    const taskId = useTaskStore.getState().tasks[0].id;

    useTaskStore.getState().startTask(taskId);
    vi.advanceTimersByTime(600000); // 10 mins passed

    useTaskStore.getState().pauseTask();

    render(<ArrivalDisplay />);

    // Ainda deve ser 10:30 (10:10 atual + 20 restantes)
    expect(screen.getByText('10:30')).toBeInTheDocument();

    // Check for remaining time text (20 min left)
    expect(screen.getByText(/20 min left/i)).toBeInTheDocument();

    // Check for progress bar
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
  });

  it('shows celebration message when all tasks are completed', () => {
    useTaskStore.getState().addTask('T1', 10);
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().updateTask(taskId, { status: 'COMPLETED' });

    render(<ArrivalDisplay />);

    expect(screen.getByText(/Routine Complete/i)).toBeInTheDocument();
    expect(screen.getByText(/All tasks finished/i)).toBeInTheDocument();
  });

  it('shows neutral gray color and a slipping estimate when paused', () => {
    useTaskStore.getState().addTask('T1', 30);
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().startTask(taskId);
    useTaskStore.getState().pauseTask();

    const { container } = render(<ArrivalDisplay />);

    expect(screen.getByText(/slipping/i)).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-gray-50');
  });

  it('shows softer amber color and a slipping estimate when time is up', () => {
    useTaskStore.getState().addTask('T1', 30);
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().startTask(taskId);

    // Simulate time up
    useTaskStore.getState().onTimeUp();

    const { container } = render(<ArrivalDisplay />);

    expect(screen.getByText(/slipping/i)).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-amber-50');
  });

  it('calculates ETA correctly during overtime (no past ETA)', () => {
    // Current Time: 10:00
    useTaskStore.getState().addTask('T1', 1); // 1 min task
    useTaskStore.getState().addTask('T2', 10); // 10 min task
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().startTask(taskId);

    // Fast forward 5 minutes (4 mins past T1's estimate)
    // Clock is now 10:05. T1 is in overtime.
    vi.advanceTimersByTime(300000);
    useTaskStore.getState().onTimeUp();

    render(<ArrivalDisplay />);

    // T1 is done at 10:05 (Now) + T2 (10 mins) = 10:15
    // BEFORE fix, it would show 10:00 + 1 + 10 = 10:11 (which is in the past relative to 10:05)
    expect(screen.getByText('10:15')).toBeInTheDocument();
  });

  // TK-005: iconographic locked-vs-drifting state signal (replaces the text label)
  describe('arrival state icon (TK-005)', () => {
    it('shows a static (pin) icon and a steady estimate when idle', () => {
      useTaskStore.getState().addTask('T1', 30); // added but not started

      render(<ArrivalDisplay />);

      const icon = screen.getByTestId('arrival-state-icon');
      // not the analog drifting clock
      expect(
        icon.querySelector('[data-testid="clock-second-hand"]'),
      ).toBeNull();
      expect(screen.getByText('Estimated arrival time')).toBeInTheDocument();
      expect(screen.queryByText(/slipping/i)).not.toBeInTheDocument();
    });

    it('shows a static (pin) icon and a steady estimate while running', () => {
      useTaskStore.getState().addTask('T1', 30);
      const taskId = useTaskStore.getState().tasks[0].id;
      useTaskStore.getState().startTask(taskId);

      render(<ArrivalDisplay />);

      const icon = screen.getByTestId('arrival-state-icon');
      // not the analog drifting clock
      expect(
        icon.querySelector('[data-testid="clock-second-hand"]'),
      ).toBeNull();
      expect(screen.getByText('Estimated arrival time')).toBeInTheDocument();
      expect(screen.queryByText(/slipping/i)).not.toBeInTheDocument();
    });

    it('shows an analog clock of the ETA when paused (drifting)', () => {
      useTaskStore.getState().addTask('T1', 30);
      const taskId = useTaskStore.getState().tasks[0].id;
      useTaskStore.getState().startTask(taskId);
      useTaskStore.getState().pauseTask();

      render(<ArrivalDisplay />);

      const clock = screen.getByTestId('arrival-state-icon');
      // second hand present (ticks with real time)
      expect(
        clock.querySelector('[data-testid="clock-second-hand"]'),
      ).toBeInTheDocument();
      // ETA = 10:00 + 30 min left = 10:30 → minute hand at 30*6 = 180deg,
      // proving the clock's hands are wired to the real arrival time.
      expect(
        clock
          .querySelector('[data-testid="clock-minute-hand"]')
          ?.getAttribute('transform'),
      ).toBe('rotate(180 12 12)');
      expect(screen.getByText(/slipping/i)).toBeInTheDocument();
    });

    it('shows the analog drifting clock in overtime', () => {
      useTaskStore.getState().addTask('T1', 30);
      const taskId = useTaskStore.getState().tasks[0].id;
      useTaskStore.getState().startTask(taskId);
      useTaskStore.getState().onTimeUp();

      render(<ArrivalDisplay />);

      const clock = screen.getByTestId('arrival-state-icon');
      expect(
        clock.querySelector('[data-testid="clock-second-hand"]'),
      ).toBeInTheDocument();
      expect(screen.getByText(/slipping/i)).toBeInTheDocument();
    });

    it('keeps the clock centered with the state icon pinned to its left', () => {
      useTaskStore.getState().addTask('T1', 30); // idle → pin

      render(<ArrivalDisplay />);

      const icon = screen.getByTestId('arrival-state-icon');
      // the icon is taken out of flow and pinned to the left of the clock, so the
      // (centered) time never shifts off-center.
      const positioned = icon.closest('.absolute');
      expect(positioned).toHaveClass('right-full');
    });

    it('reveals the estimate description when the clock is tapped (TK-029)', () => {
      useTaskStore.getState().addTask('T1', 30); // idle

      render(<ArrivalDisplay />);

      const bubble = screen.getByText('Estimated arrival time');
      expect(bubble).toHaveClass('opacity-0'); // hidden until asked

      fireEvent.click(screen.getByRole('button'));
      expect(bubble).toHaveClass('opacity-100');
    });

    it('anchors the tooltip on the whole clock group, described by the state (TK-029)', () => {
      useTaskStore.getState().addTask('T1', 30); // idle → 10:00 + 30 = 10:30

      render(<ArrivalDisplay />);

      const group = screen.getByRole('button');
      // the group's accessible value is the arrival time itself...
      expect(group).toHaveTextContent('10:30');
      // ...and its meaning rides along as an accessible description (not the name),
      // so the time is never overridden.
      const describedBy = group.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(screen.getByText('Estimated arrival time').id).toBe(describedBy);
    });
  });
});
