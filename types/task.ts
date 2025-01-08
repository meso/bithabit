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
}

