"use client";

import { Clock, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/player";

const PRESETS = [15, 30, 45, 60, 90];

/**
 * 睡眠定时按钮：点击展开预设，显示剩余倒计时；到点自动淡出暂停
 */
export function SleepTimerButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  const sleepTimerEndAt = usePlayerStore((s) => s.sleepTimerEndAt);
  const setSleepTimer = usePlayerStore((s) => s.setSleepTimer);

  // 每秒刷新倒计时显示
  useEffect(() => {
    if (!sleepTimerEndAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [sleepTimerEndAt]);

  const remaining = sleepTimerEndAt ? Math.max(0, sleepTimerEndAt - now) : 0;
  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);
  const active = sleepTimerEndAt != null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs transition-colors ${
          active
            ? "bg-clay/20 text-clay"
            : "text-text-muted hover:text-text-primary"
        }`}
        aria-label="睡眠定时"
        title={active ? `剩余 ${mm}:${String(ss).padStart(2, "0")}` : "睡眠定时"}
      >
        <Clock className="h-4 w-4" />
        {active && !compact && (
          <span className="tabular-nums">
            {mm}:{String(ss).padStart(2, "0")}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-40 mt-1 w-40 rounded-2xl border border-border/50 bg-bg-card/95 p-2 shadow-xl backdrop-blur">
            <p className="px-2 py-1 text-[11px] text-text-muted">定时关闭</p>
            {PRESETS.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setSleepTimer(m);
                  setOpen(false);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-soft"
              >
                {m} 分钟
              </button>
            ))}
            {active && (
              <button
                onClick={() => {
                  setSleepTimer(null);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-clay hover:bg-bg-soft"
              >
                <X className="h-4 w-4" />
                取消定时
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
