import { useState, useCallback, useEffect } from 'react';

export function useDebugMode() {
  const [debugMode, setDebugMode] = useState(false);
  const [debugDateState, setDebugDateState] = useState<Date | null>(null);

  // Load debug state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedDebugMode = sessionStorage.getItem('debugMode') === 'true';
        const savedDebugDate = sessionStorage.getItem('debugDate');
        
        setDebugMode(savedDebugMode);
        if (savedDebugDate) {
          const parsedDate = new Date(savedDebugDate);
          // Validate the parsed date
          if (!isNaN(parsedDate.getTime())) {
            setDebugDateState(parsedDate);
          } else {
            console.warn('Invalid debug date in sessionStorage, removing it');
            sessionStorage.removeItem('debugDate');
          }
        }
      } catch (error) {
        console.error('Failed to load debug state from sessionStorage:', error);
        // Reset to safe defaults on error
        setDebugMode(false);
        setDebugDateState(null);
      }
    }
  }, []);

  const toggleDebugMode = useCallback(() => {
    setDebugMode((prev) => {
      const newValue = !prev;
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('debugMode', String(newValue));
          if (!newValue) {
            sessionStorage.removeItem('debugDate');
            setDebugDateState(null);
          }
        } catch (error) {
          console.error('Failed to save debug mode to sessionStorage:', error);
        }
      }
      return newValue;
    });
  }, []);

  const setDebugDate = useCallback((date: Date | null) => {
    setDebugDateState(date);
    if (typeof window !== 'undefined') {
      try {
        if (date) {
          sessionStorage.setItem('debugDate', date.toISOString());
        } else {
          sessionStorage.removeItem('debugDate');
        }
      } catch (error) {
        console.error('Failed to save debug date to sessionStorage:', error);
      }
    }
  }, []);

  const advanceDebugTime = useCallback((hours: number) => {
    setDebugDateState((currentDate) => {
      if (!currentDate) return null;
      const newDate = new Date(currentDate.getTime() + hours * 60 * 60 * 1000);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('debugDate', newDate.toISOString());
        } catch (error) {
          console.error('Failed to save advanced debug date to sessionStorage:', error);
        }
      }
      return newDate;
    });
  }, []);

  const resetDebugDate = useCallback(() => {
    const newDate = new Date();
    setDebugDateState(newDate);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('debugDate', newDate.toISOString());
      } catch (error) {
        console.error('Failed to save reset debug date to sessionStorage:', error);
      }
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