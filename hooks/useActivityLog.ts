import { useLocalStorage } from './useLocalStorage';
import { ActivityEntry, DailyActivity, Task, TaskFrequency } from '../types/task';

export function useActivityLog() {
  const [activityLog, setActivityLog] = useLocalStorage<DailyActivity[]>("activityLog", []);

  // 頻度に基づいたポイント計算
  const calculatePoints = (frequency: TaskFrequency, progress: number, target: number): number => {
    // 基本ポイント：日次 = 1, 週次 = 5, 月次 = 20
    let basePoints = 0;
    switch (frequency) {
      case "daily": basePoints = 1; break;
      case "weekly": basePoints = 5; break;
      case "monthly": basePoints = 20; break;
    }
    
    // 進捗度に応じたボーナスポイント
    const progressRatio = progress / target;
    const bonusPoints = progressRatio >= 1.5 ? 2 : progressRatio >= 1.2 ? 1 : 0;
    
    return basePoints + bonusPoints;
  };

  // 日付文字列を取得（YYYY-MM-DD形式）
  const getDateString = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // タスク完了時にアクティビティを記録
  const logTaskActivity = (task: Task, progress: number, completed: boolean): number => {
    const now = Date.now();
    const dateStr = getDateString(now);
    const points = calculatePoints(task.frequency, progress, task.target);

    const newEntry: ActivityEntry = {
      date: dateStr,
      taskId: task.id,
      taskTitle: task.title,
      taskFrequency: task.frequency,
      progress,
      completed,
      points: completed ? points : 0 // 完了時のみポイント付与
    };

    setActivityLog(prevLog => {
      // 同じ日付のアクティビティを探す
      const dayIndex = prevLog.findIndex(day => day.date === dateStr);
      
      if (dayIndex >= 0) {
        // 既存の日付にエントリを追加
        const updatedDay = { ...prevLog[dayIndex] };
        updatedDay.entries = [...updatedDay.entries, newEntry];
        updatedDay.totalPoints += newEntry.points;
        if (completed) {
          updatedDay.completedTasks += 1;
        }
        
        const newLog = [...prevLog];
        newLog[dayIndex] = updatedDay;
        return newLog;
      } else {
        // 新しい日付のアクティビティを作成
        const newDay: DailyActivity = {
          date: dateStr,
          totalPoints: newEntry.points,
          completedTasks: completed ? 1 : 0,
          entries: [newEntry]
        };
        return [...prevLog, newDay];
      }
    });

    return points;
  };

  // 指定日数分のアクティビティを取得
  const getActivitiesForPeriod = (days: number): DailyActivity[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = getDateString(cutoffDate.getTime());
    
    return activityLog.filter(activity => activity.date >= cutoffDateStr);
  };
  
  // 指定された日付の活動を取得
  const getActivityForDate = (dateStr: string): DailyActivity | undefined => {
    return activityLog.find(activity => activity.date === dateStr);
  };

  // 合計ポイントを計算
  const getTotalPoints = (): number => {
    return activityLog.reduce((sum, day) => sum + day.totalPoints, 0);
  };

  return {
    activityLog,
    logTaskActivity,
    getActivitiesForPeriod,
    getActivityForDate,
    getTotalPoints
  };
}