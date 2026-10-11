-- 音眠舱 Supabase 迁移占位
-- 后续阶段将在此添加表结构：sounds / videos / goodnight_messages 等
-- 执行：supabase db push

create table if not exists goodnight_messages (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  nickname text default '匿名',
  status text default 'pending',
  created_at timestamptz default now()
);
