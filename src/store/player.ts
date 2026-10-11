"use client";

import { create } from "zustand";
import { audioEngine } from "@/lib/audio/engine";
import { spatialController } from "@/lib/audio/spatial";
import { getSynthUrl, isSynthUrl } from "@/lib/audio/synthesizer";
import { useSettingsStore } from "./settings";
import { useMixStore } from "./mix";
import { useHistoryStore } from "./history";
import type { Track } from "@/types";

/** 解析真实播放 URL：synth: 前缀生成 WAV blob，其余原样返回 */
function resolveAudioUrl(url: string): string {
  return isSynthUrl(url) ? getSynthUrl(url.slice("synth:".length) as never) : url;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  /** 用户设定音量（0-1），与引擎实际音量（受淡入淡出影响）分离 */
  volume: number;
  isFading: boolean;

  // 睡眠定时
  sleepTimerMinutes: number | null;
  sleepTimerEndAt: number | null;
  setSleepTimer: (minutes: number | null) => void;

  // 空间音效（8D）
  spatialEnabled: boolean;
  toggleSpatial: () => void;

  // actions
  setTrack: (track: Track) => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  /** 由进度轮询调用，更新当前时间 */
  _syncProgress: () => void;
  _startPolling: () => void;
  _stopPolling: () => void;
  /** 淡出后暂停（供定时关闭调用） */
  _fadeOutAndPause: () => void;
}

// 淡入/淡出时长（毫秒），取自设计规范
const FADE_IN_MS = 3000;
const FADE_OUT_MS = 5000;

// 进度轮询间隔
const POLL_INTERVAL_MS = 250;
let pollTimer: ReturnType<typeof setInterval> | null = null;
// 睡眠定时检查间隔
const SLEEP_CHECK_MS = 1000;
let sleepTimer: ReturnType<typeof setInterval> | null = null;

/**
 * 播放器 store
 * - 真实播放态由引擎事件驱动（play/pause/end），避免"初始化完成即视为播放"的误判
 * - 淡入淡出在引擎层执行，store 只记录用户目标音量
 */
