import { useState, useCallback, useRef, useEffect } from 'react';
import { formatDuration } from '../utils/formatPhone';

/**
 * Custom hook to manage call duration timing.
 */
export const useCallTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    if (isActive) return;
    setIsActive(true);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  }, [isActive]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setSeconds(0);
  }, [stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatted = formatDuration(seconds);

  return { 
    seconds, 
    formatted, 
    start, 
    stop, 
    reset,
    isActive 
  };
};
