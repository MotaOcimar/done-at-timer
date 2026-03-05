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

  it('works correctly with multiple consumers sharing the same interval', () => {
    const { result: result1 } = renderHook(() => useClock());
    const { result: result2 } = renderHook(() => useClock());

    expect(result1.current).toEqual(new Date('2026-03-04T12:00:00Z'));
    expect(result2.current).toEqual(new Date('2026-03-04T12:00:00Z'));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result1.current).toEqual(new Date('2026-03-04T12:00:01Z'));
    expect(result2.current).toEqual(new Date('2026-03-04T12:00:01Z'));
  });

  it('continues ticking after a consumer unmounts if other consumers exist', () => {
    const { result: result1 } = renderHook(() => useClock());
    const { unmount: unmount2 } = renderHook(() => useClock());

    unmount2();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result1.current).toEqual(new Date('2026-03-04T12:00:01Z'));
  });

  it('restores interval after all consumers unmount and a new one mounts', () => {
    const { unmount } = renderHook(() => useClock());
    unmount();

    // Now mount again
    const { result } = renderHook(() => useClock());
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toEqual(new Date('2026-03-04T12:00:01Z'));
  });
});
