"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MixFormula } from "@/types";

interface FormulaState {
  formulas: MixFormula[];
  saveFormula: (name: string, layers: { trackId: string; volume: number }[]) => void;
  deleteFormula: (id: string) => void;
}

/**
 * 入睡配方 store（持久化到 localStorage）
 * 配方 = 一组背景音图层及其音量
 */
export const useFormulaStore = create<FormulaState>()(
  persist(
    (set) => ({
      formulas: [],
      saveFormula: (name, layers) =>
        set((s) => ({
          formulas: [
            ...s.formulas,
            {
              id: `f-${Date.now()}`,
              name,
              tracks: layers,
              createdAt: Date.now(),
            },
          ],
        })),
      deleteFormula: (id) =>
        set((s) => ({
          formulas: s.formulas.filter((f) => f.id !== id),
        })),
    }),
    { name: "ymc-formulas" },
  ),
);
