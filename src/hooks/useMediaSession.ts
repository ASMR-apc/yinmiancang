"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/store/player";

/**
 * 集成 Media Session API：锁屏/控制中心显示曲目信息并响应媒体按键
 * 仅在浏览器支持时启用，不影响核心播放链路
 */
export function useMediaSession() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const seek = usePlayerStore((s) => s.seek);
  const currentTime = usePlayerStore((s) => s.currentTime);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaSession) return;

    if (currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: "音眠舱",
        album: currentTrack.category,
        artwork: currentTrack.coverUrl
          ? [{ src: currentTrack.coverUrl, sizes: "512x512", type: "image/png" }]
          : [],
      });
    }

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

    // 更新进度（部分浏览器支持）
    if ("setPositionState" in navigator.mediaSession) {
      const duration = currentTrack?.duration || 0;
      if (duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration,
            playbackRate: 1,
            position: currentTime,
          });
        } catch {
          /* 忽略不支持的浏览器 */
        }
      }
    }
  }, [currentTrack, isPlaying, currentTime]);

  // 媒体按键动作
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaSession) return;
    const ms = navigator.mediaSession;

    const handlers: MediaSessionActionHandler = () => {
      togglePlay();
    };
    ms.setActionHandler("play", handlers);
    ms.setActionHandler("pause", handlers);
    ms.setActionHandler("stop", () => {
      // 停止：淡出逻辑由 togglePlay 处理，这里直接调用暂停
      togglePlay();
    });
    ms.setActionHandler("seekbackward", (details) => {
      const delta = details.seekOffset ?? 10;
      seek(Math.max(0, currentTime - delta));
    });
    ms.setActionHandler("seekforward", (details) => {
      const delta = details.seekOffset ?? 10;
      seek(currentTime + delta);
    });
    ms.setActionHandler("seekto", (details) => {
      if (details.seekTime != null) seek(details.seekTime);
    });

    return () => {
      (["play", "pause", "stop", "seekbackward", "seekforward", "seekto"] as const).forEach(
        (a) => ms.setActionHandler(a, null),
      );
    };
  }, [togglePlay, seek, currentTime]);
}
