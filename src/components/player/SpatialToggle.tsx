"use client";

import { Headphones } from "lucide-react";
import { usePlayerStore } from "@/store/player";

/**
 * 8D 空间音效开关
 * - 开启后引擎切换为 Web Audio 模式，声相缓慢环绕
 * - 若音频源跨域不支持 Web Audio，将静默降级（不影响播放）
 */
export function SpatialToggle() {
  const enabled = usePlayerStore((s) => s.spatialEnabled);
  const toggle = usePlayerStore((s) => s.toggleSpatial);

  return (
    <button
      onClick={() => toggle()}
      className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs transition-colors ${
        enabled
          ? "bg-sage/20 text-sage"
          : "text-text-muted hover:text-text-primary"
      }`}
      aria-label="8D 空间音效"
      title="8D 空间音效（需戴耳机）"
    >
      <Headphones className="h-4 w-4" />
      <span>8D</span>
    </button>
  );
}
