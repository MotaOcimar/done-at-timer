import { useState, useEffect, useCallback, useRef } from 'react';

export const useTimer = (
  initialSeconds: number,
  onComplete?: () => void,
  targetEndTime?: number | null
) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(true);
  const [hasNotifiedComplete, setHasNotifiedComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Se tivermos um targetEndTime, calculamos o timeLeft baseado nele
  useEffect(() => {
    if (targetEndTime) {
      const calculateTimeLeft = () => {
        // Allow it to go negative for overtime
        const remaining = Math.ceil((targetEndTime - Date.now()) / 1000);
        setTimeLeft(remaining);
        
        if (remaining <= 0 && !hasNotifiedComplete) {
          setHasNotifiedComplete(true);
          onCompleteRef.current?.();
        }
      };

      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(interval);
    }
  }, [targetEndTime, hasNotifiedComplete]);

  // Lógica legada para quando não há targetEndTime (fallback ou modo manual)
  useEffect(() => {
    if (targetEndTime || isPaused) return;

    if (timeLeft <= 0 && !hasNotifiedComplete) {
      setHasNotifiedComplete(true);
      onCompleteRef.current?.();
      // Continue the timer even after time is up
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft, targetEndTime, hasNotifiedComplete]);

  const start = useCallback(() => {
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const reset = useCallback((seconds: number) => {
    setIsPaused(true);
    setTimeLeft(seconds);
    setHasNotifiedComplete(false);
  }, []);

  return {
    timeLeft,
    isPaused,
    start,
    pause,
    reset,
  };
};
