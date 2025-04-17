"use client";
import React from "react";

interface DebugControlsProps {
  isDebugMode: boolean;
  toggleDebugMode: () => void;
  advanceTime: (hours: number) => void;
}

export function DebugControls({ isDebugMode, toggleDebugMode, advanceTime }: DebugControlsProps) {
  return (
    <div className="mt-8 p-4 border rounded">
      <h2 className="text-xl font-semibold mb-2">デバッグモード</h2>
      <button
        onClick={toggleDebugMode}
        className="mb-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        {isDebugMode ? 'デバッグモードをオフ' : 'デバッグモードをオン'}
      </button>
      {isDebugMode && (
        <div className="space-x-2">
          <button
            onClick={() => advanceTime(1)}
            className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
          >
            1時間進める
          </button>
          <button
            onClick={() => advanceTime(24)}
            className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
          >
            1日進める
          </button>
          <button
            onClick={() => advanceTime(24 * 7)}
            className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
          >
            1週間進める
          </button>
          <button
            onClick={() => advanceTime(24 * 30)}
            className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
          >
            1ヶ月進める
          </button>
        </div>
      )}
    </div>
  );
}