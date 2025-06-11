import { useState, useMemo, useEffect, useRef, startTransition } from 'react';
import { DailyActivity } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PixelDinosaur } from './PixelDinosaur';

interface ContributionGraphProps {
  activityLog: DailyActivity[];
  days?: number;
}

export function ContributionGraph({ activityLog, days = 70 }: ContributionGraphProps) {
  const [selectedDay, setSelectedDay] = useState<DailyActivity | null>(null);
  const [dinosaurPosition, setDinosaurPosition] = useState({ x: -100, y: 50 });
  const [isEating, setIsEating] = useState(false);
  const [targetGrass, setTargetGrass] = useState<{ x: number; y: number; weekIndex: number; dayIndex: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [greenCells, setGreenCells] = useState<{ x: number; y: number; intensity: number; weekIndex: number; dayIndex: number }[]>([]);

  // 指定された日数分の日付配列を生成
  const dateRange = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    
    // 日付の開始日を計算
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days + 1);
    
    // 指定された日数分の日付を生成
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      dates.push(dateStr);
    }
    
    return dates;
  }, [days]);

  // 日付ごとのアクティビティデータを作成
  const activitiesByDate = useMemo(() => {
    const map = new Map<string, DailyActivity>();
    
    // 日付の配列を初期化
    dateRange.forEach(date => {
      map.set(date, {
        date,
        totalPoints: 0,
        completedTasks: 0,
        entries: []
      });
    });
    
    // アクティビティログで上書き
    activityLog.forEach(activity => {
      if (map.has(activity.date)) {
        map.set(activity.date, activity);
      }
    });
    
    return map;
  }, [activityLog, dateRange]);

  // 色の強度を計算（0-4のレベル）
  const getIntensity = useMemo(() => (points: number): number => {
    if (points === 0) return 0;
    if (points <= 2) return 1;
    if (points <= 5) return 2;
    if (points <= 10) return 3;
    return 4;
  }, []);

  // Select random target grass
  useEffect(() => {
    if (greenCells.length === 0 || targetGrass) return;
    
    const selectTarget = () => {
      if (greenCells.length > 0) {
        const randomTarget = greenCells[Math.floor(Math.random() * greenCells.length)];
        setTargetGrass(randomTarget);
      }
    };
    
    // Initial selection after a delay
    const timeout = setTimeout(selectTarget, 1000);
    
    // Reselect every 10 seconds
    const interval = setInterval(() => {
      if (!isEating) {
        selectTarget();
      }
    }, 10000);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [greenCells, targetGrass, isEating]);

  // Animate dinosaur movement
  useEffect(() => {
    if (!targetGrass) return;
    
    let animationFrame: number;
    let startTime: number;
    const duration = 3000; // 3 seconds to reach target
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth movement
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const newX = -100 + (targetGrass.x - (-100)) * easeProgress;
      const newY = 50 + (targetGrass.y - 50) * easeProgress;
      
      startTransition(() => {
        setDinosaurPosition({ x: newX, y: newY });
      });
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Start eating animation
        setIsEating(true);
        
        // Stop eating and move to next target after 2 seconds
        setTimeout(() => {
          setIsEating(false);
          setDinosaurPosition({ x: -100, y: 50 });
          setTargetGrass(null);
        }, 2000);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [targetGrass]);

  // 週ごとのグリッドに整理（GitHub風の正確な表示のため）
  const weeks = useMemo(() => {
    const result = [];
    
    // 最初の月曜日を見つける
    let startIndex = 0;
    for (let i = 0; i < dateRange.length; i++) {
      const date = new Date(dateRange[i]);
      if (date.getDay() === 1) { // 月曜日
        startIndex = i;
        break;
      }
    }
    
    let currentDateIndex = startIndex;
    
    // 日付範囲を週ごとに分割
    while (currentDateIndex < dateRange.length) {
      const weekData = Array(7).fill(null); // 7日分の配列（月〜日）
      
      // 1週間分処理
      for (let dayIndex = 0; dayIndex < 7 && currentDateIndex < dateRange.length; dayIndex++) {
        const dateStr = dateRange[currentDateIndex];
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay(); // 0（日曜）から6（土曜）
        
        // 曜日を月曜始まりに変換（月:0, 火:1, 水:2, 木:3, 金:4, 土:5, 日:6）
        const expectedDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        // 期待される曜日と一致する場合のみ配置
        if (expectedDayIndex === dayIndex) {
          const activity = activitiesByDate.get(dateStr);
          if (activity) {
            weekData[dayIndex] = activity;
          }
          currentDateIndex++;
        }
      }
      
      // 空の週は追加しない
      if (weekData.some(day => day !== null)) {
        result.push(weekData);
      }
    }
    
    return result;
  }, [dateRange, activitiesByDate]);

  // Calculate green cells positions based on state
  useEffect(() => {
    const cells: { x: number; y: number; intensity: number; weekIndex: number; dayIndex: number }[] = [];
    
    // Get actual grid dimensions
    const labelWidth = 24; // w-6
    const cellSize = 28; // w-7
    const gap = 4; // gap-1
    
    weeks.forEach((week, weekIndex) => {
      week.forEach((day, dayIndex) => {
        if (day) {
          const intensity = getIntensity(day.totalPoints);
          if (intensity > 0) {
            // Calculate center position of each cell
            const cellX = labelWidth + gap + (weekIndex * (cellSize + gap)) + cellSize / 2 - cellSize * 2; // 2マス左に移動
            const cellY = (dayIndex * (cellSize + gap)) + cellSize / 2 - cellSize / 2; // 縦方向に半分上にずらす
            
            cells.push({
              x: cellX,
              y: cellY,
              intensity,
              weekIndex,
              dayIndex
            });
          }
        }
      });
    });
    
    startTransition(() => {
      setGreenCells(cells);
    });
  }, [weeks, getIntensity]);

  // 日付の表示形式を整形
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">しゅうかん牧場</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="flex flex-col items-center">
          {/* 中央揃えのコンテナ - 月表示と日付グリッドの両方を含む */}
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
            {/* 月表示（上部） */}
            <div className="mb-1 w-full">
              <div className="flex gap-1 justify-center ml-6">
                {weeks.map((week, weekIndex) => {
                  // 月の最初の週だけ月名を表示
                  const firstDay = week.find(day => day !== null);
                  if (firstDay) {
                    const date = new Date(firstDay.date);
                    const isFirstWeekOfMonth = date.getDate() <= 7;
                    if (isFirstWeekOfMonth || weekIndex === 0) {
                      return (
                        <div key={`month-${weekIndex}`} className="w-7 h-5 flex items-end justify-center text-xs text-gray-500">
                          {new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date).substring(0, 3)}
                        </div>
                      );
                    }
                  }
                  return <div key={`month-${weekIndex}`} className="w-7 h-5"></div>;
                })}
              </div>
            </div>
            
            {/* 日付グリッド部分 - 同じコンテナ内に配置 */}
            <div className="flex relative">
              {/* 曜日のラベル（縦方向） */}
              <div className="flex flex-col gap-1 mr-0.5">
                <div className="w-6 h-7 flex items-center justify-center text-xs text-gray-500">月</div>
                <div className="w-6 h-7 flex items-center justify-center text-xs text-gray-500">火</div>
                <div className="w-6 h-7 flex items-center justify-center text-xs text-gray-500">水</div>
                <div className="w-6 h-7 flex items-center justify-center text-xs text-gray-500">木</div>
                <div className="w-6 h-7 flex items-center justify-center text-xs text-gray-500">金</div>
                <div className="w-6 h-7 flex items-center justify-center text-xs text-gray-500">土</div>
                <div className="w-6 h-7 flex items-center justify-center text-xs text-gray-500">日</div>
              </div>
              
              {/* 週ごとのコラム */}
              <div className="flex flex-col relative">
                {/* SVG for dinosaur animation */}
                <svg
                  ref={svgRef}
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{ width: '100%', height: '100%' }}
                  viewBox={`0 0 ${28 + 4 + weeks.length * 32} ${7 * 32}`}
                  preserveAspectRatio="none"
                >
                  <PixelDinosaur x={dinosaurPosition.x} y={dinosaurPosition.y} isEating={isEating} />
                </svg>
                {/* 曜日ごとの行 */}
                {Array.from({ length: 7 }).map((_, dayOfWeek) => (
                  <div key={`day-row-${dayOfWeek}`} className="flex gap-1 mb-1">
                    {weeks.map((week, weekIndex) => {
                      const day = week[dayOfWeek];
                      if (!day) return <div key={`empty-${weekIndex}-${dayOfWeek}`} className="w-7 h-7"></div>;
                      
                      const intensity = getIntensity(day.totalPoints);
                      return (
                        <div
                          key={`day-${day.date}`}
                          className={`w-7 h-7 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110`}
                          style={{
                            backgroundColor: intensity === 0 
                              ? '#ebedf0' 
                              : intensity === 1 
                                ? '#9be9a8' 
                                : intensity === 2 
                                  ? '#40c463' 
                                  : intensity === 3 
                                    ? '#30a14e' 
                                    : '#216e39'
                          }}
                          onClick={() => setSelectedDay(day)}
                          title={`${formatDate(day.date)}: ${day.totalPoints}ポイント, ${day.completedTasks}タスク完了`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {/* 凡例も同じコンテナ内 */}
            <div className="flex items-center gap-1 mt-4 text-xs justify-center">
              <span>少</span>
              <div className="w-4 h-4 rounded-sm bg-[#ebedf0]"></div>
              <div className="w-4 h-4 rounded-sm bg-[#9be9a8]"></div>
              <div className="w-4 h-4 rounded-sm bg-[#40c463]"></div>
              <div className="w-4 h-4 rounded-sm bg-[#30a14e]"></div>
              <div className="w-4 h-4 rounded-sm bg-[#216e39]"></div>
              <span>多</span>
            </div>
            
            {/* 選択された日の詳細 */}
            {selectedDay && selectedDay.entries.length > 0 && (
              <div className="mt-4 p-3 border rounded-md w-full">
                <h3 className="font-medium">{formatDate(selectedDay.date)}の活動</h3>
                <p className="text-sm text-gray-600">{selectedDay.totalPoints}ポイント獲得、{selectedDay.completedTasks}タスク完了</p>
                
                <ul className="mt-2 space-y-1">
                  {selectedDay.entries.map((entry, i) => (
                    <li key={`entry-${i}`} className="text-sm">
                      <span className={`mr-1 ${entry.completed ? 'text-green-600' : 'text-gray-500'}`}>
                        {entry.completed ? '✓' : '◯'}
                      </span>
                      <span className="font-medium">{entry.taskTitle}</span>
                      {entry.points > 0 && <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">{entry.points}pt</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}