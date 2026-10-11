import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出，支持部署到 GitHub Pages
  output: "export",
  // GitHub Pages 部署到子路径时需设置 basePath，与仓库名一致
  basePath: "/yinmiancang",
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
