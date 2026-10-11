"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

/**
 * PWA 注册与安装引导
 * - 挂载时注册 /sw.js
 * - 监听 beforeinstallprompt，显示安装按钮
 */
export function PWAProvider() {
  const [installEvent, setInstallEvent] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 注册 service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          /* SW 注册失败不影响应用使用 */
        });
      });
    }

    // 捕获安装提示事件
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstallEvent(null);
    }
  };

  if (!installEvent || dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl bg-bg-card p-4 shadow-xl shadow-black/30 ring-1 ring-white/10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay/15 text-clay">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary">安装音眠舱</p>
          <p className="text-[11px] text-text-muted">
            添加到主屏幕，离线也能听
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="rounded-full bg-clay px-4 py-1.5 text-sm font-medium text-bg-deep hover:opacity-90"
        >
          安装
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-text-muted hover:text-text-primary"
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
