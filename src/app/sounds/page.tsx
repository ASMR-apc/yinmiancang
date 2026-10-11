"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TrackCard } from "@/components/sounds/TrackCard";
import { MOCK_TRACKS, CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * 声音库页
 * - 分类筛选、关键词搜索、标签展示
 * - 卡片网格，支持播放/收藏/加入混音
 */
export default function SoundsPage() {
  const [category, setCategory] = useState<string>("全部");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return MOCK_TRACKS.filter((t) => {
      const matchCat = category === "全部" || t.category === category;
      const q = query.trim().toLowerCase();
      const matchQ =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [category, query]);

  return (
    <div className="py-6">
      <h1 className="font-display text-2xl font-bold text-text-primary">
        声音库
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        挑选主音，或叠加多条背景音，调配属于你的入睡配方。
      </p>

      {/* 搜索 */}
      <div className="relative mt-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索声音、标签或描述…"
          className="w-full rounded-xl border border-border bg-card/60 py-2.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-clay/50"
          aria-label="搜索声音"
        />
      </div>

      {/* 分类 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm transition-colors",
              category === cat
                ? "bg-clay text-bg-deep"
                : "bg-card-strong text-text-secondary hover:text-text-primary",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 结果计数 */}
      <p className="mt-4 text-xs text-text-muted">
        共 {filtered.length} 条声音
      </p>

      {/* 卡片网格 */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 text-center text-text-muted">
          没有找到匹配的声音，换个关键词试试。
        </div>
      )}
    </div>
  );
}
