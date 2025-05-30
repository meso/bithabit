"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useActivityLog } from "@/hooks/useActivityLog";
import { Task, TaskUnit } from "@/types/task";
import { TaskList } from "@/components/TaskList";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { TaskStatus } from "@/components/TaskStatus";
import { ContributionGraph } from "@/components/ContributionGraph";
import { PointsDisplay } from "@/components/PointsDisplay";
import { DebugControls } from "@/components/DebugControls";
// import { Button } from "@/components/ui/button";

// デバッグモード用の時間操作関数
let debugDate: Date | null = null;

const getDebugDate = (): Date => {
  return debugDate || new Date();
};

export default function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const { activityLog, logTaskActivity } = useActivityLog();

  const addTask = (
    newTask: Omit<
      Task,
      "id" | "completed" | "progressInSeconds" | "completedAt" | "points"
    >,
  ) => {
    const task: Task = {
      ...newTask,
      id: uuidv4(),
      completed: false,
      progressInSeconds: 0,
      target: convertToSeconds(newTask.target, newTask.unit),
      completedAt: null,
      points: 0,
    };
    setTasks((prevTasks: Task[]) => [...prevTasks, task]);
  };

  const convertToSeconds = (value: number, unit: TaskUnit): number => {
    switch (unit) {
      case "分":
        return value * 60;
      case "時間":
        return value * 3600;
      default:
        return value;
    }
  };

  const completeTask = (taskId: string) => {
    setTasks((prevTasks: Task[]) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const now = getDebugDate().getTime();
          // アクティビティログに記録
          const earnedPoints = logTaskActivity(task, task.target, true);
          
          return { 
            ...task, 
            completed: true, 
            completedAt: now,
            points: (task.points || 0) + earnedPoints
          };
        }
        return task;
      }),
    );
  };

  const submitProgress = (taskId: string, progressInSeconds: number) => {
    setTasks((prevTasks: Task[]) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const newProgress = task.progressInSeconds + progressInSeconds;
          const completed = newProgress >= task.target;
          const now = getDebugDate().getTime();
          
          // アクティビティログに記録
          const earnedPoints = logTaskActivity(task, progressInSeconds, completed);
          
          return {
            ...task,
            progressInSeconds: newProgress,
            completed,
            completedAt: completed ? now : null,
            points: (task.points || 0) + earnedPoints
          };
        }
        return task;
      }),
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prevTasks: Task[]) => prevTasks.filter((task) => task.id !== taskId));
  };

  const resetTasks = useCallback(() => {
    const now = getDebugDate();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1),
    ).getTime();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).getTime();

    setTasks((prevTasks: Task[]) =>
      prevTasks.map((task) => {
        if (!task.completed || !task.completedAt) return task;

        switch (task.frequency) {
          case "daily":
            if (task.completedAt < startOfToday) {
              return {
                ...task,
                completed: false,
                progressInSeconds: 0,
                completedAt: null,
              };
            }
            break;
          case "weekly":
            if (task.completedAt < startOfWeek) {
              return {
                ...task,
                completed: false,
                progressInSeconds: 0,
                completedAt: null,
              };
            }
            break;
          case "monthly":
            if (task.completedAt < startOfMonth) {
              return {
                ...task,
                completed: false,
                progressInSeconds: 0,
                completedAt: null,
              };
            }
            break;
        }
        return task;
      }),
    );
  }, [setTasks]);

  useEffect(() => {
    resetTasks();
  }, [resetTasks]);

  // デバッグモードの切り替え
  const _toggleDebugMode = () => {
    setIsDebugMode(!isDebugMode);
    debugDate = null;
  };

  // 時間を進める（デバッグモード用）
  const _advanceTime = (hours: number) => {
    if (debugDate) {
      debugDate = new Date(debugDate.getTime() + hours * 60 * 60 * 1000);
    } else {
      debugDate = new Date(getDebugDate().getTime() + hours * 60 * 60 * 1000);
    }
    resetTasks();
  };

  return (
    <main className="container mx-auto p-4 relative">
      <h1 className="text-2xl font-bold mb-4">BitHabit</h1>
      <HamburgerMenu onAddTask={addTask} />
      
      {/* ポイント表示としゅうかん牧場を横に並べる */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <div className="h-full flex flex-col">
          <PointsDisplay activityLog={activityLog} />
        </div>
        <div className="h-full flex flex-col">
          <ContributionGraph activityLog={activityLog} />
        </div>
      </div>
      
      <TaskStatus tasks={tasks} />
      
      {tasks.length > 0 && (
        <div className="my-4">
          <TaskList
            tasks={tasks}
            onComplete={completeTask}
            onSubmitProgress={submitProgress}
            onDeleteTask={deleteTask}
          />
        </div>
      )}
      
      {process.env.NODE_ENV !== "production" && (
        <DebugControls
          isDebugMode={isDebugMode}
          toggleDebugMode={_toggleDebugMode}
          advanceTime={_advanceTime}
        />
      )}
    </main>
  );
}
