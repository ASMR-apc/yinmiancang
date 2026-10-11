import { NextResponse } from "next/server";

/**
 * 简单后台鉴权：通过 x-admin-password 请求头校验
 * - 若未设置 ADMIN_PASSWORD 环境变量（开发环境），放行
 * - 生产环境必须设置 ADMIN_PASSWORD
 */
export function checkAdmin(req: Request): NextResponse | null {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return null; // 开发模式放行

  const provided = req.headers.get("x-admin-password");
  if (provided !== expected) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  return null;
}
