import { useState, useEffect } from 'react';

type WakeLockType = 'screen';

export function useWakeLock(type: WakeLockType = 'screen') {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        const wakeLock = await navigator.wakeLock.request(type);
        setWakeLock(wakeLock);
        console.log('Wake Lock is active');
        return wakeLock;
      } catch (err) {
        console.error(`Failed to request Wake Lock: ${err}`);
      }
    } else {
      console.error('Wake Lock API is not supported in this browser');
    }
    return null;
  };

  const releaseWakeLock = () => {
    if (wakeLock) {
      wakeLock.release()
        .then(() => {
          setWakeLock(null);
          console.log('Wake Lock has been released');
        })
        .catch((err) => {
          console.error(`Failed to release Wake Lock: ${err}`);
        });
    }
  };

  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [wakeLock]);

  return { wakeLock, requestWakeLock, releaseWakeLock };
}

