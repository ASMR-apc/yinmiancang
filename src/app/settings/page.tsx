"use client";

import { useState } from "react";
import {
  Volume2,
  Timer,
  Sparkles,
  ShieldCheck,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSettingsStore } from "@/store/settings";

const TIMER_PRESETS: { label: string; value: number | null }[] = [
  { label: "不定时", value: null },
  { label: "15 分", value: 15 },
  { label: "30 分", value: 30 },
  { label: "60 分", value: 60 },
  { label: "90 分", value: 90 },
];

/** 自定义切换开关 */
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-clay" : "bg-bg-soft"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[1.375rem]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/** 设置行容器 */
function Row({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-bg-soft/60 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-clay/10 text-clay">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {desc && <p className="text-xs text-text-muted">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const s = useSettingsStore();
  const [confirmClear, setConfirmClear] = useState(false);

  /** 清除所有 ymc-* 本地数据并重置 */
  const clearAllData = () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("ymc-"))
      .forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <div className="py-6">
      <h1 className="font-display text-2xl font-bold text-text-primary">设置</h1>
      <p className="mt-1 text-sm text-text-muted">
        调整音量、定时、动效与数据，所有偏好仅保存在本机。
      </p>

      {/* 播放 */}
      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          播放
        </h2>
        <div className="space-y-2">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-clay" />
                <span className="text-sm text-text-primary">默认音量</span>
              </div>
              <span className="text-sm tabular-nums text-text-muted">
                {Math.round(s.defaultVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={s.defaultVolume}
              onChange={(e) => s.setVolume(Number(e.target.value))}
              className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-bg-soft accent-clay"
              aria-label="默认音量"
            />
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <Card className="p-4">
              <p className="text-xs text-text-muted">淡入时长</p>
              <p className="mt-1 text-lg font-semibold text-text-primary">
                {s.fadeInSeconds}s
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-text-muted">淡出时长</p>
              <p className="mt-1 text-lg font-semibold text-text-primary">
                {s.fadeOutSeconds}s
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 睡眠定时 */}
      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          睡眠定时
        </h2>
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Timer className="h-4 w-4 text-clay" />
            <span className="text-sm text-text-primary">默认定时</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TIMER_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => s.setDefaultTimer(p.value)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  s.defaultTimerMinutes === p.value
                    ? "bg-clay text-bg-deep"
                    : "bg-bg-soft text-text-secondary hover:bg-bg-soft/80"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </Card>
      </section>

      {/* 显示与动效 */}
      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          显示与动效
        </h2>
        <Row
          icon={<Sparkles className="h-4 w-4" />}
          title="减弱动效"
          desc="减少背景光晕与界面动画，更省电、更舒缓"
        >
          <Toggle
            checked={s.reducedMotion}
            onChange={() => s.toggleReducedMotion()}
          />
        </Row>
      </section>

      {/* 音量保护 */}
      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          音量保护
        </h2>
        <div className="space-y-2">
          <Row
            icon={<ShieldCheck className="h-4 w-4" />}
            title="音量保护"
            desc="限制最大音量，保护听力"
          >
            <Toggle
              checked={s.volumeProtection}
              onChange={() => s.toggleVolumeProtection()}
            />
          </Row>
          {s.volumeProtection && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-primary">最大音量</span>
                <span className="text-sm tabular-nums text-text-muted">
                  {Math.round(s.maxVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.01}
                value={s.maxVolume}
                onChange={(e) => s.setMaxVolume(Number(e.target.value))}
                className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-bg-soft accent-clay"
                aria-label="最大音量"
              />
            </Card>
          )}
        </div>
      </section>

      {/* 数据管理 */}
      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          数据管理
        </h2>
        <div className="space-y-2">
          <Row
            icon={<RotateCcw className="h-4 w-4" />}
            title="恢复默认设置"
            desc="重置所有偏好为出厂值"
          >
            <button
              onClick={() => s.reset()}
              className="rounded-full bg-bg-soft px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-soft/80"
            >
              重置
            </button>
          </Row>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-clay/10 text-clay">
                <Trash2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">
                  清除本地数据
                </p>
                <p className="text-xs text-text-muted">
                  删除所有收藏、配方、设置与播放记录，不可恢复。
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirmClear) clearAllData();
                  else setConfirmClear(true);
                }}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition-colors ${
                  confirmClear
                    ? "bg-clay text-bg-deep"
                    : "bg-bg-soft text-text-secondary hover:bg-bg-soft/80"
                }`}
              >
                {confirmClear ? "确认清除" : "清除"}
              </button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
