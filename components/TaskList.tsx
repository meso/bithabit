import { Task, TaskUnit } from '../types/task';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { ProgressModal } from './ProgressModal';
import { DropdownMenu } from './DropdownMenu';

interface TaskListProps {
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onSubmitProgress: (taskId: string, progress: number) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskList({ tasks, onComplete, onSubmitProgress, onDeleteTask }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const formatValue = (seconds: number, unit: TaskUnit) => {
    switch (unit) {
      case '秒':
        return `${seconds}秒`;
      case '分':
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return remainingSeconds === 0 ? `${minutes}分` : `${minutes}分${remainingSeconds}秒`;
      case '時間':
        const hours = Math.floor(seconds / 3600);
        const remainingMinutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds2 = Math.floor(seconds % 60);
        if (remainingSeconds2 === 0) {
          if (remainingMinutes === 0) {
            return `${hours}時間`;
          }
          return `${hours}時間${remainingMinutes}分`;
        }
        return `${hours}時間${remainingMinutes}分${remainingSeconds2}秒`;
      default:
        return `${seconds}${unit}`;
    }
  };

  const calculateProgressPercentage = (progressInSeconds: number, target: number) => {
    return progressInSeconds > target ? 100 : (progressInSeconds / target) * 100;
  };

  const formatCompletedAt = (completedAt: number) => {
    const date = new Date(completedAt);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleModalClose = (progress?: number) => {
    if (selectedTask && progress && progress > 0) {
      onSubmitProgress(selectedTask.id, progress);
    }
    setSelectedTask(null);
  };

  return (
    <>
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task.id} className="bg-white p-4 rounded-lg shadow relative">
            <div className="absolute top-0 right-0">
              <DropdownMenu onDelete={() => onDeleteTask(task.id)} />
            </div>
            <div className="flex items-center">
              <div 
                className="flex-grow cursor-pointer" 
                onClick={() => !task.completed && setSelectedTask(task)}
              >
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <p className="text-sm text-gray-500">
                  {task.frequency === 'daily' ? '毎日' : task.frequency === 'weekly' ? '毎週' : '毎月'}
                  {' '}
                  {formatValue(task.target, task.unit)}
                </p>
                <div className="mt-2">
                  <Progress 
                    value={calculateProgressPercentage(task.progressInSeconds, task.target)} 
                    className="w-48" 
                  />
                  <p className="text-sm mt-1">
                    進捗: {formatValue(task.progressInSeconds, task.unit)}
                  </p>
                  {task.completed && task.completedAt && (
                    <p className="text-sm text-gray-500 mt-1">
                      完了日時: {formatCompletedAt(task.completedAt)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end justify-center ml-4">
                {!task.completed && (
                  <Button onClick={() => onComplete(task.id)} className="w-32">完了</Button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <ProgressModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={handleModalClose}
        onSubmit={(progress) => {
          if (selectedTask) {
            onSubmitProgress(selectedTask.id, progress);
            setSelectedTask(null);
          }
        }}
      />
    </>
  );
}

