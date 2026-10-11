"use client";

import { create } from "zustand";
import { mixEngine } from "@/lib/audio/mixEngine";
import type { Track } from "@/types";

export interface MixLayerState {
  track: Track;
  volume: number;
}

interface MixState {
  layers: Record<string, MixLayerState>;
  isPlaying: boolean;
  addLayer: (track: Track) => void;
  removeLayer: (trackId: string) => void;
  setLayerVolume: (trackId: string, volume: number) => void;
  /** 清空现有图层并加载配方的多轨音量 */
  applyFormula: (
    tracks: { trackId: string; volume: number }[],
    trackLookup: Record<string, Track>,
  ) => void;
  clear: () => void;
  setPlaying: (playing: boolean) => void;
}

/** 背景图层默认音量 */
const DEFAULT_LAYER_VOLUME = 0.5;

/**
 * 混音 store
 * - 管理多轨背景图层及独立音量
 * - 与主播放器（playerStore）解耦：主轨负责前景+进度+锁屏，背景图层负责氛围
 */
export const useMixStore = create<MixState>((set, get) => ({
  layers: {},
  isPlaying: false,

  addLayer: (track) => {
    const { layers } = get();
    if (layers[track.id]) return;
    mixEngine.addLayer(track.id, track.audioUrl, DEFAULT_LAYER_VOLUME);
    set({
      layers: {
        ...layers,
        [track.id]: { track, volume: DEFAULT_LAYER_VOLUME },
      },
    });
  },

  removeLayer: (trackId) => {
    const { layers } = get();
    if (!layers[trackId]) return;
    mixEngine.removeLayer(trackId);
    const next = { ...layers };
    delete next[trackId];
    set({ layers: next });
  },

  setLayerVolume: (trackId, volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    mixEngine.setLayerVolume(trackId, clamped);
    set((s) => ({
      layers: {
        ...s.layers,
        [trackId]: { ...s.layers[trackId], volume: clamped },
      },
    }));
  },

  applyFormula: (tracks, trackLookup) => {
    mixEngine.stopAll();
    const next: Record<string, MixLayerState> = {};
    tracks.forEach(({ trackId, volume }) => {
      const track = trackLookup[trackId];
      if (!track) return;
      const vol = Math.max(0, Math.min(1, volume));
      mixEngine.addLayer(track.id, track.audioUrl, vol);
      next[track.id] = { track, volume: vol };
    });
    set({ layers: next, isPlaying: true });
    mixEngine.playAll();
  },

  clear: () => {
    mixEngine.stopAll();
    set({ layers: {}, isPlaying: false });
  },

  setPlaying: (playing) => {
    set({ isPlaying: playing });
    if (playing) mixEngine.playAll();
    else mixEngine.pauseAll();
  },
}));
