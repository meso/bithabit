import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/CircularProgress";
import { useWakeLock } from "@/hooks/useWakeLock";

interface TimerProps {
  onComplete: (duration: number) => void;
  onTimeUpdate: (time: number) => void;
  unit: string;
  target: number;
  currentProgressInSeconds: number;
}

export function Timer({
  onComplete,
  onTimeUpdate,
  unit,
  target,
  currentProgressInSeconds,
}: TimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const workerRef = useRef<Worker | null>(null);
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  const remainingSeconds = Math.max(target - currentProgressInSeconds, 0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      workerRef.current = new Worker("/timer-worker.js");

      workerRef.current.onmessage = (e) => {
        const newTime = Math.floor(e.data.time / 1000);
        setTime(newTime);
        onTimeUpdate(newTime);
      };

      return () => {
        workerRef.current?.terminate();
      };
    }
  }, [onTimeUpdate]);

  useEffect(() => {
    if (time >= remainingSeconds) {
      handleStop();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, remainingSeconds]);

  const handleStart = async () => {
    setIsRunning(true);
    workerRef.current?.postMessage({ action: "start" });
    await requestWakeLock();
  };

  const handleStop = () => {
    setIsRunning(false);
    workerRef.current?.postMessage({ action: "stop" });
    onComplete(time);
    setTime(0);
    releaseWakeLock();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    if (unit === "時間") {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    } else {
      return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
  };

  const calculateProgress = () => {
    return remainingSeconds > 0
      ? Math.min((time / remainingSeconds) * 100, 100)
      : 100;
  };

  return (
    <div className="text-center">
      <CircularProgress
        progress={calculateProgress()}
        size={200}
        strokeWidth={10}
      >
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