export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  volume: useSettingsStore.getState().defaultVolume,
  isFading: false,
  sleepTimerMinutes: null,
  sleepTimerEndAt: null,
  spatialEnabled: false,

  /** 加载并播放指定曲目 */
  setTrack: async (track: Track) => {
    // 相同曲目：仅切换播放状态
    if (get().currentTrack?.id === track.id) {
      get().togglePlay();
      return;
    }
    set({ isLoading: true, currentTrack: track, currentTime: 0, duration: 0 });

    // 记录到最近播放
    useHistoryStore.getState().record(track.id);

    audioEngine.load(resolveAudioUrl(track.audioUrl), { loop: true });

    // 监听加载完成以获取时长
    const onLoad = () => {
      audioEngine.off("load", onLoad);
      set({ duration: audioEngine.getDuration() });
    };
    audioEngine.on("load", onLoad);

    // 真实播放事件驱动 isPlaying，并同步混音图层播放态
    const onPlay = () => {
      set({ isPlaying: true, isLoading: false });
      useMixStore.getState().setPlaying(true);
    };
    const onPause = () => {
      set({ isPlaying: false });
      useMixStore.getState().setPlaying(false);
    };
    const onStop = () => {
      set({ isPlaying: false });
      useMixStore.getState().setPlaying(false);
    };
    const onEnd = () => {
      set({ isPlaying: false, currentTime: 0 });
      useMixStore.getState().setPlaying(false);
    };
    audioEngine.on("play", onPlay);
    audioEngine.on("pause", onPause);
    audioEngine.on("stop", onStop);
    audioEngine.on("end", onEnd);

    // 切换到新曲目时，音量回到设置中的默认音量
    const defaultVol = useSettingsStore.getState().defaultVolume;
    set({ volume: defaultVol });
    audioEngine.setVolume(0);
    try {
      await audioEngine.play();
      audioEngine.fade(0, defaultVol, FADE_IN_MS);
      get()._startPolling();
    } catch {
      // 被浏览器策略拦截（如非用户交互触发），保持暂停态
      set({ isPlaying: false, isLoading: false });
    }
  },

  /** 播放/暂停切换，带淡出 */
  togglePlay: async () => {
    const { currentTrack, isPlaying, volume } = get();
    if (!currentTrack) return;

    if (isPlaying) {
      // 淡出后暂停
      get()._fadeOutAndPause();
    } else {
      // 淡入恢复
      audioEngine.setVolume(0);
      try {
        await audioEngine.play();
        audioEngine.fade(0, volume, FADE_IN_MS);
        get()._startPolling();
      } catch {
        set({ isPlaying: false });
      }
    }
  },

  seek: (seconds: number) => {
    audioEngine.seek(seconds);
    set({ currentTime: seconds });
  },

  setVolume: (v: number) => {
    const settings = useSettingsStore.getState();
    // 音量保护：开启时限制不超过 maxVolume
    const cap = settings.volumeProtection ? settings.maxVolume : 1;
    const clamped = Math.max(0, Math.min(cap, v));
    set({ volume: clamped });
    // 播放中：快速渐变到新音量；暂停中：直接设置（下次淡入会从 0 到该值）
    if (get().isPlaying) {
      audioEngine.fade(audioEngine.getVolume(), clamped, 300);
    }
  },

  /** 设置/取消睡眠定时；到点后淡出 5s 再暂停 */
  setSleepTimer: (minutes) => {
    if (sleepTimer) {
      clearInterval(sleepTimer);
      sleepTimer = null;
    }
    if (minutes == null) {
      set({ sleepTimerMinutes: null, sleepTimerEndAt: null });
      return;
    }
    const endAt = Date.now() + minutes * 60 * 1000;
    set({ sleepTimerMinutes: minutes, sleepTimerEndAt: endAt });
    sleepTimer = setInterval(() => {
      const { sleepTimerEndAt, isPlaying } = get();
      if (!sleepTimerEndAt) return;
      if (Date.now() >= sleepTimerEndAt) {
        if (sleepTimer) {
          clearInterval(sleepTimer);
          sleepTimer = null;
        }
        set({ sleepTimerMinutes: null, sleepTimerEndAt: null });
        if (isPlaying) get()._fadeOutAndPause();
      }
    }, SLEEP_CHECK_MS);
  },

  /** 切换 8D 空间音效；开启时重新加载为 Web Audio 模式使声相生效 */
  toggleSpatial: () => {
    const { spatialEnabled, currentTrack, isPlaying } = get();
    const next = !spatialEnabled;
    set({ spatialEnabled: next });

    if (next) spatialController.enable();
    else {
      spatialController.disable();
      audioEngine.setPan(0);
    }

    // 有曲目时重载以切换 html5 模式（8D 需 html5:false），并保持播放态
    if (currentTrack) {
      audioEngine.load(resolveAudioUrl(currentTrack.audioUrl), { html5: !next, loop: true });
      if (isPlaying) {
        audioEngine.setVolume(0);
        audioEngine
          .play()
          .then(() => audioEngine.fade(0, get().volume, FADE_IN_MS))
          .catch(() => set({ isPlaying: false }));
      }
    }
  },

  /** 淡出后暂停（供定时关闭与手动暂停复用） */
  _fadeOutAndPause: () => {
    set({ isFading: true });
    audioEngine.fade(audioEngine.getVolume(), 0, FADE_OUT_MS);
    const onFade = () => {
      audioEngine.off("fade", onFade);
      audioEngine.pause();
      set({ isFading: false });
      get()._stopPolling();
    };
    audioEngine.on("fade", onFade);
  },

  _syncProgress: () => {
    if (!get().isPlaying) return;
    set({
      currentTime: audioEngine.getCurrentTime(),
      duration: audioEngine.getDuration() || get().duration,
    });
  },

  _startPolling: () => {
    if (pollTimer) return;
    pollTimer = setInterval(() => get()._syncProgress(), POLL_INTERVAL_MS);
  },

  _stopPolling: () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  },
}));
