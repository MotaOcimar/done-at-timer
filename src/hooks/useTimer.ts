import { useState, useEffect, useCallback, useRef } from 'react';

export const useTimer = (
  initialSeconds: number,
  onComplete?: () => void,
  targetEndTime?: number | null,
) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(true);
  // Latch so each run notifies completion exactly once. A ref, not state:
  // it must be readable synchronously by interval ticks (no stale closures)
  // and flipping it must not re-run effects.
  const hasNotifiedCompleteRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Se tivermos um targetEndTime, calculamos o timeLeft baseado nele
  useEffect(() => {
    if (targetEndTime) {
      // A new target means a new run (start, restart, resume) — re-arm the
      // completion notification so this run can announce its own overtime (TK-030).
      hasNotifiedCompleteRef.current = false;

      const calculateTimeLeft = () => {
        // Allow it to go negative for overtime
        const remaining = Math.ceil((targetEndTime - Date.now()) / 1000);
        setTimeLeft(remaining);

        if (remaining <= 0 && !hasNotifiedCompleteRef.current) {
          hasNotifiedCompleteRef.current = true;
          onCompleteRef.current?.();
        }
      };

      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(interval);
    }
  }, [targetEndTime]);

  // Legacy logic for when there is no targetEndTime (fallback or manual mode)
  useEffect(() => {
    if (targetEndTime || isPaused) return;

    if (timeLeft <= 0 && !hasNotifiedCompleteRef.current) {
      hasNotifiedCompleteRef.current = true;
      Promise.resolve().then(() => {
        onCompleteRef.current?.();
      });
      // Continue the timer even after time is up
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
    hasNotifiedCompleteRef.current = false;
  }, []);

  return {
    timeLeft,
    isPaused,
    start,
    pause,
    reset,
  };
};
