import { useCallback } from 'react';
import { Task } from '@/types/task';

// Define the type for activity log entries used by the task manager
export interface TaskActivityLogEntry {
  taskId: string;
  taskName: string;
  taskEmoji: string;
  taskFrequency: string;
  action: 'created' | 'completed' | 'deleted' | 'reset';
}

interface UseTaskManagerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addActivityLogEntry: (entry: TaskActivityLogEntry) => void;
  debugDate: Date | null;
}

export function useTaskManager({ tasks, setTasks, addActivityLogEntry, debugDate }: UseTaskManagerProps) {
  const currentDate = debugDate || new Date();

  const addTask = useCallback((newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: crypto.randomUUID(),
    };
    setTasks((prev) => [...prev, task]);
    addActivityLogEntry({
      taskId: task.id,
      taskName: task.title,
      taskEmoji: '',
      taskFrequency: task.frequency,
      action: 'created',
    });
  }, [setTasks, addActivityLogEntry]);

  const completeTask = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.completed) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, completed: true, completedAt: currentDate.getTime() }
          : t
      )
    );

    addActivityLogEntry({
      taskId: task.id,
      taskName: task.title,
      taskEmoji: '',
      taskFrequency: task.frequency,
      action: 'completed',
    });
  }, [tasks, setTasks, addActivityLogEntry, currentDate]);

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

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              progressInSeconds: updatedProgressInSeconds,
              completed: isCompleted,
              completedAt: isCompleted ? currentDate.getTime() : t.completedAt,
            }
          : t
      )
    );

    if (isCompleted) {
      addActivityLogEntry({
        taskId: task.id,
        taskName: task.title,
        taskEmoji: '',
        taskFrequency: task.frequency,
        action: 'completed',
      });
    }
  }, [tasks, setTasks, addActivityLogEntry, currentDate]);

  const deleteTask = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    addActivityLogEntry({
      taskId: task.id,
      taskName: task.title,
      taskEmoji: '',
      taskFrequency: task.frequency,
      action: 'deleted',
    });
  }, [tasks, setTasks, addActivityLogEntry]);

  return {
    addTask,
    completeTask,
    submitProgress,
    deleteTask,
  };
}