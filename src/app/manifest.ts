import type { MetadataRoute } from "next";

/** 静态导出需声明 */
export const dynamic = "force-static";

/**
 * PWA Web App Manifest
 * Next.js App Router 约定文件：app/manifest.ts → 输出 /manifest.webmanifest
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "音眠舱 · 深夜 ASMR 助眠",
    short_name: "音眠舱",
    description:
      "可听、可调、可互动的深夜 ASMR 助眠网站。多轨混音、定时渐弱、呼吸引导、匿名晚安墙，陪你安然入睡。",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#2e2a27",
    theme_color: "#2e2a27",
    categories: ["health", "lifestyle", "music"],
    icons: [
      {
        src: "/icons/icon-512.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
    lang: "zh-CN",
  };
}
