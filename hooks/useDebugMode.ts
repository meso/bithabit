import { useState, useCallback, useEffect } from 'react';

export function useDebugMode() {
  const [debugMode, setDebugMode] = useState(false);
  const [debugDateState, setDebugDateState] = useState<Date | null>(null);

  // Load debug state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDebugMode = sessionStorage.getItem('debugMode') === 'true';
      const savedDebugDate = sessionStorage.getItem('debugDate');
      
      setDebugMode(savedDebugMode);
      if (savedDebugDate) {
        setDebugDateState(new Date(savedDebugDate));
      }
    }
  }, []);

  const toggleDebugMode = useCallback(() => {
    setDebugMode((prev) => {
      const newValue = !prev;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('debugMode', String(newValue));
        if (!newValue) {
          sessionStorage.removeItem('debugDate');
          setDebugDateState(null);
        }
      }
      return newValue;
    });
  }, []);

  const setDebugDate = useCallback((date: Date | null) => {
    setDebugDateState(date);
    if (typeof window !== 'undefined') {
      if (date) {
        sessionStorage.setItem('debugDate', date.toISOString());
      } else {
        sessionStorage.removeItem('debugDate');
      }
    }
  }, []);

  const advanceDebugTime = useCallback((hours: number) => {
    setDebugDateState((currentDate) => {
      if (!currentDate) return null;
      const newDate = new Date(currentDate.getTime() + hours * 60 * 60 * 1000);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('debugDate', newDate.toISOString());
      }
      return newDate;
    });
  }, []);

  const resetDebugDate = useCallback(() => {
    const newDate = new Date();
    setDebugDateState(newDate);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('debugDate', newDate.toISOString());
    }
  }, []);

  return {
    debugMode,
    debugDate: debugDateState,
    toggleDebugMode,
    setDebugDate,
    advanceDebugTime,
    resetDebugDate,
  };
}