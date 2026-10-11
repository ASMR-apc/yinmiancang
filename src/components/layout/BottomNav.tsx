"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Music, Video, User, MessageCircle } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Music,
  Video,
  MessageCircle,
  User,
};

/**
 * 底部导航：移动优先，桌面端居中浮动
 * 当前项高亮（陶土粉）
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="主导航"
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="glass-card mx-auto flex max-w-md items-stretch justify-between rounded-2xl p-1.5 shadow-lg shadow-black/20">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] transition-colors",
                active
                  ? "text-clay bg-clay/10"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
