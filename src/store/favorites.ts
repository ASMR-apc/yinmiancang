"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoriteState {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}

/**
 * 收藏 store（持久化到 localStorage）
 * Phase 3 仅做本地收藏；Phase 5 在个人中心展示
 */
export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id)
            ? s.ids.filter((x) => x !== id)
            : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
    }),
    { name: "ymc-favorites" },
  ),
);
