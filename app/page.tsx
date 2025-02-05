"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Task, TaskUnit } from "../types/task";
import { TaskList } from "../components/TaskList";
import { HamburgerMenu } from "../components/HamburgerMenu";
import { TaskStatus } from "../components/TaskStatus";
import { Button } from "@/components/ui/button";

// デバッグモード用の時間操作関数
let debugDate: Date | null = null;

const getDebugDate = (): Date => {
  return debugDate || new Date();
};

export default function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [isDebugMode, setIsDebugMode] = useState(false);

  const addTask = (
    newTask: Omit<
      Task,
      "id" | "completed" | "progressInSeconds" | "completedAt"
    >,
  ) => {
    const task: Task = {
      ...newTask,
      id: uuidv4(),
      completed: false,
      progressInSeconds: 0,
      target: convertToSeconds(newTask.target, newTask.unit),
      completedAt: null,
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
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: true, completedAt: getDebugDate().getTime() }
          : task,
      ),
    );
  };

  const submitProgress = (taskId: string, progressInSeconds: number) => {
    setTasks((prevTasks: Task[]) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              progressInSeconds: task.progressInSeconds + progressInSeconds,
              completed:
                task.progressInSeconds + progressInSeconds >= task.target,
              completedAt:
                task.progressInSeconds + progressInSeconds >= task.target
                  ? getDebugDate().getTime()
                  : null,
            }
          : task,
      ),
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
      now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)),
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // setTasksを依存配列から意図的に除外

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
      {/* デバッグモード用のUI
         <div className="mt-8 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">デバッグモード</h2>
          <Button onClick={_toggleDebugMode} className="mb-2">
            {isDebugMode ? 'デバッグモードをオフ' : 'デバッグモードをオン'}
          </Button>
          {isDebugMode && (
            <div className="space-x-2">
              <Button onClick={() => _advanceTime(1)}>1時間進める</Button>
              <Button onClick={() => _advanceTime(24)}>1日進める</Button>
              <Button onClick={() => _advanceTime(24 * 7)}>1週間進める</Button>
              <Button onClick={() => _advanceTime(24 * 30)}>1ヶ月進める</Button>
            </div>
          )}
         </div>
         */}
    </main>
  );
}
