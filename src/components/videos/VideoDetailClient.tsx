"use client";

import { notFound, useParams } from "next/navigation";
import { ChevronDown, Heart, Eye, Calendar } from "lucide-react";
import Link from "next/link";
import { MOCK_VIDEOS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { AmbientVideo, type VideoAnimType } from "@/components/videos/AmbientVideo";
import { useFavoriteStore } from "@/store/favorites";
import { cn, formatTime } from "@/lib/utils";

/** 判断是否为 Canvas 合成动画视频 */
function isSynthVideo(url: string): boolean {
  return url.startsWith("synth:");
}

/** 判断是否为 iframe 嵌入视频 */
function isEmbedVideo(url: string): boolean {
  return url.startsWith("embed:");
}

/** 从 synth:xxx 解析动画类型 */
function parseVideoType(url: string): VideoAnimType {
  return url.slice("synth:".length) as VideoAnimType;
}

/** 从 embed:xxx 提取嵌入地址 */
function parseEmbedUrl(url: string): string {
  return url.slice("embed:".length);
}

/**
 * 视频详情页内容（客户端组件）
 */
export function VideoDetailClient() {
  const params = useParams();
  const id = params?.id as string;
  const video = MOCK_VIDEOS.find((v) => v.id === id);

  if (!video) {
    notFound();
  }

  const isFav = useFavoriteStore((s) => s.ids.includes(video.id));
  const toggleFav = useFavoriteStore((s) => s.toggle);

  const renderPlayer = () => {
    if (video.sourceType === "synth" || isSynthVideo(video.videoUrl)) {
      return (
        <AmbientVideo
          type={parseVideoType(video.videoUrl)}
          className="aspect-video w-full bg-black"
        />
      );
    }
    if (video.sourceType === "embed" || isEmbedVideo(video.videoUrl)) {
      const src = parseEmbedUrl(video.videoUrl);
      return (
        <iframe
          key={video.id}
          src={src}
          allowFullScreen
          allow="encrypted-media; fullscreen; picture-in-picture"
          scrolling="no"
          frameBorder={0}
          className="aspect-video w-full bg-black"
        />
      );
    }
    return (
      <video
        key={video.id}
        src={video.videoUrl}
        controls
        playsInline
        preload="metadata"
        className="aspect-video w-full bg-black"
      />
    );
  };

  return (
    <div className="py-6">
      <Link
        href="/videos"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary"
      >
        <ChevronDown className="h-4 w-4 rotate-90" />
        返回视频库
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl bg-black">
        {renderPlayer()}
      </div>

      <div className="mt-5">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-xl font-bold text-text-primary">
            {video.title}
          </h1>
          <button
            onClick={() => toggleFav(video.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
              isFav
                ? "border-red-500/40 bg-red-500/10 text-red-400"
                : "border-border bg-bg-soft text-text-secondary hover:bg-bg-soft/80"
            )}
          >
            <Heart className={cn("h-4 w-4", isFav && "fill-red-500 text-red-500")} />
            {isFav ? "已收藏" : "收藏"}
          </button>
        </div>

        <p className="mt-2 text-sm text-text-secondary">{video.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-muted">
          {video.author && (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-clay" />
              {video.author}
            </span>
          )}
          {typeof video.views === "number" && (
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {video.views.toLocaleString()} 次观看
            </span>
          )}
          {video.duration > 0 && <span>时长 {formatTime(video.duration)}</span>}
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {video.createdAt}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {video.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-bg-soft px-2.5 py-1 text-[11px] text-text-muted"
            >
              #{tag}
            </span>
          ))}
        </div>

        <Card className="mt-5 p-4">
          <p className="text-xs leading-relaxed text-text-muted">
            小贴士：睡前观看氛围视频时，建议调低屏幕亮度，配合声音库的白噪音或呼吸引导，让身心慢慢沉静下来。
          </p>
        </Card>
      </div>
    </div>
  );
}
