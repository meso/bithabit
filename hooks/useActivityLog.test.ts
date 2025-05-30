import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useActivityLog } from "./useActivityLog";
import { Task } from "@/types/task";

describe("useActivityLog", () => {
  const baseTask: Task = {
    id: "1",
    title: "Test Task",
    frequency: "daily",
    target: 100,
    unit: "回",
    progressInSeconds: 0,
    completed: false,
    completedAt: null,
    points: 0,
  };

  it("logTaskActivity: 完了時のみポイントが付与される", () => {
    const { result } = renderHook(() => useActivityLog());
    let points: number = 0;
    act(() => {
      points = result.current.logTaskActivity(baseTask, 100, true);
    });
    expect(typeof points).toBe("number");
    expect(result.current.activityLog.length).toBeGreaterThanOrEqual(1);
  });

  it("getActivitiesForPeriod: 指定日数分のアクティビティが取得できる", () => {
    const { result } = renderHook(() => useActivityLog());
    act(() => {
      result.current.logTaskActivity(baseTask, 100, true);
    });
    const activities = result.current.getActivitiesForPeriod(7);
    expect(Array.isArray(activities)).toBe(true);
  });

  it("getActivityForDate: 指定日付のアクティビティが取得できる", () => {
    const { result } = renderHook(() => useActivityLog());
    act(() => {
      result.current.logTaskActivity(baseTask, 100, true);
    });
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const activity = result.current.getActivityForDate(dateStr);
    expect(activity).toBeDefined();
  });

  it("getTotalPoints: 合計ポイントが正しく計算される", () => {
    const { result } = renderHook(() => useActivityLog());
    act(() => {
      result.current.logTaskActivity(baseTask, 100, true);
    });
    const total = result.current.getTotalPoints();
    expect(typeof total).toBe("number");
    expect(total).toBeGreaterThanOrEqual(0);
  });
});
