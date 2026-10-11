"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * 背景层：暖深灰褐渐变 + 三团呼吸光晕（陶土粉/鼠尾草绿/奶咖）+ 暖色星点
 * 固定全屏，置于内容之下。所有动效尊重 prefers-reduced-motion。
 */
export function BackgroundLayer() {
  const reduced = useReducedMotion();

  // 星点位置（稳定不重排）
  const dots = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        top: `${(i * 53) % 100}%`,
        size: 1 + ((i * 7) % 3),
        opacity: 0.15 + ((i * 13) % 30) / 100,
      })),
    [],
  );

  const breathe = reduced
    ? { opacity: [0.5, 0.5] }
    : { opacity: [0.45, 0.75, 0.45] };

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* 基底暖深灰褐渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-deep via-bg-mid to-bg-deep" />

      {/* 陶土粉光晕（左上） */}
      <motion.div
        className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--glow-clay), transparent 70%)" }}
        animate={breathe}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 鼠尾草绿光晕（右下） */}
      <motion.div
        className="absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--glow-sage), transparent 70%)" }}
        animate={breathe}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* 奶咖光晕（中部偏右） */}
      <motion.div
        className="absolute left-1/2 top-1/3 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--glow-milk), transparent 70%)" }}
        animate={breathe}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* 暖色星点 */}
      {dots.map((d) => (
        <span
          key={d.id}
          className="warm-dot"
          style={{
            left: d.left,
            top: d.top,
            width: `${d.size}px`,
            height: `${d.size}px`,
            opacity: d.opacity,
          }}
        />
      ))}
    </div>
  );
}
