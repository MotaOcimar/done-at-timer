// @vitest-environment happy-dom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTimer } from './useTimer';

describe('useTimer Reliability', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  it('calculates timeLeft based on targetEndTime if provided', () => {
    const now = Date.now();
    const target = now + 10000; // 10 seconds from now

    const { result } = renderHook(() => useTimer(30, undefined, target));

    expect(result.current.timeLeft).toBe(10);
  });

  it('updates timeLeft correctly as system time advances', () => {
    const now = Date.now();
    const target = now + 10000;

    const { result } = renderHook(() => useTimer(30, undefined, target));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // In a real interval-based hook, this might need a trigger to re-render
    // But our goal is to have it calculate based on Date.now()
    expect(result.current.timeLeft).toBe(8);
  });

  it('stops at zero if targetEndTime is in the past', () => {
    const now = Date.now();
    const target = now - 5000; // 5 seconds ago

    const { result } = renderHook(() => useTimer(30, undefined, target));

    // Updated behavior: Timer continues into negative (overtime)
    expect(result.current.timeLeft).toBe(-5);
  });

  it('notifies completion exactly once per run', () => {
    const onComplete = vi.fn();
    const target = Date.now() + 5000;

    renderHook(() => useTimer(300, onComplete, target));

    act(() => {
      vi.advanceTimersByTime(10000); // crosses zero and keeps going
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('notifies completion again when the timer is given a new future target (TK-030)', () => {
    const onComplete = vi.fn();

    // First run of the task: overruns and notifies
    const { result, rerender } = renderHook(
      ({ target }) => useTimer(300, onComplete, target),
      { initialProps: { target: Date.now() + 5000 } },
    );

    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);

    // Same task (same mounted timer) restarts with fresh time,
    // e.g. after resetting the routine
    rerender({ target: Date.now() + 5000 });
    expect(result.current.timeLeft).toBe(5);

    // It overruns again -> must notify again so the overtime state re-engages
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(onComplete).toHaveBeenCalledTimes(2);
  });
});
