import { useEffect, useCallback } from 'react';
import { Task } from '@/types/task';
import { ActivityLogEntry } from './useActivityLog';

interface UseTaskResetProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addActivityLogEntry: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
  debugDate: Date | null;
}

export function useTaskReset({ tasks, setTasks, addActivityLogEntry, debugDate }: UseTaskResetProps) {
  const currentDate = debugDate || new Date();

  const resetTasks = useCallback(() => {
    const startOfToday = new Date(currentDate);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    startOfMonth.setHours(0, 0, 0, 0);

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (!task.completedAt || !task.completed) {
          return task;
        }

        const lastCompletedDate = new Date(task.completedAt);
        let shouldReset = false;

        switch (task.frequency) {
          case 'daily':
            shouldReset = lastCompletedDate < startOfToday;
            break;
          case 'weekly':
            shouldReset = lastCompletedDate < startOfWeek;
            break;
          case 'monthly':
            shouldReset = lastCompletedDate < startOfMonth;
            break;
        }

        if (shouldReset) {
          addActivityLogEntry({
            taskId: task.id,
            taskName: task.title,
            taskEmoji: '',
            taskFrequency: task.frequency,
            action: 'reset',
          });
          return { ...task, completed: false, progressInSeconds: 0, completedAt: null };
        }

        return task;
      })
    );
  }, [currentDate, setTasks, addActivityLogEntry]);

  // Check for task resets periodically
  useEffect(() => {
    resetTasks();
    const interval = setInterval(resetTasks, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [resetTasks]);

  return { resetTasks };
}