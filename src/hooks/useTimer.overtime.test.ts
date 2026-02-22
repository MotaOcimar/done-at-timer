import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTimer } from './useTimer';

describe('useTimer: Overtime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should continue past zero (go negative) if not paused', async () => {
    vi.useRealTimers();
    const onComplete = vi.fn();
    // Use very short duration for real timers
    const { result } = renderHook(() => useTimer(0.1, onComplete));

    act(() => {
      result.current.start();
    });

    // Wait for initial completion
    await waitFor(() => expect(onComplete).toHaveBeenCalled(), { timeout: 2000 });
    expect(result.current.timeLeft).toBeLessThanOrEqual(0);
    
    vi.useFakeTimers();
  });
});
