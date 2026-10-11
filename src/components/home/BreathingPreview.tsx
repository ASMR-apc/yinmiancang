"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wind } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "./SectionTitle";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * 呼吸引导入口：4-7-8 / 盒式呼吸
 * 预览一个缓慢呼吸的圆环
 */
export function BreathingPreview() {
  const reduced = useReducedMotion();

  return (
    <section className="mb-8">
      <SectionTitle title="呼吸引导" subtitle="跟着节奏，慢下来" />
      <Card className="overflow-hidden">
        <div className="flex items-center gap-4 p-5">
          {/* 呼吸圆环 */}
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full border border-clay/40"
              animate={
                reduced
                  ? { scale: 1 }
                  : { scale: [1, 1.18, 1] }
              }
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute inset-2 rounded-full bg-sage/20"
              animate={
                reduced
                  ? { scale: 1 }
                  : { scale: [1, 1.25, 1] }
              }
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
            <Wind className="relative h-6 w-6 text-sage" />
          </div>

          <div className="flex-1">
            <h3 className="font-display font-semibold text-text-primary">
              4-7-8 呼吸法
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              吸气 4 秒 · 屏息 7 秒 · 呼气 8 秒，循环 4 轮。
            </p>
            <div className="mt-3 flex gap-2">
              <Button asChild size="sm">
                <Link href="/breathing">开始呼吸</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/breathing">盒式呼吸</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
