import { useMemo } from 'react';
import { DailyActivity } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PointsDisplayProps {
  activityLog: DailyActivity[];
}

export function PointsDisplay({ activityLog }: PointsDisplayProps) {
  // 合計ポイント
  const totalPoints = useMemo(() => {
    return activityLog.reduce((sum, day) => sum + day.totalPoints, 0);
  }, [activityLog]);

  // 過去7日間のポイント
  const recentPoints = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    
    const weekAgoStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;
    
    return activityLog
      .filter(day => day.date >= weekAgoStr)
      .reduce((sum, day) => sum + day.totalPoints, 0);
  }, [activityLog]);

  // 連続達成日数（休みなくポイントを獲得した日数）
  const currentStreak = useMemo(() => {
    // 日付の配列を作成（今日から過去に遡る）
    const days: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < 90; i++) { // 最大90日まで検証
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      days.push(dateStr);
    }
    
    // アクティビティがある日付をMapに格納
    const activityDays = new Map<string, boolean>();
    activityLog.forEach(day => {
      if (day.totalPoints > 0) {
        activityDays.set(day.date, true);
      }
    });
    
    // 連続達成日数を計算
    let streak = 0;
    
    // 今日のアクティビティがなければ、昨日から連続日数を計算
    const todayStr = days[0];
    const startIndex = activityDays.has(todayStr) ? 0 : 1;
    
    for (let i = startIndex; i < days.length; i++) {
      if (activityDays.has(days[i])) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [activityLog]);

  // レベル計算（100ポイントごとにレベルアップ）
  const level = Math.floor(totalPoints / 100) + 1;
  
  // 次のレベルまでの残りポイント
  const pointsToNextLevel = 100 - (totalPoints % 100);

  // レベルの進行度（パーセント）
  const levelProgress = ((totalPoints % 100) / 100) * 100;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">ポイント統計</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <div className="text-3xl font-bold">{totalPoints}</div>
            <div className="text-sm text-gray-500">累計ポイント</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <div className="text-3xl font-bold">{recentPoints}</div>
            <div className="text-sm text-gray-500">過去7日間</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <div className="text-3xl font-bold">{currentStreak}</div>
            <div className="text-sm text-gray-500">連続日数</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <div className="text-3xl font-bold">{level}</div>
            <div className="text-sm text-gray-500">現在レベル</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>レベル {level}</span>
            <span>レベル {level + 1}まで{pointsToNextLevel}ポイント</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}