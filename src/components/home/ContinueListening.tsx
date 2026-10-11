"use client";

import { Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "./SectionTitle";
import { AnimatedSection } from "./AnimatedSection";
import { MOCK_TRACKS } from "@/lib/constants";
import { formatTime } from "@/lib/utils";
import { usePlayerStore } from "@/store/player";

/**
 * 继续收听：展示上一次播放进度（Phase 1 占位数据）
 */
export function ContinueListening() {
  const track = MOCK_TRACKS[1];
  const progress = 0.42; // 42%
  const setTrack = usePlayerStore((s) => s.setTrack);

  return (
    <section className="mb-8">
      <SectionTitle title="继续收听" subtitle="从上次停下的地方" />
      <AnimatedSection delay={0.15}>
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-milk/30 to-clay/20 text-2xl">
            🔥
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-text-primary">
              {track.title}
            </p>
            <p className="text-xs text-text-muted">
              已听 {formatTime(track.duration * progress)} · {Math.round(progress * 100)}%
            </p>
            {/* 进度条 */}
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-bg-soft">
              <div
                className="h-full rounded-full bg-clay/70"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
          <Button
            size="icon"
            variant="secondary"
            aria-label="继续播放"
            onClick={() => setTrack(track)}
          >
            <Play className="h-5 w-5" />
          </Button>
        </div>
      </Card>
      </AnimatedSection>
    </section>
  );
}
