import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 浏览器端客户端
 * - 仅在配置了环境变量时创建实例，否则返回 null（应用降级到 mock 数据）
 * - 用于客户端查询（如收藏、配方的云端同步，Phase 8 后续接入）
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient: SupabaseClient | null = null;

if (url && anonKey) {
  browserClient = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

/** 浏览器端 Supabase 客户端（未配置时为 null） */
export const supabaseBrowser = browserClient;

/** 是否已配置 Supabase */
export function isSupabaseConfigured(): boolean {
  return !!browserClient;
}
