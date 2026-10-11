"use client";

import Link from "next/link";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerStore } from "@/store/player";
import { useMediaSession } from "@/hooks/useMediaSession";
import { formatTime } from "@/lib/utils";
import { SleepTimerButton } from "@/components/player/SleepTimerButton";
import { SpatialToggle } from "@/components/player/SpatialToggle";

/**
 * 全局底部播放器条
 * - 位于底部导航之上
 * - 无曲目时隐藏
 * - 进度条可点击拖动跳转；音量滑块可调
 */
export function PlayerBar() {
  useMediaSession();

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const seek = usePlayerStore((s) => s.seek);
  const setVolume = usePlayerStore((s) => s.setVolume);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-[4.75rem] z-40 px-4"
        >
          <div className="glass-card mx-auto flex max-w-3xl items-center gap-3 rounded-2xl p-2.5 shadow-lg shadow-black/30">
            {/* 封面 + 标题（点击进入沉浸播放页） */}
            <Link
              href="/player"
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <div className="relative h-11 w-11 shrink-0 rounded-lg bg-gradient-to-br from-clay/40 to-sage/30">
                <div className="absolute inset-0 flex items-center justify-center text-lg">
                  🎵
                </div>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  {currentTrack.title}
                </p>
                <p className="truncate text-xs text-text-muted">
                  {currentTrack.category}
                </p>
              </div>
            </Link>

            {/* 进度条 */}
            <div className="hidden flex-1 items-center gap-2 sm:flex">
              <span className="w-10 text-right text-[11px] tabular-nums text-text-muted">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={1}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-bg-soft accent-clay"
                aria-label="播放进度"
              />
              <span className="w-10 text-[11px] tabular-nums text-text-muted">
                {formatTime(duration)}
              </span>
            </div>

            {/* 定时 + 8D */}
            <div className="flex shrink-0 items-center gap-1">
              <SleepTimerButton compact />
              <SpatialToggle />
            </div>

            {/* 播放/暂停 */}
            <button
              onClick={() => togglePlay()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay text-bg-deep transition-transform hover:scale-105 active:scale-95"
              aria-label={isPlaying ? "暂停" : "播放"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 translate-x-px" />
              )}
            </button>

            {/* 音量控制 */}
            <div className="hidden items-center gap-2 md:flex">
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 0.5)}
                className="text-text-muted hover:text-text-primary"
                aria-label={volume > 0 ? "静音" : "取消静音"}
              >
                {volume > 0 ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-bg-soft accent-clay"
                aria-label="音量"
              />
            </div>
          </div>

          {/* 移动端进度条（单独一行） */}
          <div className="mt-1.5 flex items-center gap-2 sm:hidden">
            <span className="w-9 text-right text-[10px] tabular-nums text-text-muted">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={1}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-bg-soft accent-clay"
              aria-label="播放进度"
            />
            <span className="w-9 text-[10px] tabular-nums text-text-muted">
              {formatTime(duration)}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
