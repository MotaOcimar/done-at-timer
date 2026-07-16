import { useState, useEffect, useCallback, useRef } from 'react';
import { useClock } from './useClock';

export const useTimer = (
  initialSeconds: number,
  onComplete?: () => void,
  targetEndTime?: number | null,
) => {
  // Single tick source for the whole app: every timer rides useClock's
  // shared interval instead of owning one (TK-019).
  const now = useClock();
  const [storedTimeLeft, setStoredTimeLeft] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(true);
  // Latch so each run notifies completion exactly once. A ref, not state:
  // it must be readable synchronously by clock ticks (no stale closures)
  // and flipping it must not re-run effects.
  const hasNotifiedCompleteRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  // Last clock tick consumed by the legacy countdown, so re-renders that
  // aren't ticks (pause/resume) never eat a second.
  const lastTickRef = useRef(now);

  // Se tivermos um targetEndTime, o timeLeft é derivado dele contra o clock
  // compartilhado. Allow it to go negative for overtime.
  const anchoredTimeLeft = targetEndTime
    ? Math.ceil((targetEndTime - now.getTime()) / 1000)
    : null;

  // Keep the stored value in sync while anchored (React's "adjusting state
  // during render" pattern), so the last anchored value survives the target
  // being cleared — e.g. on pause, consumers drop targetEndTime and expect
  // timeLeft to hold still.
  if (anchoredTimeLeft !== null && storedTimeLeft !== anchoredTimeLeft) {
    setStoredTimeLeft(anchoredTimeLeft);
  }

  const timeLeft = anchoredTimeLeft ?? storedTimeLeft;

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // A new target means a new run (start, restart, resume) — re-arm the
  // completion notification so this run can announce its own overtime.
  // Keyed to target changes only: a tick must never re-arm the latch (TK-030).
  useEffect(() => {
    if (targetEndTime) {
      hasNotifiedCompleteRef.current = false;
    }
  }, [targetEndTime]);

  useEffect(() => {
    if (!targetEndTime) return;

    const remaining = Math.ceil((targetEndTime - now.getTime()) / 1000);
    if (remaining <= 0 && !hasNotifiedCompleteRef.current) {
      hasNotifiedCompleteRef.current = true;
      onCompleteRef.current?.();
    }
  }, [targetEndTime, now]);

  // Legacy logic for when there is no targetEndTime (fallback or manual mode)
  useEffect(() => {
    if (targetEndTime) return;

    // Consume whole seconds since the last consumed tick — React may batch
    // several clock ticks into one render, so "one render = one second"
    // would undercount.
    const elapsedSeconds = Math.round(
      (now.getTime() - lastTickRef.current.getTime()) / 1000,
    );
    if (elapsedSeconds <= 0) return;
    lastTickRef.current = now;
    if (isPaused) return;

    setStoredTimeLeft((prev) => prev - elapsedSeconds);
  }, [now, isPaused, targetEndTime]);

  useEffect(() => {
    if (targetEndTime || isPaused) return;

    if (timeLeft <= 0 && !hasNotifiedCompleteRef.current) {
      hasNotifiedCompleteRef.current = true;
      Promise.resolve().then(() => {
        onCompleteRef.current?.();
      });
      // Continue the timer even after time is up
    }
  }, [isPaused, timeLeft, targetEndTime]);

  const start = useCallback(() => {
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const reset = useCallback((seconds: number) => {
    setIsPaused(true);
    setStoredTimeLeft(seconds);
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
