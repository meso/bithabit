import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Keep initial state consistent between server and client to avoid hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // On mount, load stored value from localStorage
  // We only depend on `key` to avoid infinite loops from changing `initialValue` reference
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const item = window.localStorage.getItem(key);
        const value = item ? JSON.parse(item) : initialValue;
        setStoredValue(value);
      } catch (error) {
        console.error('LocalStorage read error:', error);
        setStoredValue(initialValue);
        try {
          window.localStorage.removeItem(key);
        } catch (removeError) {
          console.error('Failed to remove corrupted data:', removeError);
        }
      }
    } else {
      setStoredValue(initialValue);
    }
  }, [key]);

  // Setter wrapper that persists to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue(prev => {
        const newValue = value instanceof Function ? (value as (val: T) => T)(prev) : value;
        if (typeof window !== "undefined" && window.localStorage) {
          try {
            window.localStorage.setItem(key, JSON.stringify(newValue));
          } catch (storageError) {
            console.error('LocalStorage write error:', storageError);
          }
        }
        return newValue;
      });
    } catch (error) {
      console.error('setValue error:', error);
    }
  }, [key]);

  return [storedValue, setValue];
}

