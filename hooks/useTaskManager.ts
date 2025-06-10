import { useCallback } from 'react';
import { Task } from '@/types/task';

interface UseTaskManagerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  logTaskActivity: (task: Task, progress: number, completed: boolean) => number;
  debugDate: Date | null;
}

export function useTaskManager({ tasks, setTasks, logTaskActivity, debugDate }: UseTaskManagerProps) {
  const currentDate = debugDate || new Date();

  const addTask = useCallback((newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: crypto.randomUUID(),
    };
    setTasks((prev) => [...prev, task]);
  }, [setTasks]);

  const completeTask = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.completed) return;

    // アクティビティログに記録してポイントを計算
    const earnedPoints = logTaskActivity(task, task.target, true);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { 
              ...t, 
              completed: true, 
              completedAt: currentDate.getTime(),
              points: (t.points || 0) + earnedPoints
            }
          : t
      )
    );
  }, [tasks, setTasks, logTaskActivity, currentDate]);

  const submitProgress = useCallback((taskId: string, duration: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedProgressInSeconds = task.progressInSeconds + duration;
    const isCompleted = task.unit === '秒' 
      ? updatedProgressInSeconds >= task.target
      : task.unit === '分'
      ? updatedProgressInSeconds >= task.target * 60
      : task.unit === '時間'
      ? updatedProgressInSeconds >= task.target * 3600
      : false;

    // アクティビティログに記録してポイントを計算
    const earnedPoints = logTaskActivity(task, duration, isCompleted);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              progressInSeconds: updatedProgressInSeconds,
              completed: isCompleted,
              completedAt: isCompleted ? currentDate.getTime() : t.completedAt,
              points: (t.points || 0) + earnedPoints
            }
          : t
      )
    );
  }, [tasks, setTasks, logTaskActivity, currentDate]);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, [setTasks]);

  return {
    addTask,
    completeTask,
    submitProgress,
    deleteTask,
  };
}