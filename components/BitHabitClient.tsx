"use client";

import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useTaskManager } from "@/hooks/useTaskManager";
import { useDebugMode } from "@/hooks/useDebugMode";
import { useTaskReset } from "@/hooks/useTaskReset";
import { Task } from "@/types/task";
import TaskList from "@/components/TaskList";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import TaskStatus from "@/components/TaskStatus";
import ContributionGraph from "@/components/ContributionGraph";
import PointsDisplay from "@/components/PointsDisplay";
import DebugControls from "@/components/DebugControls";
import { toSeconds } from "@/lib/utils";


export function BitHabitClient() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const { activityLog, logTaskActivity } = useActivityLog();
  const { debugMode, debugDate, toggleDebugMode, advanceDebugTime } = useDebugMode();
  const { addTask, completeTask, submitProgress, deleteTask } = useTaskManager({
    tasks,
    setTasks,
    logTaskActivity,
    debugDate
  });
  useTaskReset({ tasks, setTasks, debugDate });


  // Handle adding tasks with proper format for useTaskManager
  const handleAddTask = useCallback((
    newTask: Omit<
      Task,
      "id" | "completed" | "progressInSeconds" | "completedAt" | "points"
    >,
  ) => {
    const taskWithSeconds = {
      ...newTask,
      target: toSeconds(newTask.target, newTask.unit),
      completed: false,
      progressInSeconds: 0,
      completedAt: null,
      points: 0,
    };
    addTask(taskWithSeconds);
  }, [addTask]);

  return (
    <>
      <HamburgerMenu onAddTask={handleAddTask} />
      
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
          isDebugMode={debugMode}
          toggleDebugMode={toggleDebugMode}
          advanceTime={advanceDebugTime}
        />
      )}
    </>
  );
}