"use client";

import Link from "next/link";
import { Heart, Play, Link2, FileVideo, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn, formatTime } from "@/lib/utils";
import { useFavoriteStore } from "@/store/favorites";
import type { VideoItem } from "@/types";

/** 来源类型标签配置 */
const SOURCE_LABEL: Record<VideoItem["sourceType"], { label: string; icon: typeof Sparkles }> = {
  synth: { label: "合成", icon: Sparkles },
  embed: { label: "嵌入", icon: Link2 },
  file: { label: "MP4", icon: FileVideo },
};

export function VideoCard({ video }: { video: VideoItem }) {
  const isFav = useFavoriteStore((s) => s.ids.includes(video.id));
  const toggleFav = useFavoriteStore((s) => s.toggle);
  const source = SOURCE_LABEL[video.sourceType];
  const SourceIcon = source.icon;

  // coverUrl 可能是 Tailwind 渐变类或 http(s) 图片 URL
  const isImageCover = video.coverUrl.startsWith("http");

  return (
    <Link href={`/videos/${video.id}`} className="group block">
      <Card className="relative overflow-hidden p-0 transition-transform hover:scale-[1.02]">
        {/* 封面 */}
        <div
          className={cn(
            "relative aspect-video w-full",
            isImageCover ? "bg-bg-soft" : `bg-gradient-to-br ${video.coverUrl}`
          )}
        >
          {isImageCover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.coverUrl}
              alt={video.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )}
          {/* 悬停播放遮罩 */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-clay">
              <Play className="h-5 w-5 translate-x-0.5" />
            </div>
          </div>
          {/* 分类标签 */}
          <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur">
            {video.category}
          </span>
          {/* 来源标签 */}
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur">
            <SourceIcon className="h-3 w-3" />
            {source.label}
          </span>
          {/* 时长 */}
          {video.duration > 0 && (
            <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
              {formatTime(video.duration)}
            </span>
          )}
          {/* 收藏按钮 */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFav(video.id);
            }}
            className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-clay"
            aria-label={isFav ? "取消收藏" : "收藏"}
          >
            <Heart
              className={cn("h-3.5 w-3.5", isFav && "fill-red-500 text-red-500")}
            />
          </button>
        </div>
        {/* 信息 */}
        <div className="p-3">
          <p className="truncate text-sm font-medium text-text-primary">
            {video.title}
          </p>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-text-muted">
            {video.description}
          </p>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[10px] text-text-muted">
              {video.author ? `${video.author} · ` : ""}
              {video.views ? `${video.views.toLocaleString()} 次观看` : ""}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
