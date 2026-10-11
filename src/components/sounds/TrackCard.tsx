"use client";

import { Play, Pause, Heart, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Track } from "@/types";
import { usePlayerStore } from "@/store/player";
import { useFavoriteStore } from "@/store/favorites";
import { useMixStore } from "@/store/mix";
import { cn } from "@/lib/utils";

interface TrackCardProps {
  track: Track;
}

/**
 * 音频卡片：播放/暂停、收藏、加入混音
 * 正在播放的曲目显示暂停态与高亮边框
 */
export function TrackCard({ track }: TrackCardProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setTrack = usePlayerStore((s) => s.setTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const isFav = useFavoriteStore((s) => s.has(track.id));
  const toggleFav = useFavoriteStore((s) => s.toggle);

  const hasLayer = useMixStore((s) => !!s.layers[track.id]);
  const addLayer = useMixStore((s) => s.addLayer);
  const removeLayer = useMixStore((s) => s.removeLayer);

  const isCurrent = currentTrack?.id === track.id;
  const active = isCurrent && isPlaying;

  return (
    <Card
      className={cn(
        "flex flex-col gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5",
        isCurrent && "border-clay/50",
      )}
    >
      <div className="flex items-start gap-3">
        {/* 封面 */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-clay/30 to-sage/20">
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            {trackEmoji(track.category)}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display font-semibold text-text-primary">
            {track.title}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">
            {track.description}
          </p>
        </div>

        {/* 收藏 */}
        <button
          onClick={() => toggleFav(track.id)}
          aria-label={isFav ? "取消收藏" : "收藏"}
          className={cn(
            "shrink-0 transition-colors",
            isFav ? "text-clay" : "text-text-muted hover:text-clay",
          )}
        >
          <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
        </button>
      </div>

      {/* 标签 */}
      <div className="flex flex-wrap gap-1.5">
        {track.tags.slice(0, 3).map((t) => (
          <Badge key={t} variant="secondary">
            {t}
          </Badge>
        ))}
      </div>

      {/* 操作 */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => (isCurrent ? togglePlay() : setTrack(track))}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            active
              ? "bg-clay text-bg-deep"
              : "bg-card-strong text-text-primary hover:bg-bg-soft",
          )}
          aria-label={active ? "暂停" : "播放"}
        >
          {active ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 translate-x-px" />
          )}
          {active ? "暂停" : "播放"}
        </button>

        <button
          onClick={() => (hasLayer ? removeLayer(track.id) : addLayer(track))}
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs transition-colors",
            hasLayer
              ? "bg-sage/20 text-sage"
              : "text-text-muted hover:text-text-secondary",
          )}
          aria-label={hasLayer ? "移出混音" : "加入混音"}
        >
          <Layers className="h-3.5 w-3.5" />
          {hasLayer ? "已加入" : "混音"}
        </button>
      </div>
    </Card>
  );
}

/** 按分类返回封面 emoji */
function trackEmoji(category: string): string {
  switch (category) {
    case "自然":
      return "🌿";
    case "环境":
      return "🏠";
    case "ASMR":
      return "🎧";
    case "冥想":
      return "🧘";
    case "白噪音":
      return "🌫️";
    default:
      return "🎵";
  }
}
