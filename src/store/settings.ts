"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 本地设置 store（持久化到 localStorage）
 * Phase 1：仅定义字段；设置页 UI 在 Phase 4 补全
 */
interface SettingsState {
  defaultVolume: number; // 默认主音量 0-1
  fadeInSeconds: number; // 淡入时长
  fadeOutSeconds: number; // 淡出时长
  reducedMotion: boolean; // 动效减弱（覆盖系统）
  volumeProtection: boolean; // 音量保护：限制最大音量
  maxVolume: number; // 音量保护上限 0-1
  defaultTimerMinutes: number | null; // 默认睡眠定时（分钟），null 表示不定
  setVolume: (v: number) => void;
  setMaxVolume: (v: number) => void;
  setDefaultTimer: (m: number | null) => void;
  toggleReducedMotion: () => void;
  toggleVolumeProtection: () => void;
  reset: () => void;
}

const DEFAULTS = {
  defaultVolume: 0.4,
  fadeInSeconds: 3,
  fadeOutSeconds: 5,
  reducedMotion: false,
  volumeProtection: true,
  maxVolume: 0.85,
  defaultTimerMinutes: null,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setVolume: (v) => set({ defaultVolume: v }),
      setMaxVolume: (v) => set({ maxVolume: v }),
      setDefaultTimer: (m) => set({ defaultTimerMinutes: m }),
      toggleReducedMotion: () =>
        set((s) => ({ reducedMotion: !s.reducedMotion })),
      toggleVolumeProtection: () =>
        set((s) => ({ volumeProtection: !s.volumeProtection })),
      reset: () => set(DEFAULTS),
    }),
    {
      name: "ymc-settings",
    },
  ),
);
