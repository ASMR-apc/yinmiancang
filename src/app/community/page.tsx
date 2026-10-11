"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Send, Trash2, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MOCK_GOODNIGHT } from "@/lib/constants";
import { useGoodnightStore } from "@/store/goodnight";
import type { GoodnightMessage } from "@/types";

/**
 * 晚安社区：展示所有留言 + 提交留言表单
 */
export default function GoodnightPage() {
  const userMessages = useGoodnightStore((s) => s.messages);
  const addMessage = useGoodnightStore((s) => s.addMessage);
  const deleteMessage = useGoodnightStore((s) => s.deleteMessage);

  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");

  // 合并：用户留言在前（最新），mock 留言在后
  const allMessages: GoodnightMessage[] = [...userMessages, ...MOCK_GOODNIGHT];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addMessage(content.trim(), nickname.trim());
    setContent("");
    setNickname("");
  };

  return (
    <div className="py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary"
      >
        <ChevronDown className="h-4 w-4 rotate-90" />
        返回首页
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold text-text-primary">
        晚安社区
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        对今夜说点什么，也听听别人的晚安。
      </p>

      {/* 留言表单 */}
      <Card className="mt-5 p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="昵称（可选，默认为匿名）"
            maxLength={12}
            className="w-full rounded-lg bg-bg-soft px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-1 focus:ring-clay"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下今晚想说的话……"
            maxLength={120}
            rows={3}
            className="w-full resize-none rounded-lg bg-bg-soft px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-1 focus:ring-clay"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted">
              {content.length}/120
            </span>
            <button
              type="submit"
              disabled={!content.trim()}
              className="flex items-center gap-1.5 rounded-full bg-clay px-4 py-1.5 text-sm font-medium text-bg-deep transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
              发布
            </button>
          </div>
        </form>
      </Card>

      {/* 留言列表 */}
      <div className="mt-6 space-y-3">
        {allMessages.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 py-10 text-center">
            <MessageCircle className="h-8 w-8 text-text-muted/60" />
            <p className="text-sm text-text-secondary">还没有留言</p>
            <p className="text-xs text-text-muted">成为第一个说晚安的人</p>
          </Card>
        ) : (
          allMessages.map((m) => (
            <Card key={m.id} className="p-4">
              <p className="text-text-primary">“{m.content}”</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">— {m.nickname}</span>
                  {m.status === "pending" && (
                    <span className="rounded-full bg-clay/15 px-2 py-0.5 text-[10px] text-clay">
                      审核中
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-text-muted">
                    {m.createdAt}
                  </span>
                  {m.status === "pending" && (
                    <button
                      onClick={() => deleteMessage(m.id)}
                      className="text-text-muted hover:text-clay"
                      aria-label="删除留言"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
