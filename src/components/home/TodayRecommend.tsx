"use client";

import { Play, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "./SectionTitle";
import { AnimatedSection } from "./AnimatedSection";
import { MOCK_TRACKS } from "@/lib/constants";
import { usePlayerStore } from "@/store/player";

/**
 * 今日推荐：大卡片展示主推曲目
 */
export function TodayRecommend() {
  const track = MOCK_TRACKS[0];
  const setTrack = usePlayerStore((s) => s.setTrack);

  return (
    <section className="mb-8">
      <SectionTitle title="今日推荐" subtitle="为今夜精选" />
      <AnimatedSection delay={0.05}>
      <Card className="overflow-hidden">
        <div className="flex gap-4 p-4">
          {/* 封面占位 */}
          <div className="relative h-24 w-24 shrink-0 rounded-lg bg-gradient-to-br from-clay/40 to-sage/30">
            <div className="absolute inset-0 flex items-center justify-center text-3xl">
              🌧️
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold text-text-primary">
                  {track.title}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-sm text-text-secondary">
                  {track.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="收藏"
                className="text-text-muted hover:text-clay"
              >
                <Heart />
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {track.tags.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
            <div className="mt-auto flex items-center gap-2 pt-3">
              <Button size="sm" className="gap-1.5" onClick={() => setTrack(track)}>
                <Play className="h-4 w-4" />
                播放
              </Button>
              <span className="text-xs text-text-muted">{track.category}</span>
            </div>
          </div>
        </div>
      </Card>
      </AnimatedSection>
    </section>
  );
}
