import { useState, useEffect, useCallback } from 'react';

// Error notification state to avoid multiple alerts
let hasNotifiedError = false;

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, { error: Error | null }] {
  // Keep initial state consistent between server and client to avoid hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [error, setError] = useState<Error | null>(null);

  // On mount, load stored value from localStorage
  // We only depend on `key` to avoid infinite loops from changing `initialValue` reference
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const item = window.localStorage.getItem(key);
        const value = item ? JSON.parse(item) : initialValue;
        setStoredValue(value);
        setError(null);
      } catch (error) {
        console.error('LocalStorage read error:', error);
        setStoredValue(initialValue);
        setError(error as Error);
        
        // User notification
        if (!hasNotifiedError) {
          hasNotifiedError = true;
          const message = 'データの読み込みに失敗しました。一部の設定がリセットされる可能性があります。';
          
          // Show notification if available
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('ストレージエラー', { body: message });
          } else {
            // Fallback to console warning (less intrusive than alert)
            console.warn(message);
          }
          
          // Reset flag after a delay
          setTimeout(() => { hasNotifiedError = false; }, 5000);
        }
        
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
        const newValue = typeof value === 'function' ? (value as (val: T) => T)(prev) : value;
        if (typeof window !== "undefined" && window.localStorage) {
          try {
            window.localStorage.setItem(key, JSON.stringify(newValue));
            setError(null);
          } catch (storageError) {
            console.error('LocalStorage write error:', storageError);
            setError(storageError as Error);
            
            // Notify user about storage quota issues
            if (storageError instanceof DOMException && storageError.name === 'QuotaExceededError') {
              const message = 'ストレージ容量が不足しています。古いデータを削除してください。';
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('ストレージ容量不足', { body: message });
              } else {
                console.warn(message);
              }
            }
          }
        }
        return newValue;
      });
    } catch (error) {
      console.error('setValue error:', error);
      setError(error as Error);
    }
  }, [key]);

  return [storedValue, setValue, { error }];
}