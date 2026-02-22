import { useState, useEffect, useCallback, useRef } from 'react';

export const useTimer = (
  initialSeconds: number,
  onComplete?: () => void,
  targetEndTime?: number | null
) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(true);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Se tivermos um targetEndTime, calculamos o timeLeft baseado nele
  useEffect(() => {
    if (targetEndTime) {
      const calculateTimeLeft = () => {
        const remaining = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          setIsPaused(true);
          onCompleteRef.current?.();
        }
      };

      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(interval);
    }
  }, [targetEndTime]);

  // Lógica legada para quando não há targetEndTime (fallback ou modo manual)
  useEffect(() => {
    if (targetEndTime || isPaused) return;

    if (timeLeft <= 0) {
      // Avoid calling setState synchronously during effect
      Promise.resolve().then(() => {
        setIsPaused(true);
        onCompleteRef.current?.();
      });
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft, targetEndTime]);

  const start = useCallback(() => {
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const reset = useCallback((seconds: number) => {
    setIsPaused(true);
    setTimeLeft(seconds);
  }, []);

  return {
    timeLeft,
    isPaused,
    start,
    pause,
    reset,
  };
};
