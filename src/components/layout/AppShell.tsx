import { BackgroundLayer } from "./BackgroundLayer";
import { BottomNav } from "./BottomNav";
import { PlayerBar } from "@/components/player/PlayerBar";
import { PWAProvider } from "@/components/pwa/PWAProvider";

/**
 * 应用外壳：背景层 + 内容容器 + 播放器条 + 底部导航
 * 内容区留出底部导航与播放器条的空间
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <BackgroundLayer />
      <main className="mx-auto w-full max-w-3xl px-4 pb-40 pt-6 sm:px-6">
        {children}
      </main>
      <PlayerBar />
      <BottomNav />
      <PWAProvider />
    </div>
  );
}
