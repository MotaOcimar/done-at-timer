// @vitest-environment happy-dom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTimer } from './useTimer';
import { useClock } from './useClock';

describe('unified tick source (TK-019)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-16T12:00:00Z'));
  });

  it('creates exactly one interval for several timers plus a clock consumer', () => {
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');

    const target = Date.now() + 10000;
    renderHook(() => useClock());
    renderHook(() => useTimer(30, undefined, target));
    renderHook(() => useTimer(60, undefined, target + 5000));
    const { result: legacy } = renderHook(() => useTimer(60));

    act(() => {
      legacy.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    setIntervalSpy.mockRestore();
  });

  it('drives anchored and legacy timers from the same tick', () => {
    const target = Date.now() + 10000;
    const { result: clock } = renderHook(() => useClock());
    const { result: anchored } = renderHook(() =>
      useTimer(30, undefined, target),
    );
    const { result: legacy } = renderHook(() => useTimer(60));

    act(() => {
      legacy.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(clock.current).toEqual(new Date('2026-07-16T12:00:03Z'));
    expect(anchored.current.timeLeft).toBe(7);
    expect(legacy.current.timeLeft).toBe(57);
  });

  it('does not lose a second on pause/resume re-renders (legacy mode)', () => {
    const { result } = renderHook(() => useTimer(60));

    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.timeLeft).toBe(59);

    // Pause and resume without any tick in between — no second may be eaten.
    act(() => {
      result.current.pause();
    });
    act(() => {
      result.current.start();
    });
    expect(result.current.timeLeft).toBe(59);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.timeLeft).toBe(58);
  });
});
