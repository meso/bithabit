import { useEffect, useCallback, useRef } from 'react';
import { Task } from '@/types/task';

interface UseTaskResetProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  debugDate: Date | null;
}

export function useTaskReset({ tasks, setTasks, debugDate }: UseTaskResetProps) {
  // Store refs to avoid recreating callbacks
  const setTasksRef = useRef(setTasks);
  const debugDateRef = useRef(debugDate);

  // Update refs when props change
  useEffect(() => {
    setTasksRef.current = setTasks;
    debugDateRef.current = debugDate;
  });

  const resetTasks = useCallback(() => {
    const currentDate = debugDateRef.current || new Date();
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

    setTasksRef.current((prevTasks) =>
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
          return { ...task, completed: false, progressInSeconds: 0, completedAt: null };
        }

        return task;
      })
    );
  }, []); // No dependencies, uses refs instead

  // Check for task resets periodically
  useEffect(() => {
    resetTasks();
    const interval = setInterval(resetTasks, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []); // Only run once on mount

  return { resetTasks };
}