import { useState, useEffect, useRef } from 'react';

const KEYS = {
  mode: 'counsel_mode',
  startTimestamp: 'counsel_start_timestamp',
  baseSeconds: 'counsel_base_seconds',
  itemTitle: 'counsel_item_title',
  itemId: 'counsel_item_id',
};

function readCounselFromStorage() {
  const isActive = localStorage.getItem(KEYS.mode) === 'true';
  const start = parseInt(localStorage.getItem(KEYS.startTimestamp) || '0');
  const base = parseInt(localStorage.getItem(KEYS.baseSeconds) || '0');
  const seconds = start ? base + Math.floor((Date.now() - start) / 1000) : 0;
  return {
    isCounselMode: isActive,
    counselSeconds: seconds,
    counselItemTitle: localStorage.getItem(KEYS.itemTitle) || '',
    counselItemId: localStorage.getItem(KEYS.itemId) || null,
  };
}

export function useCounselTimer(isRunning: boolean) {
  const initial = readCounselFromStorage();
  const [isCounselMode, setIsCounselMode] = useState(initial.isCounselMode);
  const [counselSeconds, setCounselSeconds] = useState(initial.counselSeconds);
  const [counselItemTitle, setCounselItemTitle] = useState(initial.counselItemTitle);
  const [counselItemId, setCounselItemId] = useState<string | null>(initial.counselItemId);
  const counselTimerRef = useRef<number>(initial.counselSeconds);

  useEffect(() => {
    localStorage.setItem(KEYS.mode, isCounselMode.toString());
    if (isCounselMode) {
      if (counselItemTitle) localStorage.setItem(KEYS.itemTitle, counselItemTitle);
      if (counselItemId) localStorage.setItem(KEYS.itemId, counselItemId);
    } else {
      localStorage.removeItem(KEYS.startTimestamp);
      localStorage.removeItem(KEYS.baseSeconds);
      localStorage.removeItem(KEYS.itemTitle);
      localStorage.removeItem(KEYS.itemId);
    }
  }, [isCounselMode, counselItemTitle, counselItemId]);

  useEffect(() => {
    if (!isCounselMode || !isRunning) return;

    let start = parseInt(localStorage.getItem(KEYS.startTimestamp) || '0');
    if (!start) {
      start = Date.now();
      localStorage.setItem(KEYS.startTimestamp, start.toString());
      localStorage.setItem(KEYS.baseSeconds, counselSeconds.toString());
    }

    const interval = setInterval(() => {
      const s = parseInt(localStorage.getItem(KEYS.startTimestamp) || '0');
      const b = parseInt(localStorage.getItem(KEYS.baseSeconds) || '0');
      if (!s) return;
      const newTotal = b + Math.floor((Date.now() - s) / 1000);
      setCounselSeconds(newTotal);
      counselTimerRef.current = newTotal;
    }, 1000);

    return () => clearInterval(interval);
  }, [isCounselMode, isRunning]);

  const enterCounsel = (itemTitle: string, itemId: string) => {
    setCounselItemTitle(itemTitle);
    setCounselItemId(itemId);
    setCounselSeconds(0);
    counselTimerRef.current = 0;
    setIsCounselMode(true);
  };

  const exitCounsel = () => {
    setIsCounselMode(false);
    setCounselSeconds(0);
    counselTimerRef.current = 0;
    setCounselItemTitle('');
    setCounselItemId(null);
  };

  return {
    isCounselMode,
    counselSeconds,
    counselTimerRef,
    counselItemTitle,
    counselItemId,
    enterCounsel,
    exitCounsel,
  };
}
