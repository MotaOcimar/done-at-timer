import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTimer } from './useTimer';

describe('useTimer: Overtime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should continue past zero (go negative) if not paused', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTimer(5, onComplete));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.timeLeft).toBe(0);
    expect(onComplete).toHaveBeenCalled();
    
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    expect(result.current.timeLeft).toBe(-2);
  });
});
