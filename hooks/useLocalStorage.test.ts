import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  it("初期値が取得できる", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", 123));
    expect(result.current[0]).toBe(123);
  });

  it("値が更新できる", () => {
    const { result } = renderHook(() => useLocalStorage("test-key2", 0));
    act(() => result.current[1](42));
    expect(result.current[0]).toBe(42);
  });

  it("関数で値が更新できる", () => {
    const { result } = renderHook(() => useLocalStorage("test-key3", 10));
    act(() => result.current[1](prev => prev + 5));
    expect(result.current[0]).toBe(15);
  });
});
