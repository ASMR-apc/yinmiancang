"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GoodnightMessage } from "@/types";

interface GoodnightState {
  /** 用户提交的留言（持久化） */
  messages: GoodnightMessage[];
  /** 提交留言，本地默认 pending（Phase 8 后台审核后 approved） */
  addMessage: (content: string, nickname: string) => void;
  /** 删除自己的留言 */
  deleteMessage: (id: string) => void;
}

/**
 * 晚安墙 store（持久化到 localStorage）
 * - 用户提交的留言存在这里，与 mock 留言合并展示
 * - 本地无审核后台，留言状态为 pending，展示时带「审核中」标记
 */
export const useGoodnightStore = create<GoodnightState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (content, nickname) =>
        set((s) => ({
          messages: [
            {
              id: `g-${Date.now()}`,
              content,
              nickname: nickname || "匿名",
              status: "pending",
              createdAt: new Date().toLocaleString("zh-CN", {
                hour12: false,
              }),
            },
            ...s.messages,
          ],
        })),
      deleteMessage: (id) =>
        set((s) => ({
          messages: s.messages.filter((m) => m.id !== id),
        })),
    }),
    { name: "ymc-goodnight" },
  ),
);
