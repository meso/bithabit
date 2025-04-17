import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Keep initial state consistent between server and client to avoid hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // On mount, load stored value from localStorage
  // We only depend on `key` to avoid infinite loops from changing `initialValue` reference
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      const value = item ? JSON.parse(item) : initialValue;
      setStoredValue(value);
    } catch (error) {
      console.log(error);
    }
  }, [key]);

  // Setter wrapper that persists to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      setStoredValue(prev => {
        const newValue = value instanceof Function ? (value as (val: T) => T)(prev) : value;
        window.localStorage.setItem(key, JSON.stringify(newValue));
        return newValue;
      });
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

