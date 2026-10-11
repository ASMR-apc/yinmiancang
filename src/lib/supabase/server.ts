import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 服务端客户端（使用 service_role key）
 * - 仅在服务端/API 路由中使用，拥有完整读写权限
 * - 未配置环境变量时返回 null，API 路由降级到 mock/内存数据
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let serverClient: SupabaseClient | null = null;

if (url && serviceKey) {
  serverClient = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

/** 服务端 Supabase 客户端（未配置时为 null） */
export const supabaseServer = serverClient;

/** 服务端是否已配置 Supabase（含 service_role） */
export function isSupabaseServerConfigured(): boolean {
  return !!serverClient;
}
