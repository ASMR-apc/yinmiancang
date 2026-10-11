"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  ListMusic,
  History,
  Play,
  Trash2,
  Settings,
  Sparkles,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { MOCK_TRACKS } from "@/lib/constants";
import { useFavoriteStore } from "@/store/favorites";
import { useFormulaStore } from "@/store/formulas";
import { useHistoryStore } from "@/store/history";
import { usePlayerStore } from "@/store/player";
import { useMixStore } from "@/store/mix";
import type { Track } from "@/types";

type TabKey = "favorites" | "formulas" | "history";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "favorites", label: "收藏", icon: <Heart className="h-4 w-4" /> },
  { key: "formulas", label: "配方", icon: <ListMusic className="h-4 w-4" /> },
  { key: "history", label: "最近", icon: <History className="h-4 w-4" /> },
];

/** id → Track 快速查表 */
const TRACK_MAP: Record<string, Track> = MOCK_TRACKS.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {},
);

export default function ProfilePage() {
  const [tab, setTab] = useState<TabKey>("favorites");

  const favoriteIds = useFavoriteStore((s) => s.ids);
  const toggleFavorite = useFavoriteStore((s) => s.toggle);
  const formulas = useFormulaStore((s) => s.formulas);
  const deleteFormula = useFormulaStore((s) => s.deleteFormula);
  const historyIds = useHistoryStore((s) => s.ids);

  const setTrack = usePlayerStore((s) => s.setTrack);
  const applyFormula = useMixStore((s) => s.applyFormula);

  const favTracks = favoriteIds
    .map((id) => TRACK_MAP[id])
    .filter(Boolean) as Track[];
  const historyTracks = historyIds
    .map((id) => TRACK_MAP[id])
    .filter(Boolean) as Track[];

  const playTrack = (track: Track) => setTrack(track);

  return (
    <div className="py-6">
      {/* 用户头部 */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-clay/40 to-sage/30 text-3xl shadow-inner">
          🌙
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold text-text-primary">
            夜旅人
          </h1>
          <p className="text-xs text-text-muted">
            愿每一夜都温柔入梦 · 已陪伴 {formulas.length + favTracks.length} 个声音
          </p>
        </div>
        <Link
          href="/settings"
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-bg-soft text-text-muted hover:text-text-primary"
          aria-label="设置"
        >
          <Settings className="h-4 w-4" />
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <Card className="flex flex-col items-center p-3">
          <Heart className="h-4 w-4 text-clay" />
          <p className="mt-1 text-lg font-bold text-text-primary">
            {favTracks.length}
          </p>
          <p className="text-[11px] text-text-muted">收藏</p>
        </Card>
        <Card className="flex flex-col items-center p-3">
          <ListMusic className="h-4 w-4 text-sage" />
          <p className="mt-1 text-lg font-bold text-text-primary">
            {formulas.length}
          </p>
          <p className="text-[11px] text-text-muted">配方</p>
        </Card>
        <Card className="flex flex-col items-center p-3">
          <Clock className="h-4 w-4 text-milk" />
          <p className="mt-1 text-lg font-bold text-text-primary">
            {historyTracks.length}
          </p>
          <p className="text-[11px] text-text-muted">最近播放</p>
        </Card>
      </div>

      {/* Tab 切换 */}
      <div className="mt-6 flex gap-1 rounded-full bg-bg-soft/60 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm transition-colors ${
              tab === t.key
                ? "bg-clay text-bg-deep"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <div className="mt-4 space-y-2">
        {tab === "favorites" && (
          <>
            {favTracks.length === 0 ? (
              <EmptyState
                icon={<Heart className="h-8 w-8" />}
                text="还没有收藏的声音"
                hint="去声音库点个心，把喜欢的留在这里"
              />
            ) : (
              favTracks.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  onPlay={() => playTrack(track)}
                  trailing={
                    <button
                      onClick={() => toggleFavorite(track.id)}
                      className="text-clay hover:scale-110"
                      aria-label="取消收藏"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  }
                />
              ))
            )}
          </>
        )}

        {tab === "formulas" && (
          <>
            {formulas.length === 0 ? (
              <EmptyState
                icon={<Sparkles className="h-8 w-8" />}
                text="还没有入睡配方"
                hint="在沉浸播放页混音后保存，一键还原你的专属氛围"
              />
            ) : (
              formulas.map((f) => (
                <Card key={f.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage/15 text-sage">
                      <ListMusic className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {f.name}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {f.tracks.length} 轨 ·{" "}
                        {new Date(f.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => applyFormula(f.tracks, TRACK_MAP)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-clay text-bg-deep hover:scale-105"
                      aria-label="应用配方"
                      title="应用配方"
                    >
                      <Play className="h-4 w-4 translate-x-px" />
                    </button>
                    <button
                      onClick={() => deleteFormula(f.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-soft text-text-muted hover:text-clay"
                      aria-label="删除配方"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </>
        )}

        {tab === "history" && (
          <>
            {historyTracks.length === 0 ? (
              <EmptyState
                icon={<History className="h-8 w-8" />}
                text="还没有播放记录"
                hint="播放过的声音会自动出现在这里"
              />
            ) : (
              historyTracks.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  onPlay={() => playTrack(track)}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** 曲目行 */
function TrackRow({
  track,
  onPlay,
  trailing,
}: {
  track: Track;
  onPlay: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <Card className="flex items-center gap-3 p-2.5">
      <button
        onClick={onPlay}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-clay/15 text-clay hover:bg-clay hover:text-bg-deep"
        aria-label={`播放 ${track.title}`}
      >
        <Play className="h-4 w-4 translate-x-px" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-text-primary">{track.title}</p>
        <p className="truncate text-[11px] text-text-muted">
          {track.category}
        </p>
      </div>
      {trailing}
    </Card>
  );
}

/** 空状态 */
function EmptyState({
  icon,
  text,
  hint,
}: {
  icon: React.ReactNode;
  text: string;
  hint: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-2 py-10 text-center">
      <div className="text-text-muted/60">{icon}</div>
      <p className="text-sm text-text-secondary">{text}</p>
      <p className="text-xs text-text-muted">{hint}</p>
    </Card>
  );
}
