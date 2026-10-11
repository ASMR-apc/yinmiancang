"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { SectionTitle } from "./SectionTitle";
import { AnimatedSection } from "./AnimatedSection";
import { SCENE_ENTRIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * 场景入口：雨夜 / 暖炉 / 森林 / 海岸
 * 点击跳转到对应视频详情页（动画 + 匹配环境音）
 */
export function SceneEntrance() {
  const reduced = useReducedMotion();
  const router = useRouter();

  return (
    <section className="mb-8">
      <SectionTitle title="场景入口" subtitle="选一个想去的地方" />
      <AnimatedSection delay={0.1}>
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={reduced ? false : "hidden"}
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06 } },
          }}
        >
          {SCENE_ENTRIES.map((scene) => (
            <motion.button
              key={scene.id}
              onClick={() => router.push(scene.route)}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4 }}
              whileHover={reduced ? undefined : { scale: 1.02 }}
              whileTap={reduced ? undefined : { scale: 0.98 }}
              className={cn(
                "group relative flex h-24 items-center justify-between overflow-hidden rounded-xl bg-gradient-to-br p-4 text-left transition-colors hover:border-clay/40",
                scene.gradient,
              )}
            >
              <span className="absolute right-3 top-3 text-2xl opacity-80" aria-hidden>
                {scene.emoji}
              </span>
              <span className="font-display font-medium text-text-primary">
                {scene.label}
              </span>
              <ChevronRight className="h-4 w-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.button>
          ))}
        </motion.div>
      </AnimatedSection>
    </section>
  );
}
