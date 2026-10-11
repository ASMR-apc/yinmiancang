"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, Play, Pause, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type PatternKey = "478" | "box";

interface Phase {
  label: string;
  duration: number; // 秒
  scale: [number, number]; // 起始/结束缩放
}

/** 呼吸节奏定义 */
const PATTERNS: Record<PatternKey, { name: string; desc: string; phases: Phase[] }> = {
  "478": {
    name: "4-7-8 呼吸法",
    desc: "吸气 4s · 屏息 7s · 呼气 8s，平复焦虑",
    phases: [
      { label: "吸气", duration: 4, scale: [0.7, 1.3] },
      { label: "屏息", duration: 7, scale: [1.3, 1.3] },
      { label: "呼气", duration: 8, scale: [1.3, 0.7] },
    ],
  },
  box: {
    name: "盒式呼吸",
    desc: "吸 4s · 屏 4s · 呼 4s · 屏 4s，稳定心神",
    phases: [
      { label: "吸气", duration: 4, scale: [0.7, 1.3] },
      { label: "屏息", duration: 4, scale: [1.3, 1.3] },
      { label: "呼气", duration: 4, scale: [1.3, 0.7] },
      { label: "屏息", duration: 4, scale: [0.7, 0.7] },
    ],
  },
};

export default function BreathingPage() {
  const reduced = useReducedMotion();
  const [pattern, setPattern] = useState<PatternKey>("478");
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0); // 当前阶段已过秒数
  const [cycles, setCycles] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const phaseIndexRef = useRef(0);
  const cyclesRef = useRef(0);

  const phases = PATTERNS[pattern].phases;
  const currentPhase = phases[phaseIndex];
  const remaining = Math.max(0, currentPhase.duration - elapsed);

  /** 推进阶段 */
  const advancePhase = () => {
    const next = (phaseIndexRef.current + 1) % phases.length;
    phaseIndexRef.current = next;
    setPhaseIndex(next);
    setElapsed(0);
    startTimeRef.current = Date.now();
    // 完成一个完整循环（回到吸气阶段）
    if (next === 0) {
      cyclesRef.current += 1;
      setCycles(cyclesRef.current);
    }
  };

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const e = (Date.now() - startTimeRef.current) / 1000;
      const dur = phases[phaseIndexRef.current].duration;
      if (e >= dur) {
        advancePhase();
      } else {
        setElapsed(e);
      }
    }, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, pattern]);

  /** 切换模式时重置 */
  const switchPattern = (p: PatternKey) => {
    stop();
    setPattern(p);
    resetAll();
  };

  const stop = () => {
    setIsRunning(false);
  };

  const start = () => {
    setIsRunning(true);
  };

  const resetAll = () => {
    phaseIndexRef.current = 0;
    cyclesRef.current = 0;
    setPhaseIndex(0);
    setElapsed(0);
    setCycles(0);
  };

  // 圆环动画：根据当前阶段进度计算缩放
  const progress = Math.min(1, elapsed / currentPhase.duration);
  const [fromScale, toScale] = currentPhase.scale;
  const scale = reduced ? 1 : fromScale + (toScale - fromScale) * progress;

  return (
    <div className="flex min-h-[70vh] flex-col items-center py-6">
      {/* 返回 */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 self-start text-sm text-text-muted hover:text-text-primary"
      >
        <ChevronDown className="h-4 w-4 rotate-90" />
        返回首页
      </Link>

      {/* 模式选择 */}
      <div className="flex gap-2">
        {(Object.keys(PATTERNS) as PatternKey[]).map((key) => (
          <button
            key={key}
            onClick={() => switchPattern(key)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              pattern === key
                ? "bg-clay text-bg-deep"
                : "bg-bg-soft text-text-secondary hover:bg-bg-soft/80"
            }`}
          >
            {PATTERNS[key].name}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-text-muted">{PATTERNS[pattern].desc}</p>

      {/* 呼吸圆环 */}
      <div className="relative mt-10 flex h-72 w-72 items-center justify-center">
        {/* 外圈（光晕） */}
        <motion.div
          className="absolute inset-0 rounded-full border border-sage/20"
          animate={{ scale }}
          transition={{ ease: "linear", duration: 0.1 }}
        />
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-sage/15 to-clay/10"
          animate={{ scale }}
          transition={{ ease: "linear", duration: 0.1 }}
        />
        {/* 内圈实色 */}
        <motion.div
          className="absolute h-40 w-40 rounded-full bg-gradient-to-br from-clay/30 to-sage/20 shadow-lg shadow-sage/10"
          animate={{ scale }}
          transition={{ ease: "linear", duration: 0.1 }}
        />
        {/* 阶段文字 */}
        <div className="relative z-10 text-center">
          <p className="font-display text-2xl font-semibold text-text-primary">
            {currentPhase.label}
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-clay">
            {Math.ceil(remaining)}
          </p>
        </div>
      </div>

      {/* 轮数 */}
      <p className="mt-6 text-sm text-text-muted">
        已完成 <span className="font-semibold text-text-primary">{cycles}</span> 轮
      </p>

      {/* 控制按钮 */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={() => (isRunning ? stop() : start())}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-clay text-bg-deep shadow-lg shadow-clay/30 transition-transform hover:scale-105 active:scale-95"
          aria-label={isRunning ? "暂停" : "开始"}
        >
          {isRunning ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 translate-x-0.5" />
          )}
        </button>
        <button
          onClick={() => {
            stop();
            resetAll();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-soft text-text-muted hover:text-text-primary"
          aria-label="重置"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* 阶段提示 */}
      <Card className="mt-8 w-full max-w-md p-4">
        <p className="text-center text-xs text-text-muted">
          跟随圆环大小呼吸：圆环变大时吸气，变小慢呼气，静止时屏息。
        </p>
      </Card>
    </div>
  );
}
