"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HistoryState {
  /** 最近播放的曲目 id，最新在前 */
  ids: string[];
  /** 记录一次播放（去重 + 置顶 + 上限裁剪） */
  record: (id: string) => void;
  /** 清空历史 */
  clear: () => void;
}

const MAX_HISTORY = 20;

/**
 * 播放历史 store（持久化到 localStorage）
 * 仅存 id 列表，展示时再去 MOCK_TRACKS 查详情
 */
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      ids: [],
      record: (id) =>
        set((s) => {
          const next = [id, ...s.ids.filter((x) => x !== id)].slice(
            0,
            MAX_HISTORY,
          );
          return { ids: next };
        }),
      clear: () => set({ ids: [] }),
    }),
    { name: "ymc-history" },
  ),
);
