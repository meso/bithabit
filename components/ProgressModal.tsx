import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TripleScrollNumberPicker } from "./TripleScrollNumberPicker";
import { Timer } from "./Timer";
import { Task } from "../types/task";

interface ProgressModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: (progress?: number) => void;
  onSubmit: (progress: number) => void;
}

export function ProgressModal({
  task,
  isOpen,
  onClose,
  onSubmit,
}: ProgressModalProps) {
  const [progress, setProgress] = useState(0);

  const handleClose = () => {
    if (
      task &&
      task.unit !== "回" &&
      task.unit !== "ページ" &&
      task.unit !== "km"
    ) {
      onClose(progress);
    } else {
      onClose();
    }
    setProgress(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(progress);
    setProgress(0);
    onClose();
  };

  const handleTimerComplete = (duration: number) => {
    onSubmit(duration);
    onClose();
  };

  if (!task) return null;

  const isTimeUnit =
    task.unit === "分" || task.unit === "秒" || task.unit === "時間";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {isTimeUnit ? (
            <DialogTitle>{task.title} タイマー</DialogTitle>
          ) : (
            <DialogTitle>進捗更新: {task.title}</DialogTitle>
          )}
        </DialogHeader>
        {isTimeUnit ? (
          <Timer
            onComplete={handleTimerComplete}
            onTimeUpdate={setProgress}
            unit={task.unit}
            target={task.target}
            currentProgressInSeconds={task.progressInSeconds}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="flex-grow border rounded-md overflow-hidden p-1 w-[9rem]">
                <TripleScrollNumberPicker
                  value={progress}
                  onChange={setProgress}
                  max={999}
                />
              </div>
              <span className="text-lg font-medium">{task.unit}</span>
            </div>
            <Button type="submit" className="w-full">
              進捗を追加
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
