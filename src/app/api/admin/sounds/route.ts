import { NextResponse } from "next/server";
import { adminStore } from "@/lib/data/adminStore";
import { checkAdmin } from "../auth";
import type { Track } from "@/types";

/** 静态导出需声明（GitHub Pages 无服务端） */
export const dynamic = "force-static";

/** 获取所有声音 */
export async function GET() {
  return NextResponse.json({ data: adminStore.getSounds() });
}

/** 新增声音 */
export async function POST(req: Request) {
  const authErr = checkAdmin(req);
  if (authErr) return authErr;

  const body = (await req.json()) as Partial<Track>;
  if (!body.title || !body.audioUrl) {
    return NextResponse.json({ error: "title 和 audioUrl 必填" }, { status: 400 });
  }

  const track: Track = {
    id: `s-${Date.now()}`,
    title: body.title,
    category: body.category ?? "自然",
    tags: body.tags ?? [],
    audioUrl: body.audioUrl,
    duration: body.duration ?? 180,
    coverUrl: body.coverUrl ?? "",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  adminStore.addSound(track);
  return NextResponse.json({ data: track }, { status: 201 });
}
