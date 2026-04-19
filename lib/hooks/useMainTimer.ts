import { useState, useEffect, useRef } from 'react';

const KEYS = {
  startTimestamp: 'timer_start_timestamp',
  baseSeconds: 'timer_base_seconds',
  activeItemId: 'timer_active_item_id',
};

function readTimerFromStorage(): { totalSeconds: number; isRunning: boolean } {
  const startTimestamp = parseInt(localStorage.getItem(KEYS.startTimestamp) || '0');
  const baseSeconds = parseInt(localStorage.getItem(KEYS.baseSeconds) || '0');
  if (startTimestamp) {
    const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
    return { totalSeconds: baseSeconds + elapsed, isRunning: true };
  }
  return { totalSeconds: 0, isRunning: false };
}

export function useMainTimer() {
  const initial = readTimerFromStorage();
  const [totalSeconds, setTotalSeconds] = useState(initial.totalSeconds);
  const [isRunning, setIsRunning] = useState(initial.isRunning);
  const timerRef = useRef<number>(initial.totalSeconds);

  useEffect(() => {
    if (!isRunning) return;

    let wakeLock: WakeLockSentinel | null = null;
    (async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (_) {}
    })();

    const tick = () => {
      const start = parseInt(localStorage.getItem(KEYS.startTimestamp) || '0');
      const base = parseInt(localStorage.getItem(KEYS.baseSeconds) || '0');
      if (!start) return;
      const newTotal = base + Math.floor((Date.now() - start) / 1000);
      setTotalSeconds(newTotal);
      timerRef.current = newTotal;
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => {
      clearInterval(interval);
      wakeLock?.release();
    };
  }, [isRunning]);

  const start = (itemId: string) => {
    const base = timerRef.current;
    localStorage.setItem(KEYS.startTimestamp, Date.now().toString());
    localStorage.setItem(KEYS.baseSeconds, base.toString());
    localStorage.setItem(KEYS.activeItemId, itemId);
    setIsRunning(true);
  };

  const pause = () => {
    localStorage.removeItem(KEYS.startTimestamp);
    localStorage.removeItem(KEYS.baseSeconds);
    localStorage.removeItem(KEYS.activeItemId);
    setIsRunning(false);
  };

  const reset = (toSeconds = 0) => {
    setTotalSeconds(toSeconds);
    timerRef.current = toSeconds;
    if (isRunning) {
      localStorage.setItem(KEYS.startTimestamp, Date.now().toString());
      localStorage.setItem(KEYS.baseSeconds, toSeconds.toString());
    }
  };

  const clearPersistence = () => {
    localStorage.removeItem(KEYS.startTimestamp);
    localStorage.removeItem(KEYS.baseSeconds);
    localStorage.removeItem(KEYS.activeItemId);
  };

  return { totalSeconds, isRunning, timerRef, setIsRunning, start, pause, reset, clearPersistence };
}
