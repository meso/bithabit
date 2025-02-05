import { Card, CardContent } from "@/components/ui/card";
import { Task } from "../types/task";

interface TaskStatusProps {
  tasks: Task[];
}

export function TaskStatus({ tasks }: TaskStatusProps) {
  const allTasksCompleted =
    tasks.length > 0 && tasks.every((task) => task.completed);
  const noTasks = tasks.length === 0;

  if (allTasksCompleted) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">
            すべてのタスクが完了しました 🎉
          </h2>
          <p>素晴らしい達成です！新しい目標を設定しましょう。</p>
        </CardContent>
      </Card>
    );
  }

  if (noTasks) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">タスクがありません</h2>
          <p>右上のメニューから新規タスクを登録しましょう。</p>
        </CardContent>
      </Card>
    );
  }

  return null;
}
