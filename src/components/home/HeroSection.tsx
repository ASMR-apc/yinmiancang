"use client";

import { motion } from "framer-motion";
import { MOOD_ENTRIES } from "@/lib/constants";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** 基于当前时间计算问候语（客户端计算，支持静态导出） */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "夜深了";
  if (hour < 12) return "早安";
  if (hour < 18) return "下午好";
  return "晚上好";
}

/**
 * 问候语 + 情绪入口
 */
export function HeroSection() {
  const reduced = useReducedMotion();
  const greeting = getGreeting();

  return (
    <section className="mb-8">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sm text-text-muted">{greeting}，今天辛苦了</p>
        <h1 className="font-display text-3xl font-bold leading-tight">
          <span className="text-warm-gradient">让声音陪你</span>
          <span className="text-text-primary">慢慢入睡</span>
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          选一个此刻的心情，音眠舱为你准备好今晚的声音。
        </p>
      </motion.div>

      {/* 情绪入口 */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MOOD_ENTRIES.map((mood, i) => (
          <motion.button
            key={mood.id}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: reduced ? 0 : 0.05 * i }}
            whileHover={reduced ? undefined : { scale: 1.02 }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
            className="glass-card flex flex-col items-start gap-1 rounded-xl p-4 text-left transition-colors hover:border-clay/40"
          >
            <span className="text-2xl" aria-hidden>
              {mood.emoji}
            </span>
            <span className="font-medium text-text-primary">{mood.label}</span>
            <span className="text-xs text-text-muted">{mood.tagline}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
