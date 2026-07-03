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
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const hasTriggeredHapticRef = useRef(false);
  const skipNextAnimateRef = useRef(false);
  
  const x = useMotionValue(0);
  const redOpacity = useTransform(x, [0, -revealWidth], [0, 1]);

  // Auto-dismiss when another task becomes the active swipe. Render-time
  // adjustment guarded by the previous value (the React-documented pattern
  // for deriving state from a prop change) instead of an effect.
  const [prevActiveSwipeId, setPrevActiveSwipeId] = useState(activeSwipeId);
  if (prevActiveSwipeId !== activeSwipeId) {
    setPrevActiveSwipeId(activeSwipeId);
    if (activeSwipeId !== null && activeSwipeId !== id && isRevealed) {
      setIsRevealed(false);
    }
  }
  
  // Update x when isRevealed changes (for programmatic animation)
  useEffect(() => {
    if (skipNextAnimateRef.current) {
      skipNextAnimateRef.current = false;
      return;
    }
    const target = isRevealed ? -revealWidth : 0;
    animate(x, target, { type: "tween", duration: 0.2, ease: "easeOut" });
  }, [isRevealed, revealWidth, x]);

  const dismiss = useCallback(() => {
    setIsRevealed(false);
  }, []);

  const handleDragStart = useCallback((_event: unknown, _info: unknown) => {
    // Initial guess, will be refined in handleDrag
    hasTriggeredHapticRef.current = false;
  }, []);

  const handleDrag = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity?: { x: number } }) => {
      // Determine if it's a right-to-left swipe
      const isRightToLeft = info.offset.x < -10;
      if (isRightToLeft) {
        setIsSwipeActive(true);
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
      setIsSwipeActive(false);
      hasTriggeredHapticRef.current = false;
      const threshold = revealWidth / 2;
      // If velocity is high or offset exceeds threshold
      const shouldReveal = info.offset.x < -threshold || info.velocity.x < -500;
      
      if (shouldReveal) {
        if (!isRevealed) {
          skipNextAnimateRef.current = true;
          setIsRevealed(true);
        }
        animate(x, -revealWidth, { type: "tween", duration: 0.2, ease: "easeOut" });
      } else {
        if (isRevealed) {
          skipNextAnimateRef.current = true;
          setIsRevealed(false);
        }
        animate(x, 0, { type: "tween", duration: 0.2, ease: "easeOut" });
      }
    },
    [isRevealed, revealWidth, x]
  );

  return {
    isRevealed,
    isSwipeActive,
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
