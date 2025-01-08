import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CircularProgress } from './CircularProgress';

interface TimerProps {
  onComplete: (duration: number) => void;
  unit: string;
  target: number;
  currentProgressInSeconds: number;
}

export function Timer({ onComplete, unit, target, currentProgressInSeconds }: TimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  const remainingSeconds = Math.max(target - currentProgressInSeconds, 0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      workerRef.current = new Worker('/timer-worker.js');

      workerRef.current.onmessage = (e) => {
        setTime(Math.floor(e.data.time / 1000));
      };

      return () => {
        workerRef.current?.terminate();
      };
    }
  }, []);

  useEffect(() => {
    if (time >= remainingSeconds) {
      handleStop();
    }
  }, [time, remainingSeconds]);

  const handleStart = () => {
    setIsRunning(true);
    workerRef.current?.postMessage({ action: 'start' });
  };

  const handleStop = () => {
    setIsRunning(false);
    workerRef.current?.postMessage({ action: 'stop' });
    onComplete(time);
    setTime(0);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    if (unit === '時間') {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };

  const calculateProgress = () => {
    return remainingSeconds > 0 ? Math.min((time / remainingSeconds) * 100, 100) : 100;
  };

  return (
    <div className="text-center">
      <CircularProgress progress={calculateProgress()} size={200} strokeWidth={10}>
        <div className="flex flex-col items-center justify-center h-full pt-10">
          <div className="text-4xl font-bold">{formatTime(time)}</div>
          <div className="mt-2">
            <p>/ {formatTime(remainingSeconds)}</p>
          </div>
        </div>
      </CircularProgress>
      <div className="mt-4">
        {!isRunning ? (
          <Button onClick={handleStart}>開始</Button>
        ) : (
          <Button onClick={handleStop}>停止</Button>
        )}
      </div>
    </div>
  );
}

