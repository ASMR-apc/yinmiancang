"use client";

import Link from "next/link";
import { Play, Pause, Volume2, VolumeX, ChevronDown } from "lucide-react";
import { usePlayerStore } from "@/store/player";
import { useMixStore } from "@/store/mix";
import { formatTime } from "@/lib/utils";
import { MixPanel } from "@/components/player/MixPanel";
import { SleepTimerButton } from "@/components/player/SleepTimerButton";
import { SpatialToggle } from "@/components/player/SpatialToggle";

/**
 * 沉浸播放页：大封面、大进度、播放控制、混音面板
 * 无曲目时引导前往声音库
 */
export default function PlayerPage() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const seek = usePlayerStore((s) => s.seek);
  const setVolume = usePlayerStore((s) => s.setVolume);

  const layerCount = useMixStore((s) => Object.keys(s.layers).length);

  if (!currentTrack) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="text-5xl">🎧</div>
        <h2 className="mt-4 font-display text-xl font-semibold text-text-primary">
          还没有在播放的声音
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          去声音库挑一首，开启今晚的疗愈时光。
        </p>
        <Link
          href="/sounds"
          className="mt-6 rounded-full bg-clay px-5 py-2 text-sm font-medium text-bg-deep"
        >
          前往声音库
        </Link>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* 返回 */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary"
      >
        <ChevronDown className="h-4 w-4 rotate-90" />
        返回
      </Link>

      {/* 大封面 */}
      <div className="mt-6 flex flex-col items-center">
        <div className="relative h-64 w-64 overflow-hidden rounded-3xl bg-gradient-to-br from-clay/30 to-sage/20 shadow-2xl shadow-black/40">
          <div className="absolute inset-0 flex items-center justify-center text-7xl">
            🎵
          </div>
        </div>

        <h1 className="mt-6 font-display text-2xl font-bold text-text-primary">
          {currentTrack.title}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {currentTrack.category}
          {layerCount > 0 && ` · ${layerCount} 轨混音`}
        </p>
      </div>

      {/* 大进度条 */}
      <div className="mx-auto mt-8 max-w-md">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={1}
          value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-bg-soft accent-clay"
          aria-label="播放进度"
        />
        <div className="mt-2 flex justify-between text-xs tabular-nums text-text-muted">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 定时 + 8D */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <SleepTimerButton />
        <SpatialToggle />
      </div>

      {/* 播放控制 */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          onClick={() => setVolume(volume > 0 ? 0 : 0.5)}
          className="text-text-muted hover:text-text-primary"
          aria-label={volume > 0 ? "静音" : "取消静音"}
        >
          {volume > 0 ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </button>

        <button
          onClick={() => togglePlay()}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-clay text-bg-deep shadow-lg shadow-clay/30 transition-transform hover:scale-105 active:scale-95"
          aria-label={isPlaying ? "暂停" : "播放"}
        >
          {isPlaying ? (
            <Pause className="h-7 w-7" />
          ) : (
            <Play className="h-7 w-7 translate-x-1" />
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

      {/* 混音面板 */}
      <div className="mt-10">
        <MixPanel />
      </div>
    </div>
  );
}
