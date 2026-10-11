"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "./SectionTitle";
import { AnimatedSection } from "./AnimatedSection";
import { MOCK_GOODNIGHT } from "@/lib/constants";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * 晚安社区预览：展示几条匿名晚安
 */
export function GoodnightWallPreview() {
  const reduced = useReducedMotion();

  return (
    <section className="mb-4">
      <SectionTitle
        title="晚安社区"
        subtitle="对今夜说点什么"
        action={
          <Button asChild variant="ghost" size="sm" className="text-clay">
            <Link href="/community">全部</Link>
          </Button>
        }
      />
      <AnimatedSection delay={0.25}>
        <motion.div
          className="space-y-3"
          initial={reduced ? false : "hidden"}
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {MOCK_GOODNIGHT.slice(0, 3).map((m) => (
            <motion.div
              key={m.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4 }}
            >
              <Card className="p-4">
                <p className="text-text-primary">“{m.content}”</p>
                <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                  <span>— {m.nickname}</span>
                  <span>{m.createdAt}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatedSection>
    </section>
  );
}
