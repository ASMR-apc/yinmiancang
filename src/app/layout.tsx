import type { Metadata, Viewport } from "next";
import { Inter, Quicksand } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

// 英文主字体：Inter；用于正文
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// 英文装饰字体：Quicksand；用于标题 / 数字
const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "音眠舱 · 深夜 ASMR 助眠",
    template: "%s · 音眠舱",
  },
  description:
    "音眠舱是一个可听、可调、可互动的深夜 ASMR 助眠网站。多轨混音、定时渐弱、呼吸引导、匿名晚安墙，陪你安然入睡。",
  keywords: [
    "ASMR",
    "助眠",
    "白噪音",
    "冥想",
    "呼吸引导",
    "晚安",
    "失眠",
    "音眠舱",
  ],
  authors: [{ name: "音眠舱" }],
  applicationName: "音眠舱",
  manifest: "/manifest.webmanifest", // Phase 9 PWA
  appleWebApp: {
    capable: true,
    title: "音眠舱",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#2e2a27",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${quicksand.variable} h-full`}
      style={
        {
          // 中文字体栈：优先思源黑体 / 霞鹜文楷，回退系统中文字体
          "--font-sans-cn":
            '"LXGW WenKai", "霞鹜文楷", "Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
        } as React.CSSProperties
      }
    >
      <body className="min-h-full antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
