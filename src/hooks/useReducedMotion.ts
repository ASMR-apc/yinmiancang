"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settings";

/**
 * 检测「减少动态效果」偏好
 * - 设置页「减弱动效」开启时强制降级（覆盖系统）
 * - 否则跟随系统 prefers-reduced-motion
 */
export function useReducedMotion(): boolean {
  const [systemReduced, setSystemReduced] = useState(false);
  const storeReduced = useSettingsStore((s) => s.reducedMotion);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return storeReduced || systemReduced;
}
