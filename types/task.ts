export type TaskFrequency = 'daily' | 'weekly' | 'monthly';

export type TaskUnit = '秒' | '分' | '時間' | '回' | 'ページ' | 'km';

export interface Task {
  id: string;
  title: string;
  frequency: TaskFrequency;
  target: number;
  unit: TaskUnit;
  progressInSeconds: number;
  completed: boolean;
  completedAt: number | null;
  points?: number; // 累計獲得ポイント（オプショナル）
}

export interface ActivityEntry {
  date: string; // ISO形式の日付文字列（YYYY-MM-DD）
  taskId: string;
  taskTitle: string;
  taskFrequency: TaskFrequency;
  progress: number;
  completed: boolean;
  points: number;
}

export interface DailyActivity {
  date: string; // ISO形式の日付文字列（YYYY-MM-DD）
  totalPoints: number;
  completedTasks: number;
  entries: ActivityEntry[];
}

