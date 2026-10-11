import { NextResponse } from "next/server";
import { adminStore } from "@/lib/data/adminStore";
import { checkAdmin } from "../../auth";

/** 静态导出时生成占位路由（GitHub Pages 无服务端，管理端 API 不可用） */
export function generateStaticParams() {
  return [{ id: "static-export" }];
}

/** 更新声音 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authErr = checkAdmin(req);
  if (authErr) return authErr;

  const { id } = await params;
  const body = await req.json();
  const updated = adminStore.updateSound(id, body);
  if (!updated) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }
  return NextResponse.json({ data: updated });
}

/** 删除声音 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authErr = checkAdmin(req);
  if (authErr) return authErr;

  const { id } = await params;
  adminStore.deleteSound(id);
  return NextResponse.json({ success: true });
}
