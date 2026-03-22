// @vitest-environment happy-dom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSwipeToReveal } from './useSwipeToReveal';
import { triggerHaptic } from '../utils/haptics';

vi.mock('../utils/haptics', () => ({
  triggerHaptic: vi.fn(),
}));

describe('useSwipeToReveal (Spike POC)', () => {
  const defaultProps = {
    id: 'task-1',
    isEnabled: true,
    activeSwipeId: null,
    onSwipeDismissAll: vi.fn(),
    revealWidth: 80,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes as not revealed', () => {
    const { result } = renderHook(() => useSwipeToReveal(defaultProps));
    expect(result.current.isRevealed).toBe(false);
  });

  it('reveals when dragged past threshold', () => {
    const { result } = renderHook(() => useSwipeToReveal(defaultProps));
    
    act(() => {
      result.current.dragProps.onDragEnd(null as any, { offset: { x: -50 }, velocity: { x: 0 } } as any);
    });

    expect(result.current.isRevealed).toBe(true);
  });

  it('does not reveal when dragged less than threshold', () => {
    const { result } = renderHook(() => useSwipeToReveal(defaultProps));
    
    act(() => {
      result.current.dragProps.onDragEnd(null as any, { offset: { x: -30 }, velocity: { x: 0 } } as any);
    });

    expect(result.current.isRevealed).toBe(false);
  });

  it('calls onSwipeDismissAll when right-to-left swipe starts', () => {
    const onSwipeDismissAll = vi.fn();
    const { result } = renderHook(() => useSwipeToReveal({ ...defaultProps, onSwipeDismissAll }));
    
    act(() => {
      result.current.dragProps.onDrag(null as any, { offset: { x: -15 } } as any);
    });

    expect(onSwipeDismissAll).toHaveBeenCalled();
  });

  it('auto-dismisses when activeSwipeId changes to another task', () => {
    const { result, rerender } = renderHook(
      (props) => useSwipeToReveal(props),
      { initialProps: defaultProps }
    );

    // Reveal it first
    act(() => {
      result.current.dragProps.onDragEnd(null as any, { offset: { x: -50 }, velocity: { x: 0 } } as any);
    });
    expect(result.current.isRevealed).toBe(true);

    // Change activeSwipeId to another task
    rerender({ ...defaultProps, activeSwipeId: 'task-2' });

    expect(result.current.isRevealed).toBe(false);
  });

  it('does not auto-dismiss when activeSwipeId changes to its own id', () => {
    const { result, rerender } = renderHook(
      (props) => useSwipeToReveal(props),
      { initialProps: defaultProps }
    );

    act(() => {
      result.current.dragProps.onDragEnd(null as any, { offset: { x: -50 }, velocity: { x: 0 } } as any);
    });
    expect(result.current.isRevealed).toBe(true);

    rerender({ ...defaultProps, activeSwipeId: 'task-1' });

    expect(result.current.isRevealed).toBe(true);
  });

  it('returns x and redOpacity MotionValues', () => {
    const { result } = renderHook(() => useSwipeToReveal(defaultProps));
    
    expect(result.current.x).toBeDefined();
    expect(result.current.redOpacity).toBeDefined();
  });

  it('triggers haptic feedback when crossing reveal threshold', () => {
    const { result } = renderHook(() => useSwipeToReveal(defaultProps));
    
    // Drag past threshold (40)
    act(() => {
      result.current.dragProps.onDrag(null as any, { offset: { x: -45 } } as any);
    });

    expect(triggerHaptic).toHaveBeenCalledOnce();
  });

  it('only triggers haptic feedback once per gesture', () => {
    const { result } = renderHook(() => useSwipeToReveal(defaultProps));
    
    // Drag past threshold multiple times in one gesture
    act(() => {
      result.current.dragProps.onDrag(null as any, { offset: { x: -45 } } as any);
      result.current.dragProps.onDrag(null as any, { offset: { x: -50 } } as any);
      result.current.dragProps.onDrag(null as any, { offset: { x: -55 } } as any);
    });

    expect(triggerHaptic).toHaveBeenCalledOnce();
  });

  it('resets haptic trigger for a new gesture', () => {
    const { result } = renderHook(() => useSwipeToReveal(defaultProps));
    
    // First gesture
    act(() => {
      result.current.dragProps.onDrag(null as any, { offset: { x: -45 } } as any);
      result.current.dragProps.onDragEnd(null as any, { offset: { x: -45 }, velocity: { x: 0 } } as any);
    });
    
    expect(triggerHaptic).toHaveBeenCalledTimes(1);

    // Second gesture
    act(() => {
      result.current.dragProps.onDrag(null as any, { offset: { x: -50 } } as any);
    });

    expect(triggerHaptic).toHaveBeenCalledTimes(2);
  });
});
