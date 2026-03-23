import { useState, useCallback, useEffect, useRef } from 'react';
import { useMotionValue, useTransform, animate } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';

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
  const hasTriggeredHapticRef = useRef(false);
  
  const x = useMotionValue(0);
  const redOpacity = useTransform(x, [0, -revealWidth], [0, 1]);

  // Auto-dismiss when activeSwipeId changes to another task
  useEffect(() => {
    if (activeSwipeId !== null && activeSwipeId !== id && isRevealed) {
      setIsRevealed(false);
    }
  }, [activeSwipeId, id, isRevealed]);
  
  // Update x when isRevealed changes (for programmatic animation)
  useEffect(() => {
    const target = isRevealed ? -revealWidth : 0;
    animate(x, target, { type: "tween", duration: 0.2, ease: "easeOut" });
  }, [isRevealed, revealWidth, x]);

  const dismiss = useCallback(() => {
    setIsRevealed(false);
  }, []);

  const handleDragStart = useCallback(() => {
    // Initial guess, will be refined in handleDrag
    hasTriggeredHapticRef.current = false;
  }, []);

  const handleDrag = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity?: { x: number } }) => {
      // Determine if it's a right-to-left swipe
      const isRightToLeft = info.offset.x < -10;
      if (isRightToLeft) {
        isSwipeActiveRef.current = true;
        // Notify others to dismiss, passing our id as the new active swipe
        onSwipeDismissAll(id);
      }

      // Trigger haptic when crossing threshold
      const threshold = revealWidth / 2;
      if (info.offset.x < -threshold && !hasTriggeredHapticRef.current) {
        triggerHaptic(10);
        hasTriggeredHapticRef.current = true;
      }
    },
    [id, onSwipeDismissAll, revealWidth]
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      isSwipeActiveRef.current = false;
      hasTriggeredHapticRef.current = false;
      const threshold = revealWidth / 2;
      // If velocity is high or offset exceeds threshold
      const shouldReveal = info.offset.x < -threshold || info.velocity.x < -500;
      
      if (shouldReveal) {
        setIsRevealed(true);
        animate(x, -revealWidth, { type: "tween", duration: 0.2, ease: "easeOut" });
      } else {
        setIsRevealed(false);
        animate(x, 0, { type: "tween", duration: 0.2, ease: "easeOut" });
      }
    },
    [revealWidth, x]
  );

  return {
    isRevealed,
    // isSwipeActive: isSwipeActiveRef.current returns a render-time snapshot.
    // This works because handleDrag calls onSwipeDismissAll(id) -> TaskList sets state -> 
    // re-render propagates fresh .current before dnd-kit's sensors activate.
    isSwipeActive: isSwipeActiveRef.current,
    dismiss,
    x,
    redOpacity,
    dragProps: {
      drag: isEnabled ? ("x" as const) : false,
      dragConstraints: { left: -revealWidth, right: 0 },
      dragElastic: { left: 0.3, right: 0 },
      onDragStart: handleDragStart,
      onDrag: handleDrag,
      onDragEnd: handleDragEnd,
      style: { x },
    },
  };
};
