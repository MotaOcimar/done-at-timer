import { useState, useEffect } from 'react';

const listeners = new Set<(time: Date) => void>();
let interval: ReturnType<typeof setInterval> | null = null;

const updateTime = () => {
  const now = new Date();
  listeners.forEach(listener => listener(now));
};

/**
 * A hook that provides the current time, updated every second.
 * Uses a single interval shared across all components to ensure synchronization.
 */
export const useClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    listeners.add(setNow);
    
    if (!interval) {
      interval = setInterval(updateTime, 1000);
    }
    
    return () => {
      listeners.delete(setNow);
      if (listeners.size === 0 && interval) {
        clearInterval(interval);
        interval = null;
      }
    };
  }, []);

  return now;
};
