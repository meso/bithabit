import { useState } from "react";
import { Task, TaskFrequency, TaskUnit } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TripleScrollNumberPicker } from "@/components/TripleScrollNumberPicker";

interface TaskFormProps {
  onSubmit: (
    task: Omit<Task, "id" | "completed" | "progressInSeconds" | "completedAt">,
  ) => void;
}

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<TaskFrequency>("daily");
  const [target, setTarget] = useState<number>(1);
  const [unit, setUnit] = useState<TaskUnit>("回");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, frequency, target, unit });
    setTitle("");
    setFrequency("daily");
    setTarget(1);
    setUnit("回");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-[500px]">
      <div>
        <Label htmlFor="title">タスク名</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="w-full sm:w-1/2">
          <Label htmlFor="frequency">頻度</Label>
          <Select
            onValueChange={(value: TaskFrequency) => setFrequency(value)}
            value={frequency}
          >
            <SelectTrigger className="w-[5rem]">
              <SelectValue placeholder="頻度を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">毎日</SelectItem>
              <SelectItem value="weekly">毎週</SelectItem>
              <SelectItem value="monthly">毎月</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-1/2">
          <Label>数値目標</Label>
          <div className="flex items-center space-x-2">
            <div className="flex-grow border rounded-md overflow-hidden p-1">
              <TripleScrollNumberPicker
                value={target}
                onChange={setTarget}
                max={999}
              />
            </div>
            <Select
              onValueChange={(value: TaskUnit) => setUnit(value)}
              value={unit}
            >
              <SelectTrigger className="w-[5rem]">
                <SelectValue placeholder="単位を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="秒">秒</SelectItem>
                <SelectItem value="分">分</SelectItem>
                <SelectItem value="時間">時間</SelectItem>
                <SelectItem value="回">回</SelectItem>
                <SelectItem value="ページ">ページ</SelectItem>
                <SelectItem value="km">km</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Button type="submit" className="w-full">
        タスクを追加
      </Button>
    </form>
  );
}
