import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTimer } from './useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('initializes with the correct duration', () => {
    const { result } = renderHook(() => useTimer(60)); // 60 seconds
    expect(result.current.timeLeft).toBe(60);
    expect(result.current.isPaused).toBe(true);
  });

  it('counts down when started', () => {
    const { result } = renderHook(() => useTimer(60));

    act(() => {
      result.current.start();
    });

    expect(result.current.isPaused).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBe(59);
  });

  it('pauses the countdown', () => {
    const { result } = renderHook(() => useTimer(60));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.isPaused).toBe(true);
    expect(result.current.timeLeft).toBe(59);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBe(59);
  });

  it('resets the countdown', () => {
    const { result } = renderHook(() => useTimer(60));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.timeLeft).toBe(55);

    act(() => {
      result.current.reset(60);
    });

    expect(result.current.timeLeft).toBe(60);
    expect(result.current.isPaused).toBe(true);
  });

  it('calls onComplete when time reaches zero', async () => {
    vi.useRealTimers();
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTimer(0.1, onComplete));

    act(() => {
      result.current.start();
    });

    await waitFor(() => expect(onComplete).toHaveBeenCalled(), { timeout: 2000 });
    vi.useFakeTimers();
  });
});
