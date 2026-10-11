import { NextResponse } from "next/server";
import { adminStore } from "@/lib/data/adminStore";
import { checkAdmin } from "../auth";

/** 静态导出需声明（GitHub Pages 无服务端） */
export const dynamic = "force-static";

/** 获取所有晚安墙留言（含待审核） */
export async function GET() {
  return NextResponse.json({ data: adminStore.getGoodnight() });
}
