// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from './TaskCard';
import type { Task } from '../types';

const noop = () => ({
  onToggle: vi.fn(),
  onTitleSave: vi.fn(),
  onDurationSave: vi.fn(),
  onComplete: vi.fn(),
});

describe('TaskCard route pair (TK-034)', () => {
  const baseTask: Task = {
    id: '1',
    title: 'Test Task',
    expectedDuration: 10,
    status: 'PENDING',
  };

  it('to-do card shows its predicted start: ETA minus its own estimate', () => {
    const now = new Date('2026-01-01T13:00:00Z');
    const eta = new Date('2026-01-01T13:30:00Z');

    render(
      <TaskCard
        task={baseTask}
        isActive={false}
        isCompleted={false}
        cardState="idle"
        eta={eta}
        now={now}
        {...noop()}
      />,
    );

    expect(screen.getByTestId('route-start')).toHaveTextContent('13:20');
    expect(screen.getByTestId('route-end')).toHaveTextContent('13:30');
  });

  it('to-do card whose predicted start is not in the future reads "now"', () => {
    const now = new Date('2026-01-01T13:20:00Z');
    const eta = new Date('2026-01-01T13:30:00Z'); // starts exactly now

    render(
      <TaskCard
        task={baseTask}
        isActive={false}
        isCompleted={false}
        cardState="idle"
        eta={eta}
        now={now}
        {...noop()}
      />,
    );

    expect(screen.getByTestId('route-start')).toHaveTextContent(/^now$/);
  });

  it('done card shows the actual start next to the actual finish', () => {
    const startedAt = new Date('2026-01-01T08:20:00Z').getTime();
    const completedAt = new Date('2026-01-01T08:32:00Z');
    const doneTask: Task = { ...baseTask, status: 'COMPLETED', startedAt };

    const { container } = render(
      <TaskCard
        task={doneTask}
        isActive={false}
        isCompleted={true}
        cardState="completed"
        eta={completedAt}
        now={new Date('2026-01-01T09:00:00Z')}
        {...noop()}
      />,
    );

    expect(screen.getByTestId('route-start')).toHaveTextContent('08:20');
    expect(screen.getByTestId('route-end')).toHaveTextContent('08:32');
    expect(
      container.querySelector('.lucide-map-pin-check-inside'),
    ).not.toBeNull();
  });

  it('done card without a recorded start omits the origin (legacy data)', () => {
    const doneTask: Task = { ...baseTask, status: 'COMPLETED' };

    render(
      <TaskCard
        task={doneTask}
        isActive={false}
        isCompleted={true}
        cardState="completed"
        eta={new Date('2026-01-01T08:32:00Z')}
        now={new Date('2026-01-01T09:00:00Z')}
        {...noop()}
      />,
    );

    expect(screen.queryByTestId('route-start')).toBeNull();
    expect(screen.getByTestId('route-end')).toHaveTextContent('08:32');
  });

  it('running card pairs its actual start with the ETA in the footer', () => {
    const startedAt = new Date('2026-01-01T08:25:00Z').getTime();
    const runningTask: Task = {
      ...baseTask,
      status: 'IN_PROGRESS',
      startedAt,
    };

    render(
      <TaskCard
        task={runningTask}
        isActive={true}
        isCompleted={false}
        cardState="running"
        timeLeft={300}
        progress={0.5}
        eta={new Date('2026-01-01T08:35:00Z')}
        now={new Date('2026-01-01T08:30:00Z')}
        {...noop()}
      />,
    );

    expect(screen.getByTestId('route-start')).toHaveTextContent('08:25');
    expect(screen.getByTestId('route-end')).toHaveTextContent('08:35');
  });
});
