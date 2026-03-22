import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseSwipeToRevealProps {
  id: string;
  isEnabled: boolean;
  activeSwipeId: string | null;
  onSwipeDismissAll: (id?: string) => void;
  revealWidth?: number;
}

export const useSwipeToReveal = ({
  id,
  isEnabled,
  activeSwipeId,
  onSwipeDismissAll,
  revealWidth = 80,
}: UseSwipeToRevealProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const isSwipeActiveRef = useRef(false);

  // Auto-dismiss when activeSwipeId changes to another task
  useEffect(() => {
    if (activeSwipeId !== null && activeSwipeId !== id && isRevealed) {
      setIsRevealed(false);
    }
  }, [activeSwipeId, id, isRevealed]);

  const dismiss = useCallback(() => {
    setIsRevealed(false);
  }, []);

  const handleDragStart = useCallback(() => {
    // Initial guess, will be refined in handleDrag
  }, []);

  const handleDrag = useCallback(
    (_: any, info: any) => {
      // Determine if it's a right-to-left swipe
      const isRightToLeft = info.offset.x < -10;
      if (isRightToLeft) {
        isSwipeActiveRef.current = true;
        // Notify others to dismiss, passing our id as the new active swipe
        onSwipeDismissAll(id);
      }
    },
    [id, onSwipeDismissAll]
  );

  const handleDragEnd = useCallback(
    (_: any, info: any) => {
      isSwipeActiveRef.current = false;
      const threshold = revealWidth / 2;
      // If velocity is high or offset exceeds threshold
      const shouldReveal = info.offset.x < -threshold || info.velocity.x < -500;
      if (shouldReveal) {
        setIsRevealed(true);
      } else {
        setIsRevealed(false);
      }
    },
    [revealWidth]
  );

  return {
    isRevealed,
    isSwipeActive: isSwipeActiveRef.current,
    dismiss,
    dragProps: {
      drag: isEnabled ? ("x" as const) : false,
      dragConstraints: { left: -revealWidth, right: 0 },
      onDragStart: handleDragStart,
      onDrag: handleDrag,
      onDragEnd: handleDragEnd,
      animate: { x: isRevealed ? -revealWidth : 0 },
    },
  };
};
