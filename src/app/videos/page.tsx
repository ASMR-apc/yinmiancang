"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MOCK_VIDEOS, VIDEO_CATEGORIES } from "@/lib/constants";
import { VideoCard } from "@/components/videos/VideoCard";

/**
 * 视频库页：搜索 + 分类筛选 + 网格卡片
 */
export default function VideosPage() {
  const [category, setCategory] = useState<string>("全部");
  const [keyword, setKeyword] = useState("");

  const videos = useMemo(() => {
    let list = MOCK_VIDEOS;
    if (category !== "全部") {
      list = list.filter((v) => v.category === category);
    }
    const kw = keyword.trim().toLowerCase();
    if (kw) {
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(kw) ||
          v.description?.toLowerCase().includes(kw) ||
          v.tags.some((t) => t.toLowerCase().includes(kw))
      );
    }
    return list;
  }, [category, keyword]);

  return (
    <div className="py-6">
      <h1 className="font-display text-2xl font-bold text-text-primary">视频库</h1>
      <p className="mt-1 text-sm text-text-muted">
        氛围视频与呼吸引导，戴耳机体验更佳。
      </p>

      {/* 搜索框 */}
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索视频标题、标签…"
          className="w-full rounded-full border border-border bg-bg-soft/60 py-2.5 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-clay focus:outline-none"
        />
      </div>

      {/* 分类筛选 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {VIDEO_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
              category === c
                ? "bg-clay text-bg-deep"
                : "bg-bg-soft text-text-secondary hover:bg-bg-soft/80"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 视频网格 */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>

      {videos.length === 0 && (
        <p className="mt-10 text-center text-sm text-text-muted">
          没有找到相关视频
        </p>
      )}
    </div>
  );
}
