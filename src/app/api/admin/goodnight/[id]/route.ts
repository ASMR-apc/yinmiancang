import { NextResponse } from "next/server";
import { adminStore } from "@/lib/data/adminStore";
import { checkAdmin } from "../../auth";
import type { GoodnightMessage } from "@/types";

/** 静态导出时生成占位路由（GitHub Pages 无服务端，管理端 API 不可用） */
export function generateStaticParams() {
  return [{ id: "static-export" }];
}

/** 审核留言（更新 status）或删除 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authErr = checkAdmin(req);
  if (authErr) return authErr;

  const { id } = await params;
  const body = (await req.json()) as { status: GoodnightMessage["status"] };
  const updated = adminStore.updateGoodnightStatus(id, body.status);
  if (!updated) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }
  return NextResponse.json({ data: updated });
}

/** 删除留言 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authErr = checkAdmin(req);
  if (authErr) return authErr;

  const { id } = await params;
  adminStore.deleteGoodnight(id);
  return NextResponse.json({ success: true });
}
