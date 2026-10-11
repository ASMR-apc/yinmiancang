import { NextResponse } from "next/server";
import { adminStore } from "@/lib/data/adminStore";
import { checkAdmin } from "../auth";
import type { VideoItem } from "@/types";

/** 静态导出需声明（GitHub Pages 无服务端） */
export const dynamic = "force-static";

/** 获取所有视频 */
export async function GET() {
  return NextResponse.json({ data: adminStore.getVideos() });
}

/** 新增视频 */
export async function POST(req: Request) {
  const authErr = checkAdmin(req);
  if (authErr) return authErr;

  const body = (await req.json()) as Partial<VideoItem>;
  if (!body.title || !body.videoUrl) {
    return NextResponse.json({ error: "title 和 videoUrl 必填" }, { status: 400 });
  }

  const video: VideoItem = {
    id: `v-${Date.now()}`,
    title: body.title,
    description: body.description ?? "",
    category: body.category ?? "氛围",
    tags: body.tags ?? [],
    videoUrl: body.videoUrl,
    coverUrl: body.coverUrl ?? "from-sage/30 to-clay/20",
    sourceType: body.sourceType ?? "file",
    duration: body.duration ?? 0,
    author: body.author,
    views: body.views ?? 0,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  adminStore.addVideo(video);
  return NextResponse.json({ data: video }, { status: 201 });
}
