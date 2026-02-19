import { useState, useEffect, useCallback, useRef } from 'react';

export const useTimer = (initialSeconds: number, onComplete?: () => void) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(true);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (isPaused) return;

    if (timeLeft <= 0) {
      setIsPaused(true);
      onCompleteRef.current?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft]);

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
