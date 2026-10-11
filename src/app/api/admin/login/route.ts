import { NextResponse } from "next/server";
import { checkAdmin } from "../auth";

/** 静态导出需声明（GitHub Pages 无服务端） */
export const dynamic = "force-static";

/**
 * 后台登录校验
 * - 开发环境（未设置 ADMIN_PASSWORD）直接放行
 * - 生产环境校验 x-admin-password 请求头
 */
export async function POST(req: Request) {
  const authErr = checkAdmin(req);
  if (authErr) return authErr;
  return NextResponse.json({ success: true });
}
