"use client";

import { motion } from "framer-motion";
import { triggerEngine } from "@/lib/audio/triggerEngine";
import { MOCK_TRIGGERS } from "@/lib/constants";
import { SectionTitle } from "@/components/home/SectionTitle";
import { AnimatedSection } from "./AnimatedSection";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * 触发音效网格：点击即播短音效，可叠加
 * 卡片依次淡入上移（stagger）
 */
export function TriggerGrid() {
  const reduced = useReducedMotion();

  return (
    <section className="mb-8">
      <SectionTitle title="触发音效" subtitle="点一下，听一声" />
      <AnimatedSection delay={0.2}>
        <motion.div
          className="grid grid-cols-3 gap-2 sm:grid-cols-6"
          initial={reduced ? false : "hidden"}
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {MOCK_TRIGGERS.map((t) => (
            <motion.button
              key={t.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.35 }}
              whileHover={reduced ? undefined : { scale: 1.05 }}
              whileTap={reduced ? undefined : { scale: 0.95 }}
              onClick={() => triggerEngine.play(t.audioUrl)}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-bg-soft/60 py-4 transition-colors hover:bg-bg-soft"
              aria-label={`播放 ${t.title}`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-[11px] text-text-secondary">{t.title}</span>
            </motion.button>
          ))}
        </motion.div>
      </AnimatedSection>
    </section>
  );
}
