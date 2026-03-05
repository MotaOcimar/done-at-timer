import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useClock } from './useClock';

describe('useClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-04T12:00:00Z'));
  });

  it('initializes with the current system time', () => {
    const { result } = renderHook(() => useClock());
    expect(result.current).toEqual(new Date('2026-03-04T12:00:00Z'));
  });

  it('updates every second', () => {
    const { result } = renderHook(() => useClock());
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(result.current).toEqual(new Date('2026-03-04T12:00:01Z'));
    
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    expect(result.current).toEqual(new Date('2026-03-04T12:00:06Z'));
  });

  it('cleans up the interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const { unmount } = renderHook(() => useClock());
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
