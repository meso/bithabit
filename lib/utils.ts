import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TaskUnit } from "@/types/task";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 進捗値や目標値を単位に応じてフォーマット
 */
export function formatTaskValue(value: number, unit: TaskUnit): string {
  switch (unit) {
    case "秒":
      return `${value}秒`;
    case "分": {
      const minutes = Math.floor(value / 60);
      const seconds = value % 60;
      return seconds === 0 ? `${minutes}分` : `${minutes}分${seconds}秒`;
    }
    case "時間": {
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      const seconds = value % 60;
      if (seconds === 0) {
        if (minutes === 0) return `${hours}時間`;
        return `${hours}時間${minutes}分`;
      }
      return `${hours}時間${minutes}分${seconds}秒`;
    }
    default:
      return `${value}${unit}`;
  }
}

/**
 * 日付（タイムスタンプ）を「YYYY/MM/DD HH:mm」形式でフォーマット
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

/**
 * 単位と値から秒数へ変換
 */
export function toSeconds(value: number, unit: TaskUnit): number {
  switch (unit) {
    case "分":
      return value * 60;
    case "時間":
      return value * 3600;
    default:
      return value;
  }
}
