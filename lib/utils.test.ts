import { describe, it, expect } from "vitest";
import { formatTaskValue, formatDateTime, toSeconds } from "./utils";
import { TaskUnit } from "@/types/task";

describe("formatTaskValue", () => {
  it("should format seconds", () => {
    expect(formatTaskValue(45, "秒")).toBe("45秒");
  });
  it("should format minutes", () => {
    expect(formatTaskValue(120, "分")).toBe("2分");
    expect(formatTaskValue(125, "分")).toBe("2分5秒");
  });
  it("should format hours", () => {
    expect(formatTaskValue(3600, "時間")).toBe("1時間");
    expect(formatTaskValue(3660, "時間")).toBe("1時間1分");
    expect(formatTaskValue(3671, "時間")).toBe("1時間1分11秒");
  });
  it("should format other units", () => {
    expect(formatTaskValue(3, "回")).toBe("3回");
    expect(formatTaskValue(10, "ページ")).toBe("10ページ");
    expect(formatTaskValue(5, "km")).toBe("5km");
  });
});

describe("formatTaskValue (境界・異常値)", () => {
  it("should handle 0 seconds/minutes/hours", () => {
    expect(formatTaskValue(0, "秒")).toBe("0秒");
    expect(formatTaskValue(0, "分")).toBe("0分");
    expect(formatTaskValue(0, "時間")).toBe("0時間");
  });
  it("should handle 59 seconds as minutes", () => {
    expect(formatTaskValue(59, "分")).toBe("0分59秒");
  });
  it("should handle 60 seconds as 1 minute", () => {
    expect(formatTaskValue(60, "分")).toBe("1分");
  });
  it("should handle 3599 seconds as 59分59秒", () => {
    expect(formatTaskValue(3599, "時間")).toBe("0時間59分59秒");
  });
  it("should handle negative values", () => {
    expect(formatTaskValue(-5, "秒")).toBe("-5秒");
    expect(formatTaskValue(-120, "分")).toBe("-2分");
  });
  it("should handle very large values", () => {
    expect(formatTaskValue(360000, "秒")).toBe("360000秒");
    expect(formatTaskValue(360000, "分")).toMatch(/\d+分(\d+秒)?/);
    expect(formatTaskValue(360000, "時間")).toMatch(/\d+時間(\d+分)?(\d+秒)?/);
  });
  it("should handle unknown unit", () => {
    expect(formatTaskValue(7, "unknown" as TaskUnit)).toBe("7unknown");
  });
});

describe("formatDateTime", () => {
  it("should format timestamp to YYYY/MM/DD HH:mm", () => {
    const date = new Date(2025, 4, 30, 15, 7); // 2025-05-30 15:07
    expect(formatDateTime(date.getTime())).toBe("2025/05/30 15:07");
  });
});

describe("formatDateTime (境界・異常値)", () => {
  it("should handle 0 (epoch)", () => {
    expect(formatDateTime(0)).toBe("1970/01/01 09:00"); // JST
  });
  it("should handle far future date", () => {
    const date = new Date(3000, 0, 1, 0, 0);
    expect(formatDateTime(date.getTime())).toMatch(/^3000\/01\/01/);
  });
  it("should handle negative timestamp (before epoch)", () => {
    expect(formatDateTime(-1000000000)).toMatch(/19\d\d/);
  });
});

describe("toSeconds", () => {
  it("should convert minutes to seconds", () => {
    expect(toSeconds(2, "分")).toBe(120);
  });
  it("should convert hours to seconds", () => {
    expect(toSeconds(1, "時間")).toBe(3600);
  });
  it("should return value for other units", () => {
    expect(toSeconds(5, "回")).toBe(5);
    expect(toSeconds(10, "ページ")).toBe(10);
  });
});

describe("toSeconds (境界・異常値)", () => {
  it("should handle 0", () => {
    expect(toSeconds(0, "分")).toBe(0);
    expect(toSeconds(0, "時間")).toBe(0);
    expect(toSeconds(0, "回")).toBe(0);
  });
  it("should handle negative values", () => {
    expect(toSeconds(-2, "分")).toBe(-120);
    expect(toSeconds(-1, "時間")).toBe(-3600);
    expect(toSeconds(-5, "回")).toBe(-5);
  });
  it("should handle very large values", () => {
    expect(toSeconds(1000000, "分")).toBe(60000000);
    expect(toSeconds(1000000, "時間")).toBe(3600000000);
  });
  it("should handle unknown unit", () => {
    expect(toSeconds(42, "unknown" as TaskUnit)).toBe(42);
  });
});
